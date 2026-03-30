// ==========================================
// DADOS DO PORTFÓLIO
// Para adicionar um novo projeto, basta copiar
// um dos blocos delimitados por chaves {} e colar no final da lista,
// alterando os dados e imagens.
// ==========================================

export const projects = [
  {
    id: 'mortes_2025',
    title: 'g1 - As mortes que marcaram 2025',
    category: 'Desenvolvimento Web',
    date: 'Dezembro 2025',
    imageUrl: './public/images/mortes_1.webp',
    tags: ['Design', 'Desenvolvimento Web'],
    description: 'Página especial interativa do g1 homenageando as personalidades que nos deixaram em 2025. O projeto traz uma navegação elegante e respeitosa, estruturando o conteúdo cronologicamente com filtros por mês.',
    credits: '<strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/videos/mortes-2025.mp4',
      './public/images/mortes_1.webp',
      './public/images/mortes_2.webp',
      './public/images/mortes_3.webp',
      './public/images/mortes_4.webp'
    ],
    projectLink: 'https://g1.globo.com/retrospectiva/2025/mortes-do-ano/'
  },
  {
    id: 'gerador_lolla_26',
    title: 'g1 - Gerador de Posts Lollapalooza 2026',
    category: 'Desenvolvimento Web',
    date: 'Março 2026',
    imageUrl: './public/images/gerador_1.webp',
    tags: ['Desenvolvimento Web', 'Design'],
    description: 'Desenvolvimento de uma solução para a redação do g1, permitindo que jornalistas criem posts para redes sociais diretamente pelo navegador, com autonomia e agilidade, sem a necessidade de softwares externos ou intervenção direta da equipe de design. O sistema foi construído com foco em eficiência operacional, utilizando um fluxo de trabalho avançado de desenvolvimento assistido por IA, integrando o Gemini no Antigravity e o ChatGPT Codex no VS Code para a estruturação da lógica e da interface, garantindo uma ferramenta intuitiva que preserva a identidade visual da marca em larga escala.',
    credits: '<strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/videos/gerador-post-lollapalooza.mp4',
      './public/images/gerador_1.webp',
      './public/images/gerador_2.webp'
    ],
    projectLink: '#'
  },
  {
    id: 'vinhedo',
    title: 'g1 - Desastre em Vinhedo',
    category: 'Desenvolvimento Web',
    date: 'Agosto 2025',
    imageUrl: './public/images/vinhedo_1.webp',
    tags: ['Design', 'Desenvolvimento Web'],
    description: 'Projeto desenvolvido para o G1 em memória ao primeiro ano do acidente aéreo em Vinhedo. O trabalho envolveu a criação da identidade visual e a programação da página, realizada através do Antigravity com auxílio do Gemini.',
    credits: '<strong>Design:</strong> Gui Sousa e Luisa Rivas <br/> <strong>Edição de vídeo e motion design:</strong> Gui Sousa <br/> <strong>3D:</strong> Álvaro Galdino, Anderson Guedes, Anderson Silva, Gui Sousa, Raymundo Oliveira, Renan Oliveira e Rodrigo Buzzettoo <br/> <strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/videos/vinhedo.mp4',
      './public/images/vinhedo_1.webp',
      './public/images/vinhedo_2.webp',
      './public/images/vinhedo_3.webp',
      './public/images/vinhedo_4.webp'
    ],
    projectLink: 'https://g1.globo.com/sp/campinas-regiao/voepass-acidente-aviao-vinhedo/'
  },
  {
    id: 'foco_crush',
    title: 'Foco No Crush',
    category: 'Game Design',
    date: 'Junho 2025',
    imageUrl: './public/images/foco_1.webp',
    tags: ['Design', 'Ilustração', 'Game Design'],
    description: 'Foco No Crush foi um jogo desenvolvido para a Game Jam do Senac em junho de 2025. Com o tema "Orgulho", o projeto foi concluído em apenas uma semana. Eu realizei toda a programação utilizando o Construct 3, além de criar a identidade visual completa e todos os elementos de UI do jogo.',
    credits: '<strong>Ilustração e 3D:</strong> Pablo Gutierrez <br> <strong>Programação:</strong> Vinicius Rosendo',
    mediaImages: [
      './public/videos/foco-no-crush.mp4',
      './public/images/foco_1.webp',
      './public/images/foco_2.webp',
      './public/images/foco_3.webp',
      './public/images/foco_4.webp',
      './public/images/foco_5.webp',
      './public/images/foco_6.webp'
    ],
    projectLink: 'https://putsgabs.itch.io/foco-no-crush'
  },
  {
    id: 'rosa',
    title: 'Compartilhe sua Rosa',
    category: 'Desenvolvimento Web',
    date: 'Dezembro 2025',
    imageUrl: './public/images/rosa_2.webp',
    tags: ['Design', 'Desenvolvimento Web'],
    description: 'Desenvolvido em colaboração com Gui Sousa, o projeto finaliza uma proposta inicialmente apresentada a um cliente. A página permite o envio personalizado de uma rosa virtual do cantor Roberto Carlos, acompanhada de uma mensagem e trilha sonora. A programação foi realizada utilizando o framework Antigravity com auxílio do Gemini.',
    credits: '<strong>3D:</strong> Gui Sousa',
    mediaImages: [
      './public/videos/rosa.mp4',
      './public/images/rosa_1.webp',
      './public/images/rosa_2.webp',
      './public/images/rosa_3.webp'
    ],
    projectLink: '#'
  },
  {
    id: 'samba',
    title: 'g1 - Monte sua Roda de Samba',
    category: 'Game Design',
    date: 'Fevereiro 2024',
    imageUrl: './public/images/samba_1.webp',
    tags: ['Game Design', 'Ilustração', 'Design'],
    description: 'Projeto interativo desenvolvido para o G1 como parte da cobertura do Carnaval 2024. O jogo permite que o usuário crie sua própria roda de samba: ao arrastar instrumentos para os personagens, eles "despertam" e iniciam a performance musical.',
    credits: '<strong>Auxílio com ilustração:</strong> Dhara Assis <br/> <strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/images/samba_1.webp',
      './public/images/samba_2.webp',
      './public/images/samba_3.webp',
      './public/images/samba_4.webp',
      './public/images/samba_5.webp'
    ],
    projectLink: 'https://g1.globo.com/sp/sao-paulo/carnaval/2024/noticia/2024/02/09/rodas-de-sampa-com-publico-renovado-samba-se-espalha-por-sp-seduz-jovens-e-levanta-discussao-sobre-respeito-as-tradicoes.ghtml'
  },
  {
    id: 'lolla_26',
    title: 'g1 - ID Lollapalooza 2026',
    category: 'Design',
    date: 'Março 2026',
    imageUrl: './public/images/lolla_1.webp',
    tags: ['Design'],
    description: 'Desenvolvimento do pacote gráfico para a cobertura do Lollapalooza 2026 no g1, envolvendo a criação de um key visual que harmoniza as identidades visuais de ambas as marcas. O projeto incluiu o desdobramento completo de peças para redes sociais e transmissões, como thumbnails, GCs, backgrounds e templates, garantindo uma unidade visual consistente e dinâmica para o consumo de conteúdo em tempo real durante todo o evento.',
    credits: '<strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/images/lolla_1.webp',
      './public/images/lolla_2.webp',
      './public/images/lolla_3.webp',
      './public/images/lolla_4.webp',
      './public/images/lolla_5.webp',
      './public/images/lolla_7.webp',
      './public/images/lolla_9.webp',
      './public/images/lolla_10.webp',
      './public/images/lolla_11.webp'
    ],
    projectLink: '#'
  },
  {
    id: 'enki',
    title: 'Enki',
    category: 'Game Design',
    date: 'Junho 2024',
    imageUrl: './public/images/enki_1.webp',
    tags: ['Game Design', 'Ilustração', 'Design'],
    description: 'Desenvolvido como projeto de PI do segundo semestre de Jogos Digitais no Senac Santo Amaro, este é um game focado em narrativa que coloca o jogador na pele de Paki, um cientista em busca de redenção e desfecho após a perda de sua família. A jornada solitária percorre um mundo apocalíptico submerso, com todo o desenvolvimento realizado no Construct 3. Fui responsável pela criação integral do projeto, incluindo a programação, game design e a produção de toda a pixel art de personagens e cenários, utilizando Photoshop e Aseprite para garantir uma estética visual melancólica e imersiva.',
    credits: '<strong>Ilustração personagens Textbox:</strong> Vitor Pereira <br/> <strong>História e Roteiro:</strong> Gabriel Rocha, Guilherme Rocha e Vitor Pereira',
    mediaImages: [
      './public/images/enki_1.webp',
      './public/images/enki_2.webp',
      './public/images/enki_3.webp',
      './public/images/enki_4.webp'
    ],
    projectLink: 'https://putsgabs.itch.io/enki'
  },
  {
    id: 'coracao_acelerado',
    title: 'gshow - Coração Acelerado',
    category: 'Design',
    date: 'Janeiro 2026',
    imageUrl: './public/images/coracao_1.webp',
    tags: ['Design', 'Desenvolvimento Web'],
    description: 'Projeto de interface e desenvolvimento front-end para a novela "Coração Acelerado". A página foi construída respeitando a Identidade Visual da produção, utilizando ferramentas de inteligência artificial como Gemini e Codex para programar.',
    credits: '<strong>Design:</strong> Gui Sousa <br/> <strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/videos/coracao-acelerado.mp4',
      './public/images/coracao_1.webp',
      './public/images/coracao_2.webp',
      './public/images/coracao_3.webp'
    ],
    projectLink: 'https://gshow.globo.com/novelas/coracao-acelerado/tudo-sobre-e-onde-assistir/'
  },
  {
    id: 'nobreza_amor',
    title: 'gshow - A Nobreza do Amor',
    category: 'Design',
    date: 'Março 2026',
    imageUrl: './public/images/nobreza_1.webp',
    tags: ['Design', 'Desenvolvimento Web'],
    description: 'Desenvolvimento da página da novela A Nobreza do Amor para o Gshow, abrangendo desde a concepção do design UI/UX até a implementação do front-end. O projeto centraliza as informações e o conteúdo da trama de forma intuitiva, utilizando um fluxo de trabalho otimizado no Visual Studio Code com o auxílio de IA (ChatGPT Codex).',
    credits: '<strong>Desenvolvimento e design:</strong> Gui Sousa e Juan Silva <br/> <strong>Coordenação (design e desenvolvimento):</strong> Guilherme Gomes',
    mediaImages: [
      './public/images/nobreza_1.webp',
      './public/images/nobreza_2.webp',
      './public/images/nobreza_3.webp',
      './public/images/nobreza_4.webp'
    ],
    projectLink: 'https://gshow.globo.com/novelas/a-nobreza-do-amor/tudo-sobre-e-onde-assistir/'
  }
];

export const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Desenvolvimento Web', value: 'Desenvolvimento Web' },
  { label: 'Design', value: 'Design' },
  { label: 'Game Design', value: 'Game Design' },
  { label: 'Ilustração', value: 'Ilustração' }
];
