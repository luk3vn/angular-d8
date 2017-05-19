import {InjectionToken, Injectable, Inject} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export let SITE_PATH = new InjectionToken<string>('site.path');
export let BASE_PATH = new InjectionToken<string>('base.path');

@Injectable()
export class DrupalService {

  private modules: Array<String>;

  constructor(@Inject(SITE_PATH) private sitePath: string,
              @Inject(BASE_PATH) private basePath: string,
              private http: Http) {
  }

  restPath() {
    return this.sitePath + this.basePath;
  }

  path() {
    return this.restPath().substr(this.restPath().indexOf('://') + 3).replace('localhost', '');
  }

  isReady() {
    try {
      const ready = !this.isEmpty(this.sitePath);
      if (!ready) {
        console.log('sitePath not set');
      }
      return ready;
    } catch (error) {
      console.log('isReady - ' + error);
    }
  }

  isEmpty(value: any) {
    if (value !== null && typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
    return (typeof value === 'undefined' || value === null || value === '');
  }

  /**
   * Given a JS function name, this returns true if the function exists, false otherwise.
   * @param {String} name
   * @returns {boolean}
   */
  functionExists(name: string) {
    try {
      const func = eval('typeof ' + name);
      return (func === 'function');
    } catch (error) {
      alert('functionExists - ' + error);
    }
  }

  /**
   * Checks if the needle string, is in the haystack array. Returns true if it is found, false otherwise.
   * @param needle
   * @param haystack
   * @returns {boolean}
   */
  inArray(needle: any, haystack: any) {
    try {
      if (typeof haystack === 'undefined') {
        return false;
      }
      if (typeof needle === 'string') {
        return (haystack.indexOf(needle) > -1);
      } else {
        let found = false;
        for (let i = 0; i < haystack.length; i++) {
          if (haystack[i] === needle) {
            found = true;
            break;
          }
        }
        return found;
      }
    } catch (error) {
      console.log('inArray - ' + error);
    }
  }

  /**
   * Given something, this will return true if it's an array, false otherwise.
   * @param obj
   * @returns {boolean}
   */
  isArray(obj: object) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  /**
   * Given an argument, this will return true if it is an int, false otherwise.
   * @param n
   * @returns {boolean}
   */
  isInt(n: any) {
    if (typeof n === 'string') {
      n = parseInt(n, 0);
    }
    return typeof n === 'number' && n % 1 === 0;
  }

  /**
   * Checks if incoming variable is a Promise, returns true or false.
   * @param obj
   * @returns {boolean}
   */
  isPromise(obj: object) {
    return Promise.resolve(obj) === obj;
  }

  /**
   * Shuffle an array.
   * @param array
   * @returns {any}
   */
  shuffle(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  /**
   * Javascript equivalent of php's time() function.
   * @returns {number}
   */
  time() {
    const d: any = new Date();
    return Math.floor(d / 1000);
  }

  /**
   * Given a string, this will change the first character to lower case and return the new string.
   * @param str
   * @returns {string}
   */
  lcfirst(str: string) {
    str += '';
    const f = str.charAt(0).toLowerCase();
    return f + str.substr(1);
  }

  /**
   * Given a string, this will change the first character to upper case and return the new string.
   * @param str
   * @returns {string}
   */
  ucfirst(str: string) {
    str += '';
    const f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
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

  /**
   * Gets the X-CSRF-Token from Drupal.
   * @returns {Observable<R|T>}
   */
  token() {
    return this.requestToken()
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
   * @returns {Observable<R|T>}
   */
  connect() {
    return this.requestConnect()
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
   * @param name
   * @param pass
   * @returns {Observable<R|T>}
   */
  userLogin(name: string, pass: string) {
    return this.requestUserLogin(name, pass)
      .map((response: Response) => {
        if (response.status === 200) {
          const body = response.json();
          return body.data || body;
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Server error'));
  }

  /**
   * Gets the X-CSRF-Token from Drupal.
   * @returns {Observable<Response>}
   */
  requestToken() {
    return this.http.get(this.restPath() + 'rest/session/token');
  }

  /**
   * Connects to Drupal.
   * @returns {Observable<Response>}
   */
  requestConnect() {
    return this.http.get(this.restPath() + 'cm/connect?_format=json');
  }

  /**
   * Logs into Drupal.
   * @param name
   * @param pass
   * @returns {Observable<Response>}
   */
  requestUserLogin(name: string, pass: string) {
    return this.http.post(this.restPath() + 'user/login?_format=json', {name: name, pass: pass});
  }

}
