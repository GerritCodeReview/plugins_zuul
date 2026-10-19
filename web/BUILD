load("@aspect_rules_ts//ts:defs.bzl", "ts_config", "ts_project")
load("//tools/js:eslint.bzl", "plugin_eslint")
load("//tools/bzl:js.bzl", "gerrit_js_bundle")

package_group(
    name = "visibility",
    packages = ["//plugins/zuul/..."],
)

package(default_visibility = [":visibility"])

ts_config(
    name = "tsconfig",
    src = "tsconfig.json",
    deps = [
        "//plugins:tsconfig-plugins-base",
    ],
)

ts_project(
    name = "zuul-ts",
    srcs = glob(
        ["**/*.ts"],
        exclude = ["**/*test*"],
    ),
    incremental = True,
    out_dir = "_bazel_ts_out",
    tsconfig = ":tsconfig",
    deps = [
        "//plugins:node_modules",
    ],
)

gerrit_js_bundle(
    name = "zuul",
    srcs = [":zuul-ts"],
    entry_point = "_bazel_ts_out/plugin.js",
)

plugin_eslint()
