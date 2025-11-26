# Configuração de Correções Automáticas do ESLint

Este projeto está configurado para fazer correções automáticas do ESLint de várias formas:

## ✅ Como Funciona

### 1. **Auto-fix ao Salvar (Editor)**
Ao salvar qualquer arquivo (`Cmd+S` / `Ctrl+S`), o ESLint corrige automaticamente todos os problemas que podem ser corrigidos automaticamente.

**Configuração:** `.vscode/settings.json`

### 2. **Auto-fix Durante o Desenvolvimento (Vite)**
Ao rodar `npm run dev`, o plugin do ESLint no Vite também aplica correções automaticamente.

**Configuração:** `vite.config.js`

### 3. **Comandos Manuais**

- `npm run lint` - Verifica erros sem corrigir
- `npm run lint:fix` - Corrige todos os erros automaticamente
- `npm run lint:watch` - Modo watch que corrige automaticamente enquanto você trabalha

## 📝 Requisitos

Para que o auto-fix funcione no editor, você precisa ter a extensão ESLint instalada:

1. Abra o Cursor/VSCode
2. Vá em Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Procure por "ESLint" da Microsoft
4. Instale a extensão

## 🔧 Troubleshooting

Se o auto-fix não estiver funcionando:

1. Verifique se a extensão ESLint está instalada e habilitada
2. Recarregue o editor (Cmd+Shift+P > "Reload Window")
3. Verifique se o ESLint está rodando no terminal com `npm run lint`

