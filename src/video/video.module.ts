import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }])],
  controllers: [VideoController],
  providers: [VideoService]
})
export class VideoModule { }
