import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsStructuresComponent } from './details-structures.component';

describe('DetailsStructuresComponent', () => {
  let component: DetailsStructuresComponent;
  let fixture: ComponentFixture<DetailsStructuresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsStructuresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsStructuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
