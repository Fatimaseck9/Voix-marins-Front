import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppelerAnamComponent } from './appeler-anam.component';

describe('AppelerAnamComponent', () => {
  let component: AppelerAnamComponent;
  let fixture: ComponentFixture<AppelerAnamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppelerAnamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppelerAnamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
