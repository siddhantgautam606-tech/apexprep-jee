import { formatMathSymbols } from './jeeQuestionBank';

const PHYSICS_QUESTIONS = [
  { yearTag:'NEET Practice', chapter:'Units and Measurements', question:'A physical quantity has dimensions [ML²T⁻²]. Which quantity has these dimensions?', options:['Force','Energy','Power','Pressure'], correctAnswer:1, explanation:'Energy has dimensions ML²T⁻².' },
  { yearTag:'NEET Practice', chapter:'Kinematics', question:'The slope of a velocity-time graph represents:', options:['Displacement','Acceleration','Momentum','Force'], correctAnswer:1, explanation:'The slope of a v-t graph is change in velocity per unit time, i.e. acceleration.' },
  { yearTag:'NEET Practice', chapter:'Laws of Motion', question:'According to Newton’s third law, action and reaction forces:', options:['Act on the same body','Are unequal','Act on different bodies','Always cancel each other'], correctAnswer:2, explanation:'Action and reaction are equal and opposite but act on different bodies.' },
  { yearTag:'NEET Practice', chapter:'Work, Energy and Power', question:'The SI unit of power is:', options:['Joule','Newton','Watt','Pascal'], correctAnswer:2, explanation:'Power is measured in watt (J/s).' },
  { yearTag:'NEET Practice', chapter:'Electrostatics', question:'The SI unit of electric potential is:', options:['Volt','Coulomb','Ohm','Tesla'], correctAnswer:0, explanation:'Electric potential is measured in volts.' }
];
const CHEMISTRY_QUESTIONS = [
  { yearTag:'NEET Practice', chapter:'Some Basic Concepts of Chemistry', question:'The number of particles in one mole of a substance is approximately:', options:['6.022×10²³','3.011×10²³','9.8×10²³','1.602×10⁻¹⁹'], correctAnswer:0, explanation:'One mole contains Avogadro’s number, 6.022×10²³, particles.' },
  { yearTag:'NEET Practice', chapter:'Atomic Structure', question:'The maximum number of electrons in the second shell is:', options:['2','8','18','32'], correctAnswer:1, explanation:'The maximum number is 2n²; for n=2, it is 8.' },
  { yearTag:'NEET Practice', chapter:'Chemical Bonding', question:'The bond in NaCl is predominantly:', options:['Covalent','Ionic','Metallic','Hydrogen'], correctAnswer:1, explanation:'NaCl forms by electron transfer, giving an ionic bond.' },
  { yearTag:'NEET Practice', chapter:'Thermodynamics', question:'At constant pressure, heat supplied to a system is equal to the change in:', options:['Enthalpy','Entropy only','Volume only','Gibbs energy'], correctAnswer:0, explanation:'At constant pressure with only PV work, q_p = ΔH.' },
  { yearTag:'NEET Practice', chapter:'Equilibrium', question:'For a catalyst at equilibrium, the equilibrium constant:', options:['Increases','Decreases','Remains unchanged','Becomes zero'], correctAnswer:2, explanation:'A catalyst speeds both forward and reverse reactions equally and does not change K.' }
];
const BIOLOGY_QUESTIONS = [
  { yearTag:'NEET Practice', chapter:'Cell: The Unit of Life', question:'The powerhouse of the cell is the:', options:['Ribosome','Mitochondrion','Golgi apparatus','Lysosome'], correctAnswer:1, explanation:'Mitochondria generate most cellular ATP through aerobic respiration.' },
  { yearTag:'NEET Practice', chapter:'Biomolecules', question:'Proteins are polymers primarily made of:', options:['Nucleotides','Amino acids','Fatty acids','Monosaccharides'], correctAnswer:1, explanation:'Proteins are chains of amino acids.' },
  { yearTag:'NEET Practice', chapter:'Human Physiology', question:'The functional unit of the kidney is the:', options:['Neuron','Nephron','Alveolus','Villus'], correctAnswer:1, explanation:'The nephron is the structural and functional unit of the kidney.' },
  { yearTag:'NEET Practice', chapter:'Genetics', question:'DNA replication is generally described as:', options:['Conservative','Semi-conservative','Dispersive only','Random'], correctAnswer:1, explanation:'Each daughter DNA molecule contains one parental strand and one newly synthesized strand.' },
  { yearTag:'NEET Practice', chapter:'Ecology', question:'The first trophic level in a food chain is occupied by:', options:['Consumers','Decomposers','Producers','Detritivores'], correctAnswer:2, explanation:'Producers form the first trophic level.' }
];

export const NEET_QUESTION_BANK = { Physics: PHYSICS_QUESTIONS, Chemistry: CHEMISTRY_QUESTIONS, Biology: BIOLOGY_QUESTIONS };

export function getStandardNEETQuestions(subject='Physics', chapter='All', count=5) {
  let pool = subject === 'All' || subject === 'Full Syllabus'
    ? [...PHYSICS_QUESTIONS, ...CHEMISTRY_QUESTIONS, ...BIOLOGY_QUESTIONS]
    : (NEET_QUESTION_BANK[subject] || PHYSICS_QUESTIONS);
  if (chapter && chapter !== 'All') {
    const matches = pool.filter(q => q.chapter?.toLowerCase() === chapter.toLowerCase());
    if (matches.length) pool = matches;
  }
  const target=Math.max(1,count||5), shuffled=[...pool].sort(()=>0.5-Math.random());
  return Array.from({length:target},(_,i)=>{
    const base=shuffled[i%shuffled.length];
    return { id:i+1, yearTag:base.yearTag, chapter:base.chapter, question:formatMathSymbols(base.question), options:base.options.map(formatMathSymbols), correctAnswer:base.correctAnswer, explanation:formatMathSymbols(base.explanation) };
  });
}
