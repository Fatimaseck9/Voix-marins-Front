import { TestBed } from '@angular/core/testing';

import { PlainteService } from './plainte.service';

describe('PlainteService', () => {
  let service: PlainteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlainteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
