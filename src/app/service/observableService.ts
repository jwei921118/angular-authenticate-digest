import {Injectable } from '@angular/core';
import { Http , Headers , Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
@Injectable()
export class ObservableService {
    constructor ( private http: Http ) {}
    public getData (url: string) {
        return this.http.get(url)
        .map(this.extractData)
        .catch(this.handleError);
    }

     // post
    public postData(url: string, param: any) {
        // let dataParam = new URLSearchParams();
        const headers = new Headers();
        console.log(param);
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, param , { headers: headers})
        .map(this.extractData)
        .catch(this.handleError);
    }


    public extractData(res: Response) {
        return res.json();   // 这个地方 你就是用jq用多了 jq自动帮忙把字符串JSON.parse()成了json 后台返回回来的多半是字符串
    }

    public handleError(error: any):Observable<any> {
        return Observable.throw(error.message || 'Server error');
    }
}
