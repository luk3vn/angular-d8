angular-d8
==========

An Angular 4 project for Drupal 8 RESTful Web Services.

> This plugin is under development!!!

## Features
- Connect / Login / Logout / Register
- User (entity) - Create / Retrieve / Update / Delete
- Node (entity) - Create / Retrieve / Update / Delete

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
    this.drupal.userLogin(username, password).then(
      account => {
        ...
      }
    ).catch(
      error => {
        ...
      }
    );
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
    this.drupal.entityLoad('node', 1).then(
      node => {
        this.title = node.label();
      }
    );
  }

}
```

## How to...

####  create new node

```TypeScript
const node = this.drupal.Node();
node.setTitle('Test node');
node.setType('page');
node.save(); // Returns with Promise.
```

####  retrieve a node

```TypeScript
this.drupal.entityLoad('node', 1).then(
  node => {
    ...
  }
);
```

####  update a node

```TypeScript
this.drupal.entityLoad('node', 1).then(
  node => {
    node.setTitle('New title');
    node.save(); // Returns with Promise.
  }
);
```

####  delete a node

```TypeScript
this.drupal.entityLoad('node', 1).then(
  node => {
    node.delete(); // Returns with Promise.
  }
);
```
