import { Injectable } from "@nestjs/common";
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class FfmpegConfig {
    private static ffmpegConfigured = false;

    constructor() {
        if (!FfmpegConfig.ffmpegConfigured) {
            const ffmpegPath: string = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";
            const ffProbePath: string = process.env.FFPROBE_PATH || "/usr/bin/ffprobe";
            try {
                ffmpeg.setFfmpegPath(ffmpegPath);
                ffmpeg.setFfprobePath(ffProbePath);
                FfmpegConfig.ffmpegConfigured = true;
                console.log("FFMPEG initialized with:", ffmpegPath, ffProbePath);
            } catch (err) {
                console.error(`Failed to initialize ffmpeg:`, err);
            }
        }
    }
}