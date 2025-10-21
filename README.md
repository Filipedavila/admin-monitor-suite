## AMS (React)

Aplicação web em React para gestão e visualização de métricas de acessibilidade, páginas, entidades e diretórios. Utiliza Vite, React Router, i18n (Português/English), Chart.js, Axios e o AMA Design System.

---

### Requisitos
- Node.js 18+ (recomendado LTS)
- npm 9+ (ou pnpm/yarn, se preferir)

### Tecnologias principais
- React 18 com Vite
- React Router 7
- i18next e detetor de língua do browser
- Chart.js e react-chartjs-2
- Axios
- Moment.js (com salvaguarda global para datas inválidas)
- AMA Design System

---

### Começar
1. Instalar dependências:
   ```bash
   npm install
   ```
2. Ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
   Abra o endereço mostrado no terminal (por defeito `http://localhost:5173`).

### Scripts
- `npm run dev` — inicia servidor de desenvolvimento (Vite)
- `npm run build` — gera build de produção
- `npm run preview` — serve a build gerada para validação
- `npm run lint` — executa ESLint

### Configuração
- API e Autenticação: ver `src/config/api.js`.
  - A base da API é lida de `localStorage.getItem('@AMS:apiUrl') + '/api'`.
  - Tokens são geridos em `localStorage` (`@AMS:token`, `@AMS:user`).
  - Em respostas 401/403, a app limpa sessão e redireciona para `/ams/login`.
- i18n e locale de datas: ver `src/i18n/index.jsx`.
  - O idioma é detetado automaticamente (fallback para `en`).
  - O Moment acompanha o idioma do i18n.
  - Datas inválidas em `moment().format()` devolvem string vazia por salvaguarda global.

### Estrutura (resumo)
- `src/pages` — páginas (Home, Login, Users, Websites, Pages, Entities, Directories, etc.)
- `src/components` — componentes reutilizáveis (gráficos, cartões, modais, etc.)
- `src/config` — configuração (API, dados mock)
- `src/context` — contextos (Autenticação, Tema)
- `src/utils` — utilitários, conversões, CSV, etc.
- `src/i18n` — internacionalização e configuração do Moment

### Build e Deploy
1. Build de produção:
   ```bash
   npm run build
   ```
2. Pré-visualizar:
   ```bash
   npm run preview
   ```
3. Caminho base: o `package.json` define `"homepage": "ams"`.
   - Se servir em subpath (ex.: `https://dominio/ams/`), mantenha-o.
   - Se servir na raiz, poderá ajustar a configuração conforme necessário.

### Boas práticas / Qualidade
- Execute `npm run lint` e resolva avisos/erros antes de abrir PRs.
- Prefira componentes claros e funções com nomes descritivos.
- Centralize lógicas comuns em `src/utils`.

### Problemas comuns
- Datas a mostrar "Invalid date": mitigado globalmente em `src/i18n/index.jsx` — quando a data for inválida, é exibida string vazia.
- Sem dados a carregar: confirme a chave `@AMS:apiUrl` no `localStorage` e a disponibilidade da API.
- Sessão expirada: o app redireciona para login ao receber 401/403.

### Contribuição
1. Crie uma branch a partir de `main`.
2. Faça commits pequenos e claros.
3. Abra um Pull Request descrevendo o objetivo e o impacto.

### Licença
Especifique aqui a licença do projeto (se aplicável).
