(function () {
  'use strict';

  // Representative location + date for each day's weather bar.
  var DAYS = [
    { id: 'day1', date: '2026-06-27', lat: 46.0038, lng: -112.5348, place: 'Butte, MT' },
    { id: 'day2', date: '2026-06-28', lat: 44.9686, lng: -110.6853, place: 'Yellowstone (Mammoth)' },
    { id: 'day3', date: '2026-06-29', lat: 44.4605, lng: -110.8281, place: 'Old Faithful' },
    { id: 'day4', date: '2026-06-30', lat: 44.7180, lng: -110.4950, place: 'Yellowstone Canyon' },
    { id: 'day5', date: '2026-07-01', lat: 43.8558, lng: -110.6421, place: 'Grand Teton' },
    { id: 'day6', date: '2026-07-02', lat: 43.7529, lng: -110.7226, place: 'Jenny Lake' },
    { id: 'day7', date: '2026-07-03', lat: 43.6150, lng: -116.2023, place: 'Boise, ID' },
    { id: 'day8', date: '2026-07-04', lat: 47.0073, lng: -120.5308, place: 'Ellensburg, WA' }
  ];

  // WMO weather code -> { icon, text, cold? }
  function describe(code) {
    var m = {
      0:  ['☀️', 'Clear sky'],
      1:  ['🌤️', 'Mainly clear'],
      2:  ['⛅', 'Partly cloudy'],
      3:  ['☁️', 'Overcast'],
      45: ['🌫️', 'Fog'],
      48: ['🌫️', 'Rime fog'],
      51: ['🌦️', 'Light drizzle'],
      53: ['🌦️', 'Drizzle'],
      55: ['🌦️', 'Heavy drizzle'],
      56: ['🌧️', 'Freezing drizzle'],
      57: ['🌧️', 'Freezing drizzle'],
      61: ['🌦️', 'Light rain'],
      63: ['🌧️', 'Rain'],
      65: ['🌧️', 'Heavy rain'],
      66: ['🌧️', 'Freezing rain'],
      67: ['🌧️', 'Freezing rain'],
      71: ['🌨️', 'Light snow'],
      73: ['🌨️', 'Snow'],
      75: ['🌨️', 'Heavy snow'],
      77: ['🌨️', 'Snow grains'],
      80: ['🌦️', 'Rain showers'],
      81: ['🌧️', 'Rain showers'],
      82: ['⛈️', 'Violent rain showers'],
      85: ['🌨️', 'Snow showers'],
      86: ['🌨️', 'Snow showers'],
      95: ['⛈️', 'Thunderstorm'],
      96: ['⛈️', 'Thunderstorm with hail'],
      99: ['⛈️', 'Thunderstorm with hail']
    };
    return m[code] || ['🌡️', 'Mixed conditions'];
  }

  function fmtDate(iso) {
    var parts = iso.split('-');
    var d = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]));
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return days[d.getUTCDay()] + ', ' + mons[d.getUTCMonth()] + ' ' + d.getUTCDate();
  }

  function fetchDay(day) {
    var url = 'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + day.lat +
      '&longitude=' + day.lng +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&temperature_unit=fahrenheit&timezone=auto' +
      '&start_date=' + day.date + '&end_date=' + day.date;

    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (json) {
      var d = json && json.daily;
      if (!d || !d.time || !d.time.length) throw new Error('no data');
      return {
        code: d.weather_code[0],
        hi: Math.round(d.temperature_2m_max[0]),
        lo: Math.round(d.temperature_2m_min[0]),
        pop: d.precipitation_probability_max ? d.precipitation_probability_max[0] : null
      };
    });
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
      desc[1] + '. High <strong>' + wx.hi + '&deg;F</strong> / Low <strong>' + wx.lo + '&deg;F</strong>.';
    if (wx.pop !== null && wx.pop !== undefined) {
      html += ' Precipitation chance <strong>' + wx.pop + '%</strong>.';
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
