/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
export default function main(Monaco:typeof monaco, output:monaco.editor.IStandaloneCodeEditor) {
  const apiPath = ''

  var urlHasOptions = false

  if (getQueryVariable('showparams') === 'true') {
    if (getQueryVariable('customparamsheight')) {
      document.getElementById('request-params').style.height = getQueryVariable('customparamsheight') + 'px'
    }
    document.getElementById('output').classList.add('withparams')
    var params:Param[] = JSON.parse(decodeURIComponent(getQueryVariable('params')))
    urlHasOptions = true
    document.getElementById('request-params').classList.remove('hidden')
    if (getQueryVariable('value')) {
      document.body.innerText = 'YOU CANNOT USE A VALUE WITH PARAMS!'
    }
    const path = getQueryVariable('path')
    var defaultVarPath = ''
    var defaultQuery = []
    for (var i = 0; i < params.length; i ++) {
      if (params[i].type === 'query') {
        defaultQuery.push(`${params[i].id}=${params[i].default}`)
      } else {
        if (i === (params.length-1)) {
          defaultVarPath += params[i].default
        } else {
          defaultVarPath += params[i].default + '/'
        }
      }
    }
    const defaultQueryStr = '?' + defaultQuery.join('&')
    makeRequest(`${path}${path.endsWith('/') ? '' : '/'}${defaultVarPath}${defaultQueryStr}`)

    var ids = []
    for (var i = 0; i < params.length; i++) {
      if (params[i].name && params[i].default && params[i].id) {
        ids.push(params[i].id)
        const template = (<HTMLElement>(<HTMLTemplateElement>document.getElementById('param-template')).content.cloneNode(true))
        const span = template.querySelector('span')
        span.innerText = params[i].name
        span.id = `${params[i].id}-span`
        const input = template.querySelector('input')
        input.value = params[i].default
        input.placeholder = params[i].default
        input.id = `${params[i].id}-input`
        if (params[i].type) {
          input.setAttribute('data-type', params[i].type)
        }

        document.getElementById('request-params').prepend(template)
      }
    }

    document.getElementById('submit').addEventListener('click', () => {
      var varPath = ''
      var varQuery = []
      for (var i = 0; i < ids.length; i++) {
        const input = <HTMLInputElement>document.getElementById(`${ids[i]}-input`)
        const type = input.getAttribute('data-type')
        if (type === 'query') {
          varQuery.push(`${ids[i]}=${input.value}`)
        } else {
          if (i === (params.length - 1)) {
            varPath += encodeURIComponent(input.value)
          } else {
            varPath += encodeURIComponent(input.value) + '/'
          }
        }
      }
      const varQueryStr = '?' + varQuery.join('&')
      makeRequest(`${path}${path.endsWith('/') ? '' : '/'}${varPath}${varQueryStr}`)
    })
  }

  if (!urlHasOptions) {
    if (getQueryVariable('value')) {
      if (getQueryVariable('language')) {
        if (getQueryVariable('language').toLowerCase() === 'json') {
          const model = monaco.editor.createModel(JSON.stringify(JSON.parse(decodeURIComponent(getQueryVariable('value'))), null, 2), 'json')
          output.setModel(model)
        } else {
          const model = monaco.editor.createModel(decodeURIComponent(getQueryVariable('value')), getQueryVariable('language'))
          output.setModel(model)
        }
      } else {
        try {
          const model = monaco.editor.createModel(JSON.stringify(JSON.parse(decodeURIComponent(getQueryVariable('value'))), null, 2), 'json')
          output.setModel(model)
        } catch {
          const model = monaco.editor.createModel(decodeURIComponent(getQueryVariable('value')), undefined)
          output.setModel(model)
        }
      }
    } else {
      makeRequest(getQueryVariable('path'))
    }
  }

  function makeRequest(path:string) {
    console.log()
    fetch(`${apiPath}${path}`).then(res => res.text()).then((res) => {
      try {
        res = JSON.stringify(JSON.parse(res), null, 2)
        const model = monaco.editor.createModel(res, 'json')
        output.setModel(model)
      } catch (err) {
        console.error(err)
        const model = monaco.editor.createModel(res, undefined)
        output.setModel(model)
      }
    })
  }
}

function getQueryVariable(variable:string):string {
  var query = location.search.substring(1)
  var vars = query.split('&')
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')
    if (pair[0] == variable) {
      return pair[1]
    }
  }
}

interface Param {
  name: string,
  id: string,
  default: string,
  type?: 'query'|'param'
}