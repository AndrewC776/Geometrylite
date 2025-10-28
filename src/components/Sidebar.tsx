import { 
  Flame, TrendingUp, Trophy, Heart, Gamepad2, Target, 
  Smile, Zap, Swords, Grid3x3, Puzzle, Sparkles,
  Users, Cpu, Dumbbell, Lightbulb, Menu, X
} from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Newest");

  const mainCategories = [
    { name: "Newest", icon: Sparkles },
    { name: "Trending", icon: TrendingUp },
    { name: "Top Popular", icon: Trophy },
  ];

  const favoriteGenres = [
    { name: "Dash Games", icon: Zap },
    { name: "Arcade", icon: Target },
    { name: "Casual", icon: Smile },
    { name: "Action", icon: Swords },
    { name: "Adventure", icon: Gamepad2 },
    { name: "Agility", icon: Zap },
    { name: "Battle", icon: Swords },
    { name: "Clicker", icon: Target },
    { name: "Emulator", icon: Cpu },
    { name: "Puzzle", icon: Puzzle },
    { name: "Beauty & Dressing", icon: Sparkles },
    { name: "Simulation", icon: Cpu },
    { name: "Sports", icon: Dumbbell },
    { name: "Strategy", icon: Lightbulb },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">MENU</span>
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="lg:hidden text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4 space-y-6">
            {/* Main Categories */}
            <div className="space-y-1">
              {mainCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveItem(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      activeItem === item.name
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Favorite Genres */}
            <div>
              <div className="flex items-center gap-2 px-3 mb-3">
                <Heart className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm text-slate-400">Favorite Genres</h3>
              </div>
              <div className="space-y-1">
                {favoriteGenres.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveItem(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeItem === item.name
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
