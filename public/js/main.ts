import Metadata, { GlobalMetadata } from '../../ts/types/metadata'
import MusicMetadata from '../../ts/types/musicmetadata'

var globalMetadata:GlobalMetadata = {}

fetch('/api/v2/metadata/video/all').then(res => res.json()).then((metadata:Metadata[][]) => {
  globalMetadata.videos = metadata
  for (var s = 0; s < metadata.length; s++) {
    for (var e = 0; e < metadata[s].length; e++) {
      init(metadata[s][e])
    }
  }
  //Music
  fetch('/api/v2/metadata/music/all').then(res => res.json()).then((metadata:MusicMetadata[]) => {
    globalMetadata.music = metadata
    for (var m = 0; m < metadata.length; m++) {
      initmusic(metadata[m])
    }
    document.getElementById('loadingText').remove()
    // @ts-ignore (it's in a different file so ts gets confused)
    videosLoaded(globalMetadata)
  })
})

function init(metadata:Metadata):void {
  const template = <HTMLTemplateElement>document.getElementById('template')
  const vidcontainer = document.getElementById('vidcontainer')

  const clone = <HTMLElement>template.content.cloneNode(true)
  const season = metadata.season.toString().padStart(2, '0')
  const episode = metadata.episode.toString().padStart(3, '0');

  (<HTMLLinkElement>clone.querySelector('#url')).href = `/watch/?v=s${season}.e${episode}`
  if (metadata.thumbnail == '') {
    (<HTMLImageElement>clone.querySelector('#thumbnail')).src = '/img/no-thumbnail.jpg'
  } else {
    if (metadata.posters?.[0]?.type == 'image/webp' || metadata.thumbnail.endsWith('.webp')) {
      if (supportsWebp()) {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.posters?.[0]?.src || metadata.thumbnail
      } else {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.posters?.[1]?.src || metadata.thumbnail.replace('.webp', '.jpg')
      }
    } else {
      (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.posters?.[0]?.src || metadata.thumbnail
    }
  }
  (<HTMLImageElement>clone.querySelector('#thumbnail')).alt = `Thumbnail for "${metadata.title}"`;
  (<HTMLParagraphElement>clone.querySelector('#title')).innerText = metadata.title
  if (metadata.season == 0) {
    (<HTMLSpanElement>clone.querySelector('#season')).innerText = 'Specials'
  } else {
    (<HTMLSpanElement>clone.querySelector('#season')).innerText = `Season ${metadata.season}`
  };
  (<HTMLSpanElement>clone.querySelector('#episode')).innerText = `Episode ${metadata.episode}`;

  (<HTMLImageElement>clone.querySelector('#thumbnail')).addEventListener('error', () => {
    (<HTMLDivElement>document.querySelector('#err')).style.display = 'initial'
  })

  vidcontainer.appendChild(clone)
}

function initmusic(metadata:MusicMetadata):void {
  const template = <HTMLTemplateElement>document.getElementById('template')
  const vidcontainer = document.getElementById('vidcontainer')

  const clone = <HTMLElement>template.content.cloneNode(true);
  (<HTMLImageElement>clone.querySelector('#thumbnail'))
  if (metadata.thumbnail == '') {
    (<HTMLImageElement>clone.querySelector('#thumbnail')).src = '/img/no-thumbnail./jpg'
  } else {
    if (metadata.thumbnail.endsWith('.webp')) {
      if (supportsWebp()) {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.thumbnail
      } else {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.thumbnail.replace('.webp', '.jpg')
      }
    } else {
      (<HTMLImageElement>clone.querySelector('#thumbnail')).src = metadata.thumbnail
    }
  };
  (<HTMLImageElement>clone.querySelector('#thumbnail')).alt = `Thumbnail for "${metadata.title}"`
  clone.querySelector('#thumbnail').classList.add('music');
  (<HTMLParagraphElement>clone.querySelector('#title')).innerText = `${metadata.title} (${metadata.type})`;
  (<HTMLSpanElement>clone.querySelector('#season')).innerText = 'Music';
  (<HTMLSpanElement>clone.querySelector('#episode')).innerText = `Song ${metadata.number}`;

  (<HTMLImageElement>clone.querySelector('#thumbnail')).addEventListener('error', () => {
    document.getElementById('err').style.display = 'initial'
  })

  vidcontainer.appendChild(clone)
}

function supportsWebp():boolean {
  var elem = document.createElement('canvas')

  if (!!(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
  } else {
    return false
  }
}