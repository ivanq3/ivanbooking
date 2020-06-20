import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  private backButtonSub: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  ngOnInit() {}

  authenticate(email: string, password: string) {
    // tslint:disable-next-line: no-unused-expression
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          (resData) => {
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/places/tabs/discover');
          },
          (err) => {
            this.loadingCtrl.dismiss();
            const code = err.error.error.message;
            let message = 'Could not sign you up, please try again';
            if (code === 'EMAIL_EXISTS') {
              message = 'User with this email already exists!';
            } else if (code === 'EMAIL_NOT_FOUND') {
              // tslint:disable-next-line: quotemark
              message = "User with this e-mail address doesn't exist";
            } else if (code === 'INVALID_PASSWORD') {
              message = 'User and password combination is incorrect';
            }
            this.showAlert(message);
          }
        );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        // tslint:disable-next-line: object-literal-shorthand
        message: message,
        buttons: ['Okay'],
      })
      .then((alertEl) => alertEl.present());
  }

  ionViewDidEnter() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(
      0,
      () => {
        // tslint:disable-next-line: no-string-literal
        navigator['app'].exitApp();
      }
    );
  }

  ionViewWillLeave() {
    this.backButtonSub.unsubscribe();
  }
}
