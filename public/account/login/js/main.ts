import LoginResponse from '../../../../ts/types/loginres'

if (localStorage.getItem('loginKey')) {
  location.replace('/account/manage/')
}

document.getElementById('login').onclick = () =>  {
  const username = (<HTMLInputElement>document.getElementById('username')).value
  const password = (<HTMLInputElement>document.getElementById('password')).value

  fetch('/api/v2/account/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  }).then(res => res.json()).then((res:LoginResponse) => {
    if (res.isValid) {
      localStorage.setItem('loginKey', res.loginKey)
      localStorage.setItem('user', JSON.stringify(res.user))
      const redirect = getQueryVariable('redirect') || '/'
      location.replace(redirect)
    } else {
      const error = document.getElementById('error')
      error.innerHTML = 'That account doesn\'t exist! Ary you trying to <a style="color:#ff3939;" href="/account/signup">sign up</a>?<br>'
      clearForm()
    }
  })

  function clearForm():void {
    (<HTMLInputElement>document.getElementById('username')).value = '';
    (<HTMLInputElement>document.getElementById('password')).value = ''
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