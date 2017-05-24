angular-d8
==========

An Angular 4 project for Drupal 8 RESTful Web Services.

> This plugin is under development!!!

## Features
- Connect
- User - Login / Logout / Load

## Installing

Install `angular-d8` from `npm`
```bash
npm install --save lonalore/angular-d8
```

## Loading

#### Angular-CLI

No need to set up anything, just import it in your code.

## Usage

#### Import (in your `app.module.ts` file)

```TypeScript
...

import {DrupalService, SITE_PATH, BASE_PATH} from 'angular-d8';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
  ],
  providers: [
    ...
    DrupalService,
    {provide: SITE_PATH, useValue: 'http://your-drupal-website.com'},
    {provide: BASE_PATH, useValue: '/'},
    ...
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

#### Service example 

```TypeScript
...

import {DrupalService} from 'angular-d8';

@Injectable()
export class AuthenticationService {

  constructor(private drupal: DrupalService) {
  }

  login(username: string, password: string) {
    return new Promise(resolve => {
      this.drupal.userLogin(username, password).subscribe(
        data => {
          resolve({status: true, message: ''});
        },
        error => {
          resolve({status: false, message: error});
      });
    });
  }

}
```

#### Component example

```TypeScript
...

import {DrupalService} from 'angular-d8';

@Component({
  selector: 'app-home',
  template: '<h1>{{ title }}</h1>'
})
export class HomeComponent implements OnInit {

  private title: string;

  constructor(private drupal: DrupalService) {
  }

  ngOnInit() {
    this.drupal.entityLoad('node', 1).subscribe(
      entity => {
        this.title = entity.label();
      }
    );
  }

}
```
