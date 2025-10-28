import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { GameHero } from "./components/GameHero";
import { GameDetailsPanel } from "./components/GameDetailsPanel";
import { GameCarousel } from "./components/GameCarousel";
import { AdPlaceholder } from "./components/AdPlaceholder";
import { RelatedGamesList } from "./components/RelatedGamesList";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Search, Menu } from "lucide-react";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const carouselGames = [
    {
      id: 1,
      title: "Space Wave",
      image: "https://images.unsplash.com/photo-1703785231329-70a4f4d1da4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBnYW1lJTIwY2FzdWFsfGVufDF8fHx8MTc2MTYyNDc2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.2,
    },
    {
      id: 2,
      title: "Defenders",
      image: "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNhZGUlMjBnYW1lJTIwcmV0cm98ZW58MXx8fHwxNzYxNTkxMTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.5,
    },
    {
      id: 3,
      title: "Geometry Jump 2",
      image: "https://images.unsplash.com/photo-1564049489314-60d154ff107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBnYW1pbmd8ZW58MXx8fHwxNzYxNjI0NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
    },
    {
      id: 4,
      title: "Cube Rush 2",
      image: "https://images.unsplash.com/photo-1417716226287-2f8cd2e80274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBnYW1lfGVufDF8fHx8MTc2MTU1NTk2NHww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.1,
    },
    {
      id: 5,
      title: "Shape Rider",
      image: "https://images.unsplash.com/photo-1703023689189-329f9e539319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjE1NzMwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 3.9,
    },
    {
      id: 6,
      title: "Neon Racer",
      image: "https://images.unsplash.com/photo-1703785231329-70a4f4d1da4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBnYW1lJTIwY2FzdWFsfGVufDF8fHx8MTc2MTYyNDc2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.3,
    },
    {
      id: 7,
      title: "World War",
      image: "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNhZGUlMjBnYW1lJTIwcmV0cm98ZW58MXx8fHwxNzYxNTkxMTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.6,
    },
    {
      id: 8,
      title: "R.E.P.U",
      image: "https://images.unsplash.com/photo-1564049489314-60d154ff107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBnYW1pbmd8ZW58MXx8fHwxNzYxNjI0NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.1,
    },
  ];

  const sidebarGames = [
    {
      id: 101,
      title: "Lorem Game Title 1",
      image: "https://images.unsplash.com/photo-1703785231329-70a4f4d1da4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBnYW1lJTIwY2FzdWFsfGVufDF8fHx8MTc2MTYyNDc2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Puzzle", "Casual"],
    },
    {
      id: 102,
      title: "Lorem Game Title 2",
      image: "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNhZGUlMjBnYW1lJTIwcmV0cm98ZW58MXx8fHwxNzYxNTkxMTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Arcade", "Casual"],
    },
    {
      id: 103,
      title: "Lorem Game Title 3",
      image: "https://images.unsplash.com/photo-1564049489314-60d154ff107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBnYW1pbmd8ZW58MXx8fHwxNzYxNjI0NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Puzzle", "Arcade"],
    },
    {
      id: 104,
      title: "Lorem Game Title 4",
      image: "https://images.unsplash.com/photo-1417716226287-2f8cd2e80274?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBnYW1lfGVufDF8fHx8MTc2MTU1NTk2NHww&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Sports", "Casual"],
    },
    {
      id: 105,
      title: "Lorem Game Title 5",
      image: "https://images.unsplash.com/photo-1703023689189-329f9e539319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjE1NzMwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Arcade", "Puzzle"],
    },
    {
      id: 106,
      title: "Lorem Game Title 6",
      image: "https://images.unsplash.com/photo-1703785231329-70a4f4d1da4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBnYW1lJTIwY2FzdWFsfGVufDF8fHx8MTc2MTYyNDc2NXww&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Casual", "Puzzle"],
    },
    {
      id: 107,
      title: "Lorem Game Title 7",
      image: "https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNhZGUlMjBnYW1lJTIwcmV0cm98ZW58MXx8fHwxNzYxNTkxMTczfDA&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Arcade", "Sports"],
    },
    {
      id: 108,
      title: "Lorem Game Title 8",
      image: "https://images.unsplash.com/photo-1564049489314-60d154ff107d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBnYW1pbmd8ZW58MXx8fHwxNzYxNjI0NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      tags: ["Casual", "Puzzle"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Center Content */}
        <div className="flex-1 min-w-0">
          {/* Top Navigation Bar */}
          <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
            <div className="flex items-center gap-4 px-4 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-white hover:bg-slate-800"
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"></div>
                <span className="text-white hidden sm:inline">geometry-life.io</span>
              </div>

              <div className="flex-1 max-w-xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search games..."
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4 text-sm text-slate-300">
                <a href="#" className="hover:text-white transition-colors">Geometry Subways</a>
                <a href="#" className="hover:text-white transition-colors">Swim Turf Series</a>
                <a href="#" className="hover:text-white transition-colors">Drive Games</a>
              </div>

              <Button
                size="sm"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 hover:from-yellow-500 hover:to-orange-600"
              >
                Submit Game
              </Button>
            </div>
          </header>

          {/* Game Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Game Hero Section */}
            <GameHero
              title="Geometry Dash Lite"
              backgroundImage="https://images.unsplash.com/photo-1623307019152-1ee797183f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyeSUyMGdhbWUlMjBuZW9ufGVufDF8fHx8MTc2MTYyNjU2NHww&ixlib=rb-4.1.0&q=80&w=1080"
              thumbnailImage="https://images.unsplash.com/photo-1623307019152-1ee797183f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyeSUyMGdhbWUlMjBuZW9ufGVufDF8fHx8MTc2MTYyNjU2NHww&ixlib=rb-4.1.0&q=80&w=1080"
            />

            {/* Game Details Panel */}
            <GameDetailsPanel
              description="Geometry Lite is a completely independent website, not affiliated with any organization."
            />

            {/* Related Games Carousel */}
            <div className="space-y-4">
              <h2 className="text-white">Related Games</h2>
              <GameCarousel games={carouselGames} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ad & Game Recommendations */}
        <aside className="hidden xl:block w-80 bg-slate-900 border-l border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Ad Placement */}
            <div className="flex justify-center">
              <AdPlaceholder width={300} height={250} label="300 × 250 - Medium Rectangle" />
            </div>

            {/* Game Recommendations */}
            <div>
              <h3 className="text-white mb-4">Recommended Games</h3>
              <RelatedGamesList games={sidebarGames} layout="vertical" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
