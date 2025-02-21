import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcInspectByRequestComponent } from './inspect-by-request.component';

describe('QcInspectByRequestComponent', () => {
  let component: QcInspectByRequestComponent;
  let fixture: ComponentFixture<QcInspectByRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcInspectByRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcInspectByRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
