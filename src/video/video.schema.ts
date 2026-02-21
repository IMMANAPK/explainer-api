import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema({ timestamps: true })
export class Video {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    voice: string;

    @Prop({ required: true })
    font: string;

    @Prop()
    duration: number;

    @Prop({ default: 'generated' })
    status: string;

    @Prop()
    audioUrl: string;

    @Prop({ type: Array })
    words: any[];
}

export const VideoSchema = SchemaFactory.createForClass(Video);