import { Injectable } from '@nestjs/common';
import { SvgToPngService } from '../svg-to-png/svg-to-png.service';

@Injectable()
export class LogoService {
    constructor(
        private svgToPngService: SvgToPngService
    ){}
    async logo(uri: string) {
        console.log("logo service: uri:", uri);
        const png = await this.svgToPngService.run();
        return png;
    }
}
