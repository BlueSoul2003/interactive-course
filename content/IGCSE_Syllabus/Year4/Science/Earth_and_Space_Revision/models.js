(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const shell = (label, content) => `<svg viewBox="0 0 560 300" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg"><style>text{font:14px Arial,sans-serif;fill:#193345}</style>${content}</svg>`;
  const planets = [
    ['Mercury', 'First from the Sun. An inner, rocky planet.'], ['Venus', 'Second from the Sun, between Mercury and Earth. An inner planet.'],
    ['Earth', 'Third from the Sun. Our home has liquid surface water and an atmosphere.'], ['Mars', 'Fourth from the Sun. The outermost of the four inner planets.'],
    ['Jupiter', 'Fifth from the Sun. The largest planet and the first of the outer group.'], ['Saturn', 'Sixth from the Sun. Especially well known for its prominent rings.'],
    ['Uranus', 'Seventh from the Sun, between Saturn and Neptune. An outer planet.'], ['Neptune', 'Eighth from the Sun. The outermost of the eight recognised planets.']
  ];
  let model = 'rotation';
  function render() {
    document.querySelectorAll('[data-model]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === model)));
    if (model === 'rotation') {
      $('modelContent').innerHTML = shell('Sunlight comes from the left. Move the slider to rotate an equatorial place around Earth, viewed above the North Pole.', `<defs><clipPath id="labGlobe"><circle cx="340" cy="140" r="97"/></clipPath></defs><circle cx="70" cy="140" r="32" fill="#eabb58"/><text x="56" y="190">Sun</text><path d="M117 100h112m-8-5 8 5-8 5M117 140h112m-8-5 8 5-8 5M117 180h112m-8-5 8 5-8 5" stroke="#c19134" stroke-width="2" fill="none"/><circle cx="340" cy="140" r="97" fill="#75b8c4"/><path d="M340 40h100v200H340z" fill="#203749" clip-path="url(#labGlobe)"/><circle cx="340" cy="140" r="3" fill="white"/><g id="labPlace"><circle cx="260" cy="140" r="9" fill="#eabb58" stroke="#193345" stroke-width="2"/><text x="251" y="119" id="labPlaceLabel">P</text></g><text x="265" y="266">View above North Pole</text>`) + '<label class="model-control" for="rotationSlider">Rotate Earth <input id="rotationSlider" type="range" min="0" max="360" value="0" step="5"></label><p id="modelResult" class="model-result" role="status"></p><p class="report-note">P is a place on the equator. The Sun is fixed; rotation is anticlockwise in this view. This simple model omits axial tilt. Sizes and distances are not to scale.</p>';
      $('rotationSlider').oninput = updateRotation; updateRotation();
    } else if (model === 'shadow') {
      $('modelContent').innerHTML = shell('A one-metre upright stick on level ground. Changing the light elevation changes shadow length.', `<path d="M40 235h480" stroke="#829b91" stroke-width="2"/><path d="M230 235v-80" stroke="#193345" stroke-width="8"/><text x="193" y="143">1 m</text><path id="labShadow" stroke="#607b7c" stroke-width="9"/><path id="labRay" stroke="#d8a539" stroke-width="2" stroke-dasharray="6 4" fill="none"/><circle id="labLamp" r="16" fill="#eabb58"/>`) + '<label class="model-control" for="shadowSlider">Light elevation <input id="shadowSlider" type="range" min="20" max="75" value="45" step="1"></label><p id="modelResult" class="model-result" role="status"></p><p class="report-note">An idealised 1 m upright stick, level ground and parallel light rays. Compare the trend, not a universal time of day. Observe real shadows without looking directly at the Sun.</p>';
      $('shadowSlider').oninput = updateShadow; updateShadow();
    } else {
      $('modelContent').innerHTML = '<p class="report-note">From the Sun outward. Select a planet to inspect it.</p><div class="planet-buttons">' + planets.map(([name], i) => `<button type="button" data-planet="${i}" aria-pressed="false"><span class="planet-dot p${i}"></span><small>${i + 1}</small>${name}</button>`).join('') + '</div><p id="planetResult" class="model-result" role="status">Choose a neighbour.</p><p class="report-note">Order only. Planet sizes and distances are not to scale, and this is not a map of their current orbital positions.</p>';
      $('modelContent').querySelectorAll('[data-planet]').forEach(b => b.onclick = () => { document.querySelectorAll('[data-planet]').forEach(p => p.setAttribute('aria-pressed', String(p === b))); const p = planets[Number(b.dataset.planet)]; $('planetResult').textContent = `${p[0]}: ${p[1]}`; });
    }
  }
  function updateRotation() {
    const degrees = Number($('rotationSlider').value), rad = Math.PI - degrees * Math.PI / 180;
    const x = 340 + 80 * Math.cos(rad), y = 140 + 80 * Math.sin(rad);
    const point = $('labPlace').querySelector('circle'); point.setAttribute('cx', x); point.setAttribute('cy', y);
    $('labPlaceLabel').setAttribute('x', x - 7); $('labPlaceLabel').setAttribute('y', y - 19); $('labPlaceLabel').style.fill = x > 340 ? '#ffffff' : '#193345';
    const boundary = Math.abs(x - 340) < 0.01;
    $('modelResult').textContent = `${degrees}° turned · P is ${boundary ? 'at the day–night boundary' : x < 340 ? 'in daylight' : 'on the night side'}.`;
  }
  function updateShadow() {
    const degrees = Number($('shadowSlider').value), slope = Math.tan(degrees * Math.PI / 180), length = 1 / slope;
    const x = 230 + 80 * length, lampY = 155 - 70 * Math.sin(degrees * Math.PI / 180), lampX = 230 - 70 * Math.cos(degrees * Math.PI / 180);
    $('labShadow').setAttribute('d', `M230 235H${x}`); $('labRay').setAttribute('d', `M${lampX} ${lampY}L${x} 235`);
    $('labLamp').setAttribute('cx', lampX); $('labLamp').setAttribute('cy', lampY);
    $('modelResult').textContent = `${degrees}° above the ground · Shadow length: ${length.toFixed(2)} m.`;
  }
  $('modelsButton').onclick = () => { render(); $('modelsDialog').showModal(); };
  $('modelsDialog').addEventListener('close', () => $('modelsButton').focus());
  $('modelTabs').onclick = e => { const b = e.target.closest('[data-model]'); if (b) { model = b.dataset.model; render(); } };
})();
