
import React from "react";
import { motion } from "framer-motion";
import "./AddRecipe.scss";

export default function RecipePreviewCard({ form, cookHours, cookMinutes }) {
    return (
        <motion.div
            className="recipe-preview-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            whileHover={{ scale: 1.025, boxShadow: "0 8px 32px #84cc16cc" }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
            <div className="recipe-preview-card__image">
                {form.imageUrl ? (
                    <img src={form.imageUrl} alt={form.title || "Recipe preview"} />
                ) : (
                    <div className="recipe-preview-card__placeholder">Image Preview</div>
                )}
            </div>
            <div className="recipe-preview-card__content">
                <h3 className="recipe-preview-card__title">{form.title || "Recipe Title"}</h3>
                <div className="recipe-preview-card__desc">{form.description || "Recipe description will appear here."}</div>
                <div className="recipe-preview-card__meta">
                    <span>{form.category || "Category"}</span>
                    <span>{form.diet || "Diet"}</span>
                    <span>
                        {cookHours || 0}h {cookMinutes || 0}m
                    </span>
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
