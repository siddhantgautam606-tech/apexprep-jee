import { Atom, Flame, Compass } from 'lucide-react';

export const SYLLABUS_DATA = {
  physics: {
    title: 'Physics',
    icon: Atom,
    chapters: [
      {
        id: 'kinematics',
        name: 'Kinematics in 1D & 2D',
        subtopics: [
          {
            id: 'projectile-motion',
            title: 'Projectile Motion on Horizontal & Inclined Planes',
            readTime: '12 min read',
            analogy: 'Imagine kicking a football. Gravity only pulls downwards (-y direction), meaning horizontal velocity (Vx) never changes throughout the flight if we ignore air resistance!',
            theory: 'In 2D projectile motion, motion in horizontal and vertical directions are independent of each other. Acceleration acts exclusively along the vertical axis (a_y = -g), while horizontal acceleration (a_x = 0).',
            keyFormulas: [
              'Time of Flight: T = (2 * u * sinθ) / g',
              'Max Height: H = (u² * sin²θ) / (2g)',
              'Horizontal Range: R = (u² * sin2θ) / g',
              'Trajectory Equation: y = x*tanθ - (g * x²) / (2 * u² * cos²θ)'
            ],
            workedExample: {
              problem: 'A ball is projected with speed 20 m/s at 30° above horizontal. Find the horizontal range and maximum height. (Take g = 10 m/s²)',
              steps: [
                'Step 1: Identify components: u_x = 20 * cos(30°) = 10√3 m/s, u_y = 20 * sin(30°) = 10 m/s',
                'Step 2: Calculate H_max = (10)² / (2 * 10) = 100 / 20 = 5 meters',
                'Step 3: Range = (20² * sin(60°)) / 10 = (400 * √3/2) / 10 = 20√3 ≈ 34.64 meters'
              ]
            },
            questions: [
              {
                id: 'pyq-p-1',
                yearTag: 'JEE Main 2024 (Jan 29 Shift 1)',
                text: 'A projectile is launched from ground level with speed u at an angle θ with the horizontal. The ratio of its kinetic energy at the highest point to its initial kinetic energy is 3:4. What is the value of θ?',
                options: ['30°', '45°', '60°', '75°'],
                correctIndex: 0,
                explanation: 'At maximum height, only horizontal velocity survives: v = u*cosθ. Kinetic energy at top = 1/2 m (u cosθ)² = KE_initial * cos²θ. Given ratio = 3/4, so cos²θ = 3/4 => cosθ = √3/2 => θ = 30°.'
              },
              {
                id: 'pyq-p-2',
                yearTag: 'JEE Main 2023 (April 8 Shift 2)',
                text: 'The equation of trajectory of a projectile is given by y = √3 x - 5x². The angle of projection is:',
                options: ['30°', '45°', '60°', '90°'],
                correctIndex: 2,
                explanation: 'Comparing with standard trajectory equation y = x*tanθ - (g*x²)/(2u²cos²θ), coefficient of x is tanθ = √3. Therefore θ = 60°.'
              }
            ]
          }
        ]
      }
    ]
  },
  chemistry: {
    title: 'Chemistry',
    icon: Flame,
    chapters: [
      {
        id: 'thermo-chem',
        name: 'Chemical Thermodynamics',
        subtopics: [
          {
            id: 'first-law',
            title: 'First Law of Thermodynamics & Enthalpy',
            readTime: '10 min read',
            analogy: 'Think of internal energy (ΔU) as your bank account balance. Heat (q) is money deposited, and work done by the system (w) is money spent shopping.',
            theory: 'The First Law states that energy cannot be created or destroyed. Mathematically: ΔU = q + w (IUPAC convention), where w = -P_ext * ΔV for reversible expansion.',
            keyFormulas: [
              'First Law: ΔU = q + w',
              'Work (Expansion): w = -∫ P_ext dV',
              'Isothermal Reversible Work: w = -2.303 nRT log(V2 / V1)',
              'Enthalpy Relation: ΔH = ΔU + Δn_g * R * T'
            ],
            workedExample: {
              problem: '1 mole of an ideal gas expands isothermally and reversibly at 300 K from 10 L to 100 L. Find the work done. (R = 8.314 J/mol·K)',
              steps: [
                'Step 1: Use w = -2.303 * n * R * T * log10(V2 / V1)',
                'Step 2: log10(100 / 10) = log10(10) = 1',
                'Step 3: w = -2.303 * 1 * 8.314 * 300 * 1 = -5744.1 Joules (Work done by the gas)'
              ]
            },
            questions: [
              {
                id: 'pyq-c-1',
                yearTag: 'JEE Main 2024 (Jan 31 Shift 2)',
                text: 'For the reaction: N₂(g) + 3H₂(g) → 2NH₃(g) at 298 K, what is the relation between ΔH and ΔU?',
                options: ['ΔH = ΔU - 2RT', 'ΔH = ΔU + 2RT', 'ΔH = ΔU - RT', 'ΔH = ΔU + RT'],
                correctIndex: 0,
                explanation: 'Δn_g = moles of gaseous products - moles of gaseous reactants = 2 - (1 + 3) = -2. Since ΔH = ΔU + Δn_g*RT, ΔH = ΔU - 2RT.'
              }
            ]
          }
        ]
      }
    ]
  },
  math: {
    title: 'Mathematics',
    icon: Compass,
    chapters: [
      {
        id: 'calculus-diff',
        name: 'Differential Calculus',
        subtopics: [
          {
            id: 'limits-standard',
            title: 'Evaluation of Limits & L’Hôpital Rule',
            readTime: '15 min read',
            analogy: 'Finding a limit is like zooming in on a tiny hole in a graph with a microscope to see what point both sides are aiming toward, even if that point itself is missing!',
            theory: 'Standard 0/0 or ∞/∞ indeterminate forms can be solved via factorization, rationalization, expansion series (Maclaurin), or applying L’Hôpital’s rule: lim [f(x)/g(x)] = lim [f\'(x)/g\'(x)].',
            keyFormulas: [
              'lim (x→0) sin(x)/x = 1',
              'lim (x→0) tan(x)/x = 1',
              'lim (x→0) (e^x - 1)/x = 1',
              'lim (x→0) (1 + x)^(1/x) = e'
            ],
            workedExample: {
              problem: 'Evaluate: lim (x→0) [sin(5x) / tan(2x)]',
              steps: [
                'Step 1: Rewrite as [sin(5x)/(5x) * 5x] / [tan(2x)/(2x) * 2x]',
                'Step 2: Apply standard limits: [1 * 5x] / [1 * 2x]',
                'Step 3: Cancel x to arrive at 5/2'
              ]
            },
            questions: [
              {
                id: 'pyq-m-1',
                yearTag: 'JEE Main 2024 (Jan 27 Shift 1)',
                text: 'Evaluate: lim (x→0) [ (1 - cos(4x)) / x² ]',
                options: ['4', '8', '16', '2'],
                correctIndex: 1,
                explanation: '1 - cos(4x) = 2 sin²(2x). Limit becomes lim 2 * [sin(2x)/2x]² * 4 = 2 * (1)² * 4 = 8.'
              }
            ]
          }
        ]
      }
    ]
  }
};