import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

export interface Category {
  id?: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private productsUrl = 'https://products-api-production-9ae2.up.railway.app/api/products';
  private categoriesUrl = 'https://categories-api-production.up.railway.app/api/categories';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, product).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoriesUrl, category).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`).pipe(
      catchError(error => {
        return throwError(() => new Error(`${error.status} ${error.statusText}`));
      })
    );
  }
}