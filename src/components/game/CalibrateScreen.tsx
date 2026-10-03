import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { computeOffset } from "@/game/rhythm";
import { useGame } from "@/store/game-store";

export function CalibrateScreen() {
  const go = useGame((s) => s.go);
  const patchSave = useGame((s) => s.patchSave);
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const [count, setCount] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const cal = useRef<{ start: number; beats: number; len: number; deltas: number[] } | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const c = cal.current;
      if (c && audio.ctx) {
        const now = audio.now();
        const beatPos = (now - c.start) / c.len;
        const frac = beatPos - Math.floor(beatPos);
        setPulse(beatPos >= 0 && beatPos < c.beats ? Math.exp(-frac * 6) : 0);
        if (phase === "run" && now > c.start + c.beats * c.len + 0.45) {
          const off = computeOffset(c.deltas);
          setResult(off);
          setPhase("done");
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  async function start() {
    await audio.unlock();
    const bpm = 100;
    const beats = 12;
    const len = 60 / bpm;
    const startAt = audio.now() + 1.1;
    for (let i = 0; i < beats; i++) audio.tick(startAt + i * len, i % 4 === 0);
    cal.current = { start: startAt, beats, len, deltas: [] };
    setCount(0);
    setResult(null);
    setPhase("run");
  }

  function tap(stamp: number) {
    const c = cal.current;
    if (!c || !audio.ctx) return;
    if (phase === "done") {
      if (result !== null) patchSave((s) => ({ ...s, offsetMs: result }));
      go("title");
      return;
    }
    if (phase !== "run") return;
    audio.drum(0, audio.now());
    const t = audio.eventTimeToAudio(stamp);
    const n = Math.round((t - c.start) / c.len);
    if (n >= 2 && n < c.beats) {
      c.deltas.push((t - (c.start + n * c.len)) * 1000);
      setCount(c.deltas.length);
    }
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center bg-bg px-5 text-fg pt-[max(2rem,env(safe-area-inset-top))]"
      onPointerDown={(e) => {
        if (phase === "idle") return;
        e.preventDefault();
        tap(e.timeStamp);
      }}
    >
      <h1 className="font-display text-3xl tracking-wide">Calibrate</h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted">
        Tap exactly on each click. Ignore the first two. We store the median offset so hits feel tight.
      </p>
      <div
        className="mt-16 rounded-full bg-primary transition-transform"
        style={{
          width: 120,
          height: 120,
          transform: `scale(${1 + pulse * 0.28})`,
        }}
      />
      {phase === "idle" && (
        <Button className="mt-12" size="lg" onClick={() => void start()}>
          Start clicks
        </Button>
      )}
      {phase === "run" && (
        <p className="mt-12 text-sm text-muted">{count} taps counted</p>
      )}
      {phase === "done" && (
        <div className="mt-12 text-center">
          {result === null ? (
            <p>Not enough taps. Start again.</p>
          ) : (
            <p className="font-display text-2xl">
              Offset {result >= 0 ? "+" : ""}
              {result} ms
            </p>
          )}
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => void start()}>
              Retry
            </Button>
            <Button
              onClick={() => {
                if (result !== null) patchSave((s) => ({ ...s, offsetMs: result }));
                go("title");
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      {phase === "idle" && (
        <Button variant="ghost" className="mt-4" onClick={() => go("title")}>
          Back
        </Button>
      )}
    </div>
  );
}
