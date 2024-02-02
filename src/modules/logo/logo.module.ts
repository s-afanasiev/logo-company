import { Module } from '@nestjs/common';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';
import { SvgToPngModule } from '../svg-to-png/svg-to-png.module';

@Module({
  providers: [LogoService],
  controllers: [LogoController],
  imports: [SvgToPngModule]
})
export class LogoModule {}
