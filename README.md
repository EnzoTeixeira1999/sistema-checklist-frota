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