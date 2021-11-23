import { Application } from 'express'
import fs from 'fs'
import fetch from 'node-fetch'
import Metadata from '../../../ts/types/metadata'
import { metadataPath } from '../../config.json'

export default function getvidpreviews(app:Application) {
  app.get('/v2/preview/:video', (req, res, next) => {
    function genTime(seconds:number):string {
      return new Date(seconds*1000).toISOString().substr(11, 8)
    }

    const split = req.params.video.toLowerCase().split('.')
    const season = split[0].replace('s', '')
    const episode = split[1].replace('e', '')

    const path = `${metadataPath}/${season}/${episode}.json`
    if (fs.existsSync(path)) {
      const metadata:Metadata = JSON.parse(fs.readFileSync(path, 'utf-8'))

      fetch(`https://cdn.unusann.us/${season}/${episode}/previews/length.txt`).then((response:any) => {
        const status = response.status
        response.text().then((text) => {
          res.setHeader('Content-Type', 'text/vtt')
          if (!metadata.previewSprites) {
            if (status == '200') {
              fetch(`https://cdn.unusann.us/${season}/${episode}/previews/sprite.jpg`).then((spriteRes:any) => {
                const previewLength = parseInt(text)
                var vttText = 'WEBVTT\n\n'
                if (spriteRes.status == 200) {
                  for (var i  = 0; i < previewLength; i++) {
                    vttText += `${i+1}\n${genTime(i*4)}.000 --> ${genTime((i*4)+4)}.000\nhttps://cdn.unusann.us/${season}/${episode}/previews/sprite.jpg#xywh=${158*(i)},0,159,90\n\n`
                  }
                } else {
                  for (var i = 0; i < previewLength; i++) {
                    const previewStr = `${i+1}`.padStart(8, '0')
                    vttText += `${i+1}\n${genTime(i*4)}.000 --> ${genTime((i*4)+4)}.000\nhttps://cdn.unusann.us/${season}/${episode}/previews/${previewStr}.jpg\n\n`
                  }
                }
                res.send(vttText)
              })
            } else {
              res.send('WEBVTT\n\n')
            }
          } else {
            var vttText = 'WEBVTT\n\n'
            const previewLength = parseInt(text)
            for (var i = 0; i < previewLength; i++) {
              var currentSprite = `https://cdn.unusann.us/${season}/${episode}/previews/sprite01.jpg`
              var currentSpriteX = 0
              for (var ps = 0; ps < metadata.previewSprites.length; ps++) {
                if (metadata.previewSprites[ps].length > (i)) {
                  currentSprite = metadata.previewSprites[ps].src
                  currentSpriteX = ((i)-metadata.previewSprites[ps].length)+metadata.previewSprites[0].length
                  break
                }
              }
              vttText += `${i+1}\b${genTime(i*4)}.000 --> ${genTime((i*4)+4)}.000\n${currentSpriteX}#xywh=${158*currentSpriteX},0,158,90\n\n`
            }
            res.send(vttText)
          }
        })
      })
    } else {
      return next()
    }
  })
}
