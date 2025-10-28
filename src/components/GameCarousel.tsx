import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface Game {
  id: number;
  title: string;
  image: string;
  rating?: number;
}

interface GameCarouselProps {
  games: Game[];
}

export function GameCarousel({ games }: GameCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 5;

  const handlePrev = () => {
    setStartIndex(Math.max(0, startIndex - 1));
  };

  const handleNext = () => {
    setStartIndex(Math.min(games.length - itemsToShow, startIndex + 1));
  };

  const visibleGames = games.slice(startIndex, startIndex + itemsToShow);

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={startIndex === 0}
          className="flex-shrink-0 bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-4 overflow-hidden flex-1">
          {visibleGames.map((game) => (
            <Card
              key={game.id}
              className="flex-shrink-0 w-48 bg-slate-800 border-slate-700 overflow-hidden hover:border-orange-500 transition-colors cursor-pointer group"
            >
              <div className="relative aspect-square">
                <ImageWithFallback
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <div className="text-sm text-white mb-1 line-clamp-1">{game.title}</div>
                {game.rating && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{game.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={startIndex >= games.length - itemsToShow}
          className="flex-shrink-0 bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
