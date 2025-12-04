import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const SOUNDTRACKS = [
  { 
    id: 'espresso', 
    name: 'Espresso', 
    keywords: [
      'espresso', 'caffè', 'caffeina', 'energia', 'carica', 
      'sveglia', 'mattina', 'veloce', 'intenso', 'shot', 
      'that\'s that me espresso', 'vibe', 'buzz', 'forte', 'kick'
    ],
    weight: 1
  },
  { 
    id: 'please', 
    name: 'Please Please Please', 
    keywords: [
      'relazione', 'uomo', 'delusione', 'preoccupazione', 'ragazzo', 
      'deluso', 'delusa', 'please', 'ragazzi', 'uomini', 
      'fidanzato', 'boyfriend', 'litigare', 'chiamare', 'aspettare'
    ],
    weight: 3
  },
  { 
    id: 'nonsense', 
    name: 'Nonsense', 
    keywords: [
      'divertimento', 'scherzo', 'ridere', 'pazzia', 'silly', 
      'nonsense', 'funny', 'improvvisazioni', 'palco', 'divertente', 
      'haha', 'lol', 'stupido', 'assurdo', 'battuta'
    ],
    weight: 2
  },
  { 
    id: 'feather', 
    name: 'Feather', 
    keywords: [
      'libertà', 'liberarsi', 'addio', 'ex', 'finito', 'over', 
      'feather', 'icona', 'libera', 'meglio', 'senza', 
      'leggerezza', 'volare', 'finalmente'
    ],
    weight: 2
  },
  { 
    id: 'juno', 
    name: 'Juno', 
    keywords: [
      'amore', 'passione', 'romantico', 'cuore', 'sentimento', 
      'juno', 'innamorata', 'amo', 'ti amo', 'love', 
      'adoro', 'perfetto', 'magico', 'destino'
    ],
    weight: 2
  },
  { 
    id: 'because', 
    name: 'because i liked a boy', 
    keywords: [
      'drama', 'gossip', 'haters', 'giudicare', 'critiche', 
      'because', 'liked', 'boy', 'intensa', 'difficile', 
      'esperienza', 'scandalo', 'social', 'twitter'
    ],
    weight: 2
  },
  { 
    id: 'tears', 
    name: 'Tears', 
    keywords: [
      'piangere', 'lacrime', 'triste', 'malinconia', 'vulnerabile', 
      'tears', 'notte', 'silenzio', 'sola', 'ricordi', 
      'dolore', 'fragile', 'cuore spezzato', 'emozione', 'profondo'
    ],
    weight: 3
  },
  { 
    id: 'manchild', 
    name: 'Manchild', 
    keywords: [
      'manchild', 'immaturo', 'bambino', 'crescere', 'responsabilità', 
      'uomo grande', 'giocattoli', 'video games', 'mamma', 
      'aspettative', 'delusione', 'fare il grande', 'non cresce', 
      'playstation', 'comodo', 'comodità'
    ],
    weight: 3
  }
];

function selectSoundtrack(message: string, reply: string): string {
  const combinedText = (message + ' ' + reply).toLowerCase();
  
  let maxScore = 0;
  let selectedTrack = 'espresso';
  
  SOUNDTRACKS.forEach(track => {
    let score = 0;
    track.keywords.forEach(keyword => {
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
      const matches = (combinedText.match(regex) || []).length;
      score += matches * track.weight;
    });
    
    if (score > maxScore) {
      maxScore = score;
      selectedTrack = track.id;
    }
  });

  if (maxScore <= 1) {
    return 'nonsense';
  }
  
  return selectedTrack;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const systemPrompt = `Sei Sabrina Carpenter, la cantante e attrice americana. 
Rispondi sempre in modo autentico e personale, come se fossi davvero te.

PERSONALITÀ:
- Sei sicura di te, carismatica e un po' glamour, ma sempre gentile con i tuoi fan
- Usa un tono confidenziale e divertente, come se stessi parlando con un'amica/o
- Sii ironica, spiritosa e autoironica quando appropriato
- Mantieni un'energia positiva e coinvolgente

COME TI RELAZIONI CON I FAN:
- Sei genuinamente grata per il loro supporto e lo dimostri con calore
- Rispondi con entusiasmo e interesse sincero
- Usa emojis e un tono conversazionale quando si parla in modo casuale
- Sii empatica e comprensiva quando qualcuno condivide esperienze personali

RIFERIMENTI ALLE TUE CANZONI E CARRIERA:
- Menziona naturalmente le tue canzoni quando sono rilevanti: 
  "Espresso", "Please Please Please", "Nonsense", "Feather", 
  "because i liked a boy", "Juno", "Tears", "Manchild"
- Frasi iconiche:
  • "That's that me espresso" → quando parli di energia/confidenza
  • "He's a manchild, and he's having fun" → sulle relazioni immature
  • "I cry real tears" → su momenti vulnerabili o profondi
- Parla della tua evoluzione da Disney Channel a artista adulta con orgoglio
- Condividi aneddoti sul tuo percorso musicale e le tue esperienze

TEMI E MESSAGGI:
- Relazioni: indipendenza, autostima, non accontentarsi, riconoscere l'immaturità ("manchild")
- Vulnerabilità: è ok piangere ("Tears"), ma poi rialzarsi
- Empowerment: usa l'umorismo ("Nonsense") per superare il drama
- Crescita personale: lasciare andare ("Feather"), scegliere l'amore sano ("Juno")

TONO GENERALE:
- Sicura ma mai arrogante o maleducata
- Divertente e spiritosa senza essere offensiva
- Glamour e sofisticata ma accessibile
- Una diva con un cuore d'oro che ama i suoi fan

Ricorda: sei Sabrina nella sua era più sicura e autentica, che sa chi è e cosa vuole, ma che apprezza profondamente chi la supporta nel suo percorso.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Errore API Gemini');
    }

    const reply = data.candidates[0].content.parts[0].text;
    const soundtrack = selectSoundtrack(message, reply);
    
    return NextResponse.json({ reply, soundtrack });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Errore sconosciuto';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
