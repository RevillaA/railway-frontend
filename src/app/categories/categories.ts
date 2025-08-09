import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Category } from '../api.service';

declare const bootstrap: any;

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  @ViewChild('categoryModal') categoryModalRef!: ElementRef;
  private categoryModal!: any;

  categoryForm: FormGroup;

  private allCategories: Category[] = [];
  categories: Category[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  statusMsg = '';
  saveMsg = '';
  submitted = false;
  editingId: number | null = null;

  categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private fb: FormBuilder, private api: ApiService) {
    const NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ ]{3,60}$/;
    const DESC_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ ]{3,100}$/;

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern(NAME_REGEX)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(DESC_REGEX)]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.categoryModal = new bootstrap.Modal(this.categoryModalRef.nativeElement, { backdrop: 'static' });
  }

  hasError(ctrl: string, error: string) {
    const c = this.categoryForm.get(ctrl);
    return !!c && c.hasError(error) && (c.dirty || c.touched || this.submitted);
  }

  loadCategories() {
    this.statusMsg = 'Cargando...';
    this.api.getCategories().subscribe({
      next: (list) => {
        const data = Array.isArray(list) ? list : [];
        this.allCategories = data;
        this.total = data.length;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.applyPage();
        this.statusMsg = '<span class="ok">OK</span>';
      },
      error: (e) => { this.statusMsg = `<span class="err">Error: ${e.message}</span>`; }
    });
  }

  openNew() {
    this.editingId = null;
    this.saveMsg = '';
    this.submitted = false;
    this.categoryForm.reset({ name: '', description: '' });
    this.categoryModal.show();
  }

  openEdit(c: Category) {
    this.editingId = c.id ?? null;
    this.saveMsg = '';
    this.submitted = false;
    this.categoryForm.reset({ name: c.name, description: c.description ?? '' });
    this.categoryModal.show();
  }

  save() {
    this.submitted = true;
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const v = this.categoryForm.value;
    const payload: Category = {
      name: String(v.name ?? '').trim().replace(/\s+/g, ' '),
      description: String(v.description ?? '').trim().replace(/\s+/g, ' ')
    };

    if (this.editingId) {
      this.saveMsg = 'Actualizando...';
      this.api.updateCategory(this.editingId, payload).subscribe({
        next: () => { this.saveMsg = '<span class="ok">Actualizada ✔</span>'; this.categoryModal.hide(); this.loadCategories(); },
        error: (e) => this.saveMsg = `<span class="err">Error: ${e.message}</span>`
      });
    } else {
      this.saveMsg = 'Creando...';
      this.api.createCategory(payload).subscribe({
        next: () => { this.saveMsg = '<span class="ok">Creada ✔</span>'; this.categoryModal.hide(); this.loadCategories(); },
        error: (e) => this.saveMsg = `<span class="err">Error: ${e.message}</span>`
      });
    }
  }

  delete(id?: number) {
    if (!id) return;
    if (!confirm(`¿Eliminar categoría ${id}?`)) return;
    this.api.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (e) => alert(`Error: ${e.message}`)
    });
  }

  trackById = (_: number, it: any) => it?.id ?? it;

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.applyPage();
  }
  prevPage() { this.setPage(this.page - 1); }
  nextPage() { this.setPage(this.page + 1); }

  private applyPage() {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.categories = this.allCategories.slice(start, end);
  }
}
