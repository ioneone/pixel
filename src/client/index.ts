import * as PIXI from "pixi.js";
import Keyboard from "./Keyboard";
import Player, { PlayerJson } from "./Player";
import io from "socket.io-client";

import "./style.css";

// Disable interpolation when scaling, will make texture be pixelated
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application();

// scale the application view content
app.stage.scale.set(4);

// make the application view full screen
app.renderer.resize(window.innerWidth, window.innerHeight);

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

const loader = PIXI.Loader.shared;

// load the texture we need
loader.add("assets/mrman/idle_0.png");
loader.add("assets/mrman/idle_1.png");
loader.add("assets/mrman/idle_2.png");
loader.add("assets/mrman/idle_3.png");

loader.add("assets/mrman/run_0.png");
loader.add("assets/mrman/run_1.png");
loader.add("assets/mrman/run_2.png");
loader.add("assets/mrman/run_3.png");
loader.add("assets/mrman/run_4.png");
loader.add("assets/mrman/run_5.png");

loader.onProgress.add((loader) => {
  console.log(`progress: ${loader.progress}%`);
});

const players: { [id: string]: Player } = {};

// callback when all the files are loaded
loader.load(() => {
  console.log("All files loaded");

  const socket = io();

  const mrman = new Player();

  players[socket.id] = mrman;

  // add the sprite to the scene
  app.stage.addChild(mrman);

  app.ticker.add((deltaMs) => {
    mrman.tick(deltaMs);
    Keyboard.shared.tick();
    socket.emit("update", mrman.json);
  });

  socket.on("init", (data: { [id: string]: PlayerJson }) => {
    Object.entries(data).forEach(([id, json]) => {
      const player = Player.fromJson(json);
      players[id] = player;
      app.stage.addChild(player);
    });
  });

  socket.on("create", (data: { id: number; json: PlayerJson }) => {
    const { id, json } = data;
    const player = Player.fromJson(json);
    players[id] = player;
    app.stage.addChild(player);
  });

  socket.on("update", (data: { id: number; json: PlayerJson }) => {
    const { id, json } = data;
    players[id].applyJson(json);
  });

  socket.on("delete", (data: { id: number }) => {
    const { id } = data;
    app.stage.removeChild(players[id]);
    delete players[id];
  });
});