import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportPrinterTypeComponent } from './printer-type.component';

describe('ReportPrinterTypeComponent', () => {
  let component: ReportPrinterTypeComponent;
  let fixture: ComponentFixture<ReportPrinterTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPrinterTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPrinterTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
