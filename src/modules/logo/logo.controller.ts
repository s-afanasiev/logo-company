import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { LogoService } from './logo.service';


@Controller('logo')
export class LogoController {
    constructor(private logoService: LogoService) {}
    @Get()
    async logo(@Query('uri') uri: string) {
        console.log("logo controller: uri:", uri);
        const png_in_u8 = await this.logoService.logo(uri);
        
        // var decoder = new TextDecoder('utf8');
        // var b64encoded = btoa(decoder.decode(png_in_u8));
        // console.log("b64encoded=", b64encoded);

        var b64 = Buffer.from(png_in_u8).toString('base64');
        //console.log("b64=", b64);
        return b64;
    }
}
