// src/components/header/utils/BellPlayer.ts
import bellSound from "@assets/sounds/bellsound.mp3";

class BellPlayerClass {
  private audio: HTMLAudioElement;
  private unlocked = false;
  private unlocking = false;

  constructor() {
    this.audio = new Audio(bellSound);
    this.audio.preload = "auto";
    // @ts-expect-error - playsInline is not in TS DOM typings in some versions
    this.audio.playsInline = true;
    this.audio.muted = false;
    this.audio.volume = 1;
  }

  private tryUnlock = async () => {
    if (this.unlocked || this.unlocking) return;
    this.unlocking = true;
    try {
      this.audio.currentTime = 0;
      const p = this.audio.play();
      if (p && typeof p.catch === "function") {
        await p.catch(() => {});
      }
      this.audio.pause();
      this.audio.currentTime = 0;
      this.unlocked = true;
      this.removeGestureListeners();
    } finally {
      this.unlocking = false;
    }
  };

  private gestureHandler = () => this.tryUnlock();

  private addGestureListeners() {
    document.addEventListener("pointerdown", this.gestureHandler, {
      once: false,
      passive: true,
    });
    document.addEventListener("touchstart", this.gestureHandler, {
      once: false,
      passive: true,
    });
    document.addEventListener("click", this.gestureHandler, { once: false });
    document.addEventListener("keydown", this.gestureHandler, { once: false });
  }

  private removeGestureListeners() {
    document.removeEventListener("pointerdown", this.gestureHandler);
    document.removeEventListener("touchstart", this.gestureHandler);
    document.removeEventListener("click", this.gestureHandler);
    document.removeEventListener("keydown", this.gestureHandler);
  }

  ensureUnlocked() {
    if (this.unlocked) return;
    this.addGestureListeners();
  }

  play() {
    if (!this.unlocked) {
      this.ensureUnlocked();
      return;
    }
    try {
      this.audio.currentTime = 0;
      const p = this.audio.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {});
      }
    } catch {}
  }
}

export const BellPlayer = new BellPlayerClass();
