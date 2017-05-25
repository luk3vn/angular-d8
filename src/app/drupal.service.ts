import {InjectionToken, Injectable, Inject} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Promise} from 'es6-promise';
import {Observable} from 'rxjs/Rx';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export let SITE_PATH = new InjectionToken<string>('site.path');
export let BASE_PATH = new InjectionToken<string>('base.path');

@Injectable()
export class DrupalService {

  private authData = '';

  private csrfToken = '';

  private logoutToken = '';

  private currentUser: object;

  constructor(private http: Http,
              @Inject(SITE_PATH) private sitePath: string,
              @Inject(BASE_PATH) private basePath: string) {
    if (localStorage.getItem('authData')) {
      this.authData = localStorage.getItem('authData');
    }

    if (localStorage.getItem('csrfToken')) {
      this.csrfToken = localStorage.getItem('csrfToken');
    }

    if (localStorage.getItem('logoutToken')) {
      this.logoutToken = localStorage.getItem('logoutToken');
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

    const request = this.http.get(this.restPath() + 'rest/session/token')
      .map((response: Response) => {
        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            const data = JSON.parse(response['_body']);
            return data;
          }
        }
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

    return new Promise<any>((resolve, reject) => {
      request.subscribe(
        result => {
          resolve(result);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Connects to Drupal and sets the currentUser object.
   * @returns {any}
   */
  connect() {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + this.authData
    });

    const options = new RequestOptions({
      headers: headers,
      withCredentials: true
    });

    const request = this.http.get(this.restPath() + 'cm/connect?_format=json', options)
      .map((response: Response) => {
        let data = {};
        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            data = JSON.parse(response['_body']);
          }
        }
        return data;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

    return new Promise<any>(resolve => {
      request.subscribe(
        data => {
          if (typeof data['uid'] !== 'undefined' && data['uid'] > 0) {
            this.userLoad(data['uid']).then(
              account => {
                this.setCurrentUser(account);
                resolve(this.getCurrentUser());
              }
            ).catch(error => {
              this.setCurrentUser(this.getDefaultUser());
              resolve(this.getCurrentUser());
            });
          } else {
            this.setCurrentUser(this.getDefaultUser());
            resolve(this.getCurrentUser());
          }
        },
        error => {
          this.setCurrentUser(this.getDefaultUser());
          resolve(this.getCurrentUser());
        },
      );
    });
  }

  /**
   * Logs into Drupal.
   * @param {string} name
   * @param {string} pass
   * @returns {Observable<R|T>}
   */
  userLogin(name: string, pass: string) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const request = this.http.post(this.restPath() + 'user/login?_format=json', {name: name, pass: pass}, options)
      .map((response: Response) => {
        let result = {};

        if (response.status === 200) {
          if (typeof response['_body'] !== 'undefined') {
            result = JSON.parse(response['_body']);
          }

          if (typeof result['csrf_token'] !== 'undefined') {
            this.csrfToken = result['csrf_token'];
            localStorage.setItem('csrfToken', this.csrfToken);
          }

          if (typeof result['logout_token'] !== 'undefined') {
            this.logoutToken = result['logout_token'];
            localStorage.setItem('logoutToken', this.logoutToken);
          }

          if (typeof result['current_user'] !== 'undefined' && result['current_user']['uid'] > 0) {
            this.authData = btoa(name + ':' + pass);
            localStorage.setItem('authData', this.authData);
          }
        }

        return result;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

    return new Promise<any>((resolve, reject) => {
      request.subscribe(
        result => {
          resolve(result);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Logs out of Drupal, clears the currentUser object, then performs a connect() to properly set the currentUser
   * object.
   * @returns {Observable<R|T>}
   */
  userLogout() {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const request = this.http.get(this.restPath() + 'user/logout', options)
      .map((response: Response) => {
        return true;
      })
      .catch((error: any) => Observable.throw(error.json().message || 'Network Error'))
      .finally(() => {
        localStorage.removeItem('csrfToken');
        localStorage.removeItem('logoutToken');
        localStorage.removeItem('authData');
      });

    return new Promise<any>((resolve, reject) => {
      request.subscribe(
        result => {
          resolve(result);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Registers a new user.
   * @param {string} name
   * @param {string} pass
   * @param {string} mail
   * @returns {Observable<R|T>}
   */
  userRegister(name: string, pass: string, mail: string) {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });

    const options = new RequestOptions({
      headers: headers
    });

    const request = this.http.post(this.restPath() + 'user/register?_format=json', {
      name: name,
      pass: pass,
      mail: mail
    }, options)
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

    return new Promise<any>((resolve, reject) => {
      request.subscribe(
        result => {
          resolve(result);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(account: object) {
    this.currentUser = account;
  }

  getDefaultUser() {
    return this.User({
      uid: [{value: 0}],
      name: [{value: 'Anonymous'}],
      mail: [{value: ''}],
      roles: [{target_id: 'anonymous'}]
    });
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
   * @return {Promise<any>}
   */
  entityLoad(entityType: string, entityID: any) {
    switch (this.lcfirst(entityType)) {
      case 'user':
        return this.User(entityID).load();

      case 'node':
        return this.Node(entityID).load();
    }
  }

  /**
   * Returns a new base entity.
   * @param entityType
   * @param bundle
   * @param entityID
   * @return {*}
   * @constructor
   */
  Entity(entityType: string, bundle: string, entityID: any = null) {
    const that = this;

    return {
      entity: {},
      bundle: bundle,
      entityType: entityType,
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

      /**
       *
       * @return {Promise<any>}
       */
      load: function () {
        const headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + that.authData
        });

        const options = new RequestOptions({
          headers: headers
        });

        const request = that.http.get(that.restPath() + this.entityType + '/' + this.id() + '?_format=json', options)
          .map((response: Response) => {
            if (response.status === 200) {
              let _entity = {};
              if (typeof response['_body'] !== 'undefined') {
                _entity = JSON.parse(response['_body']);
              }
              this.entity = _entity;
            }
            return this;
          })
          .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

        return new Promise<any>((resolve, reject) => {
          request.subscribe(
            entity => {
              resolve(entity);
            },
            error => {
              reject(error);
            }
          );
        });
      },

      /**
       *
       * @return {Promise<any>}
       */
      save: function () {
        let request: any;
        let path: string;
        let method: string;

        if (this.isNew()) {
          path = that.restPath() + 'entity/' + this.entityType;
          method = 'POST';
        } else {
          path = that.restPath() + this.entityType + '/' + this.id();
          method = 'PATCH';
        }

        const headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + that.authData
        });

        const options = new RequestOptions({
          headers: headers,
          method: method,
          body: this.stringify()
        });

        if (this.isNew()) {
          request = that.http.post(path, this.stringify(), options);
        } else {
          request = that.http.patch(path, this.stringify(), options);
        }

        request.map((response: Response) => {
          if (
            (method === 'POST' && response.status === 201) ||
            (method === 'PATCH' && response.status === 204) ||
            response.status === 200
          ) {
            this.entity = JSON.parse(response['_body']);
            return this;
          }
        }).catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

        return new Promise<any>((resolve, reject) => {
          request.subscribe(
            entity => {
              resolve(entity);
            },
            error => {
              reject(error);
            }
          );
        });
      },

      /**
       *
       * @return {Promise<any>}
       */
      delete: function () {
        const data = {};

        data[this.getEntityKey('bundle')] = [{
          target_id: this.getBundle()
        }];

        const headers = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + that.authData
        });

        const options = new RequestOptions({
          headers: headers,
          body: data
        });

        const request = that.http.delete(that.restPath() + this.entityType + '/' + this.id(), options)
          .map((response: Response) => {
            if (response.status === 204) {
              return true;
            }
          })
          .catch((error: any) => Observable.throw(error.json().message || 'Network Error'));

        return new Promise<any>((resolve, reject) => {
          request.subscribe(
            status => {
              resolve(status);
            },
            error => {
              reject(error);
            }
          );
        });
      }
    };
  }

  /**
   * Given a user id or JSON object, this Creates a new User object.
   * @param uid_or_account
   * @return {*}
   * @constructor
   */
  User(uid_or_account: any = null) {
    const ent = this.Entity('user', 'user', uid_or_account);

    const obj = {
      entityKeys: {
        type: 'user',
        bundle: 'user',
        id: 'uid',
        label: 'name'
      },

      getAccountName: function () {
        return this.label();
      },

      getRoles: function () {
        const roles = [];
        for (let i = 0; i < this.entity['roles'].length; i++) {
          roles.push(this.entity['roles'][i]['target_id']);
        }
        return roles;
      },

      hasRole: function (role: string) {
        return this.utils.inArray(role, this.getRoles());
      },

      isAnonymous: function () {
        return this.id() === 0;
      },

      isAuthenticated: function () {
        return !this.isAnonymous();
      }
    };

    const entity = Object.assign({}, ent, obj);

    if (typeof uid_or_account === 'object') {
      entity['entity'] = uid_or_account;
    } else {
      const id = entity['getEntityKey']('id');
      entity['entity'][id] = [{value: uid_or_account}];
    }

    return entity;
  }

  /**
   * Given a node id or JSON object, this Creates a new Node object.
   * @param nid_or_node
   * @return {*}
   * @constructor
   */
  Node(nid_or_node: any = null) {
    const ent = this.Entity('node', 'type', nid_or_node);

    const obj = {
      entityKeys: {
        type: 'node',
        bundle: 'type',
        id: 'nid',
        label: 'title'
      },

      getTitle: function () {
        return this.label();
      },

      setTitle: function (title: string) {
        try {
          this.entity['title'][0]['value'] = title;
        } catch (e) {
          console.log('Node.setTitle - ' + e);
        }
      },

      getType: function () {
        return this.getBundle();
      },

      setType: function (target_id: string, target_type: string = null) {
        try {
          this.entity['type'][0]['target_id'] = target_id;
          this.entity['type'][0]['target_type'] = target_type || 'node_type';
        } catch (e) {
          console.log('Node.setType - ' + e);
        }
      },

      getCreatedTime: function () {
        return this.entity.created[0].value;
      },

      isPromoted: function () {
        return this.entity.promote[0].value;
      },

      isPublished: function () {
        return this.entity.status[0].value;
      },

      isSticky: function () {
        return this.entity.sticky[0].value;
      }
    };

    const entity = Object.assign({}, ent, obj);

    if (!nid_or_node) {

    } else if (typeof nid_or_node === 'object') {
      entity['entity'] = nid_or_node;
    } else {
      const id = entity['getEntityKey']('id');
      entity['entity'][id] = [{value: nid_or_node}];
    }

    // Set default values.
    if (entity.entity) {
      if (!entity.entity.hasOwnProperty('title')) {
        entity.entity['title'] = [{value: ''}];
      }

      if (!entity.entity.hasOwnProperty('type')) {
        entity.entity['type'] = [{target_id: '', target_type: 'node_type'}];
      }
    }

    return entity;
  }

}
