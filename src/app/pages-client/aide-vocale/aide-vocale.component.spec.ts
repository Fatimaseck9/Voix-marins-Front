import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AideVocaleComponent } from './aide-vocale.component';

describe('AideVocaleComponent', () => {
  let component: AideVocaleComponent;
  let fixture: ComponentFixture<AideVocaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AideVocaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AideVocaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
