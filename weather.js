(function () {
  'use strict';

  // Representative location, date, and the local-time window we'll actually
  // be there [startHour, endHour] for each day's weather bar.
  var DAYS = [
    { id: 'day1', date: '2026-06-27', lat: 46.0038, lng: -112.5348, place: 'Eastern WA → Butte', win: [7, 20] },
    { id: 'day2', date: '2026-06-28', lat: 44.7203, lng: -110.4825, place: 'Mammoth / Canyon / Norris', win: [9, 19] },
    { id: 'day3', date: '2026-06-29', lat: 44.6551, lng: -110.4586, place: 'Hayden & Lamar Valleys', win: [9, 20] },
    { id: 'day4', date: '2026-06-30', lat: 44.4605, lng: -110.8281, place: 'Old Faithful / Lower Loop', win: [7, 16] },
    { id: 'day5', date: '2026-07-01', lat: 43.8558, lng: -110.6421, place: 'Grand Teton', win: [6, 22] },
    { id: 'day6', date: '2026-07-02', lat: 43.7529, lng: -110.7226, place: 'Jenny Lake (sunrise start)', win: [5, 16] },
    { id: 'day7', date: '2026-07-03', lat: 43.6150, lng: -116.2023, place: 'Craters → Boise', win: [8, 18] },
    { id: 'day8', date: '2026-07-04', lat: 47.0073, lng: -120.5308, place: 'Ellensburg → Seattle', win: [10, 17] }
  ];

  // WMO weather code -> [icon, text]
  function describe(code) {
    var m = {
      0: ['☀️', 'Clear sky'], 1: ['🌤️', 'Mainly clear'],
      2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Overcast'],
      45: ['🌫️', 'Fog'], 48: ['🌫️', 'Rime fog'],
      51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'],
      55: ['🌦️', 'Heavy drizzle'], 56: ['🌧️', 'Freezing drizzle'],
      57: ['🌧️', 'Freezing drizzle'], 61: ['🌦️', 'Light rain'],
      63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
      66: ['🌧️', 'Freezing rain'], 67: ['🌧️', 'Freezing rain'],
      71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'],
      75: ['🌨️', 'Heavy snow'], 77: ['🌨️', 'Snow grains'],
      80: ['🌦️', 'Rain showers'], 81: ['🌧️', 'Rain showers'],
      82: ['⛈️', 'Violent showers'], 85: ['🌨️', 'Snow showers'],
      86: ['🌨️', 'Snow showers'], 95: ['⛈️', 'Thunderstorm'],
      96: ['⛈️', 'Thunderstorm w/ hail'], 99: ['⛈️', 'Thunderstorm w/ hail']
    };
    return m[code] || ['🌡️', 'Mixed conditions'];
  }

  function fmtDate(iso) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return days[d.getUTCDay()] + ', ' + mons[d.getUTCMonth()] + ' ' + d.getUTCDate();
  }

  function fmtHour(h) {
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hr = h % 12 || 12;
    return hr + ' ' + ampm;
  }

  function fetchDay(day) {
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + day.lat + '&longitude=' + day.lng +
      '&hourly=temperature_2m,weather_code,precipitation_probability' +
      '&temperature_unit=fahrenheit&timezone=auto' +
      '&start_date=' + day.date + '&end_date=' + day.date;

    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (json) {
      var h = json && json.hourly;
      if (!h || !h.time || !h.time.length) throw new Error('no data');

      var lo = Infinity, hi = -Infinity, maxPop = 0, worst = 0, n = 0;
      for (var i = 0; i < h.time.length; i++) {
        var hour = parseInt(h.time[i].slice(11, 13), 10);
        if (hour < day.win[0] || hour > day.win[1]) continue;
        n++;
        var t = h.temperature_2m[i];
        if (t < lo) lo = t;
        if (t > hi) hi = t;
        var pop = h.precipitation_probability ? h.precipitation_probability[i] : 0;
        if (pop > maxPop) maxPop = pop;
        var c = h.weather_code[i];
        if (c > worst) worst = c; // rough severity proxy
      }
      if (!n) throw new Error('no window data');
      return { lo: Math.round(lo), hi: Math.round(hi), pop: maxPop, code: worst };
    });
  }

  function warnings(wx) {
    var out = [];
    if (wx.lo <= 32) out.push('❄️ Freezing at times (low ~' + wx.lo + '°F) — pack warm layers.');
    else if (wx.lo <= 42) out.push('🧥 Chilly (low ~' + wx.lo + '°F) — bring a jacket.');
    if (wx.hi >= 90) out.push('🥵 Hot (high ~' + wx.hi + '°F) — carry extra water &amp; sun protection.');
    else if (wx.hi >= 85) out.push('☀️ Warm (high ~' + wx.hi + '°F) — stay hydrated.');
    if (wx.code >= 95 || wx.pop >= 50) out.push('⛈️ Storm/rain risk (' + wx.pop + '%) during your visit.');
    else if (wx.pop >= 30) out.push('🌦️ Showers possible (' + wx.pop + '%).');
    return out;
  }

  function render(day, wx) {
    var section = document.getElementById(day.id);
    if (!section) return;
    var bar = section.querySelector('.weather-bar');
    if (!bar) return;
    var icon = bar.querySelector('.weather-bar__icon');
    var body = bar.querySelector('div');
    if (!body) return;

    var desc = describe(wx.code);
    if (icon) icon.textContent = desc[0];
    bar.classList.toggle('weather-bar--cold', wx.hi <= 55);

    var html = '<strong>Live Forecast</strong> ' +
      '<span class="weather-bar__live">LIVE</span>' +
      '<span class="weather-bar__date"> &bull; ' + fmtDate(day.date) + ' &bull; ' + day.place + '</span><br>' +
      'While you’re there (' + fmtHour(day.win[0]) + '–' + fmtHour(day.win[1]) + '): <strong>' +
      wx.lo + '–' + wx.hi + '°F</strong>, ' + desc[1].toLowerCase() + '.';

    var warns = warnings(wx);
    if (warns.length) {
      html += '<br><span class="weather-bar__warn">' + warns.join(' ') + '</span>';
    }
    body.innerHTML = html;
  }

  function init() {
    if (!('fetch' in window)) return;
    DAYS.forEach(function (day) {
      fetchDay(day)
        .then(function (wx) { render(day, wx); })
        .catch(function () { /* keep static fallback text */ });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
