import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Product, Category } from './api.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected title = 'railway-frontend';
  productForm: FormGroup;
  categoryForm: FormGroup;
  products: Product[] = [];
  categories: Category[] = [];
  productStatus: string = '';
  categoryStatus: string = '';
  productMessage: string = '';
  categoryMessage: string = '';
  productsUrl = 'https://products-api-production-9ae2.up.railway.app/api/products';
  categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      categoryId: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productStatus = 'Cargando...';
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = Array.isArray(products) ? products : [];
        this.productStatus = '<span class="ok">OK</span>';
      },
      error: (error) => {
        this.productStatus = `<span class="err">Error: ${error.message}</span>`;
      }
    });
  }

  createProduct() {
    if (this.productForm.invalid) return;
    this.productMessage = 'Enviando...';
    const product: Product = {
      name: this.productForm.value.name,
      price: parseFloat(this.productForm.value.price),
      categoryId: parseInt(this.productForm.value.categoryId, 10),
      description: this.productForm.value.description
    };
    this.apiService.createProduct(product).subscribe({
      next: () => {
        this.productMessage = '<span class="ok">Creado ✔</span>';
        this.productForm.reset();
        this.loadProducts();
      },
      error: (error) => {
        this.productMessage = `<span class="err">Error: ${error.message}</span>`;
      }
    });
  }

  deleteProduct(id: number) {
    if (!id || !confirm(`¿Eliminar producto ${id}?`)) return;
    this.apiService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (error) => alert(`Error: ${error.message}`)
    });
  }

  loadCategories() {
    this.categoryStatus = 'Cargando...';
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = Array.isArray(categories) ? categories : [];
        this.categoryStatus = '<span class="ok">OK</span>';
      },
      error: (error) => {
        this.categoryStatus = `<span class="err">Error: ${error.message}</span>`;
      }
    });
  }

  createCategory() {
    if (this.categoryForm.invalid) return;
    this.categoryMessage = 'Enviando...';
    const category: Category = this.categoryForm.value;
    this.apiService.createCategory(category).subscribe({
      next: () => {
        this.categoryMessage = '<span class="ok">Creada ✔</span>';
        this.categoryForm.reset();
        this.loadCategories();
      },
      error: (error) => {
        this.categoryMessage = `<span class="err">Error: ${error.message}</span>`;
      }
    });
  }

  deleteCategory(id: number) {
    if (!id || !confirm(`¿Eliminar categoría ${id}?`)) return;
    this.apiService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
        this.loadProducts();
      },
      error: (error) => alert(`Error: ${error.message}`)
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }
}