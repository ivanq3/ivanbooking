import { Component, OnInit, OnDestroy, RendererFactory2 } from '@angular/core';

import { Platform } from '@ionic/angular';
import { AuthService } from './auth/auth.service';
import { Plugins, Capacitor, AppState } from '@capacitor/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  private dark = false;
  renderer: any;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeApp();
  }

  addBodyClass(bodyClass) {
    this.renderer.addClass(document.body, bodyClass);
  }
  removeBodyClass(bodyClass) {
    this.renderer.removeClass(document.body, bodyClass);
  }

  onClick(dark: boolean) {
    if (dark) {
      this.addBodyClass('dark');
    } else {
      this.removeBodyClass('dark');
    }
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (!isAuth && this.previousAuthState !== isAuth) {
        this.router.navigateByUrl('/auth');
      }
      this.previousAuthState = isAuth;
    });
    Plugins.App.addListener(
      'appStateChange',
      this.checkAuthOnResume.bind(this)
    );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe((success) => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
