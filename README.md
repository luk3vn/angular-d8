# angular-d8

An Angular 4 project for Drupal 8 RESTful Web Services.

> This plugin is under development!!!

## Installing

Install `angular-d8` from `npm`
```bash
npm install --save lonalore/angular-d8
```

## Loading

### Angular-CLI

No need to set up anything, just import it in your code.

## Services

There are several services available:
- `CoreService` - contains shared functions
- `ModuleService` - contains module-specific functions
- `RestService` - contains a set of functions, which developers can perform requests and receive responses via HTTP protocol such as GET and POST

## Usage

### In your `app.module.ts` file

```TypeScript
...

import {CoreService, ModuleService, RestService} from 'angular-d8';
import {SITE_PATH, BASE_PATH} from 'angular-d8';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
  ],
  providers: [
    ...
    {provide: SITE_PATH, useValue: 'http://your-drupal-website.com'},
    {provide: BASE_PATH, useValue: '/'},
    CoreService,
    ModuleService,
    RestService,
    ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

### Then, for example in your authentication service 

```TypeScript
import {Injectable} from '@angular/core';

import {RestService} from 'angular-d8';

@Injectable()
export class AuthenticationService {

  constructor(private restService: RestService) {
  }

  login(username: string, password: string) {
    return this.restService.userLogin(username, password).subscribe(
      data => {
        ...
      },
      error => {
        ...
    });
  }

}
```

**with custom mapping function for Observer**

```TypeScript
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {RestService} from 'angular-d8';

@Injectable()
export class AuthenticationService {

  constructor(private restService: RestService) {
  }

  login(username: string, password: string) {
    return this.restService.requestUserLogin(username, password)
      .map((response) => {
        if (response.status === 200) {
          ...
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

}
```
