/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
export default function loadMonaco():Promise<typeof monaco> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    require.config({
      paths: {
        vs: '/node_modules/monaco-editor/min/vs'
      }
    })

    // @ts-ignore
    require(['vs/editor/editor.main'], () => {
      resolve(monaco)
    })
  })
}