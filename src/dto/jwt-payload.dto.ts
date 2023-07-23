import { CHAIN } from './wallet.dto';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsHexadecimalString } from '../utils/validation/is-hex-str';

export class JwtPayloadDto {
    /**
     * User's public key in hex format without preceding 0x.
     */
    @IsString()
    @IsNotEmpty()
    @IsHexadecimalString()
    pub: string;
    /**
     * Chain id.
     */
    @IsNumber()
    cid: CHAIN;
}
