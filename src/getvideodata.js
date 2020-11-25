const fetch = require('node-fetch')

const baseurl = 'https://cdn.example.tk'

exports.episode = (str, callback) => {
  const strsplit = str.toLowerCase().split('.')
  const season = strsplit[0].replace('s', '')
  const episode = strsplit[1].replace('e', '')

  fetch(`${baseurl}/metadata/${season}/${episode}.json`)
  .then(res => res.text())
  .then((metadata) => {
    try {
      callback(JSON.parse(metadata))
    } catch {
      callback({
        video: `${baseurl.replace('https://', '//')}/${season}/${episode}.mp4`,
        season: season,
        episode: episode,
        title: `Episode ${episode}`,
        description: 'Failed to fetch metadata',
        releasedate: '',
        runtime: '0',
        thumbnail: ''
      })
    }
  })
}

exports.all = (callback) => {
  fetch(`${baseurl}/metadata/all.json`)
  .then(res => res.json())
  .then((metadata) => {
    callback(metadata)
  })
}

exports.s00 = (callback) => {
  fetch(`${baseurl}/metadata/00.json`)
  .then(res => res.json())
  .then((metadata) => {
    callback(metadata)
  })
}

exports.s01 = (callback) => {
  fetch(`${baseurl}/metadata/01.json`)
  .then(res => res.json())
  .then((metadata) => {
    callback(metadata)
  })
}