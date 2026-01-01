import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async listByChatroom(chatroomId: string) {
    const chatroomIdInt = Number(chatroomId);
    if (!Number.isFinite(chatroomIdInt)) {
      throw new BadRequestException('Invalid chatroomId');
    }

    const messages = await this.prisma.message.findMany({
      where: { chatroomId: chatroomIdInt },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    return messages.map((m) => ({
      ...m,
      id: String(m.id),
      userId: String(m.userId),
      chatroomId: String(m.chatroomId),
      user: m.user
        ? {
            ...m.user,
            id: String(m.user.id),
          }
        : undefined,
    }));
  }

  async send(userId: number, chatroomId: string, content: string, imageUrl?: string) {
    const chatroomIdInt = Number(chatroomId);
    if (!Number.isFinite(chatroomIdInt)) {
      throw new BadRequestException('Invalid chatroomId');
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        imageUrl,
        userId,
        chatroomId: chatroomIdInt,
      },
      include: { user: true },
    });

    return {
      ...message,
      id: String(message.id),
      userId: String(message.userId),
      chatroomId: String(message.chatroomId),
      user: message.user
        ? {
            ...message.user,
            id: String(message.user.id),
          }
        : undefined,
    };
  }
}
