import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiComponent } from './indicateurs.component';

describe('KpiComponent', () => {
  let component: KpiComponent;
  let fixture: ComponentFixture<KpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KpiComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
