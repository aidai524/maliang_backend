import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const delay = Date.now() - now;

          const { method, url } = request;

          this.logger.log(`${method} ${url} ${response.statusCode} - ${delay}ms`);

          if (response.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`Response body:`, response.body);
          }
        },
        error: (error) => {
          this.logger.error(`Request error:`, error.stack);
        },
      }),
    );
  }
}
