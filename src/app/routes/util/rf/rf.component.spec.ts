import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilRfComponent } from './rf.component';

describe('UtilRfComponent', () => {
  let component: UtilRfComponent;
  let fixture: ComponentFixture<UtilRfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilRfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilRfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
