// Robust formatter supporting standard LaTeX syntax, powers, subscripts, and Greek symbols
export function formatMathSymbols(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip inline/display math delimiters
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    // Fractions: \frac{a}{b} -> (a/b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')     // Square roots: \sqrt{x} or sqrt(x) -> √(x)     .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    // Powers & Superscripts
    .replace(/\\?\^2|\^\{2\}/g, '²')
    .replace(/\\?\^3|\^\{3\}/g, '³')
    .replace(/\\?\^4|\^\{4\}/g, '⁴')
    .replace(/\\?\^\{-1\}|\^-1/g, '⁻¹')
    .replace(/\\?\^\{-2\}|\^-2/g, '⁻²')
    .replace(/\\?\^\{([^}]+)\}/g, '^($1)')
    // Subscripts: _0 -> ₀, _1 -> ₁, _2 -> ₂, _max -> ₘₐₓ
    .replace(/_0|_\{0\}/g, '₀')
    .replace(/_1|_\{1\}/g, '₁')
    .replace(/_2|_\{2\}/g, '₂')
    .replace(/_3|_\{3\}/g, '₃')
    .replace(/_4|_\{4\}/g, '₄')
    .replace(/_\{max\}|_max|\\max/g, 'ₘₐₓ')
    .replace(/_\{min\}|_min|\\min/g, 'ₘᵢₙ')
    .replace(/_\{s\}|_s/g, 'ₛ')
    .replace(/_\{([a-zA-Z0-9]+)\}/g, '_$1')
    // Greek letters
    .replace(/\\nu\b|\bnu\b/g, 'ν')
    .replace(/\\theta\b|\btheta\b/g, 'θ')
    .replace(/\\lambda\b|\blambda\b/g, 'λ')
    .replace(/\\beta\b|\bbeta\b/g, 'β')
    .replace(/\\alpha\b|\balpha\b/g, 'α')
    .replace(/\\pi\b|\bpi\b/g, 'π')
    .replace(/\\omega\b|\bomega\b/g, 'ω')
    .replace(/\\phi\b|\bphi\b/g, 'ϕ')
    .replace(/\\mu\b|\bmu\b/g, 'μ')
    // Math operators & symbols
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\ge|\\geq/g, '≥')
    .replace(/\\le|\\leq/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\to|\\rightarrow/g, '→')
    .replace(/\\infty/g, '∞')
    // Clean LaTeX commands
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')     .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\/g, '');
}

/* =================================================================================
 *  TEMPLATE FOR ADDING QUESTIONS:
 *
 *  {
 *    yearTag: 'JEE Main 2024',
 *    chapter: 'Kinematics',
 *    question: 'The displacement of a body is given by...',
 *    options: ['Option A', 'Option B', 'Option C', 'Option D'],
 *    correctAnswer: 0, // 0 for Option A, 1 for B, 2 for C, 3 for D
 *    explanation: 'Step-by-step solution here.'
 *  },
 * ================================================================================= */

/* =================================================================================
 *  SECTION 1: PHYSICS QUESTIONS
 * ================================================================================= */
export const PHYSICS_QUESTIONS = [
  /* ===== [PASTE NEW PHYSICS QUESTIONS BELOW THIS LINE] ===== */
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Kinematics',
    question: 'A particle moves along the x-axis with velocity v = k*sqrt(x), where k is a positive constant. The displacement varies with time as:',
    options: ['x ∝ t', 'x ∝ t²', 'x ∝ t^(1/2)', 'x ∝ t³'],
    correctAnswer: 1,
    explanation: 'v = dx/dt = k*x^(1/2) => x^(-1/2) dx = k dt. Integrating both sides gives 2*sqrt(x) = k*t => x = (k²/4)*t² => x ∝ t².'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Laws of Motion',
    question: 'A block of mass 10 kg is placed on a rough horizontal surface with coefficient of friction μ = 0.5. If a horizontal force of 40 N is applied, the frictional force acting on the block is (take g = 10 m/s²):',
    options: ['50 N', '40 N', '20 N', 'Zero'],
    correctAnswer: 1,
    explanation: 'Limiting friction f_lim = μ*N = 0.5 * 10 * 10 = 50 N. Since the applied force F = 40 N < f_lim, the body does not move, and static friction balances the applied force: f = 40 N.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Motion of System of Particles and Rigid Body',
    question: 'A body of mass m is projected with velocity v at an angle θ with the horizontal. Angular momentum about the projection point at maximum height is:',
    options: ['(m*v³*sin²(θ)*cos(θ))/(2g)', '(m*v³*sin(θ)*cos²(θ))/(2g)', '(m*v³*sin²(θ))/(2g)', 'Zero'],
    correctAnswer: 0,
    explanation: 'At max height, velocity is purely horizontal: v_h = v*cos(θ). Maximum height H = (v²*sin²(θ))/(2g). Angular momentum L = m * v_h * H = (m*v³*sin²(θ)*cos(θ))/(2g).'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Work, Energy and Power',
    question: 'Work done by static friction on a solid sphere rolling without slipping on a stationary horizontal surface is:',
    options: ['Always positive', 'Always negative', 'Zero', 'Depends on radius'],
    correctAnswer: 2,
    explanation: 'In pure rolling, the instantaneous velocity of the point of contact with the ground is zero. Hence, instantaneous power and work done by static friction are zero.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Electrostatics',
    question: 'Two capacitors C₁ and C₂ charged to potentials V₁ and V₂ are connected in parallel. The loss in electrostatic energy during charge sharing is:',
    options: ['C₁*C₂*(V₁-V₂)² / (C₁+C₂)', 'C₁*C₂*(V₁-V₂)² / [2(C₁+C₂)]', '(C₁+C₂)*(V₁-V₂)² / 2', 'Zero'],
    correctAnswer: 1,
    explanation: 'Loss in electrostatic energy ΔU = (1/2) * [C₁*C₂ / (C₁ + C₂)] * (V₁ - V₂)².'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Electromagnetic Induction and Alternating Currents',
    question: 'An LC circuit contains an inductor L = 20 mH and a capacitor C = 50 μF. The angular frequency of natural oscillations is:',
    options: ['1000 rad/s', '500 rad/s', '250 rad/s', '100 rad/s'],
    correctAnswer: 0,
    explanation: 'ω = 1/√(L*C) = 1/√((20 × 10⁻³) * (50 × 10⁻⁶)) = 1/√(10⁻⁶) = 1000 rad/s.'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Gravitation',
    question: 'The escape velocity of a body from Earth surface is vₑ. If projected at an angle of 45° to the vertical, its escape velocity is:',
    options: ['vₑ', 'vₑ / √2', 'vₑ * √2', '2*vₑ'],
    correctAnswer: 0,
    explanation: 'Escape velocity depends strictly on the gravitational potential at the surface vₑ = √(2GM/R) and is completely independent of the angle of projection.'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Optics',
    question: 'In Young double-slit experiment, if the separation between the slits is halved and the distance to the screen is doubled, the fringe width becomes:',
    options: ['Halved', 'Doubled', 'Four times', 'Unchanged'],
    correctAnswer: 2,
    explanation: 'Fringe width β = λ*D/d. When D -> 2D and d -> d/2, β_new = λ*(2D)/(d/2) = 4*(λ*D/d) = 4β.'
  }
  /* ===== [PASTE NEW PHYSICS QUESTIONS ABOVE THIS LINE] ===== */
];

/* =================================================================================
 *  SECTION 2: CHEMISTRY QUESTIONS
 * ================================================================================= */
export const CHEMISTRY_QUESTIONS = [
  /* ===== [PASTE NEW CHEMISTRY QUESTIONS BELOW THIS LINE] ===== */
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Chemical Bonding and Molecular Structure',
    question: 'Which of the following molecules has the highest dipole moment?',
    options: ['NH₃', 'NF₃', 'BF₃', 'CH₄'],
    correctAnswer: 0,
    explanation: 'In NH₃, the resultant of the N-H bond dipoles acts in the same direction as the lone pair dipole, reinforcing each other. In NF₃, the highly electronegative F atoms pull in the opposite direction of the lone pair.'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Coordination Compounds',
    question: 'The oxidation state of Fe in the brown ring complex [Fe(H₂O)₅(NO)]SO₄ is:',
    options: ['+1', '+2', '+3', '0'],
    correctAnswer: 0,
    explanation: 'In the brown ring complex, nitric oxide coordinates as NO⁺ (nitrosonium ion). Thus: Fe + 5(0) + (+1) = +2 => Fe = +1.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Hydrocarbons',
    question: 'Which of the following alkenes yields only acetone (propan-2-one) upon reductive ozonolysis (O₃ / Zn-H₂O)?',
    options: ['2-Methylpropene', '2,3-Dimethylbut-2-ene', 'But-2-ene', '2-Methylbut-2-ene'],
    correctAnswer: 1,
    explanation: '2,3-Dimethylbut-2-ene is (CH₃)₂C=C(CH₃)₂. Cleaving the double bond symmetrically produces two molecules of (CH₃)₂C=O.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Chemical Kinetics',
    question: 'The unit of rate constant k for a second-order chemical reaction is:',
    options: ['s⁻¹', 'mol L⁻¹ s⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹'],
    correctAnswer: 2,
    explanation: 'Rate = k [A]² => k = Rate / [A]² = (mol L⁻¹ s⁻¹) / (mol L⁻¹)² = L mol⁻¹ s⁻¹.'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Equilibrium',
    question: 'Among the following species, the strongest Brønsted base is:',
    options: ['NH₂⁻', 'OH⁻', 'CH₃O⁻', 'F⁻'],
    correctAnswer: 0,
    explanation: 'NH₃ is the weakest acid among NH₃, H₂O, CH₃OH, and HF. Therefore, its conjugate base NH₂⁻ is the strongest base.'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Coordination Compounds',
    question: 'The spin-only magnetic moment of [NiCl₄]²⁻ is approximately:',
    options: ['0 BM', '1.73 BM', '2.83 BM', '3.87 BM'],
    correctAnswer: 2,
    explanation: 'Ni²⁺ has 3d⁸ configuration. Cl⁻ is a weak field ligand, forming a tetrahedral complex with 2 unpaired electrons: μ = √(n(n+2)) = √(2×4) = √8 ≈ 2.83 BM.'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Solutions',
    question: 'If 1 mole of NaCl and 1 mole of glucose are dissolved separately in 1 kg of water, the ratio of elevation in boiling point (ΔT_b(NaCl) / ΔT_b(glucose)) is approximately:',
    options: ['1 : 1', '2 : 1', '1 : 2', '3 : 1'],
    correctAnswer: 1,
    explanation: 'ΔT_b = i * K_b * m. For NaCl (strong electrolyte), i ≈ 2. For glucose (non-electrolyte), i = 1. Ratio = 2 : 1.'
  }
  /* ===== [PASTE NEW CHEMISTRY QUESTIONS ABOVE THIS LINE] ===== */
];

/* =================================================================================
 *  SECTION 3: MATHEMATICS QUESTIONS
 * ================================================================================= */
export const MATHEMATICS_QUESTIONS = [
  /* ===== [PASTE NEW MATHEMATICS QUESTIONS BELOW THIS LINE] ===== */
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Matrices and Determinants',
    question: 'If A is a 3 × 3 non-singular matrix such that adj(2A) = k * adj(A), then the value of k is:',
    options: ['2', '4', '8', '16'],
    correctAnswer: 1,
    explanation: 'For an n × n matrix, adj(c*A) = c^(n-1) * adj(A). For n = 3: adj(2A) = 2^(3-1) * adj(A) = 2² * adj(A) = 4 * adj(A). Thus k = 4.'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Integral Calculus',
    question: 'The value of the definite integral ∫₀^(π/2) [sin(x) / (sin(x) + cos(x))] dx is:',
    options: ['π', 'π/2', 'π/4', '0'],
    correctAnswer: 2,
    explanation: 'Using King\'s property ∫₀ᵃ f(x) dx = ∫₀ᵃ f(a-x) dx: I = ∫₀^(π/2) [cos(x) / (cos(x) + sin(x))] dx. Adding both: 2I = ∫₀^(π/2) 1 dx = π/2 => I = π/4.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Limit, Continuity and Differentiability',
    question: 'The number of real solutions to the equation e^x + x - 2 = 0 is:',
    options: ['0', '1', '2', 'Infinitely many'],
    correctAnswer: 1,
    explanation: 'Let f(x) = e^x + x - 2. Then f\'(x) = e^x + 1 > 0 for all real x, meaning f(x) is strictly increasing. Also, f(0) = -1 and f(1) = e - 1 > 0. By IVT and monotonicity, it has exactly 1 real root.'
  },
  {
    yearTag: 'JEE Main 2023',
    chapter: 'Vector Algebra',
    question: 'If vectors a, b, c are coplanar, then the scalar triple product [a+b  b+c  c+a] is equal to:',
    options: ['0', '[a b c]', '2*[a b c]', '-[a b c]'],
    correctAnswer: 0,
    explanation: '[a+b  b+c  c+a] = 2 * [a b c]. Since vectors a, b, c are coplanar, [a b c] = 0, which makes the entire product 0.'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Coordinate Geometry',
    question: 'The radius of the circle x² + y² - 4x + 6y - 12 = 0 is:',
    options: ['3', '4', '5', '√13'],
    correctAnswer: 2,
    explanation: 'Compare with x² + y² + 2gx + 2fy + c = 0: g = -2, f = 3, c = -12. Radius r = √(g² + f² - c) = √(4 + 9 - (-12)) = √25 = 5.'
  },
  {
    yearTag: 'JEE Main 2022',
    chapter: 'Conic Sections',
    question: 'The eccentricity of the hyperbola x²/16 - y²/9 = 1 is:',
    options: ['4/3', '5/4', '5/3', '√7/4'],
    correctAnswer: 1,
    explanation: 'b² = a²(e² - 1) => 9 = 16(e² - 1) => e² - 1 = 9/16 => e² = 25/16 => e = 5/4.'
  },
  {
    yearTag: 'JEE Main 2024',
    chapter: 'Complex Numbers and Quadratic Equations',
    question: 'If α and β are roots of x² - 6x - 2 = 0 and aₙ = αⁿ - βⁿ for n ≥ 1, then the value of (a₁₀ - 2a₈) / (2a₉) is:',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    explanation: 'Since α and β satisfy x² - 6x - 2 = 0, multiplying by x^(n-2) yields aₙ - 6aₙ₋₁ - 2aₙ₋₂ = 0. For n = 10: a₁₀ - 2a₈ = 6a₉ => (a₁₀ - 2a₈)/(2a₉) = 6/2 = 3.'
  }
  /* ===== [PASTE NEW MATHEMATICS QUESTIONS ABOVE THIS LINE] ===== */
];

// Unified Master Question Bank Object
export const JEE_QUESTION_BANK = {
  Physics: PHYSICS_QUESTIONS,
  Chemistry: CHEMISTRY_QUESTIONS,
  Mathematics: MATHEMATICS_QUESTIONS
};

/**
 * Shuffled standard questions provider with chapter and year tag formatting
 */
export function getStandardQuestions(subject = 'Physics', chapter = 'All', count = 5) {
  let pool = [];

  if (subject === 'All' || subject === 'Full Syllabus') {
    pool = [...PHYSICS_QUESTIONS, ...CHEMISTRY_QUESTIONS, ...MATHEMATICS_QUESTIONS];
  } else {
    pool = JEE_QUESTION_BANK[subject] || PHYSICS_QUESTIONS;
  }

  // Filter by chapter if specific chapter requested
  if (chapter && chapter !== 'All') {
    const chapterMatches = pool.filter(
      (q) => q.chapter && q.chapter.toLowerCase() === chapter.toLowerCase()
    );
    if (chapterMatches.length > 0) {
      pool = chapterMatches;
    }
  }

  const target = Math.max(1, count || 5);
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = [];

  for (let i = 0; i < target; i++) {
    const base = shuffled[i % shuffled.length];
    const yearPrefix = base.yearTag ? `[${base.yearTag}] ` : '';
    const chapterPrefix = base.chapter ? `[${base.chapter}] ` : `[${subject}] `;

    selected.push({
      id: i + 1,
      yearTag: base.yearTag || 'JEE Main',
      chapter: base.chapter || (subject === 'All' ? 'Mixed' : subject),
      question: formatMathSymbols(`${yearPrefix}${chapterPrefix}Q${i + 1}: ${base.question}`),
      options: base.options.map((opt) => formatMathSymbols(opt)),
      correctAnswer: base.correctAnswer,
      explanation: formatMathSymbols(base.explanation)
    });
  }

  return selected;
}