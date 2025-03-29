import { Routes } from '@angular/router';
import {AuthComponent} from './views/auth/auth.component';
import {authGuard} from './guards/auth.guard';
import {TodoComponent} from './views/todo/todo.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', component: TodoComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
