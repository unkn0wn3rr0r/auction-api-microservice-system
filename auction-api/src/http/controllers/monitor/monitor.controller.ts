import {
    Controller,
    Get,
} from '@nestjs/common';
import { MonitorStatusResponse } from 'src/utils/models/monitor';
import { MonitorService } from 'src/core/services/monitor/monitor.service';

@Controller('/monitor')
export class MonitorController {
    constructor(private readonly service: MonitorService) { }

    @Get()
    async checkHealth(): Promise<MonitorStatusResponse> {
        const isDbHealthy = await this.service.checkHealth();
        return {
            status: isDbHealthy ? 'ok' : 'fail',
            details: {
                db: isDbHealthy ? 'up' : 'down',
            },
        };
    }
}
