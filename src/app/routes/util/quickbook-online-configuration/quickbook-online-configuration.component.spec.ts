import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilQuickbookOnlineConfigurationComponent } from './quickbook-online-configuration.component';

describe('UtilQuickbookOnlineConfigurationComponent', () => {
  let component: UtilQuickbookOnlineConfigurationComponent;
  let fixture: ComponentFixture<UtilQuickbookOnlineConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilQuickbookOnlineConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilQuickbookOnlineConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
