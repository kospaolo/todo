import {Component, signal, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);

  isLoginMode = signal(true);
  username = '';
  password = '';
  message = signal('');
  private router = inject(Router);
  confirmPassword = '';
  remember = false;
  loading = signal(false);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/');
    }
  }

  toggleMode() {
    this.isLoginMode.update((v) => !v);
    this.message.set('');
  }

  submit() {
    const { username, password, confirmPassword } = this;
    const isRegister = !this.isLoginMode();

    if (!username || !password || (isRegister && password !== confirmPassword)) {
      this.message.set(isRegister ? 'Passwords must match' : 'Enter username and password');
      return;
    }

    this.loading.set(true);
    const action = isRegister ? this.authService.register : this.authService.login;

    const handleLogin = () =>
      this.authService.login(username, password).subscribe({
        next: (res: any) => {
          this.authService.saveToken(res.token, this.remember);
          this.router.navigateByUrl('/');
          this.loading.set(false);
        },
        error: () => {
          this.message.set('Login failed.');
          this.loading.set(false);
        }
      });

    if (isRegister) {
      this.authService.register(username, password).subscribe({
        next: () => handleLogin(),
        error: () => {
          this.message.set('Registration failed.');
          this.loading.set(false);
        }
      });
    } else {
      handleLogin();
    }
  }
}
