import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration.component';

describe('WorkTaskWorkTaskConfigurationComponent', () => {
  let component: WorkTaskWorkTaskConfigurationComponent;
  let fixture: ComponentFixture<WorkTaskWorkTaskConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTaskWorkTaskConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTaskWorkTaskConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
