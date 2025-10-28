import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Play } from "lucide-react";

interface GameHeroProps {
  title: string;
  backgroundImage: string;
  thumbnailImage: string;
}

export function GameHero({ title, backgroundImage, thumbnailImage }: GameHeroProps) {
  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden">
      {/* Blurred Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 backdrop-blur-2xl bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-8">
        {/* Game Thumbnail */}
        <div className="mb-6 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
          <ImageWithFallback
            src={thumbnailImage}
            alt={title}
            className="w-64 h-64 object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="text-white text-center mb-6 drop-shadow-lg">
          {title}
        </h1>

        {/* Play Button */}
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl px-12 py-6 rounded-full"
        >
          <Play className="w-5 h-5 mr-2 fill-white" />
          Play
        </Button>
      </div>
    </div>
  );
}
