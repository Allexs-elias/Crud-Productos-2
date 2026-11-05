# Catálogo de productos con RxJS
Autor: Omar Alejandro Elias Banderas

## Abrir en Windows / VS Code
1. Extrae el ZIP. Entra en la carpeta interior `crud-productos` y ábrela en VS Code. Debes ver `package.json` y `angular.json`. Si estás en la carpeta exterior, ejecuta `cd .\crud-productos`.
2. En la terminal de esa carpeta ejecuta `npm ci`.
3. Ejecuta `npm start` y abre http://localhost:4200.
4. La pestaña Catálogo funciona sin encender json-server.
5. Para usar Administrar productos, abre otra terminal y ejecuta `npx json-server --watch db.json --port 3000`.

Si prefieres integrar los cambios en tu carpeta anterior, copia `src/app/product-search/`, `public/productos/`, `src/app/app.ts`, `src/app/app.html`, `src/app/app.css`, `src/app/app.spec.ts` y `src/styles.css`. Conserva una copia previa de tus cambios locales. El ZIP contiene el proyecto completo basado en la versión de GitHub.

## Qué hace el código
El componente `ProductSearchComponent` define cuatro controles reactivos. Los cambios del nombre pasan por `map()` para quitar espacios, mayúsculas y acentos; `debounceTime(350)` espera a que se deje de escribir; `distinctUntilChanged()` evita procesar otra vez el mismo nombre normalizado. `startWith()` permite mostrar resultados al inicio.

`combineLatest()` reúne nombre, categoría y precios. Un segundo `map()` filtra el arreglo de 20 productos y entrega la lista que muestra el HTML con `@for`. `AsyncPipe` mantiene la vista actualizada y libera la suscripción al destruirse el componente. Los límites de precio son inclusivos. Un rango invertido muestra una indicación y cero resultados.

El contador y el mensaje vacío se obtienen de la misma lista. Las imágenes son ilustraciones SVG locales, una por producto. El catálogo es un arreglo independiente de los registros del CRUD, conforme a la actividad. Los cambios del CRUD no modifican este arreglo.

## Validación
- `npm run build`: compilación de producción correcta.
- `npm test -- --watch=false`: 11 pruebas aprobadas.
- Evidencia de salida real: `evidencias/pruebas-automatizadas.txt`.
- No se incluyen capturas: este entorno no pudo iniciar un navegador. El registro contiene las 11 pruebas ejecutadas; puedes tomar las capturas con los pasos de la tabla.

## Pruebas para mostrar al docente
Limpia los filtros antes de cada caso.

| Prueba | Entrada | Resultado esperado |
|---|---|---|
| 1 | Sin filtros | 20 productos |
| 2 | Nombre: silla | 1: Silla Nórdica |
| 3 | Categoría: Tecnología | 4 productos |
| 4 | Desde 300, hasta 600 | 6 productos |
| 5 | Nombre: lampara; Hogar; desde 600 hasta 800 | 1: Lámpara Aura |
| 6 | Nombre: xyz | 0 productos y mensaje sin coincidencias |
| 7 | Buscar lampara y después escribir LÁMPARA con espacios | Se mantiene 1 resultado; la prueba automatizada verifica que no se emite de nuevo |
| 8 | Limpiar filtros | Vuelve a mostrar 20 productos |

Para repetir las capturas manualmente, espera al menos 350 ms tras escribir. Captura el buscador, los filtros, el contador y las tarjetas. Las pruebas automatizadas también verifican el rango invertido y la actualización del HTML.

## Diseño simplificado
Se usa Arial, fondo gris, botones azules, tarjetas con bordes y un título sencillo. Se conservan CSS Grid, diseño responsive y animación al pasar el cursor.
