import reactRefresh from "@vitejs/plugin-react-refresh";
import { resolve } from "path";
import { defineConfig } from "vite";
import monacoEditorNlsPlugin, {
    Languages,
} from "rollup-plugin-monaco-editor-nls";

const prefix = `monaco-editor/esm/vs`;

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
        include: [
            `${prefix}/language/typescript/ts.worker`,
            `${prefix}/editor/editor.worker`,
        ],
        exclude: ["monaco-editor/esm/vs"],
    },
    plugins: [
        monacoEditorNlsPlugin({ locale: Languages.zh_hans }),
        reactRefresh(),
    ],
});
