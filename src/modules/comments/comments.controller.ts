import { Controller, Get, Post, Body, Param, Put, UseGuards, Req, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtGuard } from '../../guards/jwt/jwt.guard';
import type { Request } from 'express';
import { UpdateCommentDto } from './dto/update-comment-dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtGuard)
  @Post('/add/:postId')
  public addComment(@Req() request: Request, @Body() createCommentDto: CreateCommentDto, @Param('postId') postId: string ) {
    return this.commentsService.create(createCommentDto, request, postId);
  }

  @UseGuards(JwtGuard)
  @Put('/update/:commentId')
  public updateComment(@Req() request: Request, @Body() updateCommentDto: UpdateCommentDto, @Param('commentId') commentId: string) {
    return this.commentsService.update(updateCommentDto, request, commentId);
  }

  @UseGuards(JwtGuard)
  @Get(':postId')
  public findAllComments(
    @Param('postId') postId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.commentsService.findAll(postId, { limit, offset });
  }

}
