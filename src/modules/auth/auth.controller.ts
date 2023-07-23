import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenDto, GeneralApiAnswerDto, SignInDto } from '../../dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: SignInDto): Promise<GeneralApiAnswerDto<AccessTokenDto>> {
        return this.authService.signIn(signInDto);
    }

    @Get('auth-request')
    authRequest(): Promise<GeneralApiAnswerDto<{ tonProof: string }>> {
        return this.authService.authRequest();
    }
}
