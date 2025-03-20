import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { getNationalTime } from '../../shared/utils';
import { AiRequestDto } from './dto/ai-request.dto';

@Injectable()
export class SparkService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // 公共请求参数
  readonly publicReqParams = {
    model: '4.0Ultra',
    temperature: 0.7,
    max_tokens: 1000,
  };

  async getHello(): Promise<Date> {
    return (await getNationalTime()).toDate();
  }

  /**
   * 星火聊天
   * @param params 聊天参数
   * @returns 聊天结果
   */
  chat(aiRequestDto: AiRequestDto) {
    const sparkApiUrl = this.configService.get<string>('SPARK_API_URL');
    const sparkApiKey = this.configService.get<string>('SPARK_API_KEY');
    if (!sparkApiUrl) {
      throw new Error('SPARK_API_URL is not defined');
    }
    if (!sparkApiKey) {
      throw new Error('SPARK_API_KEY is not defined');
    }
    return this.httpService
      .post(
        sparkApiUrl,
        {
          model: '4.0Ultra',
          temperature: 0.7,
          max_tokens: 1000,
          messages: aiRequestDto.messages,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${sparkApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .pipe(map((response) => response.data.choices[0]));
  }

  // 流式聊天
  /**
   * 流式聊天接口
   * @param aiRequestDto 聊天请求参数
   * @returns Observable 流式响应
   */
  streamChat(aiRequestDto: AiRequestDto): Observable<any> {
    // 获取配置的API URL和密钥
    const sparkApiUrl = this.configService.get<string>('SPARK_API_URL');
    const sparkApiKey = this.configService.get<string>('SPARK_API_KEY');

    // 验证必要的配置参数
    if (!sparkApiUrl) {
      throw new Error('SPARK_API_URL is not defined');
    }
    if (!sparkApiKey) {
      throw new Error('SPARK_API_KEY is not defined');
    }

    // 创建并返回Observable
    return new Observable((observer) => {
      // 发起HTTP POST请求
      const subscription = this.httpService
        .post(
          sparkApiUrl,
          {
            model: '4.0Ultra',
            temperature: 0.7,
            max_tokens: 1000,
            messages: aiRequestDto.messages,
            stream: true,
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
        .subscribe({
          next: (response) => {
            console.log('response.request', response.request);
            // 获取事件流
            const eventStream = response.data;
            let buffer = '';

            // 处理数据块
            eventStream.on('data', (chunk) => {
              const chunkStr = chunk.toString();
              buffer += chunkStr;

              // 解析数据块中的事件
              while (buffer.includes('\n\n')) {
                const index = buffer.indexOf('\n\n');
                const eventData = buffer.substring(0, index);
                buffer = buffer.substring(index + 2);

                // 跳过空事件和ping事件
                if (
                  eventData.trim() === '' ||
                  eventData.includes('event: ping')
                ) {
                  continue;
                }

                // 解析事件数据
                const dataMatch = eventData.match(/^data: (.+)$/m);
                if (dataMatch && !dataMatch[1].includes('DONE')) {
                  try {
                    // 解析JSON数据
                    const data = JSON.parse(dataMatch[1]);
                    console.log('data', data);
                    // 提取内容
                    const content = data.choices?.[0]?.delta?.content || '';
                    if (content) {
                      observer.next({ content });
                    }
                    // 检查是否完成
                    if (data.choices?.[0]?.finish_reason === 'stop') {
                      observer.complete();
                    }
                  } catch (error) {
                    observer.error(new Error(`解析数据失败: ${error.message}`));
                  }
                }
              }
            });

            // 处理错误事件
            eventStream.on('error', (err) => {
              observer.error(err);
            });

            // 处理结束事件
            eventStream.on('end', () => {
              observer.complete();
            });
          },
          error: (error) => {
            observer.error(error);
          },
        });

      // 清理函数
      return () => {
        subscription.unsubscribe();
      };
    });
  }
}
