import Link from "next/link";
import { Keyboard, Zap, WifiOff, Trophy, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 3xl:p-16 text-center max-w-4xl 3xl:max-w-6xl 2k:max-w-7xl mx-auto my-auto">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 3xl:px-4 3xl:py-2 rounded-full bg-secondary text-primary text-sm 3xl:text-base font-medium mb-6 border border-border">
        <Sparkles className="w-4 h-4 3xl:w-5 3xl:h-5" />
        <span>Adaptive Muscle Memory Engine</span>
      </div>

      <h1 className="text-5xl sm:text-6xl 3xl:text-7xl 2k:text-8xl font-extrabold tracking-tight mb-4">
        Keyboard <span className="text-primary">Hero</span>
      </h1>

      <p className="text-lg sm:text-xl 3xl:text-2xl text-muted-foreground max-w-2xl 3xl:max-w-4xl mb-8 3xl:mb-12 leading-relaxed">
        Stop hunting and pecking. Learn blind touch-typing through systematic letter unlocks, 
        adaptive pseudo-words targeting your weak fingers, and real-time offline feedback.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 3xl:gap-6 w-full max-w-3xl 3xl:max-w-5xl mb-10 3xl:mb-14 text-left">
        <div className="p-4 3xl:p-6 rounded-xl 3xl:rounded-2xl bg-secondary/50 border border-border">
          <Keyboard className="w-6 h-6 3xl:w-8 3xl:h-8 text-primary mb-2" />
          <h3 className="font-semibold 3xl:text-lg text-foreground mb-1">Keybr Progression</h3>
          <p className="text-sm 3xl:text-base text-muted-foreground">Unlock keys stage by stage starting with home row anchors (F and J).</p>
        </div>

        <div className="p-4 3xl:p-6 rounded-xl 3xl:rounded-2xl bg-secondary/50 border border-border">
          <Zap className="w-6 h-6 3xl:w-8 3xl:h-8 text-primary mb-2" />
          <h3 className="font-semibold 3xl:text-lg text-foreground mb-1">&lt; 8ms Latency</h3>
          <p className="text-sm 3xl:text-base text-muted-foreground">High-precision input engine with mechanical audio synthesis.</p>
        </div>

        <div className="p-4 3xl:p-6 rounded-xl 3xl:rounded-2xl bg-secondary/50 border border-border">
          <WifiOff className="w-6 h-6 3xl:w-8 3xl:h-8 text-primary mb-2" />
          <h3 className="font-semibold 3xl:text-lg text-foreground mb-1">Offline-First</h3>
          <p className="text-sm 3xl:text-base text-muted-foreground">Practice anywhere. All sessions save locally and sync silently when connected.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 3xl:gap-6">
        <Link
          href="/learn"
          className="px-6 py-3 3xl:px-8 3xl:py-4 3xl:text-lg rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          Start Practice
        </Link>
        <Link
          href="/stats"
          className="px-6 py-3 3xl:px-8 3xl:py-4 3xl:text-lg rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition border border-border"
        >
          View Heatmap
        </Link>
      </div>
    </main>
  );
}

