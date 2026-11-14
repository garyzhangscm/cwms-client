import { Component } from '@angular/core';
import { DockLiveComponent } from './dock-live.component';

@Component({
  standalone: true,
  imports: [DockLiveComponent],
  template: '<app-dock-live view="loads" />',
})
export class LoadBoardComponent {}
