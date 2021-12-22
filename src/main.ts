import express from 'express'
import fs from 'fs'
import { handle404, handle500 } from './handleErrors'
import cors from 'cors'
import { resolve } from 'path';

const app = express()

//Make sure all the required directories exist
if (!fs.existsSync('src/db')) {
  fs.mkdirSync('src/db')
}
if (!fs.existsSync('src/db/users')) {
  fs.mkdirSync('src/db/users')
}
if (!fs.existsSync('src/db/userdata')) {
  fs.mkdirSync('src/db/userdata')
}
if (!fs.existsSync('src/db/userdata/profilepics')) {
  fs.mkdirSync('src/db/userdata/profilepics')
}
if (!fs.existsSync('src/db/uservideoprogress')) {
  fs.mkdirSync('src/db/uservideoprogress')
}

app.use('/node_modules', express.static('node_modules'))

app.get('/docs/tsconfig.json', handle404)

app.use('/docs', express.static('src/docs'))

app.all('*', cors())

app.use('/userdata', express.static('src/db/userdata'))

;(async() => {
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
})().then(() => {
  app.all('*', handle404)

  app.all('*', handle500)

  app.listen(parseInt(process.env.PORT) || 1024, () => {
    console.log('Server Started')
  })
}).catch((err) => {
  throw err
})
