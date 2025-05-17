import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex">
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = readOnly
          ? starValue <= Math.round(rating)
          : starValue <= (hoverRating || rating);

        return (
          <Star
            key={i}
            className={`h-4 w-4 cursor-${readOnly ? "default" : "pointer"} ${
              isFilled ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
            onClick={() => {
              if (!readOnly && onRatingChange) {
                onRatingChange(starValue);
              }
            }}
            onMouseEnter={() => {
              if (!readOnly) setHoverRating(starValue);
            }}
            onMouseLeave={() => {
              if (!readOnly) setHoverRating(0);
            }}
          />
        );
      })}
    </div>
  );
}
