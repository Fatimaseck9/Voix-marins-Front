import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivreMesPlaintesComponent } from './suivre-mes-plaintes.component';

describe('SuivreMesPlaintesComponent', () => {
  let component: SuivreMesPlaintesComponent;
  let fixture: ComponentFixture<SuivreMesPlaintesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivreMesPlaintesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuivreMesPlaintesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
