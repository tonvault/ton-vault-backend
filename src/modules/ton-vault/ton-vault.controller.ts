import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TonVaultService } from './ton-vault.service';
import {
    CreateFileDto,
    CreateFileResultDto,
    FileDto,
    GeneralApiAnswerDto,
    JwtPayloadDto,
} from '../../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserJwtPayload } from '../auth/user-jwt-payload.decorator';
import { ParseHexStringPipe } from '../../utils/validation/parse-hex-string.pipe';

@Controller()
export class TonVaultController {
    constructor(private readonly tonVaultService: TonVaultService) {}

    @Get('get/:pubKey')
    async getLastFile(
        @Param('pubKey', ParseHexStringPipe) pubKey: string,
    ): Promise<GeneralApiAnswerDto<FileDto | string>> {
        return this.tonVaultService.getLastUserFile(pubKey);
    }

    // todo: throttle
    @UseGuards(JwtAuthGuard)
    @Post('create')
    async createFile(
        @Body() createFileDto: CreateFileDto,
        @UserJwtPayload() jwtPayloadDto: JwtPayloadDto,
    ): Promise<GeneralApiAnswerDto<CreateFileResultDto | string>> {
        return this.tonVaultService.createFile(createFileDto, jwtPayloadDto);
    }
}
