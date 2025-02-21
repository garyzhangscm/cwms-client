import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilQuickbookAuthComponent } from './quickbook-auth.component';

describe('UtilQuickbookAuthComponent', () => {
  let component: UtilQuickbookAuthComponent;
  let fixture: ComponentFixture<UtilQuickbookAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilQuickbookAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilQuickbookAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
