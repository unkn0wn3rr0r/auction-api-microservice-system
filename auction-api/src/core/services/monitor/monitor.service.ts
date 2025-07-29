import { Injectable } from '@nestjs/common';
import { AuctionRepository } from 'src/utils/models/auction';
import { AuthTransportationService } from '../transport/auth.transportation.service';
import { MonitorStatusResponse } from 'src/utils/models/monitor';

@Injectable()
export class MonitorService {
    constructor(
        private readonly authService: AuthTransportationService,
        private readonly auctionRepository: AuctionRepository,
    ) { }

    async checkHealth(): Promise<MonitorStatusResponse> {
        const isAuthHealthy = await this.authService.isHealthy();
        const isAuctionDbHealthy = await this.auctionRepository.isHealthy();
        return {
            status: {
                auth: isAuthHealthy ? 'up' : 'down',
                db: isAuctionDbHealthy ? 'up' : 'down',
            },
        }
    }
}
