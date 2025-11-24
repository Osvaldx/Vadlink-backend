import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Model } from 'mongoose';

type Range = {
    from?: string;
    to?: string 
};

@Injectable()
export class StatsService {
    
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    ) {}
    
    private buildDateRange(range: Range) {
        const { from, to } = range;
    
        const fromDate = from ? new Date(from) : new Date(0);
        const toDate = to ? new Date(to) : new Date();
    
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            throw new BadRequestException('Formato de fecha inválido (usar YYYY-MM-DD)');
        }
    
        return { fromDate, toDate };
    }
    
    async getPostsPerUser(range: Range) {
        const { fromDate, toDate } = this.buildDateRange(range);

        const data = await this.postModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    created_at: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $group: {
                    _id: '$user_id',
                    postsCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$user.username',
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    postsCount: 1,
                },
            },
            { $sort: { postsCount: -1 } },
        ]);

        return { from: fromDate, to: toDate, data, };
    }
    
    async getCommentsCount(range: Range) {
        const { fromDate, toDate } = this.buildDateRange(range);
    
        const totalComments = await this.commentModel.countDocuments({
            created_at: { $gte: fromDate, $lte: toDate },
        });
    
        return { from: fromDate, to: toDate, totalComments };
    }
    
    async getCommentsPerPost(range: Range) {
        const { fromDate, toDate } = this.buildDateRange(range);
    
        const data = await this.commentModel.aggregate([
            {
                $match: {
                    created_at: { $gte: fromDate, $lte: toDate },
                },
            },
            {
                $group: {
                    _id: '$post_id',
                    commentsCount: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'post',
                },
            },
            { $unwind: '$post' },
    
            // Filtrar por posts no eliminados
            { $match: { 'post.isDeleted': false } },
    
            // Lookup del autor real del post
            {
                $lookup: {
                    from: 'users',
                    localField: 'post.user_id',
                    foreignField: '_id',
                    as: 'author',
                },
            },
            { $unwind: '$author' },
    
            {
                $project: {
                    _id: 0,
                    postId: '$_id',
                    title: '$post.title',
                    commentsCount: 1,
                    postAuthorId: '$author._id',
                    postAuthorUsername: '$author.username',
                },
            },
            { $sort: { commentsCount: -1 } },
        ]);
    
        return { from: fromDate, to: toDate, data };
    }

    async getPostsTimeline(range: Range) {
        const { fromDate, toDate } = this.buildDateRange(range);
      
        const data = await this.postModel.aggregate([
          {
            $match: {
              isDeleted: false,
              created_at: { $gte: fromDate, $lte: toDate },
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              count: 1
            }
          }
        ]);
      
        return { from: fromDate, to: toDate, data };
    }

    async getCommentsTimeline(range: Range) {
        const { fromDate, toDate } = this.buildDateRange(range);
      
        const data = await this.commentModel.aggregate([
          {
            $match: {
              created_at: { $gte: fromDate, $lte: toDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              count: 1
            }
          }
        ]);
      
        return { from: fromDate, to: toDate, data };
    }

    async getPostsLikes(range: Range) {
      const { fromDate, toDate } = this.buildDateRange(range);
    
      const data = await this.postModel.aggregate([
        {
          $match: {
            isDeleted: false,
            created_at: { $gte: fromDate, $lte: toDate }
          }
        },
        {
          $project: {
            title: 1,
            likes: { $size: "$likedBy" }
          }
        },
        { $sort: { likes: -1 } }
      ]);
    
      return { from: fromDate, to: toDate, data };
    }

}
