# Como adicionar ou modificar projetos

Todos os projetos e filtros do seu portfólio estão centralizados em um único arquivo de configuração muito fácil de mexer.

Para editar ou adicionar novos projetos:
1. Abra o arquivo **`src/data.js`** no seu editor de código.
2. Você verá uma lista chamada `export const projects = [...]`.
3. Cada projeto está dentro de chaves `{ ... }`.
4. Para **adicionar um novo**, basta copiar um bloco inteiro de um projeto existente (com chaves e tudo), colar no final da lista separando com uma vírgula, e trocar os textos, links e caminho das imagens.
5. Salve o arquivo! O servidor Vite atualizará a tela automaticamente.

As imagens do seu projeto devem ser colocadas na pasta **`public/images/`**, e depois você pode referenciá-las no `data.js` usando, por exemplo, `'/images/minha-imagem.jpg'`.

## Estrutura de Exemplo:
```javascript
  {
    id: 10,
    title: 'Nome do Projeto',
    category: 'Design',
    date: 'Dezembro 2023', // Opcional, data do projeto
    imageUrl: '/images/capa.png', // Imagem que aparece na grade inicial
    tags: ['design'], // A tag deve corresponder ao value do filtro
    description: 'A descrição rica que vai aparecer dentro da tela cheia.',
    credits: 'Nomes da equipe, funções ou parceiros (suporta HTML como <br/>)',
    mediaImages: [
      '/images/detalhe1.png', // Imagens grandes que vão aparecer quando abrir a tela cheia
      '/images/detalhe2.png'
    ],
    projectLink: 'https://seulink.com'
  }
```
