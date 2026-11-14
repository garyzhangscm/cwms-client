import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilQuickbookPermissionComponent } from './quickbook-permission.component';

describe('UtilQuickbookPermissionComponent', () => {
  let component: UtilQuickbookPermissionComponent;
  let fixture: ComponentFixture<UtilQuickbookPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilQuickbookPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilQuickbookPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
