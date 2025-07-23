import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthTransportationService {
    private readonly logger = new Logger(AuthTransportationService.name);
    private readonly baseUrl = 'http://auth-api:3001/auth';

    constructor(private readonly httpService: HttpService) { }

    async validateToken(token: string): Promise<boolean> {
        try {
            const response = await firstValueFrom(this.httpService.post(`${this.baseUrl}/validate`, { token }));
            return response.data?.isValid ?? false;
        } catch (error) {
            this.logger.error(`Token validation failed: ${error.message}`);
            throw error;
        }
    }
}
