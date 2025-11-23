import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../posts/entities/post.entity';
import { Comment ,CommentSchema } from '../comments/entities/comment.entity';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: Comment.name, schema: CommentSchema }
  ])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
