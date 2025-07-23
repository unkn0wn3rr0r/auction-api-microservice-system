import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthTransportationService } from 'src/core/services/transport/auth.transportation.service';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(private readonly service: AuthTransportationService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = extractJwt(request.headers['authorization']);
        try {
            return await this.service.validateToken(token);
        } catch (error) {
            this.logger.error(`Auth guard failed: ${error.message}`);
            throw new UnauthorizedException('Invalid token');
        }
    }
}

function extractJwt(header: string | undefined): string {
    if (!header?.trim() || !header.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    return header.replace('Bearer ', '');
}
