# Rollup Plugin monaco-editor-nls

Install:

```shell
yarn add -D rollup-plugin-monaco-editor-nls
```

Add this plugin in rollup.config.js：

```typescript
import monacoEditorNlsPlugin, {
    Languages,
} from "rollup-plugin-monaco-editor-nls";

plugins: [monacoEditorNlsPlugin({ locale: Languages.zh_hans })];
```

Add this plugin in vite.config.ts:

> Vite has a pre-loading mode, add this method to solve —— esbuildPluginMonacoEditorNls

```javascript
import { defineConfig } from "vite";
import monacoEditorNlsPlugin, {
    Languages,
    esbuildPluginMonacoEditorNls,
} from "rollup-plugin-monaco-editor-nls";
const is_dev = process.env.NODE_ENV === "development";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve("./src"),
        },
    },
    build: {
        sourcemap: true,
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                esbuildPluginMonacoEditorNls({ locale: Languages.zh_hans }),
            ],
        },
    },
    plugins: [!is_dev && monacoEditorNlsPlugin({ locale: Languages.zh_hans })],
});
```
