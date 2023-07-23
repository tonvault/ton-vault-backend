import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadDto } from '../../dto';

export const UserJwtPayload = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtPayloadDto => {
        const request = ctx.switchToHttp().getRequest();
        return {
            pub: request.user.pub,
            cid: request.user.cid,
        };
    },
);
