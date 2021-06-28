import SignUpResponse from '../../../../ts/types/signupres'
import LoginResponse from '../../../../ts/types/loginres'

if (localStorage.getItem('loginKey')) {
  location.replace('/account/manage/')
}

document.getElementById('signup').onclick = () => {
  const email = (<HTMLInputElement>document.getElementById('email')).value
  const username = (<HTMLInputElement>document.getElementById('username')).value
  const password = (<HTMLInputElement>document.getElementById('password')).value
  const confirmpassword = (<HTMLInputElement>document.getElementById('confirmpassword')).value

  if (password !== confirmpassword) {
    return loginErrorParser({code:0})
  }
  if (!email || !username || !password || !confirmpassword) {
    return loginErrorParser({code:2})
  }

  fetch('/api/v2/account/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({email, username, password, confirmpassword})
  }).then(res => res.json()).then((res:SignUpResponse) => {
    if (res.success) {
      fetch(res.loginURI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({username, password, sendEmail: 'false'/* disable sending a login email after account creation */})
      }).then(res => res.json()).then((loginRes:LoginResponse) => {
        if (loginRes.isValid) {
          localStorage.setItem('loginKey', loginRes.loginKey)
          const redirect = getQueryVariable('redirect') || '/'
          location.replace(redirect)
        } else {
          const err = new Error('An unknown error occurred!')
          alert(err.toString())
          throw err
        }
      })
    } else {
      return loginErrorParser(res.error)
    }
  })
}

function loginErrorParser(err:Err) {
  const error = document.getElementById('error')
  if (err.code) {
    switch (err.code) {
      case 0 : {
        error.innerHTML = 'Passwords do not match!<br>';
        (<HTMLInputElement>document.getElementById('password')).value = '';
        (<HTMLInputElement>document.getElementById('confirmpassword')).value = ''
      }
      case 1: {
        error.innerHTML = 'Account exists! Are you trying to <a style="color:#ff3939;" href="/account/login">login</a>?<br>'
        clearForm()
      }
      case 2: {
        error.innerHTML = 'The form is missing data!<br>'
      }
      default: {
        errFromDetails()
      }
    }
  } else {
    errFromDetails()
  }

  function errFromDetails() {
    error.innerHTML = (err.message || 'Unknown error!') + '<br>'
    clearForm()
  }
}

function clearForm() {
  (<HTMLInputElement>document.getElementById('email')).value = '';
  (<HTMLInputElement>document.getElementById('username')).value = '';
  (<HTMLInputElement>document.getElementById('password')).value = '';
  (<HTMLInputElement>document.getElementById('confirmpassword')).value = ''
}

interface Err {
  code?: number,
  message?: string
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