function loadJSON(location, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', location, true);
  xobj.onreadystatechange = () => {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  }
  xobj.send(null);
}

if (location.search == '') {
  location.replace('../')
} else if (location.search.startsWith('?v=') && location.search.includes('s=')) {
  const str = location.search.split('&')[0].toLowerCase().replace('?v=', '')
  const stream = location.search.split('&')[1].toLowerCase().replace('s=', '')
  loadJSON(`/api/getvideodata/${str}`, (metadata) => {
    init(metadata, stream)
  })
} else if (location.search.startsWith('?v=')) {
  const str = location.search.split('&')[0].toLowerCase().replace('?v=', '')
  loadJSON(`/api/getvideodata/${str}`, (metadata) => {
    init(metadata, 'auto')
  })
}

var globalmetadata


//Initialize video player and set video properties
function init(metadata, stream) {
  globalmetadata = metadata
  setTimeout(() => {
    checkWidth()
  }, 1000)
  //init player
  const player = document.querySelector('#player')
  if (stream == 'auto') {
    if (metadata.streams) {
      const streams = metadata.streams
      if (streams.includes('vp9') && supportsVideoType('vp9')) {
        console.log('Using VP9')
        player.src = generateStreamUrl(metadata.video, 'vp9')
      } else {
        console.log('Using Main')
        player.src = `${metadata.video}`
      }
    } else {
      console.log('Using Main')
      player.src = `${metadata.video}`
    }
  } else if (stream == 'main') {
    player.src = `${metadata.video}`
  } else if (stream == 'mkv') {
    player.src = metadata.video.replace('.mp4', '.mkv')
  } else if (stream == 'mp4') {
    player.src = metadata.video
  } else {
    player.src = generateStreamUrl(metadata.video, stream)
  }

  //Check if browser supports lossy webp, if so then use webp, if not, use jpeg
  if (metadata.thumbnail.includes('.webp')) {
    checkwebpfeature('lossy', (feature, isSupported) => {
      if (isSupported) {
        player.poster = metadata.thumbnail
      } else {
        player.poster = metadata.thumbnail.replace('.webp', '.jpg')
      }
    })
  } else {
    player.poster = metadata.thumbnail
  }

  //If episode is 368, set custom player and info size to use ep368's aspect ratio
  if (metadata.episode === 368) {
    document.querySelector('#info').style.width = '1312.5px'
    document.querySelector('#previousnext').style.width = '1312.5px'
    player.style.width = '1312.5px'
  }

  if (metadata.episode === 1) {
    document.querySelector('#previous').style.display = 'none'
  }

  if (metadata.islastep) {
    document.querySelector('#next').style.display = 'none'
    document.querySelector('#previous').style.bottom = '0'
  }

  if (metadata.description === 'Failed to fetch metadata') {
    document.querySelector('#previousnext').style.display = 'none'
  }

  //set video properties
  const videodata = document.querySelector('#videodata')
  const pagetitle = document.querySelector('#pagetitle')
  const title = document.querySelector('#title')
  const season = document.querySelector('#season')
  const episode = document.querySelector('#episode')
  const release = document.querySelector('#release')
  const description = document.querySelector('#description')

  //title
  title.innerText = metadata.title
  
  if (metadata.season === 0) {
    //page title
    pagetitle.innerText = `Specials - Episode ${metadata.episode} | ${metadata.title}`
    //season
    season.innerText = 'Specials'
  } else {
    //page title
    pagetitle.innerText = `Season ${metadata.season} - Episode ${metadata.episode} - ${metadata.title}`
    //season
    season.innerText = `Season ${metadata.season}`
  }
  //episode
  episode.innerText = `Episode ${metadata.episode}`
  //release date
  release.innerText = new Date(`${metadata.releasedate.split('-').join('/')} 2:00 PM`).toDateString()
  //description
  description.innerText = metadata.description
}

window.addEventListener('resize', checkWidth)

function checkWidth() {
  if (globalmetadata.episode === 368) {
    if (window.innerWidth < 1312.5) {
      document.querySelector('#player').style.width = `${window.innerWidth}px`
      document.querySelector('#info').style.width = `${window.innerWidth}px`
      document.querySelector('#previousnext').style.width = `${window.innerWidth}px`
    }
  } else if (window.innerWidth < 1000) {
    document.querySelector('#player').style.width = `${window.innerWidth}px`
    document.querySelector('#info').style.width = `${window.innerWidth}px`
    document.querySelector('#previousnext').style.width = `${window.innerWidth}px`
  }
}

function checkwebpfeature(feature, callback) {
  var kTestImages = {
      lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
      lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
      alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
      animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
  };
  var img = new Image();
  img.onload = function () {
      var result = (img.width > 0) && (img.height > 0);
      callback(feature, result);
  };
  img.onerror = function () {
      callback(feature, false);
  };
  img.src = "data:image/webp;base64," + kTestImages[feature];
}

function supportsVideoType(type) {
  let video;

  let formats = {
    ogg: 'video/ogg; codecs="theora"',
    h264: 'video/mp4; codecs="avc1.42E01E"',
    webm: 'video/webm; codecs="vp8, vorbis"',
    vp9: 'video/webm; codecs="vp9"',
    hls: 'application/x-mpegURL; codecs="avc1.42E01E"'
  }

  if (!video) {
    video = document.createElement('video')
  }

  canplay = video.canPlayType(formats[type] || type)

  if (canplay === 'probably') {
    return true
  } else {
    return false
  }
}

function previous() {
  var episode = `${globalmetadata.episode - 1}`
  if (episode.length === 1) {
    episode = `00${episode}`
  } else if (episode.length === 2) {
    episode = `0${episode}`
  }
  const season = `0${globalmetadata.season}`

  location.search = `?v=s${season}.e${episode}`
}

function next() {
  var episode = `${globalmetadata.episode + 1}`
  if (episode.length === 1) {
    episode = `00${episode}`
  } else if (episode.length === 2) {
    episode = `0${episode}`
  }
  const season = `0${globalmetadata.season}`

  location.search = `?v=s${season}.e${episode}`
}

function generateStreamUrl(baseurl, stream) {
  var url = baseurl.split('/')
  url[url.length - 1] = ''
  var file = baseurl.split('/')[url.length - 1].split('.')
  file[0] = `${file[0]}-${stream}`
  url = `${url.join('/')}${file.join('.')}`
  console.log(`Generated Video URL:\n${location.protocol}${url}`)
  return url
}