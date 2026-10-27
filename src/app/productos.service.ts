import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);

  private url = 'http://localhost:3000/productos';

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  agregarProducto(
    producto: Omit<Producto, 'id'>
  ): Observable<Producto> {
    return this.http.post<Producto>(this.url, producto);
  }

  actualizarProducto(
    id: number,
    producto: Omit<Producto, 'id'>
  ): Observable<Producto> {
    return this.http.put<Producto>(
      `${this.url}/${id}`,
      producto
    );
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}