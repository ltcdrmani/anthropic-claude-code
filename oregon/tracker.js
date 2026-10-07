(function () {
  'use strict';

  var P = 7; // PDT (UTC-7) — mid-October is still Daylight Time (ends Nov 1, 2026)
  function u(mo, d, h, mi) {
    return Date.UTC(2026, mo - 1, d, h + P, mi);
  }

  var SCHED = [
    // Friday, Oct 9 — Portland to the Central Oregon Coast, overnight Lebanon
    {u:u(10,9,8,0),   lat:45.5152, lng:-122.6784, n:'Depart Portland', d:1},
    {u:u(10,9,10,15), lat:44.7466, lng:-124.0668, n:'Devils Punchbowl', d:1},
    {u:u(10,9,11,0),  lat:44.7466, lng:-124.0668, n:'Depart Devils Punchbowl', d:1},
    {u:u(10,9,11,15), lat:44.6763, lng:-124.0792, n:'Yaquina Head & Lunch', d:1},
    {u:u(10,9,12,45), lat:44.6763, lng:-124.0792, n:'Depart Yaquina Head', d:1},
    {u:u(10,9,13,30), lat:44.2817, lng:-124.1138, n:"Thor's Well & Spouting Horn", d:1},
    {u:u(10,9,14,15), lat:44.2817, lng:-124.1138, n:"Depart Thor's Well", d:1},
    {u:u(10,9,14,30), lat:44.1226, lng:-124.1283, n:'Sea Lion Caves', d:1},
    {u:u(10,9,15,30), lat:44.1226, lng:-124.1283, n:'Depart Sea Lion Caves', d:1},
    {u:u(10,9,15,35), lat:44.1372, lng:-124.1283, n:'Heceta Head Lighthouse', d:1},
    {u:u(10,9,16,30), lat:44.1372, lng:-124.1283, n:'Depart Heceta Head', d:1},
    {u:u(10,9,16,50), lat:43.8793, lng:-124.1486, n:'Oregon Dunes', d:1},
    {u:u(10,9,17,40), lat:43.8793, lng:-124.1486, n:'Depart Oregon Dunes', d:1},
    {u:u(10,9,19,55), lat:44.5236, lng:-122.9065, n:'Airbnb, Lebanon (overnight)', d:1},

    // Saturday, Oct 10 — Crater Lake day trip, back to Lebanon
    {u:u(10,10,8,0),   lat:44.5236, lng:-122.9065, n:'Depart Lebanon', d:2},
    {u:u(10,10,11,15), lat:42.9117, lng:-122.1490, n:'Rim Visitor Center & Lunch', d:2},
    {u:u(10,10,12,15), lat:42.9117, lng:-122.1490, n:'Depart Rim Village', d:2},
    {u:u(10,10,12,25), lat:42.9475, lng:-122.1689, n:'Watchman Overlook', d:2},
    {u:u(10,10,13,0),  lat:42.9475, lng:-122.1689, n:'Depart Watchman Overlook', d:2},
    {u:u(10,10,13,45), lat:42.8936, lng:-122.0583, n:'Pinnacles Overlook', d:2},
    {u:u(10,10,14,30), lat:42.8936, lng:-122.0583, n:'Depart Pinnacles', d:2},
    {u:u(10,10,14,40), lat:42.9088, lng:-122.0787, n:'Plaikni Falls Trail', d:2},
    {u:u(10,10,15,45), lat:42.9088, lng:-122.0787, n:'Depart Plaikni Falls', d:2},
    {u:u(10,10,15,55), lat:42.9360, lng:-122.0646, n:'Cloudcap Overlook (East Rim)', d:2},
    {u:u(10,10,16,30), lat:42.9360, lng:-122.0646, n:'Depart Crater Lake', d:2},
    {u:u(10,10,19,30), lat:44.5236, lng:-122.9065, n:'Airbnb, Lebanon (overnight)', d:2},

    // Sunday, Oct 11 — Silver Falls, then home to Seattle
    {u:u(10,11,8,0),   lat:44.5236, lng:-122.9065, n:'Depart Lebanon', d:3},
    {u:u(10,11,8,50),  lat:44.8785, lng:-122.6559, n:'Silver Falls — Trail of Ten Falls', d:3},
    {u:u(10,11,12,0),  lat:44.8785, lng:-122.6559, n:'Lunch — South Falls / Silverton', d:3},
    {u:u(10,11,13,15), lat:44.8785, lng:-122.6559, n:'Depart Silver Falls', d:3},
    {u:u(10,11,17,0),  lat:47.6062, lng:-122.3321, n:'Home! Seattle', d:3}
  ];

  function hav(a1, o1, a2, o2) {
    var R = 3959, dr = Math.PI / 180;
    var dA = (a2 - a1) * dr, dO = (o2 - o1) * dr;
    var x = Math.sin(dA / 2) * Math.sin(dA / 2) +
      Math.cos(a1 * dr) * Math.cos(a2 * dr) * Math.sin(dO / 2) * Math.sin(dO / 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function analyze(lat, lng, nowMs) {
    var ms = nowMs || Date.now();
    var first = SCHED[0], last = SCHED[SCHED.length - 1];

    if (ms < first.u) {
      var days = Math.ceil((first.u - ms) / 86400000);
      return {
        status: 'pre', day: 0, color: 'gray',
        msg: 'Trip starts in ' + days + ' day' + (days !== 1 ? 's' : '') + '! Get excited!'
      };
    }
    if (ms > last.u + 3600000) {
      return {
        status: 'post', day: 9, color: 'gray',
        msg: 'What an amazing trip! Hope it was unforgettable.'
      };
    }

    var pi = 0;
    for (var i = 0; i < SCHED.length; i++) {
      if (SCHED[i].u <= ms) pi = i; else break;
    }
    var ni = Math.min(pi + 1, SCHED.length - 1);
    var prev = SCHED[pi], next = SCHED[ni];
    var gap = next.u - prev.u;

    if (gap > 4 * 3600000 && prev.d !== next.d) {
      var distToLodge = hav(lat, lng, prev.lat, prev.lng);
      var nextTime = formatLocalTime(next.u, P);
      return {
        status: 'night', day: prev.d, color: 'blue',
        nextStop: next.n, dist: Math.round(distToLodge),
        msg: 'Rest up! Day ' + next.d + ' starts at ' + nextTime + '.'
      };
    }

    var totalDist = hav(prev.lat, prev.lng, next.lat, next.lng);
    var distToNext = hav(lat, lng, next.lat, next.lng);
    var distFromPrev = hav(lat, lng, prev.lat, prev.lng);

    if (distToNext > 80 && distFromPrev > 80) {
      var minD = Infinity, minW = SCHED[0];
      for (var j = 0; j < SCHED.length; j++) {
        var dd = hav(lat, lng, SCHED[j].lat, SCHED[j].lng);
        if (dd < minD) { minD = dd; minW = SCHED[j]; }
      }
      return {
        status: 'off-route', day: prev.d, color: 'gray',
        nextStop: minW.n, dist: Math.round(minD),
        msg: 'You seem far from the route. Nearest stop: ' + minW.n + ' (' + Math.round(minD) + ' mi).'
      };
    }

    var result = { day: prev.d, nextStop: next.n, dist: Math.round(distToNext) };

    // Are we parked at a scheduled stop? Two cases:
    //  (a) inside the dwell window: prev = arrival, next = matching "Depart X" (same coords)
    //  (b) overstaying: scheduled departure has passed but we're still at the stop
    var atStop = null;
    if (totalDist < 1) {
      atStop = {
        name: prev.n.replace(/^Depart\s+/, '').replace(/^Return to\s+/, ''),
        departU: next.u,
        dest: SCHED[ni + 1]
      };
    } else if (/^Depart\s/.test(prev.n) && distFromPrev < 1.5) {
      atStop = {
        name: prev.n.replace(/^Depart\s+/, ''),
        departU: prev.u,
        dest: next
      };
    }

    if (atStop) {
      var leaveIn = Math.round((atStop.departU - ms) / 60000); // +ve = mins until you should leave
      var dest = atStop.dest;
      result.status = 'at-stop';
      result.stopName = atStop.name;
      result.leaveIn = leaveIn;

      if (dest) {
        result.nextStop = dest.n;
        result.dist = Math.round(hav(lat, lng, dest.lat, dest.lng));
      } else {
        result.nextStop = null;
        result.dist = undefined;
      }

      var forDest = dest ? ' for ' + dest.n : '';
      if (!dest) {
        result.color = 'green';
        result.msg = 'Enjoy your time at ' + atStop.name + '!';
      } else if (leaveIn > 20) {
        result.color = 'green';
        result.msg = 'Relax at ' + atStop.name + ' — leave in ' + leaveIn + ' min' + forDest + '.';
      } else if (leaveIn > 5) {
        result.color = 'yellow';
        result.msg = 'Start wrapping up at ' + atStop.name + ' — leave in ' + leaveIn + ' min' + forDest + '.';
      } else if (leaveIn >= 0) {
        result.color = 'orange';
        result.msg = 'Time to head out' + forDest + ' — leave ' + atStop.name + ' in ' + leaveIn + ' min.';
      } else {
        result.color = 'red';
        result.msg = 'Running ' + Math.abs(leaveIn) + ' min over at ' + atStop.name + ' — head out' + forDest + ' now.';
      }
      return result;
    }

    var segDur = next.u - prev.u;
    var elapsed = ms - prev.u;
    var timeFrac = segDur > 0 ? elapsed / segDur : 1;
    var spatialProg = Math.max(0, Math.min(1, distFromPrev / totalDist));
    var deltaFrac = spatialProg - timeFrac;
    var deltaMins = Math.round(deltaFrac * segDur / 60000);
    result.delta = deltaMins;

    if (Math.abs(deltaMins) <= 15) {
      result.status = 'on-track';
      result.color = 'green';
      result.msg = 'Right on schedule! Keep enjoying the drive.';
    } else if (deltaMins > 60) {
      result.status = 'ahead';
      result.color = 'blue';
      result.msg = deltaMins + ' min ahead. Great time for a bonus stop or scenic detour!';
    } else if (deltaMins > 15) {
      result.status = 'ahead';
      result.color = 'blue';
      result.msg = deltaMins + ' min ahead of schedule. You have time to spare!';
    } else if (deltaMins < -60) {
      result.status = 'behind';
      result.color = 'red';
      result.msg = Math.abs(deltaMins) + ' min behind. Consider cutting ' + next.n + ' short to catch up.';
    } else if (deltaMins < -30) {
      result.status = 'behind';
      result.color = 'orange';
      result.msg = Math.abs(deltaMins) + ' min behind. Shorten your next stop to get back on track.';
    } else {
      result.status = 'behind';
      result.color = 'yellow';
      result.msg = Math.abs(deltaMins) + ' min behind. Pick up the pace a bit!';
    }

    return result;
  }

  function formatLocalTime(utcMs, offsetHours) {
    var local = new Date(utcMs - offsetHours * 3600000);
    var h = local.getUTCHours(), m = local.getUTCMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  }

  var watchId = null;
  var tracking = false;

  function init() {
    var el = document.getElementById('tracker');
    if (!el) return;

    var toggle = el.querySelector('.tracker__toggle');
    var content = el.querySelector('.tracker__content');
    var dot = el.querySelector('.tracker__dot');
    var summary = el.querySelector('.tracker__summary');

    toggle.addEventListener('click', function () {
      el.classList.toggle('tracker--expanded');
    });

    var initial = analyze(0, 0);
    if (initial.status === 'pre' || initial.status === 'post') {
      summary.textContent = initial.msg;
      dot.className = 'tracker__dot tracker__dot--' + initial.color;
    } else {
      summary.textContent = 'Locating…';
    }

    // Automatically begin tracking on load.
    startTracking(el, content, dot, summary);
  }

  function startTracking(el, content, dot, summary) {
    if (!navigator.geolocation) {
      content.innerHTML = '<p class="tracker__error">Geolocation is not supported by your browser.</p>';
      return;
    }
    tracking = true;
    el.classList.add('tracker--tracking');

    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        var a = analyze(pos.coords.latitude, pos.coords.longitude);
        updateDisplay(a, content, dot, summary);
      },
      function () {
        content.innerHTML = '<p class="tracker__error">Location access denied. Please enable location services and try again.</p>';
        dot.className = 'tracker__dot tracker__dot--gray';
        summary.textContent = 'Location unavailable';
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  function updateDisplay(a, content, dot, summary) {
    dot.className = 'tracker__dot tracker__dot--' + a.color;

    var labels = {
      'on-track': 'On Track', ahead: 'Ahead of Schedule',
      behind: 'Behind Schedule', night: 'Overnight Rest',
      pre: 'Before Trip', post: 'Trip Complete', 'off-route': 'Off Route',
      'at-stop': 'At a Stop'
    };
    var statusLabel = labels[a.status] || a.status;

    if (a.status === 'at-stop' && typeof a.leaveIn === 'number' && a.nextStop) {
      summary.textContent = a.leaveIn >= 0
        ? 'Leave in ' + a.leaveIn + ' min'
        : 'Leave now (' + Math.abs(a.leaveIn) + ' min over)';
    } else if (a.delta && Math.abs(a.delta) > 15) {
      summary.textContent = Math.abs(a.delta) + ' min ' + (a.delta > 0 ? 'ahead' : 'behind');
    } else {
      summary.textContent = statusLabel;
    }

    var html = '<div class="tracker__status-row">' +
      '<span class="tracker__badge tracker__badge--' + a.color + '">' + statusLabel + '</span>';
    if (a.day > 0 && a.day <= 8) {
      html += '<span class="tracker__day-badge">Day ' + a.day + '</span>';
    }
    html += '</div>';

    if (a.nextStop) {
      html += '<div class="tracker__next">' +
        '<span class="tracker__next-label">Next: </span>' + a.nextStop;
      if (typeof a.dist === 'number') {
        html += ' <span class="tracker__dist">&bull; ~' + a.dist + ' mi</span>';
      }
      html += '</div>';
    }

    html += '<p class="tracker__advice">' + a.msg + '</p>';
    content.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
