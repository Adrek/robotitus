import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async ping(): Promise<string> {
    return 'Service Ok!!!!';
  }
}
