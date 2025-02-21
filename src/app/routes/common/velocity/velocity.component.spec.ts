import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonVelocityComponent } from './velocity.component';

describe('CommonVelocityComponent', () => {
  let component: CommonVelocityComponent;
  let fixture: ComponentFixture<CommonVelocityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonVelocityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonVelocityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
