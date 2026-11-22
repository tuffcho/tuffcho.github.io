// Live demo of the floating bar: dots flash in time, groups have wider gaps,
// strong beats are red. Tap a dot to make it strong / normal.
(function () {
  var root = document.querySelector('.demo');
  if (!root) return;
  var dotsEl = root.querySelector('.dots'), bpmEl = root.querySelector('.info b'),
      meterEl = root.querySelector('.info small'), go = document.querySelector('.controls .go');
  var state = { beats: 4, note: 4, groups: [], strong: [0], bpm: 100, running: false, beat: -1 }, timer = null;

  function groupStarts(groups) {
    var s = [], sum = 0;
    for (var i = 0; i < groups.length; i++) { s.push(sum); sum += groups[i]; }
    return s;
  }
  function draw() {
    var starts = groupStarts(state.groups), html = '';
    for (var i = 0; i < state.beats; i++) {
      var cls = 'dot' + (i && starts.indexOf(i) >= 0 ? ' gs' : '') +
        (state.strong.indexOf(i) >= 0 ? ' strong' : '') + (i === state.beat ? ' on' : '');
      html += '<span class="' + cls + '" data-i="' + i + '"></span>';
    }
    dotsEl.innerHTML = html;
    bpmEl.textContent = state.bpm;
    meterEl.textContent = state.beats + '/' + state.note + (state.groups.length ? ' (' + state.groups.join('+') + ')' : '');
  }
  function tick() {
    state.beat = (state.beat + 1) % state.beats;
    draw();
    // Light up for half a beat (at most 0.3 s), like the app.
    setTimeout(function () {
      var on = dotsEl.querySelector('.on');
      if (on) on.classList.remove('on');
    }, Math.min(300, 30000 / state.bpm));
  }
  function restart() {
    clearInterval(timer);
    state.beat = -1;
    if (state.running) { tick(); timer = setInterval(tick, 60000 / state.bpm); }
    go.textContent = state.running ? go.dataset.stop : go.dataset.start;
    draw();
  }
  document.querySelectorAll('.controls [data-meter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.dataset.meter.split('/'), g = b.dataset.groups ? b.dataset.groups.split('+').map(Number) : [];
      state.beats = +m[0]; state.note = +m[1]; state.groups = g;
      state.strong = g.length ? groupStarts(g) : [0];
      document.querySelectorAll('.controls [data-meter]').forEach(function (x) { x.classList.toggle('sel', x === b); });
      restart();
    });
  });
  root.querySelector('.arrow.l').addEventListener('click', function () { state.bpm = Math.max(20, state.bpm - 5); restart(); });
  root.querySelector('.arrow.r').addEventListener('click', function () { state.bpm = Math.min(300, state.bpm + 5); restart(); });
  dotsEl.addEventListener('click', function (e) {
    var i = e.target.dataset && e.target.dataset.i;
    if (i === undefined) { state.running = !state.running; restart(); return; }
    i = +i;
    var k = state.strong.indexOf(i);
    if (k >= 0) state.strong.splice(k, 1); else state.strong.push(i);
    draw();
  });
  go.addEventListener('click', function () { state.running = !state.running; restart(); });
  draw();
})();
