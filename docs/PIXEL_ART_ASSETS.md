# Sprites en pixel art (obra en construcción)

Los 16 personajes de `web/shared/sprites/*.png` se generaron con el CLI de
[Higgsfield](https://higgsfield.ai) (`higgsfield`/`hf`), instalado y autenticado en la
máquina de desarrollo. No hay build step ni dependencia en producción: son PNG estáticos
servidos como cualquier otro asset.

## Pipeline

1. **Imagen** — `recraft_v4_1` (Recraft V4.1), `--background_color null`. Aunque el
   parámetro no produce transparencia real (Recraft igual entrega fondo blanco sólido),
   sí produce el estilo pixel art más consistente de los modelos probados.
2. **Transparencia** — `image_background_remover` sobre el PNG descargado del paso 1.
   Verificar siempre con `im.getchannel('A').getbbox()` (Pillow) antes de dar por buena
   una corrida — un fondo "casi blanco" que no se limpia bien dejará un halo visible
   sobre el fondo real de la página.
3. **Recorte + resize** — recortar al bounding box del canal alfa (+6px de margen) y
   redimensionar a 280px de alto con Lanczos (no son sprites de grilla 1:1 real, son
   ilustraciones con estética pixel art — un resize `nearest` los deja peor, no mejor).

Costo real: ~2.5 créditos por personaje (imagen + remoción de fondo) en el plan starter
de Higgsfield. Los 16 personajes costaron ~45 créditos de 200 disponibles.

## Consistencia de estilo — la parte que falla sola

Cada generación es independiente: no hay "imagen de referencia del personaje" que se
reutilice entre corridas, así que el estilo puede desviarse (más blocky vs. más vector
suave, con o sin contorno negro grueso) de una a otra. En la corrida inicial, 3 de 16
salieron visiblemente distintas del resto (una casi monocromática, otra sin contorno
pixelado, otra con un tono de piel realista que ningún otro personaje tenía) y hubo que
regenerarlas con un prompt más explícito:

```
chunky retro 16-bit video game pixel art sprite, thick bold black pixel outlines,
flat saturated colors, hard pixelated blocky edges (not smooth, not vector, not
anti-aliased curves), plain flat pale/white round head with no realistic skin tone,
no background, isolated character
```

Ese bloque de estilo (`STYLE` en el prompt) es el que hay que anteponer a cualquier
personaje nuevo — no confiar en que "pixel art" solo en el prompt alcance.

**Nota deliberada sobre representación:** todas las cabezas son planas y neutras (blanco/
negro, sin tono de piel), no por limitación técnica sino a propósito — evita que un
personaje termine leyéndose como de una raza específica mientras el resto del elenco no.
Si se agrega un personaje nuevo, mantener esa misma convención.

## Agregar o reemplazar un personaje

1. Generar con el pipeline de arriba, revisando el resultado a ojo antes de aceptarlo
   (`Read` sobre el PNG descargado, o abrirlo en cualquier visor).
2. Guardar en `web/shared/sprites/<id>.png`.
3. Agregar la entrada en `SCENES` (`web/coming-soon.js`): `sprite`, `role`, y 4 líneas de
   diálogo distintas en `say`.
4. No hace falta tocar `coming-soon.css` — `.sprite{height:...;width:auto}` toma el alto
   fijo y calcula el ancho solo a partir de la relación de aspecto real del PNG.
