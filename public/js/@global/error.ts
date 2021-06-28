var oldBody:HTMLBodyElement

function createError(err:Error):void {
  oldBody = <HTMLBodyElement>document.body

  const body = document.createElement('body')

  const container = document.createElement('div')
  container.style.maxWidth = '1000px'
  container.style.display = 'inline-block'

  const h1 = document.createElement('h1')
  h1.innerText = 'It appears an error has occurred!'

  const pre = document.createElement('pre')
  pre.innerHTML = err.stack || err.message
  pre.style.color = '#ff0000'
  pre.style.textAlign = 'left'

  const p = document.createElement('p')
  p.innerHTML = 'Please email this error message, exact URL, browser, and browser version to me at <a style="color:#ffffff;" href="mailto:contact@unusannusarchive.tk">contact@unusannusarchive.tk</a><br />(if you don\'t know how to find some of these, you can leave them out of the email)'

  const span = document.createElement('span')
  span.innerHTML = '<a style="color:#ffffff;" href="/">Go Home</a><br /><a style="color:#ffffff" href="#" onclick="restoreOldBody()">Close Error</a><br /><a style="color:#ffffff;" href="#" onclick="location.reload()">Try Again</a><p>(please attempt at least one retry before contacting us, because that usually solves the issue)</p>'
  span.style.display = 'inline-block'
  span.style.marginTop = '100px'

  container.appendChild(h1)
  container.appendChild(pre)
  container.appendChild(document.createElement('br'))
  container.appendChild(p)
  container.appendChild(span)

  body.appendChild(container)

  document.body = body
}

function restoreOldBody() {
  document.body = oldBody
}