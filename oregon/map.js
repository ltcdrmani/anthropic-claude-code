/* PNW 3-Day — interactive trip map (Leaflet + OpenStreetMap/CARTO tiles) */
(function () {
  if (typeof L === 'undefined') return;
  var el = document.getElementById('tripmap');
  if (!el) return;

  // ---- Data --------------------------------------------------------------
  var BASE = { name: 'Airbnb — Lebanon (home base, Nights 1 & 2)', lat: 44.5236, lng: -122.9065, q: '2561 S 7th St Lebanon OR 97355' };

  var DAYS = [
    {
      day: 1, color: '#e5674e', label: 'Day 1 · Oregon Coast',
      start: { name: 'Start — Portland, OR', lat: 45.5152, lng: -122.6784, q: 'Portland OR' },
      stops: [
        { n: 1, name: 'Devils Punchbowl', lat: 44.7466, lng: -124.0668, q: 'Devils Punchbowl State Natural Area Oregon' },
        { n: 2, name: 'Yaquina Head Lighthouse', lat: 44.6763, lng: -124.0792, q: 'Yaquina Head Outstanding Natural Area' },
        { n: 3, name: "Thor's Well & Spouting Horn", lat: 44.2817, lng: -124.1138, q: 'Thors Well Cape Perpetua Oregon' },
        { n: 4, name: 'Sea Lion Caves', lat: 44.1226, lng: -124.1283, q: 'Sea Lion Caves Oregon' },
        { n: 5, name: 'Heceta Head Lighthouse', lat: 44.1372, lng: -124.1283, q: 'Heceta Head Lighthouse' },
        { n: 6, name: 'Oregon Dunes NRA', lat: 43.8793, lng: -124.1486, q: 'Oregon Dunes National Recreation Area' }
      ],
      end: BASE
    },
    {
      day: 2, color: '#2a6fb0', label: 'Day 2 · Crater Lake',
      start: BASE,
      stops: [
        { n: 0, name: 'Crater Lake — North Entrance', lat: 43.0330, lng: -122.1270, q: 'Crater Lake National Park North Entrance' },
        { n: 1, name: 'Rim Visitor Center & Lunch', lat: 42.9117, lng: -122.1490, q: 'Crater Lake Rim Village' },
        { n: 2, name: 'Watchman Overlook', lat: 42.9475, lng: -122.1689, q: 'Watchman Overlook Crater Lake' },
        { n: 3, name: 'Pinnacles Overlook', lat: 42.8936, lng: -122.0583, q: 'Pinnacles Overlook Crater Lake' },
        { n: 4, name: 'Plaikni Falls Trail', lat: 42.9088, lng: -122.0787, q: 'Plaikni Falls Trail Crater Lake' },
        { n: 5, name: 'Cloudcap Overlook (East Rim)', lat: 42.9360, lng: -122.0646, q: 'Cloudcap Overlook Crater Lake' }
      ],
      end: BASE
    },
    {
      day: 3, color: '#2e9e5b', label: 'Day 3 · Silver Falls → Seattle',
      start: BASE,
      stops: [
        { n: 1, name: 'Silver Falls State Park (Trail of Ten Falls)', lat: 44.8785, lng: -122.6559, q: 'Silver Falls State Park Oregon' },
        { n: 2, name: 'Silverton (lunch option)', lat: 45.0048, lng: -122.7832, q: 'Silverton Oregon' }
      ],
      end: { name: 'Seattle, WA — trip complete', lat: 47.6062, lng: -122.3321, q: 'Seattle WA' }
    }
  ];

  var CHARGERS = [
    { name: 'Lincoln City Supercharger (8×150kW)', lat: 44.9683, lng: -124.0085, q: 'Tesla Supercharger Lincoln City Outlets Oregon', note: 'Day 1 — only coast fast charger' },
    { name: 'Halsey Supercharger', lat: 44.3820, lng: -123.1100, q: 'Tesla Supercharger Halsey Oregon', note: 'Day 1 — I-5 top-up before Lebanon' },
    { name: 'Salem Supercharger', lat: 44.9190, lng: -123.0351, q: 'Tesla Supercharger Salem Oregon', note: 'Nearest to base (north)' },
    { name: 'Chemult Supercharger (8×325kW)', lat: 43.2177, lng: -121.7807, q: 'Tesla Supercharger Chemult Oregon', note: 'Day 2 — nearest fast charger to Crater Lake' },
    { name: 'Mazama Village destination charger (16kW, slow)', lat: 42.8641, lng: -122.1686, q: 'Tesla Destination Charger Mazama Village Crater Lake', note: 'In-park top-up only' },
    { name: 'Medford Supercharger (12×250kW)', lat: 42.3521, lng: -122.8756, q: 'Tesla Supercharger Medford Oregon', note: 'South-entrance route backup' },
    { name: 'Woodburn Supercharger (12×250kW)', lat: 45.1537, lng: -122.8698, q: 'Tesla Supercharger Woodburn Oregon', note: 'Day 3 — after Silver Falls' },
    { name: 'Centralia Supercharger', lat: 46.7230, lng: -122.9690, q: 'Tesla Supercharger Centralia Washington', note: 'Day 3 — into Seattle' },
    { name: 'Tacoma Supercharger', lat: 47.2490, lng: -122.4400, q: 'Tesla Supercharger Tacoma Washington', note: 'Day 3 — into Seattle' }
  ];

  // ---- Helpers -----------------------------------------------------------
  function dir(q) { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q); }
  function popupHtml(name, q, sub) {
    return '<div class="mpop"><b>' + name + '</b>' +
      (sub ? '<br><span class="mpop__sub">' + sub + '</span>' : '') +
      '<br><a href="' + dir(q) + '" target="_blank" rel="noopener">Directions &#8599;</a></div>';
  }
  function numPin(color, label) {
    return L.divIcon({ className: '', html: '<div class="mpin" style="background:' + color + '">' + label + '</div>', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14] });
  }
  function glyphPin(cls, glyph) {
    return L.divIcon({ className: '', html: '<div class="mpin ' + cls + '">' + glyph + '</div>', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14] });
  }

  // ---- Map ---------------------------------------------------------------
  var map = L.map('tripmap', { scrollWheelZoom: false, zoomControl: true });

  var LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  var DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  var ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  var tiles = L.tileLayer(isDark() ? DARK : LIGHT, { attribution: ATTR, maxZoom: 18 }).addTo(map);

  var pts = [];
  var dayLayers = L.layerGroup().addTo(map);
  var chargerLayer = L.layerGroup().addTo(map);

  DAYS.forEach(function (d) {
    var line = [];
    function add(p, icon, isStop) {
      pts.push([p.lat, p.lng]);
      line.push([p.lat, p.lng]);
      L.marker([p.lat, p.lng], { icon: icon, zIndexOffset: 600 })
        .bindPopup(popupHtml(p.name, p.q, isStop ? d.label : null))
        .addTo(dayLayers);
    }
    // start
    if (d.start === BASE) {
      // base handled once below; still include in the line
      line.push([BASE.lat, BASE.lng]);
    } else {
      add(d.start, glyphPin('mpin--start', '&#9873;'), false);
    }
    // stops
    d.stops.forEach(function (s) {
      add(s, numPin(d.color, s.n ? String(s.n) : '&#9679;'), true);
    });
    // end
    if (d.end === BASE) {
      line.push([BASE.lat, BASE.lng]);
    } else {
      add(d.end, glyphPin('mpin--end', '&#127937;'), false);
    }
    L.polyline(line, { color: d.color, weight: 3, opacity: 0.6, dashArray: '6 7' }).addTo(dayLayers);
  });

  // base marker (once)
  L.marker([BASE.lat, BASE.lng], { icon: glyphPin('mpin--base', '&#127968;'), zIndexOffset: 800 })
    .bindPopup(popupHtml(BASE.name, BASE.q, null))
    .addTo(dayLayers);
  pts.push([BASE.lat, BASE.lng]);

  // chargers
  CHARGERS.forEach(function (c) {
    L.marker([c.lat, c.lng], { icon: glyphPin('mpin--charge', '&#9889;') })
      .bindPopup(popupHtml(c.name, c.q, c.note))
      .addTo(chargerLayer);
  });

  L.control.layers(null, { '&#9889; Superchargers': chargerLayer }, { collapsed: false, position: 'topright' }).addTo(map);

  map.fitBounds(L.latLngBounds(pts).pad(0.12));

  // swap tiles when dark mode toggles
  var mo = new MutationObserver(function () {
    tiles.setUrl(isDark() ? DARK : LIGHT);
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Leaflet needs a size recalc once the section becomes visible / on resize
  setTimeout(function () { map.invalidateSize(); }, 300);
  window.addEventListener('resize', function () { map.invalidateSize(); });
})();
