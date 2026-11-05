import Link from "next/link";
import { Keyboard, Zap, WifiOff, Trophy, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-sm font-medium mb-6 border border-border">
        <Sparkles className="w-4 h-4" />
        <span>Adaptive Muscle Memory Engine</span>
      </div>

      <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
        Keyboard <span className="text-primary">Hero</span>
      </h1>

      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
        Stop hunting and pecking. Learn blind touch-typing through systematic letter unlocks, 
        adaptive pseudo-words targeting your weak fingers, and real-time offline feedback.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10 text-left">
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <Keyboard className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold text-foreground mb-1">Keybr Progression</h3>
          <p className="text-sm text-muted-foreground">Unlock keys stage by stage starting with home row anchors (F and J).</p>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <Zap className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold text-foreground mb-1">&lt; 8ms Latency</h3>
          <p className="text-sm text-muted-foreground">High-precision input engine with mechanical audio synthesis.</p>
        </div>

        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <WifiOff className="w-6 h-6 text-primary mb-2" />
          <h3 className="font-semibold text-foreground mb-1">Offline-First</h3>
          <p className="text-sm text-muted-foreground">Practice anywhere. All sessions save locally and sync silently when connected.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/learn"
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
        >
          Start Practice
        </Link>
        <Link
          href="/stats"
          className="px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition border border-border"
        >
          View Heatmap
        </Link>
      </div>
    </main>
  );
}

