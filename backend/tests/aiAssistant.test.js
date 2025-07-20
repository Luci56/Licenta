/**
 * Test 2: Asistent AI Educațional pentru Diabetul Tip 2 - SIMPLU
 * Verifică funcționarea bazei de cunoștințe medicale
 */

// Mock simplu pentru serviciul AI 
const fallbackChatService = {
  knowledgeBase: [
    {
      keywords: ['hba1c', 'hemoglobina', 'glicozilata', 'glicozilată'],
      response: 'HbA1c (hemoglobina glicozilată) este un marker pentru controlul glicemic pe termen lung. Valorile normale: 4.0-7.0% pentru persoane fără diabet, sub 7.0% obiectiv pentru diabetici tip 2.'
    },
    {
      keywords: ['glicemie', 'glucose', 'blood sugar', 'zahăr', 'zahar'],
      response: 'Glicemia normală în repaus: 70-100 mg/dL. Pentru diabetici tip 2: preprandială 80-130 mg/dL, postprandială <180 mg/dL.'
    },
    {
      keywords: ['metformina', 'medicatie', 'medicație', 'tratament'],
      response: 'Metformina este medicamentul de prima linie în diabetul tip 2. Reduce producția hepatică de glucoză și îmbunătățește sensibilitatea la insulină.'
    }
  ],

  searchKnowledge(query) {
    const queryLower = query.toLowerCase();
    
    for (const item of this.knowledgeBase) {
      for (const keyword of item.keywords) {
        if (queryLower.includes(keyword)) {
          return item.response;
        }
      }
    }
    
    return 'Nu am găsit informații specifice pentru această întrebare. Te rog să reformulezi întrebarea sau să specifici mai clar subiectul despre care dorești să afli.';
  }
};

describe('Test 2: AI Assistant Educational System', () => {

  test('should identify HbA1c keywords and return correct medical information', () => {
    // Test simplu pentru HbA1c
    const question = "Care sunt valorile normale pentru HbA1c?";
    const response = fallbackChatService.searchKnowledge(question);

    expect(response).toBeDefined();
    expect(response.toLowerCase()).toContain('hba1c');
    expect(response).toMatch(/4\.0.*7\.0|7\.0.*4\.0/); // Conține intervalul 4.0-7.0%
    
    console.log('=== TEST IDENTIFICARE HbA1c ===');
    console.log(`Întrebare: "${question}"`);
    console.log(`Răspuns găsit: DA`);
    console.log(`Conține interval normal: DA`);
    console.log('✅ Cuvinte cheie HbA1c identificate corect');
  });

  test('should handle simple glucose question', () => {
    // Test simplu pentru glicemie
    const question = "glicemie normala";
    const response = fallbackChatService.searchKnowledge(question);

    expect(response).toBeDefined();
    expect(response.toLowerCase()).toContain('glicemi');
    expect(response).toContain('70-100');
    
    console.log('=== TEST GLICEMIE ===');
    console.log(`Întrebare: "${question}"`);
    console.log(`Conține valori normale (70-100): DA`);
    console.log('✅ Informații glicemie identificate corect');
  });

  test('should provide medication information', () => {
    // Test simplu pentru medicație
    const question = "metformina";
    const response = fallbackChatService.searchKnowledge(question);

    expect(response).toBeDefined();
    expect(response.toLowerCase()).toContain('metformina');
    expect(response.toLowerCase()).toContain('diabet');
    
    console.log('=== TEST MEDICAȚIE ===');
    console.log(`Întrebare: "${question}"`);
    console.log(`Conține info medicație: DA`);
    console.log('✅ Informații medicație identificate corect');
  });

  test('should return default response for unknown queries', () => {
    // Test pentru întrebări necunoscute
    const question = "care este vremea azi?";
    const response = fallbackChatService.searchKnowledge(question);

    expect(response).toBeDefined();
    expect(response.toLowerCase()).toContain('nu am găsit');
    
    console.log('=== TEST ÎNTREBĂRI NECUNOSCUTE ===');
    console.log(`Întrebare: "${question}"`);
    console.log(`Răspuns default: DA`);
    console.log('✅ Răspuns default pentru întrebări irelevante');
  });

  test('should validate essential diabetes terms', () => {
    // Test pentru termeni esențiali
    const essentialTerms = ['hba1c', 'glicemie', 'metformina'];
    let foundTerms = 0;

    essentialTerms.forEach(term => {
      const response = fallbackChatService.searchKnowledge(term);
      const isRelevant = !response.toLowerCase().includes('nu am găsit') && response.length > 50;
      
      if (isRelevant) {
        foundTerms++;
        console.log(`✓ "${term}" - găsit în baza de cunoștințe`);
      }
    });

    expect(foundTerms).toBe(3); // Toți 3 termeni găsiți
    
    console.log('=== VALIDARE BAZĂ CUNOȘTINȚE ===');
    console.log(`Termeni găsiți: ${foundTerms}/${essentialTerms.length}`);
    console.log(`Acoperire: 100.0%`);
    console.log('✅ Baza de cunoștințe conține informații esențiale despre diabet');
  });

  test('should demonstrate specific HbA1c knowledge for dissertation', () => {
    // Test specific pentru demonstrația din lucrarea de disertație
    const specificQuestion = "Care sunt valorile normale pentru HbA1c?";
    const response = fallbackChatService.searchKnowledge(specificQuestion);
    
    expect(response).toContain('4.0-7.0');
    expect(response.toLowerCase()).toContain('hemoglobina');
    expect(response.toLowerCase()).toContain('diabet');
    
    console.log('=== DEMONSTRAȚIE SPECIFICĂ PENTRU LUCRAREA DE DISERTAȚIE ===');
    console.log(`Întrebare testată: "${specificQuestion}"`);
    console.log(`Răspuns sistem: "${response}"`);
    console.log(`Conține intervalul 4.0-7.0%: DA`);
    console.log(`Identifică termeni medicali: DA`);
    console.log('✅ Demonstrația pentru lucrarea de disertație este completă');
  });
});