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

loadJSON('/api/getallmetadata', (metadata) => {
  for (var i = 0; i < metadata.length; i++) {
    for (var s = 0; s < metadata[i].length; s++) {
      init(metadata[i][s])
    }
  }
})

function init(metadata) {
  checkWidth()
  const template = document.querySelector('#template')
  const vidcontainer = document.querySelector('#vidcontainer')

  const clone = template.content.cloneNode(true)
  const season = `0${metadata.season}`
  var episode = 'error!'
  if (metadata.episode < 10) {
    episode = `00${metadata.episode}`
  } else if (metadata.episode > 9 && metadata.episode < 100) {
    episode = `0${metadata.episode}`
  } else if (metadata.episode > 99) {
    episode = `${metadata.episode}`
  }
  
  clone.querySelector('#url').href = `/watch/?v=s${season}.e${episode}`
  if (metadata.thumbnail == '') {
    clone.querySelector('#thumbnail').src = '/img/no-thumbnail.jpg'
  } else {
    if (metadata.thumbnail.endsWith('.webp')) {
      if (supportsWebp()) {
        clone.querySelector('#thumbnail').src = metadata.thumbnail
      } else {
        clone.querySelector('#thumbnail').src = metadata.thumbnail.replace('.webp', '.jpg')
      }
    } else {
      clone.querySelector('#thumbnail').src = metadata.thumbnail
    }
  }
  clone.querySelector('#title').innerText = metadata.title
  if (metadata.season == 0) {
    clone.querySelector('#season').innerText = 'Specials'
  } else {
    clone.querySelector('#season').innerText = `Season ${metadata.season}`
  }
  clone.querySelector('#episode').innerText = `Episode ${metadata.episode}`
  
  clone.querySelector('#thumbnail').addEventListener('error', () => {
    document.querySelector('#err').style.display = 'initial'
  })

  vidcontainer.appendChild(clone)
}

window.addEventListener('resize', checkWidth)

function checkWidth() {
  if (window.innerWidth < 1000) {
    document.querySelector('#vidcontainer').style.width = `${window.innerWidth}px`
    if (window.innerWidth < 505) {
      document.querySelector('#vidcontainer').style['grid-template-columns'] = 'auto'
    } else if (window.innerWidth < 750) {
      document.querySelector('#vidcontainer').style['grid-template-columns'] = 'auto auto'
    } else {
      document.querySelector('#vidcontainer').style['grid-template-columns'] = 'auto auto auto'
    }
  }
}

function supportsWebp()
{
 var elem = document.createElement('canvas');

 if (!!(elem.getContext && elem.getContext('2d')))
 {
  // was able or not to get WebP representation
  return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
 }
 else
 {
  // very old browser like IE 8, canvas not supported
  return false;
 }
}