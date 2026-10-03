type Handler = (payload: unknown) => void;

class Bus {
  private map = new Map<string, Set<Handler>>();

  on(ev: string, fn: Handler) {
    let set = this.map.get(ev);
    if (!set) {
      set = new Set();
      this.map.set(ev, set);
    }
    set.add(fn);
    return () => this.off(ev, fn);
  }

  off(ev: string, fn: Handler) {
    this.map.get(ev)?.delete(fn);
  }

  emit(ev: string, payload?: unknown) {
    this.map.get(ev)?.forEach((fn) => fn(payload));
  }

  clear() {
    this.map.clear();
  }
}

export const bus = new Bus();
