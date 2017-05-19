import { TestBed, inject } from '@angular/core/testing';

import { DrupalService } from './drupal.service';

describe('DrupalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DrupalService]
    });
  });

  it('should be created', inject([DrupalService], (service: DrupalService) => {
    expect(service).toBeTruthy();
  }));
});
