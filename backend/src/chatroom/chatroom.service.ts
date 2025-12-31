import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatroomService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const chatroom = await this.prisma.chatroom.create({
      data: { name },
    });

    return {
      ...chatroom,
      id: String(chatroom.id),
    };
  }

  async list() {
    const chatrooms = await this.prisma.chatroom.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return chatrooms.map((c) => ({
      ...c,
      id: String(c.id),
    }));
  }
}
