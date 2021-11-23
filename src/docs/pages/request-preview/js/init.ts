import loadMonaco from './loadMonaco.js'
import loadTheme from './monacoTheme.js'
import main from './main.js'

(async() => {
  const monaco = await loadMonaco()

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({ validate: true, allowComments: false, schemas: [], enableSchemaRequest: true })

  loadTheme(monaco)

  const output = monaco.editor.create(document.getElementById('output'), {
    value: 'Loading...',
    theme: 'atomOneDark',
    tabSize: 2,
    readOnly: true,
    automaticLayout: true,
    wordWrap: 'on',
    minimap: {
      enabled: true
    }
  })

  main(monaco, output)
})()