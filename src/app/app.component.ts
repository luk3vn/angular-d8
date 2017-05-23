import {Component} from '@angular/core';

import {DrupalService} from './drupal.service';

@Component({
  selector: 'app-root',
  template: '{{ title }}'
})
export class AppComponent {
  title = 'app works!';

  constructor(private drupal: DrupalService) {
  }

}
