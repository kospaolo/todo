import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
import {JwtPayload} from '../models/jwtPayload.model';
import {environment} from '../../environments/environment';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  isLoggedIn = signal<boolean>(!!localStorage.getItem(TOKEN_KEY));
  readonly apiUrl = `${environment.backendUrl}`;

  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  saveToken(token: string, remember = true) {
    if (remember) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
    this.isLoggedIn.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.isLoggedIn.set(false);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.username;
    } catch {
      return null;
    }
  }
}
