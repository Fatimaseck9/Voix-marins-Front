import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriquePlainteComponent } from './historique-plainte.component';

describe('HistoriquePlainteComponent', () => {
  let component: HistoriquePlainteComponent;
  let fixture: ComponentFixture<HistoriquePlainteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoriquePlainteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriquePlainteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
