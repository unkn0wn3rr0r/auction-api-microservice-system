import { Test, TestingModule } from '@nestjs/testing';
import { MonitorController } from './monitor.controller';
import { MonitorService } from 'src/core/services/monitor/monitor.service';
import { MonitorStatusResponse } from 'src/utils/models/monitor';

describe('MonitorController', () => {
    let controller: MonitorController;
    let service: MonitorService;

    const mockMonitorService = {
        checkHealth: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MonitorController],
            providers: [
                {
                    provide: MonitorService,
                    useValue: mockMonitorService,
                },
            ],
        }).compile();

        controller = module.get(MonitorController);
        service = module.get(MonitorService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return status ok if db is healthy', async () => {
        mockMonitorService.checkHealth.mockResolvedValue(true);

        const response: MonitorStatusResponse = await controller.checkHealth();

        expect(response).toEqual({
            status: 'ok',
            details: {
                db: 'up',
            },
        });
    });

    it('should return status fail if db is down', async () => {
        mockMonitorService.checkHealth.mockResolvedValue(false);

        const response: MonitorStatusResponse = await controller.checkHealth();

        expect(response).toEqual({
            status: 'fail',
            details: {
                db: 'down',
            },
        });
    });
});
