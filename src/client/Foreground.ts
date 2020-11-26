import * as PIXI from "pixi.js";
import Player, { PlayerJson } from "./Player";
import Tile from "./Tile";
import io from "socket.io-client";

/**
 * A {@link PIXI.Container} where all the game objects reside.
 */
class Foreground extends PIXI.Container {
  public player: Player;
  public tiles: Tile[];

  private socket: SocketIOClient.Socket;
  private players: { [id: string]: Player };

  /**
   * Initialize all the game objects in the foreground.
   *
   * @param viewportHeight Height of the screen
   */
  constructor(viewportHeight: number) {
    super();

    this.socket = io();
    this.player = new Player();
    this.tiles = [];
    this.players = {};

    this.players[this.socket.id] = this.player;

    for (let i = 0; i < 40; i++) {
      const tile = new Tile();
      tile.x = i * 16;
      tile.y = viewportHeight - 16;
      this.tiles.push(tile);
    }

    for (let i = 0; i < 5; i++) {
      const anotherTile = new Tile();
      anotherTile.x = 0;
      anotherTile.y = viewportHeight - 32 - i * 16;
      this.tiles.push(anotherTile);
    }

    const anotherTile2 = new Tile();
    anotherTile2.x = 60;
    anotherTile2.y = viewportHeight - 32;
    this.tiles.push(anotherTile2);

    this.player.x = 16;
    this.player.y = viewportHeight - 32;

    this.addChild(this.player);
    this.addChild(...this.tiles);

    this.socket.on("init", (data: { [id: string]: PlayerJson }) => {
      Object.entries(data).forEach(([id, json]) => {
        const player = Player.fromJson(json);
        this.players[id] = player;
        this.addChild(player);
      });
    });

    this.socket.on("create", (data: { id: number; json: PlayerJson }) => {
      const { id, json } = data;
      const player = Player.fromJson(json);
      this.players[id] = player;
      this.addChild(player);
    });

    this.socket.on("update", (data: { id: number; json: PlayerJson }) => {
      const { id, json } = data;
      this.players[id].applyJson(json);
    });

    this.socket.on("delete", (data: { id: number }) => {
      const { id } = data;
      this.removeChild(this.players[id]);
      delete this.players[id];
    });
  }

  /**
   * Call this method every frame to update all the game objects in the foreground
   * including the container itself.
   *
   * @param deltaMs Elapsed time since last frame in milliseconds
   * @param viewportWidth Width of the screen
   * @param viewportHeight Height of the screen
   */
  public tick(deltaMs: number, viewportWidth: number, viewportHeight: number) {
    this.player.tick(deltaMs);

    // make the screen chase the player
    if (this.player.center.x > viewportWidth / 2) {
      this.pivot.x = this.player.center.x;
      this.position.x = viewportWidth / 2;
    } else {
      this.pivot.x = 0;
      this.position.x = 0;
    }

    if (viewportHeight - this.player.center.y > viewportHeight / 2) {
      this.pivot.y = this.player.center.y;
      this.position.y = viewportHeight / 2;
    } else {
      this.pivot.y = 0;
      this.position.y = 0;
    }

    // notify all other connections about the player data of this connection
    this.socket.emit("update", this.player.json);
  }
}

export default Foreground;
