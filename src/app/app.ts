import {
  Component,
  DestroyRef,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Producto,
  ProductosService
} from './productos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private servicio = inject(ProductosService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  productos = signal<Producto[]>([]);
  cargando = signal(false);
  guardando = signal(false);

  mensaje = signal('');
  error = signal('');
  idEdicion = signal<number | null>(null);

  formulario = this.fb.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/\S/)
      ]
    ],
    precio: [
      0,
      [Validators.required, Validators.min(0.01)]
    ],
    cantidad: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d+$/)
      ]
    ]
  });

  constructor() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.error.set('');

    this.servicio.obtenerProductos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: datos => {
          this.productos.set(datos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudieron cargar los productos. Revisa que la API esté encendida.'
          );
          this.cargando.set(false);
        }
      });
  }

  guardar() {
    if (this.guardando() || this.cargando()) return;

    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    const datos = this.formulario.getRawValue();

    const producto = {
      nombre: datos.nombre.trim(),
      precio: datos.precio,
      cantidad: datos.cantidad
    };

    if (producto.nombre.length < 3) {
      this.formulario.controls.nombre.setErrors({
        minlength: true
      });
      return;
    }

    const id = this.idEdicion();

    const peticion = id === null
      ? this.servicio.agregarProducto(producto)
      : this.servicio.actualizarProducto(id, producto);

    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mensaje.set(
            id === null
              ? 'Producto agregado correctamente.'
              : 'Producto actualizado correctamente.'
          );

          this.cancelarEdicion();
          this.cargarProductos();
        },
        error: () => {
          this.guardando.set(false);
          this.error.set(
            'No se pudo guardar el producto. Inténtalo de nuevo.'
          );
        }
      });
  }

  editar(producto: Producto) {
    this.idEdicion.set(producto.id);

    this.formulario.reset({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad
    });

    this.mensaje.set('');
    this.error.set('');
  }

  cancelarEdicion() {
    this.idEdicion.set(null);

    this.formulario.reset({
      nombre: '',
      precio: 0,
      cantidad: 0
    });
  }

  eliminar(producto: Producto) {
    if (this.guardando() || this.cargando()) return;

    const confirmar = window.confirm(
      `¿Quieres eliminar "${producto.nombre}"?`
    );

    if (!confirmar) return;

    this.guardando.set(true);
    this.mensaje.set('');
    this.error.set('');

    this.servicio.eliminarProducto(producto.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.mensaje.set(
            'Producto eliminado correctamente.'
          );

          if (this.idEdicion() === producto.id) {
            this.cancelarEdicion();
          }

          this.cargarProductos();
        },
        error: () => {
          this.guardando.set(false);
          this.error.set(
            'No se pudo eliminar el producto.'
          );
        }
      });
  }
}