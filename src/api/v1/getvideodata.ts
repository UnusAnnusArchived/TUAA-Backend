import { Application } from 'express'
import fs from 'fs'
import { metadataPath } from '../../config.json'

export default function getvideodata(app:Application) {
  app.get('/api/v1/getvideodata/:video', (req, res, next) => {
    const split = req.params.video.toLowerCase().split('.')
    const season = split[0].replace('s', '')
    const episode = split[1].replace('e', '')

    const path = `${metadataPath}/${season}/${episode}.json`
    if (fs.existsSync(path)) {
      res.setHeader('content-type', 'application/json')
      res.send(fs.readFileSync(path, 'utf-8'))
    } else {
      return next()
    }
  })
}