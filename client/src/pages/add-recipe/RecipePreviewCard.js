
import React from "react";
import { motion } from "framer-motion";
import "./AddRecipe.scss";
import { TEXT } from "../../localization/text";
import { RecipeImagePlaceholderIcon } from "../../components/SvgIcons";

/**
 * RecipePreviewCard component for displaying a preview of the recipe being created.
 *
 * @param {Object} props
 * @param {Object} props.form - The form state containing recipe fields.
 * @param {string|number} [props.cookHours] - Number of cook hours.
 * @param {string|number} [props.cookMinutes] - Number of cook minutes.
 * @returns {JSX.Element}
 */
export default function RecipePreviewCard({ form, cookHours, cookMinutes }) {
    // No need for decoding in the preview component now
    // We're showing the text exactly as entered by the user
    
    // Format cook time nicely
    const formatCookTime = () => {
        if (!cookHours && !cookMinutes) return TEXT.recipePreview.cookTimeNotSpecified;
        const hours = parseInt(cookHours) || 0;
        const minutes = parseInt(cookMinutes) || 0;
        if (hours > 0 && minutes > 0) {
            return `${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else {
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
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
                {form.imagePreview || form.imageUrl ? (
                    <motion.img 
                        src={form.imagePreview || form.imageUrl} 
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
            </div>
            <div className="recipe-preview-card__content">
                <h3 className="recipe-preview-card__title">{form.title || TEXT.recipePreview.title}</h3>
                <div className="recipe-preview-card__desc">{form.description || TEXT.recipePreview.description}</div>
                
                <div className="recipe-preview-card__meta">
                    {form.category && <span>{form.category}</span>}
                    {form.diet && <span>{form.diet}</span>}
                    {(cookHours || cookMinutes) && <span>{formatCookTime()}</span>}
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
