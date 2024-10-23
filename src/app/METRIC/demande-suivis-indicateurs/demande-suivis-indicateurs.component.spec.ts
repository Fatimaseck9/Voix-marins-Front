import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeSuivisIndicateursComponent } from './demande-suivis-indicateurs.component';

describe('DemandeSuivisIndicateursComponent', () => {
  let component: DemandeSuivisIndicateursComponent;
  let fixture: ComponentFixture<DemandeSuivisIndicateursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandeSuivisIndicateursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandeSuivisIndicateursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
