import { Module } from '@nestjs/common';
import { WhoisService } from './whois/whois.service';
import { WhoisController } from './whois/whois.controller';
import { PhoneService } from './phone/phone.service';
import { PhoneController } from './phone/phone.controller';

@Module({
  imports: [],
  controllers: [WhoisController, PhoneController],
  providers: [WhoisService, PhoneService],
})
export class AppModule {}
