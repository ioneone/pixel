import * as PIXI from "pixi.js";
import Sprite from "./Sprite";

class Effect extends Sprite {
  constructor() {
    super([
      PIXI.Loader.shared.resources[`assets/effects/punch/0.png`].texture,
      PIXI.Loader.shared.resources[`assets/effects/punch/1.png`].texture,
      PIXI.Loader.shared.resources[`assets/effects/punch/2.png`].texture,
    ]);
  }
}

export default Effect;