import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingAdProps {
  width: number;
  height: number;
}

export function FloatingAd({ width, height }: FloatingAdProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if ad was dismissed in the last 24 hours
    const dismissedTime = localStorage.getItem('floatingAdDismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setIsDismissed(true);
        return;
      }
    }

    // Show ad after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('floatingAdDismissed', Date.now().toString());
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-4">
          <div
            className="bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center"
            style={{ width: `${width}px`, height: `${height}px`, maxWidth: 'calc(100vw - 80px)' }}
          >
            <div className="text-center text-slate-500 text-sm">
              <div>Ad Placeholder</div>
              <div className="text-xs">{width} × {height}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
