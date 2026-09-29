import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Renderer2, RendererFactory2, inject } from '@angular/core';

const THEME_KEY = 'mes-workspace-theme';
const DARK_STYLESHEET_ID = 'mes-workspace-dark-stylesheet';

@Injectable({ providedIn: 'root' })
export class MesThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  isDark = false;

  constructor() {
    if (this.isBrowser) {
      this.apply(this.document.defaultView?.localStorage.getItem(THEME_KEY) === 'dark');
    }
  }

  toggle(): void {
    this.apply(!this.isDark);
  }

  private apply(isDark: boolean): void {
    this.isDark = isDark;
    const body = this.document.body;
    this.renderer.setAttribute(body, 'data-theme', isDark ? 'dark' : 'default');

    const existingStylesheet = this.document.getElementById(DARK_STYLESHEET_ID);
    if (existingStylesheet) {
      this.renderer.removeChild(body, existingStylesheet);
    }

    const storage = this.document.defaultView?.localStorage;
    if (isDark) {
      const stylesheet = this.renderer.createElement('link') as HTMLLinkElement;
      this.renderer.setAttribute(stylesheet, 'id', DARK_STYLESHEET_ID);
      this.renderer.setAttribute(stylesheet, 'rel', 'stylesheet');
      this.renderer.setAttribute(stylesheet, 'href', `${this.document.baseURI}assets/style.dark.css`);
      this.renderer.appendChild(body, stylesheet);
      storage?.setItem(THEME_KEY, 'dark');
    } else {
      storage?.removeItem(THEME_KEY);
    }
  }
}
