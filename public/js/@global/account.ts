import CheckLoginKeyResponse from '../../../ts/types/checkloginkeyres'

//Make a new context so we dont interfere with any other scripts
{
  const loginKey = localStorage.getItem('loginKey')

  if (loginKey) {
    fetch('/api/v2/account/checkloginkey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({loginKey})
    }).then(res => res.json()).then((res:CheckLoginKeyResponse) => {
      if (res.isValid) {
        localStorage.setItem('user', JSON.stringify(res.user))
      } else {
        localStorage.removeItem('loginKey')
        localStorage.removeItem('user')
        location.reload()
      }
    })
  } else {
    localStorage.removeItem('user')
  }
}