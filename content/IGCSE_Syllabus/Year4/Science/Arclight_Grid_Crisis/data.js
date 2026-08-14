(function () {
  "use strict";

  window.ARCLIGHT_DATA = {
    title: "Arclight Grid Crisis",
    missions: [
      {
        id: "diagnostic",
        code: "Grid intake",
        title: "Circuit Diagnostic",
        blurb: "Prove the core rules before the station accepts your repair licence.",
        visual: "diagnostic",
        questions: [
          {
            id: "d1", level: "core", type: "choice", marks: 1,
            title: "Current at two points",
            prompt: "A lamp and cell form one complete series loop. Ammeter A1 reads 0.40 A before the lamp. What should A2 read after the lamp?",
            evidence: "The circuit contains no branches and both ammeters are ideal.",
            options: ["0.00 A", "0.20 A", "0.40 A", "0.80 A"], answer: 2,
            hint: "Charge is not used up by the lamp.",
            explanation: "A series circuit has the same current at every point, so A2 reads 0.40 A.",
            teacher: "Ask what is transferred by the lamp if charge is not consumed."
          },
          {
            id: "d2", level: "core", type: "choice", marks: 1,
            title: "Open switch prediction",
            prompt: "A switch in a single-loop circuit is opened. Which statement is correct?",
            evidence: "The cell remains connected, but the conducting path is broken at the switch.",
            options: ["Current increases", "Current becomes zero everywhere", "Only current after the switch becomes zero", "The lamp becomes brighter"], answer: 1,
            hint: "A current needs one continuous conducting path.",
            explanation: "Opening the switch breaks the only loop, so current becomes zero throughout the circuit.",
            teacher: "Reject the idea that current travels to the gap and stops only there."
          },
          {
            id: "d3", level: "core", type: "numeric", marks: 2,
            title: "Resistance from readings",
            prompt: "A component has a potential difference of 6.0 V and a current of 0.50 A. Calculate its resistance.",
            evidence: "Use R = V / I.",
            answer: { value: 12, tolerance: 0.01, unit: "ohms" },
            hint: "Divide potential difference by current.",
            explanation: "R = 6.0 / 0.50 = 12 ohms.",
            teacher: "Award one mark for substitution and one for the answer with unit."
          },
          {
            id: "d4", level: "core", type: "multi", marks: 2,
            title: "Choose the conductors",
            prompt: "Select every material that would normally conduct electric current well.",
            evidence: "Consider the movement of charged particles in each material.",
            options: ["Copper wire", "Dry plastic", "Graphite", "Glass", "Aluminium foil"], answer: [0, 2, 4],
            hint: "There are three correct selections.",
            explanation: "Copper, graphite and aluminium conduct. Dry plastic and glass are insulators.",
            teacher: "Push for a particle explanation, especially for graphite."
          },
          {
            id: "d5", level: "challenge", type: "switch", marks: 2,
            title: "Restore one safe loop",
            prompt: "Toggle the two controls so the lamp has one complete path without closing the bypass across it.",
            evidence: "S1 is in series with the lamp. S2 is a low-resistance bypass across the lamp.",
            switches: ["Close S1", "Close bypass S2"], answer: [true, false],
            hint: "A bypass would provide a path around the lamp.",
            explanation: "S1 must be closed and the bypass must stay open. This completes the lamp loop without short-circuiting it.",
            teacher: "Use this to diagnose whether the student treats every closed switch as helpful."
          },
          {
            id: "d6", level: "challenge", type: "open", marks: 3,
            title: "Energy, not current, is transferred",
            prompt: "A student says, 'The lamp uses up current.' Write a correction using charge, current and energy.",
            evidence: "The current entering a lamp is equal to the current leaving it in a steady series circuit.",
            hint: "Separate what flows from what is transferred.",
            rubric: ["States that current is the rate of flow of charge", "States that charge is conserved", "Explains that electrical energy is transferred by the lamp"],
            explanation: "Current is the rate of flow of charge. The charge continues around the circuit, while the lamp transfers electrical energy to light and thermal energy.",
            teacher: "Look for a full correction, not only 'current stays the same'."
          },
          {
            id: "d7", level: "challenge", type: "numeric", marks: 3,
            title: "Charge through the lamp",
            prompt: "A steady current of 0.25 A flows through a lamp for 80 s. Calculate the charge that passes through the lamp.",
            evidence: "Use Q = It, where current is measured in amperes and time in seconds.",
            answer: { value: 20, tolerance: 0.01, unit: "C" },
            hint: "Multiply 0.25 by 80.",
            explanation: "Q = It = 0.25 x 80 = 20 C.",
            teacher: "Ask whether the lamp stores this charge or whether it continues around the circuit."
          },
          {
            id: "d8", level: "beyond", type: "open", marks: 4,
            title: "Follow charge and energy",
            prompt: "Explain what stays the same and what changes as charge passes through a lamp in a complete series circuit.",
            evidence: "The current is the same on both sides of the lamp, but the lamp becomes hot and emits light.",
            hint: "Discuss current, charge, potential difference and energy transfer.",
            rubric: ["Current is the same before and after the lamp", "Charge is conserved", "Potential difference represents energy transferred per unit charge", "The lamp transfers electrical energy to light and thermal energy"],
            explanation: "Charge is conserved, so the same current enters and leaves the lamp. Across the lamp there is a potential difference because each coulomb transfers energy to light and thermal stores.",
            teacher: "Use this as the checkpoint for separating current from energy."
          }
        ]
      },
      {
        id: "networks",
        code: "Distribution deck",
        title: "Series and Parallel Networks",
        blurb: "Reroute the lighting grid and predict what survives each component failure.",
        visual: "networks",
        questions: [
          {
            id: "n1", level: "core", type: "choice", marks: 1,
            title: "Independent branches",
            prompt: "Which observation gives the strongest evidence that two lamps are connected in parallel?",
            evidence: "Both lamps are connected to the same cell pack.",
            options: ["Both lamps are dim", "Removing one lamp leaves the other on", "Both lamps switch off together", "The battery becomes warmer"], answer: 1,
            hint: "Think about whether another complete branch remains.",
            explanation: "In parallel, each lamp has its own complete branch, so removing one does not break the other branch.",
            teacher: "Ask for a circuit-path explanation after the choice."
          },
          {
            id: "n2", level: "core", type: "numeric", marks: 2,
            title: "Total series resistance",
            prompt: "Two resistors of 4 ohms and 7 ohms are connected in series. Find their total resistance.",
            evidence: "In series, the same current passes through both resistors.",
            answer: { value: 11, tolerance: 0.01, unit: "ohms" },
            hint: "Series resistances add.",
            explanation: "R total = 4 + 7 = 11 ohms.",
            teacher: "Ask why adding another series resistor lowers current for a fixed supply."
          },
          {
            id: "n3", level: "challenge", type: "numeric", marks: 3,
            title: "Two equal parallel resistors",
            prompt: "Two 12 ohm resistors are connected in parallel. Calculate the combined resistance.",
            evidence: "For two parallel branches: 1 / R total = 1 / R1 + 1 / R2.",
            answer: { value: 6, tolerance: 0.01, unit: "ohms" },
            hint: "Two identical parallel branches give half the resistance of one branch.",
            explanation: "1 / R = 1/12 + 1/12 = 2/12, so R = 6 ohms.",
            teacher: "This is an extension beyond the simplest Year 4 treatment."
          },
          {
            id: "n4", level: "challenge", type: "switch", marks: 2,
            title: "Keep emergency lighting alive",
            prompt: "Choose which branch switches must be closed so lamps L1 and L3 stay on while the faulty L2 branch is isolated.",
            evidence: "Each lamp is on its own parallel branch. S1, S2 and S3 control L1, L2 and L3 respectively.",
            switches: ["S1 for L1", "S2 for L2", "S3 for L3"], answer: [true, false, true],
            hint: "A parallel branch can be isolated without opening the others.",
            explanation: "Close S1 and S3, but leave S2 open to isolate the faulty branch.",
            teacher: "Ask how the total current changes after the faulty branch is isolated."
          },
          {
            id: "n5", level: "challenge", type: "multi", marks: 3,
            title: "Parallel circuit consequences",
            prompt: "Select all correct statements for two lamps connected in parallel to an ideal 6 V supply.",
            evidence: "Each branch connects across the same two supply terminals.",
            options: ["Each lamp has 6 V across it", "Branch currents must be equal even if lamps differ", "Total current is the sum of branch currents", "Opening one branch always opens all branches", "Adding a branch can increase total current"], answer: [0, 2, 4],
            hint: "There are three correct statements.",
            explanation: "Each branch gets the supply voltage. Total current is the sum of branch currents, and adding a branch can increase total current.",
            teacher: "Challenge the assumption that every parallel branch carries equal current."
          },
          {
            id: "n6", level: "beyond", type: "switch", marks: 3,
            title: "Avoid a short circuit",
            prompt: "Configure the repair switches so current must pass through resistor R before reaching the motor.",
            evidence: "S1 connects the supply. S2 connects R in series. S3 creates a near-zero-resistance path around R and the motor.",
            switches: ["Supply S1", "Series resistor S2", "Bypass S3"], answer: [true, true, false],
            hint: "A closed bypass can create a dangerously large current.",
            explanation: "S1 and S2 are closed while S3 stays open. The resistor then limits current through the motor branch.",
            teacher: "Link the bypass to I = V / R and heating in the wires."
          },
          {
            id: "n7", level: "challenge", type: "choice", marks: 2,
            title: "Brightness after a branch is added",
            prompt: "A second identical lamp is added in parallel to the first using an ideal cell. What happens to the first lamp?",
            evidence: "The ideal cell maintains the same potential difference across each branch.",
            options: ["It becomes much dimmer", "It stays about the same brightness", "It goes out", "It flashes once and breaks"], answer: 1,
            hint: "Does the potential difference across the original branch change?",
            explanation: "With an ideal supply, the original lamp still receives the same potential difference, so its brightness stays about the same.",
            teacher: "Later contrast this with a real cell that has internal resistance."
          },
          {
            id: "n8", level: "challenge", type: "open", marks: 4,
            title: "Design the medical-bay supply",
            prompt: "Explain why three critical devices should be connected in parallel rather than series. Include reliability, potential difference and current.",
            evidence: "Each device is rated for the full 12 V supply and must continue operating if another device is disconnected.",
            hint: "Build three linked reasons, not a list of keywords.",
            rubric: ["Independent branches improve reliability", "Each branch receives the full supply potential difference", "Each device draws the current set by its own resistance", "Explains a failure in one branch does not open the others"],
            explanation: "Parallel branches give every device 12 V and allow each to draw its required current. A disconnection in one branch does not break the other branches.",
            teacher: "Award only when the student connects the circuit feature to the operational need."
          }
        ]
      },
      {
        id: "measurement",
        code: "Sensor laboratory",
        title: "Meters, Resistance and I-V Graphs",
        blurb: "Interrogate components with measurements, graphs and evidence from fair tests.",
        visual: "measurement",
        questions: [
          {
            id: "m1", level: "core", type: "choice", marks: 1,
            title: "Connect the ammeter",
            prompt: "How should an ammeter be connected to measure current through a lamp?",
            evidence: "An ideal ammeter has very low resistance.",
            options: ["In series with the lamp", "In parallel across the lamp", "Across the cell only", "Outside the complete circuit"], answer: 0,
            hint: "The measured current must pass through the meter.",
            explanation: "An ammeter is connected in series so the same current passes through the meter and lamp.",
            teacher: "Ask what could happen if a low-resistance ammeter is placed directly across a cell."
          },
          {
            id: "m2", level: "core", type: "choice", marks: 1,
            title: "Connect the voltmeter",
            prompt: "How should a voltmeter be connected to measure potential difference across a lamp?",
            evidence: "An ideal voltmeter has very high resistance.",
            options: ["In series before the lamp", "In parallel across the lamp", "In series after the lamp", "Across an open switch only"], answer: 1,
            hint: "It compares the energy transferred per charge between two points.",
            explanation: "A voltmeter is connected in parallel across the component.",
            teacher: "Require the phrase 'across the component'."
          },
          {
            id: "m3", level: "core", type: "numeric", marks: 2,
            title: "Read an I-V point",
            prompt: "At 4.0 V, a resistor carries 0.20 A. Calculate its resistance.",
            evidence: "The plotted point is V = 4.0 V, I = 0.20 A.",
            answer: { value: 20, tolerance: 0.01, unit: "ohms" },
            hint: "Use R = V / I at the chosen point.",
            explanation: "R = 4.0 / 0.20 = 20 ohms.",
            teacher: "Check the student does not calculate I / V."
          },
          {
            id: "m4", level: "challenge", type: "numeric", marks: 3,
            title: "Gradient and conductance",
            prompt: "An I-V graph plots current on the vertical axis. Current rises from 0 A to 0.60 A as voltage rises from 0 V to 3.0 V. Calculate the gradient in A/V.",
            evidence: "Gradient = change in current / change in voltage.",
            answer: { value: 0.2, tolerance: 0.001, unit: "A/V" },
            hint: "Use 0.60 divided by 3.0.",
            explanation: "Gradient = 0.60 / 3.0 = 0.20 A/V. For an ohmic resistor this is the conductance, 1/R.",
            teacher: "Extension link: R = 1 / 0.20 = 5 ohms."
          },
          {
            id: "m5", level: "challenge", type: "order", marks: 3,
            title: "Build a fair I-V investigation",
            prompt: "Tap the steps to arrange them in a valid experimental order.",
            evidence: "The variable resistor controls the current and readings must be paired.",
            items: ["Record current and potential difference", "Connect ammeter in series and voltmeter in parallel", "Change the variable resistor", "Repeat for several settings"],
            answer: ["Connect ammeter in series and voltmeter in parallel", "Change the variable resistor", "Record current and potential difference", "Repeat for several settings"],
            hint: "Set up the meters before changing or recording anything.",
            explanation: "Connect correctly, select a resistance setting, record the paired readings, then repeat for several settings.",
            teacher: "Accept changing then recording as a repeated cycle after the initial connection."
          },
          {
            id: "m6", level: "challenge", type: "switch", marks: 3,
            title: "Protect the test component",
            prompt: "Configure the investigation before switching on: include both meters correctly and include the current-limiting resistor.",
            evidence: "M1 inserts an ammeter in series. M2 places a voltmeter across the component. R inserts a variable resistor in series.",
            switches: ["Series ammeter M1", "Parallel voltmeter M2", "Series variable resistor R"], answer: [true, true, true],
            hint: "All three controls are needed for a safe, measurable I-V test.",
            explanation: "The ammeter and variable resistor are in series, while the voltmeter is in parallel across the test component.",
            teacher: "Ask what should be done if the component begins to heat significantly."
          },
          {
            id: "m7", level: "beyond", type: "open", marks: 4,
            title: "Explain the filament curve",
            prompt: "A filament lamp I-V graph becomes less steep as current increases. Explain the shape using temperature and resistance.",
            evidence: "The filament glows more brightly at larger currents and its temperature increases.",
            hint: "Link particle vibration to electron motion.",
            rubric: ["Current heats the filament", "Higher temperature causes greater lattice vibration", "Electrons experience more collisions", "Resistance increases, so current rises less rapidly"],
            explanation: "The larger current heats the filament. Greater lattice vibration causes more collisions for moving electrons, increasing resistance. Current therefore rises less rapidly as voltage increases.",
            teacher: "Do not award full marks for only saying 'it gets hot'."
          },
          {
            id: "m8", level: "challenge", type: "multi", marks: 3,
            title: "Improve the measurement run",
            prompt: "Select every action that improves the safety or reliability of an I-V investigation.",
            evidence: "The circuit contains a test component, an ammeter, a voltmeter and a variable resistor.",
            options: ["Repeat readings and calculate a mean", "Disconnect the supply before changing the circuit", "Record current and voltage only after both readings are stable", "Leave a filament lamp at high current for a long time", "Connect the voltmeter in series"],
            answer: [0, 1, 2],
            hint: "There are three good laboratory practices.",
            explanation: "Repeats improve reliability, isolating the supply improves safety, and stable paired readings improve data quality. Prolonged high current causes heating, while a voltmeter belongs in parallel.",
            teacher: "Ask the student to distinguish a safety improvement from a reliability improvement."
          }
        ]
      },
      {
        id: "power",
        code: "Energy command",
        title: "Power, Energy and Cost",
        blurb: "Balance survival time, heating, appliance power and the station energy budget.",
        visual: "power",
        questions: [
          {
            id: "p1", level: "core", type: "numeric", marks: 2,
            title: "Lamp power",
            prompt: "A lamp operates at 12 V and draws 0.50 A. Calculate its power.",
            evidence: "Use P = VI.",
            answer: { value: 6, tolerance: 0.01, unit: "W" },
            hint: "Multiply potential difference by current.",
            explanation: "P = 12 x 0.50 = 6 W.",
            teacher: "Ask what 6 W means in joules per second."
          },
          {
            id: "p2", level: "core", type: "numeric", marks: 3,
            title: "Energy transferred",
            prompt: "A 6 W lamp runs for 300 s. Calculate the energy transferred.",
            evidence: "Use E = Pt with time in seconds.",
            answer: { value: 1800, tolerance: 0.1, unit: "J" },
            hint: "Multiply 6 by 300.",
            explanation: "E = 6 x 300 = 1800 J.",
            teacher: "Check that the student gives joules, not watts."
          },
          {
            id: "p3", level: "core", type: "choice", marks: 1,
            title: "Fuse rating",
            prompt: "A 230 V heater normally draws 8.2 A. Which fuse is the best choice?",
            evidence: "Available fuse ratings are 3 A, 5 A, 10 A and 20 A.",
            options: ["3 A", "5 A", "10 A", "20 A"], answer: 2,
            hint: "Choose the smallest rating safely above the normal current.",
            explanation: "A 10 A fuse is the smallest rating above the normal 8.2 A current.",
            teacher: "Ask why 20 A gives less protection."
          },
          {
            id: "p4", level: "challenge", type: "multi", marks: 3,
            title: "Reduce wasted energy",
            prompt: "Select all changes that reduce electrical energy waste without reducing the required light output.",
            evidence: "The cabin needs the same useful illumination for six hours.",
            options: ["Replace filament lamps with efficient LEDs", "Increase cable resistance", "Switch off unused zones", "Use thinner wires so they heat more", "Use reflective surfaces to direct light"], answer: [0, 2, 4],
            hint: "There are three helpful changes.",
            explanation: "Efficient LEDs, switching off unused zones and directing light reduce waste. Higher cable resistance increases unwanted heating.",
            teacher: "Separate efficiency from simply using less useful output."
          },
          {
            id: "p5", level: "challenge", type: "order", marks: 3,
            title: "Trace the energy pathway",
            prompt: "Arrange the energy pathway for a battery-powered lamp from first store to final output.",
            evidence: "The battery is discharging and the lamp warms its surroundings.",
            items: ["Light and thermal energy to surroundings", "Chemical energy store in the battery", "Electrical energy transferred through the circuit", "Energy transferred in the lamp"],
            answer: ["Chemical energy store in the battery", "Electrical energy transferred through the circuit", "Energy transferred in the lamp", "Light and thermal energy to surroundings"],
            hint: "Begin with the battery's energy store.",
            explanation: "Chemical store, electrical transfer, transfer in the lamp, then light and thermal energy to the surroundings.",
            teacher: "Use precise store and transfer language."
          },
          {
            id: "p6", level: "challenge", type: "switch", marks: 3,
            title: "Emergency energy budget",
            prompt: "Select systems that can remain on without exceeding the 160 W emergency limit.",
            evidence: "Navigation lights use 60 W, heater uses 120 W and communication uses 80 W. Communication must remain on.",
            switches: ["Navigation lights 60 W", "Heater 120 W", "Communication 80 W"], answer: [true, false, true],
            hint: "Communication is required. Find the only additional system that keeps the total at or below 160 W.",
            explanation: "Communication plus navigation uses 140 W. Adding the heater would exceed the 160 W limit.",
            teacher: "Ask how long a 280 Wh battery could supply the selected 140 W load."
          },
          {
            id: "p7", level: "beyond", type: "open", marks: 4,
            title: "Compare two heater designs",
            prompt: "Heater A is rated 1.2 kW and is 90% efficient. Heater B is rated 1.0 kW and is 98% efficient. Recommend one for rapidly warming a cabin, and justify the trade-off.",
            evidence: "Useful power A = 1.08 kW. Useful power B = 0.98 kW. The cabin has a strict energy budget after the first 15 minutes.",
            hint: "A good answer can choose either heater if the criterion is stated and defended.",
            rubric: ["Compares useful power using the data", "Recognises A warms faster", "Recognises B wastes a smaller fraction", "Makes a justified recommendation linked to the stated priority"],
            explanation: "A provides more useful power and warms the cabin faster. B is more efficient and reduces waste. The best choice depends on whether immediate heating rate or longer-term energy conservation has priority.",
            teacher: "Accept either conclusion when the student evaluates the trade-off clearly."
          },
          {
            id: "p8", level: "challenge", type: "numeric", marks: 4,
            title: "Calculate electricity cost",
            prompt: "A 1.2 kW heater runs for 45 minutes. Electricity costs RM0.60 per kWh. Calculate the operating cost.",
            evidence: "Convert 45 minutes to 0.75 h, then calculate energy in kWh before calculating cost.",
            answer: { value: 0.54, tolerance: 0.001, unit: "RM" },
            hint: "The heater uses 1.2 x 0.75 = 0.90 kWh.",
            explanation: "Energy = 1.2 kW x 0.75 h = 0.90 kWh. Cost = 0.90 x RM0.60 = RM0.54.",
            teacher: "Check that the student does not use seconds when calculating kWh."
          }
        ]
      },
      {
        id: "faults",
        code: "Damage control",
        title: "Fault Finding and Safety",
        blurb: "Read conflicting evidence, isolate dangerous branches and defend every safety action.",
        visual: "faults",
        questions: [
          {
            id: "f1", level: "core", type: "choice", marks: 1,
            title: "Blown fuse evidence",
            prompt: "A device stops suddenly and its fuse wire has melted. What is the best immediate conclusion?",
            evidence: "The fuse is connected in series with the live conductor.",
            options: ["The supply voltage was definitely zero", "The current exceeded the fuse rating", "The device resistance became infinite before the fuse melted", "The neutral wire became live"], answer: 1,
            hint: "A fuse responds to heating caused by excessive current.",
            explanation: "The fuse melts when current exceeds its rating long enough to heat the fuse wire.",
            teacher: "Clarify that the fuse indicates excess current but not the exact cause."
          },
          {
            id: "f2", level: "core", type: "choice", marks: 1,
            title: "Earth wire purpose",
            prompt: "Why is a metal appliance case connected to earth?",
            evidence: "A fault could connect the live wire to the case.",
            options: ["To increase normal operating current", "To make the case a better conductor", "To provide a low-resistance fault path so protection disconnects the supply", "To reduce the supply frequency"], answer: 2,
            hint: "Think about the path of fault current.",
            explanation: "The earth wire provides a low-resistance fault path, producing a large current that operates the fuse or circuit breaker.",
            teacher: "Require both the low-resistance path and disconnection."
          },
          {
            id: "f3", level: "core", type: "numeric", marks: 3,
            title: "Dangerous fault current",
            prompt: "A 230 V supply is connected across a fault path of 2.0 ohms. Calculate the fault current.",
            evidence: "Use I = V / R. Treat 2.0 ohms as the total fault-path resistance for this model.",
            answer: { value: 115, tolerance: 0.1, unit: "A" },
            hint: "Divide 230 by 2.0.",
            explanation: "I = 230 / 2.0 = 115 A, large enough to operate suitable protection rapidly.",
            teacher: "Use this to show why a low-resistance earth path matters."
          },
          {
            id: "f4", level: "challenge", type: "switch", marks: 3,
            title: "Isolate the damaged branch",
            prompt: "Branch B has damaged insulation. Keep the command computer and ventilation running while isolating B.",
            evidence: "S1 controls command, S2 controls Branch B and S3 controls ventilation. The branches are parallel.",
            switches: ["Command S1", "Damaged branch S2", "Ventilation S3"], answer: [true, false, true],
            hint: "Only the unsafe parallel branch needs to be opened.",
            explanation: "Keep S1 and S3 closed and open S2 to isolate the damaged branch.",
            teacher: "Ask why this selective isolation is not possible with one series loop."
          },
          {
            id: "f5", level: "challenge", type: "switch", marks: 3,
            title: "Test without energising the fault",
            prompt: "Prepare a safe continuity test before touching the circuit.",
            evidence: "P disconnects the power supply, C discharges the capacitor module and T connects the low-voltage continuity tester.",
            switches: ["Disconnect power P", "Discharge capacitor C", "Connect tester T"], answer: [true, true, true],
            hint: "Stored charge can remain after the main supply is off.",
            explanation: "Disconnect the supply, discharge stored energy, then use the low-voltage tester.",
            teacher: "This is a safety sequence, not permission for students to work on mains equipment."
          },
          {
            id: "f6", level: "challenge", type: "multi", marks: 3,
            title: "Identify plausible faults",
            prompt: "A motor receives 12 V but draws almost zero current and does not turn. Select all plausible explanations.",
            evidence: "The voltmeter is connected directly across the motor terminals while the motor is supposed to run.",
            options: ["Open circuit inside the motor", "Broken connection that still allows the high-resistance voltmeter to read voltage", "Motor resistance has become nearly zero", "Mechanical jam with a normal large current", "Worn brush contact causing an open circuit"], answer: [0, 1, 4],
            hint: "The key evidence is voltage present but almost no current.",
            explanation: "An open circuit in or near the motor can leave a voltage reading while preventing significant current. A short or jam usually gives a large current.",
            teacher: "Ask why a high-resistance voltmeter can show voltage through a poor connection."
          },
          {
            id: "f7", level: "challenge", type: "open", marks: 4,
            title: "Evaluate the technician's claim",
            prompt: "A technician says, 'The lamp is off, so the lamp must be broken.' Evaluate the claim using a logical fault-finding sequence.",
            evidence: "Possible causes include the lamp, supply, switch, fuse, wiring and loose contacts.",
            hint: "Name tests that separate competing explanations.",
            rubric: ["States the claim is not justified by one observation", "Checks supply and protection first", "Uses voltage or continuity tests systematically", "Changes one factor at a time and reaches a conclusion from evidence"],
            explanation: "The lamp being off has several possible causes. Check the supply and fuse, inspect the switch and connections, then test voltage across the lamp or substitute a known working lamp under safe conditions.",
            teacher: "Reward a sequence that avoids random component swapping."
          },
          {
            id: "f8", level: "beyond", type: "open", marks: 4,
            title: "Why breakers can outperform fuses",
            prompt: "Compare a circuit breaker with a fuse for a critical station circuit. Give one advantage and one limitation of each.",
            evidence: "The circuit must be restored quickly, but repeated tripping may indicate a persistent fault.",
            hint: "Consider response, reset, replacement and misuse.",
            rubric: ["Breaker can be reset quickly", "Breaker may offer repeatable or faster protection", "Fuse is simple and inexpensive", "Explains that neither should be reset or replaced before the fault is found"],
            explanation: "A breaker can be reset and may respond predictably, while a fuse is simple and inexpensive but must be replaced. Repeated operation indicates a fault that must be investigated before reconnection.",
            teacher: "Do not accept 'breaker is always safer' without conditions."
          }
        ]
      },
      {
        id: "beyond",
        code: "Research annex",
        title: "Beyond IGCSE Lab",
        blurb: "Use real-cell behaviour, internal resistance and non-ohmic components without advanced algebra.",
        visual: "beyond",
        questions: [
          {
            id: "b1", level: "beyond", type: "choice", marks: 2,
            title: "Terminal voltage falls",
            prompt: "A fresh cell reads 1.55 V with no load but 1.30 V while supplying a large current. What is the best explanation?",
            evidence: "The voltmeter is accurate and the connecting wires have low resistance.",
            options: ["Charge disappears inside the cell", "Energy is transferred inside the cell because it has internal resistance", "The cell's emf becomes exactly zero", "The external resistor creates extra charge"], answer: 1,
            hint: "A real cell has resistance inside it.",
            explanation: "Current through the cell's internal resistance causes an internal potential drop, so terminal voltage is lower under load.",
            teacher: "Introduce V terminal = emf - Ir only after the verbal explanation."
          },
          {
            id: "b2", level: "beyond", type: "numeric", marks: 3,
            title: "Internal voltage drop",
            prompt: "A cell has emf 1.50 V and internal resistance 0.40 ohms. It supplies 0.50 A. Calculate the terminal voltage.",
            evidence: "Use V terminal = emf - Ir.",
            answer: { value: 1.3, tolerance: 0.01, unit: "V" },
            hint: "First calculate 0.50 x 0.40.",
            explanation: "Internal drop = 0.50 x 0.40 = 0.20 V. Terminal voltage = 1.50 - 0.20 = 1.30 V.",
            teacher: "Keep the algebra numerical and conceptual."
          },
          {
            id: "b3", level: "beyond", type: "numeric", marks: 3,
            title: "Estimate internal resistance",
            prompt: "A cell falls from 1.60 V open-circuit to 1.36 V when supplying 0.80 A. Estimate its internal resistance.",
            evidence: "Internal voltage drop = emf - terminal voltage, and r = drop / current.",
            answer: { value: 0.3, tolerance: 0.01, unit: "ohms" },
            hint: "The internal drop is 0.24 V.",
            explanation: "r = (1.60 - 1.36) / 0.80 = 0.24 / 0.80 = 0.30 ohms.",
            teacher: "Ask why the estimate could change as the cell warms or discharges."
          },
          {
            id: "b4", level: "beyond", type: "choice", marks: 2,
            title: "Diode direction",
            prompt: "A diode is reversed in a low-voltage DC indicator circuit. What is the most likely result?",
            evidence: "The applied voltage is below breakdown and all other components work.",
            options: ["A large reverse current flows", "Almost no current flows", "The diode behaves like a cell", "Current alternates direction"], answer: 1,
            hint: "A diode strongly resists current in its reverse direction below breakdown.",
            explanation: "A reverse-biased diode allows almost no current below its breakdown voltage.",
            teacher: "Treat this as a qualitative extension, not semiconductor theory."
          },
          {
            id: "b5", level: "beyond", type: "switch", marks: 3,
            title: "Reduce real-cell voltage sag",
            prompt: "Choose the changes that reduce current demand while keeping one essential lamp operating.",
            evidence: "The real battery has noticeable internal resistance. Two optional heater branches and one essential lamp branch are connected in parallel.",
            switches: ["Essential lamp", "Optional heater A", "Optional heater B"], answer: [true, false, false],
            hint: "Lower total current reduces the internal voltage drop Ir.",
            explanation: "Keep the essential lamp and disconnect both optional heaters. The lower total current reduces terminal-voltage sag.",
            teacher: "Link system management to the internal-resistance model."
          },
          {
            id: "b6", level: "beyond", type: "open", marks: 4,
            title: "Plan a battery comparison",
            prompt: "Design a fair test to compare the internal resistance of two cells without short-circuiting them.",
            evidence: "Available equipment: voltmeter, ammeter, fixed resistor, switch and connecting leads.",
            hint: "Measure open-circuit voltage, then one safe loaded reading for each cell.",
            rubric: ["Measures each open-circuit voltage", "Uses the same known load safely", "Measures loaded current and terminal voltage", "Calculates r from voltage drop divided by current and controls relevant variables"],
            explanation: "Measure emf with no load, then connect the same resistor briefly and measure terminal voltage and current. Calculate r = (emf - V) / I for each cell while controlling temperature and state of charge as far as possible.",
            teacher: "Explicitly prohibit directly connecting the cell terminals."
          },
          {
            id: "b7", level: "beyond", type: "numeric", marks: 4,
            title: "Choose an LED resistor",
            prompt: "A 9.0 V supply powers an LED with a forward potential difference of 2.0 V. The target current is 0.020 A. Calculate the required series resistance.",
            evidence: "The resistor must take the remaining 7.0 V. Use R = V / I for the resistor.",
            answer: { value: 350, tolerance: 0.1, unit: "ohms" },
            hint: "R = (9.0 - 2.0) / 0.020.",
            explanation: "The resistor has 7.0 V across it, so R = 7.0 / 0.020 = 350 ohms.",
            teacher: "Ask why connecting the LED directly to 9.0 V could damage it."
          },
          {
            id: "b8", level: "beyond", type: "open", marks: 4,
            title: "Why a short circuit heats a cell",
            prompt: "Explain why directly joining the terminals of a real cell can produce a dangerous current even though the connecting wire has very little resistance.",
            evidence: "A real cell has internal resistance, and the external short-circuit resistance is close to zero.",
            hint: "Use total resistance, current and internal heating in your explanation.",
            rubric: ["Total circuit resistance becomes very small", "A large current follows from I = emf / total resistance", "Power is dissipated inside the cell because of internal resistance", "Heating can damage the cell or cause a fire"],
            explanation: "A short circuit makes the total resistance very small, producing a large current. That current causes I-squared-r heating inside the cell, so the cell can overheat, leak or start a fire.",
            teacher: "Keep this conceptual; do not demonstrate a cell short circuit."
          }
        ]
      },
      {
        id: "boss",
        code: "Reactor deck",
        title: "Final Boss Incident",
        blurb: "Combine network design, power limits, measurements and fault evidence to save the station.",
        visual: "boss",
        questions: [
          {
            id: "x1", level: "boss", type: "choice", marks: 2,
            title: "Choose the first test",
            prompt: "The reactor cooling pump is off. Its branch fuse is intact, but the branch current is zero. Which test should come first?",
            evidence: "The system can be isolated safely. The pump, switch and two connectors could each be open circuit.",
            options: ["Replace every component", "Measure potential difference across the open branch sections systematically", "Fit a larger fuse", "Bypass the protection device"], answer: 1,
            hint: "Choose the test that separates competing causes with minimum intervention.",
            explanation: "Systematic potential-difference or continuity tests can locate the open circuit without random replacement or unsafe bypasses.",
            teacher: "Ask what reading would identify an open switch."
          },
          {
            id: "x2", level: "boss", type: "numeric", marks: 4,
            title: "Cooling pump energy",
            prompt: "A 24 V pump draws 5.0 A for 12 minutes. Calculate the electrical energy transferred in kilojoules.",
            evidence: "Use P = VI and E = Pt. Convert 12 minutes to seconds, then convert joules to kilojoules.",
            answer: { value: 86.4, tolerance: 0.1, unit: "kJ" },
            hint: "Power is 120 W and time is 720 s.",
            explanation: "P = 24 x 5.0 = 120 W. E = 120 x 720 = 86400 J = 86.4 kJ.",
            teacher: "Award method marks for power, time conversion and energy."
          },
          {
            id: "x3", level: "boss", type: "multi", marks: 4,
            title: "Interpret the failure evidence",
            prompt: "Select every conclusion supported by the evidence table.",
            evidence: "<table><thead><tr><th>Test</th><th>Reading</th></tr></thead><tbody><tr><td>Supply</td><td>24.1 V</td></tr><tr><td>Across open switch</td><td>24.0 V</td></tr><tr><td>Across pump</td><td>0.1 V</td></tr><tr><td>Branch current</td><td>0.00 A</td></tr></tbody></table>",
            options: ["The supply is present", "The switch or its connection is open", "The pump definitely has a short circuit", "Almost the full supply is dropped across the open section", "A larger fuse will solve the fault"], answer: [0, 1, 3],
            hint: "A large potential difference often appears across the break in an open circuit.",
            explanation: "The supply is present and almost all of it appears across the open switch section. The pump itself has almost no potential difference in this open circuit.",
            teacher: "Use the readings to challenge the idea that voltage appears only across working components."
          },
          {
            id: "x4", level: "boss", type: "switch", marks: 4,
            title: "Restore the priority grid",
            prompt: "Configure the emergency grid. Cooling and communication are compulsory. Total power must not exceed 300 W.",
            evidence: "Cooling uses 120 W, communication uses 70 W, cabin lights use 80 W and heater uses 160 W.",
            switches: ["Cooling 120 W", "Communication 70 W", "Cabin lights 80 W", "Heater 160 W"], answer: [true, true, true, false],
            hint: "The three selected systems use 270 W.",
            explanation: "Cooling, communication and lights total 270 W. Adding the heater would exceed 300 W.",
            teacher: "Ask for an alternative valid configuration if cabin lights are not required."
          },
          {
            id: "x5", level: "boss", type: "open", marks: 6,
            title: "Write the final engineering order",
            prompt: "Write a final repair order that identifies the likely fault, gives the safe isolation and test sequence, and justifies the restored load configuration.",
            evidence: "Use all evidence from the boss incident. A strict examiner will award marks only when each action is linked to evidence or a scientific rule.",
            hint: "Structure the response as fault, evidence, safe action, test, repair and system check.",
            rubric: ["Identifies the open switch section as the likely fault", "Uses the voltage and current evidence correctly", "Isolates supply and stored energy before continuity work", "Repairs or replaces the faulty section without bypassing protection", "Restores cooling, communication and lights within 300 W", "Includes a final current, voltage or functional check"],
            explanation: "The evidence locates an open circuit at the switch section. Isolate the supply, verify safe conditions, test continuity, repair the open connection and restore the protected branch. Run cooling, communication and lights for a 270 W load, then confirm correct voltage, current and operation.",
            teacher: "This is the final synthesis. Require a defensible sequence rather than disconnected facts."
          },
          {
            id: "x6", level: "boss", type: "numeric", marks: 4,
            title: "Total emergency current",
            prompt: "Three parallel systems on a 24 V supply use 120 W, 72 W and 96 W. Calculate the total current drawn from the supply.",
            evidence: "For parallel loads, add their powers and use I = P total / V.",
            answer: { value: 12, tolerance: 0.01, unit: "A" },
            hint: "The total power is 288 W.",
            explanation: "Total power = 120 + 72 + 96 = 288 W. Total current = 288 / 24 = 12 A.",
            teacher: "Ask the student to verify the result by calculating and adding the three branch currents."
          },
          {
            id: "x7", level: "boss", type: "order", marks: 5,
            title: "Sequence the safe restoration",
            prompt: "Arrange the actions into a defensible fault-repair sequence.",
            evidence: "The damaged branch may contain stored electrical energy and must not be energised during continuity testing.",
            items: ["Repair the identified open connection", "Isolate the supply and stored energy", "Re-energise with the minimum safe load", "Verify that the circuit is not live", "Locate the break using continuity tests"],
            answer: ["Isolate the supply and stored energy", "Verify that the circuit is not live", "Locate the break using continuity tests", "Repair the identified open connection", "Re-energise with the minimum safe load"],
            hint: "Isolation and verification must come before testing or repair.",
            explanation: "First isolate all energy, then verify the circuit is not live. Locate and repair the break before controlled re-energisation.",
            teacher: "Reject any sequence that begins continuity testing before safe isolation is verified."
          },
          {
            id: "x8", level: "boss", type: "open", marks: 6,
            title: "Evaluate redundant cooling",
            prompt: "Engineers propose adding a second cooling pump in parallel so cooling continues if one pump fails. Evaluate the proposal and recommend operating rules for the emergency supply.",
            evidence: "Each pump is rated 24 V, 120 W. The supply limit is 300 W and communication requires 72 W. The real battery has internal resistance.",
            hint: "Balance reliability against total current, power limit and terminal-voltage sag.",
            rubric: ["Parallel pumps each receive the full 24 V", "One branch can continue if the other becomes open circuit", "Two pumps plus communication use 312 W and exceed the limit", "Higher current increases internal voltage drop and heating", "Recommends one duty pump with the second isolated or automatically switched", "Includes protection and a test or monitoring rule"],
            explanation: "Parallel connection improves redundancy, but running both pumps with communication would use 312 W and exceed the 300 W limit. Use one protected duty pump and keep the second as a tested standby that switches in only after isolating the failed branch. Monitor current and terminal voltage.",
            teacher: "Reward a recommendation that uses the numerical limit rather than arguing from reliability alone."
          }
        ]
      }
    ]
  };
}());
