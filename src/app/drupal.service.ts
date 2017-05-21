import {InjectionToken, Injectable, Inject} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {CoreService} from './core.service';

export let SITE_PATH = new InjectionToken<string>('site.path');
export let BASE_PATH = new InjectionToken<string>('base.path');

@Injectable()
export class DrupalService {

  private modules: Array<String>;

  constructor(@Inject(SITE_PATH) private sitePath: string,
              @Inject(BASE_PATH) private basePath: string,
              private http: Http,
              private core: CoreService) {
  }

  restPath() {
    return this.sitePath + this.basePath;
  }

  path() {
    return this.restPath().substr(this.restPath().indexOf('://') + 3).replace('localhost', '');
  }

  isEmpty(value: any) {
    return this.core.isEmpty(value);
  }

  /**
   * Given a JS function name, this returns true if the function exists, false otherwise.
   * @param {String} name
   * @returns {boolean}
   */
  functionExists(name: string) {
    return this.core.functionExists(name);
  }

  /**
   * Checks if the needle string, is in the haystack array. Returns true if it is found, false otherwise.
   * @param needle
   * @param haystack
   * @returns {boolean}
   */
  inArray(needle: any, haystack: any) {
    return this.core.inArray(needle, haystack);
  }

  /**
   * Given something, this will return true if it's an array, false otherwise.
   * @param obj
   * @returns {boolean}
   */
  isArray(obj: object) {
    return this.core.isArray(obj);
  }

  /**
   * Given an argument, this will return true if it is an int, false otherwise.
   * @param n
   * @returns {boolean}
   */
  isInt(n: any) {
    return this.core.isInt(n);
  }

  /**
   * Checks if incoming variable is a Promise, returns true or false.
   * @param obj
   * @returns {boolean}
   */
  isPromise(obj: object) {
    return this.core.isPromise(obj);
  }

  /**
   * Shuffle an array.
   * @param array
   * @returns {any}
   */
  shuffle(array: any) {
    return this.core.shuffle(array);
  }

  /**
   * Javascript equivalent of php's time() function.
   * @returns {number}
   */
  time() {
    return this.core.time();
  }

  /**
   * Given a string, this will change the first character to lower case and return the new string.
   * @param str
   * @returns {string}
   */
  lcfirst(str: string) {
    return this.core.lcfirst(str);
  }

  /**
   * Given a string, this will change the first character to upper case and return the new string.
   * @param str
   * @returns {string}
   */
  ucfirst(str: string) {
    return this.core.ucfirst(str);
  }

  /**
   * Gets the X-CSRF-Token from Drupal.
   * @param {boolean} mapping Set to false if you want to use your custom mapping function.
   * @returns {any}
   */
  token(mapping: boolean = true) {
    if (mapping === false) {
      return this.http.get(this.restPath() + 'rest/session/token');
    }

    return this.http.get(this.restPath() + 'rest/session/token')
      .map((response: Response) => {
        if (response.status === 200) {
          const body = response.json();
          return body.data || body;
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

  /**
   * Connects to Drupal and sets the currentUser object.
   * @param {boolean} mapping Set to false if you want to use your custom mapping function.
   * @returns {Observable<R|T>}
   */
  connect(mapping: boolean = true) {
    if (mapping === false) {
      return this.http.get(this.restPath() + 'cm/connect?_format=json');
    }

    return this.http.get(this.restPath() + 'cm/connect?_format=json')
      .map((response: Response) => {
        if (response.status === 200) {
          const body = response.json();
          return body.data || body;
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

  /**
   * Logs into Drupal.
   * @param {string} name
   * @param {string} pass
   * @param {boolean} mapping Set to false if you want to use your custom mapping function.
   * @returns {Observable<R|T>}
   */
  userLogin(name: string, pass: string, mapping: boolean = true) {
    if (mapping === false) {
      return this.http.post(this.restPath() + 'user/login?_format=json', {name: name, pass: pass});
    }

    return this.http.post(this.restPath() + 'user/login?_format=json', {name: name, pass: pass})
      .map((response: Response) => {
        if (response.status === 200) {
          const body = response.json();
          return body.data || body;
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

}
