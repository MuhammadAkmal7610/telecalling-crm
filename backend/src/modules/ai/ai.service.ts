import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not found. AI features will be disabled.');
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    if (!this.openai) return 'Transcription disabled (No API Key)';

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: await OpenAI.toFile(audioBuffer, 'audio.wav'),
        model: 'whisper-1',
      });
      return transcription.text;
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
      return 'Transcription failed';
    }
  }

  async summarizeText(text: string): Promise<string> {
    if (!this.openai) return 'Summarization disabled (No API Key)';

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for a CRM. Summarize the following conversation between an agent and a lead. Identify key points, lead interest level, and next steps.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });
      return response.choices[0].message.content || 'No summary generated';
    } catch (error) {
      this.logger.error('Error summarizing text:', error);
      return 'Summarization failed';
    }
  }

  async analyzeCall(audioBuffer: Buffer): Promise<{ transcription: string; summary: string }> {
    const transcription = await this.transcribeAudio(audioBuffer);
    const summary = await this.summarizeText(transcription);
    return { transcription, summary };
  }
}
