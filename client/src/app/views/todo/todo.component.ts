import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CdkDragDrop, DragDropModule, moveItemInArray} from '@angular/cdk/drag-drop';
import {DatePipe} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {editFade, fadeSlide, todoAnim} from '../../animations/todo.animations';
import {Todo} from '../../models/todo.model';
import {TodoService} from '../../services/todo.service';
import {Filter} from '../../models/filter.model';
import {AuthService} from '../../services/auth.service';
import {loadTodos, saveTodos} from '../../utils/storage';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    DragDropModule,
    DatePipe,
    RouterOutlet
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
  animations: [todoAnim, editFade, fadeSlide],
})
export class TodoComponent implements OnInit {
  todos: WritableSignal<Todo[]> = signal<Todo[]>([]);
  newTodoText = '';
  newDueDate = '';
  private toDoService = inject(TodoService);
  filter = signal<Filter>('all');
  editingId = signal<string | null>(null);
  editableText = '';
  showFilters = signal(false);
  public authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const local = loadTodos();
    if (local.length) this.todos.set(local);

    this.loadToDos();
  }

  loadToDos() {
    const selectedFilter = this.filter();
    this.toDoService.getTodos(selectedFilter).subscribe((data) => {
      this.todos.set(data);
    });
  }

  addTodo(event: Event) {
    event.preventDefault();

    const text = this.newTodoText.trim();
    if (!text) return;

    this.toDoService.addTodo(text, this.newDueDate).subscribe((newToDo) => {
      this.todos.update((prev) => [...prev, newToDo]);
      saveTodos(this.todos());
      this.newTodoText = '';
      this.newDueDate = '';
    });
  }

  deleteTodo(id: string) {
    if(!id) return;

    this.toDoService.deleteTodo(id).subscribe(() => {
      this.todos.update((prev) => prev.filter(todo => todo._id !== id));
      saveTodos(this.todos());
    });
  }

  toggleDone(todo: Todo) {
    if(!todo) return;

    this.toDoService.toggleDone(todo._id, !todo.done).subscribe((updatedTodo) => {
      this.todos.update(prev => prev.map(t => t._id === updatedTodo._id ? updatedTodo : t));
      saveTodos(this.todos());
    });
  }

  setFilter(f: Filter) {
    this.filter.set(f);
    this.loadToDos();
  }

  markAllDone() {
    this.todos.update(prev => {
      const updated = prev.map(t => ({ ...t, done: true }));
      saveTodos(updated);
      return updated;
    });
  }

  clearCompleted() {
    this.todos.update(prev => {
      const updated = prev.filter(t => !t.done);
      saveTodos(updated);
      return updated;
    });
  }

  startEdit(todo: Todo) {
    this.editingId.set(todo._id);
    this.editableText = todo.text;
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editableText = '';
  }

  saveEdit(todo: Todo) {
    const updatedText = this.editableText.trim();
    if (!updatedText || updatedText === todo.text) {
      this.cancelEdit();
      return;
    }

    this.toDoService.toggleDone(todo._id, todo.done, updatedText).subscribe((updatedTodo) => {
      this.todos.update((prev) =>
        prev.map((t) => (t._id === updatedTodo._id ? updatedTodo : t))
      );
      saveTodos(this.todos());
      this.cancelEdit();
    });
  }

  drop(event: CdkDragDrop<Todo[]>) {
    const current = [...this.todos()];
    moveItemInArray(current, event.previousIndex, event.currentIndex);

    const reordered = current.map((todo, index) => ({ ...todo, order: index }));
    this.todos.set(reordered);
    saveTodos(reordered);

    const orderPayload = reordered.map(t => ({ id: t._id, order: t.order }));
    this.toDoService.reorderTodos(orderPayload).subscribe();
  }

  isOverdue(dateStr: string): boolean {
    const today = new Date();
    const due = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  dueCountdown(dateStr: string): string {
    const today = new Date();
    const due = new Date(dateStr);
    const diffTime = due.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (this.sameDay(today, due)) return 'today';
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} ago`;
    return '';
  }

  sameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  get username(): string | null {
    return this.authService.getUsername();
  }
}
