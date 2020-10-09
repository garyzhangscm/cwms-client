import { async, ComponentFixture, TestBed } from '@angular/core/testing';
  import {  as %= componentName %> } from './<%= dasherize(name) %>.component';

  describe('<%= componentName %>', () => {
    let component: <%= componentName %>;
    let fixture: ComponentFixture<<%= componentName %>>;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [  as %= componentName %> ]
      })
      .compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent( as %= componentName %>);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  