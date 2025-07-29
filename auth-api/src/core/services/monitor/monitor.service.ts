import { Injectable } from '@nestjs/common';
import { AuthRepository } from 'src/persistence/repositories/auth/auth.repository';

@Injectable()
export class MonitorService {
    constructor(private readonly repository: AuthRepository) { }

    async checkHealth(): Promise<boolean> {
        return this.repository.isHealthy();
    }
}
