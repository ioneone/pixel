import * as PIXI from "pixi.js";
import { Howl } from "howler";
import Player from "./Player";
import io from "socket.io-client";
import TileMap from "./TileMap";
import Enemy from "./Enemy";
import { PlayerJson } from "../server/Player";
import { EnemyJson } from "../server/Enemy";

/**
 * A {@link PIXI.Container} where all the game objects reside.
 */
class Foreground extends PIXI.Container {
  public player: Player;

  public enemies: { [id: string]: Enemy };
  public tileMap: TileMap;

  private socket: SocketIOClient.Socket;
  private players: { [id: string]: Player };

  /**
   * Initialize all the game objects in the foreground.
   *
   * @param viewportHeight Height of the screen
   */
  constructor(viewportHeight: number) {
    super();

    const sound = new Howl({
      src: ["assets/sound/background/1.wav"],
      volume: 0.1,
      loop: true,
    });

    sound.play();

    this.socket = io();
    this.player = new Player();
    this.players = {};
    this.enemies = {};

    this.players[this.socket.id] = this.player;

    this.player.x = 16;
    this.player.y = viewportHeight - 32;

    this.tileMap = new TileMap();

    this.addChild(this.tileMap);
    this.addChild(this.player);

    this.socket.on(
      "init",
      (data: {
        players: { [id: string]: PlayerJson };
        enemies: { [id: string]: EnemyJson };
      }) => {
        Object.entries(data.players).forEach(([id, json]) => {
          const player = Player.fromJson(json);
          this.players[id] = player;
          this.addChild(player);
        });
        Object.entries(data.enemies).forEach(([id, json]) => {
          const enemy = Enemy.fromJson(json);
          this.enemies[id] = enemy;
          this.addChild(enemy);
        });
      }
    );

    this.socket.on("create", (data: { id: number; json: PlayerJson }) => {
      const { id, json } = data;
      const player = Player.fromJson(json);
      this.players[id] = player;
      this.addChild(player);
    });

    this.socket.on(
      "update-player",
      (data: { id: number; json: PlayerJson }) => {
        const { id, json } = data;
        this.players[id].applyJson(json);
      }
    );

    this.socket.on("update-enemies", (data: { [id: string]: EnemyJson }) => {
      Object.entries(data).forEach(([id, json]) => {
        this.enemies[id].applyJson(json);
      });
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
   * @param viewportWidth Width of the screen
   * @param viewportHeight Height of the screen
   */
  public tick(viewportWidth: number, viewportHeight: number) {
    this.player.tick();

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
    this.socket.emit("update-player", this.player.json);
  }
}

export default Foreground;
