import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsHexadecimalString } from '../utils/validation/is-hex-str';

export class CreateFileDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Za-z0-9+/=]+$/, { message: 'Should be a base64 string' })
    encryptedContent: string;

    @IsString()
    @IsNotEmpty()
    @IsHexadecimalString()
    rawContentHash: string;

    @IsString()
    @IsNotEmpty()
    @IsHexadecimalString()
    secondEncryptKey: string;
}
