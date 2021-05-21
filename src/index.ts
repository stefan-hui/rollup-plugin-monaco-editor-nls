import fs from "fs";
import path from "path";
import { Plugin } from "rollup";
import { Plugin as Plugin_2 } from "esbuild";
import MagicString from "magic-string";

export enum Languages {
    bg = "bg",
    cs = "cs",
    de = "de",
    en_gb = "en-gb",
    es = "es",
    fr = "fr",
    hu = "hu",
    id = "id",
    it = "it",
    ja = "ja",
    ko = "ko",
    nl = "nl",
    pl = "pl",
    ps = "ps",
    pt_br = "pt-br",
    ru = "ru",
    tr = "tr",
    uk = "uk",
    zh_hans = "zh-hans",
    zh_hant = "zh-hant",
}

export interface Options {
    locale: Languages;
}

const NLS_RE = /esm\/vs\/nls\.js/;
const MONACO_PATH_RE = /monaco-editor[\\\/]esm[\\\/]vs.+\.js/;

/**
 * 使用了monaco-editor-nls的语言映射包，把原始localize(data, message)的方法，替换成了localize(path, data, defaultMessage)
 * @param options 替换语言包
 * @returns
 */
export default function (
    options: Options = { locale: Languages.en_gb }
): Plugin {
    const CURRENT_LOCALE_DATA = getLocalizeMapping(options.locale);
    const CURRENT_LOCALE_DATA_JSON: Object = JSON.parse(CURRENT_LOCALE_DATA);

    return {
        name: "rollup-plugin-monaco-editor-nls",

        load(filepath) {
            if (NLS_RE.test(filepath)) {
                const source = getLocalizeCode(CURRENT_LOCALE_DATA);
                return source;
            }
        },

        transform(source, filepath) {
            if (
                MONACO_PATH_RE.test(filepath) &&
                !/esm\/vs\/.*nls\.js/.test(filepath)
            ) {
                const transform_source = transformCode(
                    filepath,
                    source,
                    CURRENT_LOCALE_DATA_JSON
                );

                if (source === transform_source) {
                    return {
                        code: transform_source,
                        map: new MagicString(transform_source).generateMap({
                            includeContent: true,
                            hires: true,
                            source: filepath,
                        }),
                    };
                }
                return;
            }
        },
    };
}

/**
 * 使用了monaco-editor-nls的语言映射包，把原始localize(data, message)的方法，替换成了localize(path, data, defaultMessage)
 * @param options 替换语言包
 * @returns
 */
export function esbuildPluginMonacoEditorNls(
    options: Options = { locale: Languages.en_gb }
): Plugin_2 {
    const CURRENT_LOCALE_DATA = getLocalizeMapping(options.locale);
    const CURRENT_LOCALE_DATA_JSON: Object = JSON.parse(CURRENT_LOCALE_DATA);

    return {
        name: "esbuild-plugin-monaco-editor-nls",
        setup(build) {
            build.onLoad(
                {
                    filter: NLS_RE,
                },
                () => ({
                    contents: getLocalizeCode(CURRENT_LOCALE_DATA),
                    loader: "js",
                })
            );

            build.onLoad({ filter: MONACO_PATH_RE }, async (args) => {
                let source = await fs.promises.readFile(args.path, "utf8");
                source = transformCode(
                    args.path,
                    source,
                    CURRENT_LOCALE_DATA_JSON
                );

                return {
                    contents: source,
                    loader: "js",
                };
            });
        },
    };
}

/**
 * 替换代码
 * @param filepath 文件路径
 * @param source 文件内容
 * @param transform_map 转换类型
 * @returns
 */
function transformCode(
    filepath: string,
    source: string,
    transform_map: Object
) {
    const re = /(?:monaco-editor\/esm\/)(.+)(?=\.js)/;
    if (re.exec(filepath)) {
        const path = RegExp.$1;
        if (transform_map.hasOwnProperty(path)) {
            source = source.replace(/localize\(/g, `localize('${path}', `);
        }
    }

    return source;
}

/**
 * 获取语言包
 * @param locale 语言
 * @returns
 */
function getLocalizeMapping(locale: Languages) {
    const locale_data_path = path.join(__dirname, `./locale/${locale}.json`);
    return fs.readFileSync(locale_data_path) as unknown as string;
}

/**
 * 替换代码
 * @param CURRENT_LOCALE_DATA 语言包
 * @returns
 */
function getLocalizeCode(CURRENT_LOCALE_DATA: string) {
    return `
        function _format(message, args) {
            var result;
            if (args.length === 0) {
                result = message;
            } else {
                result = String(message).replace(/\{(\d+)\}/g, function (match, rest) {
                    var index = rest[0];
                    return typeof args[index] !== 'undefined' ? args[index] : match;
                });
            }
            return result;
        }

        export function localize(path, data, defaultMessage) {
            var key = typeof data === 'object' ? data.key : data;
            var data = ${CURRENT_LOCALE_DATA} || {};
            var message = (data[path] || {})[key];
            if (!message) {
                message = defaultMessage;
            }
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            return _format(message, args);
        }
    `;
}
