import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  // si tu API también manda fechas para productos, puedes habilitar esto:
  // createdAt?: string | number | Date;
  // updatedAt?: string | number | Date;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string | number | Date; // ← solo lectura, la asigna el backend
  updatedAt?: string | number | Date; // ← solo lectura, la asigna el backend
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private productsUrl = 'https://products-api-production-9ae2.up.railway.app/api/products';
  private categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private http: HttpClient) {}

  // --- Productos ---
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(catchError(this.handleError));
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, product).pipe(catchError(this.handleError));
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, product).pipe(catchError(this.handleError));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // --- Categorías ---
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(catchError(this.handleError));
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category).pipe(catchError(this.handleError));
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesUrl}/${id}`, category).pipe(catchError(this.handleError));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`).pipe(catchError(this.handleError));
  }

  // --- util ---
  private handleError = (error: any) =>
    throwError(() => new Error(`${error?.status ?? ''} ${error?.statusText ?? 'Request error'}`.trim()));
}
