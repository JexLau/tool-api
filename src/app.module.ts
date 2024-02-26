import { Module } from '@nestjs/common';
import { WhoisService } from './whois/whois.service';
import { WhoisController } from './whois/whois.controller';
import { PhoneService } from './phone/phone.service';
import { PhoneController } from './phone/phone.controller';
import { YuqueController } from './yuque/yuque.controller';
import { YuqueService } from './yuque/yuque.service';

@Module({
  imports: [],
  controllers: [WhoisController, PhoneController, YuqueController],
  providers: [WhoisService, PhoneService, YuqueService],
})
export class AppModule {}
