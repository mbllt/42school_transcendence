import { UserService } from "../user/user.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Game, GameState, Prisma, User, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { GameboardEngine } from "./gameboard/gameboard.engine";
import { Server } from "socket.io";
import { groupBy } from "rxjs";

let gameboard = new Map<string, GameboardEngine>();
let gameroom_available: Game[] = [undefined, undefined];

@Injectable()
export class GameroomService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.game.updateMany({
      where: { OR: [{ status: "WAITING" }, { status: "IN_PROGRESS" }] },
      data: {
        status: "FAILED_UNACCEPTED_GAME",
      },
    });
  }

  server: Server;

  setServer(s: Server) {
    this.server = s;
  }

  getGameroomAvailable(hardcore: boolean): Game | undefined {
    return gameroom_available[hardcore ? 1 : 0];
  }

  setGameroomAvailable(game: Game | undefined, hardcore: boolean): void {
    gameroom_available[hardcore ? 1 : 0] = game;
  }

  async createGameroom(
    player_id: number,
    hardcore: boolean,
    matchmaking: boolean
  ): Promise<Game> {
    const gm = await this.prisma.game.create({
      data: {
        status: GameState.WAITING,
        hardcore: hardcore,
        players: {
          connect: {
            id: player_id,
          },
        },
      },
    });
    let gb: GameboardEngine = new GameboardEngine(
      player_id,
      undefined,
      gm.id,
      gm.hardcore,
      this
    );
    gameboard.set(gm.id, gb);
    if (matchmaking) this.setGameroomAvailable(gm, hardcore);
    return gm;
  }

  async joinGameroomQueue(
    player_id: number,
    hardcore: boolean
  ): Promise<Game | undefined> {
    let gameroom = this.getGameroomAvailable(hardcore);

    if (gameroom != undefined) {
      // check if same player
      const already = await this.prisma.game.findUnique({
        where: { id: gameroom.id },
        include: {
          players: true,
        },
      });

      // erreur
      if (already.players[0].id == player_id) {
        //console.log("GAME | player already in queue");
        return already;
      }

      // add user to gameroom
      return this.addUserToGameroom(player_id, gameroom.id);
    } else {
      //console.log("GAME | create gameroom because no in queue");
      return await this.createGameroom(player_id, hardcore, true);
    }
  }

  async addUserToGameroom(
    player_id: number,
    id: string
  ): Promise<Game> | undefined {
    let ret: Game & {
      players: User[];
    } = await this.prisma.game.update({
      where: {
        id: id,
      },
      data: {
        players: {
          connect: {
            id: player_id,
          },
        },
      },
      include: {
        players: true,
      },
    });
    gameboard.get(id).players[1] = player_id;
    //console.log("GAME | add user to game : " + id);
    if (ret.players.length == 2) {
      this.startGame(ret);
      //console.log("GAME | auto start game for id : " + id);
    }
    return ret;
  }

  async startGame(gr: Game & { players: User[] }): Promise<void> {
    this.setGameStatus(gr.id, GameState.IN_PROGRESS);
    if (
      this.getGameroomAvailable(gr.hardcore) != undefined &&
      this.getGameroomAvailable(gr.hardcore).id == gr.id
    )
      this.setGameroomAvailable(undefined, gr.hardcore);
  }

  async setGameStatus(id: string, newState: GameState): Promise<Boolean> {
    try {
      await this.prisma.game.update({
        data: {
          status: newState,
        },
        where: {
          id: id,
        },
      });
      //console.log("GAME | set status of game id : " + id + " - " + newState);
      return true;
    } catch (error) {
      return false;
    }
  }
  async setPlayerStatus(id: number, in_game: boolean): Promise<Boolean> {
    let status: UserStatus = in_game ? "IN_GAME" : "CONNECTED";
    const actual_status: Pick<User, "user_status"> =
      await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          user_status: true,
        },
      });
    if (actual_status.user_status != "DISCONNECTED")
      try {
        await this.prisma.user.update({
          data: {
            user_status: status,
          },
          where: {
            id: id,
          },
        });
        return true;
      } catch (error) {
        return false;
      }
  }

  async setGameInformation(
    id: string,
    isPlayerAWinner: boolean,
    score: number[]
  ): Promise<Boolean> {
    try {
      await this.prisma.game.update({
        data: {
          is_player_a_winner: isPlayerAWinner,
          game_data: { score },
        },
        where: {
          id: id,
        },
      });
      //console.log("GAME | send game information : " + id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getGameroomByID(id: string): Promise<Game | undefined> {
    try {
      return await this.prisma.game.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          players: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      return undefined;
    }
  }

  async getGameroomInProgress(): Promise<Game[]> {
    try {
      return await this.prisma.game.findMany({
        take: 5,
        orderBy: [
          {
            created_at: 'desc',
          }
        ],
        where: {
          status: GameState.IN_PROGRESS,
        },
        include: {
          players: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      return [];
    }
  }
}

export { gameroom_available, gameboard };
