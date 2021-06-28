import { Application } from 'express'
import fs from 'fs'
import SwiftMetadata from '../../../../ts/types/swiftmetadata'
import { metadataPath } from '../../../config.json'

export default function getallmetadata(app:Application) {
  app.get('/api/swift/v1/getallmetadata', (req, res) => {
    var metadata:SwiftMetadata = {
      specials: [],
      season1: []
    }

    const s00 = fs.readdirSync(`${metadataPath}/00`)
    for (var i = 0; i < s00.length; i++) {
      metadata.specials.push(JSON.parse(fs.readFileSync(`${metadataPath}/00/${s00[i]}`, 'utf-8')))
    }

    const s01 = fs.readdirSync(`${metadata}/01`)
    for (var i = 0; i < s01.length; i++) {
      metadata.season1.push(JSON.parse(fs.readFileSync(`${metadataPath}/01/${s01[i]}`, 'utf-8')))
    }

    res.send(metadata)
  })
}