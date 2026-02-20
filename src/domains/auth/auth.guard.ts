import { AUTH, PERMISSION } from '../../constant';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(AUTH.IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const permissions = this.reflector.getAllAndMerge<
      (keyof typeof PERMISSION)[][]
    >(AUTH.USED_PERMISSION, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (!AuthGuard.isUserHasPermissionOr(+payload.perm, permissions))
        throw new UnauthorizedException(
          "You doesn't have permission to open this",
        );
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  public static isUserHasPermissions(
    permbit: number,
    permissions: (keyof typeof PERMISSION)[],
  ) {
    return permissions.reduce((a, b) => {
      return a && (permbit & PERMISSION[b]) > 0;
    }, true);
  }

  public static isUserHasPermissionOr(
    permbit: number,
    permissions: (keyof typeof PERMISSION)[][],
  ) {
    if (permbit & PERMISSION.SUPER_USER) return true;
    return permissions.length
      ? permissions.reduce(
          (a, b) => a || this.isUserHasPermissions(permbit, b),
          false,
        )
      : true;
  }
}
