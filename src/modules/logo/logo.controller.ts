import { Controller, Get, Header, Param, Query, Res } from '@nestjs/common';
import { LogoService } from './logo.service';


@Controller('logo')
export class LogoController {
    constructor(private logoService: LogoService) {}
    @Get()
    @Header('content-type', 'image/png')
    async logo(@Query('uri') uri: string) {
        console.log("logo controller: uri:", uri);
        return await this.logoService.logo(uri);
    }
}
