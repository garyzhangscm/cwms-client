import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTaskWorkTaskComponent } from './work-task.component';

describe('WorkTaskWorkTaskComponent', () => {
  let component: WorkTaskWorkTaskComponent;
  let fixture: ComponentFixture<WorkTaskWorkTaskComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTaskWorkTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTaskWorkTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
