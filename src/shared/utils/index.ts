import * as dayjs from 'dayjs';
import axios from 'axios';

/**
 * 获取全国同步时间
 * @returns dayjs实例
 */
export async function getNationalTime(): Promise<dayjs.Dayjs> {
  try {
    // 调用国家授时中心API获取标准时间
    const response = await axios.get(
      'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp',
    );
    const timestamp = response.data.data.t;
    // 转换为dayjs实例并返回
    return dayjs(Number(timestamp));
  } catch (error) {
    // 如果API调用失败，返回本地时间
    console.error('获取国家授时失败，使用本地时间:', error);
    return dayjs();
  }
}
