
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./AddRecipe.scss";
import { TEXT } from "../../localization/text";
import { RecipeImagePlaceholderIcon } from "../../components/SvgIcons";
import { ReactComponent as ChevronLeftIcon } from "../../assets/icons/chevron_left.svg";
import { ReactComponent as ChevronRightIcon } from "../../assets/icons/chevron_right.svg";

/**
 * RecipePreviewCard component for displaying a preview of the recipe being created.
 *
 * @param {Object} props
 * @param {Object} props.form - The form state containing recipe fields.
 * @param {string|number} [props.cookHours] - Number of cook hours.
 * @param {string|number} [props.cookMinutes] - Number of cook minutes.
 * @param {string|number} [props.prepHours] - Number of prep hours.
 * @param {string|number} [props.prepMinutes] - Number of prep minutes.
 * @returns {JSX.Element}
 */
export default function RecipePreviewCard({ form, cookHours, cookMinutes, prepHours, prepMinutes, images = [] }) {

    const parseTimeValue = (value) => {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const formatDuration = (hours, minutes) => {
        const safeHours = Math.max(0, hours);
        const safeMinutes = Math.max(0, minutes);
        if (safeHours === 0 && safeMinutes === 0) {
            return TEXT.recipePreview.cookTimeNotSpecified;
        }

        const parts = [];
        if (safeHours > 0) {
            parts.push(`${safeHours} hour${safeHours > 1 ? 's' : ''}`);
        }
        if (safeMinutes > 0) {
            parts.push(`${safeMinutes} minute${safeMinutes > 1 ? 's' : ''}`);
        }

        return parts.length > 0 ? parts.join(' ') : '0 minutes';
    };

    const prepHoursValue = parseTimeValue(prepHours);
    const prepMinutesValue = parseTimeValue(prepMinutes);
    const cookHoursValue = parseTimeValue(cookHours);
    const cookMinutesValue = parseTimeValue(cookMinutes);

    const hasPrepTime = prepHoursValue > 0 || prepMinutesValue > 0;
    const hasCookTime = cookHoursValue > 0 || cookMinutesValue > 0;
    const totalMinutes = (prepHoursValue * 60 + prepMinutesValue) + (cookHoursValue * 60 + cookMinutesValue);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    const normalizedImages = useMemo(() => {
        if (!Array.isArray(images)) return [];
        return images
            .map((image) => {
                if (!image) return null;
                if (typeof image === 'string') {
                    return { url: image };
                }
                if (typeof image.url === 'string' && image.url.trim()) {
                    return { url: image.url, alt: image.alt, type: image.type };
                }
                return null;
            })
            .filter(Boolean);
    }, [images]);

    const fallbackImage = useMemo(() => {
        if (typeof form.imageUrl === 'string' && form.imageUrl.trim()) {
            return form.imageUrl;
        }
        if (Array.isArray(form.imageUrls)) {
            const candidate = form.imageUrls.find((url) => typeof url === 'string' && url.trim());
            if (candidate) return candidate;
        }
        if (typeof form.imagePreview === 'string' && form.imagePreview.trim()) {
            return form.imagePreview;
        }
        if (Array.isArray(form.imagePreviews)) {
            const candidate = form.imagePreviews.find((url) => typeof url === 'string' && url.trim());
            if (candidate) return candidate;
        }
        return null;
    }, [form]);

    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        setActiveImageIndex(0);
    }, [normalizedImages.length]);

    const currentImage = normalizedImages.length > 0
        ? normalizedImages[Math.min(activeImageIndex, normalizedImages.length - 1)]
        : null;

    const previewImage = currentImage?.url || fallbackImage;

    const goToPreviousImage = () => {
        setActiveImageIndex((prev) => {
            if (!normalizedImages.length) return 0;
            return prev === 0 ? normalizedImages.length - 1 : prev - 1;
        });
    };

    const goToNextImage = () => {
        setActiveImageIndex((prev) => {
            if (!normalizedImages.length) return 0;
            return (prev + 1) % normalizedImages.length;
        });
    };

    return (
        <motion.div
            className="recipe-preview-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="recipe-preview-card__image">
                {previewImage ? (
                    <motion.img
                        key={previewImage}
                        src={previewImage}
                        alt={form.title || TEXT.recipePreview.imageAlt}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    />
                ) : (
                    <div className="recipe-preview-card__placeholder">
                        <RecipeImagePlaceholderIcon />
                        <span>{TEXT.recipePreview.imagePreview}</span>
                    </div>
                )}

                {normalizedImages.length > 1 && previewImage && (
                    <>
                        <div className="recipe-preview-card__image-nav">
                            <button type="button" onClick={goToPreviousImage} aria-label="Previous image">
                                <ChevronLeftIcon aria-hidden="true" />
                            </button>
                            <button type="button" onClick={goToNextImage} aria-label="Next image">
                                <ChevronRightIcon aria-hidden="true" />
                            </button>
                        </div>
                        <div className="recipe-preview-card__image-indicators" aria-hidden="true">
                            {normalizedImages.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={idx === activeImageIndex ? 'active' : ''}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div className="recipe-preview-card__content">
                <h3 className="recipe-preview-card__title">{form.title || TEXT.recipePreview.title}</h3>
                <div className="recipe-preview-card__desc">{form.description || TEXT.recipePreview.description}</div>
                
                <div className="recipe-preview-card__meta">
                    {form.category && <span>{form.category}</span>}
                    {form.diet && <span>{form.diet}</span>}
                    {hasPrepTime && <span>Prep: {formatDuration(prepHoursValue, prepMinutesValue)}</span>}
                    {hasCookTime && <span>Cook: {formatDuration(cookHoursValue, cookMinutesValue)}</span>}
                    {totalMinutes > 0 && <span>Total: {formatDuration(totalHours, totalRemainingMinutes)}</span>}
                    {!hasPrepTime && !hasCookTime && <span>{TEXT.recipePreview.cookTimeNotSpecified}</span>}
                </div>
                
                <div className="recipe-preview-card__section">
                    <strong>{TEXT.recipePreview.ingredientsLabel}</strong>
                    <ul>
                        {(form.ingredients && form.ingredients.length > 0 && form.ingredients[0])
                            ? form.ingredients.map((ing, i) => ing.trim() && <li key={i}>{ing}</li>)
                            : <li>{TEXT.recipePreview.ingredientsPlaceholder}</li>}
                    </ul>
                </div>
                
                <div className="recipe-preview-card__section">
                    <strong>{TEXT.recipePreview.stepsLabel}</strong>
                    <ol>
                        {(form.steps && form.steps.length > 0 && form.steps[0])
                            ? form.steps.map((step, i) => step.trim() && <li key={i}>{step}</li>)
                            : <li>{TEXT.recipePreview.stepsPlaceholder}</li>}
                    </ol>
                </div>
            </div>
        </motion.div>
    );
}
