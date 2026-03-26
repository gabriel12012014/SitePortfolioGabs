// ==========================================
// DADOS DO PORTFÓLIO
// Para adicionar um novo projeto, basta copiar
// um dos blocos delimitados por chaves {} e colar no final da lista,
// alterando os dados e imagens.
// ==========================================

export const projects = [
  {
    id: 'gerador_lolla_26',
    title: 'g1 - Gerador de Posts Lollapalooza 2026',
    category: 'Desenvolvimento',
    date: 'Março 2026',
    imageUrl: './images/gerador_1.png',
    tags: ['Desenvolvimento', 'Design'],
    description: 'Desenvolvimento de uma solução proprietária para a redação do g1, permitindo que jornalistas criem posts para redes sociais diretamente pelo navegador, com autonomia e agilidade, sem a necessidade de softwares externos ou intervenção direta da equipe de design. O sistema foi construído com foco em eficiência operacional, utilizando um fluxo de trabalho avançado de desenvolvimento assistido por IA, integrando o Gemini no Antigravity e o ChatGPT Codex no VS Code para a estruturação da lógica e da interface, garantindo uma ferramenta intuitiva que preserva a identidade visual da marca em larga escala.',
    credits: '<strong>Design e Desenvolvimento:</strong> Gabs',
    mediaImages: [
      './videos/gerador-post-lollapalooza.mp4',
      './images/gerador_1.png',
      './images/gerador_2.png'
    ],
    projectLink: '#'
  },
  {
    id: 'lolla_26',
    title: 'g1 - ID Lollapalooza 2026',
    category: 'Design',
    date: 'Março 2026',
    imageUrl: './images/lolla_1.jpg',
    tags: ['Design'],
    description: 'Desenvolvimento integral do pacote gráfico para a cobertura do Lollapalooza 2026 no g1, envolvendo a criação de um key visual exclusivo que harmoniza as identidades visuais de ambas as marcas. O projeto incluiu o desdobramento completo de peças para redes sociais e transmissões, como thumbnails, GCs, backgrounds e templates, garantindo uma unidade visual consistente e dinâmica para o consumo de conteúdo em tempo real durante todo o evento.',
    credits: '<strong>Design e Identidade Visual:</strong> Gabs',
    mediaImages: [
      './images/lolla_1.jpg',
      './images/lolla_2.jpg',
      './images/lolla_3.jpg',
      './images/lolla_4.jpg',
      './images/lolla_5.jpg',
      './images/lolla_6.jpg',
      './images/lolla_7.jpg',
      './images/lolla_8.jpg',
      './images/lolla_9.jpg',
      './images/lolla_10.jpg'
    ],
    projectLink: '#'
  },
  {
    id: 'nobreza_amor',
    title: 'gshow - A Nobreza do Amor',
    category: 'Design',
    date: 'Março 2026',
    imageUrl: './images/nobreza_1.png',
    tags: ['Design', 'Desenvolvimento'],
    description: 'Desenvolvimento integral da página oficial de A Nobreza do Amor para o Gshow, abrangendo desde a concepção do design UI/UX até a implementação do front-end. O projeto centraliza as informações e o conteúdo da trama de forma intuitiva, utilizando um fluxo de trabalho otimizado no Visual Studio Code com o auxílio de IA (ChatGPT Codex) para garantir uma estrutura de código eficiente e uma experiência de navegação fluida para o público.',
    credits: '<strong>Design e Desenvolvimento:</strong> Gabs <br/><br/> <strong>Auxílio de desenvolvimento e design:</strong> Gui Sousa e Juan Silva <br/><br/> <strong>COORDENAÇÃO DE DESIGN E DESENVOLVIMENTO:</strong> Guilherme Gomes',
    mediaImages: [
      './images/nobreza_1.png',
      './images/nobreza_2.png',
      './images/nobreza_3.png',
      './images/nobreza_4.jpg'
    ],
    projectLink: '#'
  },
  {
    id: 'enki',
    title: 'Enki',
    category: 'Jogos',
    date: 'Junho 2024',
    imageUrl: './images/enki_1.png',
    tags: ['Jogos', 'Ilustracao', 'Design'],
    description: 'Desenvolvido como projeto do segundo semestre de Jogos Digitais no Senac Santo Amaro, este é um game focado em narrativa que coloca o jogador na pele de Paki, um cientista em busca de redenção e desfecho após a perda de sua família. A jornada solitária percorre um mundo apocalíptico submerso, com todo o desenvolvimento realizado no Construct 3. Fui responsável pela criação integral do projeto, incluindo o design de níveis e a produção de toda a pixel art de personagens e cenários, utilizando Photoshop e Aseprite para garantir uma estética visual melancólica e imersiva.',
    credits: '<strong>Ilustração personagens Textbox:</strong> Vitor Pereira <br/><br/> <strong>História e Roteiro:</strong> Gabriel Rocha, Guilherme Rocha e Vitor Pereira',
    mediaImages: [
      './images/enki_1.png',
      './images/enki_2.png',
      './images/enki_3.png',
      './images/enki_4.png'
    ],
    projectLink: 'https://putsgabs.itch.io/enki'
  },
  {
    id: 'samba',
    title: 'g1 - Monte sua Roda de Samba',
    category: 'Jogos',
    date: 'Fevereiro 2024',
    imageUrl: './images/samba_1.png',
    tags: ['Jogos', 'Ilustracao', 'Design'],
    description: 'Para essa matéria, foi desenvolvido um jogo onde o jogador podia criar sua própria Roda de Samba. O jogador escolhia entre os instrumentos disponíveis e os colocava sobre os personagens, que então acordavam e começavam a tocar.<br/><br/>Todo o desenvolvimento do jogo foi feito por mim. As ilustrações e interfaces (UI) foram criadas no Adobe Illustrator, seguindo a identidade visual do Carnaval de 2024 do G1. O jogo foi programado utilizando o Construct 3.<br/><br/>Os personagens do jogo são figuras importantes do samba de São Paulo, com o objetivo de homenageá-las e também apresentá-las ao jogador.',
    credits: '<strong>Auxílio com ilustração:</strong> Dhara Assis <br/><br/> <strong>COORDENAÇÃO DE DESIGN E DESENVOLVIMENTO:</strong> Guilherme Gomes',
    mediaImages: [
      './images/samba_1.png',
      './images/samba_2.png',
      './images/samba_3.png',
      './images/samba_4.png',
      './images/samba_5.png'
    ],
    projectLink: 'https://g1.globo.com/sp/sao-paulo/carnaval/2024/noticia/2024/02/09/rodas-de-sampa-com-publico-renovado-samba-se-espalha-por-sp-seduz-jovens-e-levanta-discussao-sobre-respeito-as-tradicoes.ghtml'
  }
];

export const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Design', value: 'Design' },
  { label: 'Ilustração', value: 'Ilustracao' },
  { label: 'Desenvolvimento', value: 'Desenvolvimento' },
  { label: 'Jogos', value: 'Jogos' }
];
