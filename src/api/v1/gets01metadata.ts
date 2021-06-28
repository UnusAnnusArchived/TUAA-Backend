import { Application } from "express";
import fs from 'fs'
import Metadata from "../../../ts/types/metadata";
import { metadataPath } from '../../config.json'

export default function gets01metadata(app:Application) {
  app.get('/api/v1/gets01metadata', (req, res) => {
    var metadata:Metadata[] = []

    const s01 = fs.readdirSync(`${metadataPath}/01`)
    for (var i = 0; i < s01.length; i++) {
      metadata.push(JSON.parse(fs.readFileSync(`${metadataPath}/01/${s01[i]}`, 'utf-8')))
    }
  
    res.setHeader('content-type', 'application/json')
    res.send(metadata)  
  })
}