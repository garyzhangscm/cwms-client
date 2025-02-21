import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QcQcConfigurationComponent } from './qc-configuration.component';

describe('QcQcConfigurationComponent', () => {
  let component: QcQcConfigurationComponent;
  let fixture: ComponentFixture<QcQcConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QcQcConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QcQcConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
