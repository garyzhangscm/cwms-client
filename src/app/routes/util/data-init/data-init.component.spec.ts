import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilDataInitComponent } from './data-init.component';

describe('UtilDataInitComponent', () => {
  let component: UtilDataInitComponent;
  let fixture: ComponentFixture<UtilDataInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilDataInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilDataInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
