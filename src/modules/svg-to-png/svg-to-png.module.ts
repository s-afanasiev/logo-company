import { Module } from '@nestjs/common';
import { SvgToPngService } from './svg-to-png.service';

@Module({
  providers: [SvgToPngService]
})
export class SvgToPngModule {}
