/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['token'] as string;
    if(!token || token == '') throw new HttpException('Token no enviado', HttpStatus.UNAUTHORIZED);

    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY!) as jwt.JwtPayload;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if(decode.payload.rol === 'admin') {
        request['user'] = decode.payload;
        return true;
      }
      
      throw new HttpException('No estas autorizado', HttpStatus.UNAUTHORIZED);
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
