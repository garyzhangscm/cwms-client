import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkOrderWorkOrderCompleteByProductComponent } from './work-order-complete-by-product.component';

describe('WorkOrderWorkOrderCompleteByProductComponent', () => {
  let component: WorkOrderWorkOrderCompleteByProductComponent;
  let fixture: ComponentFixture<WorkOrderWorkOrderCompleteByProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkOrderWorkOrderCompleteByProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkOrderWorkOrderCompleteByProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
