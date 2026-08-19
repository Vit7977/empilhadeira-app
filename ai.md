# AI.md — Contexto e Diretrizes do Projeto React Native

## 1. Contexto

Este projeto é um aplicativo mobile desenvolvido com **React Native**, utilizando **JavaScript**, **React Native Paper**, **React Navigation**, **Expo Vector Icons** e **Expo**.

A estrutura atual utiliza organização por funcionalidades através de:

```text
src/features/
```

Atualmente existe a funcionalidade:

```text
src/features/Usuario/
├── Login.jsx
└── Dashboard.jsx
```

O projeto está em desenvolvimento e sua estrutura pode evoluir conforme novas funcionalidades forem implementadas.

## 2. Tecnologias

* React Native
* JavaScript
* Expo
* React Native Paper
* React Navigation
* `@expo/vector-icons`

Não utilizar TypeScript sem solicitação explícita.

## 3. Estrutura

```text
empilhadeira-app/
├── src/
│   ├── assets/
│   ├── components/
│   └── features/
│       └── Usuario/
│           ├── Login.jsx
│           └── Dashboard.jsx
├── App.jsx
├── index.js
├── app.json
├── package.json
├── README.md
├── AGENTS.md
└── CLAUDE.md
```

### `App.jsx`

Responsável pela composição principal da aplicação, incluindo:

* `PaperProvider`;
* tema;
* `NavigationContainer`;
* navegador principal.

Evitar colocar regras de negócio complexas nesse arquivo.

### `src/features/`

Contém as funcionalidades do aplicativo.

### `src/components/`

Contém componentes reutilizáveis entre telas.

### `src/assets/`

Contém imagens, ícones e outros recursos visuais.

## 4. React Native Paper

React Native Paper é a biblioteca principal de componentes visuais.

Dar preferência aos componentes existentes do Paper:

```javascript
Button
Text
TextInput
HelperText
Card
Surface
ActivityIndicator
Snackbar
Dialog
```

Exemplo:

```javascript
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
/>
```

Para validação:

```javascript
<HelperText type="error" visible={emailInvalido}>
  Informe um email válido.
</HelperText>
```

## 5. Tema

O aplicativo utiliza o tema do sistema:

```javascript
import { useColorScheme } from "react-native";
import {
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";

const colorScheme = useColorScheme();

const theme =
  colorScheme === "dark"
    ? MD3DarkTheme
    : MD3LightTheme;
```

O tema deve ser fornecido através de:

```javascript
<PaperProvider theme={theme}>
```

Dentro dos componentes, utilizar:

```javascript
const theme = useTheme();
```

quando for necessário acessar o tema atual.

Não comparar objetos de tema diretamente para descobrir o modo claro ou escuro.

## 6. React Navigation

A navegação utiliza React Navigation.

Para Bottom Tabs:

```javascript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
```

Os navegadores devem ser organizados de forma centralizada.

Evitar múltiplos `NavigationContainer` sem necessidade.

## 7. Ícones

Os ícones utilizam Expo Vector Icons:

```javascript
import { Ionicons } from "@expo/vector-icons";
```

Exemplo:

```javascript
<Ionicons
  name="home-outline"
  size={24}
  color={color}
/>
```

Quando houver estado selecionado/não selecionado, utilizar versões como:

```text
grid
grid-outline

person
person-outline

home
home-outline
```

## 8. Login

A tela está localizada em:

```text
src/features/Usuario/Login.jsx
```

A tela deve cuidar da interação com o usuário, incluindo:

* email;
* senha;
* mostrar/ocultar senha;
* validação;
* carregamento;
* mensagens de erro.

Exemplo:

```javascript
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [loading, setLoading] = useState(false);
```

A lógica de autenticação com a API deve ser separada da apresentação quando o backend for integrado.

## 9. Dashboard

A tela está localizada em:

```text
src/features/Usuario/Dashboard.jsx
```

O Dashboard deve apresentar informações resumidas e relevantes ao usuário.

Não concentrar toda a lógica da aplicação dentro do Dashboard.

Componentes visuais reutilizáveis devem ser extraídos para:

```text
src/components/
```

## 10. Regras de desenvolvimento

### Regra 1

Utilizar JavaScript.

Não criar `.ts` ou `.tsx` sem solicitação.

### Regra 2

Preferir componentes funcionais e Hooks.

### Regra 3

Não adicionar dependências sem necessidade.

Antes de instalar uma biblioteca, verificar se React Native, React Native Paper, React Navigation ou Expo já possuem uma solução.

### Regra 4

Não duplicar componentes ou lógica.

### Regra 5

Não criar abstrações desnecessárias apenas por antecipação.

### Regra 6

Fazer alterações pequenas e relacionadas ao problema.

### Regra 7

Não substituir React Native Paper, React Navigation ou Expo sem solicitação explícita.

### Regra 8

Não modificar a arquitetura inteira para corrigir um problema simples.

## 11. API REST

O aplicativo poderá ser integrado a uma API REST.

Uma estrutura futura possível:

```text
src/
├── components/
├── features/
│   └── Usuario/
│       ├── Login.jsx
│       └── Dashboard.jsx
└── services/
    └── api.js
```

Fluxo esperado:

```text
Tela
  ↓
Service/API
  ↓
API REST
  ↓
Resposta
  ↓
Tela
```

A IA não deve inventar endpoints, tokens ou formatos de resposta do backend.

Deve utilizar a documentação ou código real da API.

## 12. Segurança

Nunca:

* colocar senhas reais no código;
* colocar tokens reais no Git;
* imprimir senhas no `console.log`;
* versionar credenciais;
* armazenar informações sensíveis diretamente no código.

## 13. Git

Antes de alterar:

```bash
git status
```

Para verificar mudanças:

```bash
git diff
```

Exemplos de commits:

```text
feat: adiciona tela de login
fix: corrige validação do email
style: ajusta tema do dashboard
refactor: organiza componentes do usuario
docs: atualiza documentação
```

## 14. Como a IA deve trabalhar

Ao fornecer uma alteração:

1. Informar o arquivo que será alterado.
2. Mostrar o código necessário.
3. Explicar o que foi alterado.
4. Explicar por que foi alterado.
5. Explicar como testar.
6. Manter JavaScript.
7. Respeitar React Native Paper.
8. Respeitar React Navigation.
9. Respeitar Expo Vector Icons.
10. Evitar alterações fora do escopo.

Quando o objetivo for aprendizado, explicar primeiro o conceito e depois apresentar o código.

## 15. O que a IA não deve fazer

Não deve:

* migrar para TypeScript;
* substituir React Native Paper;
* substituir React Navigation;
* remover Expo sem necessidade;
* inventar endpoints;
* inventar respostas da API;
* instalar dependências sem justificar;
* criar múltiplos `NavigationContainer`;
* ignorar o sistema de tema;
* duplicar componentes;
* fazer grandes refatorações sem necessidade.

## 16. Princípio do projeto

A prioridade é manter o aplicativo:

```text
Simples
   ↓
Organizado
   ↓
Reutilizável
   ↓
Fácil de entender
   ↓
Fácil de manter
   ↓
Fácil de integrar com a API REST
```

O código deve ser adequado ao estágio atual do projeto e compreensível para quem está aprendendo React Native.
::: 