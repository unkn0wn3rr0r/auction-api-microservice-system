import {
    Controller,
    Get,
} from '@nestjs/common';
import { MonitorService } from 'src/core/services/monitor/monitor.service';
import { MonitorStatusResponse } from 'src/utils/models/monitor';

@Controller('/monitor')
export class MonitorController {
    constructor(private readonly service: MonitorService) { }

    @Get()
    async checkHealth(): Promise<MonitorStatusResponse> {
        const isAppHealthy = await this.service.checkHealth();
        return { status: isAppHealthy ? 'ok' : 'fail' };
    }
}
