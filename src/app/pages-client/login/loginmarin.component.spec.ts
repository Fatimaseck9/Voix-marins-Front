import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginMarinComponent } from './loginmarin.component';


describe('LoginComponent', () => {
  let component: LoginMarinComponent;
  let fixture: ComponentFixture<LoginMarinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginMarinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginMarinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
