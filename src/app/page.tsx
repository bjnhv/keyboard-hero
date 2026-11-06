import Link from "next/link";
import { Keyboard, Zap, WifiOff, Trophy, Sparkles, Gamepad2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden flex flex-col items-center justify-center px-4 sm:px-8 py-4 sm:py-6 text-center max-w-4xl 3xl:max-w-5xl mx-auto my-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-secondary text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4 border border-border">
        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Adaptive Muscle Memory Engine</span>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-2 sm:mb-3">
        Keyboard <span className="text-primary">Hero</span>
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl 3xl:max-w-3xl mb-5 sm:mb-7 leading-relaxed">
        Stop hunting and pecking. Learn blind touch-typing through systematic letter unlocks, 
        adaptive pseudo-words targeting your weak fingers, and real-time offline feedback.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl 3xl:max-w-4xl mb-6 sm:mb-8 text-left">
        <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/50 border border-border">
          <Keyboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5" />
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">Keybr Progression</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Unlock keys stage by stage starting with home row anchors (F and J).</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/50 border border-border">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5" />
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">&lt; 8ms Latency</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">High-precision input engine with mechanical audio synthesis.</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-secondary/50 border border-border">
          <WifiOff className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5" />
          <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1">Offline-First</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Practice anywhere. All sessions save locally and sync silently when connected.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <Link
          href="/learn"
          className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          Start Practice
        </Link>
        <Link
          href="/stats"
          className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition border border-border"
        >
          View Heatmap
        </Link>
        <Link
          href="/arcade"
          className="px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-xl bg-gradient-to-r from-rose-600 via-primary to-amber-600 text-white font-bold hover:opacity-90 transition shadow-lg shadow-rose-900/30 flex items-center gap-2"
        >
          <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Arcade Mode</span>
        </Link>
      </div>
    </main>
  );
}

