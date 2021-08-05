import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilSystemConfigurationComponent } from './system-configuration.component';

describe('UtilSystemConfigurationComponent', () => {
  let component: UtilSystemConfigurationComponent;
  let fixture: ComponentFixture<UtilSystemConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilSystemConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilSystemConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
