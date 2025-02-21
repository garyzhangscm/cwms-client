import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderMpsComponent } from './mps.component';

describe('WorkOrderMpsComponent', () => {
  let component: WorkOrderMpsComponent;
  let fixture: ComponentFixture<WorkOrderMpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderMpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderMpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
