import { Injectable } from '@nestjs/common';
import { AuctionRepository } from 'src/persistence/auction.repository';

@Injectable()
export class MonitorService {
    constructor(private readonly repository: AuctionRepository) { }

    async checkHealth(): Promise<boolean> {
        return this.repository.isHealthy();
    }
}
