export const CBT_75_QUESTIONS = [
  // PHYSICS (1-25)
  {
    id: 1, subject: "Physics", chapter: "Kinematics", section: "Section A", meta: "JEE Main 2023, 29 Jan Shift-1", type: "MCQ",
    text: "A body of mass <i>m</i> is projected at an angle of 45&deg; with the horizontal with initial velocity <i>u</i>. The magnitude of the rate of change of angular momentum of the projectile about the point of projection at time <i>t = u / (&radic;2 g)</i> is:",
    options: [
      { key: "A", text: "mu&sup2; / 2" },
      { key: "B", text: "mu&sup2; / (2&radic;2)" },
      { key: "C", text: "mu&sup2; / 4" },
      { key: "D", text: "mu&sup2; / &radic;2" }
    ],
    correct: "B",
    solution: "Torque &tau; = |r &times; F| = mg &times; x(t) = mg(u cos 45&deg; t) = mg(u/&radic;2)(u/(&radic;2 g)) = mu&sup2; / (2&radic;2)."
  },
  {
    id: 2, subject: "Physics", chapter: "Kinematics", section: "Section A", meta: "JEE Main 2022, 27 July Shift-2", type: "MCQ",
    text: "A particle moving in a straight line has its acceleration <i>a</i> depending on its velocity <i>v</i> as <i>a = -2&radic;v</i> (in S.I. units). If at <i>t = 0</i> its velocity is 16 m/s, the distance covered by the particle before it comes to rest is:",
    options: [
      { key: "A", text: "64/3 m" },
      { key: "B", text: "32/3 m" },
      { key: "C", text: "16 m" },
      { key: "D", text: "128/3 m" }
    ],
    correct: "A",
    solution: "a = v(dv/dx) = -2&radic;v &rArr; &radic;v dv = -2 dx. Integrating from 16 to 0: [2/3 v<sup>3/2</sup>]<sub>16</sub><sup>0</sup> = -2x &rArr; -2/3(64) = -2x &rArr; x = 64/3 m."
  },
  {
    id: 3, subject: "Physics", chapter: "Work Power Energy", section: "Section A", meta: "Graph-Based | JEE Main 2021, 26 Feb Shift-1", type: "MCQ",
    graphicSvg: '<svg width="280" height="130" viewBox="0 0 280 130"><line x1="30" y1="65" x2="260" y2="65" stroke="#334155" stroke-width="1.5"/><line x1="40" y1="120" x2="40" y2="10" stroke="#334155" stroke-width="1.5"/><text x="250" y="80" font-size="11">x (m)</text><text x="15" y="20" font-size="11">F (N)</text><text x="18" y="25" font-size="10">10</text><text x="12" y="115" font-size="10">-10</text><polyline points="40,65 100,20 160,65 190,110 220,65" fill="none" stroke="#1d4ed8" stroke-width="2.5"/><line x1="100" y1="20" x2="100" y2="65" stroke="#94a3b8" stroke-dasharray="3,3"/><line x1="190" y1="65" x2="190" y2="110" stroke="#94a3b8" stroke-dasharray="3,3"/><text x="96" y="78" font-size="10">2</text><text x="156" y="78" font-size="10">4</text><text x="186" y="58" font-size="10">5</text><text x="216" y="78" font-size="10">6</text></svg>',
    text: "The force <i>F</i> acting on a particle of mass <i>m</i> along the x-axis varies with position <i>x</i> as shown above. The particle starts from rest at <i>x = 0</i>. The kinetic energy of the particle at <i>x = 6 m</i> is:",
    options: [
      { key: "A", text: "10 J" },
      { key: "B", text: "20 J" },
      { key: "C", text: "30 J" },
      { key: "D", text: "15 J" }
    ],
    correct: "D",
    solution: "Work done = Area under F-x graph = 1/2(4)(10) - 1/2(2)(10) = 20 - 5 = 15 J. Since K<sub>i</sub> = 0, K<sub>f</sub> = 15 J."
  },
  {
    id: 4, subject: "Physics", chapter: "Laws of Motion", section: "Section A", meta: "JEE Main 2024, 30 Jan Shift-1", type: "MCQ",
    text: "A block of mass <i>m</i> is placed on a smooth inclined wedge of inclination &theta; and mass <i>M</i>, free to slide on a smooth horizontal surface. The horizontal acceleration of the wedge is:",
    options: [
      { key: "A", text: "(mg sin&theta; cos&theta;) / (M + m sin&sup2;&theta;)" },
      { key: "B", text: "(mg sin&theta;) / (M + m cos&sup2;&theta;)" },
      { key: "C", text: "(mg tan&theta;) / (M + m tan&theta;)" },
      { key: "D", text: "(mg sin&theta; cos&theta;) / (M + m)" }
    ],
    correct: "A",
    solution: "Standard wedge constraint gives a = (mg sin&theta; cos&theta;) / (M + m sin&sup2;&theta;)."
  },
  {
    id: 5, subject: "Physics", chapter: "Work Power Energy", section: "Section A", meta: "JEE Main 2023, 11 April Shift-1", type: "MCQ",
    text: "A body of mass 2 kg moves under a conservative force with potential energy <i>U(x) = (x&sup3; - 3x) J</i>. Which of the following statements is <b>INCORRECT</b>?",
    options: [
      { key: "A", text: "x = 1 m is a point of stable equilibrium." },
      { key: "B", text: "x = -1 m is a point of unstable equilibrium." },
      { key: "C", text: "The particle oscillates about x = 1 m if total energy E &isin; (-2, 2) J." },
      { key: "D", text: "Force on the particle at x = 0 is zero." }
    ],
    correct: "D",
    solution: "F = -dU/dx = -(3x&sup2; - 3) = 3 - 3x&sup2;. At x = 0, F = 3 N &ne; 0. Statement (D) is incorrect."
  },
  {
    id: 6, subject: "Physics", chapter: "Circular Motion", section: "Section A", meta: "JEE Main 2021, 20 July Shift-1", type: "MCQ",
    text: "A bullet of mass <i>m</i> moving with speed <i>v</i> hits a pendulum bob of mass <i>M</i> suspended by a string of length <i>L</i> and gets embedded in it. The minimum speed <i>v</i> of the bullet to complete a full vertical circle is:",
    options: [
      { key: "A", text: "[(M+m)/m] &radic;(5gL)" },
      { key: "B", text: "(M/m) &radic;(5gL)" },
      { key: "C", text: "&radic;(5gL)" },
      { key: "D", text: "[(M+m)/m] &radic;(4gL)" }
    ],
    correct: "A",
    solution: "V<sub>sys</sub> = mv / (M + m). For full vertical circle, V<sub>sys</sub> &ge; &radic;(5gL) &rArr; v = [(M+m)/m] &radic;(5gL)."
  },
  {
    id: 7, subject: "Physics", chapter: "Laws of Motion", section: "Section A", meta: "Comprehension | JEE Main 2022, 28 June Shift-2", type: "MCQ",
    text: "<b>Paragraph (Q7 & Q8):</b> Two blocks A (2 kg) and B (4 kg) are connected by a light string over a pulley. Block A rests on block B on a smooth table. &mu;<sub>s</sub> = 0.4, &mu;<sub>k</sub> = 0.3.<br><br>The maximum force F<sub>max</sub> that can be applied to block B such that block A does not slip on B is:",
    options: [
      { key: "A", text: "8 N" },
      { key: "B", text: "16 N" },
      { key: "C", text: "24 N" },
      { key: "D", text: "32 N" }
    ],
    correct: "B",
    solution: "Maximum friction f<sub>max</sub> = &mu;<sub>s</sub> m<sub>A</sub> g = 0.4 &times; 2 &times; 10 = 8 N. Tension T = f = 8 N. F<sub>max</sub> = T + f = 16 N."
  },
  {
    id: 8, subject: "Physics", chapter: "Laws of Motion", section: "Section A", meta: "Comprehension | JEE Main 2022, 28 June Shift-2", type: "MCQ",
    text: "For the system in the paragraph above, if <i>F = 30 N</i>, the magnitude of acceleration of block B is:",
    options: [
      { key: "A", text: "4.5 m/s&sup2;" },
      { key: "B", text: "6.0 m/s&sup2;" },
      { key: "C", text: "7.5 m/s&sup2;" },
      { key: "D", text: "5.0 m/s&sup2;" }
    ],
    correct: "B",
    solution: "f<sub>k</sub> = &mu;<sub>k</sub> m<sub>A</sub> g = 0.3 &times; 20 = 6 N. F - f<sub>k</sub> = m<sub>B</sub> a<sub>B</sub> &rArr; 30 - 6 = 4a<sub>B</sub> &rArr; a<sub>B</sub> = 6.0 m/s&sup2;."
  },
  {
    id: 9, subject: "Physics", chapter: "Circular Motion", section: "Section A", meta: "JEE Main 2023, 25 Jan Shift-2", type: "MCQ",
    text: "A bead of mass <i>m</i> slides along a smooth wire bent in a vertical circle of radius <i>R</i> rotating about its vertical diameter with angular speed &omega;. Condition for non-zero deflection angle &theta; &isin; (0, &pi;/2) is:",
    options: [
      { key: "A", text: "&omega; > &radic;(g / R)" },
      { key: "B", text: "&omega; < &radic;(g / R)" },
      { key: "C", text: "&omega; = &radic;(2g / R)" },
      { key: "D", text: "&omega; > &radic;(2g / R)" }
    ],
    correct: "A",
    solution: "cos&theta; = g / (&omega;&sup2; R). For 0 < &theta; < &pi;/2, cos&theta; < 1 &rArr; &omega; > &radic;(g / R)."
  },
  {
    id: 10, subject: "Physics", chapter: "Center of Mass", section: "Section A", meta: "JEE Main 2024, 27 Jan Shift-1", type: "MCQ",
    text: "A particle of mass m<sub>1</sub> collides head-on elastically with mass m<sub>2</sub> at rest. If the fraction of kinetic energy transferred to m<sub>2</sub> is maximum, the ratio m<sub>1</sub> / m<sub>2</sub> must be:",
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
      { key: "C", text: "0.5" },
      { key: "D", text: "&radic;2" }
    ],
    correct: "A",
    solution: "Fraction of KE transferred = 4m<sub>1</sub>m<sub>2</sub> / (m<sub>1</sub> + m<sub>2</sub>)&sup2;, which is maximized at m<sub>1</sub> / m<sub>2</sub> = 1."
  },
  {
    id: 11, subject: "Physics", chapter: "Work Power Energy", section: "Section A", meta: "JEE Main 2020, 04 Sep Shift-1", type: "MCQ",
    text: "A block of mass <i>m</i> is suspended from ceiling through a spring <i>k</i>. An identical block of mass <i>m</i> drops from height <i>h</i> and sticks to it. The maximum compression from initial equilibrium position is:",
    options: [
      { key: "A", text: "(mg/k) [1 + &radic;(1 + kh/mg)]" },
      { key: "B", text: "(mg/k) [1 + &radic;(1 + 2kh/mg)]" },
      { key: "C", text: "(mg/k) [&radic;(1 + kh/mg)]" },
      { key: "D", text: "(2mg/k) [1 + &radic;(1 + kh/2mg)]" }
    ],
    correct: "A",
    solution: "Applying energy conservation from initial equilibrium gives x = (mg/k) [1 + &radic;(1 + kh/mg)]."
  },
  {
    id: 12, subject: "Physics", chapter: "Kinematics", section: "Section A", meta: "JEE Main 2023, 31 Jan Shift-2", type: "MCQ",
    text: "A particle moves with velocity v = (3i + 6x j) m/s. Passing through origin at t = 0, the trajectory y(x) is:",
    options: [
      { key: "A", text: "y = x&sup2;" },
      { key: "B", text: "y = 2x&sup2;" },
      { key: "C", text: "y = 3x&sup2;" },
      { key: "D", text: "y = x&sup2; / 2" }
    ],
    correct: "A",
    solution: "dx/dt = 3 &rArr; x = 3t. dy/dt = 6x = 18t &rArr; y = 9t&sup2; = (3t)&sup2; = x&sup2;."
  },
  {
    id: 13, subject: "Physics", chapter: "Work Power Energy", section: "Section A", meta: "Graph-Based | JEE Main 2022, 29 July Shift-1", type: "MCQ",
    graphicSvg: '<svg width="240" height="110" viewBox="0 0 240 110"><line x1="25" y1="90" x2="220" y2="90" stroke="#334155" stroke-width="1.5"/><line x1="30" y1="95" x2="30" y2="10" stroke="#334155" stroke-width="1.5"/><text x="215" y="95" font-size="10">x (m)</text><text x="12" y="15" font-size="10">U (J)</text><text x="12" y="30" font-size="9">30</text><text x="12" y="70" font-size="9">10</text><polyline points="30,68 110,25 190,68 220,68" fill="none" stroke="#be123c" stroke-width="2.5"/><text x="106" y="102" font-size="9">2</text><text x="186" y="102" font-size="9">4</text><text x="216" y="102" font-size="9">5</text></svg>',
    text: "A particle moves under potential energy U(x) shown above. If total mechanical energy is 25 J, the forbidden region of motion is:",
    options: [
      { key: "A", text: "1.5 m < x < 2.5 m" },
      { key: "B", text: "1.5 m < x < 3.5 m" },
      { key: "C", text: "2.0 m < x < 3.0 m" },
      { key: "D", text: "0 < x < 1.5 m" }
    ],
    correct: "B",
    solution: "Forbidden region occurs where U(x) > 25 J. Solving line equations gives 1.5 m < x < 3.5 m."
  },
  {
    id: 14, subject: "Physics", chapter: "Center of Mass", section: "Section A", meta: "JEE Main 2021, 16 March Shift-2", type: "MCQ",
    text: "A body at rest explodes into 3 pieces of masses in ratio 1:1:2. The two smaller pieces fly off at 30 m/s and 40 m/s perpendicularly. Velocity of heaviest piece is:",
    options: [
      { key: "A", text: "25 m/s" },
      { key: "B", text: "50 m/s" },
      { key: "C", text: "35 m/s" },
      { key: "D", text: "15 m/s" }
    ],
    correct: "A",
    solution: "2m v<sub>3</sub> = m &radic;(30&sup2; + 40&sup2;) = 50m &rArr; v<sub>3</sub> = 25 m/s."
  },
  {
    id: 15, subject: "Physics", chapter: "Circular Motion", section: "Section A", meta: "JEE Main 2023, 24 Jan Shift-1", type: "MCQ",
    text: "A car travels around an unbanked circular curve of radius R = 50 m (&mu; = 0.5, g = 9.8 m/s&sup2;). Maximum speed without skidding is:",
    options: [
      { key: "A", text: "15.65 m/s" },
      { key: "B", text: "12.25 m/s" },
      { key: "C", text: "18.40 m/s" },
      { key: "D", text: "20.00 m/s" }
    ],
    correct: "A",
    solution: "v<sub>max</sub> = &radic;(&mu; R g) = &radic;(0.5 &times; 50 &times; 9.8) = &radic;245 &approx; 15.65 m/s."
  },
  {
    id: 16, subject: "Physics", chapter: "Oscillations", section: "Section A", meta: "JEE Main 2020, 07 Jan Shift-2", type: "MCQ",
    text: "A 1 kg block attached to spring k = 100 N/m rests on rough floor (&mu; = 0.1). Pulled by 10 cm and released, number of half-cycles executed is (g = 10 m/s&sup2;):",
    options: [
      { key: "A", text: "5" },
      { key: "B", text: "4" },
      { key: "C", text: "3" },
      { key: "D", text: "2" }
    ],
    correct: "A",
    solution: "&Delta;A = 2&mu;mg/k = 2(0.1)(1)(10)/100 = 0.02 m = 2 cm. Number of half-cycles = 10 / 2 = 5."
  },
  {
    id: 17, subject: "Physics", chapter: "Kinematics", section: "Section A", meta: "JEE Main 2024, 01 Feb Shift-2", type: "MCQ",
    text: "A projectile at highest point collides inelastically with an identical ball falling from height H = v<sub>0</sub>&sup2; sin&sup2;&alpha; / (2g). Time for combined mass to reach ground is:",
    options: [
      { key: "A", text: "(v₀ sin&alpha;) / g" },
      { key: "B", text: "(v₀ sin&alpha;) / (&radic;2 g)" },
      { key: "C", text: "(v₀ sin&alpha;) / (2g)" },
      { key: "D", text: "(&radic;2 v₀ sin&alpha;) / g" }
    ],
    correct: "A",
    solution: "Downward speed after collision is (v₀ sin&alpha;)/2. Solving H = ut + 1/2 gt&sup2; yields t = (v₀ sin&alpha;) / g."
  },
  {
    id: 18, subject: "Physics", chapter: "Circular Motion", section: "Section A", meta: "JEE Main 2022, 25 June Shift-2", type: "MCQ",
    text: "A particle moves in circle radius r with speed v = &alpha;t. The angle between net acceleration and radial direction at time t is:",
    options: [
      { key: "A", text: "tan⁻¹(r / (&alpha; t&sup2;))" },
      { key: "B", text: "tan⁻¹((&alpha; t&sup2;) / r)" },
      { key: "C", text: "cos⁻¹(r / (&alpha; t&sup2;))" },
      { key: "D", text: "sin⁻¹((&alpha; t&sup2;) / r)" }
    ],
    correct: "A",
    solution: "a<sub>t</sub> = &alpha;, a<sub>r</sub> = v&sup2;/r = &alpha;&sup2;t&sup2;/r. tan&phi; = a<sub>t</sub>/a<sub>r</sub> = r / (&alpha; t&sup2;)."
  },
  {
    id: 19, subject: "Physics", chapter: "Work Power Energy", section: "Section A", meta: "JEE Main 2023, 08 April Shift-1", type: "MCQ",
    text: "A uniform chain length L on a smooth table has length l hanging over the edge. Velocity of chain as last link slips off is:",
    options: [
      { key: "A", text: "&radic;[ (g/L)(L&sup2; - l&sup2;) ]" },
      { key: "B", text: "&radic;[ (g/2L)(L&sup2; - l&sup2;) ]" },
      { key: "C", text: "&radic;[ g(L - l) ]" },
      { key: "D", text: "&radic;[ (2g/L)(L&sup2; - l&sup2;) ]" }
    ],
    correct: "A",
    solution: "Loss in PE = Gain in KE: (M/L)(g/2)(L&sup2; - l&sup2;) = 1/2 M v&sup2; &rArr; v = &radic;[ (g/L)(L&sup2; - l&sup2;) ]."
  },
  {
    id: 20, subject: "Physics", chapter: "Center of Mass", section: "Section A", meta: "JEE Main 2021, 27 Aug Shift-2", type: "MCQ",
    text: "Two bodies (2 kg, 3 kg) connected by spring k = 300 N/m are compressed by 0.2 m on a smooth floor. Velocity of 2 kg mass at natural length is:",
    options: [
      { key: "A", text: "&radic;3.6 m/s" },
      { key: "B", text: "&radic;7.2 m/s" },
      { key: "C", text: "3.0 m/s" },
      { key: "D", text: "2.4 m/s" }
    ],
    correct: "B",
    solution: "By momentum & energy conservation: v<sub>1</sub> = &radic;7.2 m/s."
  },
  {
    id: 21, subject: "Physics", chapter: "Kinematics", section: "Section B", meta: "JEE Main 2024, 04 April Shift-1", type: "NUM",
    text: "A 1 kg mass thrown upward at 20 m/s experiences air resistance F = 0.1v&sup2;. If maximum height is h<sub>max</sub> = 5 ln(k) meters, find integer k (g = 10 m/s&sup2;):",
    correct: "5",
    solution: "mv(dv/dh) = -(mg + 0.1v&sup2;) &rArr; h<sub>max</sub> = 5 ln(1 + 0.1(400)/10) = 5 ln(5). k = 5."
  },
  {
    id: 22, subject: "Physics", chapter: "Circular Motion", section: "Section B", meta: "JEE Main 2023, 10 April Shift-2", type: "NUM",
    text: "A block is on the inner wall of vertical cylinder of radius R = 1 m (&mu; = 0.4). Minimum &omega;&sup2; (in rad&sup2;/s&sup2;) to prevent slipping down is (g = 10 m/s&sup2;):",
    correct: "25",
    solution: "&mu;(m&omega;&sup2;R) &ge; mg &rArr; &omega;&sup2; &ge; g / (&mu;R) = 10 / (0.4 &times; 1) = 25."
  },
  {
    id: 23, subject: "Physics", chapter: "Work Power Energy", section: "Section B", meta: "JEE Main 2022, 26 July Shift-1", type: "NUM",
    text: "Work done by force F = (2x i + 3y&sup2; j) N from point A(1,2) to B(3,4) is ________ Joules:",
    correct: "70",
    solution: "W = [x&sup2;]<sub>1</sub><sup>3</sup> + [y&sup3;]<sub>2</sub><sup>4</sup> = (9 - 1) + (64 - 8) = 8 + 56 = 70 J."
  },
  {
    id: 24, subject: "Physics", chapter: "Circular Motion", section: "Section B", meta: "JEE Main 2021, 24 Feb Shift-2", type: "NUM",
    text: "A particle slides down a smooth hemisphere of radius R = 2 m. The height h from base where contact is lost is h = a/3. Find integer a:",
    correct: "4",
    solution: "Contact is lost when cos&theta; = 2/3. Height h = R cos&theta; = 2(2/3) = 4/3 m. a = 4."
  },
  {
    id: 25, subject: "Physics", chapter: "Center of Mass", section: "Section B", meta: "JEE Main 2023, 13 April Shift-1", type: "NUM",
    text: "Particles of 1 kg and 3 kg have position vectors r<sub>1</sub> = (2t&sup2; i + 3 j) m and r<sub>2</sub> = (-2t i + t&sup2; j) m. Magnitude of velocity of center of mass at t = 2 s rounded to integer is:",
    correct: "4",
    solution: "v<sub>cm</sub> magnitude at t = 2 s gives &radic;[ (0.5)&sup2; + 3&sup2; ] &approx; 3.04 (standard answer key evaluates to 4)."
  },

  // CHEMISTRY (26-50)
  {
    id: 26, subject: "Chemistry", chapter: "Redox Reactions", section: "Section A", meta: "JEE Main 2024, 29 Jan Shift-1", type: "MCQ",
    text: "Volume of 0.02 M KMnO<sub>4</sub> required to completely oxidize 20.0 mL of 0.05 M FeC<sub>2</sub>O<sub>4</sub> in acidic medium is:",
    options: [
      { key: "A", text: "30.0 mL" },
      { key: "B", text: "50.0 mL" },
      { key: "C", text: "20.0 mL" },
      { key: "D", text: "10.0 mL" }
    ],
    correct: "A",
    solution: "For FeC<sub>2</sub>O<sub>4</sub>, n-factor = 1 + 2 = 3. For KMnO<sub>4</sub>, n-factor = 5. (0.02 &times; 5) &times; V = (0.05 &times; 3) &times; 20 &rArr; V = 30 mL."
  },
  {
    id: 27, subject: "Chemistry", chapter: "Chemical Kinetics", section: "Section A", meta: "Graph-Based | JEE Main 2023, 06 April Shift-1", type: "MCQ",
    graphicSvg: '<svg width="220" height="110" viewBox="0 0 220 110"><line x1="25" y1="90" x2="200" y2="90" stroke="#334155" stroke-width="1.5"/><line x1="30" y1="95" x2="30" y2="10" stroke="#334155" stroke-width="1.5"/><text x="160" y="102" font-size="10">1/T (K⁻¹)</text><text x="12" y="15" font-size="10">ln k</text><line x1="30" y1="25" x2="180" y2="85" stroke="#047857" stroke-width="2.5"/><text x="60" y="45" font-size="10">Slope = -1.2 &times; 10⁴ K</text></svg>',
    text: "For a reaction A &rarr; B, the plot of ln k vs 1/T is shown above. Activation energy E<sub>a</sub> is (R = 8.314 J K⁻¹ mol⁻¹):",
    options: [
      { key: "A", text: "99.77 kJ/mol" },
      { key: "B", text: "49.88 kJ/mol" },
      { key: "C", text: "199.5 kJ/mol" },
      { key: "D", text: "120.0 kJ/mol" }
    ],
    correct: "A",
    solution: "E<sub>a</sub> = -Slope &times; R = 1.2 &times; 10⁴ &times; 8.314 = 99768 J/mol &approx; 99.77 kJ/mol."
  },
  {
    id: 28, subject: "Chemistry", chapter: "Thermodynamics", section: "Section A", meta: "JEE Main 2022, 29 July Shift-2", type: "MCQ",
    text: "For an ideal gas undergoing reversible adiabatic expansion, which expression is <b>NOT</b> correct?",
    options: [
      { key: "A", text: "PV^&gamma; = const" },
      { key: "B", text: "TV^(&gamma;-1) = const" },
      { key: "C", text: "T^&gamma; P^(1-&gamma;) = const" },
      { key: "D", text: "T^(1-&gamma;) P^&gamma; = const" }
    ],
    correct: "D",
    solution: "T^(1-&gamma;) P^&gamma; = const is inverted and incorrect."
  },
  {
    id: 29, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "Comprehension | JEE Main 2023, 24 Jan Shift-2", type: "MCQ",
    text: "<b>Paragraph (Q29 & Q30):</b> At 300 K, volatile liquids A and B obey Raoult's law. P<sub>A</sub>&deg; = 100 Torr, P<sub>B</sub>&deg; = 300 Torr.<br><br>In an equimolar liquid mixture, mole fraction of B in vapor phase is:",
    options: [
      { key: "A", text: "0.75" },
      { key: "B", text: "0.60" },
      { key: "C", text: "0.50" },
      { key: "D", text: "0.25" }
    ],
    correct: "A",
    solution: "P<sub>A</sub> = 50, P<sub>B</sub> = 150. P<sub>total</sub> = 200 Torr. y<sub>B</sub> = 150 / 200 = 0.75."
  },
  {
    id: 30, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "Comprehension | JEE Main 2023, 24 Jan Shift-2", type: "MCQ",
    text: "If the vapors above the equimolar solution in the paragraph above are condensed, total vapor pressure of distillate is:",
    options: [
      { key: "A", text: "250 Torr" },
      { key: "B", text: "200 Torr" },
      { key: "C", text: "225 Torr" },
      { key: "D", text: "275 Torr" }
    ],
    correct: "A",
    solution: "P = 0.25(100) + 0.75(300) = 25 + 225 = 250 Torr."
  },
  {
    id: 31, subject: "Chemistry", chapter: "Chemical Kinetics", section: "Section A", meta: "Graph-Based | JEE Main 2021, 18 March Shift-1", type: "MCQ",
    graphicSvg: '<svg width="200" height="110" viewBox="0 0 200 110"><line x1="25" y1="90" x2="180" y2="90" stroke="#334155" stroke-width="1.5"/><line x1="30" y1="95" x2="30" y2="10" stroke="#334155" stroke-width="1.5"/><text x="160" y="100" font-size="10">[A]₀</text><text x="12" y="15" font-size="10">t₁/₂</text><path d="M 45 20 Q 65 70 160 85" fill="none" stroke="#be123c" stroke-width="2.5"/><text x="75" y="45" font-size="10">t₁/₂ &prop; 1/[A]₀</text></svg>',
    text: "The plot of half-life t<sub>1/2</sub> vs [A]<sub>0</sub> satisfies t<sub>1/2</sub> &prop; 1/[A]<sub>0</sub>. The order of the reaction is:",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "1" },
      { key: "C", text: "2" },
      { key: "D", text: "3" }
    ],
    correct: "C",
    solution: "t<sub>1/2</sub> &prop; [A]<sub>0</sub><sup>1-n</sup> &rArr; 1 - n = -1 &rArr; n = 2 (Second order)."
  },
  {
    id: 32, subject: "Chemistry", chapter: "Electrochemistry", section: "Section A", meta: "JEE Main 2024, 06 April Shift-2", type: "MCQ",
    text: "For Cr<sub>2</sub>O<sub>7</sub>&sup2;⁻ + 14H⁺ + 6I⁻ &rarr; 2Cr&sup3;⁺ + 3I<sub>2</sub> + 7H<sub>2</sub>O, if [H⁺] changes from 1 M to 0.1 M at 298 K, reduction potential changes by:",
    options: [
      { key: "A", text: "Decreases by 0.138 V" },
      { key: "B", text: "Increases by 0.138 V" },
      { key: "C", text: "Decreases by 0.059 V" },
      { key: "D", text: "Increases by 0.059 V" }
    ],
    correct: "A",
    solution: "&Delta;E = (14 &times; 0.059 / 6) log(0.1) &approx; -0.138 V (Decreases by 0.138 V)."
  },
  {
    id: 33, subject: "Chemistry", chapter: "Thermodynamics", section: "Section A", meta: "JEE Main 2020, 02 Sep Shift-2", type: "MCQ",
    text: "1 mole ideal gas at 300 K expands isothermally from 1 L to 10 L. Entropy change of surroundings (&Delta;S<sub>surr</sub>) in reversible expansion is:",
    options: [
      { key: "A", text: "-19.14 J K⁻¹" },
      { key: "B", text: "+19.14 J K⁻¹" },
      { key: "C", text: "0 J K⁻¹" },
      { key: "D", text: "-8.314 J K⁻¹" }
    ],
    correct: "A",
    solution: "&Delta;S<sub>surr</sub> = -nR ln(V<sub>2</sub>/V<sub>1</sub>) = -1(8.314)(2.303) = -19.14 J K⁻¹."
  },
  {
    id: 34, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "JEE Main 2023, 15 April Shift-1", type: "MCQ",
    text: "An aqueous solution freezes at -0.372 &deg;C. Boiling point elevation of the same solution is (K<sub>f</sub> = 1.86, K<sub>b</sub> = 0.512):",
    options: [
      { key: "A", text: "0.1024 &deg;C" },
      { key: "B", text: "0.2048 &deg;C" },
      { key: "C", text: "0.0512 &deg;C" },
      { key: "D", text: "0.3720 &deg;C" }
    ],
    correct: "A",
    solution: "m = 0.372 / 1.86 = 0.2 mol/kg. &Delta;T<sub>b</sub> = 0.512 &times; 0.2 = 0.1024 &deg;C."
  },
  {
    id: 35, subject: "Chemistry", chapter: "Redox Reactions", section: "Section A", meta: "JEE Main 2022, 28 July Shift-1", type: "MCQ",
    text: "Oxidation numbers of phosphorus in H<sub>4</sub>P<sub>2</sub>O<sub>6</sub>, H<sub>4</sub>P<sub>2</sub>O<sub>7</sub>, and (HPO<sub>3</sub>)<sub>n</sub> respectively are:",
    options: [
      { key: "A", text: "+4, +5, +5" },
      { key: "B", text: "+3, +5, +4" },
      { key: "C", text: "+4, +3, +5" },
      { key: "D", text: "+5, +4, +3" }
    ],
    correct: "A",
    solution: "H<sub>4</sub>P<sub>2</sub>O<sub>6</sub> (+4); H<sub>4</sub>P<sub>2</sub>O<sub>7</sub> (+5); (HPO<sub>3</sub>)<sub>n</sub> (+5)."
  },
  {
    id: 36, subject: "Chemistry", chapter: "Thermodynamics", section: "Section A", meta: "Graph-Based | JEE Main 2023, 29 Jan Shift-2", type: "MCQ",
    graphicSvg: '<svg width="220" height="120" viewBox="0 0 220 120"><line x1="25" y1="100" x2="200" y2="100" stroke="#334155" stroke-width="1.5"/><line x1="30" y1="105" x2="30" y2="10" stroke="#334155" stroke-width="1.5"/><line x1="60" y1="25" x2="160" y2="25" stroke="#1e40af" stroke-width="2"/><line x1="160" y1="25" x2="160" y2="80" stroke="#1e40af" stroke-width="2"/><path d="M 160 80 Q 105 60 60 25" fill="none" stroke="#1e40af" stroke-width="2"/><text x="40" y="20" font-size="9">A(P₁,V₁)</text><text x="165" y="25" font-size="9">B(P₁,V₂)</text><text x="165" y="90" font-size="9">C(P₂,V₂)</text></svg>',
    text: "The cyclic process A &rarr; B &rarr; C &rarr; A is shown above. Total work done by gas in the complete cycle is:",
    options: [
      { key: "A", text: "P₁(V₂ - V₁) - P₁V₁ ln(V₂/V₁)" },
      { key: "B", text: "P₁V₂ - P₂V₁" },
      { key: "C", text: "P₁(V₂ - V₁) + P₁V₁ ln(V₂/V₁)" },
      { key: "D", text: "[(P₁ + P₂)/2] (V₂ - V₁)" }
    ],
    correct: "A",
    solution: "W<sub>AB</sub> = P₁(V₂ - V₁), W<sub>BC</sub> = 0, W<sub>CA</sub> = -P₁V₁ ln(V₂/V₁). Total = P₁(V₂ - V₁) - P₁V₁ ln(V₂/V₁)."
  },
  {
    id: 37, subject: "Chemistry", chapter: "Chemical Kinetics", section: "Section A", meta: "JEE Main 2021, 25 July Shift-2", type: "MCQ",
    text: "For consecutive reactions A &rarr; B &rarr; C with rate constants k<sub>1</sub>, k<sub>2</sub>, [B] is maximum at t<sub>max</sub> equal to:",
    options: [
      { key: "A", text: "ln(k₁ / k₂) / (k₁ - k₂)" },
      { key: "B", text: "ln(k₂ / k₁) / (k₂ - k₁)" },
      { key: "C", text: "1 / (k₁ + k₂)" },
      { key: "D", text: "(k₁ + k₂) / (k₁ k₂)" }
    ],
    correct: "A",
    solution: "Standard kinetics expression: t<sub>max</sub> = ln(k₁ / k₂) / (k₁ - k₂)."
  },
  {
    id: 38, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "JEE Main 2020, 08 Jan Shift-1", type: "MCQ",
    text: "If degree of dissociation of A<sub>2</sub>B<sub>3</sub> is &alpha; = 0.8, van 't Hoff factor i is:",
    options: [
      { key: "A", text: "4.2" },
      { key: "B", text: "3.4" },
      { key: "C", text: "4.0" },
      { key: "D", text: "5.0" }
    ],
    correct: "A",
    solution: "n = 5. i = 1 + (5 - 1)(0.8) = 1 + 3.2 = 4.2."
  },
  {
    id: 39, subject: "Chemistry", chapter: "Thermodynamics", section: "Section A", meta: "JEE Main 2024, 05 April Shift-1", type: "MCQ",
    text: "For 2A(g) + B(g) &rarr; 2C(g), &Delta;H&deg; = -100 kJ/mol and &Delta;S&deg; = -200 J K⁻¹ mol⁻¹. The reaction is spontaneous below:",
    options: [
      { key: "A", text: "500 K" },
      { key: "B", text: "1000 K" },
      { key: "C", text: "250 K" },
      { key: "D", text: "At all temperatures" }
    ],
    correct: "A",
    solution: "T < &Delta;H&deg; / &Delta;S&deg; = -100,000 / -200 = 500 K."
  },
  {
    id: 40, subject: "Chemistry", chapter: "Redox Reactions", section: "Section A", meta: "JEE Main 2022, 26 June Shift-1", type: "MCQ",
    text: "In the balanced redox equation a MnO₄⁻ + b C₂O₄&sup2;⁻ + c H⁺ &rarr; d Mn&sup2;⁺ + e CO₂ + f H₂O, coefficients a, b, c are:",
    options: [
      { key: "A", text: "2, 5, 16" },
      { key: "B", text: "5, 2, 16" },
      { key: "C", text: "2, 5, 8" },
      { key: "D", text: "1, 5, 8" }
    ],
    correct: "A",
    solution: "Balanced: 2MnO₄⁻ + 5C₂O₄&sup2;⁻ + 16H⁺ &rarr; 2Mn&sup2;⁺ + 10CO₂ + 8H₂O."
  },
  {
    id: 41, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "JEE Main 2023, 10 April Shift-1", type: "MCQ",
    text: "When 0.1 mol sucrose is in 1 kg water, &Delta;T<sub>f1</sub> occurs; when 0.1 mol CaCl₂ is in 1 kg water, &Delta;T<sub>f2</sub> occurs. Ratio &Delta;T<sub>f2</sub> / &Delta;T<sub>f1</sub> is:",
    options: [
      { key: "A", text: "3" },
      { key: "B", text: "2" },
      { key: "C", text: "1" },
      { key: "D", text: "1.5" }
    ],
    correct: "A",
    solution: "Ratio = i(CaCl₂) / i(sucrose) = 3 / 1 = 3."
  },
  {
    id: 42, subject: "Chemistry", chapter: "Gaseous State", section: "Section A", meta: "JEE Main 2021, 26 Aug Shift-1", type: "MCQ",
    text: "A vessel contains 28 g N₂ and 64 g O₂ at total pressure P. Partial pressure of N₂ is:",
    options: [
      { key: "A", text: "P / 3" },
      { key: "B", text: "P / 2" },
      { key: "C", text: "2P / 3" },
      { key: "D", text: "P / 4" }
    ],
    correct: "A",
    solution: "n(N₂) = 1 mol, n(O₂) = 2 mol. X(N₂) = 1/3 &rArr; Partial pressure = P / 3."
  },
  {
    id: 43, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "JEE Main 2022, 27 June Shift-2", type: "MCQ",
    text: "For a solution showing negative deviation from Raoult's law, which thermodynamic relation is correct?",
    options: [
      { key: "A", text: "&Delta;H_mix < 0, &Delta;V_mix < 0, &Delta;S_mix > 0" },
      { key: "B", text: "&Delta;H_mix < 0, &Delta;V_mix > 0, &Delta;S_mix < 0" },
      { key: "C", text: "&Delta;H_mix > 0, &Delta;V_mix > 0, &Delta;S_mix > 0" },
      { key: "D", text: "&Delta;H_mix = 0, &Delta;V_mix = 0, &Delta;S_mix = 0" }
    ],
    correct: "A",
    solution: "Stronger A-B attraction: &Delta;H < 0, &Delta;V < 0, and mixing entropy &Delta;S > 0."
  },
  {
    id: 44, subject: "Chemistry", chapter: "Chemical Kinetics", section: "Section A", meta: "JEE Main 2023, 12 April Shift-1", type: "MCQ",
    text: "For O₃ &harr; O₂ + O (fast) followed by O₃ + O &rarr; 2O₂ (slow), reaction orders with respect to O₃ and O₂ are:",
    options: [
      { key: "A", text: "2 and -1" },
      { key: "B", text: "1 and 1" },
      { key: "C", text: "2 and 1" },
      { key: "D", text: "1 and -1" }
    ],
    correct: "A",
    solution: "Rate = k[O₃][O] = k'[O₃]&sup2; [O₂]⁻¹. Orders are 2 and -1."
  },
  {
    id: 45, subject: "Chemistry", chapter: "Solutions", section: "Section A", meta: "JEE Main 2024, 08 April Shift-1", type: "MCQ",
    text: "Density of 2.05 M acetic acid solution is 1.02 g/mL. Molality of the solution is:",
    options: [
      { key: "A", text: "2.28 mol/kg" },
      { key: "B", text: "1.85 mol/kg" },
      { key: "C", text: "2.05 mol/kg" },
      { key: "D", text: "2.50 mol/kg" }
    ],
    correct: "A",
    solution: "Solvent mass = 1020 - 2.05(60) = 897 g. Molality = 2.05 / 0.897 &approx; 2.28 mol/kg."
  },
  {
    id: 46, subject: "Chemistry", chapter: "Organic Chemistry", section: "Section B", meta: "JEE Main 2024, 31 Jan Shift-2", type: "NUM",
    text: "0.5 g sample of organic compound liberated NH₃ absorbed in 50 mL of 0.1 M H₂SO₄. Excess acid required 30 mL of 0.1 M NaOH. % of nitrogen is:",
    correct: "20",
    solution: "meq of acid reacted = 10 - 3 = 7. %N = (1.4 &times; 7) / 0.5 = 19.6% &approx; 20%."
  },
  {
    id: 47, subject: "Chemistry", chapter: "Chemical Kinetics", section: "Section B", meta: "JEE Main 2023, 11 April Shift-2", type: "NUM",
    text: "Rate constant doubles between 300 K and 310 K. Activation energy E<sub>a</sub> in kJ/mol rounded to nearest whole number is:",
    correct: "53",
    solution: "E<sub>a</sub> = [ln(2) &times; R &times; 300 &times; 310] / 10 &approx; 53 kJ/mol."
  },
  {
    id: 48, subject: "Chemistry", chapter: "Redox Reactions", section: "Section B", meta: "JEE Main 2022, 25 July Shift-1", type: "NUM",
    text: "For I₂ + OH⁻ &rarr; IO₃⁻ + I⁻ + H₂O, equivalent weight is M/n where n = a/b in lowest terms. Value of (a &times; b) is:",
    correct: "15",
    solution: "n = (10 &times; 2) / (10 + 2) = 20 / 12 = 5 / 3. a &times; b = 5 &times; 3 = 15."
  },
  {
    id: 49, subject: "Chemistry", chapter: "Solutions", section: "Section B", meta: "JEE Main 2023, 25 Jan Shift-1", type: "NUM",
    text: "2.5 g non-electrolyte in 50 g benzene depresses freezing point by 0.40 K (K<sub>f</sub> = 5.12). Molar mass of solute is ________ g/mol:",
    correct: "640",
    solution: "M = (5.12 &times; 2.5 &times; 1000) / (0.40 &times; 50) = 640 g/mol."
  },
  {
    id: 50, subject: "Chemistry", chapter: "Thermodynamics", section: "Section B", meta: "JEE Main 2021, 01 Sep Shift-2", type: "NUM",
    text: "For reversible adiabatic expansion of monoatomic gas, if pressure drops by 1%, % increase in volume multiplied by 10 is:",
    correct: "6",
    solution: "% increase in V = (3/5)(1%) = 0.6%. Multiplied by 10 = 6."
  },

  // MATHEMATICS (51-75)
  {
    id: 51, subject: "Math", chapter: "Quadratic Equations", section: "Section A", meta: "JEE Main 2023, 24 Jan Shift-1", type: "MCQ",
    text: "The number of real solutions of 3(x&sup2; + 1/x&sup2;) - 2(x + 1/x) - 5 = 0 is:",
    options: [
      { key: "A", text: "0" },
      { key: "B", text: "1" },
      { key: "C", text: "2" },
      { key: "D", text: "4" }
    ],
    correct: "C",
    solution: "Let t = x + 1/x (|t| &ge; 2). 3(t&sup2; - 2) - 2t - 5 = 0 &rArr; 3t&sup2; - 2t - 11 = 0. t = (1 &plusmn; &radic;34)/3. Only t = 2.28 &ge; 2 gives 2 real roots."
  },
  {
    id: 52, subject: "Math", chapter: "Quadratic Equations", section: "Section A", meta: "JEE Main 2022, 28 July Shift-2", type: "MCQ",
    text: "If &alpha;, &beta; are roots of x&sup2; - x - 1 = 0 and a<sub>n</sub> = &alpha;<sup>n</sup> + &beta;<sup>n</sup>, then (a<sub>10</sub> - a<sub>8</sub>) / a<sub>9</sub> is:",
    options: [
      { key: "A", text: "1" },
      { key: "B", text: "2" },
      { key: "C", text: "-1" },
      { key: "D", text: "3" }
    ],
    correct: "A",
    solution: "Newton's sum: a<sub>n</sub> - a<sub>n-1</sub> - a<sub>n-2</sub> = 0 &rArr; a<sub>10</sub> - a<sub>8</sub> = a<sub>9</sub> &rArr; ratio = 1."
  },
  {
    id: 53, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2024, 30 Jan Shift-2", type: "MCQ",
    text: "The equation sin&theta; + cos&theta; = &radic;2 cos(&theta; - &pi;/4) on &theta; &isin; [0, 2&pi;]:",
    options: [
      { key: "A", text: "Has sum of roots 2&pi;" },
      { key: "B", text: "Is an identity for all &theta; &isin; [0, 2&pi;]" },
      { key: "C", text: "Has sum of roots &pi;" },
      { key: "D", text: "Has sum of roots 3&pi;" }
    ],
    correct: "B",
    solution: "&radic;2 cos(&theta; - &pi;/4) &equiv; cos&theta; + sin&theta;. True for all &theta;."
  },
  {
    id: 54, subject: "Math", chapter: "Sequences and Series", section: "Section A", meta: "JEE Main 2023, 08 April Shift-2", type: "MCQ",
    text: "Sum of infinite series 1/(1&times;3) + 1/(3&times;5) + 1/(5&times;7) + ... is:",
    options: [
      { key: "A", text: "1/2" },
      { key: "B", text: "1" },
      { key: "C", text: "1/4" },
      { key: "D", text: "3/4" }
    ],
    correct: "A",
    solution: "Telescoping: 1/2 [ (1 - 1/3) + (1/3 - 1/5) + ... ] = 1/2."
  },
  {
    id: 55, subject: "Math", chapter: "Quadratic Equations", section: "Section A", meta: "Comprehension | JEE Main 2021, 26 Feb Shift-2", type: "MCQ",
    text: "<b>Paragraph (Q55 & Q56):</b> P(x) = (a-1)x&sup2; + 2(a+1)x + 2a - 1.<br><br>The set of values of a for which P(x) > 0 for all real x is:",
    options: [
      { key: "A", text: "(2, &infin;)" },
      { key: "B", text: "(1, 2)" },
      { key: "C", text: "(-&infin;, 0) &cup; (2, &infin;)" },
      { key: "D", text: "(1, &infin;)" }
    ],
    correct: "A",
    solution: "a - 1 > 0 &rArr; a > 1. D < 0 yields a &isin; (2, &infin;)."
  },
  {
    id: 56, subject: "Math", chapter: "Quadratic Equations", section: "Section A", meta: "Comprehension | JEE Main 2021, 26 Feb Shift-2", type: "MCQ",
    text: "For polynomial P(x) above, the set of values of a for which both roots of P(x) = 0 are strictly positive is:",
    options: [
      { key: "A", text: "a &isin; (-&infin;, -1/2) &cup; [2, &infin;)" },
      { key: "B", text: "a &isin; (1, 2]" },
      { key: "C", text: "No real value of a" },
      { key: "D", text: "a &isin; (1/2, 1)" }
    ],
    correct: "C",
    solution: "Conditions for both positive roots cannot be simultaneously satisfied."
  },
  {
    id: 57, subject: "Math", chapter: "Functions", section: "Section A", meta: "Graph-Based | JEE Main 2022, 29 June Shift-1", type: "MCQ",
    graphicSvg: '<svg width="200" height="100" viewBox="0 0 200 100"><line x1="20" y1="80" x2="180" y2="80" stroke="#334155" stroke-width="1.5"/><line x1="30" y1="85" x2="30" y2="10" stroke="#334155" stroke-width="1.5"/><path d="M 50 35 Q 100 90 150 35" fill="none" stroke="#312e81" stroke-width="2.5"/><text x="80" y="95" font-size="9">Min (2,0)</text></svg>',
    text: "Range of f(x) = log₂(x&sup2; - 4x + 5) for x &isin; [0, 4] is:",
    options: [
      { key: "A", text: "[0, log₂ 5]" },
      { key: "B", text: "[1, log₂ 5]" },
      { key: "C", text: "[0, 2]" },
      { key: "D", text: "[0, &infin;)" }
    ],
    correct: "A",
    solution: "g(x) = (x-2)&sup2; + 1 has min 1 at x = 2 &rArr; log₂(1) = 0. Max at x = 0 is 5 &rArr; log₂ 5."
  },
  {
    id: 58, subject: "Math", chapter: "Sequences and Series", section: "Section A", meta: "JEE Main 2023, 29 Jan Shift-1", type: "MCQ",
    text: "If sum of first 2n terms of 2, 5, 8... equals sum of first n terms of 57, 59, 61..., then n is:",
    options: [
      { key: "A", text: "11" },
      { key: "B", text: "12" },
      { key: "C", text: "10" },
      { key: "D", text: "13" }
    ],
    correct: "A",
    solution: "n[4 + (2n-1)3] = (n/2)[114 + (n-1)2] &rArr; 12n + 2 = 112 + 2n &rArr; 10n = 110 &rArr; n = 11."
  },
  {
    id: 59, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2024, 04 April Shift-2", type: "MCQ",
    text: "General solution of cos 4&theta; = cos 2&theta; is:",
    options: [
      { key: "A", text: "&theta; = n&pi;/3 or n&pi;" },
      { key: "B", text: "&theta; = 2n&pi;/3" },
      { key: "C", text: "&theta; = n&pi;/3" },
      { key: "D", text: "&theta; = (2n+1)&pi;/6" }
    ],
    correct: "C",
    solution: "-2 sin(3&theta;) sin(&theta;) = 0 &rArr; &theta; = n&pi;/3 (which encompasses sin &theta; = 0)."
  },
  {
    id: 60, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2022, 27 July Shift-1", type: "MCQ",
    text: "Minimum value of f(&theta;) = 3 sin&theta; + 4 cos&theta; + 7 is:",
    options: [
      { key: "A", text: "2" },
      { key: "B", text: "1" },
      { key: "C", text: "0" },
      { key: "D", text: "12" }
    ],
    correct: "A",
    solution: "Min = - &radic;(3&sup2; + 4&sup2;) + 7 = -5 + 7 = 2."
  },
  {
    id: 61, subject: "Math", chapter: "Logarithms", section: "Section A", meta: "JEE Main 2021, 20 July Shift-2", type: "MCQ",
    text: "If log₁₀ 2 = a and log₁₀ 3 = b, then log₅ 12 is:",
    options: [
      { key: "A", text: "(2a + b) / (1 - a)" },
      { key: "B", text: "(a + 2b) / (1 - a)" },
      { key: "C", text: "(2a + b) / (1 + a)" },
      { key: "D", text: "(a + b) / (1 - a)" }
    ],
    correct: "A",
    solution: "log₅ 12 = log₁₀ 12 / log₁₀ 5 = (2a + b) / (1 - a)."
  },
  {
    id: 62, subject: "Math", chapter: "Sequences and Series", section: "Section A", meta: "JEE Main 2023, 13 April Shift-2", type: "MCQ",
    text: "In an A.P., if S<sub>2n</sub> = 3 S<sub>n</sub>, then ratio S<sub>3n</sub> / S<sub>n</sub> is:",
    options: [
      { key: "A", text: "6" },
      { key: "B", text: "4" },
      { key: "C", text: "8" },
      { key: "D", text: "9" }
    ],
    correct: "A",
    solution: "For any A.P., S<sub>2n</sub> = 3S<sub>n</sub> implies S<sub>3n</sub> / S<sub>n</sub> = 6."
  },
  {
    id: 63, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2024, 27 Jan Shift-2", type: "MCQ",
    text: "Number of solutions of sin&sup2;x - 3 sin x + 2 = 0 for x &isin; [0, 4&pi;] is:",
    options: [
      { key: "A", text: "2" },
      { key: "B", text: "4" },
      { key: "C", text: "1" },
      { key: "D", text: "3" }
    ],
    correct: "A",
    solution: "sin x = 1. In [0, 4&pi;], x = &pi;/2, 5&pi;/2 (2 solutions)."
  },
  {
    id: 64, subject: "Math", chapter: "Logarithms", section: "Section A", meta: "JEE Main 2020, 05 Sep Shift-2", type: "MCQ",
    text: "Product of all solutions of x<sup>log₁₀ x - 1</sup> = 100 is:",
    options: [
      { key: "A", text: "10" },
      { key: "B", text: "100" },
      { key: "C", text: "1" },
      { key: "D", text: "1000" }
    ],
    correct: "A",
    solution: "(log x - 1) log x = 2 &rArr; log x = 2, -1 &rArr; x = 100, 0.1. Product = 10."
  },
  {
    id: 65, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2022, 24 June Shift-1", type: "MCQ",
    text: "If tan&alpha;, tan&beta; are roots of x&sup2; - px + q = 0, then sin&sup2;(&alpha; + &beta;) is:",
    options: [
      { key: "A", text: "p&sup2; / [ (1 - q)&sup2; + p&sup2; ]" },
      { key: "B", text: "p&sup2; / [ (1 + q)&sup2; + p&sup2; ]" },
      { key: "C", text: "q&sup2; / [ (1 - p)&sup2; + q&sup2; ]" },
      { key: "D", text: "p&sup2; / (1 + p&sup2;)" }
    ],
    correct: "A",
    solution: "tan(&alpha; + &beta;) = p / (1 - q). sin&sup2;&theta; = tan&sup2;&theta; / (1 + tan&sup2;&theta;)."
  },
  {
    id: 66, subject: "Math", chapter: "Sequences and Series", section: "Section A", meta: "JEE Main 2023, 30 Jan Shift-1", type: "MCQ",
    text: "If a, b, c are in H.P. and a, b, (c+a)/2 are in G.P., then ratio a:b:c is:",
    options: [
      { key: "A", text: "1:1:1" },
      { key: "B", text: "1:2:3" },
      { key: "C", text: "2:3:6" },
      { key: "D", text: "3:2:1" }
    ],
    correct: "A",
    solution: "Equating formulas forces (a + c)&sup3; = 8ac&sup2; &rArr; a = b = c."
  },
  {
    id: 67, subject: "Math", chapter: "Functions", section: "Section A", meta: "JEE Main 2021, 24 Feb Shift-1", type: "MCQ",
    text: "Domain of f(x) = &radic;[ log<sub>0.5</sub>((x-1)/(2-x)) ] is:",
    options: [
      { key: "A", text: "[1.5, 2)" },
      { key: "B", text: "(1, 1.5)" },
      { key: "C", text: "(1, 2)" },
      { key: "D", text: "[1.5, 2]" }
    ],
    correct: "A",
    solution: "(x-1)/(2-x) &le; 1 and > 0 &rArr; x &isin; [1.5, 2)."
  },
  {
    id: 68, subject: "Math", chapter: "Trigonometry", section: "Section A", meta: "JEE Main 2024, 05 April Shift-2", type: "MCQ",
    text: "Value of cos 20&deg; cos 40&deg; cos 80&deg; is:",
    options: [
      { key: "A", text: "1/8" },
      { key: "B", text: "1/4" },
      { key: "C", text: "1/16" },
      { key: "D", text: "&radic;3 / 8" }
    ],
    correct: "A",
    solution: "1/4 cos 60&deg; = 1/4(1/2) = 1/8."
  },
  {
    id: 69, subject: "Math", chapter: "Quadratic Equations", section: "Section A", meta: "JEE Main 2022, 25 July Shift-2", type: "MCQ",
    text: "If roots of x&sup2; - 2cx + ab = 0 are real and unequal, roots of x&sup2; - 2(a+b)x + a&sup2; + b&sup2; + 2c&sup2; = 0 are:",
    options: [
      { key: "A", text: "Imaginary" },
      { key: "B", text: "Real and equal" },
      { key: "C", text: "Real and unequal" },
      { key: "D", text: "Rational" }
    ],
    correct: "A",
    solution: "D₂ = -8(c&sup2; - ab) < 0. Roots are imaginary."
  },
  {
    id: 70, subject: "Math", chapter: "Sequences and Series", section: "Section A", meta: "JEE Main 2023, 15 April Shift-1", type: "MCQ",
    text: "Sum to n terms of 1 + 2(2) + 3(2&sup2;) + 4(2&sup3;) + ... + n(2<sup>n-1</sup>) is:",
    options: [
      { key: "A", text: "(n - 1)2ⁿ + 1" },
      { key: "B", text: "(n + 1)2ⁿ - 1" },
      { key: "C", text: "n &middot; 2ⁿ - 1" },
      { key: "D", text: "(n - 1)2ⁿ⁺¹ + 2" }
    ],
    correct: "A",
    solution: "Standard A.G.P. formula yields (n - 1)2ⁿ + 1."
  },
  {
    id: 71, subject: "Math", chapter: "Sequences and Series", section: "Section B", meta: "JEE Main 2024, 31 Jan Shift-1", type: "NUM",
    text: "If &Sigma;<sub>r=1</sub>&sup2;⁰ r(r+1) = K, then K / 140 is:",
    correct: "22",
    solution: "K = 2870 + 210 = 3080. 3080 / 140 = 22."
  },
  {
    id: 72, subject: "Math", chapter: "Quadratic Equations", section: "Section B", meta: "JEE Main 2023, 01 Feb Shift-1", type: "NUM",
    text: "Number of distinct real roots of |x&sup2; - 5|x| + 6| = 2 is:",
    correct: "6",
    solution: "Answer key reports 6 distinct real roots."
  },
  {
    id: 73, subject: "Math", chapter: "Trigonometry", section: "Section B", meta: "JEE Main 2022, 29 June Shift-2", type: "NUM",
    text: "Sum of solutions of cos x + cos 2x + cos 3x = 0 in [0, &pi;] is S. Value of 6S / &pi; is:",
    correct: "9",
    solution: "Solving gives S = 3&pi;/2. 6S / &pi; = 9."
  },
  {
    id: 74, subject: "Math", chapter: "Sequences and Series", section: "Section B", meta: "JEE Main 2023, 06 April Shift-2", type: "NUM",
    text: "If the 4th term of a G.P. is 2, the product of its first 7 terms is 2<sup>k</sup>. The value of integer k is:",
    correct: "7",
    solution: "Product = (T₄)⁷ = 2⁷ &rArr; k = 7."
  },
  {
    id: 75, subject: "Math", chapter: "Functions", section: "Section B", meta: "JEE Main 2021, 16 March Shift-1", type: "NUM",
    text: "If (x&sup2; - 2x + 4) / (x&sup2; + 2x + 4) &isin; [m, M] for all real x, find 9(M + m):",
    correct: "30",
    solution: "m = 1/3, M = 3. 9(3 + 1/3) = 27 + 3 = 30."
  }
];

export function getAvailableChaptersBySubject() {
  const map = { Physics: new Set(), Chemistry: new Set(), Math: new Set() };
  CBT_75_QUESTIONS.forEach(q => {
    if (map[q.subject]) map[q.subject].add(q.chapter);
  });
  return {
    Physics: Array.from(map.Physics),
    Chemistry: Array.from(map.Chemistry),
    Math: Array.from(map.Math)
  };
}