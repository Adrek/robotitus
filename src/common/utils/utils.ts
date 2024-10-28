import * as dayjs from 'dayjs';

export class Utils {
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static timeNow(): string {
    return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
  }

  static log(value: string): string {
    const now = Utils.timeNow();
    return `${now} - ${value}`;
  }
}
