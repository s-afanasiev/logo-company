import { Injectable } from '@nestjs/common';
import { svg2png, initialize } from 'svg2png-wasm';
import { readFile } from 'fs';

@Injectable()
export class SvgToPngService {
    constructor() {
        const wasmPath = './node_modules/svg2png-wasm/svg2png_wasm_bg.wasm';
        readFile(wasmPath, (err, res)=>{
          initialize(res);
        });
      }
    
    async run() {
        // await initialize(
        //   readFileSync('./node_modules/svg2png-wasm/svg2png_wasm_bg.wasm'),
        // );
      
        const testSvgData =
          `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 124 124" fill="none">
          <rect width="124" height="124" rx="24" fill="#F97316"/>
          <path d="M19.375 36.7818V100.625C19.375 102.834 21.1659 104.625 23.375 104.625H87.2181C90.7818 104.625 92.5664 100.316 90.0466 97.7966L26.2034 33.9534C23.6836 31.4336 19.375 33.2182 19.375 36.7818Z" fill="white"/>
          <circle cx="63.2109" cy="37.5391" r="18.1641" fill="black"/>
          <rect opacity="0.4" x="81.1328" y="80.7198" width="17.5687" height="17.3876" rx="4" transform="rotate(-45 81.1328 80.7198)" fill="#FDBA74"/>
          </svg>`;
        const svgOptions = {
          scale: 2, // optional
          width: 400, // optional
          height: 400, // optional
          backgroundColor: 'white', // optional
          fonts: [
            // optional
            //readFileSync('./Roboto.ttf'), // require, If you use text in svg
          ],
          defaultFontFamily: {
            // optional
            //sansSerif: 'Roboto',
          },
          }
        /** @type {Uint8Array} */
        const png = await svg2png(testSvgData, svgOptions);
        //@ https://stackoverflow.com/questions/73560446/send-a-uint8array-to-browser
        //@ let blb = new Blob([ png ], {type: 'application/pdf'})
        return png;
      }
}
