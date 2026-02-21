import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { exec } from 'child_process';
import * as fs from 'fs';
import { Video, VideoDocument } from './video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>
  ) {}

  private configPath = 'D:/avatar-explainer/config.json';
  private scriptDir = 'D:/avatar-explainer';

  async generateVideo(body: {
    text: string;
    language: string;
    voice: string;
    title: string;
    font: string;
  }) {
    // Update config.json
    const config = {
      text: body.text,
      language: body.language,
      voice: body.voice,
      title: body.title,
      font: body.font,
      fps: 30,
      width: 1920,
      height: 1080,
    };

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

    // Run python script
    return new Promise((resolve, reject) => {
      exec(
        'py generate-audio.py',
        { cwd: this.scriptDir },
        async (error, stdout, stderr) => {
          if (error) {
            reject({ success: false, error: stderr });
          } else {
            // Read duration from timestamps.json
            const timestamps = JSON.parse(
              fs.readFileSync('D:/avatar-explainer/public/timestamps.json', 'utf-8')
            );

            // Save to MongoDB
            const video = new this.videoModel({
              title: body.title,
              text: body.text,
              language: body.language,
              voice: body.voice,
              font: body.font,
              duration: timestamps.duration,
              status: 'generated',
            });
            await video.save();
            console.log('Video saved to MongoDB!');

            resolve({ success: true, message: stdout, videoId: video._id });
          }
        },
      );
    });
  }

  async renderVideo() {
    return new Promise((resolve, reject) => {
      exec(
        'npx remotion render ExplainerVideo output/explainer.mp4 --public-dir public',
        { cwd: this.scriptDir },
        (error, stdout, stderr) => {
          if (error) {
            reject({ success: false, error: stderr });
          } else {
            resolve({ success: true, message: 'MP4 rendered!' });
          }
        },
      );
    });
  }

  async getHistory() {
    return this.videoModel.find().sort({ createdAt: -1 }).exec();
  }

  getLanguages() {
    return [
      { label: 'Tamil', language: 'ta', voice: 'ta-IN-ValluvarNeural', font: 'Noto Sans Tamil' },
      { label: 'Hindi', language: 'hi', voice: 'hi-IN-MadhurNeural', font: 'Noto Sans Devanagari' },
      { label: 'English', language: 'en', voice: 'en-US-GuyNeural', font: 'sans-serif' },
      { label: 'Telugu', language: 'te', voice: 'te-IN-MohanNeural', font: 'Noto Sans Telugu' },
      { label: 'Malayalam', language: 'ml', voice: 'ml-IN-MidhunNeural', font: 'Noto Sans Malayalam' },
      { label: 'Arabic', language: 'ar', voice: 'ar-SA-HamedNeural', font: 'Noto Sans Arabic' },
    ];
  }
}