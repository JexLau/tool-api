import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { WhoisService } from './whois.service';

@Controller()
export class WhoisController {
  constructor(private readonly whoisService: WhoisService) {}

  @Post('whois')
  async whoisQuery(@Body('domain') domain: string, @Res() response: Response) {
    if (!domain) {
      return response.status(400).json({ result: '输入值不正确' });
    }

    try {
      const result = await this.whoisService.query(domain);
      return response.json({ result: result, success: true, code: 200 });
    } catch (e) {
      return response.status(500).json({ result: e.message, code: 500 });
    }
  }
}
