import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService, Product, Category } from '../api.service';
import { HttpClientModule } from '@angular/common/http';

declare const bootstrap: any; // usa el JS global de Bootstrap

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class ProductsComponent implements OnInit {
  @ViewChild('productModal') productModalRef!: ElementRef;
  private productModal!: any;
  Math = Math;
  productForm: FormGroup;
  private allProducts: Product[] = [];
  products: Product[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  categories: Category[] = [];
  statusMsg = '';
  saveMsg = '';
  submitted = false;
  editingId: number | null = null;

  productsUrl = 'https://products-api-production-9ae2.up.railway.app/api/products';
  categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private fb: FormBuilder, private api: ApiService) {
    // Regex: letras (incluye acentos y Ñ/ñ), números y espacios. SIN guiones.
    const NAME_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ ]{3,60}$/;
    const DESC_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ ]{3,100}$/;

    this.productForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
        Validators.pattern(NAME_REGEX)
      ]],
      // precio positivo > 0.1
      price: [0, [Validators.required, Validators.min(0.1)]],
      // categoría existente (required + custom validator)
      categoryId: ['', [Validators.required, this.categoryExistsValidator.bind(this)]],
      description: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(DESC_REGEX)
      ]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.productModal = new bootstrap.Modal(this.productModalRef.nativeElement, { backdrop: 'static' });
  }

  // Validador: la categoría debe existir en 'categories'
  private categoryExistsValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (val === null || val === undefined || val === '') return null; // que 'required' sea quien marque vacío
    const idNum = Number(val);
    const exists = this.categories.some(c => c.id === idNum);
    return exists ? null : { categoryInvalid: true };
  }

  // --- CRUD ---
  loadProducts() {
    this.statusMsg = 'Cargando...';
    this.api.getProducts().subscribe({
      next: (list) => {
        const data = Array.isArray(list) ? list : [];
        // ▼▼ NUEVO: configurar fuente y paginar ▼▼
        this.allProducts = data;
        this.total = data.length;
        this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
        this.applyPage();
        this.statusMsg = '<span class="ok">OK</span>';
      },
      error: (e) => { this.statusMsg = `<span class="err">Error: ${e.message}</span>`; }
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (cats) => {
        this.categories = Array.isArray(cats) ? cats : [];
        // revalida categoría cuando llegan los datos
        const ctrl = this.productForm.get('categoryId');
        ctrl?.updateValueAndValidity();
      },
      error: () => {}
    });
  }

  openNew() {
    this.editingId = null;
    this.submitted = false;
    this.saveMsg = '';
    this.productForm.reset({ name: '', price: 0, categoryId: '', description: '' });
    this.productModal.show();
  }

  openEdit(p: Product) {
    this.editingId = p.id ?? null;
    this.submitted = false;
    this.saveMsg = '';
    this.productForm.reset({
      name: p.name,
      price: p.price,
      categoryId: p.categoryId ?? '',
      description: p.description ?? ''
    });
    this.productModal.show();
  }

  save() {
    this.submitted = true;
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const v = this.productForm.value;

    // Normalizaciones:
    // - precio: reemplaza coma por punto y asegura número
    const priceNum = Number(String(v.price).toString().replace(',', '.'));
    // - strings: trim + compacta espacios
    const nameClean = String(v.name ?? '').trim().replace(/\s+/g, ' ');
    const descClean = String(v.description ?? '').trim().replace(/\s+/g, ' ');
    const categoryIdNum = parseInt(v.categoryId, 10);

    const payload: Product = {
      name: nameClean,
      price: priceNum,
      categoryId: categoryIdNum,
      description: descClean
    };

    if (this.editingId) {
      this.saveMsg = 'Actualizando...';
      this.api.updateProduct(this.editingId, payload).subscribe({
        next: () => { this.saveMsg = '<span class="ok">Actualizado ✔</span>'; this.productModal.hide(); this.loadProducts(); },
        error: (e) => this.saveMsg = `<span class="err">Error: ${e.message}</span>`
      });
    } else {
      this.saveMsg = 'Creando...';
      this.api.createProduct(payload).subscribe({
        next: () => { this.saveMsg = '<span class="ok">Creado ✔</span>'; this.productModal.hide(); this.loadProducts(); },
        error: (e) => this.saveMsg = `<span class="err">Error: ${e.message}</span>`
      });
    }
  }

  delete(id?: number) {
    if (!id) return;
    if (!confirm(`¿Eliminar producto ${id}?`)) return;
    this.api.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (e) => alert(`Error: ${e.message}`)
    });
  }

  // helpers
  getCategoryName(categoryId?: number): string {
    const c = this.categories.find(x => x.id === categoryId);
    return c ? c.name : '—';
  }

  trackById = (_: number, it: any) => it?.id ?? it;

  hasError(ctrl: string, error: string) {
    const c = this.productForm.get(ctrl);
    return !!c && c.hasError(error) && (c.dirty || c.touched || this.submitted);
  }

  // ▼▼ PAGINACIÓN (solo front) ▼▼
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
    this.products = this.allProducts.slice(start, end);
  }
}
