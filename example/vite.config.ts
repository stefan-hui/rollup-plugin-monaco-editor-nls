import reactRefresh from "@vitejs/plugin-react-refresh";
import { resolve } from "path";
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
        rollupOptions: {
            manualChunks: (id) => {
                if (id.includes("monaco-editor")) {
                    return "monaco-editor";
                }
            },
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                esbuildPluginMonacoEditorNls({ locale: Languages.zh_hans }),
            ],
        },
    },
    plugins: [
        !is_dev && monacoEditorNlsPlugin({ locale: Languages.zh_hans }),
        reactRefresh(),
    ],
});
