import { TestBed } from '@angular/core/testing';

import { JogoExternoService } from './jogo-externo-service';

describe('JogoExternoService', () => {
  let service: JogoExternoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JogoExternoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
