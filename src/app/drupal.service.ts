import {InjectionToken, Injectable, Inject} from '@angular/core';
import {Http, Response, Headers, RequestOptions, Request, RequestMethod} from '@angular/http';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export let SITE_PATH = new InjectionToken<string>('site.path');
export let BASE_PATH = new InjectionToken<string>('base.path');

@Injectable()
export class DrupalService {

  private authData: string;

  private csrfToken: string;

  private logoutToken: string;

  private currentUser: object;

  constructor(private http: Http,
              @Inject(SITE_PATH) private sitePath: string,
              @Inject(BASE_PATH) private basePath: string) {
    if (localStorage.getItem('authData')) {
      this.authData = localStorage.getItem('authData');
    }
  }

  restPath() {
    return this.sitePath + this.basePath;
  }

  path() {
    return this.restPath().substr(this.restPath().indexOf('://') + 3).replace('localhost', '');
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
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(account: object) {
    this.currentUser = account;
  }

  getDefaultUser() {
    return {
      uid: 0,
      name: 'Anonymous',
      mail: '',
      role: ['anonymous']
    };
  }

  /**
   * Connects to Drupal and sets the currentUser object.
   * @returns {Observable<R|T>}
   */
  connect() {
    const headers = new Headers({
      'Authorization': 'Basic ' + this.authData
    });
    const options = new RequestOptions({headers: headers});

    return this.http.get(this.restPath() + 'cm/connect?_format=json', options)
      .map((response: Response) => {
        let data = {};

        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            data = JSON.parse(response['_body']);
          }

          if (typeof data['uid'] !== 'undefined' && data['uid'] > 0) {
            this.userLoad(data['uid']).subscribe(
              account => {
              },
              error => {
              }
            );
          } else {
            this.setCurrentUser(this.getDefaultUser());
          }
        }

        return data;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
  }

  /**
   * Logs into Drupal.
   * @param {string} name
   * @param {string} pass
   * @returns {Observable<R|T>}
   */
  userLogin(name: string, pass: string) {
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const options = new RequestOptions({headers: headers});

    return this.http.post(this.restPath() + 'user/login?_format=json', {name: name, pass: pass}, options)
      .map((response: Response) => {
        let result = {};

        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            result = JSON.parse(response['_body']);
          }

          if (typeof result['csrf_token'] !== 'undefined') {
            this.csrfToken = result['csrf_token'];
          }

          if (typeof result['logout_token'] !== 'undefined') {
            this.logoutToken = result['logout_token'];
          }

          if (typeof result['current_user'] !== 'undefined' && result['current_user']['uid'] > 0) {
            this.setCurrentUser(result['current_user']);
            this.authData = btoa(name + ':' + pass);

            // Save user to local storage.
            localStorage.setItem('authData', this.authData);
          }
        }

        return result;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
  }

  /**
   * Logs out of Drupal, clears the currentUser object, then performs a connect() to properly set the currentUser
   * object.
   * @returns {Observable<R|T>}
   */
  userLogout() {
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const options = new RequestOptions({headers: headers});

    return this.http.get(this.restPath() + 'user/logout', options)
      .map((response: Response) => {
        let result = {};

        if (response.status === 200 || response.status === 303) {
          if (typeof response['_body'] !== 'undefined') {
            result = JSON.parse(response['_body']);
          }

          // Remove user from local storage.
          localStorage.removeItem('authData');

          this.setCurrentUser(this.getDefaultUser());
          this.connect();
        }

        return result;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
  }

  /**
   * Registers a new user.
   * @param {string} name
   * @param {string} pass
   * @param {string} mail
   * @returns {any}
   */
  userRegister(name: string, pass: string, mail: string) {
    const headers = new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const options = new RequestOptions({headers: headers});

    return this.http.post(this.restPath() + 'user/register?_format=json', {name: name, pass: pass, mail: mail}, options)
      .map((response: Response) => {
        let result = {};

        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            result = JSON.parse(response['_body']);
          }

          this.connect();
        }

        return result;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
  }

  /**
   * Given a user id, this will attempt to load the account.
   * @param uid
   */
  userLoad(uid: number) {
    return this.entityLoad('user', uid);
  }

  /**
   * Given an entity type and id, this will attempt to load the entity.
   * @param entityType
   * @param entityID
   */
  entityLoad(entityType: string, entityID: any) {
    switch (entityType) {
      case 'user':
        return this.getUserEntity(entityID).load();
    }
  }

  getEntity(entityType: string, bundle: string, entityID: any) {
    const that = this;

    return {
      entity: {},
      bundle: bundle,
      entityType: entityType,
      entityID: entityID,
      entityKeys: {},

      get: function (prop: string, delta: number) {
        if (!this.entity || typeof this.entity[prop] === 'undefined') {
          return null;
        }
        return typeof delta !== 'undefined' ? this.entity[prop][delta] : this.entity[prop];
      },

      set: function (prop: string, delta: number, val: any) {
        if (this.entity) {
          if (typeof delta !== 'undefined' && typeof this.entity[prop] !== 'undefined') {
            this.entity[prop][delta] = val;
          } else {
            this.entity[prop] = val;
          }
        }
      },

      getEntityKey: function (key: string) {
        return typeof this.entityKeys[key] !== 'undefined' ? this.entityKeys[key] : null;
      },

      setEntityKey: function (key: string, val: any) {
        this.entityKeys[key] = val;
      },

      getEntityType: function () {
        return this.entityKeys['type'];
      },

      getBundle: function () {
        const b = this.getEntityKey('bundle');
        return typeof this.entity[b] !== 'undefined' ? this.entity[b][0]['target_id'] : null;
      },

      id: function () {
        const id = this.getEntityKey('id');
        return typeof this.entity[id] !== 'undefined' ? this.entity[id][0]['value'] : null;
      },

      language: function () {
        return this.entity['langcode'][0]['value'];
      },

      isNew: function () {
        return !this.id();
      },

      label: function () {
        const label = this.getEntityKey('label');
        return typeof this.entity[label] !== 'undefined' ? this.entity[label][0]['value'] : null;
      },

      stringify: function () {
        return JSON.stringify(this.entity);
      },

      load: function () {
        const headers = new Headers({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + that.authData
        });
        const options = new RequestOptions({headers: headers});

        return that.http.get(that.restPath() + this.entityType + '/' + this.entityID + '?_format=json', options)
          .map((response: Response) => {
            if (response.status === 200) {
              let _entity = {};

              if (typeof response['_body'] !== 'undefined') {
                _entity = JSON.parse(response['_body']);
              }

              this.entity = _entity;
            }
          })
          .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));
      }
    };
  }

  getUserEntity(uid: any) {
    const entity = this.getEntity('user', '', uid);

    entity['entityID'] = uid;

    // Set the entity keys.
    entity['entityKeys']['type'] = 'user';
    entity['entityKeys']['bundle'] = 'user';
    entity['entityKeys']['id'] = 'uid';
    entity['entityKeys']['label'] = 'name';

    entity['getAccountName'] = function () {
      return this.label();
    };

    entity['getRoles'] = function () {
      const roles = [];
      for (let i = 0; i < this.entity['roles'].length; i++) {
        roles.push(this.entity['roles'][i]['target_id']);
      }
      return roles;
    };

    entity['hasRole'] = function (role: string) {
      return this.utils.inArray(role, this.getRoles());
    };

    entity['isAnonymous'] = function () {
      return this.id() === 0;
    };

    entity['isAuthenticated'] = function () {
      return !this.isAnonymous();
    };

    return entity;
  }

}
