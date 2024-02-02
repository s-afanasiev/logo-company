import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): string {
    const htmlForm = 
      `<html>
          <body>
            <div style="position:absolute; top:300px;left:500px;">
            <input type="text" id="name" name="name" required minlength="400" maxlength="500" size="100" />
            <button onClick="buttonClick()">go</button>
            </div>
            <script>
              function buttonClick() {
                const input = document.getElementById("name");
                let uri = input.value;
                const requestStr = "http://localhost:3000/logo?uri="+uri;
                console.log("sending: "+requestStr);
                fetch(requestStr).then(blb=>{
                  let link = window.URL.createObjectURL(blb);
                  window.open(link);
                });
              }
            </script>

          </body>
      </html>`
    return htmlForm;
  }
}
