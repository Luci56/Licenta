/**
 * Enhanced fallback chat service for diabetes management chatbot
 * Comprehensive knowledge base of information about Type 2 Diabetes
 */

// Extensive database of questions and answers about Type 2 Diabetes
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
    response: 'Principalele diferențe între diabetul de tip 1 și tip 2: Diabetul tip 1 este autoimun, când sistemul imunitar atacă celulele pancreatice producătoare de insulină, apare de obicei în copilărie/adolescență, necesită insulină pentru supraviețuire. Diabetul tip 2 implică rezistență la insulină și/sau producție insuficientă de insulină, apare de obicei la adulți (deși crește și la tineri), este adesea legat de obezitate și stil de viață, poate fi gestionat prin dietă, exerciții și medicație, uneori necesitând insulină în stadii avansate.'
  },
  {
    keywords: ['prediabet', 'prediabetic', 'prediabetes'],
    response: 'Prediabetul este o afecțiune în care nivelul glicemiei este mai ridicat decât normal, dar nu suficient de ridicat pentru a fi diagnosticat ca diabet de tip 2. Indicatorii includ: glicemie a jeun de 100-125 mg/dL (glicemie bazală modificată), OGTT la 2 ore de 140-199 mg/dL (intoleranță la glucoză), sau HbA1c de 5.7-6.4%. Prediabetul este un semnal de alarmă serios, dar prin modificări ale stilului de viață (scădere în greutate, activitate fizică regulată și alimentație sănătoasă), se poate preveni sau întârzia progresia către diabetul de tip 2.'
  },

  // GLICEMIE (BLOOD SUGAR) MONITORING AND MANAGEMENT
  {
    keywords: ['glicemie', 'blood sugar', 'blood glucose', 'nivel', 'level', 'valori', 'normale', 'normal'],
    response: 'Valorile normale ale glicemiei sunt: a jeun (pe stomacul gol): 70-99 mg/dL, înainte de masă: 70-130 mg/dL, la 1-2 ore după masă: sub 180 mg/dL. Pentru persoanele cu diabet, obiectivele pot fi personalizate de medic în funcție de vârstă, durata diabetului, complicații și alte condiții medicale. Monitorizarea regulară a glicemiei este esențială pentru a verifica eficacitatea tratamentului și a preveni complicațiile.'
  },
  {
    keywords: ['monitorizare', 'monitoring', 'masurare', 'măsurare', 'measuring', 'glucometru', 'glucose meter'],
    response: 'Monitorizarea glicemiei la persoanele cu diabet tip 2 poate include: 1) Automonitorizarea glicemiei (SMBG) cu glucometru - recomandată de câteva ori pe zi pentru cei care folosesc insulină, sau mai puțin frecvent pentru cei care folosesc doar medicație orală, 2) Monitorizarea continuă a glicemiei (CGM) - dispozitive care măsoară glicemia la fiecare câteva minute prin intermediul unui senzor subcutanat, 3) Testul HbA1c la fiecare 3-6 luni pentru a evalua controlul glicemic pe termen lung. Frecvența optimă a testării trebuie stabilită împreună cu echipa medicală.'
  },
  {
    keywords: ['hba1c', 'hemoglobina', 'glicozilată', 'glycosylated', 'a1c'],
    response: 'HbA1c (hemoglobina glicozilată) măsoară procentul de hemoglobină din sânge care are glucoză atașată, reflectând nivelul mediu al glicemiei din ultimele 2-3 luni. Pentru persoanele fără diabet, valorile normale sunt sub 5.7%. Pentru cei cu diabet, obiectivul general este sub 7%, dar poate fi personalizat: mai strict (sub 6.5%) pentru persoane tinere fără complicații, sau mai relaxat (sub 8%) pentru vârstnici sau cei cu complicații severe. Fiecare reducere de 1% a HbA1c reduce riscul de complicații microvasculare cu aproximativ 25-35%.'
  },
  {
    keywords: ['hipoglicemie', 'low blood sugar', 'glicemie scăzută', 'hypoglycemia'],
    response: 'Hipoglicemia (glicemia sub 70 mg/dL) poate cauza: tremur, transpirații, palpitații, nervozitate, slăbiciune, amețeli, confuzie, dificultăți de concentrare, vedere încețoșată, și în cazuri severe, convulsii și pierderea conștienței. Tratamentul implică regula "15-15": consumați 15g de carbohidrați rapizi (ex. 4 tablete de glucoză, 120 ml suc de fructe, 1 lingură de miere), așteptați 15 minute, verificați glicemia, și repetați dacă este încă sub 70 mg/dL. Dacă hipoglicemiile sunt frecvente, discutați cu medicul despre ajustarea tratamentului.'
  },
  {
    keywords: ['hiperglicemie', 'high blood sugar', 'glicemie ridicată', 'hyperglycemia'],
    response: 'Hiperglicemia (glicemia crescută) poate cauza: sete excesivă, urinare frecventă, oboseală, vedere încețoșată, cefalee, dificultăți de concentrare. Cauzele pot include: alimentație excesivă, activitate fizică insuficientă, stres, boală, medicație inadecvată sau insuficientă. Gestionarea pe termen scurt include: hidratare adecvată, monitorizare mai frecventă a glicemiei, administrarea medicației conform prescripției și testarea cetonelor urinare dacă glicemia depășește 250 mg/dL. Hiperglicemia persistentă necesită consultarea medicului pentru ajustarea planului de tratament.'
  },
  {
    keywords: ['cum scad glicemia', 'lower blood sugar', 'reduce blood glucose', 'scădere', 'reducere'],
    response: 'Pentru a reduce glicemia: 1) Pe termen imediat: activitate fizică moderată (15-30 minute de mers), hidratare adecvată, administrarea medicației conform prescripției. 2) Pe termen lung: alimentație echilibrată cu accent pe controlul porțiilor de carbohidrați, activitate fizică regulată (minim 150 minute/săptămână), menținerea greutății sănătoase, gestionarea stresului, somn adecvat (7-8 ore/noapte), monitorizarea regulată a glicemiei și ajustarea tratamentului sub supravegherea medicului. Nu reduceți medicația fără consult medical!'
  },

  // DIET AND NUTRITION
  {
    keywords: ['alimentație', 'alimentatie', 'dietă', 'dieta', 'diet', 'mâncare', 'mancare', 'food'],
    response: 'O alimentație echilibrată pentru diabetul tip 2 include: 1) Controlul porțiilor, în special de carbohidrați, 2) Alegerea carbohidraților complecși cu indice glicemic scăzut (cereale integrale, leguminoase, legume), 3) Consumul de proteine slabe (pește, pui fără piele, lactate degresate, leguminoase), 4) Limitarea grăsimilor saturate și trans, optând pentru grăsimi nesaturate (ulei de măsline, avocado, nuci), 5) Consumul abundent de legume non-amidonoase, 6) Moderația în consumul de fructe, optând pentru cele cu conținut mai scăzut de zahăr, 7) Limitarea alcoolului, 8) Reducerea sodiului, 9) Evitarea alimentelor procesate și băuturilor îndulcite.'
  },
  {
    keywords: ['carbohidrați', 'carbohidrati', 'carbohydrates', 'carbs', 'indice glicemic', 'glycemic index'],
    response: 'Carbohidrații au cel mai mare impact asupra glicemiei. Recomandări: 1) Numărarea carbohidraților - 45-60g per masă principală și 15-20g per gustare pentru multe persoane (personalizat cu nutriționist), 2) Alegeți carbohidrați cu indice glicemic scăzut (sub 55) - care cresc glicemia mai lent (ex: cereale integrale, leguminoase, majoritatea fructelor și legumelor), 3) Distribuiți carbohidrații uniform în timpul zilei, 4) Combinați carbohidrații cu proteine și grăsimi sănătoase pentru a încetini absorbția, 5) Fibrele alimentare (25-30g/zi) ajută la încetinirea absorbției glucozei și îmbunătățirea controlului glicemic.'
  },
  {
    keywords: ['alimente de evitat', 'foods to avoid', 'ce să nu mănânc', 'ce sa nu mananc'],
    response: 'Alimente recomandat a fi evitate sau limitate în diabetul tip 2: 1) Zahărul rafinat și produsele cu zahăr adăugat (băuturi îndulcite, dulciuri, deserturi), 2) Carbohidrații rafinați (pâine albă, orez alb, paste din făină albă), 3) Alimente procesate (mezeluri, alimente semi-preparate, gustări ambalate), 4) Grăsimi saturate și trans (carne grasă, produse de patiserie, mâncăruri prăjite), 5) Băuturi alcoolice în exces, 6) Fructe uscate și sucuri de fructe concentrate, 7) Iaurt cu fructe și zahăr adăugat, cereale îndulcite. Citiți etichetele alimentare pentru a identifica zahărul și carbohidrații ascunși.'
  },
  {
    keywords: ['alimente recomandate', 'foods to eat', 'recommended foods', 'ce să mănânc', 'ce sa mananc'],
    response: 'Alimente benefice pentru diabetul tip 2: 1) Legume non-amidonoase (broccoli, spanac, roșii, ardei), 2) Proteine slabe (pui fără piele, pește, tofu, ouă), 3) Grăsimi sănătoase (avocado, ulei de măsline, nuci, semințe), 4) Carbohidrați complecși (cereale integrale, leguminoase), 5) Fructe cu conținut redus de zahăr (mere, pere, fructe de pădure), 6) Lactate degresate, 7) Condimente precum scorțișoară și turmeric care pot ajuta la controlul glicemiei, 8) Alimente bogate în crom (broccoli, cereale integrale) și magneziu (spanac, nuci) care susțin metabolismul glucozei.'
  },

  // PHYSICAL ACTIVITY AND EXERCISE
  {
    keywords: ['activitate fizică', 'activitate fizica', 'exerciții', 'exercitii', 'physical activity', 'exercise', 'sport'],
    response: 'Activitatea fizică regulată în diabetul tip 2: 1) Crește sensibilitatea la insulină și îmbunătățește controlul glicemic, 2) Reduce riscul cardiovascular, 3) Ajută la gestionarea greutății, 4) Îmbunătățește starea de spirit și reduce stresul. Recomandări: minim 150 minute/săptămână de activitate aerobică moderată (ex: mers rapid) sau 75 minute/săptămână de activitate intensă, distribuite în minim 3 zile/săptămână, fără mai mult de 2 zile consecutive fără activitate. Includeți și 2-3 sesiuni/săptămână de exerciții de rezistență. Începeți gradual și creșteți treptat durata și intensitatea. Consultați medicul înainte de a începe un program nou, mai ales dacă aveți complicații.'
  },
  {
    keywords: ['exerciții recomandate', 'exercitii recomandate', 'recommended exercises', 'ce sport'],
    response: 'Exerciții benefice pentru diabetul tip 2: 1) Activități aerobice - mers rapid, înot, ciclism, dans, tenis, clase de aerobic de impact redus. 2) Exerciții de rezistență - antrenament cu greutăți, benzi elastice, exerciții cu greutatea corporală (flotări, genuflexiuni). 3) Antrenament de flexibilitate - yoga, pilates, stretching. 4) Activități de echilibru - tai chi, yoga. Ideal este un program complet care include toate tipurile. Pentru începători: mersul este cel mai accesibil - începeți cu 10 minute/zi și creșteți gradual până la 30 minute. Pentru persoanele cu neuropatie periferică: exerciții fără impact precum înotul, ciclismul staționar sau exerciții din poziția șezând.'
  },

  // MEDICATION AND TREATMENT
  {
    keywords: ['medicament', 'medicație', 'medicatie', 'medication', 'treatment', 'tratament', 'pastile', 'pills', 'drug'],
    response: 'Opțiuni de tratament pentru diabetul tip 2: 1) Metformin - de obicei prima linie de tratament, reduce producția hepatică de glucoză și îmbunătățește sensibilitatea la insulină. 2) Inhibitori SGLT-2 (ex: empagliflozin) - previn reabsorbția glucozei în rinichi. 3) Agoniști GLP-1 (ex: semaglutide) - stimulează secreția de insulină și reduc apetitul. 4) Inhibitori DPP-4 (ex: sitagliptin) - cresc nivelurile de GLP-1. 5) Sulfoniluree (ex: glimepiride) - stimulează secreția de insulină. 6) Tiazolidindione (ex: pioglitazone) - îmbunătățesc sensibilitatea la insulină. 7) Insulină - necesară în stadii avansate. Medicația este individualizată în funcție de vârstă, durată a diabetului, comorbidități, cost și preferințe.'
  },
  {
    keywords: ['insulină', 'insulina', 'insulin'],
    response: 'Insulinoterapia în diabetul tip 2: 1) Indicații - când medicația orală și injectabilă non-insulinică nu mai controlează glicemia, în timpul bolilor acute sau intervențiilor chirurgicale, în sarcină, sau temporar la debut când glicemia este foarte ridicată. 2) Tipuri - bazală/cu acțiune îndelungată (ex: glargine, detemir), prandială/cu acțiune rapidă (ex: lispro, aspart), premixată. 3) Administrare - injecții subcutanate sau pompe de insulină. 4) Titrare - doza este ajustată în funcție de glicemia a jeun pentru insulina bazală și glicemia postprandială pentru insulina prandială. 5) Riscuri - hipoglicemie (mai ales la vârstnici), creștere în greutate. 6) Educație - tehnică de injecție, recunoașterea și gestionarea hipoglicemiei.'
  },

  // COMPLICATIONS AND COMORBIDITIES
  {
    keywords: ['complicații', 'complicatii', 'complications', 'efecte pe termen lung', 'long term effects'],
    response: 'Complicațiile diabetului tip 2 includ: 1) Microvasculare - retinopatie (afectarea vederii), nefropatie (afectarea rinichilor, potential insuficiență renală), neuropatie (dureri, pierderea sensibilității, probleme digestive/urinare/sexuale). 2) Macrovasculare - boală coronariană, accident vascular cerebral, boală arterială periferică. 3) Alte - probleme dentare, infecții ale pielii, sindrom de tunel carpian, disfuncție erectilă, apnee de somn, steatoză hepatică non-alcoolică. 4) Piciorul diabetic - combinație de neuropatie și ischemie, ducând la ulcerații și potențiale amputații. Controlul glicemic riguros, tensiunii arteriale și colesterolului, împreună cu un stil de viață sănătos pot preveni sau întârzia semnificativ apariția acestor complicații.'
  },

  // LIVING WITH DIABETES
  {
    keywords: ['auto-îngrijire', 'auto-ingrijire', 'self-care', 'self care', 'monitorizare', 'monitoring'],
    response: 'Auto-îngrijirea în diabetul tip 2: 1) Componentele de bază - monitorizarea glicemiei, administrarea medicației, alimentație sănătoasă, activitate fizică regulată, îngrijirea picioarelor, gestionarea stresului, vizite medicale regulate. 2) Monitorizarea glicemiei - frecvența variază în funcție de tratament și stabilitatea controlului glicemic; notarea valorilor și identificarea tiparelor este esențială. 3) Aderența la medicație - crucial pentru prevenirea complicațiilor; utilizarea dozatorelor, alarmelor, aplicațiilor pentru telefon poate ajuta. 4) Plan personalizat - dezvoltat împreună cu echipa medicală, cu obiective realizabile pe termen scurt. 5) Tehnici de modificare comportamentală - stabilirea de obiective SMART, auto-monitorizare, recompense pentru comportamente sănătoase.'
  },
  {
    keywords: ['viața cu diabet', 'viata cu diabet', 'living with diabetes', 'adaptare', 'adaptation', 'acceptare', 'acceptance'],
    response: 'Adaptarea la viața cu diabetul tip 2: 1) Acceptarea diagnosticului - proces care poate dura, nu există un interval de timp "corect" pentru adaptare. 2) Educație - înțelegerea bolii reduce anxietatea și oferă sentiment de control; programele structurate de educație îmbunătățesc controlul glicemic. 3) Rutina - integrarea îngrijirii diabetului în viața de zi cu zi prin crearea de obiceiuri și rutine sustenabile. 4) Implicarea familiei - suportul familiei și prietenilor este crucial; educați persoanele apropiate despre diabet. 5) Echilibru - găsiți echilibrul între îngrijirea diabetului și bucuria vieții; perfecțiunea nu este necesară sau realistă. 6) Flexibilitate - învățați să adaptați managementul diabetului la diferite situații (călătorii, mese festive, stres).'
  },
  {
    keywords: ['psihologic', 'psychological', 'mental', 'stres', 'stress', 'depresie', 'depression', 'anxietate', 'anxiety'],
    response: 'Aspecte psihologice în diabetul tip 2: 1) Impactul diagnostic - șoc, negare, furie, tristețe, anxietate, acceptare (etape variabile). 2) Distresul legat de diabet - presiunea auto-îngrijirii constante, teama de complicații, stigmatizare. 3) Comorbidități psihiatrice - prevalență crescută a depresiei (2x față de populația generală), anxietății, tulburărilor de alimentație. 4) Efecte bidirecționale - stresul și depresia înrăutățesc controlul glicemic, iar hiperglicemia afectează negativ starea mentală. 5) Screening - evaluare regulată pentru depresie, anxietate, tulburări de alimentație. 6) Intervenții - terapie cognitiv-comportamentală, mindfulness, suport social, uneori medicație antidepresivă. 7) Importanța echipei multidisciplinare - inclusiv psiholog/psihiatru. 8) Grupuri de suport - beneficiu dovedit pentru îmbunătățirea controlului glicemic și stării psihologice.'
  }
];

// Additional generic responses when no specific match is found
const genericResponses = [
  'Pentru această întrebare specifică despre diabetul de tip 2, vă recomand să consultați medicul diabetolog. Fiecare pacient are nevoi unice care necesită sfaturi personalizate.',
  'Aceasta este o întrebare interesantă despre diabet. Din păcate, nu am suficiente informații pentru a oferi un răspuns complet. Vă sugerez să discutați cu medicul dvs. specialist.',
  'Gestionarea diabetului de tip 2 implică o abordare personalizată. Este important să colaborați îndeaproape cu echipa medicală pentru sfaturi adaptate situației dumneavoastră specifice.',
  'Întrebarea dvs. necesită o evaluare personalizată. Vă recomand să notați această întrebare și să o adresați la următoarea vizită medicală pentru cel mai bun sfat specific situației dumneavoastră.',
  'Diabetul de tip 2 este o afecțiune complexă care afectează fiecare persoană diferit. Pentru informații personalizate, consultați medicul specialist sau un educator în diabet certificat.',
  'Ca asistent virtual, pot oferi informații generale despre diabetul de tip 2, dar nu pot înlocui sfatul medical profesionist. Pentru situația dumneavoastră specifică, vă rog să consultați echipa medicală.'
];

// Responses for basic conversational exchanges
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
 * Find the best matching response based on keywords
 * @param {string} message - User's message
 * @returns {string|null} - Response message or null if no match found
 */
function findLocalResponse(message) {
  // Convert message to lowercase for case-insensitive matching
  const messageLower = message.toLowerCase();
  
  // Check for conversational inputs first
  if (/buna|salut|hello|hi|hey|ceau|bună ziua|ziua|neata/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.greeting.length);
    return conversationalResponses.greeting[randomIndex];
  }
  
  if (/multumesc|mersi|thanks|thank you|multam|mulțumesc/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.thanks.length);
    return conversationalResponses.thanks[randomIndex];
  }
  
  if (/la revedere|pa|bye|goodbye|ciao|adio|pe curand|pe curând/i.test(messageLower)) {
    const randomIndex = Math.floor(Math.random() * conversationalResponses.goodbye.length);
    return conversationalResponses.goodbye[randomIndex];
  }
  
  if (/ajuta|ajutor|help|comenzi|ce pot intreba|ce știi|ce stii|despre ce|cum functionezi|cum funcționezi/i.test(messageLower)) {
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
 * Get a generic fallback response
 * @returns {string} - Generic response
 */
function getGenericFallback() {
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}

module.exports = {
  findLocalResponse,
  getGenericFallback
};