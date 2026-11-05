import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, map, shareReplay, startWith } from 'rxjs';
import { PRODUCTOS } from './productos';

export const normalizar = (texto: string) => texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
@Component({
  selector: 'app-product-search', standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyPipe],
  templateUrl: './product-search.component.html', styleUrl: './product-search.component.css'
})
export class ProductSearchComponent {
  readonly categorias = ['Todas', ...new Set(PRODUCTOS.map(p => p.categoria))];
  readonly busqueda = new FormControl('', { nonNullable: true });
  readonly categoria = new FormControl('Todas', { nonNullable: true });
  readonly minimo = new FormControl(0, { nonNullable: true });
  readonly maximo = new FormControl(4000, { nonNullable: true });
  // Normalizamos antes de comparar: espacios, mayúsculas y acentos no repiten búsquedas.
  readonly termino$ = this.busqueda.valueChanges.pipe(
    map(normalizar), debounceTime(350), distinctUntilChanged(), startWith('')
  );
  readonly resultados$ = combineLatest([
    this.termino$,
    this.categoria.valueChanges.pipe(startWith(this.categoria.value)),
    this.minimo.valueChanges.pipe(startWith(this.minimo.value)),
    this.maximo.valueChanges.pipe(startWith(this.maximo.value))
  ]).pipe(
    map(([texto, categoria, minimo, maximo]) => PRODUCTOS.filter(p =>
      normalizar(p.nombre).includes(texto) &&
      (categoria === 'Todas' || p.categoria === categoria) &&
      p.precio >= minimo && p.precio <= maximo
    )), shareReplay({ bufferSize: 1, refCount: true })
  );
  limpiar() {
    this.busqueda.setValue(''); this.categoria.setValue('Todas');
    this.minimo.setValue(0); this.maximo.setValue(4000);
  }
}
