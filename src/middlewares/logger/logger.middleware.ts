import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    
    const { method, originalUrl, host } = req;
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      this.logger.log(`IP:${host} ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    })

    next();
  }
}
