import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, Observable, catchError, firstValueFrom } from 'rxjs';
import { getNationalTime } from '../../shared/utils';
import { AiRequestDto } from './dto/ai-request.dto';

@Injectable()
export class SparkService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getHello(): Promise<Date> {
    return (await getNationalTime()).toDate();
  }

  /**
   * 星火聊天
   * @param params 聊天参数
   * @returns 聊天结果
   */
  chat(params: SPARK.ChatParams) {
    const sparkApiUrl = this.configService.get<string>('SPARK_API_URL');
    const sparkApiKey = this.configService.get<string>('SPARK_API_KEY');
    if (!sparkApiUrl) {
      throw new Error('SPARK_API_URL is not defined');
    }
    if (!sparkApiKey) {
      throw new Error('SPARK_API_KEY is not defined');
    }
    const postData = this.transferChatPostData(params.text, params.steam);
    return this.httpService
      .post(sparkApiUrl, postData, {
        headers: {
          Authorization: `Bearer ${sparkApiKey}`,
          'Content-Type': 'application/json',
        },
      })
      .pipe(map((response) => response.data));
  }

  // 流式聊天
  streamChat(aiRequestDto: AiRequestDto): Observable<string> {
    return new Observable((subscriber) => {
      const runStream = async () => {
        const sparkApiUrl = this.configService.get<string>('SPARK_API_URL');
        const sparkApiKey = this.configService.get<string>('SPARK_API_KEY');

        if (!sparkApiUrl) {
          throw new Error('SPARK_API_URL is not defined');
        }
        if (!sparkApiKey) {
          throw new Error('SPARK_API_KEY is not defined');
        }

        const stream = await firstValueFrom(
          this.httpService
            .post(
              sparkApiUrl,
              {
                model: '4.0Ultra',
                messages: aiRequestDto.messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 1000,
              },
              {
                headers: {
                  Authorization: `Bearer ${sparkApiKey}`,
                  Accept: 'text/event-stream',
                  'Content-Type': 'application/json',
                },
                responseType: 'stream',
              },
            )
            .pipe(
              catchError((error) => {
                subscriber.error(error);
                return [];
              }),
            ),
        );

        let fullContent = '';
        // console.log('stream.data', stream);
        const messages = stream.data.split('\n\n');
        console.log('messages', messages);
        for await (const chunk of stream.data) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            subscriber.next(content);
          }
        }

        // 流结束，可以在这里返回完整内容或任何额外信息
        subscriber.complete();
        return fullContent;
      };

      void runStream();
    });
  }

  /** 转换请求数据
   * @param text 文本
   * @param stream 是否流式输出
   */
  transferChatPostData(text: string, stream: boolean) {
    return {
      model: '4.0Ultra',
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
      stream,
    };
  }
}
