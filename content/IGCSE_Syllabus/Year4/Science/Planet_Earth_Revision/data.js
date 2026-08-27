(function () {
  'use strict';

  let optionSeed = 0;
  function q(level, prompt, correct, distractor1, distractor2, distractor3, explanation, teachingNote) {
    const raw = [correct, distractor1, distractor2, distractor3];
    const shift = optionSeed++ % 4;
    const options = raw.slice(shift).concat(raw.slice(0, shift));
    return {
      level,
      prompt,
      options,
      answer: options.indexOf(correct),
      explanation,
      teachingNote: teachingNote || explanation
    };
  }

  let blankSeed = 0;
  function cl(level, template, blankSets, explanation, teachingNote) {
    const parts = template.split('___');
    const blanks = blankSets.map((set) => {
      const shift = blankSeed++ % 4;
      const choices = set.slice(shift).concat(set.slice(0, shift));
      return { choices, answer: choices.indexOf(set[0]) };
    });
    return {
      level,
      parts,
      blanks,
      explanation,
      teachingNote: teachingNote || explanation
    };
  }

  const units = {
    structure: {
      section: '6.1',
      title: "Earth's structure",
      subtitle: 'Crust, mantle, core and moving plates',
      image: 'assets/art/earth-layers-kawaii.webp',
      imageAlt: 'Friendly hand-drawn cutaway Earth showing crust, mantle and core',
      caption: 'A thin crust surrounds a much thicker mantle and a two-part metallic core.',
      mcq: [
        q('core', "Which layer forms Earth's thin outer skin?", 'crust', 'mantle', 'outer core', 'inner core', 'The crust is the thin, solid outer layer.'),
        q('core', 'Which layer is the thickest?', 'mantle', 'crust', 'outer core', 'inner core', 'The mantle makes up most of the thickness of Earth.'),
        q('core', 'Which part of the core is liquid?', 'outer core', 'inner core', 'lower mantle', 'oceanic crust', 'The outer core is liquid iron and nickel.'),
        q('core', 'Why is the inner core solid even though it is extremely hot?', 'immense pressure keeps it solid', 'it contains frozen water', 'it receives no heat', 'it is made only of rock', 'Very high pressure prevents the inner core from melting.'),
        q('core', 'Which type of crust is generally thinner and denser?', 'oceanic crust', 'continental crust', 'mantle rock', 'inner-core material', 'Oceanic crust is thinner and denser than continental crust.'),
        q('core', 'Continental crust is mainly associated with which feature?', 'continents and land masses', 'the liquid outer core', 'deep ocean trenches only', 'the centre of Earth', 'Continental crust forms the major land masses.'),
        q('core', 'What are tectonic plates?', 'large moving pieces of the lithosphere', 'clouds of volcanic ash', 'liquid sections of the outer core', 'layers of ocean water', 'Tectonic plates are large rigid pieces of the lithosphere.'),
        q('core', 'Which observation best supports the idea that Earth has internal layers?', 'seismic waves change speed and direction inside Earth', 'clouds move across the sky', 'ocean tides rise twice a day', 'rocks have different colours at the surface', 'Seismic-wave behaviour reveals boundaries and different materials inside Earth.'),
        q('apply', 'A sample is dense, metallic and liquid. Where would it best match conditions inside Earth?', 'outer core', 'continental crust', 'upper mantle', 'inner core', 'The outer core is a liquid metallic layer.'),
        q('apply', 'A seismic wave suddenly changes speed at a boundary. What is the best conclusion?', 'the material properties changed at the boundary', 'the wave ran out of energy completely', 'Earth has no layers', 'the surface temperature changed', 'Wave speed changes when density or physical state changes.'),
        q('core', 'Which sequence runs correctly from the surface towards the centre?', 'crust, mantle, outer core, inner core', 'mantle, crust, inner core, outer core', 'crust, outer core, mantle, inner core', 'inner core, outer core, mantle, crust', 'The correct inward order is crust, mantle, outer core, inner core.'),
        q('apply', 'Why can solid mantle rock still move slowly over geological time?', 'it deforms and flows very slowly under heat and pressure', 'it is actually liquid water', 'gravity disappears below the crust', 'it is hollow', 'Hot mantle rock remains mostly solid but can creep over long times.'),
        q('core', 'Which process helps move tectonic plates?', 'slow convection in the mantle', 'daily sea breezes', 'rainfall on continents', 'the Moon blocking sunlight', 'Heat-driven movement in the mantle contributes to plate motion.'),
        q('apply', 'At a constructive plate boundary, what usually happens?', 'plates move apart and new crust can form', 'plates lock permanently', 'one continent becomes the inner core', 'the mantle stops moving', 'At divergent boundaries, plates separate and magma can form new crust.'),
        q('apply', 'At a destructive plate boundary, dense oceanic crust may do what?', 'sink beneath another plate', 'float into the atmosphere', 'turn immediately into continental crust', 'stop all earthquakes', 'The denser oceanic plate can subduct beneath another plate.'),
        q('core', 'What is the lithosphere?', 'the rigid crust and uppermost mantle', 'the liquid outer core only', 'all water on Earth', 'the atmosphere and clouds', 'The lithosphere is the rigid outer shell broken into plates.'),
        q('apply', 'Why are mountain ranges common where two continental plates converge?', 'the crust is compressed, folded and uplifted', 'the outer core rises to the surface', 'ocean water freezes between the plates', 'wind piles loose rocks upward', 'Compression thickens and uplifts continental crust.'),
        q('stretch', "What mainly drives Earth's global magnetic field?", 'motion of electrically conducting liquid metal in the outer core', 'the solid inner core spinning alone', 'iron rocks in the crust staying still', 'ocean currents moving salt water', 'The geodynamo is driven mainly by motion in the liquid outer core.', 'Correct the common misconception: the solid inner core does not generate the field by itself.'),
        q('apply', 'Which evidence shows that the outer core is liquid?', 'S-waves do not travel through it', 'all surface rocks are magnetic', 'P-waves stop at the crust', 'volcanoes contain ocean water', 'S-waves cannot pass through liquids, so their shadow zone supports a liquid outer core.'),
        q('stretch', 'P-waves pass through solids and liquids. Why do they still bend inside Earth?', 'their speed changes in materials with different properties', 'gravity reverses their direction', 'they become S-waves at every boundary', 'they avoid hot material', 'Refraction occurs because wave speed changes between layers.'),
        q('apply', 'Which pairing is correct?', 'inner core: solid; outer core: liquid', 'inner core: liquid; outer core: solid', 'mantle: gas; crust: liquid', 'crust: gas; mantle: water', 'Pressure keeps the inner core solid while the outer core is liquid.'),
        q('core', 'Which layer has the lowest average density?', 'crust', 'mantle', 'outer core', 'inner core', 'Density generally increases towards the centre, so the crust is least dense.'),
        q('stretch', 'Why can scientists not drill directly to the core?', 'the depth, temperature and pressure are far beyond drilling limits', 'the core moves around the surface', 'the crust has no solid rock', 'Earth is too small for a drill', 'Scientists infer deep structure mainly from seismic and other geophysical evidence.'),
        q('apply', 'A plate moves 4 cm each year. About how far could it move in 100 years?', '4 m', '40 cm', '40 m', '400 m', 'Four centimetres multiplied by 100 is 400 cm, which is 4 m.'),
        q('stretch', 'Which statement best describes a scientific model of Earth?', 'it combines evidence to represent parts that cannot be observed directly', 'it is an exact miniature with no uncertainty', 'it replaces the need for measurements', 'it is based only on imagination', 'Models explain observations and can be revised when new evidence appears.')
      ],
      cloze: []
    },

    volcanoes: {
      section: '6.2',
      title: 'Volcanoes',
      subtitle: 'Magma, vents, hazards and changing landscapes',
      image: 'assets/art/volcano-kawaii.webp',
      imageAlt: 'Cute hand-drawn volcano cross-section with magma chamber and rising magma',
      caption: 'Pressure can drive magma and gases through vents to the surface.',
      mcq: [
        q('core', 'What is molten rock called while it is below the surface?', 'magma', 'lava', 'ash', 'crust', 'Molten rock below the surface is magma.'),
        q('core', 'What is molten rock called after it reaches the surface?', 'lava', 'magma', 'mantle', 'steam', 'At the surface, magma is called lava.'),
        q('core', 'What is the main vent of a volcano?', 'a passage through which magma rises', 'a crack that stores rainwater only', 'the deepest part of the ocean', 'a layer of the inner core', 'The main vent connects the magma system to the surface.'),
        q('core', 'Where can magma collect below a volcano?', 'magma chamber', 'ash cloud', 'crater lake only', 'earthquake focus', 'A magma chamber is a reservoir of molten rock beneath a volcano.'),
        q('core', 'What is a crater?', 'a bowl-shaped opening near the summit', 'the entire mantle', 'a moving tectonic plate', 'a type of seismic wave', 'A crater is the opening around the main vent at the summit.'),
        q('apply', 'Which magma is most likely to erupt explosively?', 'viscous magma containing trapped gas', 'runny magma with little trapped gas', 'cold solid rock with no gas', 'sea water above an inactive vent', 'Viscous magma traps gas, so pressure can build strongly.'),
        q('apply', 'Why does low-viscosity lava usually travel farther?', 'it flows more easily before cooling', 'it contains no thermal energy', 'it is always denser than the core', 'it moves only underground', 'Runny lava can spread quickly and cover a larger area.'),
        q('core', 'Which product is made of tiny fragments of rock and glass blasted into the air?', 'volcanic ash', 'magma chamber', 'tectonic plate', 'inner core', 'Volcanic ash consists of fine fragmented material, not soft fireplace ash.'),
        q('apply', 'Why can volcanic ash be dangerous to aircraft?', 'it can damage engines and reduce visibility', 'it makes wings permanently magnetic', 'it removes all air pressure', 'it turns fuel into water', 'Ash can melt or abrade inside engines and is a serious aviation hazard.'),
        q('core', 'A dormant volcano is best described as one that', 'is quiet now but may erupt again', 'will never erupt again', 'is erupting continuously', 'exists only under the ocean', 'Dormant volcanoes are inactive at present but can become active.'),
        q('core', 'An extinct volcano is one that scientists consider', 'very unlikely to erupt again', 'certain to erupt tomorrow', 'filled only with liquid metal', 'younger than every active volcano', 'Extinct means an eruption is not expected under present geological conditions.'),
        q('apply', 'Which monitoring change can indicate rising magma?', 'increased small earthquakes and ground swelling', 'fewer clouds in the sky', 'lower ocean salinity worldwide', 'a shorter day-night cycle', 'Magma movement can cause quake swarms and deform the volcano.'),
        q('apply', 'Why are gas measurements useful near a volcano?', 'changing gas release may show magma moving upward', 'gases prove an eruption time exactly', 'all volcanic gases are harmless', 'gas levels measure earthquake magnitude', 'Gas composition and rate can change as magma approaches the surface.'),
        q('core', 'Which hazard is a fast, hot cloud of gas, ash and rock moving down a volcano?', 'pyroclastic flow', 'lava plateau', 'tectonic drift', 'tsunami tide', 'Pyroclastic flows are extremely hot, fast and destructive.'),
        q('apply', 'Heavy rain mixes with loose volcanic ash on a slope. What hazard may form?', 'lahar', 'P-wave', 'magnetic storm', 'plate ridge', 'A lahar is a fast volcanic mudflow made from water and loose debris.'),
        q('core', 'Which volcano shape is broad with gentle slopes?', 'shield volcano', 'composite volcano', 'caldera wall only', 'fault scarp', 'Fluid lava builds wide, gently sloping shield volcanoes.'),
        q('core', 'Which volcano often has steep sides made from alternating layers?', 'composite volcano', 'shield volcano', 'ocean trench', 'mid-ocean ridge only', 'Composite volcanoes build layers of lava and fragmented material.'),
        q('apply', 'Why do many volcanoes occur near plate boundaries?', 'plate movement creates pathways and melting that produce magma', 'plate boundaries are always colder', 'all boundaries are above the outer core', 'wind pushes magma towards boundaries', 'Subduction and rifting can generate magma and fractures.'),
        q('stretch', 'At a subduction zone, why can magma form above the sinking plate?', 'water released from the plate lowers the melting point of mantle rock', 'the plate carries sunlight underground', 'the inner core melts the crust directly', 'the ocean boils through the whole mantle', 'Water from the subducting plate promotes partial melting in the mantle.'),
        q('apply', 'Which benefit can follow volcanic activity over time?', 'fertile soils and geothermal energy', 'permanent removal of all hazards', 'stopping every earthquake', 'cooling the inner core', 'Weathered volcanic material can form fertile soils, and heat can provide energy.'),
        q('stretch', 'Why can scientists issue volcano warnings but rarely name an exact eruption time?', 'monitoring shows changing likelihood, not a guaranteed timetable', 'instruments cannot detect any volcano signals', 'volcanoes erupt only at night', 'magma has no measurable effects', 'Multiple signals improve assessment, but volcanic systems remain uncertain.'),
        q('apply', 'A lava flow is moving slowly towards a road. What is the most suitable immediate action?', 'close the road and evacuate the threatened area', 'stand beside the flow to measure it by hand', 'open aircraft routes through the ash', 'wait until the lava reaches buildings', 'Authorities should keep people away and use hazard maps and monitoring.'),
        q('stretch', 'Which statement about volcanic explosivity is most accurate?', 'gas content and magma viscosity strongly affect explosivity', 'all volcanoes erupt with the same force', 'only the height of the mountain matters', 'lava colour alone predicts every eruption', 'Gas pressure and resistance to flow are major controls on eruption style.'),
        q('apply', 'What does ground inflation around a volcano most directly suggest?', 'material is accumulating or moving beneath the surface', 'the crust is becoming weightless', 'ash is falling from a distant storm', 'the inner core has stopped rotating', 'Magma or gas movement can make the ground swell.'),
        q('stretch', 'Why might evacuation zones follow valleys rather than perfect circles?', 'lahars and pyroclastic flows can be channelled along low ground', 'all lava flows uphill', 'seismic waves only move through valleys', 'ash cannot cross a ridge', 'Topography directs some hazards, so risk is not equal in every direction.')
      ],
      cloze: []
    },

    earthquakes: {
      section: '6.3',
      title: 'Earthquakes',
      subtitle: 'Faults, seismic waves, shaking and tsunamis',
      image: 'assets/art/earthquake-kawaii.webp',
      imageAlt: 'Cute hand-drawn landscape showing a fault and seismic waves during an earthquake',
      caption: 'Stored strain is released at the focus and seismic waves spread through Earth.',
      mcq: [
        q('core', 'What is an earthquake?', 'sudden ground shaking caused by released energy', 'slow daily movement of clouds', 'a volcano that has become extinct', 'a change in ocean salinity', 'Earthquakes occur when stored elastic energy is released suddenly.'),
        q('core', 'What is a fault?', 'a fracture where rocks can move', 'a layer of liquid metal', 'a volcanic ash cloud', 'an ocean current', 'Many earthquakes occur when rocks slip along a fault.'),
        q('core', 'What is the focus of an earthquake?', 'the point inside Earth where rupture begins', 'the point on the surface directly above the rupture', 'the nearest weather station', 'the highest mountain nearby', 'The focus, or hypocentre, is the underground starting point.'),
        q('core', 'What is the epicentre?', 'the surface point directly above the focus', 'the centre of the inner core', 'the end of every fault', 'the place with no shaking', 'The epicentre lies on the surface above the focus.'),
        q('core', 'Which seismic waves usually arrive first?', 'P-waves', 'S-waves', 'surface waves', 'tsunami waves', 'P-waves travel fastest through Earth.'),
        q('core', 'Which seismic waves cannot travel through liquids?', 'S-waves', 'P-waves', 'sound waves in air', 'water waves', 'S-waves require a material that can support shear.'),
        q('apply', 'Why can soft sediment shake more strongly than solid bedrock?', 'it can amplify seismic motion', 'it stops all seismic waves', 'it has no mass', 'it becomes part of the outer core', 'Local ground conditions can amplify shaking.'),
        q('core', 'What does earthquake magnitude describe?', 'the size and energy release of the earthquake', 'damage at one specific street only', 'the number of emergency vehicles', 'the time of day', 'Magnitude is a single measure of earthquake size.'),
        q('core', 'What does earthquake intensity describe?', 'the observed shaking and effects at a place', 'the total energy at the focus only', 'the speed of the tectonic plate only', 'the depth of the ocean', 'Intensity varies from place to place for the same earthquake.'),
        q('apply', 'Two towns are the same distance from an epicentre. Why might one be damaged more?', 'building design and ground conditions differ', 'the earthquake has two magnitudes', 'P-waves avoid one town completely', 'gravity works only in one town', 'Risk depends on exposure, construction and local geology as well as distance.'),
        q('core', 'What is an aftershock?', 'a later earthquake in the same region after the main shock', 'a warning sent before any quake begins', 'a volcanic gas release', 'a daily ocean tide', 'Aftershocks follow the main shock as the crust readjusts.'),
        q('apply', 'Why can a shallow earthquake be especially damaging near its epicentre?', 'less distance separates the rupture from the surface', 'shallow earthquakes have no P-waves', 'the crust becomes liquid', 'all shallow earthquakes create tsunamis', 'A shallow focus can produce strong nearby surface shaking.'),
        q('core', 'Which instrument records ground motion?', 'seismometer', 'barometer', 'thermometer', 'ammeter', 'A seismometer detects and records seismic motion.'),
        q('apply', 'Three stations record different P-S arrival-time gaps. What can scientists estimate?', 'the earthquake location by triangulation', 'the exact next earthquake date', 'the outer-core temperature directly', 'the volcano gas composition', 'Distances from several stations can be combined to locate the source.'),
        q('stretch', 'Why does a larger P-S arrival gap usually mean a greater distance from the epicentre?', 'faster P-waves gain more time over slower S-waves', 'S-waves become faster than light', 'P-waves stop at the station', 'the earthquake changes magnitude while travelling', 'The difference in travel time grows with distance.'),
        q('core', 'What should a person indoors usually do during strong shaking?', 'Drop, Cover and Hold On', 'run beside glass windows', 'use a lift immediately', 'stand under a heavy shelf', 'Drop, Cover and Hold On reduces injury from falling objects.'),
        q('apply', 'Why should people avoid lifts after an earthquake?', 'power failure or structural damage may trap them', 'lifts attract seismic waves', 'lifts increase earthquake magnitude', 'stairs cannot be inspected', 'Damaged power and structures can make lifts unsafe.'),
        q('core', 'What can trigger a tsunami?', 'sudden displacement of a large volume of seawater', 'ordinary surface wind alone', 'the daily rise of the tide', 'a distant thunderstorm only', 'Undersea earthquakes, landslides or eruptions can displace water suddenly.'),
        q('apply', 'Which undersea earthquake is most likely to generate a major tsunami?', 'a shallow event that causes vertical seafloor movement', 'a deep event with no seafloor displacement', 'a tiny event on land', 'an event with only horizontal air motion', 'Large vertical displacement of the seafloor can push the water column.'),
        q('core', 'Near the coast, sudden strong shaking is a natural warning to', 'move to high ground or inland', 'go to the beach to watch', 'wait for a social-media photo', 'enter a harbour', 'Strong or long coastal shaking can be a natural tsunami warning.'),
        q('apply', 'Why can tsunami waves become much taller near shore?', 'slower shallow water compresses the wave energy into greater height', 'the waves gain energy from buildings', 'the inner core pulls water upward', 'salt turns into gas', 'Shoaling slows the wave and increases its height.'),
        q('stretch', 'Why is the first tsunami wave not always the largest?', 'the source produces a train of waves with different timing and size', 'the tide stops after one wave', 'all later waves are wind waves', 'seismometers create extra waves', 'Tsunamis arrive as a series, so danger can last for hours.'),
        q('apply', 'Which action best reduces earthquake risk before an event?', 'strengthen buildings and secure heavy furniture', 'predict an exact date from animal behaviour', 'remove every fault from a map', 'turn off all seismometers', 'Prepared buildings and secured contents reduce injury and damage.'),
        q('stretch', 'A magnitude increase of one whole unit represents approximately how much more energy release?', 'about 32 times', 'about 2 times', 'about 5 times', 'exactly 1000 times', 'The magnitude scale is logarithmic; one unit is about 32 times more energy.'),
        q('stretch', 'Why is moment magnitude generally preferred for very large earthquakes?', 'it estimates total fault rupture more reliably without the same saturation problem', 'it uses no instrument data', 'it measures weather effects', 'it always equals local intensity', 'Moment magnitude is based on seismic moment and works across a wide size range.')
      ],
      cloze: []
    },

    alerts: {
      section: '6.4',
      title: 'Earthquake alerts',
      subtitle: 'Detect, deliver and protect before strong shaking arrives',
      image: 'assets/art/early-warning-kawaii.webp',
      imageAlt: 'Cute hand-drawn earthquake sensor sending a warning to a phone and school',
      caption: 'Sensors detect the first waves, then communication systems send alerts ahead of stronger shaking.',
      mcq: [
        q('core', 'What does an earthquake early-warning system detect?', 'an earthquake that has already begun', 'an earthquake months before it begins', 'only volcanic ash', 'future plate motion with certainty', 'Early warning is rapid detection, not prediction.'),
        q('core', 'Which waves are usually detected first by an early-warning network?', 'P-waves', 'S-waves', 'surface waves', 'tsunami waves', 'Fast P-waves arrive before the more damaging shaking.'),
        q('core', 'Why can a warning reach some people before strong shaking?', 'electronic signals travel faster than seismic waves', 'phones stop seismic waves', 'P-waves travel slower than people', 'alerts reverse the fault motion', 'Data can be processed and transmitted faster than damaging waves travel through rock.'),
        q('apply', 'Who is likely to receive the longest warning time?', 'a user farther from the epicentre but within the affected region', 'a user directly above the focus', 'a sensor that has lost power', 'a user outside all communication networks', 'More distant users can have a larger gap between alert arrival and strong shaking.'),
        q('core', 'What is the blind zone of an early-warning system?', 'the area so close to the source that warning arrives too late', 'an area with no faults anywhere', 'a zone where earthquakes cannot happen', 'the centre of the outer core', 'Near the epicentre, strong shaking may arrive before processing and delivery are complete.'),
        q('apply', 'Which action can a few seconds of warning support in a school?', 'students Drop, Cover and Hold On', 'students run down crowded stairs', 'the school predicts the next earthquake', 'the building moves away from the fault', 'A short alert can trigger a practiced protective action.'),
        q('apply', 'Which automatic action can reduce secondary damage?', 'stop trains and close gas valves', 'open every lift door between floors', 'turn off all warning sirens', 'send people towards windows', 'Automated systems can slow transport and isolate hazards.'),
        q('core', 'Why does an early-warning network need many sensors?', 'to detect, confirm and locate events rapidly', 'to prevent plate motion physically', 'to make earthquakes smaller', 'to replace building codes', 'A dense network improves speed and coverage.'),
        q('apply', 'Why are low-latency communications important?', 'each delay reduces useful warning time', 'slow data makes P-waves stop', 'latency changes earthquake magnitude', 'alerts need days to calculate', 'The system has only seconds, so processing and transmission delays matter.'),
        q('core', 'Which statement best distinguishes warning from prediction?', 'warning follows detection; prediction would forecast before rupture', 'warning and prediction are identical', 'prediction begins after shaking stops', 'warning gives an exact future date', 'Early warning reacts after rupture starts, while prediction would occur beforehand.'),
        q('apply', 'A phone alert says strong shaking is expected in 8 seconds. What is the best response?', 'act immediately using the practised safety procedure', 'wait to feel shaking before moving', 'stand next to a window', 'call every friend first', 'Warning time is short, so immediate protective action matters.'),
        q('core', 'What can a seismometer provide to the alert system?', 'rapid measurements of ground motion', 'a guarantee that no aftershock will occur', 'the exact future position of every plate', 'a direct image of the inner core', 'Seismometers send ground-motion observations to processing centres.'),
        q('apply', 'Why might an alert estimate change after the first message?', 'more sensor data improve the location and magnitude estimate', 'the earthquake starts again from zero', 'P-waves reverse direction', 'the phone changes the fault', 'Initial estimates use limited data and can be refined quickly.'),
        q('stretch', 'What is the trade-off when a system alerts very quickly from little data?', 'more warning time but greater risk of an inaccurate estimate', 'less warning time and perfect accuracy', 'no need for sensors', 'the earthquake becomes weaker', 'Fast decisions may use uncertain early information.'),
        q('apply', 'Which is a possible cause of a missed or delayed alert?', 'sensor, power or communication failure', 'too many reinforced buildings', 'the use of P-wave data', 'people practising drills', 'Warning chains depend on working sensors, processing and communication.'),
        q('core', 'Why should alerts use clear, short wording?', 'people must understand and act within seconds', 'long messages travel faster', 'short wording predicts earthquakes', 'technical terms stop shaking', 'Simple instructions reduce hesitation and confusion.'),
        q('apply', 'What makes a warning useful rather than merely informative?', 'it is linked to a practised action', 'it contains as many words as possible', 'it arrives after all shaking ends', 'it hides the expected hazard', 'People need to know exactly what to do when the alert sounds.'),
        q('stretch', 'A station is 60 km from a rupture. Data reach the station electronically almost instantly, but strong waves travel through rock. What creates warning time?', 'the difference between communication speed and seismic-wave travel time', 'a pause in the earthquake itself', 'the phone absorbing wave energy', 'the crust becoming thicker', 'Electronic transmission is much faster than seismic-wave propagation.'),
        q('apply', 'Why can tall buildings still sway after an alert countdown reaches zero?', 'different waves and building responses continue after first strong shaking arrives', 'the alert creates artificial waves', 'the building enters the outer core', 'all P-waves arrive last', 'Shaking duration and structural response extend beyond the first arrival.'),
        q('core', 'Which group especially needs an accessible alert design?', 'people who may not hear, see or understand a single alert format', 'only seismologists', 'only people outside the affected area', 'only aircraft pilots', 'Alerts should combine sound, vibration, visuals and plain language where possible.'),
        q('apply', 'Why are regular drills important?', 'they turn a short warning into a fast, automatic response', 'they prevent every earthquake', 'they increase mobile signal speed', 'they replace safe buildings', 'Practise reduces decision time when seconds matter.'),
        q('stretch', 'Why can an alert be useful even if its magnitude estimate is later revised?', 'timely protective action can matter more than an exact early number', 'all early estimates are always correct', 'magnitude never affects shaking', 'the system predicts the next event', 'Early estimates are uncertain, but rapid action can still reduce harm.'),
        q('apply', 'A user is at the epicentre and receives no advance notice. Does this prove the system failed?', 'not necessarily, because the blind zone may allow no useful lead time', 'yes, every user must receive one minute', 'yes, P-waves always arrive after alerts', 'no, because earthquakes cause no damage there', 'Physical limits mean warning time can be near zero close to rupture.'),
        q('stretch', 'Which improvement most directly increases coverage and reduces detection time?', 'a denser, reliable sensor and communication network', 'fewer sensors farther apart', 'longer alert paragraphs', 'removing automatic controls', 'Closer sensors and robust links can detect events sooner and serve more users.'),
        q('apply', 'After receiving a coastal earthquake alert and feeling long, strong shaking, what additional hazard should be considered?', 'tsunami', 'solar eclipse', 'blizzard', 'magnetic-pole reversal', 'Coastal communities should follow tsunami evacuation guidance after strong or long shaking.')
      ],
      cloze: []
    }
  };

  units.structure.cloze = [
    cl('core', "From the surface inward, the main layers are the ___, the ___ and the core, whose central part is the ___.", [
      ['crust', 'mantle', 'outer core', 'atmosphere'], ['mantle', 'crust', 'ocean', 'inner core'], ['inner core', 'outer core', 'lithosphere', 'magma chamber']
    ], 'Earth is organised into crust, mantle, outer core and inner core.'),
    cl('core', 'Oceanic crust is generally ___ and ___ than continental crust, while continental crust is usually ___.', [
      ['thinner', 'thicker', 'hotter', 'liquid'], ['denser', 'less dense', 'hollow', 'younger everywhere'], ['less dense', 'denser', 'liquid', 'metallic']
    ], 'Oceanic crust is thinner and denser; continental crust is thicker and less dense.'),
    cl('core', 'The outer core is ___, the inner core is ___, and both contain mainly iron and ___.', [
      ['liquid', 'solid', 'gaseous', 'empty'], ['solid', 'liquid', 'gaseous', 'hollow'], ['nickel', 'silicon only', 'water', 'carbon dioxide']
    ], 'The outer core is liquid, the inner core is solid, and both are mainly iron and nickel.'),
    cl('apply', 'Very high ___ keeps the inner core solid, while high ___ and lower pressure allow the outer core to remain ___.', [
      ['pressure', 'humidity', 'wind speed', 'salinity'], ['temperature', 'rainfall', 'altitude', 'sunlight'], ['liquid', 'solid', 'gaseous', 'hollow']
    ], 'Physical state depends on both temperature and pressure.'),
    cl('core', 'The rigid ___ is broken into tectonic ___ that move slowly over the ___.', [
      ['lithosphere', 'outer core', 'atmosphere', 'hydrosphere'], ['plates', 'clouds', 'craters', 'waves'], ['mantle', 'inner core', 'ocean', 'atmosphere']
    ], 'The lithosphere is divided into plates that move over the slowly deforming mantle.'),
    cl('apply', 'At a divergent boundary, plates move ___, ___ may rise, and new ___ can form.', [
      ['apart', 'together', 'nowhere', 'vertically only'], ['magma', 'rainwater', 'inner-core metal', 'ice'], ['crust', 'atmosphere', 'outer core', 'soil only']
    ], 'Divergence allows magma to rise and create new crust.'),
    cl('apply', 'At a convergent boundary, plates move ___; a denser oceanic plate may ___, while colliding continents can form ___.', [
      ['together', 'apart', 'at equal speed forever', 'into the sky'], ['subduct', 'evaporate', 'freeze', 'stop gravity'], ['mountains', 'clouds', 'river deltas', 'coral reefs only']
    ], 'Convergence can cause subduction or mountain building.'),
    cl('core', 'Slow mantle ___ transfers ___, helps move plates, and occurs over very ___ timescales.', [
      ['convection', 'rainfall', 'erosion', 'photosynthesis'], ['energy', 'salt', 'light', 'oxygen'], ['long', 'short', 'daily', 'hourly']
    ], 'Heat-driven mantle convection contributes to plate motion over geological time.'),
    cl('apply', 'Seismic waves can change ___ and ___ at a layer boundary because the material has a different density and ___.', [
      ['speed', 'colour', 'name', 'age'], ['direction', 'mass', 'temperature only', 'location'], ['physical state', 'weather', 'cloud cover', 'surface vegetation']
    ], 'Seismic refraction provides evidence for different internal layers.'),
    cl('stretch', 'P-waves travel through solids and ___, but S-waves cannot pass through ___; this supports a liquid ___ core.', [
      ['liquids', 'vacuum only', 'clouds only', 'light'], ['liquids', 'solids', 'rock', 'metal'], ['outer', 'inner', 'upper', 'continental']
    ], 'The S-wave shadow zone is key evidence for a liquid outer core.'),
    cl('stretch', "Earth's magnetic field is mainly generated by moving ___ metal in the ___ core, a process called the ___.", [
      ['liquid', 'solid', 'gaseous', 'frozen'], ['outer', 'inner', 'upper mantle', 'crust'], ['geodynamo', 'water cycle', 'greenhouse effect', 'rock cycle']
    ], 'Motion of electrically conducting liquid metal in the outer core drives the geodynamo.'),
    cl('apply', 'A scientific model uses ___ to describe things that cannot be observed directly, makes ___, and can be revised with new ___.', [
      ['evidence', 'guesses only', 'advertising', 'tradition'], ['predictions', 'mountains', 'faults', 'weather'], ['data', 'opinions', 'colours', 'stories']
    ], 'Good models are evidence-based, testable and revisable.'),
    cl('stretch', 'If a plate moves 3 cm per year, in 200 years it moves ___ cm, which equals ___ m, showing that slow motion becomes important over ___ time.', [
      ['600', '60', '200', '6000'], ['6', '60', '0.6', '600'], ['long', 'short', 'zero', 'daily']
    ], 'Three centimetres times 200 is 600 cm, or 6 m.'),
  ];

  units.volcanoes.cloze = [
    cl('core', 'Molten rock below the surface is called ___; at the surface it is called ___; fine erupted fragments are called volcanic ___.', [
      ['magma', 'lava', 'ash', 'crust'], ['lava', 'magma', 'mantle', 'steam'], ['ash', 'soil', 'rain', 'metal']
    ], 'Magma becomes lava when it erupts, while ash is fragmented material.'),
    cl('core', 'Magma may collect in a ___, rise through a ___, and leave through the summit ___.', [
      ['magma chamber', 'fault only', 'outer core', 'river basin'], ['vent', 'ocean trench', 'lithosphere', 'cloud'], ['crater', 'epicentre', 'focus', 'plate']
    ], 'A chamber, vent and crater are key parts of a volcano.'),
    cl('apply', 'Magma with high ___ traps gas more easily, pressure ___, and an eruption may become more ___.', [
      ['viscosity', 'salinity', 'speed', 'density only'], ['builds', 'vanishes', 'freezes', 'reverses'], ['explosive', 'silent', 'predictable', 'harmless']
    ], 'Viscous magma resists flow and traps expanding gas.'),
    cl('apply', 'Runny lava has ___ viscosity, lets gas escape more ___, and often forms ___ volcanoes.', [
      ['low', 'high', 'infinite', 'zero temperature'], ['easily', 'slowly', 'never', 'underground only'], ['shield', 'composite', 'extinct only', 'fault']
    ], 'Low-viscosity lava commonly produces broad shield volcanoes.'),
    cl('core', 'A composite volcano is usually ___ sided and contains alternating layers of lava and ___ material, while a shield volcano has ___ slopes.', [
      ['steep', 'gentle', 'flat', 'underwater only'], ['fragmented', 'metallic-core', 'ocean', 'ice'], ['gentle', 'vertical', 'no', 'folded']
    ], 'Composite and shield volcanoes differ in shape and materials.'),
    cl('core', 'A volcano erupting now is ___; one quiet but able to erupt again is ___; one very unlikely to erupt again is ___.', [
      ['active', 'dormant', 'extinct', 'shield'], ['dormant', 'active', 'extinct', 'composite'], ['extinct', 'dormant', 'active', 'young']
    ], 'Active, dormant and extinct describe volcanic status.'),
    cl('apply', 'A hot, fast cloud of gas and ash is a ___ flow; a water-rich volcanic mudflow is a ___; both often move rapidly ___.', [
      ['pyroclastic', 'tidal', 'mantle', 'magnetic'], ['lahar', 'P-wave', 'crater', 'plate'], ['downhill', 'uphill', 'into the core', 'through space']
    ], 'Pyroclastic flows and lahars are fast-moving volcanic hazards.'),
    cl('apply', 'Ash can reduce ___, damage aircraft ___, and cause roofs to collapse when it becomes wet and ___.', [
      ['visibility', 'gravity', 'magnitude', 'pressure'], ['engines', 'seats only', 'wings by magnetism', 'radios only'], ['heavy', 'weightless', 'liquid metal', 'invisible']
    ], 'Ash affects breathing, buildings, transport and aviation.'),
    cl('core', 'Volcano monitoring may include small ___, volcanic ___, and ground swelling called ___.', [
      ['earthquakes', 'tides', 'eclipses', 'storms'], ['gases', 'fish', 'cloud colours only', 'soil insects'], ['inflation', 'subduction', 'erosion', 'condensation']
    ], 'Seismicity, gas and deformation are major monitoring signals.'),
    cl('stretch', 'At a subduction zone, the oceanic plate sinks, releases ___, and helps mantle rock ___ to produce ___.', [
      ['water', 'sunlight', 'oxygen from air', 'icebergs'], ['melt', 'freeze', 'evaporate', 'become weightless'], ['magma', 'soil', 'clouds', 'inner core']
    ], 'Water lowers the melting point of mantle rock above the subducting plate.'),
    cl('apply', 'Volcanoes can create fertile ___, supply geothermal ___, and build new ___.', [
      ['soils', 'outer cores', 'atmospheres', 'fault waves'], ['energy', 'rainfall', 'gravity', 'salinity'], ['land', 'P-waves', 'planets', 'clouds']
    ], 'Volcanic activity has benefits as well as hazards.'),
    cl('stretch', 'Scientists combine several monitoring ___ to estimate changing ___, but cannot guarantee an exact eruption ___.', [
      ['signals', 'colours', 'stories', 'seasons'], ['risk', 'gravity', 'latitude', 'ocean depth'], ['time', 'shape', 'name', 'temperature']
    ], 'Monitoring supports probabilistic warnings rather than exact prediction.'),
    cl('apply', 'Hazard maps consider eruption history, possible flow ___, and local ___ so authorities can plan ___ routes.', [
      ['paths', 'colours', 'magnitudes', 'seasons'], ['topography', 'cloud cover only', 'magnetism', 'day length'], ['evacuation', 'tourism', 'mining', 'flight']
    ], 'Terrain and past deposits help map realistic hazard zones.')
  ];

  units.earthquakes.cloze = [
    cl('core', 'An earthquake begins at the underground ___; the point directly above it is the ___; rocks move along a ___.', [
      ['focus', 'epicentre', 'crater', 'mantle'], ['epicentre', 'focus', 'vent', 'core'], ['fault', 'plate boundary only', 'river', 'cloud']
    ], 'The focus is underground, the epicentre is at the surface, and rupture occurs on a fault.'),
    cl('core', 'Fast ___ waves arrive first; slower ___ waves cannot travel through liquids; strong ___ waves often cause major damage near the surface.', [
      ['P', 'S', 'surface', 'tsunami'], ['S', 'P', 'light', 'sound'], ['surface', 'P', 'electronic', 'ocean current']
    ], 'P, S and surface waves have different speeds and properties.'),
    cl('core', 'A ___ records ground motion, the trace is a ___, and several stations can help locate the ___.', [
      ['seismometer', 'barometer', 'thermometer', 'voltmeter'], ['seismogram', 'weather map', 'hazard sign', 'photograph'], ['epicentre', 'inner core', 'volcano crater', 'cloud base']
    ], 'Seismometers produce seismograms used to analyse and locate earthquakes.'),
    cl('apply', 'As distance from the epicentre increases, the gap between P and S arrival times usually ___ because P-waves are ___ than S-waves; the gap helps estimate ___.', [
      ['increases', 'decreases to zero', 'reverses', 'stays identical'], ['faster', 'slower', 'the same speed', 'not waves'], ['distance', 'temperature', 'magnitude only', 'building height']
    ], 'The growing P-S time gap is used to estimate station distance.', 'Ask the student to identify the first two blanks, then explain that the third refers to what the gap reveals: distance.'),
    cl('core', 'Magnitude describes earthquake ___ and energy release; intensity describes shaking and ___ at a particular ___.' , [
      ['size', 'weather', 'location', 'warning'], ['effects', 'plate speed', 'temperature', 'depth only'], ['place', 'planet', 'time only', 'instrument']
    ], 'Magnitude is one event value, while intensity varies by location.'),
    cl('stretch', 'A one-unit increase in magnitude means about ___ times greater wave amplitude and roughly ___ times more energy, because the scale is ___.', [
      ['10', '2', '32', '100'], ['32', '10', '2', '1000'], ['logarithmic', 'linear', 'random', 'temperature-based']
    ], 'Magnitude scales are logarithmic: about 10 times amplitude and 32 times energy per whole unit.'),
    cl('apply', 'Shaking can be stronger on soft ___ than solid bedrock, poorly designed buildings are more ___, and shallow events can be more damaging ___.', [
      ['sediment', 'steel', 'water only', 'air'], ['vulnerable', 'magnetic', 'elastic', 'invisible'], ['nearby', 'worldwide equally', 'only at sea', 'only at night']
    ], 'Ground, construction and depth all affect damage.'),
    cl('core', 'During shaking indoors, ___ to the ground, take ___ under sturdy furniture, and ___ On.', [
      ['Drop', 'Run', 'Jump', 'Stand'], ['Cover', 'a lift', 'a window', 'the stairs'], ['Hold', 'Move', 'Drive', 'Look']
    ], 'Drop, Cover and Hold On is the standard protective action.'),
    cl('apply', 'After the main shock, ___ may follow; damaged buildings may be ___; people should follow official ___.', [
      ['aftershocks', 'tides', 'eruptions always', 'seasons'], ['unsafe', 'stronger automatically', 'magnetic', 'weightless'], ['instructions', 'rumours', 'predictions', 'advertisements']
    ], 'Aftershocks and hidden structural damage can create continuing danger.'),
    cl('core', 'A tsunami begins when a large volume of ___ is displaced suddenly; the seafloor moves ___, usually during a ___ event.', [
      ['water', 'air', 'lava only', 'sand'], ['vertically', 'nowhere', 'through the atmosphere', 'only sideways with no displacement'], ['shallow', 'weather-related', 'daily', 'silent']
    ], 'Sudden vertical seafloor displacement from a shallow event can generate a tsunami.', 'The third blank is the typical source depth: shallow.'),
    cl('apply', 'Near shore, a tsunami slows in ___ water, grows in ___, and may arrive as a ___ of waves.', [
      ['shallow', 'deep', 'frozen', 'boiling'], ['height', 'speed only', 'salinity', 'temperature'], ['series', 'single guaranteed', 'cloud', 'fault']
    ], 'Shoaling increases wave height, and multiple waves can arrive.'),
    cl('core', 'After strong or long coastal shaking, move to ___ ground or ___, and stay away until the official ___ clear.', [
      ['high', 'low', 'sea-level', 'underground'], ['inland', 'the beach', 'a harbour', 'a river mouth'], ['all-clear', 'first wave', 'sunrise', 'high tide']
    ], 'Natural warnings require immediate evacuation without waiting for a message.')
  ];

  units.alerts.cloze = [
    cl('core', 'Early warning begins after a rupture has ___; sensors first detect fast ___ waves; alerts try to arrive before stronger ___.', [
      ['started', 'been predicted months earlier', 'stopped forever', 'moved to the surface'], ['P', 'S', 'surface only', 'tsunami'], ['shaking', 'sunlight', 'rain', 'tides']
    ], 'Earthquake early warning detects an event already in progress.'),
    cl('core', 'Electronic messages travel much ___ than seismic waves, so users farther from the ___ may receive more warning ___.', [
      ['faster', 'slower', 'at the same speed', 'randomly'], ['source', 'phone', 'sensor screen', 'inner core'], ['time', 'magnitude', 'energy', 'rainfall']
    ], 'Lead time comes from the speed difference between communications and seismic waves.'),
    cl('apply', 'The area too close to receive useful advance notice is the ___ zone; warning time there may be near ___ because processing still takes ___.', [
      ['blind', 'safe', 'volcanic', 'magnetic'], ['zero', 'one hour', 'one day', 'one month'], ['time', 'energy', 'magnitude', 'water']
    ], 'No system can beat the physical limit close to the rupture.'),
    cl('core', 'A warning network needs reliable ___, rapid data ___, and fast communication to ___.', [
      ['sensors', 'predictions', 'clouds', 'volcanoes'], ['processing', 'painting', 'erosion', 'cooling'], ['users', 'the inner core', 'faults', 'magma chambers']
    ], 'Detection, processing and delivery form one time-critical chain.'),
    cl('apply', 'A school alert should trigger students to ___, take ___, and Hold On rather than run to ___.', [
      ['Drop', 'shout', 'queue', 'drive'], ['Cover', 'photos', 'attendance', 'food'], ['stairs', 'a sturdy desk', 'the floor', 'an inside wall']
    ], 'Practised immediate action is safer than crowded evacuation during shaking.'),
    cl('apply', 'Automated warning can slow ___, open fire-station doors, and close ___ valves to reduce secondary ___.', [
      ['trains', 'tectonic plates', 'P-waves', 'faults'], ['gas', 'water bottles', 'seismic', 'weather'], ['hazards', 'magnitudes', 'forecasts', 'continents']
    ], 'Even seconds can protect infrastructure and reduce follow-on damage.'),
    cl('core', 'Prediction would identify an earthquake before rupture ___; early ___ detects rupture rapidly; a public ___ tells people what to do.', [
      ['begins', 'ends', 'cools', 'erodes'], ['warning', 'weather forecast', 'intensity', 'aftershock'], ['alert', 'fault', 'plate', 'magnitude']
    ], 'Warning is reactive to the first detected waves, not advance prediction.', 'The third blank completes the time distinction: rupture begins.'),
    cl('stretch', 'Sending an alert very early may increase lead ___ but also uncertainty; waiting for more data improves ___ but reduces available ___.', [
      ['time', 'magnitude', 'damage', 'distance'], ['accuracy', 'shaking', 'energy', 'depth'], ['time', 'sensors', 'faults', 'buildings']
    ], 'Systems balance speed against confidence in their first estimate.'),
    cl('apply', 'An inclusive alert may combine sound, screen text and ___; the instruction should be ___; users should practise it in ___.', [
      ['vibration', 'smoke', 'lava', 'rain'], ['clear', 'technical and long', 'hidden', 'optional'], ['drills', 'storms', 'eruptions', 'traffic']
    ], 'Multiple formats, plain language and rehearsal make alerts actionable.'),
    cl('apply', 'An initial estimate can change as more ___ report; the location and ___ can be refined; the first message should still prompt immediate ___.', [
      ['sensors', 'clouds', 'tides', 'volcanoes'], ['magnitude', 'weather', 'salinity', 'planet size'], ['action', 'debate', 'travel', 'filming']
    ], 'Rapid early estimates are updated while users act on safety instructions.'),
    cl('stretch', 'A dense network can detect shaking ___, reduce some processing ___, and improve geographic ___.', [
      ['sooner', 'later', 'after it ends', 'without sensors'], ['delay', 'magnitude', 'energy', 'depth'], ['coverage', 'gravity', 'temperature', 'salinity']
    ], 'Network density and reliability improve speed and coverage.'),
    cl('apply', 'At the coast, a quake alert plus strong or long shaking should trigger ___ evacuation, which should begin ___; wait for the official ___.', [
      ['tsunami', 'volcano', 'weather', 'traffic'], ['immediately', 'later', 'optionally', 'at night only'], ['all-clear', 'first wave', 'high tide', 'sunrise']
    ], 'Natural tsunami warnings require immediate evacuation and patience before returning.', 'The second blank emphasises that evacuation is immediate.'),
  ];

  window.PLANET_EARTH_REVISION_DATA = {
    id: 'igcse-y4-sci-planet-earth-revision-v2',
    title: 'Planet Earth Revision Lab',
    unitOrder: ['structure', 'volcanoes', 'earthquakes', 'alerts'],
    units
  };
})();
