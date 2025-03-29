import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private auth = inject(AuthService);
  public router = inject(Router);
  private http = inject(HttpClient);
  private userService = inject(UserService);

  oldPassword = '';
  newPassword = '';
  passwordMessage = '';
  newUsername = '';
  usernamePassword = '';
  usernameMessage = '';

  get username(): string | null {
    return this.auth.getUsername();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/auth');
  }

  changePassword() {
    this.userService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordMessage = 'Password updated successfully.';
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: (err) => {
        this.passwordMessage = err?.error?.message || 'Failed to change password.';
      }
    });
  }

  changeUsername() {
    this.userService.changeUsername(this.newUsername, this.usernamePassword).subscribe({
      next: () => {
        this.usernameMessage = 'Username updated. Please log in again.';
        this.auth.logout();
        this.router.navigateByUrl('/auth');
      },
      error: (err) => {
        this.usernameMessage = err?.error?.message || 'Failed to change username';
      }
    });
  }

  confirmDelete() {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/auth');
      },
      error: () => {
        alert('Account deletion failed.');
      }
    });
  }
}
