import User from '../../../../ts/types/user'
import LogoutResponse from '../../../../ts/types/logoutres'

const loginKey = localStorage.getItem('loginKey')
if (loginKey) {
  (<HTMLFormElement>document.getElementById('pfpform-loginKey')).value = loginKey
  const user:User = JSON.parse(localStorage.getItem('user'));
  (<HTMLImageElement>document.getElementById('currentpfp')).src = user.pfp.filename
} else  {
  location.replace('/account/login/')
}

var pfpErrorCounter = 0

document.getElementById('currentpfp').onerror = () => {
  const pfp = <HTMLImageElement>document.getElementById('currentpfp')
  pfpErrorCounter++
  if (pfpErrorCounter > 5) {
    console.log('Failed to load profile picture 5 times. It most likely doesn\'t exist. Using default.')
    pfp.src = '/userdata/profilepics/default.jpg'
  } else {
    console.log('Failed to load profile picture, trying again...')
    pfp.src = pfp.src
  }
}

function showpfpupdateform() {
  document.getElementById('pfpupdateform').style.display = 'block'
  document.getElementById('showpfpupdateform').style.display = 'none'
}

function hidepfpupdateform() {
  document.getElementById('pfpupdateform').style.display = 'none'
  document.getElementById('showpfpupdateform').style.display = 'block';

  //Reset form
  (<HTMLFormElement>document.getElementById('pfpfileinput')).value = null
  const user:User = JSON.parse(localStorage.getItem('user'));
  (<HTMLImageElement>document.getElementById('currentpfp')).src = user.pfp.filename
}

document.getElementById('pfpfileinput').onchange = pfpFormFileUpdated

function pfpFormFileUpdated() {
  const file = (<HTMLFormElement>document.getElementById('pfpfileinput')).files[0]
  const reader = new FileReader()

  reader.addEventListener('load', () => {
    (<HTMLImageElement>document.getElementById('currentpfp')).src = <string>reader.result
  }, false)

  if (file) {
    reader.readAsDataURL(file)
  }
}

document.getElementById('locallogout').onclick = async() => {
  const response:LogoutResponse = await fetch('/api/v2/account/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: JSON.parse(localStorage.getItem('user')).id,
      loginKey: localStorage.getItem('loginKey')
    })
  }).then(res => res.json())
  if (response.status === 'success') {
    location.href = '/account/login'
  } else if (response.status === 'error') {
    alert(response.error)
  } else {
    alert('An unknown error has occurred!')
  }
}

document.getElementById('logoutall').onclick = async() => {
  const response:LogoutResponse = await fetch('/api/v2/account/logoutall', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: JSON.parse(localStorage.getItem('user')).id
    })
  }).then(res => res.json())
  if (response.status === 'success') {
    location.href = '/account/login'
  } else if (response.status === 'error') {
    alert(response.error)
  } else {
    alert('An unknown error occurred!')
  }
}