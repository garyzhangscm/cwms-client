import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilSystemControlledNumberComponent } from './system-controlled-number.component';

describe('UtilSystemControlledNumberComponent', () => {
  let component: UtilSystemControlledNumberComponent;
  let fixture: ComponentFixture<UtilSystemControlledNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilSystemControlledNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilSystemControlledNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
