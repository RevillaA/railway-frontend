import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private productsUrl = 'https://products-api-production-9ae2.up.railway.app/api/products';
  private categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(catchError(this.handleError));
  }

  getProductsPaged(page: number, size: number): Observable<{ items: Product[]; total: number }> {
    const params: any = { page, size };
    return this.http.get<any>(this.productsUrl, { params }).pipe(
      map(res => this.normalizeListResponse<Product>(res)),
      catchError(this.handleError)
    );
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

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(catchError(this.handleError));
  }

  getCategoriesPaged(page: number, size: number): Observable<{ items: Category[]; total: number }> {
    const params: any = { page, size };
    return this.http.get<any>(this.categoriesUrl, { params }).pipe(
      map(res => this.normalizeListResponse<Category>(res)),
      catchError(this.handleError)
    );
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

  private normalizeListResponse<T>(res: any): { items: T[]; total: number } {
    if (Array.isArray(res)) return { items: res, total: res.length };
    if (res?.content != null && typeof res?.totalElements === 'number') return { items: res.content as T[], total: res.totalElements };
    if (Array.isArray(res?.items) && typeof res?.total === 'number') return { items: res.items as T[], total: res.total };
    if (Array.isArray(res?.data) && typeof res?.total === 'number') return { items: res.data as T[], total: res.total };
    const items = Array.isArray(res?.data) ? (res.data as T[]) : (Array.isArray(res) ? (res as T[]) : []);
    return { items, total: items.length };
  }

  private handleError = (error: any) =>
    throwError(() => new Error(`${error?.status ?? ''} ${error?.statusText ?? 'Request error'}`.trim()));
}
