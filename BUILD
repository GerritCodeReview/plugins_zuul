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
    manifest_entries = [
        "Gerrit-PluginName: zuul",
        "Gerrit-ApiType: plugin",
        "Gerrit-Module: com.googlesource.gerrit.plugins.zuul.Module",
        "Gerrit-HttpModule: com.googlesource.gerrit.plugins.zuul.HttpModule",
    ],
)

# this is required for bucklets/tools/eclipse/project.py to work
java_library(
    name = 'classpath',
    deps = [':zuul__plugin'],
)
