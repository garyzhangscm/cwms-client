import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilRfConfigurationComponent } from './rf-configuration.component';

describe('UtilRfConfigurationComponent', () => {
  let component: UtilRfConfigurationComponent;
  let fixture: ComponentFixture<UtilRfConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilRfConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilRfConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
