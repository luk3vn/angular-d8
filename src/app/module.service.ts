import {Injectable} from '@angular/core';

import {CoreService} from './core.service';

@Injectable()
export class ModuleService {

  private modules: Array<String>;

  constructor(private core: CoreService) {
  }

  /**
   * Given a module name, this returns true if the module is enabled, false otherwise.
   * @param name
   * @returns {boolean}
   */
  moduleExists(name: string) {
    try {
      return typeof this.modules[name] !== 'undefined';
    } catch (error) {
      console.log('moduleExists - ' + error);
    }
  }

}
