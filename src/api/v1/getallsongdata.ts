import { Application } from "express"
import fs from 'fs'
import MusicMetadata from "../../../ts/types/musicmetadata"
import { metadataPath } from '../../config.json'

export default function getallsongdata(app:Application) {
  app.get('/api/v1/getallsongdata', (req, res) => {
    var metadata:MusicMetadata[] = []

    const music = fs.readdirSync(`${metadataPath}/music`)
    for (var i = 0; i < music.length; i++) {
      metadata.push(JSON.parse(fs.readFileSync(`${metadataPath}/music/${music[i]}`, 'utf-8')))
    }

    res.setHeader('content-type', 'application/json')
    res.send(metadata)
  })
}