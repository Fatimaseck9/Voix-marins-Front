import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { METRICComponent } from './metric.component';

describe('METRICComponent', () => {
  let component: METRICComponent;
  let fixture: ComponentFixture<METRICComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ METRICComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(METRICComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
