import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundPickListComponent } from './pick-list.component';

describe('OutboundPickListComponent', () => {
  let component: OutboundPickListComponent;
  let fixture: ComponentFixture<OutboundPickListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundPickListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundPickListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
