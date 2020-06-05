import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilTesterComponent } from './tester.component';

describe('UtilTesterComponent', () => {
  let component: UtilTesterComponent;
  let fixture: ComponentFixture<UtilTesterComponent>;

  beforeEach(async(() => {
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
