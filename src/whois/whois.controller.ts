import {
  Controller,
  Post,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WhoisService } from './whois.service';

@Controller('whois')
export class WhoisController {
  constructor(private readonly whoisService: WhoisService) {}

  @Post()
  async whoisQuery(@Body('domain') domain: string) {
    if (!domain) {
      throw new BadRequestException({ result: '输入值不正确' });
    }

    try {
      const result = await this.whoisService.query(domain);
      return { result: result, success: true, code: 200 };
    } catch (e) {
      throw new InternalServerErrorException({ result: e.message });
    }
  }

  @Post('/batch')
  async whoisBatch(@Body('domains') domains: string[]) {
    if (!domains) {
      throw new BadRequestException({ result: '输入值不正确' });
    }

    try {
      const result = await this.whoisService.batchQuery(domains);
      return { result: result, success: true, code: 200 };
    } catch (e) {
      throw new InternalServerErrorException({ result: e.message });
    }
  }
}
