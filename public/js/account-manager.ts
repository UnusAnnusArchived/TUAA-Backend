if (localStorage.getItem('loginKey')) {
  document.getElementById('login').innerHTML = '<a href="/account/manage/">Manage Account</a>'
}