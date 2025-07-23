import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const logger = new Logger('Auth-Guard'); // turn that into a class field
        const request = context.switchToHttp().getRequest();
        // extract auth grabbing in a function
        const authHeader = request.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }
        try {
            const token = authHeader.replace('Bearer ', '');
            const response = await axios.post('http://auth-api:3001/auth/validate', { token }); // turn that into it's own service
            return response.data.isValid;
        } catch (error) {
            logger.error(`Auth guard failed: ${error.message}`);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
