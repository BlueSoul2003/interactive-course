"use strict";

window.SBP_QUESTIONS = [
  {
    number: 1,
    section: "Section A",
    marks: "5 marks",
    pages: [2, 3],
    note: "Answers follow the supplied SBP marking scheme.",
    segments: [
      {
        label: "1(a)(i) · Synthetic rubber",
        answer: "Any one: resistant to heat, resistant to chemicals, resistant to oxidation, heat insulator, elastic, or hard.",
        explanation: "Skema 接受任一項合成橡膠的性質。作答時只需選一項清楚、直接的特徵。"
      },
      {
        label: "1(a)(ii) · Natural rubber",
        answer: "Any one: soft, elastic, low heat resistance, heat insulator, reactive towards chemicals, or waterproof.",
        explanation: "這部分要寫天然橡膠本身的性質；例如 soft 或 low heat resistance，不要混入硫化橡膠的特徵。"
      },
      {
        label: "1(b) · Polymer name",
        answer: "Polyisoprene / poly(methylbut-1,3-diene).",
        explanation: "天然橡膠的主要聚合物是 polyisoprene；兩個名稱依 skema 都可接受。"
      },
      {
        label: "1(c) · Products and process",
        answer: "(i) Silicone\n(ii) Vulcanisation",
        explanation: "Silicone 適合耐熱及具彈性的用途；vulcanisation 透過交聯改善天然橡膠的強度與耐熱性。"
      }
    ]
  },
  {
    number: 2,
    section: "Section A",
    marks: "5 marks",
    pages: [4],
    note: "Bond labels follow the letters printed in the question diagram.",
    segments: [
      {
        label: "2(a) · Type of particle",
        answer: "Ion.",
        explanation: "Ammonium, NH₄⁺，帶正電荷，所以粒子類型是 ion。"
      },
      {
        label: "2(b) · Elements present",
        answer: "Nitrogen and hydrogen.",
        explanation: "由 ammonium ion 的化學式 NH₄⁺ 可直接辨認 nitrogen 與 hydrogen。"
      },
      {
        label: "2(c) · Chemical formula",
        answer: "NH₄⁺",
        explanation: "一個氮原子與四個氫原子形成帶 +1 電荷的 ammonium ion。"
      },
      {
        label: "2(d) · Bonds Y and Z",
        answer: "Bond Y: Covalent bond\nBond Z: Dative bond",
        explanation: "一般 N–H 鍵由兩原子各提供一個電子形成；dative bond 的一對共享電子則全部由 nitrogen 提供。"
      }
    ]
  },
  {
    number: 3,
    section: "Section A",
    marks: "6 marks",
    pages: [5, 6],
    note: "The atom diagram is cropped directly from the supplied SBP marking scheme.",
    segments: [
      {
        label: "3(a) · Nucleon number",
        answer: "The total number of protons and neutrons in the nucleus of an atom.",
        explanation: "Nucleon number 只計算 nucleus 內的 proton 與 neutron，不包括 electron。"
      },
      {
        label: "3(b)(i) · Electron arrangement of ion P",
        answer: "2.8",
        explanation: "P 形成離子後達到穩定的八電子外層，因此電子排列是 2.8。"
      },
      {
        label: "3(b)(ii) · Structure of atom R",
        answer: "Nucleus: 12 protons and 12 neutrons\nElectron arrangement: 2.8.2",
        explanation: "R 的 proton number 是 12；nucleon number 24 − 12 protons = 12 neutrons。中性原子有 12 electrons，排列為 2.8.2。",
        image: "assets/answers/q03-atom-r.png",
        imageAlt: "SBP marking-scheme diagram of atom R with 12 protons, 12 neutrons and electron arrangement 2.8.2"
      },
      {
        label: "3(c)(i) · Isotope used",
        answer: "Q / Sodium-24.",
        explanation: "依表格，Q 對應 Sodium-24；它可作 tracer 檢測管道洩漏。"
      },
      {
        label: "3(c)(ii) · Disadvantage",
        answer: "Any one: expensive or radioactive.",
        explanation: "放射性同位素需要安全設備與管制，因此成本高，也存在輻射風險。"
      }
    ]
  },
  {
    number: 4,
    section: "Section A",
    marks: "7 marks",
    pages: [7, 8],
    note: "Calculation steps are separated line by line for classroom reveal.",
    segments: [
      {
        label: "4(a) · Storage of Group 1 element",
        answer: "Keep it in paraffin oil.",
        explanation: "Group 1 metals 會快速與 oxygen 和 water vapour 反應；paraffin oil 可把金屬與空氣和水分隔開。"
      },
      {
        label: "4(b) · Equation with oxygen",
        answer: "4Q(s) + O₂(g) → 2Q₂O(s)\nAccept: 4K(s) + O₂(g) → 2K₂O(s)",
        explanation: "Q 是 potassium，與 oxygen 形成 Q₂O。先平衡 Q atoms，再平衡 O atoms。"
      },
      {
        label: "4(c) · Mass of Q₂O",
        answer: "Step 1: 4 mol K : 2 mol K₂O\nStep 2: 0.08 mol K : 0.04 mol K₂O\nStep 3: Mᵣ(K₂O) = (2 × 39) + 16 = 94\nStep 4: Mass = 0.04 × 94\nFinal answer: 3.76 g",
        explanation: "由係數 4:2 得到 K:K₂O = 2:1，所以 0.08 mol K 形成 0.04 mol K₂O；再以 mass = moles × molar mass。",
        calculation: true
      },
      {
        label: "4(d) · pH of QOH",
        answer: "pH = 12, 13 or 14.\nQOH ionises in water to produce hydroxide ions, OH⁻, forming an alkaline solution.",
        explanation: "Potassium hydroxide 是強鹼，水溶液含 OH⁻，所以 pH 高於 7；skema 接受 12、13 或 14。"
      }
    ]
  },
  {
    number: 5,
    section: "Section A",
    marks: "8 marks",
    pages: [8, 9, 10],
    note: "Answers follow the supplied SBP marking scheme.",
    segments: [
      {
        label: "5(a) · Nanotechnology",
        answer: "The development of substances or devices by using the properties of nanoparticles.",
        explanation: "定義的關鍵是利用 nanoparticles 的特殊性質來發展材料或裝置。"
      },
      {
        label: "5(b) · Property of the material",
        answer: "Any one: large surface area or high sensitivity.",
        explanation: "Nanomaterial 的表面積對體積比很大，因此能提高 sensor 的靈敏度。"
      },
      {
        label: "5(c) · Formation of carbon dioxide",
        answer: "C(s) + O₂(g) → CO₂(g)",
        explanation: "Carbon 完全燃燒時與 oxygen 形成 carbon dioxide；方程式已以 1:1:1 平衡。"
      },
      {
        label: "5(d) · Managing organic waste",
        answer: "1. Convert organic waste into fertiliser.\n2. Collect methane gas as biomass / biogas.",
        explanation: "兩個方法分別把有機廢物轉成肥料，以及回收分解產生的 methane 作能源，兩點都須作答。"
      },
      {
        label: "5(e) · Rusting observation",
        answer: "Rusting occurs in Set I but not in Set II.\nThe iron nail is a pure metal, whereas the stainless-steel nail is an alloy.",
        explanation: "純 iron 較容易氧化生鏽；stainless steel 是較耐腐蝕的 alloy，因此第二組不容易出現 rust。"
      }
    ]
  },
  {
    number: 6,
    section: "Section A",
    marks: "9 marks",
    pages: [11, 12, 13, 14],
    note: "Calculation steps are separated line by line for classroom reveal.",
    segments: [
      {
        label: "6(a)(i) · Common function",
        answer: "Both compounds are used as flavourings / preservatives.",
        explanation: "Glucose 與 sodium chloride 都可用於食品；skema 接受 flavourings 或 preservatives。"
      },
      {
        label: "6(a)(ii) · Particle and empirical formula",
        answer: "Type of particle in X: Molecule\nEmpirical formula of X: CH₂O",
        explanation: "Glucose 是 covalent compound，基本粒子是 molecule。C₆H₁₂O₆ 的下標同除以 6，得到 CH₂O。"
      },
      {
        label: "6(a)(iii) · Mass of sodium chloride",
        answer: "Step 1: n(Cl₂) = 1,200 / 24,000 = 0.05 mol\nStep 2: 1 mol Cl₂ : 2 mol NaCl\nStep 3: n(NaCl) = 0.10 mol\nStep 4: Mᵣ(NaCl) = 23 + 35.5 = 58.5\nStep 5: Mass = 0.10 × 58.5\nFinal answer: 5.85 g",
        explanation: "先用 molar gas volume 把 chlorine 體積換成 moles；再依 Cl₂:NaCl = 1:2 求 NaCl 的 moles，最後乘 molar mass。",
        calculation: true
      },
      {
        label: "6(b) · Electrical conductivity",
        answer: "Pupil S is correct.\nSolution X contains neutral molecules.\nSolution Y contains free-moving ions.",
        explanation: "Glucose solution 只有中性 molecules，不能導電；NaCl solution 含可自由移動的 ions，所以能傳導電流。"
      }
    ]
  },
  {
    number: 7,
    section: "Section A",
    marks: "10 marks",
    pages: [15, 16, 17],
    note: "The gas-test apparatus is cropped directly from the supplied SBP marking scheme.",
    segments: [
      {
        label: "7(a) · Ion replaced from acid",
        answer: "Hydrogen ion, H⁺.",
        explanation: "形成 salt 時，acid 中的 H⁺ 被 metal ion 或 ammonium ion 取代。"
      },
      {
        label: "7(b) · Green solution",
        answer: "Iron(II) nitrate solution, Fe(NO₃)₂.",
        explanation: "Pale green solution 是 Fe²⁺ 的典型顏色；與 nitrate 配合得到 Fe(NO₃)₂。"
      },
      {
        label: "7(c) · Identify the ions",
        answer: "R²⁺: Fe²⁺ / iron(II) ion\nS²⁺: Cu²⁺ / copper(II) ion\nT²⁺: Pb²⁺ / lead(II) ion",
        explanation: "依沉澱顏色與溶解性逐一判斷：Fe²⁺、Cu²⁺ 和 Pb²⁺。離子符號必須連同電荷。"
      },
      {
        label: "7(d) · Mass of precipitate",
        answer: "Step 1: Pb²⁺(aq) + 2Cl⁻(aq) → PbCl₂(s)\nStep 2: 1 mol Pb²⁺ : 1 mol PbCl₂\nStep 3: n(PbCl₂) = 0.10 mol\nStep 4: Mᵣ(PbCl₂) = 207 + (2 × 35.5) = 278\nStep 5: Mass = 0.10 × 278\nFinal answer: 27.8 g",
        explanation: "Ionic equation 顯示 Pb²⁺ 與 PbCl₂ 是 1:1。先求 precipitate 的 moles，再以 278 g mol⁻¹ 計算質量。",
        calculation: true
      },
      {
        label: "7(e) · Confirm gas Y",
        answer: "Heat sodium sulphite with hydrochloric acid.\nPass the gas produced through acidified potassium manganate(VII) solution.",
        explanation: "此裝置產生 sulphur dioxide 並通入 acidified KMnO₄。作圖得分點是裝置能操作，而且 reactants、heat 與 test solution 都有標示。",
        image: "assets/answers/q07-gas-test.png",
        imageAlt: "SBP marking-scheme apparatus for producing sulphur dioxide and testing it with acidified potassium manganate(VII)"
      }
    ]
  },
  {
    number: 8,
    section: "Section A",
    marks: "10 marks",
    pages: [18, 19],
    note: "The graph is cropped directly from the supplied SBP marking scheme.",
    segments: [
      {
        label: "8(a) · Meaning of 1/time",
        answer: "Rate of reaction.",
        explanation: "在固定終點的實驗中，所需時間越短，速率越高，因此 1/time 代表 rate of reaction。"
      },
      {
        label: "8(b) · Graph",
        answer: "Plot concentration of KI solution against 1/time.\nLabel both axes with units and draw a straight increasing line.",
        explanation: "Skema 的兩個得分點是坐標軸名稱與單位正確，以及畫出向上傾斜的直線。",
        image: "assets/answers/q08-rate-graph.png",
        imageAlt: "SBP marking-scheme straight-line graph of potassium iodide concentration against inverse time"
      },
      {
        label: "8(c)(i) · Factor affecting rate",
        answer: "Concentration of potassium iodide solution.",
        explanation: "比較 Set I 與 Set II 時，改變的變因是 KI solution concentration。"
      },
      {
        label: "8(c)(ii) · Collision theory",
        answer: "Set II has a higher rate of reaction than Set I.\nThe concentration of potassium iodide solution in Set II is higher.\nThere are more iodide ions per unit volume.\nThe frequency of effective collisions between H₂O₂, I⁻ and H⁺ is higher.",
        explanation: "答案要形成完整因果鏈：濃度較高 → 單位體積粒子較多 → 有效碰撞更頻繁 → 反應速率較高。"
      },
      {
        label: "8(d) · Dissolving sugar faster",
        answer: "Crush the sugar.\nThe sugar particles become smaller.\nThe total surface area becomes larger.",
        explanation: "把糖弄碎會增加總表面積，讓更多表面同時接觸水，所以溶解更快。"
      }
    ]
  },
  {
    number: 9,
    section: "Section B",
    marks: "20 marks",
    pages: [20, 21, 22],
    note: "Structural-formula images are cropped directly from the supplied SBP marking scheme.",
    segments: [
      {
        label: "9(a) · Unsaturated hydrocarbons X and Y",
        answer: "Characteristic: Has a double or triple bond between carbon atoms.\nX: Pent-2-ene\nY: Pent-2-yne",
        explanation: "Unsaturated hydrocarbon 含 C=C 或 C≡C。主鏈有五個 carbon，而多鍵從第二個 carbon 開始，所以名稱分別是 pent-2-ene 與 pent-2-yne。"
      },
      {
        label: "9(a) · Another structural isomer of Y",
        answer: "Draw any one correct structural isomer of C₅H₈, such as pent-1-yne or 3-methylbut-1-yne.",
        explanation: "Isomer 必須保持同一 molecular formula C₅H₈，但 carbon skeleton 或 triple-bond position 不同。原 skema 的兩個可接受例子如下。",
        image: "assets/answers/q09-y-isomers.png",
        imageAlt: "SBP marking-scheme examples of structural isomers of pent-2-yne"
      },
      {
        label: "9(b) · Complete combustion",
        answer: "C₅H₁₂ + 8O₂ → 5CO₂ + 6H₂O",
        explanation: "先平衡 5 個 carbon、12 個 hydrogen，最後得到右邊 16 個 oxygen atoms，所以 O₂ 的係數是 8。"
      },
      {
        label: "9(b) · Soot observation",
        answer: "Filter paper I.",
        explanation: "Compound X 的 carbon percentage 較高，不完全燃燒時較容易形成較多 soot，因此是 filter paper I。"
      },
      {
        label: "9(b) · Carbon percentage comparison",
        answer: "Step 1: %C in X = (5 × 12) / [(5 × 12) + (10 × 1)] × 100% = 85.7%\nStep 2: %C in Z = (5 × 12) / [(5 × 12) + (12 × 1)] × 100% = 83.3%\nFinal answer: The percentage of carbon by mass in Z is lower than in X.",
        explanation: "兩個分子都有 5 個 carbon；X 的 hydrogen 較少，所以 carbon 佔總質量的比例較高，產生 soot 的傾向也較大。",
        calculation: true
      },
      {
        label: "9(c)(i) · J, M and Q",
        answer: "J: C₂H₅OH, ethanol; general formula CₙH₂ₙ₊₁OH\nM: C₃H₆, propene; general formula CₙH₂ₙ\nQ: C₂H₅COOH, propanoic acid; general formula CₙH₂ₙ₊₁COOH",
        explanation: "J 是 alcohol、M 是 alkene、Q 是 carboxylic acid。先辨認 functional group，再寫名稱、分子式及 homologous-series general formula。",
        image: "assets/answers/q09-structure-j.png",
        imageAlt: "SBP marking-scheme structural formula of ethanol"
      },
      {
        label: "9(c)(i) · Structural formulae of M and Q",
        answer: "Draw the displayed structural formulae for propene and propanoic acid.",
        explanation: "Propene 必須顯示一個 C=C；propanoic acid 必須顯示完整的 –COOH group。",
        image: "assets/answers/q09-structures-mq.png",
        imageAlt: "SBP marking-scheme structural formulae of propene and propanoic acid"
      },
      {
        label: "9(c)(ii) · Product formed",
        answer: "Ethanoic acid.",
        explanation: "Ethanol 經 oxidation 會形成對應的兩碳 carboxylic acid，即 ethanoic acid。"
      }
    ]
  },
  {
    number: 10,
    section: "Section B",
    marks: "20 marks",
    pages: [23, 24, 25],
    note: "All numerical working follows the supplied SBP marking scheme.",
    segments: [
      {
        label: "10(a) · Exothermic reaction",
        answer: "Any two:\n• Heat is released.\n• The temperature of the surroundings increases.\n• The total energy content of the reactants is higher than that of the products.",
        explanation: "Skema 要求任寫兩點。Exothermic reaction 把 heat 傳到 surroundings，所以周圍溫度上升，products 的能量較低。"
      },
      {
        label: "10(b)(i) · Acids and equation",
        answer: "Acid A: Hydrochloric acid, HCl, or nitric acid, HNO₃\nAcid E: Ethanoic acid, CH₃COOH\nSet I: HCl + NaOH → NaCl + H₂O\nAccept: HNO₃ + NaOH → NaNO₃ + H₂O",
        explanation: "A 是 strong acid，而 E 是 weak acid。中和方程式必須與你為 A 選擇的 acid 保持一致。"
      },
      {
        label: "10(b)(i) · Temperature change in Set I",
        answer: "Step 1: n(acid/alkali) = (50 × 1) / 1,000 = 0.05 mol\nStep 2: Heat released, Q = 57.3 × 1,000 × 0.05 = 2,865 J\nStep 3: ΔT = Q / mc = 2,865 / (100 × 4.2)\nFinal answer: ΔT = 6.8 °C",
        explanation: "先由 concentration × volume 求反應的 moles，再把 57.3 kJ mol⁻¹ 轉成 joules。總 solution mass 取 100 g，最後用 Q = mcΔT。",
        calculation: true
      },
      {
        label: "10(b)(ii) · Hydrogen-ion concentration and pH",
        answer: "For pH 1.0, [H⁺] = 0.10 mol dm⁻³.\nAt the same acid concentration, the pH of A is lower than the pH of E.\nA has a higher hydrogen-ion concentration.\nThe higher the hydrogen-ion concentration, the lower the pH.",
        explanation: "[H⁺] = 10⁻ᵖᴴ，所以 pH 1 對應 0.10 mol dm⁻³。Strong acid A 電離較完全，因此 [H⁺] 較高、pH 較低。"
      },
      {
        label: "10(b)(iii) · Heat of neutralisation",
        answer: "x < 57.3 kJ mol⁻¹\ny < x\nA is a strong acid; E is a weak acid.\nA ionises completely; E ionises partially.\nSome heat released is used to ionise E completely.\nNaOH is a strong alkali; ammonia is a weak alkali.\nIn Set III, more heat is used to ionise E and ammonia completely.",
        explanation: "弱酸或弱鹼需要吸收部分中和所釋放的熱來完成電離，因此量到的 heat of neutralisation 較小。Set III 同時有 weak acid 與 weak alkali，所以 y 最小。"
      }
    ]
  },
  {
    number: 11,
    section: "Section C",
    marks: "20 marks",
    pages: [26, 27],
    note: "The chemical-cell apparatus is cropped directly from the supplied SBP marking scheme.",
    segments: [
      {
        label: "11(a)(i) · Energy conversion",
        answer: "Chemical energy → electrical energy",
        explanation: "Chemical cell 的自發 redox reaction 把儲存的 chemical energy 轉換成 electrical energy。"
      },
      {
        label: "11(a)(ii) · Negative terminal and apparatus",
        answer: "Negative terminal: Magnesium\nReason: The standard electrode potential, E°, of magnesium is more negative than that of copper.\nUse Mg/MgSO₄ and Cu/CuSO₄ half-cells connected by a salt bridge and a voltmeter.",
        explanation: "E° 較負的 magnesium 較容易失去 electrons，因此成為 negative terminal。作圖要有相配的 electrode、electrolyte、salt bridge 與外電路。",
        image: "assets/answers/q11-chemical-cell.png",
        imageAlt: "SBP marking-scheme chemical cell with magnesium and copper half-cells"
      },
      {
        label: "11(a)(ii) · Cell voltage",
        answer: "Step 1: E°cell = E°cathode − E°anode\nStep 2: E°cell = +0.40 − (−2.38)\nFinal answer: E°cell = +2.78 V",
        explanation: "Copper 是 cathode，magnesium 是 anode。減去負值等於相加，所以 cell voltage 為 +2.78 V。",
        calculation: true
      },
      {
        label: "11(a)(iii) · Electrode observations",
        answer: "Positive terminal:\nCu²⁺ ions undergo reduction.\nA brown solid forms and the copper electrode becomes thicker.\n\nNegative terminal:\nMagnesium undergoes oxidation.\nThe magnesium electrode becomes thinner.\nMg → Mg²⁺ + 2e⁻",
        explanation: "Cathode 發生 reduction，Cu²⁺ 沉積成 copper；anode 發生 oxidation，Mg atoms 失去 electrons 進入 solution，所以電極變薄。"
      },
      {
        label: "11(b) · Electroplate an iron key",
        answer: "1. Clean the copper plate and iron key with sandpaper.\n2. Place 50–200 cm³ of 0.5 mol dm⁻³ CuSO₄ or Cu(NO₃)₂ solution in a beaker.\n3. Connect the copper plate to the positive terminal.\n4. Connect the iron key to the negative terminal.\n5. Dip both objects into the solution.\n6. Leave the apparatus for 15–30 minutes.\n7. Anode: Cu → Cu²⁺ + 2e⁻\n8. Cathode: Cu²⁺ + 2e⁻ → Cu",
        explanation: "要鍍上的 metal 作 anode；要被鍍的 iron key 作 cathode。Anode 補充 Cu²⁺，cathode 上 Cu²⁺ 接受 electrons 並沉積成 copper layer。"
      }
    ]
  }
];
