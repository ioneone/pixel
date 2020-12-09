export interface SpriteJson {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  scaleX: number;
  onGround: boolean;
}

class Sprite {
  public static readonly SIZE = 16;

  public x = 0; // x position in pixels
  public y = 0; // y position in pixels
  public width = Sprite.SIZE;
  public height = Sprite.SIZE;
  public vx = 0; // velocity in x axis in pixels per second
  public vy = 0; // velocity in y axis in pixels per second
  public scaleX = 1;
  public onGround = false;

  public applyJson(json: SpriteJson) {
    const { x, y, width, height, vx, vy, scaleX, onGround } = json;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = vx;
    this.vy = vy;
    this.scaleX = scaleX;
    this.onGround = onGround;
  }

  public get center(): { x: number; y: number } {
    const b = this.bounds;
    return {
      x: b.x + b.width / 2,
      y: b.y + b.height / 2,
    };
  }

  /**
   * Get the bounds of the sprite where the `x` and `y` are
   * the top left corner of the sprite. The `x` is different
   * from the default one when the sprite is flipped.
   */
  public get bounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: this.x + (this.scaleX < 0 ? -this.width : 0),
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public json(): SpriteJson {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      vx: this.vx,
      vy: this.vy,
      scaleX: this.scaleX,
      onGround: this.onGround,
    };
  }

  public tick() {
    this.x += (this.vx * 16.66) / 1000;
    this.y += (this.vy * 16.66) / 1000;
  }

  /**
   * Update the scale and position of the sprite to flip the texture horizontally.
   *
   * @param flipped Whether the sprite should be flipped or not
   */
  public setFlipped(flipped: boolean) {
    if (this.flipped === flipped) return;

    this.scaleX *= -1;
    this.x -= this.scaleX * this.width;
  }

  public get flipped() {
    return this.scaleX < 0;
  }
}

export default Sprite;