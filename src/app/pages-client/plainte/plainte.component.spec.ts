import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlainteComponent } from './plainte.component';

describe('PlainteComponent', () => {
  let component: PlainteComponent;
  let fixture: ComponentFixture<PlainteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlainteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlainteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
