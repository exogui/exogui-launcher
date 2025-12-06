import { defineConfig } from "@rsbuild/core";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginReact } from "@rsbuild/plugin-react";
import { builtinModules } from "node:module";

const externals = {
    "electron": "commonjs electron"
};
for (const module of builtinModules) {
    externals[module] = "commonjs " + module;
}
for (const module of builtinModules) {
    externals["node:"+module] = "commonjs " + module;
}

export default defineConfig({
    source: {
        entry: {
            renderer: "./src/renderer/index.tsx"
        }
    },
    html: {
        title: "Exogui Launcher",
        template: "./templates/index.html"
    },
    dev: {
        assetPrefix: "auto"
    },
    server: {
        base: "/exogui",
        publicDir: {
            name: "./build/window",
            copyOnBuild: false,
            watch: true
        },
        open: "/exogui/renderer",
    },
    output: {
        externals,
        target: "web",
        assetPrefix: "auto",
        minify: process.env.NODE_ENV === "production",
        distPath: {
            root: "./build/window",
        },
        cleanDistPath: {
            keep: [/styles*/, /images*/, /svg*/],
        },
    },
    plugins: [
        pluginReact(),
        pluginBabel({
            include: /\.(?:jsx|tsx)$/,
            babelLoaderOptions(opts) {
                opts.plugins?.unshift(["babel-plugin-react-compiler"]);
            },
        })
    ],
});
