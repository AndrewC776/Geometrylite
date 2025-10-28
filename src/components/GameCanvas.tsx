import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Maximize2, Volume2, VolumeX, Settings, Share2, Heart } from "lucide-react";
import { useState } from "react";

interface GameCanvasProps {
  image: string;
  onFullscreen?: () => void;
}

export function GameCanvas({ image, onFullscreen }: GameCanvasProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="space-y-3">
      {/* Control Buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game Canvas - 16:9 Aspect Ratio */}
      <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-xl border-4 border-slate-800">
        <ImageWithFallback
          src={image}
          alt="Game canvas"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="lg" className="shadow-2xl">
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}
