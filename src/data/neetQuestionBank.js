
import { formatMathSymbols } from './jeeQuestionBank';

const years = ['2024 Original Practice','2025 Original Practice','2026 Original Practice'];
const make=(subject,chapter,topic,question,options,correctAnswer,explanation,i)=>({id:'neet-bank-'+i,subject,chapter,topic,question,options,correctAnswer,explanation,yearTag:years[i%3]});
const questions=[]; let id=1;
const add=(subject,chapter,topic,q,opts,ans,exp,count=1)=>{for(let i=0;i<count;i++)questions.push(make(subject,chapter,topic,typeof q==='function'?q(i):q,typeof opts==='function'?opts(i):opts,typeof ans==='function'?ans(i):ans,typeof exp==='function'?exp(i):exp,id++));};

add('Physics','Units & Measurements','Dimensions','A quantity with dimensions [ML²T⁻³] can represent:',['Power','Energy','Force','Pressure'],0,'Power has dimensions ML²T⁻³.');
add('Physics','Kinematics','Motion in 1D',i=>'For x=4t²+2t, velocity at t='+(i+2)+' s is:',i=>[(8*(i+2)-2)+' m/s',(8*(i+2)+2)+' m/s',(8*(i+2)+6)+' m/s',(8*(i+2)+10)+' m/s'],1,'v=dx/dt=8t+2.',4);
add('Physics','Laws of Motion','Friction','Limiting friction is directly proportional to:',['area only','normal reaction','velocity','time'],1,'fmax=μsN.');
add('Physics','Work Energy Power','Power',i=>'A force of '+(10+5*i)+' N moves an object at '+(2+i)+' m/s in its direction. Power is:',i=>[''+((10+5*i)*(2+i)/2)+' W',''+((10+5*i)*(2+i))+' W',''+(12+6*i)+' W',''+((10+5*i)*(2+i)*2)+' W'],1,'P=Fv.',4);
add('Physics','Rotational Motion','Torque','Torque is maximum when the angle between r and F is:',['0°','30°','60°','90°'],3,'τ=rF sinθ is maximum at 90°.');
add('Physics','Gravitation','Satellite','For a circular satellite orbit, orbital speed varies with radius r as:',['r','1/r','1/√r','√r'],2,'v=√(GM/r).');
add('Physics','Thermal Physics','Calorimetry',i=>'Heat required to raise '+(1+i)+' kg by '+(5+i)+' K when c=4 kJ kg⁻¹K⁻¹ is:',i=>[(2*(1+i)*(5+i))+' kJ',(4*(1+i)*(5+i))+' kJ',((1+i)+(5+i)+4)+' kJ',(4*(1+i)/(5+i))+' kJ'],1,'Q=mcΔT.',4);
add('Physics','Oscillations','SHM','In SHM, acceleration is:',['ω²x','−ω²x','ωx','constant'],1,'a=−ω²x.');
add('Physics','Electrostatics','Coulomb law',i=>'If separation becomes '+(i+2)+' times, the electrostatic force becomes:',i=>[(i+2)+'F','F/'+(i+2),'F/'+((i+2)**2),((i+2)**2)+'F'],2,'Coulomb force varies as 1/r².',4);
add('Physics','Current Electricity','Ohm law',i=>'A '+(3+i)+' Ω resistor is connected to '+(6+3*i)+' V. Current is:',i=>[(6+3*i)/(3+i)+' A',''+((3+i)/(6+3*i))+' A',''+((3+i)*(6+3*i))+' A',''+(9+4*i)+' A'],0,'I=V/R.',4);
add('Physics','Magnetism','Force on charge','A charged particle moving parallel to a uniform magnetic field experiences:',['maximum force','zero force','qvB force','centripetal force'],1,'F=qvB sinθ and θ=0°.');
add('Physics','EMI','Faraday law','Induced emf is proportional to the rate of change of:',['charge','magnetic flux','resistance','mass'],1,'ε=−dΦ/dt.');
add('Physics','Ray Optics','Lens',i=>'A convex lens has focal length '+(10+10*i)+' cm. Its power is:',i=>['+'+(100/(10+10*i))+' D','−'+(100/(10+10*i))+' D','+'+((10+10*i)/100)+' D','−'+((10+10*i)/100)+' D'],0,'P=1/f in metres.',4);
add('Physics','Wave Optics','Interference','For sustained interference, sources should be:',['incoherent','coherent','of different frequencies','unrelated'],1,'Coherent sources maintain constant phase difference.');
add('Physics','Dual Nature','Photoelectric effect','Photoelectric emission occurs when frequency is:',['below threshold','at or above threshold','zero','independent of material'],1,'Emission requires ν≥ν₀.');
add('Physics','Atoms','Bohr model','In Bohr’s model, electron angular momentum is:',['nh','nh/π','nh/2π','2πnh'],2,'L=nℏ=nh/2π.');
add('Physics','Nuclei','Radioactivity',i=>'After '+(i+1)+' half-lives, the fraction remaining is:',i=>['1/'+(2**(i+1)),'1/'+(2**(i+2)),'1/2','zero'],0,'Each half-life halves the undecayed population.',4);
add('Physics','Semiconductors','Diode','Forward biasing a p-n junction generally:',['widens depletion region','narrows depletion region','removes all carriers','increases barrier potential'],1,'Forward bias lowers the barrier and narrows the depletion layer.');
add('Physics','EM Waves','Spectrum','Which electromagnetic radiation has the shortest wavelength?',['radio waves','microwaves','visible light','gamma rays'],3,'Gamma rays have the shortest wavelength.');
add('Physics','Experimental Physics','Errors','Averaging repeated measurements mainly reduces:',['systematic error','random error','unit error','instrument type'],1,'Averaging reduces random fluctuations.');
add('Physics','Fluids','Bernoulli','At the same height, if ideal-fluid speed increases, static pressure generally:',['increases','decreases','becomes zero','is unchanged'],1,'Bernoulli’s equation gives pressure decrease as kinetic energy term rises.');
add('Physics','Waves','Sound','The speed of sound is greatest in:',['vacuum','air','water','steel'],3,'Mechanical waves generally travel fastest in solids among these media.');
add('Physics','Capacitance','Energy',i=>'A '+(i+1)+' μF capacitor at '+(i+2)+' V stores:',i=>[0.5*(i+1)*(i+2)*(i+2)+' μJ',(i+1)*(i+2)*(i+2)+' μJ',(i+1)*(i+2)/2+' μJ',2*(i+1)*(i+2)*(i+2)+' μJ'],0,'U=½CV².',4);
add('Physics','Current Electricity','Resistors','Two equal resistors R in parallel have equivalent resistance:',['2R','R','R/2','R²'],2,'R_eq=R/2.');
add('Physics','Magnetism','Cyclotron','Cyclotron frequency of a charged particle is proportional to:',['B','1/B','B²','√B'],0,'f=qB/(2πm).');
add('Physics','AC','RMS','For sinusoidal voltage with peak V₀, RMS voltage is:',['V₀','V₀/2','V₀/√2','√2V₀'],2,'V_rms=V₀/√2.');
add('Physics','Ray Optics','Mirror','A plane mirror forms an image that is:',['real and inverted','virtual and erect','real and erect','virtual and inverted'],1,'A plane-mirror image is virtual and erect.');
add('Physics','Modern Physics','de Broglie','The de Broglie wavelength is inversely proportional to:',['momentum','mass only','charge','kinetic energy directly'],0,'λ=h/p.');
add('Physics','Gravitation','Escape speed','Escape speed from a planet is determined by:', ['surface gravity and radius','mass only','radius only','temperature'],0,'v_e=√(2gR).');
add('Physics','Thermodynamics','First law','For an adiabatic process, heat exchanged is:',['positive','negative','zero','equal to work'],2,'Adiabatic means q=0.');
add('Physics','Units & Measurements','Significant figures','How many significant figures are in 0.00450?',['2','3','4','5'],1,'Leading zeros are not significant; 4, 5 and the trailing zero are significant.');
add('Physics','Electrostatics','Gauss law','Net electric flux through a closed surface depends on:',['surface area only','enclosed charge','outside charge only','shape only'],1,'Φ=Q_enclosed/ε₀.');
add('Physics','Optics','TIR','Total internal reflection requires light to travel from:',['rarer to denser','denser to rarer','vacuum to any medium','any medium to air'],1,'TIR requires incidence from higher to lower refractive index.',);

add('Chemistry','Mole Concept','Stoichiometry',i=>'How many moles of oxygen atoms are present in '+(i+1)+' mol O₂?',[String((i+1)/2),String(i+1),String(2*(i+1)),String(4*(i+1))],2,'Each O₂ molecule contains two oxygen atoms.',3);
add('Chemistry','Atomic Structure','Quantum numbers','Maximum electrons in a p subshell are:',['2','6','10','14'],1,'A p subshell has three orbitals.');
add('Chemistry','Periodic Table','Trends','Atomic radius generally decreases across a period because:',['shell number increases','effective nuclear charge increases','nuclear charge decreases','shielding vanishes'],1,'Effective nuclear charge generally increases.');
add('Chemistry','Chemical Bonding','VSEPR','The molecular shape of NH₃ is:',['linear','trigonal planar','trigonal pyramidal','tetrahedral'],2,'Three bond pairs and one lone pair give trigonal pyramidal geometry.');
add('Chemistry','States of Matter','Gas laws',i=>'At constant temperature, increasing pressure '+(i+2)+' times changes volume to:',[(i+2)+'V','V/'+(i+2),((i+2)**2)+'V','unchanged'],1,'Boyle’s law: PV=constant.',3);
add('Chemistry','Thermodynamics','First law','At constant pressure with only PV work, heat exchanged equals:',['ΔU','ΔH','ΔS','ΔG always'],1,'q_p=ΔH.');
add('Chemistry','Equilibrium','Le Chatelier','Adding a catalyst to a system at equilibrium:',['increases K','decreases K','does not change K','makes K zero'],2,'Catalysts change rates, not equilibrium constant.');
add('Chemistry','Ionic Equilibrium','pH','At 25°C, a neutral aqueous solution has pH:',['0','7','14','1'],1,'Neutrality at 25°C corresponds to pH 7.');
add('Chemistry','Redox','Oxidation number','Oxidation state of sulfur in H₂SO₄ is:',['+4','+6','−2','+2'],1,'Charge balance gives S=+6.');
add('Chemistry','Electrochemistry','Cell potential','A spontaneous galvanic cell under standard conditions has E°cell:',['negative','zero','positive','undefined'],2,'ΔG°=−nFE°cell.');
add('Chemistry','Solutions','Colligative properties','Which is a colligative property?',['viscosity','osmotic pressure','surface tension','refractive index'],1,'Osmotic pressure depends on number of solute particles.');
add('Chemistry','Chemical Kinetics','Order','For a first-order reaction, half-life is:',['dependent on initial concentration','independent of initial concentration','proportional to concentration','always zero'],1,'t₁/₂=0.693/k.');
add('Chemistry','Surface Chemistry','Adsorption','Physisorption is generally favored by:',['high temperature','low temperature','absence of surface','zero pressure'],1,'Physical adsorption is generally exothermic.');
add('Chemistry','Solid State','Unit cell','Number of atoms effectively present in a BCC unit cell is:',['1','2','4','8'],1,'Corners contribute one atom total and the body-centred atom contributes one.');
add('Chemistry','Coordination Chemistry','Ligands','A ligand donating through two donor atoms is:',['monodentate','bidentate','tridentate','hexadentate'],1,'Bidentate means two donor atoms.');
add('Chemistry','p-Block','Halogens','The strongest oxidizing halogen is:',['F₂','Cl₂','Br₂','I₂'],0,'Fluorine has the greatest reduction tendency.');
add('Chemistry','d-Block','Colour','Which ion is commonly coloured because of d-d transitions?',['Sc³⁺','Zn²⁺','Cu²⁺','Ca²⁺'],2,'Cu²⁺ has partially filled d orbitals.');
add('Chemistry','Metallurgy','Froth flotation','Froth flotation primarily exploits differences in:',['wettability','atomic mass','melting point','boiling point'],0,'Sulphide ores are preferentially wetted by oil.');
add('Chemistry','Organic Chemistry','Functional groups','The −OH group of an alcohol is called:',['carbonyl','hydroxyl','carboxyl','amino'],1,'−OH is the hydroxyl group.');
add('Chemistry','Hydrocarbons','Alkenes','The general formula of an acyclic monoalkene is:',['CₙH₂ₙ₊₂','CₙH₂ₙ','CₙH₂ₙ₋₂','CₙHₙ'],1,'Acyclic monoalkenes have CₙH₂ₙ.');
add('Chemistry','Haloalkanes','SN1','SN1 reactions are favored by formation of a:',['stable carbocation','free radical','carbanion','stable nitrene'],0,'SN1 proceeds through a carbocation intermediate.');
add('Chemistry','Alcohols Phenols Ethers','Phenol','Phenol is more acidic than ethanol because:',['phenoxide is resonance stabilized','ethanol has no oxygen','phenol is ionic','ethanol is aromatic'],0,'Phenoxide ion is resonance stabilized.');
add('Chemistry','Aldehydes Ketones','Tollens test','Tollens reagent generally gives a silver mirror with:',['alkanes','aldehydes','ethers','alkenes'],1,'Aldehydes reduce Ag(I) to silver.');
add('Chemistry','Carboxylic Acids','Acidity','The conjugate base of a carboxylic acid is stabilized by:',['resonance','steric strain','loss of oxygen','hyperconjugation only'],0,'Carboxylate charge is delocalized.');
add('Chemistry','Amines','Basicity','Methylamine is generally more basic than ammonia because of:',['+I effect','−I effect','resonance loss','oxygen bonding'],0,'Methyl group increases electron density at nitrogen.');
add('Chemistry','Biomolecules','Carbohydrates','The principal storage polysaccharide in animals is:',['cellulose','glycogen','starch','chitin'],1,'Animals store glucose as glycogen.');
add('Chemistry','Polymers','Addition polymer','Polyethene is produced from:',['ethene','ethyne','benzene','ethanol'],0,'Ethene undergoes addition polymerisation.');
add('Chemistry','Environmental Chemistry','Ozone','Stratospheric ozone primarily absorbs:',['UV radiation','radio waves','sound waves','microwaves'],0,'Ozone absorbs harmful ultraviolet radiation.');
add('Chemistry','Nuclear Chemistry','Half-life',i=>'After '+(i+1)+' half-lives, the fraction left is:',i=>['1/'+(2**(i+1)),'1/'+(2**(i+2)),'1/2','0'],0,'Each half-life halves the remaining amount.',3);
add('Chemistry','Chemical Kinetics','Catalysis','A catalyst changes reaction rate by changing the:',['activation energy','equilibrium constant','enthalpy change','stoichiometric coefficients'],0,'A catalyst provides a lower-activation-energy pathway.');
add('Chemistry','Electrochemistry','Faraday law','One Faraday is approximately the charge carried by:',['one electron','one mole of electrons','one proton','one coulomb'],1,'One Faraday is the charge of one mole of electrons.');
add('Chemistry','Chemical Bonding','Dipole moment','In a symmetric molecule, bond dipoles can:',['reinforce infinitely','cancel to give zero net dipole','become ionic bonds','disappear individually'],1,'Symmetric vector dipoles can cancel.');
add('Chemistry','Solutions','Henry law','Solubility of a gas in a liquid generally increases with its:',['partial pressure','molar mass only','zero pressure','decreasing pressure'],0,'Henry’s law relates dissolved gas to partial pressure.');

add('Biology','Cell: The Unit of Life','Organelles','Ribosomes are primarily responsible for:',['lipid synthesis','protein synthesis','DNA replication','ATP storage'],1,'Ribosomes translate mRNA into polypeptides.');
add('Biology','Cell Cycle','Mitosis','Chromosomes align at the equatorial plate during:',['prophase','metaphase','anaphase','telophase'],1,'Metaphase shows equatorial alignment.');
add('Biology','Biomolecules','Enzymes','Most enzymes are chemically:',['lipids','proteins','carbohydrates','minerals'],1,'Most biological catalysts are proteins.');
add('Biology','Plant Physiology','Photosynthesis','The oxygen released during photosynthesis comes primarily from:',['CO₂','glucose','water','chlorophyll'],2,'Water is split during photolysis.');
add('Biology','Plant Physiology','Transport','The main force for ascent of sap in tall plants is:',['root pressure alone','transpiration pull','phloem pressure','diffusion of sugars'],1,'Cohesion-tension theory explains long-distance xylem transport.');
add('Biology','Plant Physiology','Respiration','Net ATP gain from glycolysis per glucose is:',['1','2','4','36'],1,'Four ATP are formed and two are consumed.');
add('Biology','Plant Reproduction','Double fertilization','Double fertilization is characteristic of:',['gymnosperms','angiosperms','bryophytes','pteridophytes'],1,'Angiosperms show syngamy and triple fusion.');
add('Biology','Human Physiology','Digestion','Pepsin acts mainly in the:',['mouth','stomach','small intestine','large intestine'],1,'Pepsin is active in the acidic stomach.');
add('Biology','Human Physiology','Breathing','Most CO₂ is transported in blood as:',['dissolved CO₂','carbaminohemoglobin','bicarbonate ions','oxygen'],2,'Most CO₂ is converted to bicarbonate.');
add('Biology','Human Physiology','Circulation','The natural pacemaker of the human heart is the:',['AV node','SA node','Purkinje fibres','bundle of His'],1,'The SA node initiates normal rhythm.');
add('Biology','Human Physiology','Excretion','Ultrafiltration of blood occurs in the:',['glomerulus','loop of Henle','collecting duct','ureter'],0,'Glomerular capillaries filter plasma.');
add('Biology','Human Physiology','Neural control','The neurotransmitter at the neuromuscular junction is:',['insulin','acetylcholine','thyroxine','ADH'],1,'Motor neurons release acetylcholine.');
add('Biology','Human Physiology','Endocrine','Insulin primarily promotes:',['glucose uptake and storage','glycogen breakdown','gluconeogenesis','glucagon release'],0,'Insulin lowers blood glucose and promotes storage.');
add('Biology','Human Reproduction','Menstrual cycle','Ovulation is triggered by a surge of:',['FSH only','LH','progesterone only','prolactin'],1,'The mid-cycle LH surge triggers ovulation.');
add('Biology','Human Reproduction','Fertilisation','Human fertilisation normally occurs near the:',['uterus','ampullary-isthmic junction','cervix','vagina'],1,'Fertilisation usually occurs at the ampullary-isthmic junction.');
add('Biology','Genetics','Mendelism','For Aa×Aa with complete dominance, the phenotypic ratio is:',['1:1','3:1','1:2:1','9:3:3:1'],1,'Genotype ratio 1:2:1 gives 3:1 phenotypes.');
add('Biology','Genetics','Molecular basis','The enzyme that joins Okazaki fragments is:',['helicase','DNA ligase','primase','RNA polymerase'],1,'DNA ligase seals DNA fragments.');
add('Biology','Genetics','Transcription','In eukaryotes, transcription primarily occurs in the:',['ribosome','nucleus','Golgi body','lysosome'],1,'Nuclear DNA is transcribed into RNA.');
add('Biology','Evolution','Natural selection','Natural selection acts directly on:',['phenotypes','species names','DNA sequence alone','genotypes only'],0,'Selection acts on phenotypic variation.');
add('Biology','Ecology','Population','A population consists of members of the same species living in:',['a defined area at a given time','different ecosystems only','the entire biosphere','one trophic level only'],0,'A population is defined by species, area and time.');
add('Biology','Ecology','Energy flow','A commonly used approximation for energy transfer to the next trophic level is:',['100%','10%','50%','90%'],1,'Only a small fraction, often approximated as 10%, is transferred.');
add('Biology','Ecology','Biodiversity','Species richness means:',['number of individuals','number of species','biomass','genetic similarity'],1,'Species richness is the number of species present.');
add('Biology','Microbes','Food production','Lactobacillus is commonly involved in making:',['curd','plastic','urea','oxygen'],0,'Lactobacillus converts lactose to lactic acid.');
add('Biology','Biotechnology','PCR','PCR is primarily used to:',['amplify DNA','translate proteins','digest lipids','count red cells'],0,'PCR amplifies a target DNA sequence.');
add('Biology','Biotechnology','Vectors','A plasmid carrying foreign DNA can function as a:',['vector','ribosome','codon','hormone'],0,'Plasmids are common cloning vectors.');
add('Biology','Biotechnology','Insulin','Recombinant human insulin is produced using:',['genetic engineering','photosynthesis','only animal tissues','osmosis'],0,'Recombinant DNA technology enables microbial insulin production.');
add('Biology','Biology in Human Welfare','Vaccines','Vaccination primarily generates:',['immune memory','red blood cells','digestive enzymes','bone cells'],0,'Vaccines stimulate adaptive immune memory.');
add('Biology','Plant Anatomy','Vascular tissue','Xylem mainly conducts:',['organic food','water and minerals','oxygen','hormones only'],1,'Xylem carries water and minerals.');
add('Biology','Morphology','Leaf','Stomata primarily regulate:',['gas exchange and transpiration','DNA replication','protein synthesis','seed colour'],0,'Stomata regulate gas exchange and water loss.');
add('Biology','Animal Kingdom','Chordates','A characteristic chordate feature is the:',['notochord at some stage','jointed exoskeleton','water vascular system','radula'],0,'Chordates possess a notochord at some stage.');
add('Biology','Structural Organisation','Connective tissue','Blood is classified as:',['muscular tissue','connective tissue','epithelial tissue','nervous tissue'],1,'Blood is a fluid connective tissue.');
add('Biology','Cell Cycle','Meiosis','Crossing over occurs during:',['prophase I','prophase of mitosis','metaphase II','telophase II'],0,'Crossing over occurs during pachytene of prophase I.');
add('Biology','Molecular Biology','Translation','A codon is present on:',['tRNA','mRNA','rRNA','DNA polymerase'],1,'mRNA carries codons.');
add('Biology','Plant Growth','Hormones','Auxin is strongly associated with:',['cell elongation','blood clotting','starch digestion','oxygen transport'],0,'Auxin promotes cell elongation.');

export const NEET_QUESTION_BANK={
 Physics:questions.filter(q=>q.subject==='Physics'),
 Chemistry:questions.filter(q=>q.subject==='Chemistry'),
 Biology:questions.filter(q=>q.subject==='Biology')
};
export function getStandardNEETQuestions(subject='Physics',chapter='All',count=5){
 let pool=subject==='All'||subject==='Full Syllabus'?questions:(NEET_QUESTION_BANK[subject]||NEET_QUESTION_BANK.Physics);
 if(chapter&&chapter!=='All'){const m=pool.filter(q=>q.chapter.toLowerCase()===chapter.toLowerCase());if(m.length)pool=m;}
 const target=Math.max(1,count||5),shuffled=[...pool].sort(()=>Math.random()-0.5);
 return Array.from({length:target},(_,i)=>{const q=shuffled[i%shuffled.length];return{id:i+1,yearTag:q.yearTag,chapter:q.chapter,question:formatMathSymbols(q.question),options:q.options.map(formatMathSymbols),correctAnswer:q.correctAnswer,explanation:formatMathSymbols(q.explanation)}});
}
