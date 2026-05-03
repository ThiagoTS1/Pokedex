# Análise crítica da arquitetura — Pokédex (Aula 05)

## 1. Estrutura de diretórios

A separação em **`screens`** (fluxos/telas), **`components`** (UI reutilizável), **`services`** (acesso à PokéAPI), **`types`** (contratos TypeScript) e **`utils`** (formatação pura, ex. `capitalize`) é **clara e convencional** para um app React Native de tamanho médio. Qualquer desenvolvedor que já trabalhou com camadas semelhantes encontra rapidamente onde cada responsabilidade mora.

**Possíveis ajustes (sem obrigatoriedade):**

| Ideia | Motivo |
|--------|--------|
| Agrupar cada tela em pasta própria (`screens/Pokedex/`, `screens/PokemonDetails/`) quando o app crescer | Facilita colocar testes, estilos e hooks da mesma feature lado a lado. |
| Introduzir `navigation/` com tipos `RootStackParamList` e stacks declaradas | A navegação vira um “módulo” explícito em vez de espalhar `navigation` só no `App`. |
| `hooks/` para lógica compartilhada (`usePokemonList`, etc.) | Reduz repetição se várias telas precisarem do mesmo padrão de carregamento/erro. |

Nenhuma dessas mudanças invalida a estrutura atual; são refinamentos para escalabilidade e descoberta de código.

---

## 2. Componentização

### O `PokemonCard` é um bom exemplo de componente reutilizável?

**Sim, como cartão de lista:** recebe um `Pokemon` via props, não conhece navegação nem origem dos dados, e concentra layout (imagem, nome capitalizado) e estilo do card. Isso favorece **reuso na grade da Pokédex** e testes visuais isolados.

**Limitações:** se, na versão com navegação, o card passar a embutir `onPress` + `navigation.navigate`, ele fica um pouco mais acoplado ao fluxo. Ainda é aceitável, mas o ideal é receber `onPress` como prop ou usar um wrapper na tela para manter o card “burro” em relação ao roteador.

### `PokemonDetailsScreen` — o que extrair?

Na implementação típica da disciplina (imagem grande, nome/ID, tipos, lista de stats/base experience), faria sentido extrair, por exemplo:

- **`PokemonHeader`** — sprite principal, nome, ID ou número na Pokédex.  
- **`TypeChips`** — linha de “pills” com os tipos (reaproveitável em outros lugares).  
- **`StatRow`** ou **`BaseStatsList`** — cada stat com barra ou valor; a lista fica declarativa na screen.  
- **`SectionTitle`** (opcional) — título de seção consistente com a Pokédex.

Objetivo: a **screen** orquestra dados e loading/erro; blocos visuais ficam em **components** nomeados por domínio da UI.

---

## 3. Gerenciamento de estado e lógica

### `PokedexScreen`

- **Busca de dados:** dentro de um `useEffect` na própria tela, chamando `getPokemons` e, em seguida, `getPokemonDetails` em paralelo para montar a lista enriquecida.  
- **Filtragem:** estado local `search` + `pokemons.filter(...)` derivado no corpo do componente (lista filtrada calculada a cada render).

### `PokemonDetailsScreen` (versão com navegação)

- Em geral, **outro `useEffect`** (ou `useFocusEffect`) que lê o **id** ou identificador vindo dos **params** da rota, chama uma função em `api.ts` e preenche estado local (`pokemon`, `loading`, `error`).

### Sustentabilidade

| Prós | Contras |
|------|---------|
| Simples de ler; poucos arquivos; ideal para **MVP** e aprendizado. | Duplicação de padrões (loading/erro/fetch) entre telas. |
| TypeScript nos tipos e nas props já dá **segurança** razoável. | Telas “inchadas” dificultam testes unitários da lógica sem renderizar UI. |
| Serviços isolados (`api.ts`) mantêm **HTTP fora** dos detalhes de apresentação. | Regras de negócio misturadas à UI ficam **difíceis de reutilizar** (ex. mesma busca em outro fluxo). |

**Conclusão:** sustentável enquanto o app for pequeno e a equipe for reduzida. Para crescimento contínuo, convém **ViewModel/Presenter**, **React Query** ou camada de **casos de uso** para centralizar estados assíncronos e cache.

---

## 4. Pontos fortes e fracos

### Pontos fortes 

1. **Serviço HTTP dedicado (`services/api.ts`)** — endpoints e mapeamento da resposta da API ficam centralizados; as telas chamam funções de alto nível em vez de espalhar `axios` e URLs.  
2. **Tipos em `types/Pokemon.ts` e props tipadas** — o modelo `Pokemon` alinha lista, card e detalhes; reduz erros ao passar dados entre telas (especialmente com `RootStackParamList` na navegação).

### Pontos fracos 

1. **Lógica assíncrona e de filtro concentrada nas screens** — dificulta extrair testes de “o que a lista deve fazer ao buscar/falhar” sem acoplar a React Native.  
2. **Carga inicial potencialmente pesada** — buscar lista e depois **N** detalhes com `Promise.all` na primeira tela pode ficar lenta ou frágil em redes ruins; falta paginação, cancelamento de requisição ou camada de cache explícita.



