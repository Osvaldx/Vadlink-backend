/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './entities/post.entity';
import { Model } from 'mongoose';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { Likes, PostDate } from './posts.controller';
import { ValidateObjectID } from '../../common/utils/validate-object-id';
import { CommentsService } from '../comments/comments.service';

type Filters = {
  username?: string | null,
  date?: PostDate | null,
  likes?: Likes | null,
  limit?: number,
  offset?: number
}

@Injectable()
export class PostsService {

  constructor(@InjectModel(Post.name) private postModel: Model<Post>, private readonly cloudService: CloudinaryService, private readonly commentsService: CommentsService) { };

  // --------------------------------------------------------------------------------------- //
  async create(file: Express.Multer.File, createPostDto: CreatePostDto, request: Request) {
    const payload = request['user'];

    if(!createPostDto.user_id) {
      createPostDto.user_id = payload.id;
      createPostDto.username = payload.username;
    }
    
    if(file) {
      const extension = file.originalname.split('.').pop();
      if(extension && !['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        throw new BadRequestException('Formato de imagen invalido');
      }
      
      const uploadFile = await this.cloudService.uploadPost(file);
      createPostDto.url_img = uploadFile.secure_url;
      createPostDto.url_img_id = uploadFile.public_id;
    }

    const createdPost = new this.postModel(createPostDto);
    const result = await createdPost.save();

    await result.populate('user_id', 'firstName lastName avatar username');

    return result;
  }
  // --------------------------------------------------------------------------------------- //
    
  // --------------------------------------------------------------------------------------- //
  async findAll(filters: Filters, request: Request) {
    const query = this.postModel
    .find()
    .where('isDeleted')
    .equals(false)
    .populate('user_id', 'firstName lastName avatar username');

    const total = await query.clone().countDocuments();

    if(filters.username) {
      query.where('username').equals(filters.username);
    }

    if(filters.date) {
      query.sort({ created_at: (filters.date === 'asc') ? 'asc' : 'desc' });
    }

    if(filters.likes) {
      query.sort({ likes: (filters.likes === 'asc') ? 'asc' : 'desc' });
    }

    if(filters.limit) {
      query.limit(filters.limit);
    }

    if(filters.offset) {
      query.skip(filters.offset);
    }

    const payload = request['user'];
    const userId = payload.id;

    const postsDB = await query.exec();
    const posts = await Promise.all(
      postsDB.map(async post => {
        const commentsCount = await this.commentsService.countDocuments(post._id);
    
        return {
          ...post.toObject(),
          liked: post.likedBy.includes(userId),
          commentsCount
        };
      })
    );
    
    return { total, posts };
  }
  // --------------------------------------------------------------------------------------- //
    
  // --------------------------------------------------------------------------------------- //
  async remove(id: string, request: Request) {
    ValidateObjectID(id);

    const payload = request['user'];
    
    if(payload.rol != 'admin') {
      const post = await this.postModel.findById(id);
      if(post?.user_id != payload.id) {
        throw new BadRequestException('No puedes eliminar esta publicación');
      }
    }

    const result = await this.postModel.updateOne({ _id: id }, { isDeleted: true });

    if(result.modifiedCount > 0) {
      return { message: 'Publicación eliminada con exito!' };
    }

    return { message: 'No se encontro una publicación con ese ID' };
  }
  // --------------------------------------------------------------------------------------- //
  
  // --------------------------------------------------------------------------------------- //
  async like(id: string, request: Request) {
    ValidateObjectID(id);

    const post = await this.postModel.findById(id);
    
    if(!post) {
      throw new NotFoundException('No se encontro una publicación con ese ID');
    }

    const payload = request['user'];
    
    if(post.likedBy.includes(payload.id)) {
      throw new BadRequestException('Ya has likeado esta publicación');
    }

    post.likedBy.push(payload.id);
    post.likes = post.likes + 1;
    const result = await post.save();
    
    return { message: 'Se registro el like a la publicación', post_id: result._id };
  }
  // --------------------------------------------------------------------------------------- //
    
  // --------------------------------------------------------------------------------------- //
  async removeLike(id: string, request: Request) {
    ValidateObjectID(id);

    const post = await this.postModel.findById(id);

    if(!post) {
      throw new NotFoundException('No se encontro una publicación con ese ID');
    }

    const payload = request['user'];

    if(!post.likedBy.includes(payload.id)) {
      throw new BadRequestException('La publicación no tiene tu like');
    }
    
    post.likedBy = post.likedBy.filter(p => p._id != payload.id);
    post.likes = post.likes - 1;
    const result = await post.save();

    return { message: 'Se saco el like de la publicidad', post_id: result._id };
  }
  // --------------------------------------------------------------------------------------- //

  // --------------------------------------------------------------------------------------- //
  async findOnePost(id: string) {
    return this.postModel.findById(id).populate('user_id', 'firstName lastName avatar username');
  }
  // --------------------------------------------------------------------------------------- //
}
