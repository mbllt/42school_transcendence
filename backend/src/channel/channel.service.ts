import { ChatService } from "./../chat/chat.service";
import { Injectable } from "@nestjs/common";
import {
  Group,
  GroupSanction,
  GroupType,
  SanctionType,
  User,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
const bcrypt = require("bcrypt");

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async createChannel(owner_id: number, type: GroupType, password?: string) {
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      password = hash;
    }
    return await this.prisma.group.create({
      data: {
        type: type,
        owner: {
          connect: { id: owner_id },
        },
        password: password,
        users: {
          connect: {
            id: owner_id,
          },
        },
      },
    });
  }

  async changePassword(group_id: string, password: string): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          password: password,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async addUserToChannelByUsername(
    group_id: string,
    user_username: string
  ): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          users: {
            connect: {
              username: user_username,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async changeType(group_id: string, new_type: GroupType): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          type: new_type,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async addUserToChannelByID(
    group_id: string,
    user_id: number
  ): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          users: {
            connect: {
              id: user_id,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeUserToChannelByUsername(
    group_id: string,
    user_username: string
  ): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          users: {
            disconnect: {
              username: user_username,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeUserToChannelByID(
    group_id: string,
    user_id: number
  ): Promise<Boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: group_id,
        },
        data: {
          users: {
            disconnect: {
              id: user_id,
            },
          },
          admin: {
            disconnect: {
              id: user_id,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getChannelByUser(id: number) {
    return await this.prisma.group.findMany({
      where: {
        users: {
          some: {
            id: id,
          },
        },
      },
      include: {
        users: {
          select: {
            username: true,
          },
        },
        owner: {
          select: {
            username: true,
          },
        },
        admin: {
          select: {
            username: true,
          },
        },
      },
    });
  }

  async getCompleteChannelByUser(id: number) {
    return await this.prisma.group.findMany({
      where: {
        users: {
          some: {
            id: id,
          },
        },
      },
      include: {
        users: {
          select: {
            username: true,
          },
        },
        Message: {
          include: {
            sender: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async isChannelOwnerByID(
    channel_id: string,
    user_id: number
  ): Promise<boolean> {
    try {
      const owner = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          ownerId: true,
        },
      });
      return owner.ownerId == user_id;
    } catch (error) {
      return false;
    }
  }

  async isChannelAdminByID(
    channel_id: string,
    user_id: number
  ): Promise<boolean | undefined> {
    try {
      const admins = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          admin: {
            select: {
              id: true,
            },
          },
        },
      });
      return admins.admin.some((el) => el.id == user_id);
    } catch (error) {
      return undefined;
    }
  }

  async isChannelOwnerByUsername(
    channel_id: string,
    user_username: string
  ): Promise<boolean> {
    try {
      const owner = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          owner: true,
        },
      });
      return owner.owner.username == user_username;
    } catch (error) {
      return false;
    }
  }

  async isChannelAdminByUsername(
    channel_id: string,
    user_username: string
  ): Promise<boolean | undefined> {
    try {
      const admins = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          admin: {
            select: {
              username: true,
            },
          },
        },
      });
      return admins.admin.some((el) => el.username == user_username);
    } catch (error) {
      return undefined;
    }
  }

  async isChannelUserByID(
    channel_id: string,
    user_id: number
  ): Promise<boolean | undefined> {
    try {
      const users = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });
      return users.users.some((el) => el.id == user_id);
    } catch (error) {
      return undefined;
    }
  }

  async isChannelUserByUsername(
    channel_id: string,
    user_username: string
  ): Promise<boolean | undefined> {
    try {
      const users = await this.prisma.group.findUniqueOrThrow({
        where: {
          id: channel_id,
        },
        select: {
          users: {
            select: {
              username: true,
            },
          },
        },
      });
      return users.users.some((el: User) => el.username == user_username);
    } catch (error) {
      return undefined;
    }
  }

  async setAdminByUsername(
    channel_id: string,
    user_username: string
  ): Promise<boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: channel_id,
        },
        data: {
          admin: {
            connect: {
              username: user_username,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async unsetAdminByUsername(
    channel_id: string,
    user_username: string
  ): Promise<boolean> {
    try {
      await this.prisma.group.update({
        where: {
          id: channel_id,
        },
        data: {
          admin: {
            disconnect: {
              username: user_username,
            },
          },
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPublicChannel(user_id: number) {
    try {
      let rep = await this.prisma.group.findMany({
        select: {
          type: true,
          id: true,
          password: false,
          users: {
            select: {
              username: true,
              id: true,
            },
          },
        },
        where: {
          OR: [
            { type: GroupType.PUBLIC },
            { type: GroupType.PRIVATE_WITH_PASSWORD },
          ],
        },
      });
      return rep.filter((el) => {
        let isInThisGroup: Boolean[] = el.users.map((el) => {
          return el.id == user_id;
        });
        let to_skip = isInThisGroup.indexOf(true) != -1;
        return !to_skip;
      });
    } catch (error) {
      return undefined;
    }
  }

  async deleteChannel(channel_id: string): Promise<Boolean> {
    try {
      await this.prisma.group.delete({
        where: {
          id: channel_id,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getChannel(channel_id: string): Promise<Group | null> {
    // to use only for user in this channel
    try {
      return await this.prisma.group.findUnique({
        where: {
          id: channel_id,
        },
        include: {
          Message: {
            include: {
              sender: {
                select: {
                  username: true,
                  id: true,
                },
              },
            },
          },
          users: {
            select: {
              username: true,
              id: true,
            },
          },
          owner: {
            select: {
              username: true,
            },
          },
          admin: {
            select: {
              username: true,
            },
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  async getSanctions(
    channel_id: string,
    user_id: number,
    type?: SanctionType
  ): Promise<GroupSanction[] | undefined> {
    try {
      let sanctions: GroupSanction[] = await this.prisma.groupSanction.findMany(
        {
          orderBy: {
            expired_at: "desc",
          },
          where: {
            groupId: channel_id,
            sanctioned_userId: user_id,
            expired_at: {
              gte: new Date(),
            },
            type: type,
          },
        }
      );
      return sanctions;
    } catch (error) {
      return undefined;
    }
  }

  async isSanctioned(
    channel_id: string,
    user_id: number,
    type: SanctionType
  ): Promise<Date | undefined> {
    let s: GroupSanction[] = await this.getSanctions(channel_id, user_id, type);
    if (s[0] != null) return s[0].expired_at;
    else undefined;
  }

  async createSanction(
    channel_id: string,
    user_username: string,
    type: SanctionType,
    expired_at: Date
  ): Promise<Boolean> {
    if (type == SanctionType.BAN) {
      let d = await this.removeUserToChannelByUsername(
        channel_id,
        user_username
      );
    }
    try {
      await this.prisma.group.update({
        where: {
          id: channel_id,
        },
        data: {
          sanctions: {
            create: {
              sanctioned_user: {
                connect: {
                  username: user_username,
                },
              },
              expired_at: expired_at,
              type: type,
            },
          },
        },
      });
      return true;
    } catch (error) {
      // //console.log(error);
      return false;
    }
  }

  async isAdminOrOwnerByID(group_id: string, user_id: number) {
    return (
      (await this.isChannelAdminByID(group_id, user_id)) ||
      (await this.isChannelOwnerByID(group_id, user_id))
    );
  }

  async isAdminOrOwnerByUsername(group_id: string, user_username: string) {
    return (
      (await this.isChannelAdminByUsername(group_id, user_username)) ||
      (await this.isChannelOwnerByUsername(group_id, user_username))
    );
  }
}
