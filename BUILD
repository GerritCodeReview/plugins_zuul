load(
    "//tools/bzl:plugin.bzl",
    "gerrit_plugin",
    "PLUGIN_DEPS",
    "PLUGIN_TEST_DEPS",
)

gerrit_plugin(
    name = "zuul",
    srcs = glob(["src/main/java/**/*.java"]),
    resources = glob(["src/main/**/*"]),
    gwt_module = 'com.googlesource.gerrit.plugins.zuul.Zuul',
    manifest_entries = [
        "Gerrit-PluginName: zuul",
        "Gerrit-ApiType: plugin",
        "Gerrit-Module: com.googlesource.gerrit.plugins.zuul.Module",
        "Gerrit-HttpModule: com.googlesource.gerrit.plugins.zuul.HttpModule",
    ],
)
