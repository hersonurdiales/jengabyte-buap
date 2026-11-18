# Documentación de JengaByte en LaTeX

`jengabyte-especificacion.tex` reemplaza el alcance del backlog de gestión de actividades por una especificación para JengaByte BUAP: juego local educativo, interactivo y prioritariamente móvil. Las decisiones que requieren confirmación se señalan como propuestas o pendientes.

## Compilar

Desde esta carpeta, con una distribución LaTeX que incluya `latexmk`:

```sh
latexmk -pdf -interaction=nonstopmode -halt-on-error jengabyte-especificacion.tex
```

El documento intenta incluir el logotipo oficial desde `../../public/images/logo-buap.pdf`. Si ese archivo no existe, compila sin logo. El uso institucional del logotipo queda pendiente de autorización.

El PDF generado es `jengabyte-especificacion.pdf`.
