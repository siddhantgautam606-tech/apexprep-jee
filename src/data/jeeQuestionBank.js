// Conservative LaTeX-to-Unicode formatter for readable inline equations.
// Unknown commands are left visible rather than silently deleted.
export function formatMathSymbols(text) {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') text = String(text);
  return text
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/\\(?:dfrac|tfrac|frac)\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, '√($1)')
    .replace(/sqrt\(([^)]+)\)/g, '√($1)')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot|\\bullet/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\geq?|\\ge/g, '≥')
    .replace(/\\leq?|\\le/g, '≤')
    .replace(/\\neq|\\ne/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\propto/g, '∝')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow|\\to/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\in\b/g, '∈')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\supseteq/g, '⊇')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\therefore/g, '∴')
    .replace(/\\because/g, '∵')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    .replace(/\\int\b/g, '∫')
    .replace(/\\iint\b/g, '∬')
    .replace(/\\iiint\b/g, '∭')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\prod\b/g, '∏')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\epsilon\b/g, 'ε')
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\nu\b/g, 'ν')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\rho\b/g, 'ρ')
    .replace(/\\sigma\b/g, 'σ')
    .replace(/\\tau\b/g, 'τ')
    .replace(/\\phi\b/g, 'φ')
    .replace(/\\varphi\b/g, 'ϕ')
    .replace(/\\omega\b/g, 'ω')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\Omega\b/g, 'Ω')
    .replace(/\\sin\b/g, 'sin')
    .replace(/\\cos\b/g, 'cos')
    .replace(/\\tan\b/g, 'tan')
    .replace(/\\log\b/g, 'log')
    .replace(/\\ln\b/g, 'ln')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^{}]*)\}/g, '$1')
    .replace(/\\mathbf\{([^{}]*)\}/g, '$1')
    .replace(/\\operatorname\{([^{}]*)\}/g, '$1')
    .replace(/\^\{([^{}]+)\}/g, '^$1')
    .replace(/_\{([^{}]+)\}/g, '_$1')
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^4\b/g, '⁴')
    .replace(/_\{?0\}?/g, '₀')
    .replace(/_\{?1\}?/g, '₁')
    .replace(/_\{?2\}?/g, '₂')
    .replace(/_\{?3\}?/g, '₃')
    .replace(/_\{?4\}?/g, '₄')
    .replace(/_\{?max\}?/g, 'ₘₐₓ')
    .replace(/_\{?min\}?/g, 'ₘᵢₙ')
    .replace(/\\\\/g, ' ');
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
