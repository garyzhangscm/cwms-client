import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UtilIconListComponent } from './icon-list.component';

describe('UtilIconListComponent', () => {
  let component: UtilIconListComponent;
  let fixture: ComponentFixture<UtilIconListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilIconListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilIconListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
