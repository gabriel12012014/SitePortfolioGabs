// DADOS DOS PROJETOS (Edite aqui!)
// ==========================================
// Adicione ou altere seus projetos abaixo.
// As imagens devem estar na mesma pasta ou use URLs completas.
// DICA: Em 'category', você pode colocar um texto único ou uma lista: ["Design", "Dev"]

window.projectsData = [
    {
        id: 1,
        title: "g1 - Monte sua Roda de Samba",
        category: ["Desenvolvimento", "Design", "Ilustração"], // Exemplo com múltiplas categorias
        image: "rodasambasp-01.webp",
        // Nova Estrutura de Conteúdo Modular (Substitui longDescription)
        content: [
            { type: 'text', content: "Para essa matéria, foi desenvolvido um jogo onde o jogador podia criar sua própria Roda de Samba. O jogador escolhia entre os instrumentos disponíveis e os colocava sobre os personagens, que então acordavam e começavam a tocar." },
            { type: 'image', url: 'rodasambasp-01.webp', caption: 'Interface principal do jogo' },
            { type: 'text', content: "O desafio foi criar uma experiência interativa leve e divertida que funcionasse bem em dispositivos móveis. A ilustração seguiu um estilo vibrante e caricato para combinar com o clima de carnaval." }
            // Exemplo de vídeo (pode adicionar se tiver): 
            // { type: 'video', url: 'https://www.youtube.com/embed/VIDEO_ID' }
        ],
        // longDescription mantido apenas como fallback temporário
        longDescription: "Para essa matéria, foi desenvolvido um jogo onde o jogador podia criar sua própria Roda de Samba...",
        credits: [
            "Ilustração: Dhara Assis, Gabs, Vitor",
            "Projeto Gráfico: Veronica Medeiros",
            "Desenvolvimento: Gabs"
        ],
        technologies: ["Construct 3", "Adobe Illustrator"],
        link: "https://g1.globo.com/sp/sao-paulo/carnaval/2024/noticia/2024/02/09/rodas-de-sampa-com-publico-renovado-samba-se-espalha-por-sp-seduz-jovens-e-levanta-discussao-sobre-respeito-as-tradicoes.ghtml"
    },
    {
        id: 2,
        title: "Robertinho Soccer",
        category: "Design",
        image: "project_1.png",
        longDescription: "Um redesign completo da interface de usuário para um jogo de futebol mobile clássico. O foco foi em melhorar a legibilidade, criar uma identidade visual vibrante e otimizar o fluxo de navegação do usuário. A paleta de cores vibrante traz energia para a experiência esportiva.",
        technologies: ["Figma", "UI/UX", "Mobile Design"],
        link: "#"
    },
    {
        id: 3,
        title: "Neo-Tokyo Chronicles",
        category: "Game Dev",
        image: "project_2.png",
        longDescription: "Jogo de aventura point-and-click ambientado em uma Tóquio futurista. Desenvi a arte em pixel art, os sprites dos personagens e os cenários atmosféricos com iluminação dinâmica. A narrativa explora temas de transhumanismo e inteligência artificial.",
        technologies: ["Unity", "Pixel Art", "C#"],
        link: "#"
    },
    {
        id: 4,
        title: "Dreamscape",
        category: "Ilustração",
        image: "project_3.png",
        longDescription: "Série de ilustrações digitais explorando o mundo dos sonhos e o subconsciente. Cores vibrantes se misturam com formas orgânicas para criar paisagens impossíveis. O processo criativo envolveu pintura digital mesclada com texturas fotográficas.",
        technologies: ["Photoshop", "Digital Painting", "Concept Art"],
        link: "#"
    }
];
