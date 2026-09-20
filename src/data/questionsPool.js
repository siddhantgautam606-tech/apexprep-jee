export const QUESTIONS_POOL = [
  // =========================================================================
  // PHYSICS: KINEMATICS (~20 Questions)
  // =========================================================================
  {
    id: 'phy-kin-01',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2024 (Jan 29 Shift 1)',
    text: 'A projectile is launched from ground level with speed u at an angle θ with the horizontal. The ratio of its kinetic energy at the highest point to its initial kinetic energy is 3:4. What is the value of θ?',
    options: ['30°', '45°', '60°', '75°'],
    correctIndex: 0,
    explanation: 'At maximum height, only horizontal velocity survives: v = u*cosθ. Kinetic energy at top = 1/2 m (u cosθ)² = KE_initial * cos²θ. Given ratio = 3/4, so cos²θ = 3/4 => cosθ = √3/2 => θ = 30°.'
  },
  {
    id: 'phy-kin-02',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2024 (Jan 31 Shift 2)',
    text: 'The horizontal range of a projectile is 4√3 times its maximum height. Its angle of projection with the horizontal is:',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 0,
    explanation: 'R = 4H cotθ. Given R = 4√3 H => 4√3 H = 4 H cotθ => cotθ = √3 => tanθ = 1/√3 => θ = 30°.'
  },
  {
    id: 'phy-kin-03',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2023 (April 8 Shift 2)',
    text: 'The equation of trajectory of a projectile is given by y = √3 x - 5x². The angle of projection is:',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 2,
    explanation: 'Comparing with standard trajectory equation y = x*tanθ - (g*x²)/(2u²cos²θ), coefficient of x is tanθ = √3. Therefore θ = 60°.'
  },
  {
    id: 'phy-kin-04',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2024 (April 4 Shift 1)',
    text: 'A particle starts from rest with constant acceleration a. The ratio of distances covered in the nth second to that in n seconds is:',
    options: ['(2n - 1) / n²', '(2n + 1) / n²', '(2n - 1) / 2n', '2 / n'],
    correctIndex: 0,
    explanation: 'S_nth = u + a/2(2n - 1) = a/2(2n - 1). Total distance in n seconds S_n = 1/2 a n². Ratio = [a/2(2n - 1)] / [1/2 a n²] = (2n - 1) / n².'
  },
  {
    id: 'phy-kin-05',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2024 (Jan 27 Shift 2)',
    text: 'A car moving at 20 m/s is brought to rest over a distance of 40 m by applying constant braking force. If the speed were 40 m/s, the minimum stopping distance under the same braking force is:',
    options: ['80 m', '120 m', '160 m', '200 m'],
    correctIndex: 2,
    explanation: 'v² = u² - 2as => s = u² / (2a). Stopping distance is proportional to u². Doubling the speed increases the stopping distance by 2² = 4 times. 40 m × 4 = 160 m.'
  },
  {
    id: 'phy-kin-06',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2023 (Jan 25 Shift 1)',
    text: 'Two projectiles are thrown with the same initial speed at angles (45° - θ) and (45° + θ) to the horizontal. The ratio of their horizontal ranges is:',
    options: ['1:1', '1:2', '2:1', 'cos2θ : sin2θ'],
    correctIndex: 0,
    explanation: 'Angles that add up to 90° are complementary (θ₁ + θ₂ = 45 - θ + 45 + θ = 90°). Complementary angles give identical horizontal ranges for identical launch speeds.'
  },
  {
    id: 'phy-kin-07',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'relative-motion',
    yearTag: 'JEE Main 2023 (Jan 30 Shift 2)',
    text: 'A boat moves relative to water with speed 5 km/h. River flows at 3 km/h. The minimum time taken to cross the river of width 1 km is:',
    options: ['12 min', '15 min', '20 min', '10 min'],
    correctIndex: 0,
    explanation: 'Minimum crossing time occurs when the boat heads perpendicular to the bank: t_min = width / v_boat = 1 km / 5 km/h = 1/5 hr = 12 minutes.'
  },
  {
    id: 'phy-kin-08',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2023 (April 6 Shift 1)',
    text: 'A ball dropped from height h reaches ground in time T. The position of the ball at time T/3 is at height:',
    options: ['h / 9 from ground', '8h / 9 from ground', '7h / 9 from ground', 'h / 3 from ground'],
    correctIndex: 1,
    explanation: 'Distance fallen in T/3: y = 1/2 g (T/3)² = (1/9)(1/2 g T²) = h/9. Height above the ground = h - h/9 = 8h/9.'
  },
  {
    id: 'phy-kin-09',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2023 (April 10 Shift 2)',
    text: 'A ball is projected at speed 10 m/s at 45° with horizontal. Its radius of curvature at the highest point of its trajectory is (g = 10 m/s²):',
    options: ['5 m', '10 m', '2.5 m', '7.07 m'],
    correctIndex: 0,
    explanation: 'At maximum height, v = u*cos(45°) = 10 / √2 = 5√2 m/s. Normal acceleration a_n = g = 10. Radius of curvature R = v² / a_n = (5√2)² / 10 = 50 / 10 = 5 m.'
  },
  {
    id: 'phy-kin-10',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2022 (June 26 Shift 1)',
    text: 'A body travels 200 cm in first 2 s and 220 cm in next 4 s with constant acceleration. The velocity at the end of 7 s from start is:',
    options: ['10 cm/s', '15 cm/s', '20 cm/s', '25 cm/s'],
    correctIndex: 0,
    explanation: '200 = 2u + 2a => u + a = 100. In 6s total: 420 = 6u + 18a => u + 3a = 70. Subtracting gives 2a = -30 => a = -15 cm/s², u = 115 cm/s. At t=7s: v = 115 - 15(7) = 115 - 105 = 10 cm/s.'
  },
  {
    id: 'phy-kin-11',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'relative-motion',
    yearTag: 'JEE Main 2022 (July 28 Shift 2)',
    text: 'A man walks at 3 km/h in rain falling vertically at 4 km/h. At what angle with vertical should he hold his umbrella?',
    options: ['tan⁻¹(3/4)', 'tan⁻¹(4/3)', 'sin⁻¹(3/5)', 'cos⁻¹(3/5)'],
    correctIndex: 0,
    explanation: 'Relative velocity of rain w.r.t man: v_rm = v_r - v_m = -4j - 3i. Angle with vertical: tanθ = |v_m| / |v_r| = 3/4 => θ = tan⁻¹(3/4).'
  },
  {
    id: 'phy-kin-12',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2022 (June 24 Shift 2)',
    text: 'A projectile has range R and max height H. If launch angle is 45°, then relation between R and H is:',
    options: ['R = 4H', 'R = 2H', 'R = H / 4', 'R = 8H'],
    correctIndex: 0,
    explanation: 'R = 4H cotθ. For θ = 45°, cot(45°) = 1, so R = 4H.'
  },
  {
    id: 'phy-kin-13',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2022 (July 25 Shift 1)',
    text: 'The velocity-time relation of an electron is v = α t. Distance travelled in first 4 seconds is (where α = 3 m/s²):',
    options: ['24 m', '48 m', '12 m', '36 m'],
    correctIndex: 0,
    explanation: 's = ∫ v dt = ∫₀⁴ 3t dt = [3t²/2]₀⁴ = 3(16)/2 = 24 m.'
  },
  {
    id: 'phy-kin-14',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2021 (March 16 Shift 1)',
    text: 'If time of flight is T and horizontal range is R, then horizontal velocity component is:',
    options: ['R / T', '2R / T', 'R / 2T', 'gT / 2'],
    correctIndex: 0,
    explanation: 'R = u_x * T, hence horizontal velocity component u_x = R / T.'
  },
  {
    id: 'phy-kin-15',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2021 (Feb 24 Shift 1)',
    text: 'A particle moves along x-axis such that x = 9t² - t³. The instantaneous velocity is zero at t equal to:',
    options: ['3 s', '6 s', '9 s', '0 s'],
    correctIndex: 1,
    explanation: 'v = dx/dt = 18t - 3t². Setting v = 0 gives 3t(6 - t) = 0 => t = 6 s.'
  },
  {
    id: 'phy-kin-16',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2021 (July 20 Shift 2)',
    text: 'An object projected with 20 m/s reaches a maximum height of 10 m. The angle of projection with horizontal is (g = 10 m/s²):',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    explanation: 'H = u² sin²θ / (2g) => 10 = (400 sin²θ) / 20 => sin²θ = 200/400 = 1/2 => sinθ = 1/√2 => θ = 45°.'
  },
  {
    id: 'phy-kin-17',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'relative-motion',
    yearTag: 'JEE Main 2020 (Sept 2 Shift 1)',
    text: 'Two cars A and B move in the same direction with 20 m/s and 15 m/s respectively. The relative speed of A with respect to B is:',
    options: ['5 m/s', '35 m/s', '25 m/s', '10 m/s'],
    correctIndex: 0,
    explanation: 'v_AB = v_A - v_B = 20 - 15 = 5 m/s.'
  },
  {
    id: 'phy-kin-18',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2020 (Sept 3 Shift 2)',
    text: 'The displacement x of a particle varies with time as x = a e^(-α t) + b e^(β t). The velocity of the particle will:',
    options: ['Go on increasing with time', 'Be independent of time', 'Drop to zero when t = 0', 'Go on decreasing with time'],
    correctIndex: 0,
    explanation: 'v = dx/dt = -aα e^(-α t) + bβ e^(β t). As t increases, e^(-α t) vanishes while e^(β t) grows exponentially, so velocity increases.'
  },
  {
    id: 'phy-kin-19',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: 'projectile-motion',
    yearTag: 'JEE Main 2020 (Jan 7 Shift 1)',
    text: 'The speed of a projectile at its highest point is v_0 / 2 (where v_0 is launch speed). What is the launch angle with horizontal?',
    options: ['60°', '30°', '45°', '75°'],
    correctIndex: 0,
    explanation: 'v_top = v_0 cosθ = v_0 / 2 => cosθ = 1/2 => θ = 60°.'
  },
  {
    id: 'phy-kin-20',
    subjectId: 'physics',
    chapterId: 'kinematics',
    subtopicId: '1d-motion',
    yearTag: 'JEE Main 2019 (April 9 Shift 1)',
    text: 'A bullet loses 1/20 of its velocity after penetrating through a plank. The minimum number of identical planks required to stop the bullet is:',
    options: ['11', '10', '19', '14'],
    correctIndex: 0,
    explanation: 'v = 19/20 u. Work-energy theorem: F s = 1/2 m [u² - (19/20 u)²] = 1/2 m u² [39 / 400]. For n planks to stop it: n F s = 1/2 m u² => n (39 / 400) = 1 => n = 400 / 39 = 10.25 => 11 planks.'
  },

  // =========================================================================
  // CHEMISTRY: THERMODYNAMICS (~20 Questions)
  // =========================================================================
  {
    id: 'chem-thermo-01',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2024 (Jan 31 Shift 2)',
    text: 'For the reaction: N₂(g) + 3H₂(g) → 2NH₃(g) at 298 K, what is the relation between ΔH and ΔU?',
    options: ['ΔH = ΔU - 2RT', 'ΔH = ΔU + 2RT', 'ΔH = ΔU - RT', 'ΔH = ΔU + RT'],
    correctIndex: 0,
    explanation: 'Δn_g = moles of gaseous products - moles of gaseous reactants = 2 - (1 + 3) = -2. Since ΔH = ΔU + Δn_g*RT, ΔH = ΔU - 2RT.'
  },
  {
    id: 'chem-thermo-02',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2024 (Jan 27 Shift 1)',
    text: 'An ideal gas expands isothermally from 1 L to 10 L against a constant external pressure of 1 bar. The work done by the gas is:',
    options: ['-900 J', '+900 J', '-1000 J', '0 J'],
    correctIndex: 0,
    explanation: 'w = -P_ext * ΔV = -1 bar × (10 - 1) L = -9 bar·L. 1 bar·L = 100 J, so w = -9 × 100 J = -900 J.'
  },
  {
    id: 'chem-thermo-03',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2024 (April 5 Shift 2)',
    text: 'Which of the following processes has ΔS < 0?',
    options: ['C(diamond) → C(graphite)', 'N₂(g, 1 atm) → N₂(g, 0.5 atm)', 'Condensation of water vapour', 'Dissolution of NaCl in water'],
    correctIndex: 2,
    explanation: 'During condensation, water vapor (gas) turns into liquid. Gaseous states have higher entropy than liquid, so entropy decreases (ΔS < 0).'
  },
  {
    id: 'chem-thermo-04',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2023 (Jan 24 Shift 2)',
    text: 'For an adiabatic process involving an ideal gas, which of the following is true?',
    options: ['q = 0 and ΔU = w', 'w = 0 and ΔU = q', 'ΔT = 0', 'P * ΔV = 0'],
    correctIndex: 0,
    explanation: 'By definition, no heat enters or leaves the system in an adiabatic process (q = 0). From the First Law: ΔU = q + w = 0 + w => ΔU = w.'
  },
  {
    id: 'chem-thermo-05',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2023 (Jan 29 Shift 1)',
    text: 'A reaction is spontaneous at all temperatures if:',
    options: ['ΔH < 0 and ΔS > 0', 'ΔH > 0 and ΔS < 0', 'ΔH > 0 and ΔS > 0', 'ΔH < 0 and ΔS < 0'],
    correctIndex: 0,
    explanation: 'ΔG = ΔH - TΔS. If ΔH is negative and ΔS is positive, ΔG is always negative regardless of temperature T.'
  },
  {
    id: 'chem-thermo-06',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'thermochemistry-hess',
    yearTag: 'JEE Main 2023 (April 11 Shift 2)',
    text: 'Standard enthalpy of formation of which substance is taken as zero by convention?',
    options: ['Br₂(l)', 'C(diamond)', 'O₃(g)', 'H₂O(l)'],
    correctIndex: 0,
    explanation: 'Standard enthalpy of formation of an element in its most stable standard physical state is defined as zero. Liquid bromine Br₂(l) is its standard state.'
  },
  {
    id: 'chem-thermo-07',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2023 (April 13 Shift 1)',
    text: 'For an ideal gas, the value of (∂U/∂V)_T is:',
    options: ['0', 'Positive', 'Negative', 'R / V'],
    correctIndex: 0,
    explanation: 'Internal energy of an ideal gas depends solely on temperature. At constant temperature, internal energy is invariant with volume: (∂U/∂V)_T = 0.'
  },
  {
    id: 'chem-thermo-08',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2022 (June 27 Shift 2)',
    text: 'The standard Gibbs energy change ΔG° is related to equilibrium constant K as:',
    options: ['ΔG° = -RT ln K', 'ΔG° = RT ln K', 'ΔG° = -2.303 RT log(1/K)', 'ΔG° = e^(-K/RT)'],
    correctIndex: 0,
    explanation: 'The thermodynamic relationship between standard free energy and equilibrium constant is ΔG° = -RT ln K.'
  },
  {
    id: 'chem-thermo-09',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2022 (July 26 Shift 1)',
    text: 'In free expansion of an ideal gas into a vacuum under adiabatic conditions:',
    options: ['q = 0, w = 0, ΔT = 0', 'q ≠ 0, w = 0, ΔU = 0', 'q = 0, w > 0, ΔT < 0', 'q = 0, w = 0, ΔT > 0'],
    correctIndex: 0,
    explanation: 'Vacuum means P_ext = 0, so w = 0. Adiabatic means q = 0. By First Law ΔU = 0 => for an ideal gas, ΔT = 0.'
  },
  {
    id: 'chem-thermo-10',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'thermochemistry-hess',
    yearTag: 'JEE Main 2022 (July 29 Shift 2)',
    text: 'If enthalpy of combustion of carbon to CO₂ is -393.5 kJ/mol, how much heat is released on burning 3 g of diamond (assuming same enthalpy)?',
    options: ['98.375 kJ', '196.75 kJ', '393.5 kJ', '49.18 kJ'],
    correctIndex: 0,
    explanation: 'Moles of carbon = 3 g / 12 g/mol = 0.25 mol. Heat released = 0.25 × 393.5 kJ = 98.375 kJ.'
  },
  {
    id: 'chem-thermo-11',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2021 (Feb 26 Shift 1)',
    text: 'One mole of an ideal gas is compressed isothermally and reversibly from 2 L to 1 L at 300 K. The entropy change of the gas ΔS is:',
    options: ['-R ln 2', '+R ln 2', '0', '-2R ln 2'],
    correctIndex: 0,
    explanation: 'ΔS = nR ln(V₂ / V₁) = 1 × R ln(1/2) = -R ln 2.'
  },
  {
    id: 'chem-thermo-12',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2021 (March 17 Shift 2)',
    text: 'For water at 100°C and 1 atm pressure, the value of ΔG for vaporization H₂O(l) ⇌ H₂O(g) is:',
    options: ['0', '> 0', '< 0', 'Cannot be predicted'],
    correctIndex: 0,
    explanation: 'At boiling point (100°C, 1 atm), liquid water and steam are in dynamic equilibrium. At equilibrium, ΔG = 0.'
  },
  {
    id: 'chem-thermo-13',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2021 (July 22 Shift 1)',
    text: 'The difference between C_p and C_v for 1 mole of an ideal gas is:',
    options: ['R', '2R', 'R / 2', '0'],
    correctIndex: 0,
    explanation: "Mayer's relation gives C_p - C_v = R for one mole of an ideal gas."
  },
  {
    id: 'chem-thermo-14',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2021 (August 27 Shift 2)',
    text: 'Third law of thermodynamics provides a foundational method to evaluate:',
    options: ['Absolute entropy of pure crystalline substances at any temperature', 'Enthalpy of reaction', 'Activation energy', 'Internal energy zero point'],
    correctIndex: 0,
    explanation: 'The Third Law states entropy of a pure, perfectly crystalline substance at absolute zero is zero, enabling absolute entropy calculations.'
  },
  {
    id: 'chem-thermo-15',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'thermochemistry-hess',
    yearTag: 'JEE Main 2020 (Jan 8 Shift 1)',
    text: 'According to Hess’s law of constant heat summation, enthalpy change for a chemical reaction depends only on:',
    options: ['Initial and final states of the system', 'Path followed', 'Number of intermediate steps', 'Pressure fluctuations during reaction'],
    correctIndex: 0,
    explanation: 'Enthalpy is a state function. The total enthalpy change depends solely on initial reactants and final products, irrespective of reaction path.'
  },
  {
    id: 'chem-thermo-16',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2020 (Sept 4 Shift 1)',
    text: 'An intensive property among the following is:',
    options: ['Density', 'Volume', 'Mass', 'Heat capacity'],
    correctIndex: 0,
    explanation: 'Density is the ratio of mass to volume (two extensive properties), making it an intensive property that is independent of system size.'
  },
  {
    id: 'chem-thermo-17',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'second-law-entropy',
    yearTag: 'JEE Main 2020 (Sept 6 Shift 2)',
    text: 'If ΔH = +30 kJ/mol and ΔS = +100 J/(K·mol), the temperature at which reaction turns spontaneous is:',
    options: ['> 300 K', '< 300 K', '> 3000 K', '< 30 K'],
    correctIndex: 0,
    explanation: 'For spontaneity ΔG = ΔH - TΔS < 0 => T > ΔH / ΔS = 30,000 J / 100 J/K = 300 K.'
  },
  {
    id: 'chem-thermo-18',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2019 (Jan 10 Shift 2)',
    text: 'Work done during reversible isothermal expansion of an ideal gas is:',
    options: ['-2.303 nRT log(V₂/V₁)', '-P_ext(V₂ - V₁)', '0', '-nRT(V₂ - V₁)'],
    correctIndex: 0,
    explanation: 'Integrating -∫ P dV using P = nRT/V yields w_rev = -2.303 nRT log(V₂/V₁).'
  },
  {
    id: 'chem-thermo-19',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'thermochemistry-hess',
    yearTag: 'JEE Main 2019 (April 10 Shift 1)',
    text: 'Bond dissociation enthalpy of H-H, Cl-Cl and H-Cl are 434, 242 and 431 kJ/mol. Enthalpy of formation of HCl is:',
    options: ['-93 kJ/mol', '+93 kJ/mol', '-186 kJ/mol', '+186 kJ/mol'],
    correctIndex: 0,
    explanation: '1/2 H₂ + 1/2 Cl₂ → HCl. ΔH_f = [1/2 B.E(H-H) + 1/2 B.E(Cl-Cl)] - B.E(H-Cl) = [434/2 + 242/2] - 431 = [217 + 121] - 431 = 338 - 431 = -93 kJ/mol.'
  },
  {
    id: 'chem-thermo-20',
    subjectId: 'chemistry',
    chapterId: 'thermo-chem',
    subtopicId: 'first-law',
    yearTag: 'JEE Main 2019 (Jan 12 Shift 1)',
    text: 'In an isochoric process for an ideal gas, the work done w is:',
    options: ['0', '-P ΔV', 'n R ΔT', '-n R T ln(V₂/V₁)'],
    correctIndex: 0,
    explanation: 'Isochoric means volume is constant (dV = 0). Thus work w = -∫ P dV = 0.'
  },

  // =========================================================================
  // MATHEMATICS: DIFFERENTIAL CALCULUS / LIMITS (~20 Questions)
  // =========================================================================
  {
    id: 'math-calc-01',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2024 (Jan 27 Shift 1)',
    text: 'Evaluate: lim (x→0) [ (1 - cos(4x)) / x² ]',
    options: ['4', '8', '16', '2'],
    correctIndex: 1,
    explanation: '1 - cos(4x) = 2 sin²(2x). Limit = 2 * lim [sin(2x)/2x]² * 4 = 2 * (1)² * 4 = 8.'
  },
  {
    id: 'math-calc-02',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2024 (Jan 30 Shift 2)',
    text: 'Evaluate: lim (x→0) [ (e^(3x) - 1) / sin(2x) ]',
    options: ['3/2', '2/3', '1', '6'],
    correctIndex: 0,
    explanation: 'Divide numerator and denominator by x: [ (e^(3x)-1)/(3x) * 3 ] / [ (sin(2x)/(2x)) * 2 ] = (1 * 3) / (1 * 2) = 3/2.'
  },
  {
    id: 'math-calc-03',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'continuity-differentiability',
    yearTag: 'JEE Main 2024 (April 6 Shift 1)',
    text: 'If f(x) = |x - 2| + |x - 3|, the number of points where f(x) is not differentiable is:',
    options: ['2', '1', '0', '3'],
    correctIndex: 0,
    explanation: 'Modulus functions |x - a| have sharp corners where derivative does not exist. f(x) has sharp corners at x = 2 and x = 3, so it is non-differentiable at exactly 2 points.'
  },
  {
    id: 'math-calc-04',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2023 (Jan 24 Shift 1)',
    text: 'lim (x→0) [ (tan x - sin x) / x³ ] equals:',
    options: ['1/2', '1/3', '1', '2'],
    correctIndex: 0,
    explanation: 'tan x - sin x = tan x (1 - cos x) = tan x * 2 sin²(x/2). Divide by x³: (tan x / x) * 2 * (sin(x/2) / (x/2))² * (1/4) = 1 * 2 * 1 * (1/4) = 1/2.'
  },
  {
    id: 'math-calc-05',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2023 (Jan 31 Shift 2)',
    text: 'lim (x→∞) [ (x + 6)/(x + 1) ]^(x + 4) is equal to:',
    options: ['e⁵', 'e⁴', 'e⁶', 'e'],
    correctIndex: 0,
    explanation: '1^∞ form: e^( lim (x→∞) (x + 4) * [ (x + 6)/(x + 1) - 1 ] ) = e^( lim (x + 4) * 5 / (x + 1) ) = e⁵.'
  },
  {
    id: 'math-calc-06',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'continuity-differentiability',
    yearTag: 'JEE Main 2023 (April 8 Shift 1)',
    text: 'If f(x) = (sin 3x)/x for x ≠ 0 and f(0) = k is continuous at x = 0, then k is:',
    options: ['3', '1', '1/3', '0'],
    correctIndex: 0,
    explanation: 'For continuity at x = 0, lim (x→0) f(x) = f(0). lim (sin 3x)/x = 3. Therefore k = 3.'
  },
  {
    id: 'math-calc-07',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2023 (April 12 Shift 1)',
    text: 'lim (x→0) [ ln(1 + 5x) / (e^(2x) - 1) ] is equal to:',
    options: ['5/2', '2/5', '1', '10'],
    correctIndex: 0,
    explanation: 'Rewrite as [ ln(1 + 5x)/(5x) * 5 ] / [ (e^(2x) - 1)/(2x) * 2 ] = (1 * 5) / (1 * 2) = 5/2.'
  },
  {
    id: 'math-calc-08',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'derivatives-rules',
    yearTag: 'JEE Main 2022 (June 25 Shift 2)',
    text: 'If y = ln(sec x + tan x), then dy/dx is:',
    options: ['sec x', 'tan x', 'sec x * tan x', 'sec² x'],
    correctIndex: 0,
    explanation: 'dy/dx = (1 / (sec x + tan x)) * (sec x tan x + sec² x) = [sec x (tan x + sec x)] / (sec x + tan x) = sec x.'
  },
  {
    id: 'math-calc-09',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2022 (June 28 Shift 1)',
    text: 'lim (x→0) [ (√(1 + x) - 1) / x ] is:',
    options: ['1/2', '1', '2', '0'],
    correctIndex: 0,
    explanation: 'Rationalize numerator: (1 + x - 1) / [ x (√(1 + x) + 1) ] = 1 / [ √(1 + x) + 1 ] = 1 / (1 + 1) = 1/2.'
  },
  {
    id: 'math-calc-10',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'continuity-differentiability',
    yearTag: 'JEE Main 2022 (July 27 Shift 2)',
    text: 'The function f(x) = [x] (greatest integer function) is discontinuous at:',
    options: ['All integers', 'All real numbers', 'Only at x = 0', 'Nowhere'],
    correctIndex: 0,
    explanation: 'For any integer n, lim (x→n⁻) [x] = n - 1, whereas lim (x→n⁺) [x] = n. Hence it is discontinuous at every integer.'
  },
  {
    id: 'math-calc-11',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'derivatives-rules',
    yearTag: 'JEE Main 2021 (Feb 25 Shift 2)',
    text: 'Derivative of sin⁻¹(2x / (1 + x²)) with respect to cos⁻¹((1 - x²)/(1 + x²)) for 0 < x < 1 is:',
    options: ['1', '-1', '1/2', '2'],
    correctIndex: 0,
    explanation: 'For 0 < x < 1: sin⁻¹(2x / (1 + x²)) = 2 tan⁻¹ x, and cos⁻¹((1 - x²)/(1 + x²)) = 2 tan⁻¹ x. Let u = 2 tan⁻¹ x and v = 2 tan⁻¹ x. du/dv = 1.'
  },
  {
    id: 'math-calc-12',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2021 (March 18 Shift 1)',
    text: 'lim (x→0) [ (1 - cos x) / sin²(3x) ] equals:',
    options: ['1/18', '1/9', '1/6', '1/2'],
    correctIndex: 0,
    explanation: '[(1 - cos x)/x² * x²] / [ (sin(3x)/3x)² * 9x² ] = (1/2) / 9 = 1/18.'
  },
  {
    id: 'math-calc-13',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'derivatives-rules',
    yearTag: 'JEE Main 2021 (July 25 Shift 1)',
    text: 'If x = a cos³θ, y = a sin³θ, then dy/dx at θ = π/4 is:',
    options: ['-1', '1', '0', '-√3'],
    correctIndex: 0,
    explanation: 'dy/dθ = 3a sin²θ cosθ; dx/dθ = -3a cos²θ sinθ. dy/dx = (dy/dθ) / (dx/dθ) = -tanθ. At θ = π/4, dy/dx = -tan(π/4) = -1.'
  },
  {
    id: 'math-calc-14',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2021 (August 31 Shift 1)',
    text: 'lim (x→0) [ (a^x - b^x) / x ] is equal to:',
    options: ['ln(a / b)', 'ln(a * b)', 'a / b', 'ln(b / a)'],
    correctIndex: 0,
    explanation: 'lim [ (a^x - 1)/x - (b^x - 1)/x ] = ln a - ln b = ln(a / b).'
  },
  {
    id: 'math-calc-15',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'continuity-differentiability',
    yearTag: 'JEE Main 2020 (Jan 7 Shift 2)',
    text: 'If f(x) is differentiable at x = c, which of the following is necessarily true?',
    options: ['f(x) is continuous at x = c', 'f\'(c) = 0', 'f\'(x) is continuous at x = c', 'f\'\'(c) exists'],
    correctIndex: 0,
    explanation: 'Differentiability implies continuity: if a function is differentiable at a point, it is guaranteed to be continuous at that point.'
  },
  {
    id: 'math-calc-16',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2020 (Sept 2 Shift 2)',
    text: 'lim (x→0) [ x cot(4x) / (sin²(2x) cot²(2x)) ] equals:',
    options: ['1/4', '1/2', '1', '4'],
    correctIndex: 0,
    explanation: 'sin²(2x) cot²(2x) = cos²(2x). As x→0, cos²(2x) → 1. Expression reduces to lim x cot(4x) = lim x / tan(4x) = 1/4.'
  },
  {
    id: 'math-calc-17',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2020 (Sept 5 Shift 1)',
    text: 'lim (x→2) [ (x³ - 8) / (x - 2) ] is:',
    options: ['12', '8', '6', '4'],
    correctIndex: 0,
    explanation: 'Factor x³ - 8 = (x - 2)(x² + 2x + 4). Cancelling (x - 2): lim (x² + 2x + 4) = 4 + 4 + 4 = 12.'
  },
  {
    id: 'math-calc-18',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'derivatives-rules',
    yearTag: 'JEE Main 2019 (Jan 9 Shift 1)',
    text: 'If y = x^x, then dy/dx is:',
    options: ['x^x (1 + ln x)', 'x^x ln x', 'x * x^(x-1)', 'x^x (1 - ln x)'],
    correctIndex: 0,
    explanation: 'ln y = x ln x. Differentiating implicitly: (1/y)(dy/dx) = x(1/x) + ln x = 1 + ln x => dy/dx = y(1 + ln x) = x^x (1 + ln x).'
  },
  {
    id: 'math-calc-19',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'limits-standard',
    yearTag: 'JEE Main 2019 (April 8 Shift 2)',
    text: 'lim (x→0) [ (3^x - 2^x) / x ] is:',
    options: ['ln(3/2)', 'ln(6)', '3/2', '1'],
    correctIndex: 0,
    explanation: 'Standard limit rule: lim (a^x - b^x)/x = ln(a/b) = ln(3/2).'
  },
  {
    id: 'math-calc-20',
    subjectId: 'math',
    chapterId: 'calculus-diff',
    subtopicId: 'continuity-differentiability',
    yearTag: 'JEE Main 2019 (Jan 11 Shift 2)',
    text: 'If f(x) = x * |x|, then at x = 0 the function is:',
    options: ['Continuous and differentiable with f\'(0) = 0', 'Continuous but not differentiable', 'Discontinuous', 'f\'(0) does not exist'],
    correctIndex: 0,
    explanation: 'For x ≥ 0, f(x) = x² => f\'(0⁺) = 0. For x < 0, f(x) = -x² => f\'(0⁻) = 0. Left-hand derivative equals right-hand derivative = 0, so it is both continuous and differentiable.'
  }
];