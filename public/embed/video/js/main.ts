import Metadata from '../../../../ts/types/metadata'

var plyr: any
var source: any

const Vid = location.pathname.split('/')
const video = Vid[Vid.length - 2].toString()
if (video.startsWith('s')) {
  fetch(`/api/v2/metadata/video/episode/${video}`).then(res => res.json()).then(init)
} else {
  location.replace('/')
}

function init(metadata:Metadata) {
  metadata.id = `s${metadata.season.toString().padStart(2, '0')}.e${metadata.episode.toString().padStart(3, '0')}`

  if (Array.isArray(metadata.sources)) {
    metadata.version = 2
  } else {
    metadata.version = 1
  }

  if (metadata.posters?.[0]?.type == 'image/webp' || metadata.thumbnail) {
    if (supportsWebp()) {
     document.querySelector('video').setAttribute('poster', metadata.posters?.[0]?.src || metadata.thumbnail)
    } else {
      document.querySelector('video').setAttribute('poster', metadata.posters?.[1]?.src || metadata.thumbnail.replace('.webp', '.jpg'))
    }
  } else {
    document.querySelector('video').setAttribute('poster', metadata.posters?.[1]?.src || metadata.thumbnail.replace('.webp', '.jpg'))
  }

  const controls = [
    'play-large',
    'play',
    'progress',
    'current-time',
    'mute',
    'volume',
    metadata.version === 1 ? undefined : metadata.tracks?.length === 0 ? undefined : 'captions',
    'settings',
    'pip',
    'airplay',
    'downloaad',
    'fullscreen'
  ]

  var dlurl: string
  
  if (metadata.version === 2) {
    var lastHighest = {
      size: 0,
      src: ''
    }
    for (var i = 0; i < metadata.sources.length; i++) {
      if (metadata.sources[i].size > lastHighest.size) {
        lastHighest = metadata.sources[i]
      }
    }
  
    dlurl = `${lastHighest.src.replace('//cdn.unusannusarchive.tk', '/cdndownload')}?filename=${metadata.title}.mp4`
  } else if (metadata.version === 1) {
    dlurl = `${metadata.video.replace('//cdn.unusannusarchive.tk', '/cdndownload')}?filename=${metadata.title}.mp4`
  }

  if (metadata.version === 2) {
    for (var i = 0; i < metadata.tracks.length; i++) {
      if (metadata.tracks[i].kind === 'captions') {
        for (var s = 0; s < metadata.tracks[i]?.styles?.length; s++) {
          const stylesheet = document.createElement('link')
          stylesheet.setAttribute('rel', 'stylesheet')
          stylesheet.setAttribute('href', metadata.tracks[i].styles[i])
          document.body.appendChild(stylesheet)
        }
      }
    }
  }

  const settings = [
    'captions',
    'quality',
    'speed'
  ]

  // @ts-ignore (typescript thinks that Plyr doesn't exist when it does)
  plyr = new Plyr('#player', {
    settings,
    controls,
    autoplay: true,
    disableContextMenu: false,
    urls: {
      download: dlurl
    },
    fullscreen: {
      isoNative: true
    },
    previewThumbnails: {
      enabled: true,
      src: `/api/v2/preview/${metadata.id}`
    }
  })

  source = plyr.source = {
    type: 'video',
    title: metadata.title,
    sources: metadata.sources || [{ src: metadata.video, type: 'video/mp4', size: 1080 }],
    tracks: (metadata.tracks?.length || 0) === 0 ? [
      {
        kind: 'captions',
        label: 'No Captions Added'
      }
    ] : metadata.tracks
  }

  const player = document.querySelector('video')

  player.addEventListener('dblclick', () => {
    plyr.fullscreen.toggle()
  })

  setTimeout(() => {
    setCustomCaptionMenuItems()
  }, 1000)

  function setCustomCaptionMenuItems() {
    const menu = document.querySelector(`#plyr-settings-${plyr.id}-captions div[role="menu"]`)
  
    {
      const button = document.createElement('button')
      setAttributes(button, { 'data-plyr': 'language', type: 'button', role: 'menuitemradio', class: 'plyr__control hidecheck', 'aria-checked': 'false', value: '1' })
      const span = document.createElement('span')
      span.innerHTML = `<a target="_blank" style="color:#4a5464;text-decoration:none;" href="//sub.unusann.us/sub/?v=${metadata.id}" onclick="plyr.pause()">Create Captions (beta)</a>`
      button.appendChild(span)
    
      menu.appendChild(button)
    }
  
    {
      const button = document.createElement('button')
      setAttributes(button, { 'data-plyr': 'language', type: 'button', role: 'menuitemradio', class: 'plyr__control hidecheck', 'aria-checked': 'false', value: '1', id: 'upload-subs' })
      const span = document.createElement('span')
      span.innerHTML = 'Upload Captions'
      button.appendChild(span)
    
      button.addEventListener('click', uploadSubs)
  
      menu.appendChild(button)
    }
  }

  function uploadSubs() {
    const element = document.createElement('input')
    element.type = 'file'
    element.style.display = 'none'
    
    document.body.appendChild(element)

    element.click()

    element.addEventListener('change', () => {
      if (element.files[0].name.toLowerCase().endsWith('.vtt')) {
        element.files[0].text().then(addSub)
      } else if (element.files[0].name.toLowerCase().endsWith('.uasub')) {
        element.files[0].text().then((file) => {
          const vtt = new VTT()
          vtt.push(...JSON.parse(file))
          addSub(vtt.toString())
        })
      } else {
        alert('Invalid Captions! Please use the VTT format.')
      }
    })

    function addSub(file:string) {
      if (file.startsWith('WEBVTT')) {
        const url = `data:text/vtt;charset=utf-8,${encodeURIComponent(file)}`
        if ((metadata.tracks?.length || 0) === 0) {
          source.tracks = [
            {
              kind: 'captions',
              label: element.files[0].name,
              src: url,
              default: true
            }
          ]
        } else {
          source.tracks.push({
            kind: 'captions',
            label: element.files[0].name,
            src: url,
            default: true
          })
        }
        plyr.source = source
        setTimeout(() => {
          setCustomCaptionMenuItems()
        }, 1000)
      } else {
        alert('Invalid VTT File!')
      }
    }
  }
}

function setAttributes(element:HTMLElement, attribs = {}) {
  const props = Object.getOwnPropertyNames(attribs)
  for (var i = 0; i < props.length; i++) {
    element.setAttribute(props[i], attribs[props[i]])
  }
}

function supportsWebp():boolean {
  var elem = document.createElement('canvas')

  if (!!(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
  } else {
    return false
  }
}

class VTT extends Array {
  toString() {
    var output = 'WEBVTT'
    for (var i = 0; i < this.length; i++) {
      const from = `${new Date(this[i].time.from * 1000).toISOString().substr(11, 11)}0`
      const to = `${new Date(this[i].time.to * 1000).toISOString().substr(11, 11)}0`
      output += `\n\n${from} --> ${to}\n${this[i].text}`
    }
    return output
  }
}