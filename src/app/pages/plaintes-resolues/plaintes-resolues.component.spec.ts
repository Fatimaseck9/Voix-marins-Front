import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaintesResoluesComponent } from './plaintes-resolues.component';

describe('PlaintesResoluesComponent', () => {
  let component: PlaintesResoluesComponent;
  let fixture: ComponentFixture<PlaintesResoluesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaintesResoluesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaintesResoluesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
