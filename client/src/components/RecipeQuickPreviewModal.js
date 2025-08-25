import React from "react";
import Modal from "react-modal";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./RecipeQuickPreviewModal.scss";

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
  if (!recipe) return null;
  // Keyboard close handler
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onRequestClose();
  };
  return (
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
      <div
        ref={modalRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{ outline: "none" }}
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
            {/* Step-by-step Story View */}
            {recipe.storySteps && recipe.storySteps.length > 0 && (
              <div className="modal-story">
                <h4>Recipe Story</h4>
                <Swiper spaceBetween={10} slidesPerView={1}>
                  {recipe.storySteps.map((step, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="story-step">
                        {step.mediaUrl &&
                          (step.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video
                              src={step.mediaUrl}
                              controls
                              className="story-media"
                              aria-label={`Step ${idx + 1} video`}
                            />
                          ) : (
                            <img
                              src={step.mediaUrl}
                              alt={step.text ? step.text : `Step ${idx + 1}`}
                              className="story-media"
                            />
                          ))}
                        <div className="story-text">{step.text}</div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients &&
                recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
            <button
              className="view-full-btn"
              onClick={() => onViewFullRecipe(recipe)}
              aria-label="View full recipe details"
            >
              View Full Recipe
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RecipeQuickPreviewModal;
