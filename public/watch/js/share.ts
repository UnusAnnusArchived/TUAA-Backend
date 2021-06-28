import { globalmetadata } from './main.js'

if (!navigator.share) {
  document.getElementById('share').style.display = 'none'

  document.getElementById('share').onclick = () => {
    if (navigator.share) {
      navigator.share({
        title: globalmetadata.title,
        url: `https://uaarchive.tk/${globalmetadata.id}`
      })
    } else {
      alert('Sharing is not yet supported in your browser!')
    }
  }
}