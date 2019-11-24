import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilTestDataInitComponent } from './test-data-init.component';

describe('UtilTestDataInitComponent', () => {
  let component: UtilTestDataInitComponent;
  let fixture: ComponentFixture<UtilTestDataInitComponent>;

  beforeEach(async(() => {
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
