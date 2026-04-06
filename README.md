# Sistema de Checklist de Frota

Projeto desenvolvido como solução para realização e validação de checklist de veículos, com separação de perfis entre colaborador e gestor, registro de colaboradores, upload de fotos obrigatórias e fluxo de aprovação/reprovação.

---

## Objetivo

Criar uma solução funcional para controle de checklist de veículos, contemplando:

- preenchimento operacional
- validação gerencial
- histórico por veículo
- automações no processo
- rastreabilidade das informações

---

## Perfis do sistema

### Colaborador
Responsável por realizar o checklist do veículo.

Funções disponíveis:
- preencher checklist
- informar tipo do carro, placa, ano, proprietário e KM
- enviar fotos obrigatórias
- responder perguntas objetivas de Sim/Não
- enviar checklist para validação

Regras:
- não acessa histórico geral
- não acessa dados administrativos
- responsável é vinculado automaticamente pela matrícula do colaborador logado

---

### Gestor
Responsável por acompanhar e validar os checklists enviados.

Funções disponíveis:
- visualizar checklists enviados
- aprovar checklist
- reprovar checklist com justificativa obrigatória
- filtrar por status e veículo
- consultar histórico por veículo
- excluir checklist
- visualizar colaboradores cadastrados
- pré-cadastrar novos colaboradores

---

## Funcionalidades implementadas

### Área do colaborador
- login por perfil
- preenchimento do checklist
- identificação do veículo
- indicador visual de KM
- perguntas em formato Sim/Não
- upload de fotos obrigatórias:
  - frente
  - lateral
  - pneu
  - parte interna
  - painel
- botão de envio com feedback visual
- responsável preenchido automaticamente com a matrícula do colaborador

### Área do gestor
- dashboard com resumo:
  - pendentes
  - aprovados
  - reprovados
- histórico de checklists
- filtro por status
- filtro por veículo
- validação dos checklists
- reprovação com observação obrigatória
- visualização de fotos e respostas
- exclusão individual e em massa
- modais e notificações visuais personalizados

### Gestão de colaboradores
- tela exclusiva para o gestor
- pré-cadastro de colaboradores
- upload de foto do colaborador
- geração automática de:
  - matrícula
  - RA
- pesquisa por:
  - matrícula
  - RA
  - sexo
- status:
  - pré-cadastrado
  - ativo

### Registro de colaborador
- registro via tela “Registre-se”
- validação por matrícula e RA
- criação de usuário real somente se houver pré-cadastro válido

---

## Automações implementadas

- bloqueio de envio do checklist sem todas as fotos obrigatórias
- bloqueio de envio com campos incompletos
- alteração automática de status após aprovação ou reprovação
- associação automática do responsável pela matrícula do login
- geração automática de matrícula e RA no pré-cadastro do colaborador

---

## Tecnologias utilizadas

### Frontend
- React.js

### Backend
- Node.js
- Express

### Banco de dados
- PostgreSQL

### Upload de imagens
- Postman

---

## Estrutura do projeto

```text
frota-checklist/
  backend/
  frontend/
  README.md

---

## Como executar o projeto

### 1. Backend

Abra o terminal na pasta `backend` e rode:

```bash
npm install
node server.js

Servidor Backend:
http://localhost3001

### 1. Frontend

Abra outro terminal na pasta `Fontend` e rode:

```bash
npm install
node start

Servidor Backend:
http://localhost3000

---

## 📎 Orientação para teste

Para validação completa do sistema, siga o fluxo abaixo:

### Acesso como Gestor
1. Acesse o sistema com as credenciais:
   - **Email:** enzo@teste  
   - **Senha:** 123456  

2. Navegue até a área de **Colaboradores**.

3. Realize o **pré-cadastro de um novo colaborador**.  
   Ao finalizar, serão gerados automaticamente:
   - Matrícula
   - RA (Registro de Autenticação)

4. Anote essas informações.

---

### Registro do Colaborador
5. Retorne à tela inicial e clique em **"Registre-se"**.

6. Realize o cadastro utilizando:
   - Email
   - Senha
   - Matrícula (gerada no pré-cadastro)
   - RA (gerado no pré-cadastro)

7. Após o registro, faça login com o usuário criado.

---

### Execução do Checklist
8. Preencha o checklist do veículo:
   - Dados do veículo (tipo, placa, ano, proprietário)
   - KM atual
   - Perguntas obrigatórias (Sim/Não)
   - Upload das fotos obrigatórias

9. Envie o checklist.

---

### Validação pelo Gestor
10. Retorne à conta de gestor.

11. Acesse o dashboard e clique em **"Atualizar"**.

12. Localize o checklist pendente.

13. Realize uma das ações:
   - Aprovar checklist
   - Reprovar checklist (com justificativa obrigatória)

---

## Observações e diferenciais implementados

### RA (Registro de Autenticação)
Foi implementado como uma camada adicional de segurança no processo de cadastro.

Seu objetivo é garantir que apenas colaboradores previamente autorizados pelo gestor consigam concluir o registro no sistema, evitando acessos indevidos.

---

### Pré-cadastro de colaboradores
O sistema conta com um fluxo de pré-cadastro realizado pelo gestor, inspirado em práticas reais de onboarding corporativo.

Esse processo permite:
- registrar o colaborador previamente
- gerar credenciais seguras (Matrícula e RA)
- controlar quando o colaborador está apto a utilizar o sistema

Somente após esse processo o colaborador pode concluir seu cadastro e se tornar ativo.

---

### Sistema de busca de colaboradores
Foi implementado um sistema de pesquisa simples e eficiente, permitindo localizar colaboradores com base em:

- Matrícula
- RA (Registro de Autenticação)
- Sexo

Essa funcionalidade facilita a identificação e rastreabilidade dos responsáveis pelos checklists realizados.

---

### Considerações gerais
A solução foi desenvolvida com foco em:
- segurança no cadastro de usuários
- separação clara de responsabilidades (colaborador x gestor)
- validação de dados obrigatórios
- experiência de uso intuitiva
- fluxo completo de operação e validação

