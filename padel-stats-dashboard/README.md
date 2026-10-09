# Fede Pádel Stats

Dashboard estático y responsive para visualizar partidos y torneos de pádel.

## Contenido

- KPIs: partidos, efectividad, racha y mejor compañero.
- Evolución mensual de volumen y porcentaje de victorias.
- Resultados, rendimiento por día, cancha y formato.
- Ranking de compañeros con mínimo configurable de partidos.
- Historial de torneos y títulos.
- Filtros por año, formato y cancha.

## Estructura

```text
padel-stats-dashboard/
├── index.html
├── styles.css
├── app.js
├── data/
│   ├── partidos.json
│   └── torneos.json
└── README.md
```

## Ejecutar localmente

El navegador no permite leer JSON locales abriendo `index.html` directamente. Levantá un servidor desde la carpeta:

```bash
python -m http.server 8080
```

Luego abrí `http://localhost:8080`.

También podés usar:

```bash
npx serve .
```

## Publicar en GitHub Pages

1. Subí todos los archivos a la raíz del repositorio.
2. En GitHub, abrí **Settings > Pages**.
3. Elegí **Deploy from a branch**.
4. Seleccioná la rama principal y la carpeta `/root`.
5. Guardá la configuración.

## Actualizar datos

Reemplazá `data/partidos.json` y `data/torneos.json` manteniendo los mismos nombres y campos. Los gráficos se recalculan automáticamente.

## Tecnología

HTML, CSS, JavaScript vanilla y Chart.js 4.5.1 desde CDN.
