import { Application } from 'express'
import fs from 'fs'
import Metadata from '../../../../../ts/types/metadata'
import { metadataPath } from '../../../../config.json'

export default function all(app:Application) {
  app.get('/v2/metadata/season/s01', (req, res) => {
    var metadata:Metadata[] = []

    const s01 = fs.readdirSync(`${metadataPath}/01`)
    for (var i = 0; i < s01.length; i++) {
      metadata.push(JSON.parse(fs.readFileSync(`${metadataPath}/01/${s01[i]}`, 'utf-8')))
    }

    res.setHeader('content-type', 'application/json')
    res.send(metadata)
  })
}
