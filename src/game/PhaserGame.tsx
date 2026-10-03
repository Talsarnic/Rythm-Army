import { useEffect, useRef } from "react";

export function PhaserGame({ missionId }: { missionId: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: { destroy: (removeCanvas: boolean) => void } | undefined;
    let dead = false;
    void (async () => {
      const { createGame } = await import("./createGame");
      if (dead || !ref.current) return;
      game = createGame(ref.current, missionId);
    })();
    return () => {
      dead = true;
      game?.destroy(true);
    };
  }, [missionId]);

  return <div ref={ref} className="absolute inset-0 touch-none" />;
}
