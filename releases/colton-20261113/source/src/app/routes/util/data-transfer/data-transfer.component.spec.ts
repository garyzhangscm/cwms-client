import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilDataTransferComponent } from './data-transfer.component';

describe('UtilDataTransferComponent', () => {
  let component: UtilDataTransferComponent;
  let fixture: ComponentFixture<UtilDataTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilDataTransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilDataTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
