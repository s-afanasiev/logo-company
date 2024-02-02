import { Module } from '@nestjs/common';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';

@Module({
  providers: [LogoService],
  controllers: [LogoController]
})
export class LogoModule {}
