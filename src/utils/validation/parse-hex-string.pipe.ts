import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseHexStringPipe implements PipeTransform {
    isHexadecimalString(value: string): boolean {
        const parsedValue = parseInt(value, 16);
        return !isNaN(parsedValue);
    }

    transform(value: string): string {
        if (!this.isHexadecimalString(value)) {
            throw new BadRequestException('Not a hex string');
        }
        return value.toUpperCase();
    }
}
