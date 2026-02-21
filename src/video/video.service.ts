import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { exec } from 'child_process';
import { Video, VideoDocument } from './video.schema';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>
  ) {}

  async generateVideo(body: {
    text: string;
    language: string;
    voice: string;
    title: string;
    font: string;
  }) {
    return new Promise((resolve, reject) => {
      // Pass text and voice as arguments to python script
      const command = `python3 generate-audio.py "${body.text.replace(/"/g, '\\"')}" "${body.voice}"`;

      exec(command, { cwd: '/app' }, async (error, stdout, stderr) => {
        if (error) {
          console.error('Python error:', stderr);
          reject({ success: false, error: stderr });
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());

          // Save to MongoDB
          const video = new this.videoModel({
            title: body.title,
            text: body.text,
            language: body.language,
            voice: body.voice,
            font: body.font,
            duration: result.duration,
            audioUrl: result.audioUrl,
            words: result.words,
            status: 'generated',
          });
          await video.save();

          resolve({
            success: true,
            duration: result.duration,
            audioUrl: result.audioUrl,
            words: result.words,
            videoId: video._id,
          });
        } catch (e) {
          reject({ success: false, error: 'JSON parse error: ' + stdout });
        }
      });
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