import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express"
import { Reflector } from "@nestjs/core";


@Injectable()
export class GraphqlAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlctx = context.getArgByIndex(2);
        const request: Request = gqlctx.req;
        const token  = this.extractTokenFromCookie(request);
        if (!token) {
            throw new UnauthorizedException('No access token provided');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
            });
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token');
        }
    return true;
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.access_token;
    }
}