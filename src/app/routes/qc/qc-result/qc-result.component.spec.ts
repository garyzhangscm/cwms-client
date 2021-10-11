import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcResultComponent } from './qc-result.component';

describe('QcQcResultComponent', () => {
  let component: QcQcResultComponent;
  let fixture: ComponentFixture<QcQcResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
