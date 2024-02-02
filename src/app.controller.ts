import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { readFile } from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getWelcome(): Promise<any> {
    return await this.readHtml();
  }
  readHtml(){
    return new Promise((resolve, reject)=>{
      readFile("./src/index.html", "utf8", (err, res)=>{
        if(err){
          reject(err);
        }
        //console.log("res=", res);
        resolve(res);
      });
    });
  }
}
