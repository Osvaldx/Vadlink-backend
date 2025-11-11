import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors, Req, UploadedFile, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtGuard } from '../../guards/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

export type Likes = 'asc' | 'desc';
export type PostDate = 'asc' | 'desc';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File, @Body() createPostDto: CreatePostDto, @Req() request: Request) {
    return this.postsService.create(file, createPostDto, request);
  }

  @UseGuards(JwtGuard)
  @Get()
  findAll(
    @Query('username') username?: string,
    @Query('date') date?: PostDate,
    @Query('likes') likes?: Likes,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.postsService.findAll({ date, likes, username, limit, offset });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    return this.postsService.remove(id, request);
  }

  @UseGuards(JwtGuard)
  @Post('like/:id')
  like(@Param('id') id: string, @Req() request: Request) {
    return this.postsService.like(id, request);
  }

  @UseGuards(JwtGuard)
  @Post('removeLike/:id')
  removeLike(@Param('id') id: string, @Req() request: Request) {
    return this.postsService.removeLike(id, request);
  }
}
