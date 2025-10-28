import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, maxRating = 5, showValue = true, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const filled = index < Math.floor(rating);
        const partial = index < rating && index >= Math.floor(rating);
        
        return (
          <Star
            key={index}
            className={`${sizeClasses[size]} ${
              filled ? "fill-yellow-400 text-yellow-400" : 
              partial ? "fill-yellow-200 text-yellow-400" :
              "text-slate-300"
            }`}
          />
        );
      })}
      {showValue && (
        <span className="ml-2 text-slate-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
