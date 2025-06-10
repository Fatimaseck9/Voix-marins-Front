import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMarinComponent } from './home-marin.component';

describe('HomeMarinComponent', () => {
  let component: HomeMarinComponent;
  let fixture: ComponentFixture<HomeMarinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMarinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMarinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
