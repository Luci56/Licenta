/**
 * Baza de cunoștințe cuprinzătoare despre diabetul de tip 2
 * Conține peste 30 de intrări organizate pe categorii: informații generale, 
 * gestionarea glicemiei, HbA1c, dieta, exercițiile, medicația, complicațiile,
 * monitorizarea și aspectele psihologice ale diabetului
 * 
 * Fiecare intrare conține:
 * - keywords: array de cuvinte cheie pentru identificarea subiectului
 * - response: răspunsul detaliat și informativ în română
 * 
 * @type {Array<Object>} Array de obiecte cu structura {keywords: string[], response: string}
 */

const knowledgeBase = [
  // GENERAL DIABETES INFORMATION
  {
    keywords: ['diabet', 'tip 2', 'type 2', 'ce este', 'what is'],
    response: 'Diabetul de tip 2 este o afecțiune cronică în care organismul devine rezistent la insulină sau nu produce suficientă insulină pentru a menține niveluri normale de glucoză în sânge. Spre deosebire de diabetul de tip 1 (o afecțiune autoimună), tipul 2 este adesea asociat cu factorii de stil de viață, inclusiv excesul de greutate și lipsa activității fizice. Este cea mai comună formă de diabet, reprezentând aproximativ 90% din toate cazurile de diabet.'
  },
  {
    keywords: ['cauze', 'cauzele', 'causes', 'risk factors', 'factori de risc', 'de ce'],
    response: 'Cauzele diabetului de tip 2 sunt complexe și implică factori genetici și de mediu. Factorii de risc includ: istoricul familial, excesul de greutate (în special grăsimea abdominală), vârsta înaintată (peste 45 ani), sedentarismul, hipertensiunea arterială, niveluri anormale de colesterol, antecedente de diabet gestațional, sindromul ovarelor polichistice și originea etnică (afro-americanii, hispanicii, americanii nativi și asiatico-americanii au risc mai mare).'
  },
  {
    keywords: ['simptome', 'semne', 'symptoms', 'signs'],
    response: 'Simptomele diabetului de tip 2 pot include: sete crescută și urinare frecventă, oboseală severă, vedere încețoșată, vindecare lentă a rănilor, infecții frecvente, furnicături sau amorțeală în mâini sau picioare, și pete întunecate pe piele (acantoză nigricans). Mulți oameni pot avea diabet de tip 2 pentru ani de zile fără simptome sau cu simptome atât de ușoare încât trec neobservate.'
  },
  {
    keywords: ['diagnostic', 'diagnosticare', 'diagnosing', 'teste', 'tests', 'depistare'],
    response: 'Diagnosticarea diabetului de tip 2 implică mai multe teste: 1) Testul glicemiei a jeun (FPG) - glicemia măsurată după post de cel puțin 8 ore, diabet dacă este ≥126 mg/dL, 2) Testul de toleranță la glucoză orală (OGTT) - glicemia măsurată la 2 ore după consumul unei soluții concentrate de glucoză, diabet dacă este ≥200 mg/dL, 3) Testul hemoglobinei glicozilate (HbA1c) - reflectă nivelul mediu al glicemiei în ultimele 2-3 luni, diabet dacă este ≥6.5%, 4) Test aleatoriu al glicemiei ≥200 mg/dL cu simptome de diabet.'
  },
  {
    keywords: ['diferență', 'diferenta', 'tip 1', 'tip 2', 'difference', 'type 1'],
    response: 'Principalele diferențe între diabetul de tip 1 și tip 2: Diabetul tip 1 este autoimun, când sistemul imunitar atacă celulele pancreatice producătoare de insulină, apare de obicei în copilărie/adolescență, necesită insulină pentru supraviețuire. Diabetul tip 2 este o afecțiune metabolică legată de rezistența la insulină, apare de obicei după 40 ani, poate fi gestionat prin dieta, exerciții și medicamente orale.'
  },
  
  // BLOOD GLUCOSE MANAGEMENT
  {
    keywords: ['glicemi', 'glucoz', 'zahar', 'sange', 'normal', 'valori', 'limite', 'nivel'],
    response: 'Valorile normale ale glicemiei sunt: a jeun (pe stomacul gol): 70-99 mg/dL, înainte de masă: 70-130 mg/dL, la 1-2 ore după masă: sub 180 mg/dL. Pentru persoanele cu diabet, obiectivele pot fi personalizate de medic în funcție de vârstă, durata diabetului, complicații și alte condiții medicale. Monitorizarea regulată a glicemiei este esențială pentru a verifica eficacitatea tratamentului și a preveni complicațiile.'
  },
  {
    keywords: ['monitorizare', 'monitoring', 'glucometru', 'testare', 'masurare'],
    response: 'Monitorizarea glicemiei la domiciliu este esențială în gestionarea diabetului tip 2. Frecvența recomandată variază: pentru cei cu insulină - 2-4 ori/zi, pentru cei cu medicamente orale - 1-2 ori/zi sau conform indicațiilor medicului. Momentele optime de testare includ: dimineața a jeun, înainte de mese, la 2 ore după mese, și înainte de culcare. Țineți un jurnal cu valorile pentru a identifica tiparele și a discuta cu medicul.'
  },
  {
    keywords: ['hipoglicemi', 'hipoglicemie', 'scazut', 'low blood sugar', 'zaharul mic'],
    response: 'Hipoglicemia (glicemia scăzută sub 70 mg/dL) poate fi periculoasă. Simptome: tremurături, transpirație, palpitații, foame, confuzie, iritabilitate. Tratament imediat: 15-20g glucoză rapidă (3-4 tablete de glucoză, 120ml suc de fructe, 1 lingură miere). Retestați după 15 min. Dacă persistă, repetați tratamentul. Contactați medicul dacă episoadele sunt frecvente. Purtați întotdeauna cu voi o sursă de glucoză rapidă.'
  },
  {
    keywords: ['hiperglicemi', 'hiperglicemie', 'ridicat', 'high blood sugar', 'zaharul mare'],
    response: 'Hiperglicemia (glicemia >180 mg/dL după masă sau >130 mg/dL a jeun) poate indica un control inadecvat al diabetului. Simptome: sete crescută, urinare frecventă, oboseală, vedere încețoșată. Cauze posibile: uitarea medicației, mâncare în exces, stres, boală, medicații. Măsuri imediate: verificați glicemia, beți apă, luați medicația conform prescripției, contactați medicul dacă valorile rămân ridicate >250 mg/dL sau dacă apar simptome severe.'
  },

  // HbA1c INFORMATION
  {
    keywords: ['hba1c', 'hemoglobina glicozilata', 'hemoglobina glicosilata'],
    response: 'HbA1c (hemoglobina glicozilată) reflectă nivelul mediu al glicemiei în ultimele 2-3 luni. Valori normale: 4.0-5.6%, prediabet: 5.7-6.4%, diabet: ≥6.5%. Pentru persoanele cu diabet de tip 2, obiectivul general este <7%, dar poate fi personalizat între 6.5-8% în funcție de vârstă, comorbidități și risc de hipoglicemie. Testul se repetă la 3-6 luni pentru a evalua eficacitatea tratamentului și a face ajustări necesare.'
  },
  {
    keywords: ['control glicemic', 'controlul diabetului', 'gestionarea diabetului'],
    response: 'Controlul glicemic optim în diabetul tip 2 necesită o abordare comprehensivă: 1) HbA1c <7% (personalizat), 2) Glicemia a jeun 80-130 mg/dL, 3) Glicemia postprandială <180 mg/dL, 4) Tensiunea arterială <140/90 mmHg (sau <130/80 pentru unii), 5) LDL-colesterol <100 mg/dL (sau <70 pentru risc cardiovascular înalt). Monitorizarea regulată și ajustarea tratamentului sunt esențiale pentru atingerea acestor obiective.'
  },

  // DIET AND NUTRITION
  {
    keywords: ['dieta', 'alimentatie', 'mancare', 'nutritie', 'diet', 'food', 'nutrition'],
    response: 'Dieta pentru diabetul tip 2 se bazează pe principii sănătoase de alimentație: 1) Carbohidrați complecși (cereale integrale, legume, fructe cu fibre), 2) Proteine slabe (pește, pasăre, leguminoase), 3) Grăsimi sănătoase (nuci, avocado, ulei de măsline), 4) Limitarea zahărurilor simple și alimentelor procesate, 5) Porții controlate și mesele regulate, 6) Hidratare adecvată. Consultați un nutriționist pentru un plan personalizat adaptat nevoilor dumneavoastră.'
  },
  {
    keywords: ['carbohidrati', 'carbohidrați', 'carbs', 'carbohydrates', 'amidon'],
    response: 'Carbohidrații au cel mai mare impact asupra glicemiei. Recomandări: 1) Preferați carbohidrați complecși (cereale integrale, quinoa, ovăz), 2) Includeți fibre (minimum 25-30g/zi), 3) Evitați zahărurile simple și dulciurile, 4) Folosiți metoda plăcii (1/2 legume, 1/4 proteine, 1/4 carbohidrați), 5) Monitorizați glicemia după mese pentru a vedea impactul alimentelor. Numărarea carbohidraților poate fi utilă - consultați un educator în diabet pentru învățarea acestei tehnici.'
  },
  {
    keywords: ['fructe', 'fruits', 'dulciuri naturale'],
    response: 'Fructele sunt permise în diabetul tip 2, dar cu moderație și alegeri inteligente: 1) Preferați fructe cu indice glicemic scăzut (mere, pere, cireșe, fructe de pădure), 2) Evitați fructele cu zahăr mare (struguri, banane foarte coapte, ananas), 3) Consumați fructe întregi, nu sucuri, 4) Limitați la 2-3 porții/zi, 5) Combinați cu proteine sau grăsimi sănătoase pentru a încetini absorbția zahărului. O porție = un fruct mediu sau 1/2 cană fructe tăiate.'
  },
  {
    keywords: ['legume', 'vegetables', 'salata', 'verdeturi'],
    response: 'Legumele sunt fundamentale în dieta pentru diabet - au puține calorii, multe fibre și nutrienți esențiali: 1) Legume cu amidon redus (spanac, broccoli, conopidă, ardei) - consumați nelimitat, 2) Legume cu amidon moderat (morcovi, sfeclă) - porții moderate, 3) Legume cu amidon ridicat (cartofi, porumb) - porții mici, combinate cu proteine, 4) Varietate de culori pentru nutrienți diverși, 5) Gătire sănătoasă (abur, grătar, cuptor) fără grăsimi excesive.'
  },

  // EXERCISE AND PHYSICAL ACTIVITY  
  {
    keywords: ['exercitii', 'exerciții', 'sport', 'activitate fizica', 'miscare', 'exercise'],
    response: 'Exercițiile fizice sunt esențiale în gestionarea diabetului tip 2: 1) Activitate aerobă moderată - 150 min/săptămână (30 min, 5 zile), 2) Exerciții de rezistență - 2-3 sesiuni/săptămână, 3) Începeți treptat și creșteți intensitatea progresiv, 4) Monitorizați glicemia înainte și după exerciții, 5) Hidratare adecvată, 6) Purtați încălțăminte comodă. Beneficii: îmbunătățește sensibilitatea la insulină, scade glicemia, ajută la controlul greutății și reduce riscul cardiovascular.'
  },
  {
    keywords: ['plimbare', 'mers', 'walking', 'mersul pe jos'],
    response: 'Mersul pe jos este unul dintre cele mai accesibile și eficiente exerciții pentru diabetul tip 2: 1) Începeți cu 10-15 minute zilnic și creșteți treptat, 2) Ținta: 10.000 pași/zi sau 30-45 minute de mers rapid, 3) După mese, o plimbare de 10-15 minute poate reduce vârful glicemic, 4) Folosiți încălțăminte comodă și verificați picioarele zilnic, 5) Variați traseele pentru a menține motivația. Chiar și plimbări scurte au beneficii semnificative asupra controlului glicemic.'
  },

  // MEDICATIONS
  {
    keywords: ['metformina', 'metformin', 'glucophage'],
    response: 'Metformina este medicamentul de primă linie pentru diabetul tip 2: 1) Mecanism: reduce producția de glucoză hepatică și îmbunătățește sensibilitatea la insulină, 2) Administrare: de obicei 2-3 ori/zi cu masa pentru a reduce efectele gastrice, 3) Efecte secundare comune: greață, diaree, disconfort abdominal (de obicei temporare), 4) Contraindicații: boala renală severă, insuficiența hepatică, 5) Beneficii adiționale: poate ajuta la pierderea în greutate, reduce riscul cardiovascular. Nu încetați medicația fără consultarea medicului.'
  },
  {
    keywords: ['insulina', 'insulin', 'injectii', 'injecții'],
    response: 'Insulina poate fi necesară în diabetul tip 2 avansat sau când alte medicamente nu sunt suficiente: 1) Tipuri: acțiune rapidă, intermediară, prelungită, 2) Administrare: subcutană cu seringi, stilouri sau pompe, 3) Rotația locurilor de injecție pentru a preveni lipodistrofia, 4) Monitorizare frecventă a glicemiei, 5) Ajustarea dozelor conform indicațiilor medicului, 6) Atenție la risc de hipoglicemie. Învățați recunoașterea și tratamentul hipoglicemiei. Nu modificați dozele fără supraveghere medicală.'
  },
  {
    keywords: ['medicamente', 'medicatie', 'pastile', 'tratament', 'pills'],
    response: 'Medicamentele pentru diabetul tip 2 includ mai multe clase: 1) Metformina (prima linie), 2) Sulfoniluree (stimulează secreția de insulină), 3) Inhibitori DPP-4 (îmbunătățesc controlul glicemic), 4) Agonisti GLP-1 (injectabili, reduc greutatea), 5) Inhibitori SGLT-2 (elimină glucoza prin urină), 6) Insulină (când este necesară). Fiecare are beneficii și efecte secundare specifice. Luați medicația conform prescripției, la ore fixe, și nu întrerupeți tratamentul fără consultarea medicului.'
  },

  // COMPLICATIONS
  {
    keywords: ['complicatii', 'complicații', 'complications', 'probleme'],
    response: 'Complicațiile diabetului tip 2 pot fi prevenite prin control glicemic optim: 1) Complicații microvasculare: retinopatia diabetică (ochii), nefropatia diabetică (rinichii), neuropatia diabetică (nervii), 2) Complicații macrovasculare: boala coronariană, accidentul vascular cerebral, boala arterială periferică, 3) Piciorul diabetic: ulcere, infecții, 4) Prevenție: HbA1c <7%, tensiune controlată, colesterol optim, examinări regulate. Detectarea și tratamentul precoce pot preveni progresarea complicațiilor.'
  },
  {
    keywords: ['ochi', 'vedere', 'retinopatie', 'oftalmolog'],
    response: 'Retinopatia diabetică este o complicație serioasă care afectează retina ochilor: 1) Factori de risc: durata diabetului, controlul glicemic slab, hipertensiunea, 2) Simptome timpurii: adesea absente, 3) Simptome avansate: vedere încețoșată, pete în câmpul vizual, pierderea vederii, 4) Prevenție: control strict al glicemiei și tensiunii arteriale, 5) Screening: examen oftalmologic anual cu dilatarea pupilelor, 6) Tratament: laser, injecții intravitreene, chirurgie. Nu ignorați modificările de vedere - consultați oftalmologul imediat.'
  },
  {
    keywords: ['rinichi', 'nefropatie', 'urina', 'nefrolog'],
    response: 'Nefropatia diabetică afectează rinichii și poate progresa la insuficiență renală: 1) Screening: testarea anuală a albuminei urinare și creatininei serice, 2) Stadii: de la microalbuminurie la insuficiența renală terminală, 3) Prevenție: control optim al glicemiei (HbA1c <7%) și tensiunii arteriale (<130/80), 4) Medicație: inhibitori ACE sau ARB pentru protecție renală, 5) Dieta: restricția proteinelor și sodiului în stadii avansate, 6) Evitați medicamentele nefrotoxice. Monitorizarea regulată poate depista problemele timpuriu când tratamentul este cel mai eficient.'
  },
  {
    keywords: ['picioare', 'piciorul diabetic', 'neuropatie', 'amorteala'],
    response: 'Piciorul diabetic rezultă din neuropatia și problemele circulatorii: 1) Simptome neuropatice: amorțeală, furnicături, durere sau pierderea senzației, 2) Probleme vasculare: circulație slabă, vindecare lentă, 3) Prevenție: control glicemic optim, inspecția zilnică a picioarelor, igienă corespunzătoare, încălțăminte comodă, 4) Îngrijire: spălați și uscați bine picioarele, hidratați pielea, tăiați unghiile drept, 5) Atenție: orice rană, ulcer sau infecție necesită îngrijire medicală imediată. Nu umblați desculți și verificați încălțămintea pentru obiecte străine.'
  },

  // MONITORING AND CHECKUPS
  {
    keywords: ['controale', 'analize', 'checkup', 'investigatii', 'investigații'],
    response: 'Controalele regulate sunt esențiale în diabetul tip 2: 1) La medic: la 3-6 luni pentru evaluarea controlului și ajustarea tratamentului, 2) HbA1c: la 3-6 luni, 3) Lipide: anual sau mai frecvent dacă anormal, 4) Funcția renală: anual (creatinină, uree, microalbuminurie), 5) Examen oftalmologic: anual, 6) Examen podiatric: anual sau mai frecvent dacă risc înalt, 7) Tensiunea arterială: la fiecare vizită, 8) Vaccinurile: gripa anual, pneumococul conform recomandărilor. Respectarea programului de monitorizare poate preveni complicațiile.'
  },

  // LIFESTYLE MANAGEMENT
  {
    keywords: ['stil de viata', 'lifestyle', 'obiceiuri', 'rutina'],
    response: 'Un stil de viață sănătos este fundamental în gestionarea diabetului tip 2: 1) Alimentația echilibrată și porții controlate, 2) Activitate fizică regulată (minimum 150 min/săptămână), 3) Menținerea greutății optime, 4) Gestionarea stresului (relaxare, meditație, hobby-uri), 5) Somnul adequate (7-8 ore/noapte), 6) Evitarea fumatului și limitarea alcoolului, 7) Luarea medicației conform prescripției, 8) Monitorizarea regulată a glicemiei. Micile schimbări constante au impact mare asupra controlului diabetului pe termen lung.'
  },
  {
    keywords: ['greutate', 'slabire', 'obezitate', 'weight loss'],
    response: 'Pierderea în greutate este benefică în diabetul tip 2: 1) Obiectiv realist: 5-10% din greutatea corporală poate îmbunătăți semnificativ controlul glicemic, 2) Strategii: deficit caloric moderat (500-750 cal/zi), combinarea dietei cu exercițiile, 3) Progres gradual: 0.5-1 kg/săptămână, 4) Monitorizare: cântărirea săptămânală, măsurarea circumferinței taliei, 5) Suport: nutriționist, grup de suport, familie, 6) Menținerea: planuri pe termen lung pentru a preveni reîngrijarea. Consultați echipa medicală pentru un plan personalizat de scădere în greutate.'
  },
  {
    keywords: ['stres', 'stress', 'anxietate', 'relaxare'],
    response: 'Stresul poate afecta negativ controlul glicemic prin eliberarea hormonilor de stres: 1) Efecte: creșterea glicemiei, modificarea apetitului, neglijarea auto-îngrijirii, 2) Semnale: iritabilitate, oboseală, tulburări de somn, modificări alimentare, 3) Gestionare: tehnici de relaxare (respirația profundă, meditația), exerciții fizice regulate, hobby-uri plăcute, timp pentru odihnă, 4) Suport social: familie, prieteni, grupuri de suport, 5) Ajutor profesional: psiholog, consilier dacă stresul devine copleșitor. Învățarea gestionării stresului îmbunătățește calitatea vieții și controlul diabetului.'
  },
  {
    keywords: ['somn', 'sleep', 'insomnie', 'odihnă'],
    response: 'Somnul de calitate este important pentru controlul diabetului: 1) Durata optimă: 7-8 ore/noapte pentru majoritatea adulților, 2) Efectele lipsei de somn: creșterea rezistenței la insulină, modificarea hormonilor apetitului, stres crescut, 3) Igiena somnului: program regulat de culcare/trezire, evitarea cafeinei seara, cameră întunecată și răcoroasă, evitarea ecranelor înainte de culcare, 4) Probleme comune: apneea de somn (mai frecventă la diabetici), sindromul picioarelor neliniștite, 5) Ajutor medical: consultați medicul dacă aveți probleme persistente de somn.'
  },

  // PSYCHOLOGICAL ASPECTS
  {
    keywords: ['psihologic', 'psychological', 'mental', 'stres', 'stress', 'depresie', 'depression', 'anxietate', 'anxiety'],
    response: 'Aspecte psihologice în diabetul tip 2: 1) Impactul diagnostic - șoc, negare, furie, tristețe, anxietate, acceptare (etape variabile). 2) Distresul legat de diabet - presiunea auto-îngrijirii constante, teama de complicații, stigmatizare. 3) Comorbidități psihiatrice - prevalență crescută a depresiei (2x față de populația generală), anxietății, tulburărilor de alimentație. 4) Efecte bidirecționale - stresul și depresia înrăutățesc controlul glicemic, iar hiperglicemia afectează negativ starea mentală. 5) Screening - evaluare regulată pentru depresie, anxietate, tulburări de alimentație. 6) Intervenții - terapie cognitiv-comportamentală, mindfulness, suport social, uneori medicație antidepresivă. 7) Importanța echipei multidisciplinare - inclusiv psiholog/psihiatru. 8) Grupuri de suport - beneficiu dovedit pentru îmbunătățirea controlului glicemic și stării psihologice.'
  }
];

/**
 * Răspunsuri generice folosite când nu se găsește match specific în baza de cunoștințe
 * Mesaje care îndrumă utilizatorul să consulte medicul pentru sfaturi personalizate
 * @type {string[]} Array de răspunsuri de fallback
 */

const genericResponses = [
  'Pentru această întrebare specifică despre diabetul de tip 2, vă recomand să consultați medicul diabetolog. Fiecare pacient are nevoi unice care necesită sfaturi personalizate.',
  'Aceasta este o întrebare interesantă despre diabet. Din păcate, nu am suficiente informații pentru a oferi un răspuns complet. Vă sugerez să discutați cu medicul dvs. specialist.',
  'Gestionarea diabetului de tip 2 implică o abordare personalizată. Este important să colaborați îndeaproape cu echipa medicală pentru sfaturi adaptate situației dumneavoastră specifice.',
  'Întrebarea dvs. necesită o evaluare personalizată. Vă recomand să notați această întrebare și să o adresați la următoarea vizită medicală pentru cel mai bun sfat specific situației dumneavoastră.',
  'Diabetul de tip 2 este o afecțiune complexă care afectează fiecare persoană diferit. Pentru informații personalizate, consultați medicul specialist sau un educator în diabet certificat.',
  'Ca asistent virtual, pot oferi informații generale despre diabetul de tip 2, dar nu pot înlocui sfatul medical profesionist. Pentru situația dumneavoastră specifică, vă rog să consultați echipa medicală.'
];

/**
 * Răspunsuri pentru interacțiuni conversaționale de bază
 * Organizate pe categorii: salutări, mulțumiri, rămas bun, cereri de ajutor
 * @type {Object} Obiect cu arrays de răspunsuri pentru fiecare tip de interacțiune
 */
const conversationalResponses = {
  greeting: [
    'Bună ziua! Sunt asistentul virtual pentru informații despre diabetul de tip 2. Cu ce vă pot ajuta astăzi?',
    'Bine ați venit! Sunt aici pentru a oferi informații despre gestionarea diabetului de tip 2. Ce întrebări aveți?',
    'Salut! Sunt asistentul virtual specializat în diabetul de tip 2. Cum vă pot ajuta astăzi?',
    'Bună! Sunt aici pentru a răspunde întrebărilor despre diabetul de tip 2. Ce doriți să aflați?'
  ],
  thanks: [
    'Cu plăcere! Sunt aici să vă ajut cu informații despre gestionarea diabetului. Există altceva despre care doriți să aflați?',
    'Mă bucur că am putut ajuta! Aveți alte întrebări despre diabetul de tip 2?',
    'Cu plăcere! Scopul meu este să ofer informații utile despre diabetul de tip 2. Mai pot ajuta cu ceva?',
    'Oricând! Dacă mai aveți întrebări despre diabetul de tip 2, nu ezitați să întrebați.'
  ],
  goodbye: [
    'La revedere! Reveniți oricând aveți întrebări despre diabet. Vă doresc o zi bună și sănătate!',
    'O zi bună vă doresc! Sunt aici dacă mai aveți întrebări despre gestionarea diabetului în viitor.',
    'La revedere! Vă doresc succes în gestionarea diabetului. Nu uitați importanța monitorizării regulate și a stilului de viață sănătos.',
    'Toate cele bune! Reveniți oricând aveți nevoie de informații despre diabetul de tip 2.'
  ],
  help: [
    'Pot răspunde la o varietate de întrebări despre diabetul de tip 2, inclusiv despre: simptome, tratamente, alimentație, exerciții fizice, monitorizarea glicemiei, complicații și prevenție. Ce anume vă interesează?',
    'Sunt aici pentru a oferi informații despre diabetul de tip 2. Puteți întreba despre management zilnic, medicamente, diete recomandate, exerciții, complicații sau orice alt aspect al diabetului care vă preocupă.'
  ]
};

/**
 * Context simplu pentru urmărirea conversației curente
 * Stochează cuvintele cheie și topicul din ultimele mesaje pentru răspunsuri contextuale
 * @type {Object} Obiect cu keywords array și topic string
 */
let lastContext = { keywords: [], topic: null };

/**
 * Normalizează mesajul utilizatorului pentru procesare mai bună
 * Corectează greșeli comune de scriere și formatare
 * @param {string} message - Mesajul original al utilizatorului
 * @returns {string} - Mesajul normalizat și curățat
 */
function normalizeMessage(message) {
  return message
    .toLowerCase()
    .replace(/\bke\b/g, 'că')           
    .replace(/menţin/g, 'mențin')       
    .trim();
}

/**
/**
 * Verifică dacă mesajul reprezintă o intenție de rămas bun
 * Folosește verificare contextuală pentru a evita false positive (ex: "pai" vs "pa")
 * @param {string} messageLower - Mesajul normalizat în lowercase
 * @returns {boolean} - True dacă este intenție de goodbye, false altfel
 */
function isGoodbyeIntent(messageLower) {
  // Pattern-uri clare de goodbye
  const strictGoodbyes = /\b(la revedere|bye|goodbye|ciao|adio|pe curând)\b/i;
  if (strictGoodbyes.test(messageLower)) return true;
  
  // Pentru "pa" - verifică dacă nu face parte din alte cuvinte sau construcții
  const paPattern = /\bpa\b/i;
  if (paPattern.test(messageLower)) {
    // Dacă conține cuvinte de continuare, probabil nu e goodbye
    const continuationWords = /\b(și|si|cum|ce|spune|explica|vreau|pot|trebuie|dar|sau|mai|încă|inca)\b/i;
    if (continuationWords.test(messageLower)) {
      return false; // Nu e goodbye
    }
    return true; // E goodbye
  }
  
  return false;
}

/**
 * Actualizează contextul conversației pe baza istoricului recent
 * Extrage cuvinte cheie și topicul principal din ultimele mesaje
 * @param {Array} chatHistory - Istoricul mesajelor recente din conversație
 */
function updateSimpleContext(chatHistory) {
  if (!chatHistory || chatHistory.length === 0) return;
  
  const keywords = [];
  let topic = null;
  
  // Ia ultimele 3-4 mesaje pentru context
  const recent = chatHistory.slice(-4);
  
  recent.forEach(msg => {
    if (msg.content) {
      const content = normalizeMessage(msg.content);
      
      // Caută cuvinte cheie importante
      if (content.includes('glicemi') || content.includes('zahar')) {
        keywords.push('glicemi');
        topic = 'glicemia';
      }
      if (content.includes('hba1c')) {
        keywords.push('hba1c');
        topic = 'hba1c';
      }
      if (content.includes('mentin') || content.includes('mențin')) {
        keywords.push('mentin');
      }
    }
  });
  
  lastContext = { keywords: [...new Set(keywords)], topic };
}

/**
 * Încearcă să găsească un răspuns contextual pentru întrebări de follow-up
 * Folosește contextul conversației pentru a înțelege întrebări incomplete
 * @param {string} message - Mesajul utilizatorului
 * @returns {string|null} - Răspuns contextual sau null dacă nu se găsește
 */
function tryContextualResponse(message) {
  if (!lastContext.topic) return null;
  
  const normalized = normalizeMessage(message);
  
  // Pattern pentru întrebări de tip "cum să mențin" cu context anterior despre glicemie
  if (/\b(cum|ce|spune.*cum|explica.*cum).*(mentin|mențin|tin|păstrez|control)/i.test(normalized)) {
    if (lastContext.topic === 'glicemia' || lastContext.keywords.includes('glicemi')) {
      return 'Pentru menținerea glicemiei în limite normale recomand: 1) Alimentație echilibrată cu carbohidrați complecși și fibre, 2) Exerciții fizice regulate (30 min/zi), 3) Administrarea corectă a medicației conform prescripției, 4) Monitorizarea zilnică a glicemiei, 5) Gestionarea stresului prin tehnici de relaxare, 6) Somn regulat (7-8 ore). Colaborați cu medicul pentru un plan personalizat adaptat nevoilor dumneavoastră.';
    }
  }
  
  return null;
}

/**
 * Găsește cel mai bun răspuns din baza de cunoștințe locală
 * Procesează mesajul prin pattern matching și keyword analysis
 * @param {string} message - Mesajul utilizatorului
 * @returns {string|null} - Răspunsul găsit sau null dacă nu există match
 */
function findLocalResponse(message) {
  // Convert message to lowercase for case-insensitive matching
  const messageLower = normalizeMessage(message); // MODIFICAT: folosește normalizare
  
  // Check for conversational inputs first
  if (/\b(buna|salut|hello|hi|hey|ceau|bună ziua|ziua|neata)\b/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.greeting.length);
    return conversationalResponses.greeting[randomIndex];
  }
  
  if (/\b(multumesc|mersi|thanks|thank you|multam|mulțumesc)\b/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.thanks.length);
    return conversationalResponses.thanks[randomIndex];
  }
  
  // MODIFICAT: Verificare îmbunătățită pentru goodbye
  if (isGoodbyeIntent(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.goodbye.length);
    return conversationalResponses.goodbye[randomIndex];
  }
  
  if (/\b(ajuta|ajutor|help|comenzi|ce pot intreba|ce știi|ce stii|despre ce|cum functionezi|cum funcționezi)\b/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.help.length);
    return conversationalResponses.help[randomIndex];
  }
  
  // Check each entry in knowledge base for keyword matches
  let bestMatches = [];
  let highestMatchCount = 0;
  
  for (const entry of knowledgeBase) {
    let matchCount = 0;
    
    for (const keyword of entry.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatches = [entry];
      } else if (matchCount === highestMatchCount) {
        bestMatches.push(entry);
      }
    }
  }
  
  // Return most relevant response if found
  if (bestMatches.length > 0) {
    // If multiple entries have the same match count, choose one randomly
    const randomIndex = Math.floor(Math.random() * bestMatches.length);
    return bestMatches[randomIndex].response;
  }
  
  return null; // No local match found
}

/**
 * Versiune avansată care folosește contextul conversației pentru răspunsuri mai precise
 * Încearcă mai întâi răspunsuri contextuale, apoi fallback la baza de cunoștințe
 * @param {string} message - Mesajul utilizatorului
 * @param {Array} chatHistory - Istoricul conversației pentru context (opțional)
 * @returns {string|null} - Răspunsul găsit sau null dacă nu există match
 */
function findLocalResponseWithContext(message, chatHistory = []) {
  // Actualizează contextul simplu
  updateSimpleContext(chatHistory);
  
  // Încearcă răspuns contextual pentru follow-up
  const contextualResponse = tryContextualResponse(message);
  if (contextualResponse) return contextualResponse;
  
  // Fallback la funcția originală
  return findLocalResponse(message);
}

/**
 * Returnează un răspuns generic când nu se găsește match specific
 * Selectează aleatoriu dintr-o colecție de răspunsuri generale despre diabet
 * @returns {string} - Răspuns generic de fallback
 */
function getGenericFallback() {
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

module.exports = {
  findLocalResponse,
  findLocalResponseWithContext,
  getGenericFallback
};