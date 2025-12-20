import { useState } from 'react';
import './StarRating.css';

const StarRating = ({ value = 0, onChange, disabled = false }) => {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (starValue) => {
    if (!disabled && onChange) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!disabled) {
      setHoveredStar(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredStar(0);
    }
  };

  const displayValue = hoveredStar || value;

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayValue ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
        >
          ⭐
        </span>
      ))}
      {value > 0 && <span className="star-value">{value}/10</span>}
    </div>
  );
};

export default StarRating;

