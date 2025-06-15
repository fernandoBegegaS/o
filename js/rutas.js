/* Clase Rutas sin elementos de estilo */
class Rutas {
  constructor () {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      document.write('<p>Este navegador soporta el API File.</p>');
    } else {
      document.write('<p>Este navegador NO soporta el API File y puede fallar.</p>');
    }

    $(document).on('click', 'main>nav a[data-idx]', e => {
      e.preventDefault();
      const idx  = $(e.currentTarget).data('idx');
      const $sec = $('main > article > section').eq(idx);
      if ($sec.length) $sec[0].scrollIntoView({ behavior: 'smooth' });
    });
  }

  limpiarMain () { $('main > article').remove(); }

  addError (index, text) {
    const $p = $('p:has(input)').eq(index);
    $p.find('span.err').remove();
    if (text) $p.find('input').after(`<span class="err">${text}</span>`);
  }

  readInputFileXML (files) {
    const f = files[0];
    if (!f || !f.type.match(/xml/)) { this.addError(0, 'Archivo XML inválido'); return; }
    this.addError(0, '');
    const r = new FileReader();
    r.onload = e => this.mostrarXML($.parseXML(e.target.result));
    r.readAsText(f);
  }

  readInputFileKML (files) {
    const f = files[0];
    if (!f || !f.type.match(/kml/)) { this.addError(1, 'Archivo KML inválido'); return; }
    this.addError(1, '');
    const r = new FileReader();
    r.onload = e => {
      const xml = new DOMParser().parseFromString(e.target.result, 'application/xml');
      const tempBtn = $('<button></button>').data('file', 'temp.kml');
      this.toggleMap(tempBtn, this.kmlToGeoJSON(xml)); // vista rápida
    };
    r.readAsText(f);
  }

  readInputFileSVG (files) {
    const f = files[0];
    if (!f || !f.type.match(/svg/)) { this.addError(2, 'Archivo SVG inválido'); return; }
    this.addError(2, '');
    const r = new FileReader();
    r.onload = () => {
      const tempBtn = $('<button></button>').data('file', 'temp.svg');
      this.toggleSVG(tempBtn);
    };
    r.readAsText(f);
  }


  mostrarXML (xmlDoc) {
    this.limpiarMain();
    const $xml = $(xmlDoc);

    const $nav = $('<nav><span>Pulsa y salta →</span></nav>');
    const $art = $('<article><h2>Listado de rutas</h2></article>');

    $xml.find('ruta').each((i, el) => {
      const $ruta   = $(el);
      const nomRuta = $ruta.find('nombre:first').text();

      $('<a>')
        .attr('href', '#')
        .text(nomRuta)
        .data('idx', i)
        .appendTo($nav);

      const $secRuta = $('<section></section>').data('idx', i).appendTo($art);
      $secRuta.append(`<h3>${nomRuta}</h3>`);

      [
        ['Tipo',                'tipo'],
        ['Transporte',          'transporte'],
        ['Duración',            'duracion'],
        ['Descripción',         'descripcion'],
        ['Agencia',             'agencia'],
        ['Personas adecuadas',  'personas-adecuadas']
      ].forEach(([lbl, tag]) => {
        const v = $ruta.find(tag).text();
        if (v) $secRuta.append(`<p>${lbl}: ${v}</p>`);
      });

      const f = $ruta.find('fecha-inicio').text();
      const h = $ruta.find('hora-inicio').text();
      if (f || h) $secRuta.append(`<p>Inicio: ${f} ${h}</p>`);

      const $ini = $ruta.find('inicio');
      if ($ini.length) {
        const lugar = $ini.find('lugar').text();
        const dir   = $ini.find('direccion').text();
        const c     = $ini.find('coordenadas');
        $secRuta.append('<p>Punto de partida:</p>');
        if (lugar) $secRuta.append(`<p>· ${lugar}</p>`);
        if (dir)   $secRuta.append(`<p>· ${dir}</p>`);
        if (c.length) {
          $secRuta.append(
            `<p>(${c.attr('lat')}, ${c.attr('lon')}), alt ${c.attr('alt')} m</p>`
          );
        }
      }

      const $rec = $ruta.find('recomendacion');
      if ($rec.length) {
        const nota = $rec.attr('nota');
        $secRuta.append(
          `<p>Recomendación: ${nota ? `[${nota}] ` : ''}${$rec.text()}</p>`
        );
      }

      const kml = $ruta.find('planimetria').text().trim();
      const svg = $ruta.find('altimetria').text().trim();
      if (kml || svg) {
        const $pBtns = $('<p></p>');
        if (kml) {
          $('<button type="button">Ver mapa</button>')
            .data('file', kml)
            .on('click', e => this.toggleMap($(e.currentTarget)))
            .appendTo($pBtns);
        }
        if (svg) {
          $('<button type="button">Ver perfil</button>')
            .data('file', svg)
            .on('click', e => this.toggleSVG($(e.currentTarget)))
            .appendTo($pBtns);
        }
        $secRuta.append($pBtns);
      }

      $ruta.find('hitos > hito').each((_, hito) => {
        const $h    = $(hito);
        const $secH = $('<section></section>').appendTo($secRuta);

        $secH.append(`<h4>${$h.find('nombre').text()}</h4>`);

        const desc = $h.find('descripcion').text();
        const c    = $h.find('coordenadas');
        const dist = $h.find('distancia').text();
        const uni  = $h.find('distancia').attr('unidad') || '';

        if (desc) $secH.append(`<p>${desc}</p>`);
        if (c.length) {
          $secH.append(
            `<p>Coord: (${c.attr('lat')}, ${c.attr('lon')}), alt ${c.attr('alt')} m</p>`
          );
        }
        if (dist) $secH.append(`<p>Distancia: ${dist} ${uni}</p>`);

        const $fotos = $h.find('galeria > foto');
        if ($fotos.length) {
          const $ul = $('<ul></ul>');
          $fotos.each((_, f) => {
            const file = $(f).text().trim();
            const alt  = file.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            $ul.append(
              `<li><img src="multimedia/imagenes/${file}" alt="${alt}"></li>`
            );
          });
          $secH.append('<p>Fotos:</p>').append($ul);
        }
      });

      const $refs = $ruta.find('referencias > referencia');
      if ($refs.length) {
        const $ul = $('<ul></ul>');
        $refs.each((_, r) => {
          const txt   = $(r).text().trim();
          const esUrl = /^https?:\/\//i.test(txt);
          const href  = esUrl ? txt
                              : `https://www.google.com/search?q=${encodeURIComponent(txt)}`;
          $('<li>')
            .append(
              $('<a>')
                .attr({ href, target: '_blank', rel: 'noopener' })
                .text(txt)
            )
            .appendTo($ul);
        });
        $secRuta.append('<p>Referencias:</p>').append($ul);
      }
    });

    $('main').empty().append($nav).append($art);
  }


  toggleMap ($btn, geojsonExtern = null) {
    const $secPrev = $btn.data('insertedContent');
    if ($secPrev) {
      $secPrev.toggle();
      $btn.text($secPrev.is(':visible') ? 'Ocultar mapa' : 'Ver mapa');
      return;
    }

    $btn.text('Ocultar mapa');
    const nombre = $btn.data('file');

    const cargar = geojsonExtern
      ? Promise.resolve(geojsonExtern)
      : fetch(`xml/${nombre}`)
          .then(r => r.text())
          .then(txt => {
            const xml = new DOMParser().parseFromString(txt, 'application/xml');
            return this.kmlToGeoJSON(xml);
          });

    cargar.then(geojson => {
      const $sec = $('<section data-inserted="true"><h4>Mapa de la ruta</h4></section>');
      $sec.css({ width: '100%', height: '60vh' });

      const $p      = $btn.parent();
      const $ultimo = $p.nextAll('section[data-inserted]').last();
      ($ultimo.length ? $ultimo : $p).after($sec);

      $btn.data('insertedContent', $sec);

      mapboxgl.accessToken =
        'pk.eyJ1IjoiYmVnZWdhZmVybmFuZG8iLCJhIjoiY20zZWkxaDNwMGI4ZTJscXhhbGsxeWI3aiJ9.5OHMMeLIsf0DgIkGXEo3jA';

      const bounds = new mapboxgl.LngLatBounds();
      geojson.features.forEach(f => {
        const g = f.geometry;
        if (g.type === 'Point') bounds.extend(g.coordinates);
        else if (g.type === 'LineString') g.coordinates.forEach(c => bounds.extend(c));
        else if (g.type === 'Polygon') g.coordinates[0].forEach(c => bounds.extend(c));
      });

      const map = new mapboxgl.Map({
        container: $sec[0],
        style: 'mapbox://styles/mapbox/streets-v11',
        center: bounds.getCenter(),
        zoom: 12
      });

      map.on('load', () => {
        map.addSource('ruta', { type: 'geojson', data: geojson });

        map.addLayer({
          id: 'linea',
          type: 'line',
          source: 'ruta',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: { 'line-color': '#e63946', 'line-width': 4 }
        });

        map.addLayer({
          id: 'puntos',
          type: 'circle',
          source: 'ruta',
          filter: ['==', ['geometry-type'], 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#457b9d',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        map.addLayer({
          id: 'labels',
          type: 'symbol',
          source: 'ruta',
          filter: ['==', ['geometry-type'], 'Point'],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-offset': [0, 1.2],
            'text-anchor': 'top'
          }
        });

        map.fitBounds(bounds, { padding: 30 });
      });
    })
    .catch(e => alert(e));
  }


  toggleSVG ($btn) {
    const $secPrev = $btn.data('insertedContent');
    if ($secPrev) {
      $secPrev.toggle();
      $btn.text($secPrev.is(':visible') ? 'Ocultar perfil' : 'Ver perfil');
      return;
    }

    const nombre = $btn.data('file');
    fetch(`xml/${nombre}`)
      .then(r => r.text())
      .then(svgText => {
        const m = svgText.match(/<svg[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/i);
        if (m) {
          const [w, h] = [m[1], m[2]];
          svgText = svgText
            .replace(/\swidth="[^"]*"/i, '')
            .replace(/\sheight="[^"]*"/i, '')
            .replace(/<svg([^>]*)>/i, `<svg$1 viewBox="0 0 ${w} ${h}">`);
        }

        const $sec = $(`
          <section data-inserted="true">
            <h4>Perfil altimétrico</h4>
            ${svgText}
          </section>`);

        const $p      = $btn.parent();
        const $ultimo = $p.nextAll('section[data-inserted]').last();
        ($ultimo.length ? $ultimo : $p).after($sec);

        $btn.data('insertedContent', $sec);
        $btn.text('Ocultar perfil');
      })
      .catch(err => console.error('Error al cargar SVG:', err));
  }


  kmlToGeoJSON (kml) {
    const gj  = { type: 'FeatureCollection', features: [] };
    const ser = new XMLSerializer();

    const texto = (n, html = false) =>
      !n ? ''
          : (html
              ? Array.from(n.childNodes).map(c => ser.serializeToString(c)).join('')
              : n.textContent).trim();

    const parseCoord = s => s
      .trim()
      .split(/\s+/)
      .map(p => {
        const [lo, la, al] = p.split(',').map(Number);
        return [lo, la, isNaN(al) ? 0 : al];
      });

    $(kml).find('Placemark').each(function () {
      const $pm = $(this);
      const feat = {
        type: 'Feature',
        properties: {
          name: texto($pm.find('name')[0]),
          description: texto($pm.find('description')[0], true)
        },
        geometry: null
      };

      if ($pm.find('Point').length) {
        feat.geometry = {
          type: 'Point',
          coordinates: parseCoord($pm.find('coordinates').text())[0]
        };
      } else if ($pm.find('LineString').length) {
        feat.geometry = {
          type: 'LineString',
          coordinates: parseCoord($pm.find('coordinates').text())
        };
      } else if ($pm.find('Polygon').length) {
        feat.geometry = {
          type: 'Polygon',
          coordinates: [parseCoord($pm.find('coordinates').text())]
        };
      }

      if (feat.geometry) gj.features.push(feat);
    });

    return gj;
  }
}

const rutas = new Rutas();
