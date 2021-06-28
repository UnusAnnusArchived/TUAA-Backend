import { Application } from 'express'
import fs from 'fs'
import { metadataPath } from '../../config.json'

export default function getsongdata(app:Application) {
  app.get('/api/v1/getsongdata/:song', (req, res, next) => {
    const path = `${metadataPath}/music/${req.params.song}.json`
    if (fs.existsSync(path)) {
      res.setHeader('content-type', 'application/json')
      res.send(fs.readFileSync(path, 'utf-8'))
    } else {
      return next()
    }
  })
}