import {Injectable} from '@angular/core';

import {CoreService} from './core.service';
import {ModuleService} from './module.service';
import {RestService} from './rest.service';

@Injectable()
export class DrupalService {

  constructor(public core: CoreService,
              public module: ModuleService,
              public rest: RestService) {
  }

}
