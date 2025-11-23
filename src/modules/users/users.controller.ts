import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../../guards/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(IsAdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @UseGuards(IsAdminGuard)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.create(createUserDto, file);
  }

  @UseGuards(IsAdminGuard)
  @Delete('/disable/:userId')
  disableUser(@Param('userId') userId: string) {
    return this.usersService.disableOrEnableUser(userId, true);
  }

  @UseGuards(IsAdminGuard)
  @Post('/enable/:userId')
  enableUser(@Param('userId') userId: string) {
    return this.usersService.disableOrEnableUser(userId, false);
  }

  @UseGuards(JwtGuard)
  @Post('/upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    return this.usersService.uploadAvatar(file, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
