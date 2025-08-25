import React, { useState } from "react";
import "./CookingMode.scss";

const CookingMode = ({ steps, stepImages = [], onExit }) => {
  const [current, setCurrent] = useState(0);
  const total = steps.length;
  const goNext = () => setCurrent((c) => (c < total - 1 ? c + 1 : c));
  const goPrev = () => setCurrent((c) => (c > 0 ? c - 1 : c));
  return (
    <div className="cooking-mode">
      <button className="cooking-exit" onClick={onExit}>
        &times;
      </button>
      <div className="cooking-step">
        <div className="cooking-step-num">
          Step {current + 1} of {total}
        </div>
        {stepImages[current] && (
          <img
            src={stepImages[current]}
            alt={`Step ${current + 1}`}
            className="cooking-img"
          />
        )}
        <div className="cooking-text">{steps[current]}</div>
      </div>
      <div className="cooking-nav">
        <button onClick={goPrev} disabled={current === 0}>
          Previous
        </button>
        <button onClick={goNext} disabled={current === total - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default CookingMode;
