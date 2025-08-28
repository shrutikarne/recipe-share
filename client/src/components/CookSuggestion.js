import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDice, FaUtensils, FaArrowRight } from 'react-icons/fa';
import './CookSuggestion.scss';

const CookSuggestion = () => {
  const [moodSelection, setMoodSelection] = useState(null);
  const [timeSelection, setTimeSelection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const moods = [
    { id: 'comfort', label: 'Comfort Food', emoji: '🍲' },
    { id: 'healthy', label: 'Healthy', emoji: '🥗' },
    { id: 'quick', label: 'Quick & Easy', emoji: '⚡' },
    { id: 'fancy', label: 'Impressive', emoji: '✨' },
  ];

  const timeOptions = [
    { id: '15', label: '15 min' },
    { id: '30', label: '30 min' },
    { id: '60', label: '1 hour' },
    { id: 'any', label: 'Any time' },
  ];

  const resetSelections = () => {
    setMoodSelection(null);
    setTimeSelection(null);
    setSuggestion(null);
  };

  const getSuggestion = () => {
    if (!moodSelection) return;

    setIsLoading(true);
    // Simulate API call for recipe suggestion
    setTimeout(() => {
      const suggestions = {
        comfort: [
          { name: 'Mac & Cheese', time: '25 min', difficulty: 'Easy' },
          { name: 'Chicken Soup', time: '45 min', difficulty: 'Medium' },
          { name: 'Beef Stew', time: '60 min', difficulty: 'Medium' }
        ],
        healthy: [
          { name: 'Quinoa Bowl', time: '20 min', difficulty: 'Easy' },
          { name: 'Grilled Salmon', time: '25 min', difficulty: 'Medium' },
          { name: 'Buddha Bowl', time: '30 min', difficulty: 'Easy' }
        ],
        quick: [
          { name: 'Avocado Toast', time: '10 min', difficulty: 'Easy' },
          { name: 'Quesadilla', time: '15 min', difficulty: 'Easy' },
          { name: 'Pasta Aglio e Olio', time: '20 min', difficulty: 'Easy' }
        ],
        fancy: [
          { name: 'Beef Wellington', time: '90 min', difficulty: 'Hard' },
          { name: 'Risotto', time: '45 min', difficulty: 'Medium' },
          { name: 'Chocolate Soufflé', time: '40 min', difficulty: 'Hard' }
        ]
      };

      const filteredSuggestions = suggestions[moodSelection];

      if (timeSelection && timeSelection !== 'any') {
        // Simple filtering based on time (this would be more sophisticated with real data)
        const maxTime = parseInt(timeSelection);
        const timeFiltered = filteredSuggestions.filter(s => {
          const recipeTime = parseInt(s.time);
          return !isNaN(recipeTime) && recipeTime <= maxTime;
        });

        if (timeFiltered.length > 0) {
          const randomIndex = Math.floor(Math.random() * timeFiltered.length);
          setSuggestion(timeFiltered[randomIndex]);
        } else {
          // If no recipes match the time criteria, just pick any from the mood
          const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
          setSuggestion(filteredSuggestions[randomIndex]);
        }
      } else {
        // Just pick any recipe matching the mood
        const randomIndex = Math.floor(Math.random() * filteredSuggestions.length);
        setSuggestion(filteredSuggestions[randomIndex]);
      }

      setIsLoading(false);
    }, 1200);
  };

  return (
    <motion.div
      className="cook-suggestion-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="widget-header">
        <FaUtensils />
        <h3>What should I cook today?</h3>
      </div>

      {!suggestion ? (
        <div className="selection-area">
          <div className="mood-selection">
            <p>I'm in the mood for:</p>
            <div className="mood-options">
              {moods.map(mood => (
                <motion.button
                  key={mood.id}
                  className={`mood-button ${moodSelection === mood.id ? 'selected' : ''}`}
                  onClick={() => setMoodSelection(mood.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {moodSelection && (
            <motion.div
              className="time-selection"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <p>Time available:</p>
              <div className="time-options">
                {timeOptions.map(time => (
                  <motion.button
                    key={time.id}
                    className={`time-button ${timeSelection === time.id ? 'selected' : ''}`}
                    onClick={() => setTimeSelection(time.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {moodSelection && (
            <motion.button
              className="suggest-button"
              onClick={getSuggestion}
              disabled={isLoading}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="loading">Thinking...</span>
              ) : (
                <>
                  <FaDice /> Suggest a Recipe
                </>
              )}
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          className="suggestion-result"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h4>How about making:</h4>
          <div className="suggested-recipe">
            <h3>{suggestion.name}</h3>
            <div className="recipe-details">
              <span>⏱ {suggestion.time}</span>
              <span>📊 {suggestion.difficulty}</span>
            </div>
            <div className="action-buttons">
              <button className="view-recipe-btn">
                View Recipe <FaArrowRight />
              </button>
              <button className="try-again-btn" onClick={resetSelections}>
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CookSuggestion;
