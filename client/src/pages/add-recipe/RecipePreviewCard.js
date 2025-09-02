
import React from "react";
import { motion } from "framer-motion";
import "./AddRecipe.scss";

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
        if (!cookHours && !cookMinutes) return "Cook time not specified";
        
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
                        alt={form.title || "Recipe preview"} 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    />
                ) : (
                    <div className="recipe-preview-card__placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 16L8.586 11.414C8.96106 11.0389 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0389 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0389 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0389 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Image Preview</span>
                    </div>
                )}
            </div>
            <div className="recipe-preview-card__content">
                <h3 className="recipe-preview-card__title">{form.title || "Recipe Title"}</h3>
                <div className="recipe-preview-card__desc">{form.description || "Recipe description will appear here."}</div>
                
                <div className="recipe-preview-card__meta">
                    {form.category && <span>{form.category}</span>}
                    {form.diet && <span>{form.diet}</span>}
                    {(cookHours || cookMinutes) && <span>{formatCookTime()}</span>}
                </div>
                
                <div className="recipe-preview-card__section">
                    <strong>Ingredients:</strong>
                    <ul>
                        {(form.ingredients && form.ingredients.length > 0 && form.ingredients[0])
                            ? form.ingredients.map((ing, i) => ing.trim() && <li key={i}>{ing}</li>)
                            : <li>Ingredients will appear here.</li>}
                    </ul>
                </div>
                
                <div className="recipe-preview-card__section">
                    <strong>Steps:</strong>
                    <ol>
                        {(form.steps && form.steps.length > 0 && form.steps[0])
                            ? form.steps.map((step, i) => step.trim() && <li key={i}>{step}</li>)
                            : <li>Steps will appear here.</li>}
                    </ol>
                </div>
            </div>
        </motion.div>
    );
}
