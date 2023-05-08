import { GameState } from "@prisma/client";
import { performance } from "perf_hooks";
import { Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { gameboard, GameroomService } from "../gameroom.service";

type coords = {
  x: number;
  y: number;
};
type coordsPlayer = coords & {
  id: number;
  score: number;
  move: boolean;
};
type gameStateMessage = {
  ball: coords;
  paddle: coordsPlayer[];
};

let gameSocketServer: Server;

const setGameSocketServer = (server: Server) => {
  gameSocketServer = server;
};

/// CONSTANTS ///

const PAD_SPEED = 10;
const GAME_HEIGHT = 200;
const GAME_WIDTH = 400;
const BALL_RADIUS = 15;
const WALL_THICKNESS = 20;
const PADDLE_HEIGHT = 40;
const PADDLE_WIDTH = 10;
const MAX_SCORE = 5;

function getRandomNumber(min: number, max: number) {
  let x = Math.floor(Math.random() * (max - min) + min);
  if (x == 0) return getRandomNumber(min, max);
  return x;
}

type GameboardEngine = {
  setReady: (id: number) => void;
  movePaddle: (id: number, up: boolean) => void;
  players: number[];
  ready: number[];
};
function GameboardEngine(
  playerL_id: number,
  playerR_id: number,
  id: string,
  hardcore: boolean,
  gameRoomService: GameroomService
) {
  this.players = [];
  this.ready = [];
  this.players[0] = playerL_id;
  this.players[1] = playerR_id;
  this.ready[0] = false;
  this.ready[1] = false;

  this.setReady = (id: number) => {
    if (game_loop == undefined) {
      this.players.map((el: number, index: number) => {
        if (el == id) {
          this.ready[index] = true;
        }
      });
      paddles = [
        {
          x: 0,
          y: 40,
          id: this.players[0],
          score: 0,
          move: null,
        },
        {
          x: GAME_WIDTH - PADDLE_WIDTH,
          y: 100,
          id: this.players[1],
          score: 0,
          move: null,
        },
      ];

      paddles.map((el: coordsPlayer) => {
        if (el?.id != undefined) gameRoomService.setPlayerStatus(el.id, true);
      });
    }
  };

  let BALL_SPEED = 7;
  if (hardcore == true) BALL_SPEED = BALL_SPEED * 1.2;
  let velocity: coords = {
    x: 0,
    y: 0,
  };
  let ball: coords = {
    x: 0,
    y: 0,
  };
  let paddles: coordsPlayer[] = [
    {
      x: 0,
      y: 40,
      id: playerL_id,
      score: 0,
      move: null,
    },
    {
      x: GAME_WIDTH - PADDLE_WIDTH,
      y: 100,
      id: playerR_id,
      score: 0,
      move: null,
    },
  ];

  const sendGameStateMessage = () => {
    gameSocketServer.to(id).emit("gameStateMessage", {
      gameroom_id: id,
      ball: ball,
      paddle: paddles,
      velocity: velocity,
    });
  };

  const wallHit = () => {
    if (ball.y >= GAME_HEIGHT - BALL_RADIUS / 3 || ball.y <= BALL_RADIUS / 3) {
      velocity.y *= -1;
    }
  };

  const winDetection = () => {
    let respawn: boolean = false;
    if (ball.x <= 0) {
      paddles[1].score += 1;
      respawn = true;
    }
    if (ball.x >= GAME_WIDTH) {
      paddles[0].score += 1;
      respawn = true;
    }
    if (respawn) {
      spawnBall();
    }
  };

  const movePaddleRoutine = () => {
    paddles.map((el: coordsPlayer) => {
      if (el.move != null) {
        if (el.move == true) {
          let excepted = el.y - PAD_SPEED;
          if (excepted < 0 || excepted + PADDLE_HEIGHT > GAME_HEIGHT) return;
          el.y -= PAD_SPEED;
        } else {
          let excepted = el.y + PAD_SPEED;
          if (excepted < 0 || excepted + PADDLE_HEIGHT > GAME_HEIGHT) return;
          el.y += PAD_SPEED;
        }
      }
    });
  };

  this.movePaddle = (id: number, up: boolean) => {
    paddles.map((el: coordsPlayer, index: number) => {
      if (el.id == id) {
        el.move = up;
        paddles[index].move = up;
      }
    });
  };

  const paddleHit = () => {
    let paddleHit = false;
    if (ball.x > paddles[0].x && ball.x < paddles[0].x + PADDLE_WIDTH) {
      if (
        ball.y > paddles[0].y - 5 &&
        ball.y < paddles[0].y + 5 + PADDLE_HEIGHT
      ) {
        velocity.x = -velocity.x;
        paddleHit = true;
      }
    }

    if (ball.x > paddles[1].x && ball.x < paddles[1].x + PADDLE_WIDTH) {
      if (
        ball.y > paddles[1].y - 5 &&
        ball.y < paddles[1].y + 5 + PADDLE_HEIGHT
      ) {
        velocity.x = -velocity.x;
        paddleHit = true;
      }
    }
  };

  const spawnBall = () => {
    ball.x = GAME_WIDTH / 2;
    ball.y = GAME_HEIGHT / 2;
    velocity.x = BALL_SPEED;
    velocity.y = BALL_SPEED;
  };

  const endGameDetection = async () => {
    let p1_score = paddles[0].score;
    let p2_score = paddles[1].score;

    if (p1_score + p2_score >= MAX_SCORE) {
      clearInterval(game_loop);
      await gameRoomService.setGameStatus(id, GameState.FINISH);
      await gameRoomService.setGameInformation(
        id,
        p1_score > p2_score ? true : false,
        paddles.map((el: coordsPlayer) => el.score)
      );
      gameSocketServer.to(id).emit("endGameMessage", {
        gameroom_id: id,
        paddle: paddles,
      });
      paddles.map((el: coordsPlayer) => {
        if (el?.id != undefined) gameRoomService.setPlayerStatus(el.id, false);
      });
      gameboard.delete(id);
    }
  };

  spawnBall();

  let max_perf = 0;

  let game_loop;
  let waiting = setInterval(() => {
    if (this.ready[0] && this.ready[1]) {
      clearInterval(waiting);
      setTimeout(() => {
        gameSocketServer.to(id).emit("gameStartMessage", {
          gameroom_id: id,
        });
        game_loop = setInterval(() => {
          let start = performance.now();
          ball.x += velocity.x;
          ball.y += velocity.y;
          movePaddleRoutine();
          paddleHit();
          wallHit();
          winDetection();
          sendGameStateMessage();
          endGameDetection();
          /*
          let perf = performance.now() - start;
          if (perf > max_perf) max_perf = perf;
          //console.log("perf = " + perf.toFixed(3));
          //console.log("max perf = " + max_perf.toFixed(3));
          */
        }, 1000 / 20);
        clearInterval(waiting);
      }, 1000);
    }
  }, 1000);
}

export { GameboardEngine, setGameSocketServer };
