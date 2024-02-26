import { Controller, Post, Body } from '@nestjs/common';
import { YuqueService } from './yuque.service';
import { YuqueConfig } from './typings';

@Controller('yuque')
export class YuqueController {
  constructor(private readonly yuqueService: YuqueService) {}

  @Post('export')
  exportDocs(@Body() config: YuqueConfig) {
    return this.yuqueService.exportDocs(config);
  }
}
