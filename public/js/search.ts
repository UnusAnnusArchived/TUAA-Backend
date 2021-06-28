import Metadata, { GlobalMetadata, Poster, PreviewSprite, Source, Track } from '../../ts/types/metadata'

const searchbox = <HTMLInputElement>document.getElementById('searchbox')

var lastQuery = ''

function videosLoaded(oldMetadata:GlobalMetadata) {
  var metadata:AllMetadata[] = []
  for (var s = 0; s < oldMetadata.videos.length; s++) {
    for (var e = 0; e < oldMetadata.videos[s].length; e++) {
      metadata.push(oldMetadata.videos[s][e])
    }
  }
  for (var i = 0; i < oldMetadata.music.length; i++) {
    metadata.push(oldMetadata.music[i])
  }
  searchbox.oninput = () => {
    const timeBefore = performance.now()
    //Get results
    const query = searchbox.value.toLowerCase().split(' ')
    lastQuery = query.join(' ')
    var results:AllMetadata[] = []
    if (searchbox.value === '') {
      results = metadata
    } else {
      for (var i = 0; i < metadata.length; i++) {
        for (var q = 0; q < query.length; q++) {
          if (metadata[i].title?.toLocaleLowerCase().split(' ').includes(query[q])) {
            if (!results.includes(metadata[i])) {
              results.push(metadata[i])
            }
          } else if (metadata[i].episode?.toString() == query[q]) {
            if (!results.includes(metadata[i])) {
              results.push(metadata[i])
            }
          }
        }
      }
    }

    //Render results
    const vidcontainer = document.getElementById('vidcontainer')
    vidcontainer.innerHTML = ''
    document.getElementById('searchStat').innerHTML = ''

    if (results.length === 0) {
      const timeAfter = performance.now()
      document.getElementById('searchStat').innerText = `No results found! (${Math.round((timeAfter-timeBefore))/1000} seconds)`
    }
    setTimeout(() => {
      if (lastQuery === query.join(' ')) {
        setResults(results, metadata, timeBefore)
      }
    }, 500)
  }
}

function setResults(results:AllMetadata[], metadata:AllMetadata[], timeBefore:number) {
  const template = <HTMLTemplateElement>document.getElementById('template')

  for (var i = 0; i < results.length; i++) {
    const clone = <HTMLElement>template.content.cloneNode(true)

    if (results[i].video || results[i].sources) {
      const season = results[i].season.toString().padStart(2, '0')
      const episode = results[i].episode.toString().padStart(3, '0');

      (<HTMLLinkElement>clone.querySelector('#url')).href = `/watch/?v=s${season}.e${episode}`
      if (results[i].thumbnail?.endsWith('.webp') || results[i].posters?.[0]) {
        if (supportsWebp()) {
          (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail || results[i].posters?.[0].src
        } else {
          (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail.replace('.webp', '.jpg') || results[i].posters?.[1].src
        }
      } else {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail || results[i].posters?.[0].src
      }
      (<HTMLParagraphElement>clone.querySelector('#title')).innerText = results[i].title
      if (results[i].season === 0) {
        (<HTMLSpanElement>clone.querySelector('#season')).innerText = 'Specials'
      } else {
        (<HTMLSpanElement>clone.querySelector('#season')).innerText = `Season ${results[i].season}`
      }
      (<HTMLSpanElement>clone.querySelector('#episode')).innerText = `Episode ${results[i].episode}`
    } else {
      (<HTMLLinkElement>clone.querySelector('#url')).href = `/music/?s=${results[i].i}`
      if (results[i].thumbnail?.endsWith('.webp')) {
        if (supportsWebp()) {
          (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail
        } else {
          (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail.replace('.webp', '.jpg')
        }
      } else {
        (<HTMLImageElement>clone.querySelector('#thumbnail')).src = results[i].thumbnail
      }
      (<HTMLParagraphElement>clone.querySelector('#title')).innerText = `${results[i].title} (${results[i].type})`;
      (<HTMLSpanElement>clone.querySelector('#season')).innerText = 'Music';
      (<HTMLSpanElement>clone.querySelector('#episode')).innerText = `Son ${results[i].number}`
    }

    (<HTMLImageElement>clone.querySelector('#thumbnail')).addEventListener('error', () => {
      document.getElementById('err').style.display = 'initial'
    })
    
    document.getElementById('vidcontainer').appendChild(clone)
  }
  const timeAfter = performance.now()

  if (results !== metadata) {
    document.getElementById('searchStat').innerHTML = `${results.length} results (${Math.round((timeAfter-timeBefore))/1000} seconds)<br />`
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

interface AllMetadata {
  video?: string,
  sources?: Source[],
  tracks?: Track[],
  thumbnail?: string,
  posters?: Poster[],
  previewSprites?: PreviewSprite[],
  season?: number,
  episode?: number,
  title: string,
  description?: string,
  date?: number,
  releasedate?: number,
  duration?: number,
  audio?: string,
  type?: string,
  artist?: string,
  i?: string,
  number?: number
}