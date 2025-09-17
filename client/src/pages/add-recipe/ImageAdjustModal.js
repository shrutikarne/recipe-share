import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon } from "../../components/SvgIcons";

const EDIT_PREVIEW_SIZE = 320;

/**
 * Clamps a numeric value between two bounds.
 * @param {number} value - Value to clamp.
 * @param {number} min - Minimum allowed value.
 * @param {number} max - Maximum allowed value.
 * @returns {number} Clamped value.
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Derives sizing data for the adjustment preview canvas.
 * @param {number} naturalWidth - Native width of the source image.
 * @param {number} naturalHeight - Native height of the source image.
 * @param {number} zoom - Current zoom level.
 * @returns {{displayWidth:number, displayHeight:number, maxOffsetX:number, maxOffsetY:number}|null}
 */
const computeDisplayMetrics = (naturalWidth, naturalHeight, zoom) => {
  if (!naturalWidth || !naturalHeight) {
    return null;
  }

  const minDimension = Math.min(naturalWidth, naturalHeight);
  const baseScale = EDIT_PREVIEW_SIZE / minDimension;
  const displayWidth = naturalWidth * baseScale * zoom;
  const displayHeight = naturalHeight * baseScale * zoom;
  const maxOffsetX = Math.max((displayWidth - EDIT_PREVIEW_SIZE) / 2, 0);
  const maxOffsetY = Math.max((displayHeight - EDIT_PREVIEW_SIZE) / 2, 0);

  return {
    displayWidth,
    displayHeight,
    maxOffsetX,
    maxOffsetY
  };
};

const defaultAdjustments = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0
};

/**
 * Full-screen modal providing Instagram-style image adjustments for uploads.
 * @param {Object} props - React props.
 * @param {boolean} props.isOpen - Indicates if the modal should render.
 * @param {Object|null} props.image - Current image item being edited.
 * @param {Function} props.onClose - Callback when the modal dismisses without saving.
 * @param {Function} props.onSave - Callback when the user applies adjustments.
 * @param {boolean} props.isProcessing - Disables interactions while a save is pending.
 * @returns {JSX.Element|null}
 */
export default function ImageAdjustModal({ isOpen, image, onClose, onSave, isProcessing }) {
  const [localAdjustments, setLocalAdjustments] = useState(defaultAdjustments);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const previewRef = useRef(null);

  const naturalWidth = image?.adjustments?.naturalWidth || 0;
  const naturalHeight = image?.adjustments?.naturalHeight || 0;

  useEffect(() => {
    if (isOpen && image) {
      setLocalAdjustments({
        zoom: image.adjustments?.zoom ?? 1,
        offsetX: image.adjustments?.offsetX ?? 0,
        offsetY: image.adjustments?.offsetY ?? 0
      });
      dragStateRef.current.isDragging = false;
    }
  }, [isOpen, image]);

  const metrics = useMemo(
    () => computeDisplayMetrics(naturalWidth, naturalHeight, localAdjustments.zoom),
    [naturalWidth, naturalHeight, localAdjustments.zoom]
  );

  const offsetXPx = metrics ? metrics.maxOffsetX * localAdjustments.offsetX : 0;
  const offsetYPx = metrics ? metrics.maxOffsetY * localAdjustments.offsetY : 0;

  const handlePointerDown = (event) => {
    if (!metrics || isProcessing) return;
    event.preventDefault();
    const target = previewRef.current;
    if (!target) return;
    target.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: localAdjustments.offsetX,
      offsetY: localAdjustments.offsetY
    };
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.isDragging || !metrics || isProcessing) return;
    event.preventDefault();

    const { startX, startY, offsetX, offsetY } = dragStateRef.current;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    setLocalAdjustments((prev) => {
      let nextOffsetX = prev.offsetX;
      let nextOffsetY = prev.offsetY;

      if (metrics.maxOffsetX > 0) {
        const deltaNormX = deltaX / metrics.maxOffsetX;
        nextOffsetX = clamp(offsetX + deltaNormX, -1, 1);
      } else {
        nextOffsetX = 0;
      }

      if (metrics.maxOffsetY > 0) {
        const deltaNormY = deltaY / metrics.maxOffsetY;
        nextOffsetY = clamp(offsetY + deltaNormY, -1, 1);
      } else {
        nextOffsetY = 0;
      }

      return { ...prev, offsetX: nextOffsetX, offsetY: nextOffsetY };
    });
  };

  const stopDragging = (event) => {
    if (!dragStateRef.current.isDragging) return;
    dragStateRef.current.isDragging = false;
    const target = previewRef.current;
    if (target && target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value) || 1;
    setLocalAdjustments((prev) => {
      const updated = {
        ...prev,
        zoom: nextZoom
      };

      const nextMetrics = computeDisplayMetrics(naturalWidth, naturalHeight, nextZoom);
      if (!nextMetrics || nextMetrics.maxOffsetX === 0) {
        updated.offsetX = 0;
      }
      if (!nextMetrics || nextMetrics.maxOffsetY === 0) {
        updated.offsetY = 0;
      }
      return updated;
    });
  };

  const handleApply = () => {
    if (!image || isProcessing) return;
    onSave({
      zoom: localAdjustments.zoom,
      offsetX: localAdjustments.offsetX,
      offsetY: localAdjustments.offsetY
    });
  };

  const closeModal = () => {
    if (isProcessing) return;
    onClose();
  };

  const renderPreviewContent = () => {
    if (!image) {
      return <div className="image-adjust-modal__placeholder">Select an image to adjust</div>;
    }

    const source = image.originalUrl || image.url;

    if (!metrics) {
      return (
        <div className="image-adjust-modal__placeholder">
          Unable to load image metadata. Please re-upload the image.
        </div>
      );
    }

    return (
      <div
        className="image-adjust-modal__preview-area"
        style={{ width: EDIT_PREVIEW_SIZE, height: EDIT_PREVIEW_SIZE }}
        ref={previewRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
        onPointerCancel={stopDragging}
        role="presentation"
      >
        <img
          src={source}
          alt="Adjust recipe"
          draggable={false}
          style={{
            width: metrics.displayWidth,
            height: metrics.displayHeight,
            transform: `translate(calc(-50% + ${offsetXPx}px), calc(-50% + ${offsetYPx}px))`,
            transformOrigin: "center center"
          }}
        />
        {!dragStateRef.current.isDragging && metrics.maxOffsetX === 0 && metrics.maxOffsetY === 0 && (
          <div className="image-adjust-modal__hint">Zoom in to enable repositioning</div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && image ? (
        <motion.div
          className="image-adjust-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="image-adjust-modal__backdrop"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="image-adjust-modal__content"
            role="dialog"
            aria-modal="true"
            aria-label="Adjust recipe image"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="image-adjust-modal__close"
              onClick={closeModal}
              aria-label="Close image adjustment"
              disabled={isProcessing}
            >
              <CloseIcon />
            </button>

            <div className="image-adjust-modal__body">
              <h3 className="image-adjust-modal__title">Adjust Image</h3>
              {renderPreviewContent()}

              <div className="image-adjust-modal__controls">
                <label htmlFor="image-zoom" className="image-adjust-modal__zoom-label">
                  Zoom
                </label>
                <input
                  id="image-zoom"
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={localAdjustments.zoom}
                  onChange={handleZoomChange}
                  disabled={isProcessing || !metrics}
                />
                <div className="image-adjust-modal__instruction">
                  Drag to reposition. Increase zoom for finer adjustments.
                </div>
              </div>

              <div className="image-adjust-modal__actions">
                <button
                  type="button"
                  className="image-adjust-modal__button image-adjust-modal__button--secondary"
                  onClick={closeModal}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="image-adjust-modal__button image-adjust-modal__button--primary"
                  onClick={handleApply}
                  disabled={isProcessing || !metrics}
                >
                  {isProcessing ? "Saving..." : "Apply"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
