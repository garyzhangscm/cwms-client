import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportPrinterComponent } from './printer.component';

describe('ReportPrinterComponent', () => {
  let component: ReportPrinterComponent;
  let fixture: ComponentFixture<ReportPrinterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportPrinterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPrinterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
