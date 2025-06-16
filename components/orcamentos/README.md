# Sistema de Orçamentos

Este diretório contém os componentes relacionados ao sistema de orçamentos da aplicação.

## Estrutura de Componentes

### Componentes Principais

- **CreateBudgetScreen**: Componente principal que gerencia a criação de orçamentos.
- **BudgetTypes**: Componente para seleção do tipo de orçamento.
- **BudgetFormSteps**: Componente que gerencia as etapas do formulário de orçamento e direciona para o formulário específico de cada tipo.

### Componentes de Etapas Comuns

- **BudgetFormFirstStep**: Componente para a primeira etapa do orçamento (comum a todos os tipos), que inclui seleção de cliente e nome do projeto.

### Componentes Específicos por Tipo de Orçamento

- **CompleteBudgetForm**: Formulário específico para orçamentos de projeto completo.
- **SquareMeterBudgetForm**: Formulário específico para orçamentos por m².

### Componentes Auxiliares

- **OrcamentoItemSidebar**: Sidebar para adicionar/editar itens de orçamento.
- **ClientsModal**: Modal para criação de clientes.

## Fluxo de Funcionamento

1. O usuário acessa a tela de criação de orçamentos.
2. Seleciona um tipo de orçamento (projeto completo, por m², etc).
3. O sistema exibe o formulário específico para o tipo selecionado.
4. A primeira etapa é comum a todos os tipos (cliente e nome do projeto).
5. As etapas seguintes são específicas para cada tipo de orçamento.
6. Ao finalizar, o orçamento é salvo no banco de dados.

## Tipos de Orçamento

- **Projeto completo**: Orçamento para projetos completos (da planta à execução).
- **Por m²**: Orçamento baseado em metro quadrado.
- **Render**: Orçamento baseado em renders.
- **Modelagem**: Orçamento para modelagem do projeto.
- **Por preço da obra**: Orçamento baseado no Sinduscon.

## Implementação Atual

Atualmente, apenas os tipos "Projeto completo" e "Por m²" estão implementados com a primeira etapa funcional (seleção de cliente e nome do projeto). As próximas etapas serão implementadas conforme necessário.
