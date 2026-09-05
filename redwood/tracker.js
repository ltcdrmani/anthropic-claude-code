(function () {
  'use strict';

  var P = 7; // PDT (UTC-7) — early September is still Daylight Time
  function u(mo, d, h, mi) {
    return Date.UTC(2026, mo - 1, d, h + P, mi);
  }

  var SCHED = [
    // Friday, Sep 4 — Seattle to Coos Bay via Portland
    {u:u(9,4,5,30),  lat:47.6062, lng:-122.3321, n:'Depart Seattle', d:1},
    {u:u(9,4,8,45),  lat:45.5152, lng:-122.6784, n:"Uttari's House, Portland", d:1},
    {u:u(9,4,16,0),  lat:45.5152, lng:-122.6784, n:'Depart Portland', d:1},
    {u:u(9,4,20,30), lat:43.3665, lng:-124.2179, n:'Coos Bay (overnight)', d:1},

    // Saturday, Sep 5 — Southern Redwoods & Fern Canyon (after 5)
    {u:u(9,5,10,0),  lat:43.3665, lng:-124.2179, n:'Depart Coos Bay', d:2},
    {u:u(9,5,13,45), lat:41.3549, lng:-124.0264, n:'Big Tree & Drury Parkway', d:2},
    {u:u(9,5,15,0),  lat:41.3018, lng:-124.0165, n:'Lady Bird Johnson Grove', d:2},
    {u:u(9,5,16,15), lat:41.3018, lng:-124.0165, n:'Elk Meadow (pre-Fern Canyon)', d:2},
    {u:u(9,5,17,15), lat:41.4023, lng:-124.0645, n:'Fern Canyon & Gold Bluffs Beach', d:2},
    {u:u(9,5,18,45), lat:41.4023, lng:-124.0645, n:'Depart Fern Canyon', d:2},
    {u:u(9,5,19,15), lat:41.5466, lng:-124.0793, n:'Klamath River Overlook', d:2},
    {u:u(9,5,20,15), lat:41.7558, lng:-124.2026, n:'Crescent City Airbnb', d:2},

    // Sunday, Sep 6 — Jedediah Smith Giants, Smith River & Coast
    {u:u(9,6,9,0),   lat:41.7216, lng:-124.0846, n:'Grove of Titans', d:3},
    {u:u(9,6,11,30), lat:41.7216, lng:-124.0846, n:'Depart Grove of Titans', d:3},
    {u:u(9,6,11,45), lat:41.7943, lng:-124.0857, n:'Stout Grove & Smith River', d:3},
    {u:u(9,6,13,0),  lat:41.7943, lng:-124.0857, n:'Depart Stout Grove', d:3},
    {u:u(9,6,13,30), lat:41.5637, lng:-124.0837, n:'Afternoon: Trees of Mystery / Battery Point', d:3},
    {u:u(9,6,16,0),  lat:41.7558, lng:-124.2026, n:'Return to Crescent City Airbnb', d:3},

    // Monday, Sep 7 — Return drive to Seattle
    {u:u(9,7,7,30),  lat:41.7558, lng:-124.2026, n:'Depart Crescent City', d:4},
    {u:u(9,7,9,30),  lat:42.4390, lng:-123.3284, n:'Grants Pass', d:4},
    {u:u(9,7,12,30), lat:44.0521, lng:-123.0868, n:'Eugene (lunch/stretch)', d:4},
    {u:u(9,7,15,30), lat:45.5152, lng:-122.6784, n:'Portland (stretch)', d:4},
    {u:u(9,7,18,30), lat:47.6062, lng:-122.3321, n:'Home! Seattle', d:4}
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
