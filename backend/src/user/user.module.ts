import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [PrismaModule, MulterModule.register({
    dest: './avatar'
  })],
  exports: [UserService]
})
export class UserModule {}
