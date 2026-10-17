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

// Question content intentionally cleared. Keep the public API stable so the app
// remains functional while the question bank is repopulated.
export const PHYSICS_QUESTIONS = [];
export const CHEMISTRY_QUESTIONS = [];
export const MATHEMATICS_QUESTIONS = [];
export const JEE_QUESTION_BANK = {
  Physics: PHYSICS_QUESTIONS,
  Chemistry: CHEMISTRY_QUESTIONS,
  Mathematics: MATHEMATICS_QUESTIONS
};

export function getStandardQuestions(_subject = 'Physics', _chapter = 'All', _count = 5) {
  return [];
}
