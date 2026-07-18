export interface PresetVerse {
  id: string;
  reference: string;
  query: string;
  title: string;
  description: string;
  category: "Cristologia" | "Criação" | "Soteriologia" | "Eclesiologia" | "Profecia";
}

export const PRESET_VERSES: PresetVerse[] = [
  {
    id: "joao-1-1",
    reference: "João 1:1",
    query: "João 1:1",
    title: "O Logos Divino",
    description: "O início do Evangelho de João e o conceito de Logos. Debate sobre a divindade de Jesus, a Trindade e a filosofia grega vs hebraica.",
    category: "Cristologia"
  },
  {
    id: "genesis-1-1",
    reference: "Gênesis 1:1",
    query: "Gênesis 1:1",
    title: "A Criação do Cosmo",
    description: "A origem do universo. 'Bereshit' no hebraico e o debate sobre a criação do nada (ex nihilo) vs matéria eterna.",
    category: "Criação"
  },
  {
    id: "romanos-9-15",
    reference: "Romanos 9:15",
    query: "Romanos 9:15",
    title: "Soberania e Misericórdia",
    description: "O texto-chave da predestinação. Misericórdia de quem Deus quer ter misericórdia — debate sobre calvinismo, livre arbítrio e sinergismo.",
    category: "Soteriologia"
  },
  {
    id: "tiago-2-24",
    reference: "Tiago 2:24",
    query: "Tiago 2:24",
    title: "Fé e Obras",
    description: "A justificação humana. Conflito central da Reforma Protestante: o luterano 'somente pela fé' versus a cooperação de fé e obras católico-ortodoxa.",
    category: "Soteriologia"
  },
  {
    id: "isaias-53-5",
    reference: "Isaías 53:5",
    query: "Isaías 53:5",
    title: "O Servo Sofredor",
    description: "Um dos textos mais polêmicos entre judeus e cristãos. Quem é o servo ferido pelas nossas transgressões? Jesus ou a própria nação de Israel?",
    category: "Profecia"
  },
  {
    id: "mateus-16-18",
    reference: "Mateus 16:18",
    query: "Mateus 16:18",
    title: "A Pedra e a Igreja",
    description: "A autoridade espiritual. Quem é a 'Pedra'? Pedro como primeiro Papa (católico), a confissão de Pedro (protestante), ou a fé ortodoxa?",
    category: "Eclesiologia"
  }
];
