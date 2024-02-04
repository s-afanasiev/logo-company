import { Injectable } from '@nestjs/common';
import { SvgToPngService } from '../svg-to-png/svg-to-png.service';
import * as http from 'http';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as util from 'util';


@Injectable()
export class LogoService {
    _defaultPageUrl = "https://1000.menu";
    _pageUrl;
    constructor(
        private svgToPngService: SvgToPngService
    ){}

    get pageUrl(){return this._pageUrl}
    set pageUrl(url){this._pageUrl = url;}

    async logo(pageUrl: string) {
        console.log("logo service: pageUrl:", pageUrl);
        if(pageUrl){
            this.pageUrl = pageUrl;
        } else {
            this.pageUrl = this._defaultPageUrl;
        }
        return await this._pngLogoOrStub();
    }

    async _pngLogoOrStub(){
        const page = await new DownloadedPage(this.pageUrl).run();
        this._saveLogFile("./log/currentPage.html", page.toString());
        
        const cheerioTool = await new CheerioTool(page, this.pageUrl).run();

        if (cheerioTool.isNothing) {return stumbImage;}
        else if (cheerioTool.imgSrc) {
            const imgSrc = cheerioTool.imgSrc;
            console.log("_pngLogoOrStub: imgSrc=", imgSrc)
            if(imgSrc.startsWith("data:image")){
                return imgSrc;
            }
            const uint8Png = await new DownloadedImage(imgSrc).run();
            return this._uint8ToBase64(uint8Png);
        }
        else if (cheerioTool.svgData) {
            this._saveLogFile("./log/currentSvgData.txt", cheerioTool.svgData);
            const uint8Png = await this.svgToPngService.run(cheerioTool.svgData);
            return this._uint8ToBase64(uint8Png);
        }

    }

    _saveLogFile(path, data) {
        fs.writeFile(path, data, ()=>{});
    }

    async _stumbImage() {
        fs.readFile('./nichego.jpeg',(err, res)=>{
            console.log("_stumbImage:", typeof res);
            fs.writeFile(
                './log/nichego.txt',
                Buffer.from(res).toString('base64'),
                ()=>{}
            );
        });
    }

    _uint8ToBase64(uint8png) {
        // let blb = new Blob([ uint8png ], {type: 'image/png'})

        // var decoder = new TextDecoder('utf8');
        // var b64encoded = btoa(decoder.decode(png_in_u8));
        // console.log("b64encoded=", b64encoded);
        var b64 = Buffer.from(uint8png).toString('base64');
        // let blb = new Blob([ b64 ], {type: 'image/png'})
        return "data:image/png;base64," + b64;
    }
}

class RequestedResourse {
    _defineHttpOrHttps(url: string) {
		let res;
		if (url.toString().indexOf("https") === 0) {
			res = https;
		} else {
            res = http;
        }
		return res;
	}
}

class DownloadedPage extends RequestedResourse{
    _uri: string;
	constructor(uri){
        super();
		this._uri = uri;
	}
	//@ encoding = 'binary'
	get encoding(){return 'utf8'};
	async run(){
		const httpClient = this._defineHttpOrHttps(this._uri);
		const page = await this._getPage2(httpClient);
		// console.log("DownloadedPage: page=", page);
		return page;
	}
	
	async _getPage(httpClient) {
		return new Promise((resolve, reject)=>{
			httpClient.get(this._uri, (response) => {
				console.log('content-type:', response.headers['content-type']);
				console.log('content-length:', response.headers['content-length']);
				var body = ''
				response.setEncoding(this.encoding);
				response
				  .on('error', function(err) {
					reject(err)
				  })
				  .on('data', function(chunk) {
					body += chunk;
				  })
				  .on('end', function() {
					resolve(body);
				  })
			});
		});
	}

    async _getPage2(httpClient){
        return new Promise((resolve, reject)=>{
            this._makeRequestWhileRedirecting(httpClient, this._uri, (err, response)=>{
                if(err) {
                    return reject(err);
                }
                var body = ''
                response.setEncoding(this.encoding);
                response
                .on('error', function(err) {
                reject(err)
                })
                .on('data', function(chunk) {
                body += chunk;
                })
                .on('end', function() {
                resolve(body);
                })
            });
        });
    }
    //@ 
    _makeRequestWhileRedirecting(httpClient, url, callback) {
        httpClient.get(url, (response) => {
            if (response.statusCode == 301) {
                const location = response.headers.location;
                let redirectUrl = location;
                if(!location.startsWith('http')){
                    redirectUrl = url + location;
                }
                console.log("redirectUrl=", redirectUrl);
                const httpClient = this._defineHttpOrHttps(redirectUrl);
                this._makeRequestWhileRedirecting(httpClient, redirectUrl, callback);
            } else {
                callback(null, response);
            }
        });
    }	
}

class DownloadedImage extends RequestedResourse {
    _url: string;
	constructor(url){
        super();
		this._url = url;
	}

    get url() {return this._url;}

    async run() {
        const httpProtocol = this._defineHttpOrHttps(this.url);
		const page = await this._getImageAsBuffer(httpProtocol);
		return page;
    }

    _getImageAsBuffer(httpProtocol){
        return new Promise((resolve, reject)=> {
            httpProtocol.get(this.url, function(response) {
                var data = Buffer.alloc(0);

                response.on('data', function(chunk) {
                    //@ chunk instanceof Buffer
                    //@ chunk instanceof Uint8Array
                    const list = [data, chunk];
                    const newbuff = Buffer.concat(list);
                    data = newbuff;
                });

                response.on('end', function() {
                    fs.writeFileSync('./log/imageBase64.txt', data.toString("base64"));
                    resolve(data);
                });
                }).end();
        });
    }
}

class CheerioTool {
    _htmlPage: string;
    _htmlUrl: string;
    _imgSrc: string;
    _svgData: any;
    _isNothing: boolean;
    $: cheerio.CheerioAPI;
    constructor(htmlPage, htmlUrl) {
        this._htmlPage = htmlPage;
        this._htmlUrl = htmlUrl;
    }

    get isNothing() {return this._isNothing;}
    set isNothing(is) {this._isNothing = is;}
    get imgSrc() {return this._imgSrc;}
    set imgSrc(data) {this._imgSrc = data;}
    get svgData() {return this._svgData;}
    set svgData(data) {this._svgData = data;}

    async run() {
        console.log("CheerioTool.run...", typeof this._htmlPage);
        await this._findLogoData();
        return this;
    }

    async _findLogoData() {
        this.$  = cheerio.load(this._htmlPage);
        //@ Элементы с меткой logo
        const logoTrace = this._traceLogoElements();
        if(!logoTrace) {
            this.isNothing = true;
            return console.log("NO LOGO ELEMENT!");    
        }
        const logoElem = logoTrace.elements[0];
        //@ 1. try to find tag image and his src attribute
        const imgSrc = this._findImgSrc(logoElem);
        console.log("_findLogoData: imgSrc=", imgSrc);
        if (imgSrc) {
            if(imgSrc.startsWith("data:image")){
                this.imgSrc = imgSrc;
            } else if(imgSrc.endsWith(".svg")){
                const svgD = await new DownloadedPage(imgSrc).run();
                // console.log("svgD=", svgD);
                this.svgData = svgD;
            } else {
                this.imgSrc = imgSrc;
            }
            return;
        }
        const svgData = this._findSvgData(logoElem);
        if (svgData) {
            //console.log("_findLogoData: svgData =", svgData);
            this.svgData = svgData;
            return;
        }
        const stringifiedElement = util.inspect(logoElem);
        fs.writeFileSync('./log/logoElement.js', stringifiedElement);
        console.log("_findLogoData: no SVG or IMG elements! Check in log folder");
    }

    _traceLogoElements() {
        let res;
        const logoClassElem = this.$('.logo');
        // const logoClassElem = this.$("[class='logo'][class^='logo']");
        if(logoClassElem.length > 0) {
            res = {
                findedBy: 'className',
                elements: logoClassElem
            }
        }else{
            const logoIdElem = this.$('#logo');
            // const logoIdElem = this.$("[id=logo][id^=logo]");
            if(logoIdElem.length > 0) {
                res = {
                    findedBy: 'Id',
                    elements: logoIdElem
                }
            }
        }
        //console.log("_traceLogoElements: ", res);
        return res;
    }

    _findSvgData(logoElement) {
        const svgTag = this._findElementByTagName("svg", logoElement);
        if(svgTag) {
            return this.$.html(svgTag);
        }
    }
    //@ logoElement - Элемент с классом logo, в котором будем искать вложенный тег img
    _findImgSrc(logoElement) {
        const imgTag = this._findElementByTagName("img", logoElement);
        // console.log("imgTag src=", this.$.html(imgTag));
        if(imgTag) {
            // return this.$(imgTag).attr('src');
            return this._imgSrcAttr(imgTag);
        }   
    }

    _imgSrcAttr(imgTag) {
        const src = this.$(imgTag).attr('src')
        //@ Если начинается на 'http' или 'https', то оставляем как есть
        if(src.startsWith('http')){
            return src;
        } else if (src.startsWith('//')) { 
            const protocol = this._htmlUrl.startsWith("https") ? "https" : "http";
            return protocol + ":" + src;
        } else if (src.startsWith('/')) { 
            //@ подразумевается относительная ссылка начинающаяся на "/"
            return this._htmlUrl + src;
        }else {
            //@ не трогаем. здесь можетбыть вариант начинащийся на "data:image..."
            return src;
        }
    }

    _findElementByTagName(tagName: string, searchArea: cheerio.Element) {
        //@ случай, если сам элемент с классом logo является же и тегом img или svg
        if(searchArea.name == tagName) {
            return searchArea;
        } else {
            const elem = this.$(searchArea).find(tagName);
            // const areaHtml = this.$.html(searchArea);
            // const $area  = cheerio.load(areaHtml);
            // console.log("tagName=",tagName);
            // const elem = $area(tagName);
            
            fs.writeFile('./log/'+tagName+'_findedImageElement.txt', util.inspect(elem), ()=>{});
            if(elem && elem[0]){
                return elem;
            } else if(elem && elem.length > 0){
                return elem[0];
            }
        }
    }
}

const stumbImage = "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zzzzzzzzzzzzzzzzzzzzzzzzzzzjDTDTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyzzzzzxxjTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyTzjwxxxzjxzTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjyzzzzzzzwjyjTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyzSBzzzzzzzzyjyzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwjhzzAzTzyQzzxjxTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzhzzzxzzTyxzxyBzxDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjxTzxiDzzzjThhDwzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyjzzzzzzzzzzyyjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyzTzzzzizzwTDzjyzjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyxTjzhTzjDDwixQjwzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwzjSzyxzzyhQzzzxzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyhTjSzzzzzwyyTyDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzSzTzzzzzyhzhzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxjRxTDTTwRzxzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxzjyxwxzyRzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzxxyzyxzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzTTTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzDTzzzzzzzzzzzwBQARCzAQDAhgyRzxBwjwDhDzDDCwDBDxDiiATgiASSgTjzzzzwjxQRiDTjAjTwTAzRjBAgySjTxCTzyjhzDBiTwAChxCCRBTzzzzzzzzzzzzzzzzzyzzzzzzzzzzzzzzzzzzzzzzxyxzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz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";