import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = 'http://localhost:3000/api/user';
  private http: HttpClient = inject(HttpClient);

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.post(`${this.api}/change-password`, { oldPassword, newPassword });
  }

  changeUsername(newUsername: string, password: string) {
    return this.http.put(`${this.api}/change-username`, { newUsername, password });
  }

  deleteAccount() {
    return this.http.delete(`${this.api}/delete-account`);
  }
}
