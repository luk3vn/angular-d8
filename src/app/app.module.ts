import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {AppComponent} from './app.component';

import {DrupalService, SITE_PATH, BASE_PATH} from './drupal.service';

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
    DrupalService,
    {provide: SITE_PATH, useValue: 'http://example.com'},
    {provide: BASE_PATH, useValue: '/'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
