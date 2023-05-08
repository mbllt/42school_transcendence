import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { async } from "rxjs";
import { Game, User, UserStatus } from "@prisma/client";
import { finished } from "stream";
import { PrismaService } from "../prisma/prisma.service";
const bcrypt = require("bcrypt");

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserStatus(id: number): Promise<UserStatus> {
    let status = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        user_status: true,
      },
    });
    let ig: boolean = false;
    return status.user_status;
  }

  async setUserStatus(userId: number, status: UserStatus) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        user_status: status,
      },
    });
  }

  createUser = async (
    username: string,
    id42: number | undefined,
    password: string | undefined
  ): Promise<User> => {
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      password = hash;
    }
    return await this.prisma.user
      .create({
        data: {
          username: username,
          id42: id42,
          password: password,
        },
      })
      .then((e) => {
        return e;
      })
      .catch((e) => {
        return Promise.reject();
      });
  };

  getUser = async (user_id: number): Promise<User> => {
    return await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
  };

  async getUsers() {
    return await this.prisma.user.findMany({
      select: {
        username: true,
      },
    });
  }

  getUserBy42ID = async (user_id: number): Promise<User> => {
    return await this.prisma.user.findFirst({
      where: {
        id42: user_id,
      },
    });
  };

  getUserByUsername = async (username: string): Promise<User> => {
    return await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });
  };

  modifyUser = async (
    user_id: number,
    user: Partial<
      Pick<User, "username" | "image_url" | "enable2fa" | "secret2fa">
    >
  ): Promise<User | undefined> => {
    try {
      return await this.prisma.user.update({
        where: {
          id: user_id,
        },
        data: user,
      });
    } catch (e) {
      return undefined;
    }
  };

  deleteUser = () => {};

  /// 2FA ///

  async turnOnTwoFactorAuthentication(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        enable2fa: true,
      },
    });
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        enable2fa: false,
        secret2fa: null,
      },
    });
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        secret2fa: secret,
      },
    });
  }

  /// STATS ///

  async getUserMatchData(user: any) {
    return await this.prisma.game.findMany({
      take: 5,
      where: {
        status: "FINISH",
        players: {
          some: {
            username: user,
          },
        },
      },
      include: {
        players: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async getUserStat(playerId: any) {
    return await this.prisma.game.findMany({
      where: {
        status: "FINISH",
        players: {
          some: {
            id: playerId,
          },
        },
      },
      select: {
        id: true,
        hardcore: true,
        is_player_a_winner: true,
        players: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  /// USER FRIENDS RELATION  ///

  async getUserFriends(userId: number) {
    return await this.prisma.user.findMany({
      where: {
        id: userId,
      },
      select: {
        friends: {
          select: {
            id: true,
            username: true,
            image_url: true,
            user_status: true,
          },
        },
      },
    });
  }

  async getBlockedUser(userId: number) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        blocked_user: {
          select: {
            username: true,
            id: true,
          },
        },
      },
    });
  }

  async addFriend(userId: number, friendToAddId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          connect: {
            id: friendToAddId,
          },
        },
      },
    });
  }

  async deleteFriend(userId: number, friendToRemovedId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        friends: {
          disconnect: {
            id: friendToRemovedId,
          },
        },
      },
    });
  }

  async blockUser(userId: number, userToBlockId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        blocked_user: {
          connect: {
            id: userToBlockId,
          },
        },
      },
    });
  }

  async unblockUser(userId: number, userToBlockId: number) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        blocked_user: {
          disconnect: {
            id: userToBlockId,
          },
        },
      },
    });
  }
}
