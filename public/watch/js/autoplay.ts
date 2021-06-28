import { globalmetadata } from './main.js'

var autoplayEnabled = false
if (localStorage.getItem('autoplay') == 'true') {
  autoplayEnabled = true;
  (<HTMLInputElement>document.getElementById('autoplayCheck')).checked = true
}

var autoplayCanceled = false
var autoplayInt:any

export function initAutoPlay() {
  const player = document.getElementsByTagName('video')[0]

  player.addEventListener('ended', () => {
    if (autoplayEnabled) {
      document.getElementById('autoplayCountDown').style.display = 'inline-block'

      document.getElementById('previousnext').style.position = 'relative'
      document.getElementById('previousnext').style.bottom = '565px'

      document.getElementById('info').style.position = 'relative'
      document.getElementById('info').style.bottom = '565px'

      var seconds = 5
      document.getElementById('seconds').innerText = seconds.toString()
      seconds--
      autoplayInt = setInterval(() => {
        document.getElementById('seconds').innerText = seconds.toString()
        seconds--
      }, 1000)
      
      setTimeout(() =>  {
        if (!autoplayCanceled) {
          playNextVideo()
        }
      }, 5000)
    }
  })
}

function playNextVideo() {
  var season:string
  var episode:string

  if (globalmetadata.islast) {
    season = (globalmetadata.season+1).toString().padStart(2, '0')
    episode = '001'
  } else {
    season = globalmetadata.season.toString().padStart(2, '0')
    episode = (globalmetadata.episode+1).toString().padStart(3, '0')
  }

  location.search = `?v=s${season}.e${episode}`
}

document.getElementById('playNow').onclick = playNextVideo

document.getElementById('cancelAutoplay').onclick = () => {
  autoplayCanceled = true
  clearInterval(autoplayInt)

  document.getElementById('autoplayCountDown').style.display = ''

  document.getElementById('previousnext').style.position = ''
  document.getElementById('previousnext').style.bottom = ''
  
  document.getElementById('info').style.position = ''
  document.getElementById('info').style.bottom = ''
}

document.getElementById('autoplayCheck').onclick = () => {
  autoplayEnabled = !autoplayEnabled
  localStorage.setItem('autoplay', (!autoplayEnabled).toString())
}