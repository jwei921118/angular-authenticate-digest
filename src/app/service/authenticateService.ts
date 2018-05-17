import { Injectable } from '@angular/core';
import { Headers} from '@angular/http';
import { HttpErrorResponse } from '@angular/common/http';
import { ObservableService } from './observableService';
import { Md5 } from 'md5';
@Injectable()
export class AuthenticateService {

    public Authorization;
    public responseInfo;
    public response401;
    public headerValue;
    public cnonce;
    public NC;
    constructor (private observableService: ObservableService) {}

    public authenticate (data , uri , callback? , count? ) {
        const headers = new Headers();
        const url = 'http://' + data.ip + ':' + data.port + uri;
        if ( count > 0 ) {
            this.Authorization = this.generateAuthorizationHeader( this.responseInfo, this.response401, data , uri);
            console.log(this.Authorization);
            headers.append('Authorization', this.Authorization);
        }
        headers.append('Content-Type' , 'application/*JSON'); // 请求头根据后端需要自行变化
        this.observableService.postData(url , data)
        .subscribe(
            (res) => {
                callback(res);
            },
            (err: HttpErrorResponse) => {
                if (err.error instanceof Error ) {
                    console.log('an error occurred' , err.error.message);
                } else {
                    // 后端返回的错误
                    console.log(err);
                    const headersInfo = err.headers.get('WWW-Authenticate');
                    if (!headersInfo ) {
                        return;
                        // 没有返回头部的时候直接结束
                    } else {
                        this.headerValue = headersInfo;
                        const param = this.paramParse(headersInfo);
                        this.responseInfo = param;
                        const response = this.calulateResponse(data , param , url );
                        this.response401 = response;
                        count ++ ;
                        if (count < 3) {
                            this.authenticate(data , uri , callback , count);
                        }
                    }
                }
            }
        );
    }


    /**
     * 更具返回的头部信息自定义转换函数
     * @param str
     */
    private paramParse(str) {
        str = str.replace('Digest ', '');
        const arr = str.split(',');
        const params = {};
        arr.forEach((v, i) => {
          const index = v.indexOf('=');
          const key = v.substring(0, index);
          const value = v.substring(index + 2 , v.length - 1);
          params[key] = value;
        });
        return params;
      }


      /**
       * 根据返回的认证信息生成一个加密信息
       * @param data
       * @param param
       * @param uri
       */
      private calulateResponse(data , param, uri) {
        const a2 = 'POST' + ':' + uri;
        const a2Md5 = Md5.hashStr(a2);
        console.log(a2Md5);
        this.cnonce = (new GUID()).toString();
        const s = data.username + ':' + param['realm'] + ':' + data.password;
        const a1Md5 = Md5.hashStr(s);
        const HD = param['nonce'] + ':' + this.NC + ':' + this.cnonce + ':' + param['qop'];
        const digest = a1Md5 + ':' + HD + ':' + a2Md5;
        return Md5.hashStr(digest);
      }

      /**
       *
       * @param responseInfo
       * @param response
       * @param dIpPortInfo
       * @param uri
       */
      private generateAuthorizationHeader(responseInfo , response, data , uri) {
        return 'Digest' + ' '
        + 'username="' + data.username + '"'
        + ',realm="' + responseInfo.realm + '"'
        + ',qop="' + responseInfo.qop + '"'
        + ',nonce="' + responseInfo.nonce + '"'
        + ',opaque="' + responseInfo.opaque + '"'
        + ',uri="' + uri + '"'
        + ',response="' + response + '"'
        + ',nc=' + this.NC
        + ',cnonce="' + this.cnonce + '"';
      }

}

/**
 * 一定一个生成GUID 的类
 */
class GUID {
    private str: string;
    constructor(str?: string) {
        this.str = str || this.getNewGUIDString();
    }
    toString() {
        return this.str;
    }
    private getNewGUIDString() {
        let d = new Date().getTime();
        if (window.performance && typeof window.performance.now === 'function') {
            d += performance.now();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d/16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
  }
