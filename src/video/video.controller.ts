import { Controller, Post, Get, Body } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('languages')
  getLanguages() {
    return this.videoService.getLanguages();
  }

  @Get('history')
  getHistory() {
    return this.videoService.getHistory();
  }

  @Post('generate')
  async generateVideo(
    @Body() body: {
      text: string;
      language: string;
      voice: string;
      title: string;
      font: string;
    },
  ) {
    return this.videoService.generateVideo(body);
  }

  @Post('render')
  async renderVideo() {
    return this.videoService.renderVideo();
  }
}