/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    
    const token = request.cookies['token'] as string;

    if(!token || token == '') throw new HttpException('Token no enviado', HttpStatus.UNAUTHORIZED);

    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY!) as jwt.JwtPayload;
      request['user'] = {...decode.payload, exp: decode.exp};
      return true;
    } catch(error) {
      if(error instanceof TokenExpiredError) {
          throw new HttpException('Token Expirado', HttpStatus.UNAUTHORIZED);
      }
      
      if(error instanceof JsonWebTokenError) {
          throw new HttpException('Fallo la firma del token', HttpStatus.UNAUTHORIZED);
      }
    }

  throw new InternalServerErrorException();
  }
}
