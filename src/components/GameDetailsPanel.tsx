import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { ThumbsUp, Share2, Flag, Bookmark, Eye, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface GameDetailsPanelProps {
  description: string;
  thumbnailImage?: string;
}

export function GameDetailsPanel({ description, thumbnailImage }: GameDetailsPanelProps) {
  return (
    <Card className="bg-slate-900 text-white border-slate-800">
      <div className="border-b border-slate-800">
        <Tabs defaultValue="about" className="w-full">
          <div className="flex items-center justify-between px-6 pt-4">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="about" className="data-[state=active]:bg-slate-700">
                Geometry Dash Lite
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <ThumbsUp className="w-4 h-4 mr-1" />
                Like
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Eye className="w-4 h-4 mr-1" />
                {Math.floor(Math.random() * 1000)}K
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-800">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="about" className="p-6 pt-4">
            <div className="space-y-4">
              <p className="text-slate-300 text-sm leading-relaxed">
                {description}
              </p>
              
              {thumbnailImage && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={thumbnailImage}
                      alt="Game preview"
                      className="w-64 h-auto rounded"
                    />
                    <div>
                      <h3 className="mb-2">Thundr: Omegle 2.0</h3>
                      <p className="text-sm text-slate-400">
                        Not another crap Omegle clone trying to make a quick buck
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
