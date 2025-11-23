import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { IsAdminGuard } from 'src/guards/is-admin/is-admin.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(IsAdminGuard)
  @Get('users/posts')
  getPostsPerUser(@Query('from') from: string, @Query('to') to: string,) {
    return this.statsService.getPostsPerUser({ from, to });
  }

  @UseGuards(IsAdminGuard)
  @Get('comments')
  getCommentsCount(@Query('from') from: string, @Query('to') to: string,) {
    return this.statsService.getCommentsCount({ from, to });
  }
  
  @UseGuards(IsAdminGuard)
  @Get('posts/comments')
  getCommentsPerPost(@Query('from') from: string, @Query('to') to: string,) {
    return this.statsService.getCommentsPerPost({ from, to });
  }
}
