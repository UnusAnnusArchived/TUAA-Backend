import { Application } from 'express'
import Metadata from '../../../../ts/types/metadata'
import Feed, { Episode } from '../../../../ts/types/rokumetadata'

import fs from 'fs'
import { metadataPath } from '../../../config.json'

export default function feed(app:Application) {
  app.get('/api/roku/v1/feed', (req, res) => {
    var allMetadata:Metadata[][] = [[], []]

    const s00 = fs.readdirSync(`${metadataPath}/00`)
    for (var i = 0; i < s00.length; i++) {
      allMetadata[0].push(JSON.parse(fs.readFileSync(`${metadataPath}/00/${s00[i]}`, 'utf-8')))
    }

    const s01 = fs.readdirSync(`${metadataPath}/01`)
    for (var i = 0; i < s01.length; i++) {
      allMetadata[1].push(JSON.parse(fs.readFileSync(`${metadataPath}/00/${s01[i]}`, 'utf-8')))
    }

    res.send(<Feed>{
      providerName: 'The Unus Annus Archive',
      lastUpdated: new Date().toISOString(),
      language: 'en',
      playlists: [
        {
          name: 'Specials',
          itemIds: allMetadata[0].map((episode) => {
            return `s${episode.season.toString().padStart (2, '0')}.e${episode.episode.toString().padStart(3, '0')}`
          })
        },
        {
          name: 'Season 1',
          itemIds: allMetadata[1].map((episode) => {
            return `s${episode.season.toString().padStart(2, '0')}.e${episode.episode.toString().padStart(3, '0')}`
          })
        }
      ],
      series: [
        {
          id: 'UnusAnnus',
          title: 'Unus Annus',
          seasons: [
            {
              seasonNumber: '0',
              episodes: genSeason(0)
            },
            {
              seasonNumber: '1',
              episodes: genSeason(1)
            }
          ],
          genres: ['comedy'],
          thumbnail: 'https://cdn.unusann.us/roku-assets/series-thumbnail.jpg',
          releaseDate: new Date(allMetadata[1][0].date || allMetadata[1][0].releasedate).toISOString().split('T')[0],
          shortDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be...',
          longDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be deleted along with all of the daily uploads accumulated since then. Nothing will be saved. Nothing will be reuploaded. This is your one chance to join us at the onset of our adventure. To be there from the beginning. To make every second count. Subscribe now and relish what little time we have left or have the choice made for you as we disappear from existence forever. But remember... everything has an end. Even you. Memento mori. Unus annus.'
        }
      ]
    })

    function genSeason(season:0|1) {
      return allMetadata[season].map((episode:Metadata) => {
        return <Episode>{
          id: `s${episode.season.toString().padStart(2, '0')}.e${episode.episode.toString().padStart(3, '0')}`,
          title: episode.title,
          content: {
            dateAdded: new Date(episode.date || episode.releasedate).toISOString(),
            videos: episode.video ? [{url: `https://${episode.video}`, quality: 'FHD', videoType: episode.video.split('.')[episode.video.split('.').length-1].toUpperCase()}] : episode.sources.map((source) => {
              return {
                url: `https:${source.src}`,
                quality: source.size < 720 ? 'SD' : source.size < 1080 ? 'HD' : source.size < 2160 ? 'FHD' : 'UHD',
                videoType: source.type.split('/')[1].toUpperCase()
              }
            }),
            duration: episode.duration || 43208,
            captions: episode.tracks?.map((track) => {
              if (track.kind === 'captions') {
                return {
                  url: `https:${track.src}`,
                  language: track.srclang,
                  captionType: 'SUBTITLE'
                }
              } else {
                return undefined
              }
            }),
            language: 'en'
          },
          thumbnail: `https:${episode.thumbnail?.replace('.webp', '.jpg') || episode.posters[1].src}`,
          releaseDate: new Date(episode.date || episode.releasedate).toISOString().split('T')[0],
          episodeNumber: episode.episode,
          shortDescription: episode.description === '' ? 'This episode doesn\'t have a description.' : episode.description.length > 197 ? `${episode.description.substr(0, 197)}...` : episode.description,
          longDescription: episode.description.length > 197 ? episode.description : undefined
        }
      })
    }
  })
}