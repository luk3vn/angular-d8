import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';
import {CoreService, SITE_PATH, BASE_PATH} from './core.service';
import {ModuleService} from './module.service';
import {RestService} from './rest.service';

import {DrupalService} from './drupal.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    {provide: SITE_PATH, useValue: 'http://example.com'},
    {provide: BASE_PATH, useValue: '/'},
    CoreService,
    ModuleService,
    RestService,
    DrupalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
