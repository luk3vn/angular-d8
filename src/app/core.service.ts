import {InjectionToken, Injectable, Inject} from '@angular/core';

export let SITE_PATH = new InjectionToken<string>('site.path');
export let BASE_PATH = new InjectionToken<string>('base.path');

@Injectable()
export class CoreService {

  constructor(@Inject(SITE_PATH) private sitePath: string,
              @Inject(BASE_PATH) private basePath: string
  ) {
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

}
