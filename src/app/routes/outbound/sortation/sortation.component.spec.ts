import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundSortationComponent } from './sortation.component';

describe('OutboundSortationComponent', () => {
  let component: OutboundSortationComponent;
  let fixture: ComponentFixture<OutboundSortationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundSortationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundSortationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
