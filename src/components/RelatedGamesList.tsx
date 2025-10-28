import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Game {
  id: number;
  title: string;
  image: string;
  tags: string[];
}

interface RelatedGamesListProps {
  games: Game[];
  layout?: "vertical" | "horizontal";
}

export function RelatedGamesList({ games, layout = "vertical" }: RelatedGamesListProps) {
  if (layout === "horizontal") {
    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
          {games.map((game) => (
            <Card
              key={game.id}
              className="flex-shrink-0 w-48 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="aspect-video relative overflow-hidden">
                <ImageWithFallback
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h4 className="text-sm mb-2 line-clamp-1">{game.title}</h4>
                <div className="flex gap-1 flex-wrap">
                  {game.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <Card
          key={game.id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex gap-3 p-3">
            <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              <ImageWithFallback
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm mb-2 line-clamp-2">{game.title}</h4>
              <div className="flex gap-1 flex-wrap">
                {game.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
