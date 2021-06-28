import { Application } from 'express'
import fs from 'fs'
import Metadata from '../../../../../../ts/types/metadata'
import { metadataPath } from '../../../../../config.json'

export default function all(app:Application) {
  app.get('/api/v2/metadata/video/season/s00', (req, res) => {
    var metadata:Metadata[] = []

    const s00 = fs.readdirSync(`${metadataPath}/00`)
    for (var i = 0; i < s00.length; i++) {
      metadata.push(JSON.parse(fs.readFileSync(`${metadataPath}/00/${s00[i]}`, 'utf-8')))
    }

    res.setHeader('content-type', 'application/json')
    res.send(metadata)
  })
}