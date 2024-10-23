import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiDetailsComponent } from './details-kpi.component';

describe('KpiDetailsComponent', () => {
  let component: KpiDetailsComponent;
  let fixture: ComponentFixture<KpiDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KpiDetailsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
