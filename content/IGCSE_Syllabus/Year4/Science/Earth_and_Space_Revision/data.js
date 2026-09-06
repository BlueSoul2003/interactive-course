/* Authored against Topic 7 slides and worksheet; scientific corrections documented in sources below.
   Row format: difficulty | prompt | correct | distractor 1 | distractor 2 | distractor 3 | explanation | optional evidence key.
   Correct options are placed at balanced positions when the bank is constructed. */
(function () {
  'use strict';
  const topics = [
    { id: 'earth', title: 'Our moving Earth', zh: '地球的運動', subtitle: 'Shape, axis, rotation & orbit', mcq: 20, fill: 10, color: '#28728a', vocabulary: 'axis 地軸 · rotation 自轉 · orbit 軌道 · revolution 公轉', note: 'Use a ball and a stick. Ask the learner to show spinning in place, then travelling around a lamp. These are two different motions.' },
    { id: 'day', title: 'Chasing daylight', zh: '晝夜與影子', subtitle: 'Day, night & changing shadows', mcq: 25, fill: 12, color: '#b67925', vocabulary: 'daylight 日光 · shadow 影子 · horizon 地平線 · apparent 看起來的', note: 'Keep the lamp still and turn the globe. For shadows, keep the object fixed and change the lamp position. Never look directly at the Sun.' },
    { id: 'solar', title: 'Our solar neighbourhood', zh: '太陽系鄰居', subtitle: 'The Sun & eight planets', mcq: 25, fill: 13, color: '#aa5340', vocabulary: 'Solar System 太陽系 · inner 內側 · outer 外側 · gravity 引力', note: 'Distinguish order from spacing: an evenly spaced planet diagram can show the correct order without showing real distances or sizes.' },
    { id: 'objects', title: 'Space travellers', zh: '太空中的天體', subtitle: 'Moons, comets & space rocks', mcq: 20, fill: 10, color: '#665d9b', vocabulary: 'moon 衛星 · asteroid 小行星 · comet 彗星 · meteor 流星 · meteorite 隕石', note: 'Classify using evidence: what it is made of, what it orbits, and whether it is in space, glowing in the atmosphere or on the ground.' },
    { id: 'home', title: 'A place for life', zh: '適合生命的家園', subtitle: 'Our home & the bigger picture', mcq: 10, fill: 5, color: '#507c58', vocabulary: 'atmosphere 大氣層 · liquid water 液態水 · galaxy 星系 · model 模型', note: 'Earth is the only world known to support life. This is a statement about evidence, not proof that life cannot exist elsewhere.' }
  ];
  const mcqRows = [
    // 01 — Our moving Earth (20)
    ['earth', `
core|Which object best represents the overall shape of Earth?|A ball|A flat plate|A cone|A cube|Earth is approximately spherical; it is not a flat disc.
core|What is Earth's axis?|An imaginary line through the poles|A ring of rock around Earth|The path around the Sun|The line separating day and night|The axis passes through Earth's centre and its North and South Poles.
core|Which word means spinning around an axis?|Rotation|Reflection|Revolution|Evaporation|Rotation is a spin around an axis; revolution is travel around another body.
core|About how long is one day on Earth?|24 hours|12 hours|30 days|365 days|At this level, use about 24 hours for Earth's daily rotation cycle.
core|What is the name of Earth's path around the Sun?|An orbit|An axis|A shadow|An equator|An orbit is the path followed around another body.
core|About how long does Earth take to orbit the Sun once?|One year|One day|One week|One month|A complete orbit takes about one year, approximately 365¼ days.
apply|A ball stays in the same place while a pupil spins it. Which motion does this model?|Earth's rotation|Earth's orbit around the Sun|The Moon's orbit|A comet approaching the Sun|Spinning in place models rotation, not travel around the Sun.
apply|A pupil carries a globe around a lamp without spinning it. Which motion is missing?|Rotation on its axis|Travel around the lamp|Movement along an orbit|Revolution around the lamp|The model shows an orbit but leaves out the globe's own spin.
apply|Which everyday object could represent the axis in a ball model?|A skewer through its centre|A circle drawn around the ball on the floor|A lamp beside the ball|A shadow behind the ball|A skewer through the centre represents the imaginary axis.
core|In which direction does Earth rotate?|West to east|East to west|North to south|South to north|Earth rotates eastward, so the Sun appears to move westward across the sky.
apply|Viewed from above the North Pole, how does Earth's rotation appear?|Anticlockwise|Clockwise|Back and forth|It has no direction|The viewpoint matters: the same eastward rotation appears anticlockwise from the north.
stretch|Two pupils view a spinning globe from opposite poles and report opposite turning directions. Why can both be right?|They use opposite viewpoints|The globe must reverse its spin|One pole is not moving with Earth|The axis changes into an orbit|Clockwise and anticlockwise depend on which end of the axis you look from.
core|Earth's axis is tilted by about 23.5° relative to which line?|A line perpendicular to its orbital plane|A line along the equator|A line along its orbital plane|Any line pointing at the Moon|The tilt is measured from the perpendicular to the orbital plane, not from the plane itself.
apply|Study the motion log. Which model represents spinning without orbiting?|Model A|Model B|Model C|None of them|A turns on its own axis but stays in one position relative to the lamp.|motions
apply|Study the motion log. Which model represents both of Earth's main motions?|Model C|Model A|Model B|A and B each show both|C spins on its axis and travels around the lamp.|motions
stretch|Using the motion log, what should be added to Model B to make it more like Earth?|Spin the ball on its axis|Stop all movement|Remove the lamp|Change the orbit into a straight path|B already travels around the lamp. Adding a spin models Earth's rotation too.|motions
apply|In the motion log, which two models change position around the lamp?|B and C|A and B|A and C|Only A|Both B and C travel around the lamp, regardless of whether they also spin.|motions
apply|Using a 24-hour day, how many rotations occur in three days?|3|1|12|72|Each day corresponds to approximately one rotation, so three days give three rotations.
stretch|Using a 24-hour rotation, approximately how long is a quarter-turn?|6 hours|4 hours|12 hours|24 hours|A quarter of 24 hours is 6 hours. This describes turning angle, not daylight length everywhere.
stretch|Why is “Earth moves only once a year” misleading?|Earth is continuously rotating and orbiting|Earth only moves during daylight|Earth orbits only in January|Earth stops between rotations|One year is the time for a complete orbit, not the only time Earth moves.
`],
    // 02 — Chasing daylight (25)
    ['day', `
core|What mainly causes day and night on Earth?|Earth rotating on its axis|The Sun switching off each evening|The Moon covering the Sun each night|Earth moving closer to the Sun daily|Rotation carries places into sunlight and then away from it.
core|Which part of Earth experiences daylight?|The side facing the Sun|The side facing away from the Sun|Only the North Pole|Only the equator|Sunlight illuminates the side of Earth facing the Sun.
core|What supplies Earth's daylight?|The Sun|The Moon|Earth's core|The clouds|The Sun produces the light that illuminates Earth.
apply|In the globe diagram, which labelled place is in daylight?|P|Q|Both P and Q|Neither P nor Q|P is on the side facing the incoming sunlight.|dayglobe
apply|In the globe diagram, why is Q dark?|Earth blocks direct sunlight from reaching Q|The Sun has stopped producing light|Q is on a different planet|The Moon covers the entire Sun|Q faces away from the Sun, on the unlit side of Earth.|dayglobe
stretch|The globe makes a half-turn with the lamp fixed. What happens to P in this simplified model?|P moves onto the dark side|P stays facing the lamp|The lamp moves to Q|P leaves the globe|A half-turn carries P to the opposite side of the globe.|dayglobe
apply|Which change would best demonstrate day becoming night at P?|Rotate the globe with the lamp fixed|Switch the lamp off|Cover both P and Q with paper|Move P without moving the globe|Turning the globe models the cause of ordinary day and night.|dayglobe
core|The Sun generally appears to rise in which direction?|East|West|North|South|Earth's eastward rotation makes the Sun generally appear to rise in the east.
core|The Sun generally appears to set in which direction?|West|East|North|South|The apparent daily movement is generally from east toward west.
apply|Why did people once think the Sun went around Earth each day?|The Sun appears to move across the sky|They observed Earth orbiting the Moon|The Sun changes into a planet at night|They could see Earth's axis in the sky|Apparent motion alone can lead to an incorrect explanation if Earth's rotation is ignored.
core|What is a shadow?|A region where an object blocks light|Light made by a dark object|A reflection from a mirror|Gas surrounding a planet|A shadow forms when an object obstructs light.
apply|A lamp is to the left of an opaque upright stick. Where will its shadow fall on the table?|To the right of the stick|Toward the lamp on the left|Inside the lamp|Only above the stick|The shadow extends away from the light source behind the object.
apply|Read the shadow observations. At which recorded time is the shadow shortest?|12:00|08:00|10:00|16:00|The table records the smallest length, 20 cm, at 12:00.|shadows
apply|Read the shadow observations. How does the shadow change between 08:00 and 12:00?|It becomes shorter|It becomes longer|It stays the same length|It disappears from all locations|The recorded length falls from 120 cm to 20 cm.|shadows
stretch|Read the shadow observations. Which statement uses only evidence in the table?|The 16:00 shadow is longer than the 10:00 shadow|The 12:00 shadow is always zero everywhere|The Sun was directly overhead at 12:00|The stick grew during the afternoon|At 16:00 the shadow is 100 cm, longer than the 55 cm measured at 10:00.|shadows
stretch|Read the shadow observations. What is the difference between the longest and shortest recorded shadows?|100 cm|20 cm|120 cm|75 cm|Subtract the shortest length, 20 cm, from the longest, 120 cm.|shadows
apply|In the low-lamp and high-lamp diagrams, which setup gives the longer shadow?|Setup A|Setup B|Both give no shadow|Both must give equal shadows|A has the lower light angle and a longer shadow for the same stick.|shadowmodels
stretch|To test only the effect of light angle in these diagrams, what should stay the same?|The stick's height|The lamp's angle above the table|The shadow's length|The measured result|Keep the stick height fixed while changing the light angle.|shadowmodels
apply|Which conclusion is supported by the two shadow diagrams?|A higher light angle gives a shorter shadow for this stick|The stick is taller in B|The lamp is dimmer in A|All outdoor shadows are the same length|For a fixed upright stick on level ground, a higher light angle makes a shorter shadow.|shadowmodels
core|When the Sun is low near the horizon, shadows of upright objects are usually what?|Long|Always absent|Always circular|Inside the objects|Low-angle sunlight produces long shadows on level ground.
apply|What should you use to record changes in a schoolyard shadow safely?|Measure a stick's shadow on the ground|Stare directly at the Sun|Look at the Sun through a magnifying glass|Point binoculars at the Sun|Observe shadows and record lengths without looking directly at the Sun.
stretch|Why should a shadow investigation keep the stick in the same place?|Moving it would introduce another change|A stick cannot cast shadows twice|The Sun stops moving if it is moved|The stick becomes transparent when moved|Keeping the setup fixed helps compare changes due to the Sun's apparent position.
apply|A pupil says, “The Sun goes out at night.” Which observation challenges this?|Other places have daylight at the same time|Our room becomes dark|Street lamps switch on|Stars become easier to see|Daylight elsewhere shows that the Sun is still shining.
stretch|Why does a globe work better than a flat sheet for modelling day and night?|It shows different sides facing toward and away from light|It makes its own light|It stops the lamp producing heat|It shows exact continent sizes automatically|A globe's spherical shape represents how sunlight illuminates one side of Earth.
stretch|At 12:00 the table still shows a 20 cm shadow. What does this tell you?|A midday shadow need not be zero|The Sun must be below the horizon|Earth stopped rotating|The stick cannot be opaque|The actual observation is nonzero; do not assume the Sun is directly overhead at noon.|shadows
`],
    // 03 — Solar neighbourhood (25)
    ['solar', `
core|What kind of object is the Sun?|A star|A planet|A moon|An asteroid|The Sun is our nearest star and produces its own light.
core|How many recognised planets are in our Solar System?|8|7|9|10|The Solar System has eight planets; dwarf planets are a different category.
core|Which planet is closest to the Sun?|Mercury|Venus|Earth|Mars|Mercury is the innermost planet.
core|Which planet is third from the Sun?|Earth|Venus|Mars|Jupiter|The order begins Mercury, Venus, Earth, Mars.
core|Which planet is farthest from the Sun among the eight planets?|Neptune|Saturn|Uranus|Jupiter|Neptune is the eighth and outermost recognised planet.
core|Which list contains all four inner planets?|Mercury, Venus, Earth, Mars|Earth, Mars, Jupiter, Saturn|Jupiter, Saturn, Uranus, Neptune|Venus, Earth, Saturn, Neptune|The four planets closest to the Sun are the inner planets.
core|Which list contains all four outer planets?|Jupiter, Saturn, Uranus, Neptune|Mercury, Venus, Earth, Mars|Mars, Jupiter, Saturn, Uranus|Earth, Jupiter, Uranus, Neptune|The outer planets lie beyond the four inner planets.
apply|Which planet does not belong with Mercury, Venus and Earth in the inner-planet group?|Saturn|Mars|Venus|Mercury|Saturn is an outer planet; Mars belongs with the other inner planets.
core|Which force keeps planets following curved orbits around the Sun?|Gravity|Friction from air|Magnetism from clouds|An electric cable|The Sun's gravity continually changes the direction of a planet's motion.
apply|Which is the best description of the Solar System?|The Sun and objects gravitationally bound to it|Only the eight planets|All stars in the Milky Way|Only Earth and its Moon|The system includes the Sun, planets, moons and many smaller bodies.
apply|Read the numbered planet strip. Which number marks Mars?|4|2|3|5|Mars is fourth from the Sun.|planetstrip
apply|Read the numbered planet strip. Which planet occupies position 6?|Saturn|Jupiter|Uranus|Neptune|Saturn follows Jupiter and is sixth from the Sun.|planetstrip
apply|On the numbered strip, which positions belong to inner planets?|1–4|3–6|5–8|1–8|The first four planets are the inner group.|planetstrip
apply|On the numbered strip, what lies immediately after Earth moving away from the Sun?|Mars|Venus|Jupiter|Mercury|Earth is third, followed by Mars in fourth position.|planetstrip
stretch|Which fact can the numbered strip show reliably despite its spacing warning?|The order of planets|Their real separation in kilometres|Their exact sizes|Their current positions in space|A schematic strip can show order without scale or current orbital positions.|planetstrip
apply|Read the numbered strip. How many planets lie between Earth and Uranus in order?|3|2|4|5|Mars, Jupiter and Saturn lie between third-place Earth and seventh-place Uranus.|planetstrip
stretch|On the numbered strip, between which numbered positions would the main asteroid belt belong?|4 and 5|1 and 2|2 and 3|7 and 8|The main asteroid belt is between Mars and Jupiter.|planetstrip
core|Which planet is famous for its especially prominent rings?|Saturn|Earth|Mercury|Mars|Saturn has a large, easily recognised ring system.
core|Which is the largest planet in the Solar System?|Jupiter|Earth|Saturn|Neptune|Jupiter is the largest planet, though the Sun is much larger.
apply|Why can we see a planet such as Venus shining in the night sky?|It reflects sunlight|It is a star|It burns like the Sun|It makes daylight for Earth|Visible light from planets is mainly reflected sunlight.
apply|Which pair correctly contrasts a star and a planet in our Solar System?|The Sun produces light; Earth reflects sunlight|Earth produces sunlight; the Sun reflects it|Both are moons|Neither can be seen in space|The Sun is luminous; Earth is illuminated by the Sun.
core|A pupil puts Neptune just after Saturn in a complete planet sequence. What is missing?|Uranus|Jupiter|Mars|Venus|Uranus is between Saturn and Neptune.
apply|Which planet lies between Mercury and Earth?|Venus|Mars|Jupiter|Neptune|Venus is second from the Sun, between first-place Mercury and third-place Earth.
stretch|What is wrong with saying “The Sun is the largest planet”?|The Sun is a star, not a planet|The Sun is smaller than Earth|Jupiter is a star|Planets cannot orbit stars|Size does not make the Sun a planet; it belongs to a different type of object.
stretch|A diagram draws every planet on one side of the Sun. What should a learner remember?|It can show order without showing current orbital positions|Planets always line up on that side|Planets stop moving in diagrams and in space|Only planets on that side feel gravity|Teaching diagrams simplify positions; planets move around their own orbits.
`],
    // 04 — Space travellers (20)
    ['objects', `
core|What is a natural moon?|A natural satellite orbiting a planet|A star inside a galaxy|Any rock on Earth's ground|An artificial spacecraft|In this unit, a moon is a natural object orbiting a planet.
core|What does Earth's Moon orbit?|Earth|Mars|Jupiter|Venus|The Moon travels around Earth while the Earth–Moon system travels around the Sun.
core|Why does the Moon look bright?|It reflects sunlight|It produces light like the Sun|It is made of fire|Earth's atmosphere lights it from inside|Moonlight is reflected sunlight, not light generated like a star's.
core|What is an asteroid generally made of?|Rock and sometimes metal|Only liquid water|Only hot glowing gas|Only frozen air|Asteroids are mostly rocky or metallic small bodies.
core|Where is the main asteroid belt?|Between Mars and Jupiter|Between Earth and the Moon|Inside the Sun|Beyond every galaxy|Many asteroids orbit in the belt between Mars and Jupiter.
core|Which object is especially associated with ice, dust and rock?|A comet|A star|A metal satellite|A gas giant's ring alone|A comet contains frozen material mixed with dust and rock.
apply|Why can a comet become more active near the Sun?|Its ices warm and turn into gas, releasing dust|It turns into a star|Its gravity switches off|Earth's atmosphere reaches it|Solar heating can make ice change directly to gas, releasing dust and forming a coma and tails.
apply|What usually happens to comet activity far from the Sun?|It decreases as heating weakens|It must become a planet|All escaped gas returns to the comet|Its orbit stops|Less heating generally means less gas and dust escape. Escaped material does not all return.
core|What is a meteor?|The streak of light made when a space particle enters the atmosphere|Every asteroid orbiting the Sun|A piece of rock already on the ground|A natural moon|A meteor is the visible atmospheric event, often called a shooting star.
core|What is a meteorite?|Space material that survives to reach the ground|A star moving across the sky|Any comet far from the Sun|A cloud of water vapour|A surviving piece found on the ground is called a meteorite.
apply|Use the object evidence cards. Which object is most likely a comet?|Object B|Object A|Object C|Object D|B contains ice and dust and releases gas near the Sun.|objectcards
apply|Use the object evidence cards. Which is a natural moon?|Object C|Object A|Object B|Object D|C is a natural body orbiting a planet.|objectcards
apply|Use the object evidence cards. Which is a meteorite?|Object D|Object A|Object B|Object C|D is surviving space material found on the ground.|objectcards
stretch|Use the object evidence cards. Which observation best supports classifying A as an asteroid?|It is rocky and orbits the Sun|It has landed on Earth|It produces a tail of gas|It orbits a planet|A's composition and orbit fit an asteroid; the other descriptions belong to other cards.|objectcards
apply|A “shooting star” flashes across the sky. What is the best explanation?|A space particle produces a meteor in the atmosphere|A distant star falls onto Earth|The Moon produces a spark|A planet briefly becomes a star|The name is misleading: a shooting star is a meteor, not a falling star.
stretch|A space rock enters the atmosphere and breaks up completely. What did it NOT leave?|A meteorite on the ground|A possible streak of light|Heated material in the air|Small particles in the atmosphere|A meteorite requires a surviving piece to reach the ground.
apply|Which feature distinguishes an artificial satellite from a natural moon?|An artificial satellite is made by people|An artificial satellite cannot orbit|A natural moon is always brighter|A natural moon must be larger than Earth|Both can orbit planets; their origin distinguishes them.
stretch|Why is a comet's tail not a reliable arrow showing its travel direction?|Sunlight and solar wind influence the tail away from the Sun|The tail always points along the orbit|The tail points toward Earth|Comets only move backwards|Tail orientation is governed by solar effects, not simply by the direction of travel.
apply|Which statement about moons is correct?|Other planets can have moons too|Only Earth can have a moon|Every moon is a star|All planets have exactly one moon|Several planets have natural satellites; Earth is not unique in having one.
stretch|Why is “all space rocks are meteorites” incorrect?|The name meteorite refers to material that reaches the ground|Meteorites must be made of ice only|Asteroids never move|All space rocks orbit Earth|Location and what has happened to the material affect the name used.
`],
    // 05 — A place for life (10)
    ['home', `
core|What surrounds Earth as a layer of gases?|The atmosphere|The axis|The asteroid belt|The crust alone|The atmosphere is the gaseous envelope around Earth.
core|Which form of water is especially important for life as we know it?|Liquid water|Only water vapour|Only ice|Water made of metal|All known life depends on water; Earth's surface has abundant liquid water.
core|What is the name of our galaxy?|The Milky Way|The Solar System|The Moon|The atmosphere|Our Solar System is part of the Milky Way galaxy.
apply|Which sequence goes from a smaller system to a larger containing system?|Earth → Solar System → Milky Way → universe|Milky Way → Earth → universe → Solar System|Universe → Solar System → Earth → Milky Way|Solar System → universe → Earth → Milky Way|Earth belongs to the Solar System, inside our galaxy, within the universe.
apply|Use the world comparison table. Which world has the best listed conditions for Earth-like life?|World B|World A|World C|All are equally suitable|B has liquid surface water and a moderate surface temperature in the table.|worlds
stretch|Does the world comparison table prove that B contains living things?|No; suitable conditions are not proof of life|Yes; liquid water always creates life|Yes; all moderate worlds are inhabited|No; life cannot use liquid water|The table supports suitability, but direct evidence is needed to show living things exist.|worlds
apply|Use the world comparison table. Which missing condition limits A for Earth-like surface life?|Liquid surface water|A solid surface of any kind|A name|A place in the table|A has only ice listed and is very cold, unlike the liquid-water condition in B.|worlds
apply|How do greenhouse gases help keep Earth warm?|They absorb and re-emit some outgoing infrared energy|They stop all heat escaping forever|They make Earth produce sunlight|They switch off cooling only at night|Some outgoing heat is retained by the greenhouse effect; energy still escapes to space.
stretch|Why is a classroom Solar System model often labelled “not to scale”?|Real sizes and distances are difficult to show together in a small space|Planets have no measurable size|The Solar System has no order|The Sun is the same size as every planet|Distances are enormous compared with planet sizes, making one classroom scale impractical.
stretch|Which statement about life elsewhere is scientifically careful?|Earth is the only world currently known to support life|Life elsewhere has been proved impossible|Every planet with air has animals|No evidence is needed to claim life|Known evidence supports life on Earth; it does not prove that life elsewhere is impossible.
`]
  ];
  // Fill rows: level | sentence with ___ | accepted answers (slash = alternatives; semicolon = next blank) | explanation | optional evidence.
  const fillRows = [
    ['earth', `
core|Earth is approximately a ___ in shape.|sphere/ball|A sphere is a useful simple model of Earth's overall shape.
core|The imaginary line through Earth's poles is its ___.|axis|Earth rotates around its axis.
core|Spinning on an axis is called ___.|rotation|Rotation and travelling around another body are different motions.
core|Earth's daily rotation cycle lasts about ___ hours.|24/twenty-four/twenty four|Use approximately 24 hours for a day.
core|Earth's path around the Sun is its ___.|orbit|An orbit is a path around another body.
apply|One complete journey around the Sun takes Earth about one ___.|year|A year is about 365¼ days.
apply|Earth rotates from west to ___.|east|The direction is eastward.
apply|The axis passes through the North and South ___.|poles|The poles are the two ends of Earth's rotational axis at the surface.
stretch|In the motion log, Model ___ shows both spinning and travelling around the lamp.|C/model C|C represents both rotation and revolution.|motions
stretch|Using a 24-hour rotation, half a turn takes about ___ hours.|12/twelve|Half of 24 is 12; this calculation is about rotation angle.
`],
    ['day', `
core|The side of Earth facing away from the Sun experiences ___.|night/night-time/nighttime/night time|Earth blocks sunlight from the side facing away.
core|The Sun generally appears to rise in the ___ and set in the ___.|east;west|Earth's eastward spin explains this apparent daily movement.
core|An opaque object blocks light and forms a ___.|shadow|The region behind the object receives less direct light.
core|The line where the sky appears to meet the ground is the ___.|horizon|Near the horizon, the Sun has a low angle in the sky.
apply|In the globe diagram, place ___ faces the incoming sunlight.|P/place P|P is on the illuminated side.|dayglobe
apply|In the globe diagram, place ___ is on the night side.|Q/place Q|Q is on the side facing away from the Sun.|dayglobe
apply|At 10:00 in the shadow table, the shadow is ___ cm long.|55/fifty-five/fifty five|Read the 10:00 row, which records 55 cm.|shadows
apply|Between 12:00 and 16:00 in the table, the shadow becomes ___.|longer|The length increases from 20 cm to 100 cm.|shadows
apply|In the lamp diagrams, setup ___ produces the shorter shadow.|B/setup B|The higher light angle in B produces a shorter shadow.|shadowmodels
stretch|For a fair comparison of lamp angles, keep the stick's ___ unchanged.|height|Changing stick height would also change shadow length.
stretch|From 08:00 to 10:00 in the table, shadow length decreases by ___ cm.|65/sixty-five/sixty five|120 minus 55 equals 65 cm.|shadows
stretch|In a globe-and-lamp model, keep the lamp fixed and ___ the globe to show day and night.|rotate/spin/turn|Earth's rotation causes the change, not the Sun switching off.
`],
    ['solar', `
core|The star at the centre of our Solar System is the ___.|Sun|The Sun supplies light and its gravity influences the system.
core|There are ___ recognised planets in our Solar System.|8/eight|This count excludes dwarf planets.
core|The planet closest to the Sun is ___.|Mercury|Mercury is first in the planet order.
core|The second planet from the Sun is ___.|Venus|Venus is between Mercury and Earth.
core|The third planet from the Sun is ___.|Earth|Earth follows Venus and comes before Mars.
apply|On the numbered strip, planet 4 is ___.|Mars|Mars is the fourth planet.|planetstrip
apply|Mercury, Venus, Earth and Mars are the ___ planets.|inner|They form the four planets closest to the Sun.
apply|Jupiter, Saturn, Uranus and Neptune are the ___ planets.|outer|They are farther from the Sun than the inner planets.
apply|The force that keeps planets in orbit is ___.|gravity/gravitation/gravitational attraction|Gravity continually bends the paths of orbiting planets.
apply|The planet between Saturn and Neptune is ___.|Uranus|Uranus is seventh from the Sun.
stretch|On the numbered strip, position ___ belongs to Jupiter.|5/five|Jupiter follows Mars and is the fifth planet.|planetstrip
core|Unlike the Sun, planets are visible mainly because they ___ sunlight.|reflect|Producing light and reflecting light are different.
stretch|On the strip, the main asteroid belt belongs between Mars and ___.|Jupiter|The main belt lies between the fourth and fifth planets.|planetstrip
`],
    ['objects', `
core|A natural satellite orbiting a planet is a ___.|moon|A moon is naturally formed rather than built by people.
core|Earth's natural satellite is called the ___.|Moon|The Moon orbits Earth.
core|A small rocky body orbiting the Sun is called an ___.|asteroid|Asteroids are rocky or metallic bodies, unlike ice-rich comets.
core|An icy body that releases gas and dust near the Sun is a ___.|comet|Solar heating makes frozen material escape as gas.
apply|A streak of light made by a space particle in the atmosphere is a ___.|meteor|A meteor is the visible event, not a distant star falling.
apply|A surviving piece of space material on the ground is a ___.|meteorite|The surviving piece is different from the meteor seen in the sky.
apply|The Moon shines by reflecting light from the ___.|Sun|It does not generate light like a star.
apply|On the evidence cards, object ___ is the icy body that becomes active near the Sun.|B/object B|B has the evidence expected for a comet.|objectcards
core|A human-built satellite is ___, while a moon is natural.|artificial/human-made/man-made|Their origin distinguishes artificial satellites from natural moons.
stretch|On the evidence cards, object ___ has survived the journey to the ground.|D/object D|D is a meteorite found after reaching the ground.|objectcards
`],
    ['home', `
core|The gases surrounding Earth form the ___.|atmosphere|Earth's atmosphere contains gases with several important roles.
core|Our Solar System belongs to the ___ galaxy.|Milky Way|The Milky Way contains many stars and planetary systems.
apply|Life as we know it depends on ___ water.|liquid|Liquid water is an important condition for known life.
apply|In the comparison table, world ___ has liquid surface water.|B/world B|B is the only listed world with liquid surface water.|worlds
core|A diagram that uses different size and distance ratios is not to ___.|scale|A single scale would use one consistent ratio for all lengths.
`]
  ];
  const questions = [];
  // Balanced but non-repeating answer positions; deterministic so saved choices stay valid.
  const answerSlots = Array.from({ length: 100 }, (_, i) => i % 4);
  let seed = 7092026;
  for (let i = answerSlots.length - 1; i > 0; i--) {
    seed = seed * 48271 % 2147483647;
    const j = seed % (i + 1);
    [answerSlots[i], answerSlots[j]] = [answerSlots[j], answerSlots[i]];
  }
  for (const [topic, text] of mcqRows) {
    text.trim().split('\n').forEach((line, i) => {
      const [level, prompt, correct, a, b, c, explanation, visual] = line.trim().split('|');
      const options = [a, b, c];
      const answer = answerSlots[questions.length];
      options.splice(answer, 0, correct);
      questions.push({ id: `${topic}-mcq-${String(i + 1).padStart(2, '0')}`, topic, type: 'mcq', level, prompt, options, answer, explanation, visual: visual || null });
    });
  }
  for (const [topic, text] of fillRows) {
    text.trim().split('\n').forEach((line, i) => {
      const [level, prompt, answers, explanation, visual] = line.trim().split('|');
      questions.push({ id: `${topic}-fill-${String(i + 1).padStart(2, '0')}`, topic, type: 'fill', level, prompt, answers: answers.split(';').map(blank => blank.split('/')), explanation, visual: visual || null });
    });
  }
  window.EARTH_SPACE_DATA = { version: 1, id: 'igcse-y4-sci-earth-space-revision', topics, questions,
    sources: [
      { title: 'Topic 7 teaching slides', url: '../Topic7_Earth_and_Space/slides.pdf' },
      { title: 'Topic 7 worksheet', url: '../Topic7_Earth_and_Space/Worksheet.pdf' },
      { title: 'Topic 7 worksheet answer key', url: '../Topic7_Earth_and_Space/Answer_Key.pdf' },
      { title: 'Original Topic 7 learning module', url: '../Topic7_Earth_and_Space/index.html' },
      { title: 'NASA: Earth facts', url: 'https://science.nasa.gov/earth/facts/' },
      { title: 'NASA: Comet facts', url: 'https://science.nasa.gov/solar-system/comets/facts/' },
      { title: 'NASA: What is Earth?', url: 'https://www.nasa.gov/learning-resources/for-kids-and-students/what-is-earth-grades-5-8/' }
    ]
  };
})();
