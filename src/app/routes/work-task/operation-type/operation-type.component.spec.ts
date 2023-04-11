import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkTaskOperationTypeComponent } from './operation-type.component';

describe('WorkTaskOperationTypeComponent', () => {
  let component: WorkTaskOperationTypeComponent;
  let fixture: ComponentFixture<WorkTaskOperationTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkTaskOperationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkTaskOperationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
