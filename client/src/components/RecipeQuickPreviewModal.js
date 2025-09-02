import React from "react";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./RecipeQuickPreviewModal.scss";

/**
 * Modal component for quickly previewing a recipe with images, nutrition, fun facts, and story.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onRequestClose - Function to call when closing the modal.
 * @param {Object} props.recipe - The recipe object to preview.
 * @param {string} [props.recipe.title] - Title of the recipe.
 * @param {string[]} [props.recipe.imageUrls] - Array of image URLs for the recipe gallery.
 * @param {string} [props.recipe.imageUrl] - Main image URL for the recipe.
 * @param {string[]} [props.recipe.tags] - Tags associated with the recipe.
 * @param {string} [props.recipe.description] - Description of the recipe.
 * @param {Object} [props.recipe.nutrition] - Nutrition information.
 * @param {number|string} [props.recipe.nutrition.calories] - Calories in the recipe.
 * @param {number|string} [props.recipe.nutrition.protein] - Protein content in grams.
 * @param {number|string} [props.recipe.nutrition.carbs] - Carbohydrates in grams.
 * @param {number|string} [props.recipe.nutrition.fat] - Fat in grams.
 * @param {string[]} [props.recipe.funFacts] - Fun facts about the recipe.
 * @param {Array<{mediaUrl?: string, text: string}>} [props.recipe.story] - Story steps for the recipe.
 * @param {function} props.onViewFullRecipe - Function to call when the user wants to view the full recipe.
 * @returns {JSX.Element}
 */
const RecipeQuickPreviewModal = ({
  isOpen,
  onRequestClose,
  recipe,
  onViewFullRecipe,
}) => {
  const modalRef = React.useRef();
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onRequestClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onRequestClose={onRequestClose}
          className="recipe-preview-modal"
          overlayClassName="recipe-preview-overlay"
          contentLabel="Recipe Quick Preview"
          shouldCloseOnOverlayClick={true}
          ariaHideApp={false}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-preview-title"
          aria-describedby="quick-preview-desc"
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            style={{ outline: "none" }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <button
              className="close-btn"
              onClick={onRequestClose}
              aria-label="Close quick preview"
            >
              &times;
            </button>
            <div className="modal-content">
              <div className="modal-gallery">
                {recipe.imageUrls && recipe.imageUrls.length > 0 ? (
                  <Swiper spaceBetween={10} slidesPerView={1}>
                    {recipe.imageUrls.map((url, idx) => (
                      <SwiperSlide key={idx}>
                        <img
                          src={url}
                          alt={
                            recipe.title
                              ? `${recipe.title} image ${idx + 1}`
                              : `Recipe image ${idx + 1}`
                          }
                          className="modal-img"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <img
                    src={recipe.imageUrl}
                    alt={
                      recipe.title ? `${recipe.title} main image` : "Recipe image"
                    }
                    className="modal-img"
                  />
                )}
              </div>
              <div className="modal-info">
                <h2 id="quick-preview-title">{recipe.title}</h2>
                <div className="modal-tags">
                  {recipe.tags &&
                    recipe.tags.map((tag, i) => (
                      <span className="modal-tag" key={i}>
                        {tag}
                      </span>
                    ))}
                </div>
                {recipe.description && recipe.description.trim() && (
                  <p id="quick-preview-desc">{recipe.description}</p>
                )}
                {/* Nutrition Info */}
                {recipe.nutrition &&
                  (recipe.nutrition.calories ||
                    recipe.nutrition.protein ||
                    recipe.nutrition.carbs ||
                    recipe.nutrition.fat) && (
                    <div className="modal-nutrition">
                      <h4>Nutrition</h4>
                      <ul>
                        {recipe.nutrition.calories && (
                          <li>
                            Calories: <b>{recipe.nutrition.calories}</b>
                          </li>
                        )}
                        {recipe.nutrition.protein && (
                          <li>
                            Protein: <b>{recipe.nutrition.protein}g</b>
                          </li>
                        )}
                        {recipe.nutrition.carbs && (
                          <li>
                            Carbs: <b>{recipe.nutrition.carbs}g</b>
                          </li>
                        )}
                        {recipe.nutrition.fat && (
                          <li>
                            Fat: <b>{recipe.nutrition.fat}g</b>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                {/* Fun Facts */}
                {recipe.funFacts && recipe.funFacts.length > 0 && (
                  <div className="modal-funfacts">
                    <h4>Fun Facts</h4>
                    <ul>
                      {recipe.funFacts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Story View */}
                {recipe.story && recipe.story.length > 0 && (
                  <div className="modal-story">
                    <h4>Story</h4>
                    {recipe.story.map((step, i) => (
                      <div className="story-step" key={i}>
                        {step.mediaUrl && (
                          <div className="story-media">
                            <img src={step.mediaUrl} alt={`Story step ${i + 1}`} />
                          </div>
                        )}
                        <div className="story-text">{step.text}</div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="view-full-btn" onClick={onViewFullRecipe}>
                  View Full Recipe
                </button>
              </div>
            </div>
          </motion.div>
        </Modal>

      )}
    </AnimatePresence>
  );
};

export default RecipeQuickPreviewModal;
