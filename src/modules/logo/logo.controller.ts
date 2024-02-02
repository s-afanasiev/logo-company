import { Controller, Get, Param, Query } from '@nestjs/common';
import { LogoService } from './logo.service';


@Controller('logo')
export class LogoController {
    constructor(private logoService: LogoService) {}
    @Get()
    logo(@Query('uri') uri: string) {
        console.log("logo controller: uri:", uri);
        return this.logoService.logo(uri);
    }
}
