/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './entities/comment.entity';
import { Model } from 'mongoose';
import { PostsService } from '../posts/posts.service';
import { ValidateObjectID } from '../../common/utils/validate-object-id';
import { Request } from 'express';
import { UpdateCommentDto } from './dto/update-comment-dto';
import { PayloadTokenFormat } from 'src/interfaces/payload-token-format/payload-token-format.interface';

type Filters = {
  limit?: number,
  offset?: number
}

@Injectable()
export class CommentsService {

  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>, private readonly postService: PostsService) { }

  public async create(createCommentDto: CreateCommentDto, request: Request, postId: string) {
    try {
      const payload = request['user'] as PayloadTokenFormat;
      const comment = new this.commentModel({
        ...createCommentDto,
        post_id: postId,
        user_id: payload.id,
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        modified: false
      })

      const newComment = await comment.save();

      return newComment;
    } catch(err) {
      const error = err as Error
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async update(updateCommentDto: UpdateCommentDto, request: Request, commentId: string) {
    try {
      ValidateObjectID(commentId);
  
      const payload = request['user'] as PayloadTokenFormat;
  
      const comment = await this.commentModel.findOne({
        _id: commentId,
      });
  
      if (!comment) {
        throw new HttpException('Comentario no encontrado', HttpStatus.NOT_FOUND);
      }
  
      if (comment.user_id != payload.id) {
        throw new HttpException('No tienes permiso para editar este comentario', HttpStatus.FORBIDDEN);
      }
  
      comment.text = updateCommentDto.text!;
      comment.modified = true;
      await comment.save();
  
      return comment;
  
    } catch (err) {
      const error = err as Error
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async findAll(postId: string, filters: Filters) {
    ValidateObjectID(postId);

    const query = this.commentModel.find({ post_id: postId }).sort({ created_at: -1 });

    const total = await query.clone().countDocuments();

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.skip(filters.offset);
    }

    const comments = await query.exec();

    if(!comments || comments.length === 0) throw new HttpException('No se encontraron comentarios', HttpStatus.NOT_FOUND);

    return { total, comments };
  }
}
