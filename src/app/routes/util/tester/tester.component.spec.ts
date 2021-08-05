import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UtilTesterComponent } from './tester.component';

describe('UtilTesterComponent', () => {
  let component: UtilTesterComponent;
  let fixture: ComponentFixture<UtilTesterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilTesterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
