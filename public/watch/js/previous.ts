import { globalmetadata } from './main.js'

document.getElementById('previousvideo').onclick = previous

function previous() {
  const season = globalmetadata.season.toString().padStart(2, '0')
  const episode = (globalmetadata.episode - 1).toString().padStart(3, '0')
  location.search = `?v=s${season}.e${episode}`
}