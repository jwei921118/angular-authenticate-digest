import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// 组件
import { AppComponent } from './app.component';
// 服务
import { AuthenticateService } from './service/authenticateService';
import { ObservableService } from './service/observableService';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
