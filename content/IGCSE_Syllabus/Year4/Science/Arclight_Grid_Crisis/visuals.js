(function () {
  "use strict";

  const shell = (inner, label) => `
    <svg viewBox="0 0 900 330" role="img" aria-label="${label}">
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0V30" fill="none" stroke="#26343f" stroke-width="1"/>
        </pattern>
        <filter id="soft"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#05090d" flood-opacity=".45"/></filter>
      </defs>
      <rect width="900" height="330" fill="#0f161d"/>
      <rect width="900" height="330" fill="url(#grid)"/>
      ${inner}
    </svg>`;

  const wire = (points, active = false) => `<polyline points="${points}" fill="none" stroke="${active ? "#e57a43" : "#8a98a3"}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  const node = (x, y, text) => `<g transform="translate(${x} ${y})"><circle r="26" fill="#1f2b35" stroke="#d07247" stroke-width="3"/><text x="0" y="6" text-anchor="middle" fill="#f2f0ea" font-size="18" font-family="Segoe UI, sans-serif" font-weight="700">${text}</text></g>`;
  const lamp = (x, y, text) => `<g transform="translate(${x} ${y})" filter="url(#soft)"><circle r="34" fill="#1b252e" stroke="#e57a43" stroke-width="4"/><path d="M-14-14L14 14M14-14L-14 14" stroke="#f2c2a9" stroke-width="4"/><text x="0" y="58" text-anchor="middle" fill="#c9d1d7" font-size="16">${text}</text></g>`;
  const meter = (x, y, text, value) => `<g transform="translate(${x} ${y})" filter="url(#soft)"><rect x="-58" y="-42" width="116" height="84" rx="12" fill="#202d39" stroke="#62717d" stroke-width="3"/><path d="M-34 15A35 35 0 0 1 34 15" fill="none" stroke="#d6dde1" stroke-width="3"/><path d="M0 14L19-9" stroke="#e57a43" stroke-width="4"/><text x="0" y="-12" text-anchor="middle" fill="#f2f0ea" font-size="18" font-weight="700">${text}</text><text x="0" y="66" text-anchor="middle" fill="#f2b18f" font-size="17">${value}</text></g>`;
  const instrument = (x, y, text, value) => `<g transform="translate(${x} ${y})" filter="url(#soft)"><circle r="34" fill="#202d39" stroke="#71808b" stroke-width="4"/><text x="0" y="9" text-anchor="middle" fill="#f2f0ea" font-size="27" font-family="Segoe UI, sans-serif" font-weight="700">${text}</text><text x="0" y="59" text-anchor="middle" fill="#f2b18f" font-size="17">${value}</text></g>`;

  const visuals = {
    diagnostic: shell(`
      ${wire("160,180 280,180", true)}${wire("305,180 486,180", true)}${wire("554,180 648,180", true)}${wire("732,180 740,180 740,270 160,270 160,180", true)}
      <g><line x1="280" y1="150" x2="280" y2="210" stroke="#f2f0ea" stroke-width="6"/><line x1="305" y1="163" x2="305" y2="197" stroke="#f2f0ea" stroke-width="4"/><text x="292" y="130" text-anchor="middle" fill="#c6d0d6" font-size="16">CELL</text></g>
      ${lamp(520,180,"LAMP")}
      <g transform="translate(690 180)" filter="url(#soft)"><circle r="42" fill="#202d39" stroke="#71808b" stroke-width="4"/><text x="0" y="8" text-anchor="middle" fill="#f2f0ea" font-size="28" font-family="Segoe UI, sans-serif" font-weight="700">A</text><text x="0" y="68" text-anchor="middle" fill="#f2b18f" font-size="17">0.40 A</text></g>
      <text x="120" y="48" fill="#f2f0ea" font-size="24" font-family="Kenney Future, sans-serif">ONE LOOP. ONE CURRENT.</text>
      <text x="120" y="77" fill="#9eabb5" font-size="17">Trace charge around the complete path.</text>
    `, "A complete series circuit with a cell, lamp and ammeter"),

    diagnosticOpen: shell(`
      ${wire("160,180 280,180", true)}${wire("305,180 390,180", true)}${wire("460,180 486,180", true)}${wire("554,180 740,180 740,270 160,270 160,180", true)}
      <g><line x1="280" y1="150" x2="280" y2="210" stroke="#f2f0ea" stroke-width="6"/><line x1="305" y1="163" x2="305" y2="197" stroke="#f2f0ea" stroke-width="4"/><text x="292" y="130" text-anchor="middle" fill="#c6d0d6" font-size="16">CELL</text></g>
      <g><circle cx="390" cy="180" r="7" fill="#e57a43"/><circle cx="460" cy="180" r="7" fill="#e57a43"/><line x1="392" y1="174" x2="448" y2="138" stroke="#f2f0ea" stroke-width="7" stroke-linecap="round"/><text x="425" y="116" text-anchor="middle" fill="#f2b18f" font-size="17" font-weight="700">OPEN SWITCH</text></g>
      ${lamp(520,180,"LAMP")}
      <text x="120" y="48" fill="#f2f0ea" font-size="24" font-family="Kenney Future, sans-serif">THE LOOP IS OPEN.</text>
      <text x="120" y="77" fill="#9eabb5" font-size="17">The visible gap is intentional. No complete path exists.</text>
    `, "A series circuit with an intentionally open switch"),

    networks: shell(`
      ${wire("120,80 740,80", true)}${wire("120,260 740,260", true)}
      ${wire("120,80 120,140", true)}${wire("120,180 120,260", true)}
      <g><line x1="88" y1="145" x2="152" y2="145" stroke="#f2f0ea" stroke-width="6"/><line x1="101" y1="176" x2="139" y2="176" stroke="#f2f0ea" stroke-width="4"/><line x1="120" y1="140" x2="120" y2="145" stroke="#e57a43" stroke-width="7"/><line x1="120" y1="176" x2="120" y2="180" stroke="#e57a43" stroke-width="7"/><text x="166" y="151" fill="#f2b18f" font-size="18" font-weight="700">+</text><text x="166" y="182" fill="#9eabb5" font-size="20" font-weight="700">−</text><text x="72" y="215" fill="#c6d0d6" font-size="16">SUPPLY</text></g>
      ${wire("320,80 320,136", true)}${wire("320,204 320,260", true)}
      ${wire("520,80 520,136", true)}${wire("520,204 520,260", true)}
      ${wire("720,80 720,136", true)}${wire("720,204 720,260", true)}
      ${lamp(320,170,"BRANCH A")}${lamp(520,170,"BRANCH B")}${lamp(720,170,"BRANCH C")}
      <circle cx="320" cy="80" r="6" fill="#e57a43"/><circle cx="320" cy="260" r="6" fill="#e57a43"/><circle cx="520" cy="80" r="6" fill="#e57a43"/><circle cx="520" cy="260" r="6" fill="#e57a43"/><circle cx="720" cy="80" r="6" fill="#e57a43"/><circle cx="720" cy="260" r="6" fill="#e57a43"/>
      <text x="250" y="37" fill="#f2f0ea" font-size="23" font-family="Kenney Future, sans-serif">INDEPENDENT POWER ROUTES</text>
    `, "Three lamps on independent parallel branches"),

    measurement: shell(`
      <line x1="100" y1="275" x2="510" y2="275" stroke="#8a98a3" stroke-width="4"/>
      <line x1="100" y1="275" x2="100" y2="55" stroke="#8a98a3" stroke-width="4"/>
      <path d="M100 275C180 250 260 218 330 170S445 82 510 64" fill="none" stroke="#e57a43" stroke-width="7"/>
      <line x1="100" y1="275" x2="510" y2="75" stroke="#6eb58a" stroke-width="5" stroke-dasharray="12 9"/>
      <text x="520" y="282" fill="#c8d1d7" font-size="17">VOLTAGE</text><text x="52" y="48" fill="#c8d1d7" font-size="17">CURRENT</text>
      <text x="295" y="55" fill="#f2f0ea" font-size="23" font-family="Kenney Future, sans-serif">READ THE SHAPE</text>
      ${meter(680,120,"V","4.0 V")}${meter(680,235,"A","0.20 A")}
      <text x="165" y="120" fill="#77bd90" font-size="16">OHMIC</text><text x="400" y="137" fill="#ef9b73" font-size="16">FILAMENT</text>
    `, "Current-voltage graph with voltmeter and ammeter readings"),

    power: shell(`
      <text x="90" y="55" fill="#f2f0ea" font-size="24" font-family="Kenney Future, sans-serif">EMERGENCY ENERGY BUDGET</text>
      <g transform="translate(90 90)"><rect width="720" height="78" rx="14" fill="#202d39" stroke="#4b5b67" stroke-width="3"/><rect x="12" y="12" width="390" height="54" rx="9" fill="#c75b2a"/><text x="430" y="48" fill="#f2f0ea" font-size="21">140 W OF 160 W</text></g>
      ${node(180,235,"60")}${node(390,235,"80")}${node(600,235,"120")}
      <text x="180" y="290" text-anchor="middle" fill="#c9d2d8" font-size="16">LIGHTS W</text><text x="390" y="290" text-anchor="middle" fill="#c9d2d8" font-size="16">COMMS W</text><text x="600" y="290" text-anchor="middle" fill="#c9d2d8" font-size="16">HEATER W</text>
    `, "Emergency power budget showing lighting, communication and heater loads"),

    faults: shell(`
      <text x="90" y="52" fill="#f2f0ea" font-size="24" font-family="Kenney Future, sans-serif">TRACE THE BREAK</text>
      <text x="90" y="82" fill="#9fadb7" font-size="17">The voltmeter is across the break. The ammeter is in series.</text>
      ${wire("90,190 230,190", true)}${wire("330,190 471,190")}${wire("539,190 636,190")}${wire("704,190 790,190 790,275 90,275 90,190")}
      <g><circle cx="230" cy="190" r="7" fill="#e57a43"/><circle cx="330" cy="190" r="7" fill="#8a98a3"/><line x1="232" y1="184" x2="292" y2="128" stroke="#f2f0ea" stroke-width="6" stroke-linecap="round"/><text x="280" y="234" text-anchor="middle" fill="#f1a47e" font-size="17">OPEN FAULT</text></g>
      ${wire("230,190 230,112 246,112")}${wire("314,112 330,112 330,190")}${instrument(280,112,"V","24.0 V")}
      ${lamp(505,190,"LOAD")}${instrument(670,190,"A","0.00 A")}
    `, "Open circuit fault with voltage and current evidence"),

    beyond: shell(`
      <text x="80" y="52" fill="#f2f0ea" font-size="24" font-family="Kenney Future, sans-serif">REAL CELL MODEL</text>
      ${wire("120,160 120,115 285,115", true)}${wire("415,115 535,115", true)}${wire("665,115 780,115 780,260 120,260 120,200", true)}
      <g><line x1="88" y1="165" x2="152" y2="165" stroke="#f2f0ea" stroke-width="6"/><line x1="101" y1="194" x2="139" y2="194" stroke="#f2f0ea" stroke-width="4"/><line x1="120" y1="160" x2="120" y2="165" stroke="#e57a43" stroke-width="7"/><line x1="120" y1="194" x2="120" y2="200" stroke="#e57a43" stroke-width="7"/><text x="164" y="170" fill="#f2b18f" font-size="18" font-weight="700">+</text><text x="164" y="201" fill="#9eabb5" font-size="20" font-weight="700">−</text><text x="82" y="232" fill="#cbd4da" font-size="16">EMF</text></g>
      <g filter="url(#soft)"><rect x="285" y="91" width="130" height="48" rx="5" fill="#202d39" stroke="#e57a43" stroke-width="4"/><text x="350" y="122" text-anchor="middle" fill="#f2f0ea" font-size="23" font-family="Segoe UI, sans-serif" font-style="italic">r</text><text x="350" y="165" text-anchor="middle" fill="#cbd4da" font-size="16">INTERNAL RESISTANCE</text></g>
      <g filter="url(#soft)"><rect x="535" y="91" width="130" height="48" rx="5" fill="#202d39" stroke="#71808b" stroke-width="4"/><text x="600" y="122" text-anchor="middle" fill="#f2f0ea" font-size="23" font-family="Segoe UI, sans-serif" font-style="italic">R</text><text x="600" y="165" text-anchor="middle" fill="#cbd4da" font-size="16">EXTERNAL LOAD</text></g>
      <g><line x1="180" y1="115" x2="250" y2="115" stroke="#f2b18f" stroke-width="5" stroke-linecap="round"/><path d="M250 115L234 105V125Z" fill="#f2b18f"/><text x="215" y="96" text-anchor="middle" fill="#f2b18f" font-size="18" font-family="Segoe UI, sans-serif" font-style="italic" font-weight="700">I</text></g>
      <text x="450" y="310" text-anchor="middle" fill="#aeb9c1" font-size="17">TERMINAL VOLTAGE = EMF − Ir</text>
    `, "Real cell model with internal resistance and external load"),

    boss: shell(`
      <image href="assets/art/reactor-deck-blackout.png" width="900" height="506" y="-88" preserveAspectRatio="xMidYMid slice"/>
      <rect width="900" height="330" fill="url(#bossShade)" opacity=".4"/>
      <defs><linearGradient id="bossShade"><stop stop-color="#0f161d" stop-opacity=".86"/><stop offset=".58" stop-color="#0f161d" stop-opacity=".08"/><stop offset="1" stop-color="#0f161d" stop-opacity=".65"/></linearGradient></defs>
      <rect x="42" y="42" width="380" height="102" rx="14" fill="#111820" fill-opacity=".9" stroke="#c75b2a" stroke-width="3"/>
      <text x="66" y="80" fill="#f4a67e" font-size="16" font-family="Kenney Future Narrow, sans-serif">FINAL INCIDENT</text>
      <text x="66" y="118" fill="#f2f0ea" font-size="27" font-family="Kenney Future, sans-serif">REACTOR DECK BLACKOUT</text>
    `, "Two investigators inspect a damaged reactor power deck")
  };

  window.renderArclightVisual = function (type, question) {
    if (question?.id === "d2") return visuals.diagnosticOpen;
    return visuals[type] || visuals.diagnostic;
  };
}());
