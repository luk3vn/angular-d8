import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {CoreService} from './core.service';

// Import RxJs required methods
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class RestService {

  constructor(private core: CoreService,
              private http: Http) {
  }

  /**
   * Gets the X-CSRF-Token from Drupal.
   * @returns {Observable<Response>}
   */
  token() {
    return this.http.get(this.core.restPath() + 'rest/session/token');
  }

  /**
   * Connects to Drupal.
   * @returns {Observable<Response>}
   */
  connect() {
    return this.http.get(this.core.restPath() + 'cm/connect?_format=json');
  }

  /**
   * Logs into Drupal.
   * @param name
   * @param pass
   * @returns {Observable<Response>}
   */
  userLogin(name: string, pass: string) {
    return this.http.post(this.core.restPath() + 'user/login?_format=json', {name: name, pass: pass});
  }

}
