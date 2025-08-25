import React, { useState, useEffect, useRef } from "react";
import "./RecipeStoryView.scss";

const AUTO_ADVANCE_MS = 4000;

const RecipeStoryView = ({ storySteps = [], onExit }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef();
  const total = storySteps.length;

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (current < total - 1) setCurrent((c) => c + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, total]);

  const goNext = () => setCurrent((c) => (c < total - 1 ? c + 1 : c));
  const goPrev = () => setCurrent((c) => (c > 0 ? c - 1 : c));

  if (!storySteps.length) return null;
  return (
    <div className="story-view">
      <button className="story-exit" onClick={onExit}>
        &times;
      </button>
      <div className="story-progress">
        {storySteps.map((_, i) => (
          <div
            key={i}
            className={`story-bar${i <= current ? " active" : ""}`}
          ></div>
        ))}
      </div>
      <div className="story-slide">
        {storySteps[current].mediaUrl &&
          (storySteps[current].mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
            <video
              src={storySteps[current].mediaUrl}
              controls
              autoPlay
              className="story-media"
            />
          ) : (
            <img
              src={storySteps[current].mediaUrl}
              alt={`Step ${current + 1}`}
              className="story-media"
            />
          ))}
        <div className="story-text">{storySteps[current].text}</div>
      </div>
      <div className="story-nav">
        <button onClick={goPrev} disabled={current === 0}>
          Prev
        </button>
        <button onClick={goNext} disabled={current === total - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RecipeStoryView;
