# Software Profe Quiltro

> Equipe: Amanda Siebeneichler, Daiane Dias Vieira, Giovana Borelli, Nathália Zófoli

A fim de facilitar a adesão aos estudos, propõe-se a construção de uma ferramenta de suporte ao ensino, aliando recursos tecnológicos e uso de Inteligência Artificial para simular o contexto de avaliação. A partir de perguntas e respostas extraídas do material didático fornecido pelo professor, o aluno será capaz de otimizar seu tempo de estudos, ter um melhor aproveitamento do conteúdo ministrado e consolidar o conhecimento adquirido.

A proposta engloba estudantes da disciplina Anatomía de Animales de Compañia da Universidad Santo Tomás - Santiago, Chile, com a possibilidade de expansão para outras áreas de conhecimento a depender da adesão da ferramenta e resultados obtidos com a mesma.


## Tecnologias

- Vue 3, Vite e Vue Router
- Vue I18n para suporte a idiomas
- Integração configurável com webhook do n8n para os quizzes

## Requisitos

- [Node.js](https://nodejs.org/) 22.18 ou superior
- npm (instalado junto com o Node.js)

## Como rodar o projeto

1. Acesse a pasta do frontend:

   ```sh
   cd frontend
   ```

2. Instale as dependências:

   ```sh
   npm install
   ```

3. Crie o arquivo de configuração a partir do exemplo e informe a URL do webhook do n8n, se for utilizá-lo:

   ```sh
   cp .env.example .env
   ```

4. Inicie o ambiente de desenvolvimento:

   ```sh
   npm run dev
   ```

O Vite informará no terminal o endereço local para acessar a aplicação.

## Comandos úteis

```sh
# Gerar a versão de produção
npm run build

# Visualizar localmente a versão gerada
npm run preview
```

## Configurações

As variáveis de ambiente ficam em `frontend/.env`. Use `frontend/.env.example` como referência; não versionar URLs ou credenciais sensíveis no arquivo `.env`.
