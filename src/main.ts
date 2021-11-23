import express from 'express'
import fs from 'fs'
import { handle404, handle500 } from './handleErrors'
import cors from 'cors'

const app = express()

;(async() => {
  app.use('/node_modules', express.static('node_modules'))

  app.get('/docs/tsconfig.json', handle404)

  app.use('/docs', express.static('src/docs'))

  app.all('*', cors())

  app.use('/userdata', express.static('src/db/userdata'))

  await apiDir('api')
  async function apiDir(dir:string):Promise<void> {
    const api = fs.readdirSync(`src/${dir}`)
    for (let i = 0; i < api.length; i++) {
      if (!api[i].endsWith('map') && !api[i].endsWith('.ts')) {
        if (fs.lstatSync(`src/${dir}/${api[i]}`).isDirectory()) {
          await apiDir(`${dir}/${api[i]}`)
        } else {
          const path = `./${dir}/${api[i]}`
          ;(await import(path)).default(app)
        }
      }
    }
  }

  app.all('*', handle404)

  app.all('*', handle500)

  app.listen(parseInt(process.env.PORT) || 1024, () => {
    console.log('Server Started')
  })
})()
