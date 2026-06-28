(function () {
  'use strict';

  var P = 7, M = 6;
  function u(mo, d, h, mi, tz) {
    return Date.UTC(2026, mo - 1, d, h + tz, mi);
  }

  var SCHED = [
    {u:u(6,27,6,30,P),   lat:47.6062, lng:-122.3321, n:'Depart Seattle', d:1},
    {u:u(6,27,8,45,P),   lat:46.9465, lng:-120.5094, n:'Ginkgo Gem Shop, Vantage', d:1},
    {u:u(6,27,9,15,P),   lat:46.9465, lng:-120.5094, n:'Depart Vantage', d:1},
    {u:u(6,27,11,45,P),  lat:47.6770, lng:-116.7800, n:'Atlas Mill Park, CDA', d:1},
    {u:u(6,27,13,0,P),   lat:47.6770, lng:-116.7800, n:'Depart CDA', d:1},
    {u:u(6,27,16,0,M),   lat:47.3001, lng:-115.0908, n:'St. Regis, MT', d:1},
    {u:u(6,27,16,30,M),  lat:47.3001, lng:-115.0908, n:'Depart St. Regis', d:1},
    {u:u(6,27,19,0,M),   lat:46.0038, lng:-112.5348, n:'Wingate Hotel, Butte', d:1},

    {u:u(6,28,9,0,M),    lat:46.0038, lng:-112.5348, n:'Depart Butte', d:2},
    {u:u(6,28,11,45,M),  lat:45.0309, lng:-110.7079, n:'Roosevelt Arch, Gardiner', d:2},
    {u:u(6,28,12,15,M),  lat:44.9686, lng:-110.6853, n:'Mammoth Hot Springs', d:2},
    {u:u(6,28,13,30,M),  lat:44.9686, lng:-110.6853, n:'Depart Mammoth', d:2},
    {u:u(6,28,15,0,M),   lat:44.7203, lng:-110.4825, n:'Grand Canyon (Artist Point)', d:2},
    {u:u(6,28,16,15,M),  lat:44.7262, lng:-110.7034, n:'Norris Geyser Basin', d:2},
    {u:u(6,28,19,0,M),   lat:44.4187, lng:-111.3732, n:'Island Park Cabin', d:2},

    {u:u(6,29,8,30,M),   lat:44.4187, lng:-111.3732, n:'Depart Island Park', d:3},
    {u:u(6,29,9,0,M),    lat:44.6572, lng:-111.0947, n:'West Entrance Gate', d:3},
    {u:u(6,29,10,30,M),  lat:44.6551, lng:-110.4586, n:'Hayden Valley', d:3},
    {u:u(6,29,12,0,M),   lat:44.6259, lng:-110.4324, n:'Mud Volcano', d:3},
    {u:u(6,29,14,30,M),  lat:44.8985, lng:-110.2073, n:'Lamar Valley', d:3},
    {u:u(6,29,19,45,M),  lat:44.4187, lng:-111.3732, n:'Return to Island Park', d:3},

    {u:u(6,30,7,0,M),    lat:44.4187, lng:-111.3732, n:'Depart Island Park', d:4},
    {u:u(6,30,7,30,M),   lat:44.6572, lng:-111.0947, n:'West Entrance Gate', d:4},
    {u:u(6,30,8,0,M),    lat:44.5510, lng:-110.8083, n:'Fountain Paint Pots', d:4},
    {u:u(6,30,9,0,M),    lat:44.5249, lng:-110.8383, n:'Grand Prismatic Overlook', d:4},
    {u:u(6,30,10,30,M),  lat:44.5252, lng:-110.8380, n:'Midway Geyser Basin', d:4},
    {u:u(6,30,11,30,M),  lat:44.4605, lng:-110.8281, n:'Old Faithful', d:4},
    {u:u(6,30,15,0,M),   lat:44.4605, lng:-110.8281, n:'Depart Old Faithful', d:4},
    {u:u(6,30,17,0,M),   lat:44.4187, lng:-111.3732, n:'Return to Island Park', d:4},

    {u:u(7,1,6,0,M),     lat:44.4187, lng:-111.3732, n:'Depart Island Park', d:5},
    {u:u(7,1,8,15,M),    lat:43.6024, lng:-111.1114, n:'Victor, ID', d:5},
    {u:u(7,1,9,30,M),    lat:43.7505, lng:-110.6013, n:'Glacier View Turnout', d:5},
    {u:u(7,1,10,30,M),   lat:43.7436, lng:-110.6682, n:'Snake River Overlook', d:5},
    {u:u(7,1,11,0,M),    lat:43.7798, lng:-110.6324, n:'Elk Ranch Flats', d:5},
    {u:u(7,1,13,0,M),    lat:43.8558, lng:-110.6421, n:'Jackson Lake Lodge', d:5},
    {u:u(7,1,16,0,M),    lat:43.8133, lng:-111.1669, n:'Tetonia Check-in', d:5},
    {u:u(7,1,18,0,M),    lat:43.8133, lng:-111.1669, n:'Depart Tetonia', d:5},
    {u:u(7,1,19,0,M),    lat:43.8634, lng:-110.5452, n:'Oxbow Bend Sunset', d:5},
    {u:u(7,1,20,45,M),   lat:43.8634, lng:-110.5452, n:'Depart Oxbow Bend', d:5},
    {u:u(7,1,21,45,M),   lat:43.8133, lng:-111.1669, n:'Return to Tetonia', d:5},

    {u:u(7,2,4,45,M),    lat:43.8133, lng:-111.1669, n:'Depart Tetonia', d:6},
    {u:u(7,2,5,45,M),    lat:43.7135, lng:-110.6699, n:'Schwabacher Landing', d:6},
    {u:u(7,2,6,45,M),    lat:43.6638, lng:-110.6658, n:'Mormon Row', d:6},
    {u:u(7,2,7,30,M),    lat:43.7529, lng:-110.7226, n:'Jenny Lake', d:6},
    {u:u(7,2,12,30,M),   lat:43.7697, lng:-110.7299, n:'String Lake Picnic', d:6},
    {u:u(7,2,14,0,M),    lat:43.8337, lng:-110.5959, n:'Signal Mountain', d:6},
    {u:u(7,2,16,0,M),    lat:43.8133, lng:-111.1669, n:'Return to Tetonia', d:6},

    {u:u(7,3,7,30,M),    lat:43.8133, lng:-111.1669, n:'Depart Tetonia', d:7},
    {u:u(7,3,10,0,M),    lat:43.4602, lng:-113.5622, n:'Craters of the Moon', d:7},
    {u:u(7,3,11,30,M),   lat:43.4602, lng:-113.5622, n:'Depart Craters of the Moon', d:7},
    {u:u(7,3,13,0,M),    lat:42.5938, lng:-114.4051, n:'Shoshone Falls', d:7},
    {u:u(7,3,13,45,M),   lat:42.5938, lng:-114.4051, n:'Depart Twin Falls', d:7},
    {u:u(7,3,15,45,M),   lat:43.6150, lng:-116.2023, n:'Boise Stretch Break', d:7},
    {u:u(7,3,16,0,M),    lat:43.6150, lng:-116.2023, n:'Depart Boise', d:7},
    {u:u(7,3,18,45,P),   lat:45.6721, lng:-118.7886, n:'Radisson Hotel, Pendleton', d:7},

    {u:u(7,4,10,0,P),    lat:45.6721, lng:-118.7886, n:'Depart Pendleton', d:8},
    {u:u(7,4,11,45,P),   lat:46.2073, lng:-119.7690, n:'Prosser Cherry Stop', d:8},
    {u:u(7,4,12,0,P),    lat:46.2073, lng:-119.7690, n:'Depart Prosser', d:8},
    {u:u(7,4,12,45,P),   lat:46.8500, lng:-120.4700, n:'Yakima River Canyon', d:8},
    {u:u(7,4,13,0,P),    lat:47.0073, lng:-120.5308, n:'Olmstead Place, Ellensburg', d:8},
    {u:u(7,4,14,15,P),   lat:47.0073, lng:-120.5308, n:'Depart Ellensburg', d:8},
    {u:u(7,4,15,0,P),    lat:47.3930, lng:-121.4116, n:'Snoqualmie Pass', d:8},
    {u:u(7,4,16,45,P),   lat:47.6062, lng:-122.3321, n:'Home! Seattle', d:8}
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
      var nextTime = formatLocalTime(next.u, next.d <= 1 || next.d >= 8 ? P : M);
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
