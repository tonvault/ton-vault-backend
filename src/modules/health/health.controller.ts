import { BadRequestException, Controller, Get } from '@nestjs/common';
import { TonStorageCliService } from '../ton-storage-cli/ton-storage-cli.service';

@Controller('health')
export class HealthController {
    constructor(private readonly tonStorageCliService: TonStorageCliService) {}

    @Get()
    async getList() {
        const list = await this.tonStorageCliService.list();
        if (!list.ok) {
            throw new BadRequestException(list);
        }
        return {
            ok: list.ok,
            code: list.code,
        };
    }
}
