import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UtilTestDataInitComponent } from './test-data-init.component';

describe('UtilTestDataInitComponent', () => {
  let component: UtilTestDataInitComponent;
  let fixture: ComponentFixture<UtilTestDataInitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilTestDataInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilTestDataInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
