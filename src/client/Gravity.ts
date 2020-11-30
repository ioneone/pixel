import * as PIXI from "pixi.js";
import Sprite from "./Sprite";

/**
 * A singleton class that handles the gravity of the game.
 * Call {@link Gravity.tick} every frame to enable gravity.
 */
class Gravity {
  // The downward acceleration per second
  public static readonly G = 1024;

  public static shared = new Gravity();

  private constructor() {}

  /**
   * Call this method every frame to pull down the player
   * and enemies in the game.
   *
   * @param sprites The sprites to apply the gravity
   */
  public tick(sprites: Sprite[]) {
    sprites.forEach((s) => {
      s.vy += (Gravity.G * PIXI.Ticker.shared.elapsedMS) / 1000;
    });
  }
}

export default Gravity;
