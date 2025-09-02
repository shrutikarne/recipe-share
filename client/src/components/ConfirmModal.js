
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmModal.scss';

/**
 * ConfirmModal component for displaying a confirmation dialog modal.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to call when closing the modal.
 * @param {function} props.onConfirm - Function to call when confirming the action.
 * @param {string} props.title - Title of the modal.
 * @param {string} props.message - Message to display in the modal.
 * @param {string} [props.confirmText] - Text for the confirm button.
 * @param {string} [props.cancelText] - Text for the cancel button.
 * @returns {JSX.Element}
 */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <motion.div
                        className="modal-content"
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                        role="alertdialog"
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    >
                        <h2 id="modal-title" className="modal-title">{title}</h2>
                        <p className="modal-message">{message}</p>
                        <div className="modal-actions">
                            <button
                                className="modal-button modal-button--secondary"
                                onClick={onClose}
                                aria-label="Cancel"
                            >
                                {cancelText || 'Cancel'}
                            </button>
                            <button
                                className="modal-button modal-button--primary"
                                onClick={onConfirm}
                                aria-label={confirmText || 'Confirm'}
                            >
                                {confirmText || 'Confirm'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmModal;
