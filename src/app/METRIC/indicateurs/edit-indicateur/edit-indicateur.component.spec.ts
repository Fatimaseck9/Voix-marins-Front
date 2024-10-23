import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIndicateurComponent } from './edit-indicateur.component';

describe('EditIndicateurComponent', () => {
  let component: EditIndicateurComponent;
  let fixture: ComponentFixture<EditIndicateurComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIndicateurComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditIndicateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
