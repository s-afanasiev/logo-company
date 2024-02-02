import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogoModule } from './modules/logo/logo.module';
import { SvgToPngModule } from './modules/svg-to-png/svg-to-png.module';

@Module({
  imports: [LogoModule, SvgToPngModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
