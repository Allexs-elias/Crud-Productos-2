import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSearchComponent } from './product-search.component';
import { ProductoCatalogo } from './productos';

describe('Catálogo: búsqueda y filtros combinados', () => {
  let c: ProductSearchComponent;
  let resultados: ProductoCatalogo[];
  let emisiones: number;
  let cancelar: () => void;
  beforeEach(() => {
    vi.useFakeTimers(); c = new ProductSearchComponent(); emisiones = 0;
    const sub = c.resultados$.subscribe(r => { resultados = r; emisiones++; });
    cancelar = () => sub.unsubscribe();
  });
  afterEach(() => { cancelar(); vi.useRealTimers(); });
  it('01: muestra los 20 productos al inicio', () => expect(resultados.length).toBe(20));
  it('02: busca silla después de 350 ms, sin filtrar antes', () => {
    c.busqueda.setValue('silla'); vi.advanceTimersByTime(349);
    expect(resultados.length).toBe(20); vi.advanceTimersByTime(1);
    expect(resultados.map(p => p.nombre)).toEqual(['Silla Nórdica']);
  });
  it('03: Tecnología devuelve cuatro productos', () => {
    c.categoria.setValue('Tecnología'); expect(resultados.length).toBe(4);
    expect(resultados.every(p => p.categoria === 'Tecnología')).toBe(true);
  });
  it('04: rango inclusivo de 300 a 600 devuelve seis', () => {
    c.minimo.setValue(300); c.maximo.setValue(600);
    expect(resultados.map(p => p.id)).toEqual([7, 8, 11, 17, 18, 20]);
  });
  it('05: nombre, categoría y precio se aplican juntos', () => {
    c.busqueda.setValue('lampara'); c.categoria.setValue('Hogar');
    c.minimo.setValue(600); c.maximo.setValue(800); vi.advanceTimersByTime(350);
    expect(resultados.map(p => p.nombre)).toEqual(['Lámpara Aura']);
  });
  it('06: una búsqueda inexistente devuelve cero', () => {
    c.busqueda.setValue('xyz'); vi.advanceTimersByTime(350); expect(resultados.length).toBe(0);
  });
  it('07: no repite emisiones para el mismo texto normalizado', () => {
    c.busqueda.setValue('lampara'); vi.advanceTimersByTime(350); const antes = emisiones;
    c.busqueda.setValue('  LÁMPARA  '); vi.advanceTimersByTime(350); expect(emisiones).toBe(antes);
  });
  it('08: limpiar restaura los 20 productos', () => {
    c.categoria.setValue('Moda'); c.busqueda.setValue('gorra'); vi.advanceTimersByTime(350);
    c.limpiar(); vi.advanceTimersByTime(350); expect(resultados.length).toBe(20);
  });
  it('09: un rango invertido no muestra productos', () => {
    c.minimo.setValue(1000); c.maximo.setValue(500); expect(resultados.length).toBe(0);
  });
});

describe('Interfaz del catálogo', () => {
  it('muestra tarjetas, contador y el mensaje sin coincidencias', async () => {
    await TestBed.configureTestingModule({imports:[ProductSearchComponent]}).compileComponents();
    const fixture = TestBed.createComponent(ProductSearchComponent); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(20);
    expect(fixture.nativeElement.textContent).toContain('20 productos encontrados');
    fixture.componentInstance.categoria.setValue('Moda');
    fixture.componentInstance.maximo.setValue(0); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No encontramos coincidencias');
  });
});
