import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema}]), CloudinaryModule, CommentsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService]
})
export class PostsModule {}
