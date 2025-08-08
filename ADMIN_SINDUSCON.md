# Administração - Valores da Sinduscon

## Visão Geral

Esta funcionalidade permite gerenciar os valores da Sinduscon (R1, PP4, R8, R-16) para todos os estados do Brasil de forma centralizada.

## Como Acessar

1. Faça login no sistema
2. No menu lateral, clique em "Admin" (ícone de escudo)
3. Você será direcionado para `/admin`

## Funcionalidades

### 1. Controle de Período

- **Mês**: Selecione o mês (1-12)
- **Ano**: Selecione o ano (2020-2030)
- Os valores são organizados por mês/ano para facilitar o controle histórico

### 2. Tabela de Valores

- Lista todos os 27 estados do Brasil
- Campos editáveis para cada valor:
  - **R1**: Valor para R1
  - **PP4**: Valor para PP4
  - **R8**: Valor para R8
  - **R-16**: Valor para R-16

### 3. Ações Disponíveis

#### Carregar Dados

- Busca os valores salvos no banco de dados para o mês/ano selecionado
- Preenche automaticamente a tabela com os valores existentes

#### Salvar

- Salva todos os valores preenchidos no banco de dados
- Substitui valores existentes para o mês/ano selecionado
- Mostra notificação de sucesso/erro

#### Exportar CSV

- Gera arquivo CSV com todos os valores da tabela
- Nome do arquivo: `sinduscon-{mes}-{ano}.csv`
- Formato: Estado,R1,PP4,R8,R-16

## Estrutura do Banco de Dados

### Tabela: `sinduscon_values`

```sql
CREATE TABLE "sinduscon_values" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "estado" text NOT NULL,
  "r1" numeric(10, 2),
  "pp4" numeric(10, 2),
  "r8" numeric(10, 2),
  "r16" numeric(10, 2),
  "mes" integer NOT NULL,
  "ano" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

## API Endpoints

### GET `/api/admin/sinduscon`

- **Parâmetros**: `mes` (1-12), `ano` (YYYY)
- **Retorna**: Array com valores salvos para o período

### POST `/api/admin/sinduscon`

- **Body**:
  ```json
  {
    "mes": 1,
    "ano": 2024,
    "values": [
      {
        "estado": "SP",
        "r1": 100.5,
        "pp4": 200.75,
        "r8": 150.25,
        "r16": 300.0
      }
    ]
  }
  ```

## Estados Disponíveis

- AC (Acre)
- AL (Alagoas)
- AP (Amapá)
- AM (Amazonas)
- BA (Bahia)
- CE (Ceará)
- DF (Distrito Federal)
- ES (Espírito Santo)
- GO (Goiás)
- MA (Maranhão)
- MT (Mato Grosso)
- MS (Mato Grosso do Sul)
- MG (Minas Gerais)
- PA (Pará)
- PB (Paraíba)
- PR (Paraná)
- PE (Pernambuco)
- PI (Piauí)
- RJ (Rio de Janeiro)
- RN (Rio Grande do Norte)
- RS (Rio Grande do Sul)
- RO (Rondônia)
- RR (Roraima)
- SC (Santa Catarina)
- SP (São Paulo)
- SE (Sergipe)
- TO (Tocantins)

## Notas Importantes

1. **Segurança**: Esta funcionalidade deve ser restrita apenas a administradores
2. **Backup**: Recomenda-se fazer backup regular dos dados
3. **Validação**: Os valores são validados no frontend e backend
4. **Performance**: A tabela é otimizada para carregamento rápido
5. **Responsividade**: Interface adaptada para desktop e mobile

## Próximas Melhorias

- [ ] Autenticação específica para admin
- [ ] Histórico de alterações
- [ ] Importação de CSV
- [ ] Gráficos de evolução dos valores
- [ ] Notificações automáticas de atualizações
