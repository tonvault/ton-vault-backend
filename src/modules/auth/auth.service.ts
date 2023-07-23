import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { signatureVerify } from './ton-proof';
import { AccessTokenDto, GeneralApiAnswerDto, SignInDto } from '../../dto';
import { AnswerCode, AnswerDescription } from '../../answer-code';
import { MINUTE } from '../../utils/constant/time';
import { Address } from 'ton';

@Injectable()
export class AuthService {
    private readonly pepper: string;
    private readonly signLifetime: number;
    constructor(private readonly jwtService: JwtService) {
        this.pepper = crypto.randomBytes(32).toString('hex');
        this.signLifetime = MINUTE * 5; // todo: move to config
    }

    async authRequest(): Promise<GeneralApiAnswerDto<{ tonProof: string }>> {
        return {
            result: {
                tonProof: this.getAuthString(),
            },
            code: AnswerCode.success,
        };
    }

    async signIn(signInDto: SignInDto): Promise<GeneralApiAnswerDto<AccessTokenDto>> {
        const signVerificationCode = signatureVerify(signInDto, this.signLifetime);
        if (signVerificationCode !== AnswerCode.success) {
            throw new UnauthorizedException(
                {
                    code: signVerificationCode,
                },
                {
                    description: AnswerDescription[signVerificationCode],
                },
            );
        }
        return {
            result: {
                access_token: await this.jwtService.signAsync({
                    pub: this.getUserId(signInDto.publicKey),
                    cid: Address.parse(signInDto.addressRaw).workChain,
                }),
            },
            code: AnswerCode.success,
        };
    }

    //TODO: static message is dangerous for security.
    // Fishing front case.
    // Cors will save us in case of browser, but what if mobile app?
    // we can manually generate and save salt for each user, but ton-connect doesn't let us to do it in single
    // connection phase.
    private getAuthString() {
        return `-- TON-VAULT SERVICE AUTHORIZATION SIGNATURE GENERATION --\n${this.pepper}`;
    }

    private getUserId(pubKey: string) {
        if (pubKey.slice(0, 2) === '0x' || pubKey.slice(0, 2) === '0X') {
            return pubKey.slice(2).toUpperCase();
        } else {
            return pubKey.toUpperCase();
        }
    }
}
