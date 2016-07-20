include_defs('//bucklets/gerrit_plugin.bucklet')

gerrit_plugin(
  name = 'chound',
  srcs = glob(['src/main/java/**/*.java']),
  resources = glob(['src/main/**/*']),
  gwt_module = 'com.googlesource.gerrit.plugins.chound.Chound',
  manifest_entries = [
    'Gerrit-PluginName: chound',
    'Gerrit-ApiType: plugin',
    'Gerrit-ApiVersion: 2.12-SNAPSHOT',
    'Gerrit-Module: com.googlesource.gerrit.plugins.chound.Module',
    'Gerrit-HttpModule: com.googlesource.gerrit.plugins.chound.HttpModule',
  ],
)

# this is required for bucklets/tools/eclipse/project.py to work
java_library(
  name = 'classpath',
  deps = [':chound__plugin'],
)
