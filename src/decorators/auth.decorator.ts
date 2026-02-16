import { AUTH, PERMISSION } from '@/constant';
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const Public = () => SetMetadata(AUTH.IS_PUBLIC, true);
export const Permission = (...args: (keyof typeof PERMISSION)[][]) =>
  SetMetadata(AUTH.USED_PERMISSION, args);

export const UserReq = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user ?? { sub: '', perm: '' }) as {
      sub: string;
      perm: number;
    };
  },
);

export type IUserReq = {
  sub: string;
  perm: number;
  division: string;
};
