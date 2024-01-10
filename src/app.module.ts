import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhoisService } from './whois/whois.service';
import { WhoisController } from './whois/whois.controller';

@Module({
  imports: [],
  controllers: [AppController, WhoisController],
  providers: [AppService, WhoisService],
})
export class AppModule {}
