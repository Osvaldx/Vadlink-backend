import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './entities/comment.entity';
import { Model } from 'mongoose';
import { PostsService } from '../posts/posts.service';
import { ValidateObjectID } from '../../common/utils/validate-object-id';

@Injectable()
export class CommentsService {

  constructor(@InjectModel(Comment.name) private commentModel: Model<Comment>, private readonly postService: PostsService) { }

  async create(postId: string, createCommentDto: CreateCommentDto) {
    ValidateObjectID(postId);
    
    const post = await this.postService.findOnePost(postId);
    
    if(!post) throw new HttpException('No se encontro una publicación con ese ID', HttpStatus.NOT_FOUND);
    
    const newComment = new this.commentModel({...createCommentDto, post_id: postId});
    const result = newComment.save();
    
    return result;
  }
  
  findAll(postId: string) {
    ValidateObjectID(postId);
    return this.commentModel.find().where('post_id').equals(postId);
  }

  remove(commentId: string) {
    return commentId;
  }
}
