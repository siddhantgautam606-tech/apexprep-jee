// Robust formatter supporting standard LaTeX syntax, powers, subscripts, and Greek symbols
export function formatMathSymbols(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip inline/display math delimiters
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    // Fractions: \frac{a}{b} -> (a/b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)')
    // Square roots: \sqrt{x} or sqrt(x) -> √(x)
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    // Powers & Superscripts
    .replace(/\\?\^2|\^\{2\}/g, '²')
    .replace(/\\?\^3|\^\{3\}/g, '³')
    .replace(/\\?\^4|\^\{4\}/g, '⁴')
    .replace(/\\?\^\{-1\}|\^-1/g, '⁻¹')
    .replace(/\\?\^\{-2\}|\^-2/g, '⁻²')
    .replace(/\\?\^\{([^}]+)\}/g, '^($1)')
    // Subscripts: _0 -> ₀, _1 -> ₁, _2 -> ₂, _max -> _max
    .replace(/_0|_\{0\}/g, '₀')
    .replace(/_1|_\{1\}/g, '₁')
    .replace(/_2|_\{2\}/g, '₂')
    .replace(/_3|_\{3\}/g, '₃')
    .replace(/_4|_\{4\}/g, '₄')
    .replace(/_\{max\}|_max|\\max/g, 'ₘₐₓ')
    .replace(/_\{min\}|_min|\\min/g, 'ₘᵢₙ')
    .replace(/_\{s\}|_s/g, 'ₛ')
    .replace(/_\{([a-zA-Z0-9]+)\}/g, '_$1')
    // Greek letters (handles both \nu and nu)
    .replace(/\\nu\b|\bnu\b/g, 'ν')
    .replace(/\\theta\b|\btheta\b/g, 'θ')
    .replace(/\\lambda\b|\blambda\b/g, 'λ')
    .replace(/\\beta\b|\bbeta\b/g, 'β')
    .replace(/\\alpha\b|\balpha\b/g, 'α')
    .replace(/\\pi\b|\bpi\b/g, 'π')
    .replace(/\\omega\b|\bomega\b/g, 'ω')
    .replace(/\\phi\b|\bphi\b/g, 'ϕ')
    // Math operators & symbols
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\ge|\\geq/g, '≥')
    .replace(/\\le|\\leq/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\to|\\rightarrow/g, '→')
    .replace(/\\infty/g, '∞')
    // Clean leftover LaTeX formatting commands
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\/g, '');
}

// Master JEE Question Bank - Add new questions here anytime!
export const JEE_QUESTION_BANK = {
  Physics: [
    {
      question: 'A particle moves along the x-axis with velocity v = k*sqrt(x). The displacement varies with time as:',
      options: ['x proportional to t', 'x proportional to t^2', 'x proportional to t^(1/2)', 'x proportional to t^3'],
      correctAnswer: 1,
      explanation: 'v = dx/dt = k*sqrt(x) => x^(-1/2) dx = k dt. Integrating gives 2*sqrt(x) = kt => x proportional to t^2.'
    },
    {
      question: 'Two capacitors C_1 and C_2 charged to V_1 and V_2 are connected in parallel. Loss in energy is:',
      options: ['C_1*C_2*(V_1-V_2)^2 / (C_1+C_2)', 'C_1*C_2*(V_1-V_2)^2 / 2(C_1+C_2)', '(C_1+C_2)*(V_1-V_2)^2 / 2', 'Zero'],
      correctAnswer: 1,
      explanation: 'Energy loss in redistribution = (1/2) * (C_1*C_2 / (C_1+C_2)) * (V_1 - V_2)^2.'
    },
    {
      question: 'In a Young double-slit experiment, if slit distance is halved and screen distance doubled, fringe width becomes:',
      options: ['Halved', 'Doubled', 'Four times', 'Unchanged'],
      correctAnswer: 2,
      explanation: 'beta = lambda*D/d. New fringe width beta_new = lambda*(2D)/(d/2) = 4*beta.'
    },
    {
      question: 'Work done by static friction on a rolling sphere without slipping on a horizontal surface is:',
      options: ['Always positive', 'Always negative', 'Zero', 'Depends on radius'],
      correctAnswer: 2,
      explanation: 'In pure rolling, instantaneous velocity of contact point is zero, so power and work done are zero.'
    },
    {
      question: 'An LC circuit contains a 20 mH inductor and a 50 micro-F capacitor. The angular frequency of free oscillations is:',
      options: ['1000 rad/s', '500 rad/s', '250 rad/s', '100 rad/s'],
      correctAnswer: 0,
      explanation: 'omega = 1/sqrt(L*C) = 1/sqrt(20*10^-3 * 50*10^-6) = 1/sqrt(10^-6) = 1000 rad/s.'
    },
    {
      question: 'The escape velocity of a body from Earth surface is v_e. If projected at 45 degrees to vertical, escape velocity is:',
      options: ['v_e', 'v_e / sqrt(2)', 'v_e * sqrt(2)', '2*v_e'],
      correctAnswer: 0,
      explanation: "Escape velocity depends only on Earth's mass and radius, independent of the projection angle."
    }
  ],
  Chemistry: [
    {
      question: 'Which of the following molecules has the highest dipole moment?',
      options: ['NH_3', 'NF_3', 'BF_3', 'CH_4'],
      correctAnswer: 0,
      explanation: 'In NH_3, orbital lone pair dipole and N-H bond moments add up constructively in the same direction.'
    },
    {
      question: 'The oxidation state of Fe in the brown ring complex [Fe(H_2O)_5(NO)]SO_4 is:',
      options: ['+1', '+2', '+3', '0'],
      correctAnswer: 0,
      explanation: 'NO is coordinated as NO+ (nitrosonium), leaving Fe in +1 oxidation state.'
    },
    {
      question: 'Which alkene yields only acetone upon reductive ozonolysis?',
      options: ['2-Methylpropene', '2,3-Dimethylbut-2-ene', 'But-2-ene', '2-Methylbut-2-ene'],
      correctAnswer: 1,
      explanation: '(CH_3)_2C=C(CH_3)_2 cleaves symmetrically into 2 molecules of (CH_3)_2C=O.'
    },
    {
      question: 'The unit of rate constant for a second-order chemical reaction is:',
      options: ['s^-1', 'mol L^-1 s^-1', 'L mol^-1 s^-1', 'L^2 mol^-2 s^-1'],
      correctAnswer: 2,
      explanation: 'k units = (mol/L)^(1-n) s^-1. For n=2: (mol/L)^-1 s^-1 = L mol^-1 s^-1.'
    },
    {
      question: 'Among the following species, the strongest Bronsted base is:',
      options: ['NH_2^-', 'OH^-', 'CH_3O^-', 'F^-'],
      correctAnswer: 0,
      explanation: 'NH_3 is the weakest acid among NH_3, H_2O, CH_3OH, and HF; therefore conjugate base NH_2^- is the strongest base.'
    },
    {
      question: 'The magnetic moment of [NiCl_4]^2- is approximately:',
      options: ['0 BM', '1.73 BM', '2.83 BM', '3.87 BM'],
      correctAnswer: 2,
      explanation: 'Ni^2+ is 3d^8. Cl^- is weak field ligand, tetrahedral with 2 unpaired electrons: sqrt(2*(2+2)) = sqrt(8) ~ 2.83 BM.'
    }
  ],
  Mathematics: [
    {
      question: 'If A is a 3x3 non-singular matrix such that adj(2A) = k * adj(A), then k equals:',
      options: ['2', '4', '8', '16'],
      correctAnswer: 1,
      explanation: 'adj(c*A) = c^(n-1) * adj(A). For n=3: 2^(3-1) = 2^2 = 4.'
    },
    {
      question: 'The value of definite integral from 0 to pi/2 of (sin(x) / (sin(x) + cos(x))) dx is:',
      options: ['pi', 'pi/2', 'pi/4', '0'],
      correctAnswer: 2,
      explanation: 'By symmetry I = integral 0 to pi/2 f(x)dx = integral 0 to pi/2 f(a-x)dx, 2*I = pi/2 => I = pi/4.'
    },
    {
      question: 'The number of real roots of the equation e^x + x - 2 = 0 is:',
      options: ['0', '1', '2', 'Infinitely many'],
      correctAnswer: 1,
      explanation: "f'(x) = e^x + 1 > 0 for all real x, so f(x) is strictly increasing and crosses y=0 exactly once."
    },
    {
      question: 'If vectors a, b, c are coplanar, then scalar triple product [a+b  b+c  c+a] is equal to:',
      options: ['0', '[a b c]', '2*[a b c]', '-[a b c]'],
      correctAnswer: 0,
      explanation: '[a+b b+c c+a] = 2*[a b c]. Since a, b, c are coplanar, [a b c] = 0, so the product is 0.'
    },
    {
      question: 'The radius of the circle x^2 + y^2 - 4x + 6y - 12 = 0 is:',
      options: ['3', '4', '5', 'sqrt(13)'],
      correctAnswer: 2,
      explanation: 'Center is (2, -3). Radius r = sqrt(2^2 + (-3)^2 - (-12)) = sqrt(4 + 9 + 12) = sqrt(25) = 5.'
    },
    {
      question: 'The eccentricity of the hyperbola x^2/16 - y^2/9 = 1 is:',
      options: ['4/3', '5/4', '5/3', 'sqrt(7)/4'],
      correctAnswer: 1,
      explanation: 'b^2 = a^2*(e^2 - 1) => 9 = 16*(e^2 - 1) => e^2 = 25/16 => e = 5/4.'
    }
  ]
};

// Clean functional call to fetch and format questions for circle tests
export function getStandardQuestions(subject = 'Physics', chapter = 'All', count = 5) {
  const pool = JEE_QUESTION_BANK[subject] || JEE_QUESTION_BANK['Physics'];
  const selected = [];
  const target = Math.max(1, count || 5);

  for (let i = 0; i < target; i++) {
    const base = pool[i % pool.length];
    selected.push({
      id: i + 1,
      question: formatMathSymbols(`[${chapter || subject}] Q${i + 1}: ${base.question}`),
      options: base.options.map((opt) => formatMathSymbols(opt)),
      correctAnswer: base.correctAnswer,
      explanation: formatMathSymbols(base.explanation)
    });
  }
  return selected;
}