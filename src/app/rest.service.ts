import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {CoreService} from './core.service';
import {ModuleService} from './module.service';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class RestService {

  constructor(private core: CoreService,
              private module: ModuleService,
              private http: Http) {
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
    return this.http.get(this.core.restPath() + 'rest/session/token');
  }

  /**
   * Connects to Drupal.
   * @returns {Observable<Response>}
   */
  requestConnect() {
    return this.http.get(this.core.restPath() + 'cm/connect?_format=json');
  }

  /**
   * Logs into Drupal.
   * @param name
   * @param pass
   * @returns {Observable<Response>}
   */
  requestUserLogin(name: string, pass: string) {
    return this.http.post(this.core.restPath() + 'user/login?_format=json', {name: name, pass: pass});
  }

}
