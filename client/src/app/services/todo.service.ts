import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Todo} from '../models/todo.model';
import {Filter} from '../models/filter.model';

@Injectable({providedIn: 'root'})
export class TodoService {
  private apiUrl = 'http://localhost:3000/api/todos';
  private http = inject(HttpClient);

  getTodos(filter: Filter): Observable<Todo[]> {
    const params = filter === 'all' ? {} : { params: { filter } };
    return this.http.get<Todo[]>(this.apiUrl, params);
  }

  addTodo(text: string, dueDate?: string): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, { text, dueDate });
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleDone(id: string, done: boolean, text?: string): Observable<Todo> {
    const body: any = { done };
    if (text !== undefined) body.text = text;
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, body);
  }

  reorderTodos(updatedOrder: { id: string; order: number }[]): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/reorder`, updatedOrder);
  }
}
