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
            {
                $match: {
                    'post.isDeleted': { $ne: true },
                },
            },
            {
                $project: {
                    _id: 0,
                    postId: '$_id',
                    title: '$post.title',
                    postAuthorId: '$post.user_id',
                    postAuthorUsername: '$post.username',
                    commentsCount: 1,
                },
            },
            { $sort: { commentsCount: -1 } },
        ]);

        return { from: fromDate, to: toDate, data };
    }

}
