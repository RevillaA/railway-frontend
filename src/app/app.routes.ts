import { Routes } from '@angular/router';
import { ProductsComponent } from './products/products';
import { CategoriesComponent } from './categories/categories';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: '**', redirectTo: 'products' }
];