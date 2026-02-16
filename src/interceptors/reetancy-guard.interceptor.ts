import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, finalize } from 'rxjs';

export class ReentrancyGuardInterceptor implements NestInterceptor {
  private onExecute = false;

  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    if (this.onExecute) {
      throw new ConflictException('Request already in progress');
    }

    this.onExecute = true;

    return next.handle().pipe(
      finalize(() => {
        // finalize() executes on both success and error
        this.onExecute = false;
      }),
    );
  }
}

// Option 1: Instance per decorator (current behavior)
export function NonReentrant() {
  return UseInterceptors(new ReentrancyGuardInterceptor());
}

// Option 2: Shared instance for true global reentrancy protection
const sharedGuard = new ReentrancyGuardInterceptor();
export function NonReentrantGlobal() {
  return UseInterceptors(sharedGuard);
}

// Option 3: Per-class reentrancy protection
export function NonReentrantPerClass() {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    const guard = new ReentrancyGuardInterceptor();
    return class extends constructor {
      static readonly reentrancyGuard = guard;
    };
  };
}
