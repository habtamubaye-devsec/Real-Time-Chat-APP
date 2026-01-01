import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class TokenService {
    constructor(private readonly configService: ConfigService) {}

    extractToken(connectionParams: any): string | null {
        const raw =
            connectionParams?.authorization ??
            connectionParams?.Authorization ??
            connectionParams?.token;

        if (typeof raw !== 'string') return null;

        // Accept both "Bearer <token>" and "<token>"
        const match = raw.match(/^Bearer\s+(.+)$/i);
        return (match?.[1] ?? raw).trim() || null;
    }

    validateToken(token: string): any {
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
        if (!accessTokenSecret) return null;

        try {
            return verify(token, accessTokenSecret);
        } catch (error) {
            return null;
        }
    }
}
