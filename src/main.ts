import express, { Application } from 'express'
import fs from 'fs'
import * as HTMLParser from 'node-html-parser'
import download from './download'
import metadataPath from './config.json'
import Metadata from '../ts/types/metadata'
import MusicMetadata from '../ts/types/musicmetadata'
const app = express();

(async() => {
  app.all('*', require('./shortUrlManager'))

  //Expose node_modules
  app.use('/node_modules', express.static('node_modules'))
  
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'text/xml')
    res.send(fs.readFileSync('public/sitemap.xml', 'utf-8'))
  })
  
  app.use('/cdndownload', download)

  app.get('/tsconfig.json', (req, res) => {
    res.status(404).send(fs.readFileSync('errors/404.html', 'utf-8').replace(/{path}/g, req.path))
  })
  
  app.get('/index.html', (req, res) => {
    res.redirect('/')
  })
  
  app.get('/', (req, res) => {
    var document = fs.readFileSync('public/index.html', 'utf-8')
    if (req.hostname.endsWith('unusannusarchive.tk')) {
      document = document.replace(/<span id="newurlnotice"><\/span>/g, '<span id="newurlnotice"><h3>We\'ve moved over to <a href="https://unusann.us" style="color:#ffffff">https://unusann.us</a>!</h3></span>')
    } else {
      document = document.replace(/<span id="newurlnotice"><\/span>/g, '')
    }
    res.send(document)
  })
  
  app.get('/embed/video', (req, res) => {
    res.status(404).send(fs.readFileSync('errors/404.html', 'utf-8'))
  })
  
  app.use('/embed/video/js', express.static('public/embed/video/js'))
  app.use('/embed/video/css', express.static('public/embed/video/css'))
  app.get('/embed/video/:video/', (req, res) => {
    if (!req.path.endsWith('/')) {
      return res.redirect(`${req.path}/`)
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(fs.readFileSync('public/embed/video/index.html', 'utf-8'))
  })
  
  app.get('/watch/index.html', (req, res) => {
    res.status(404).send(fs.readFileSync('errors/404.html', 'utf-8'))
  })
  
  app.get('/watch/', (req, res, next) => {
    const split = (<string>req.query.v).toLowerCase().split('.')
    const season = split[0].replace('s', '')
    const episode = split[1].replace('e', '')
  
    if (fs.existsSync(`${metadataPath}/${season}/${episode}.json`)) {
      const metadata:Metadata = JSON.parse(fs.readFileSync(`${metadataPath}/${season}`, 'utf-8'))
  
      try {
        var document = HTMLParser.parse(fs.readFileSync('public/watch/index.html', 'utf-8'))
  
        const { title, description } = metadata
  
        //Video Title
        document.querySelector('meta[itemprop="name"]').setAttribute('content', title)
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', title)
        document.querySelector('meta[name="og:title"]').setAttribute('content', title)
  
        //Description
        document.querySelector('meta[name="description"]').setAttribute('content', description)
        document.querySelector('meta[itemprop="description"]').setAttribute('content', description)
        document.querySelector('meta[name="twitter:description"]').setAttribute('content', description)
        document.querySelector('meta[name="og:description"]').setAttribute('content', description)
  
        //Poster
        var poster: string
        if (Array.isArray(metadata.posters)) {
          //V2
          if (metadata.posters[1].type === 'image/jpg') {
            poster = metadata.posters[1].src
          } else {
            poster = metadata.posters[0].src
          }
        } else {
          //V1
          poster = metadata.thumbnail.replace('.webp', '.jpg')
        }
        document.querySelector('meta[name="image"]').setAttribute('content', poster)
        document.querySelector('meta[itemprop="image"]').setAttribute('content', poster)
        document.querySelector('meta[name="twitter:image:src"]').setAttribute('content', poster)
        document.querySelector('meta[name="og:image"]').setAttribute('content', poster)
  
        //Embed URL
        document.querySelector('meta[name="twitter:player"]').setAttribute('content', `https://unusann.us/embed/video/${req.query.v}`)
  
        //Video URL
        var videourl: string
        var lastHighest = {
          size: 0,
          src: ''
        }
        for (var i = 0; i < metadata.sources.length; i++) {
          if (metadata.sources[i].size > lastHighest.size) {
            lastHighest = metadata.sources[i]
          }
        }
        videourl = `https:${lastHighest.src}`
        document.querySelector('meta[name="twitter:player:stream"]').setAttribute('content', videourl)
        document.querySelector('meta[name="og:video"]').setAttribute('content', videourl)
  
        //Video Height
        const height = lastHighest.size
        document.querySelector('meta[name="twitter:player:height"]').setAttribute('content', height.toString())
        document.querySelector('meta[name="video:height"]').setAttribute('content', height.toString())
  
        //Video Width
        const width = Math.floor(height * 1.777777777777778)
        document.querySelector('meta[name="twitter:player:width"]').setAttribute('content', width.toString())
        document.querySelector('meta[name="video:width"]').setAttribute('content', width.toString())
  
        //Video Release Date
        document.querySelector('meta[name="video:release_date"]').setAttribute('content', (metadata.date || metadata.releasedate).toString())
  
        //Page URL
        document.querySelector('meta[name="og:url"]').setAttribute('content', req.url)
  
        res.send(document.toString())
      } catch {
        //If something goes wrong while setting the embed metadata, just send the file without changing embed info so the request still gets answered
        res.send(fs.readFileSync('public/watch/index.html', 'utf-8'))
      }
    } else {
      return next()
    }
  })
  
  app.get('/music/index.html', (req, res) => {
    res.status(404).send(fs.readFileSync('errors/404.html', 'utf-8'))
  })
  
  app.get('/music/', (req, res, next) => {
    if (fs.existsSync(`${metadataPath}/music/${req.query.s}.json`)) {
      const metadata:MusicMetadata = JSON.parse(fs.readFileSync(`${metadataPath}/music/${req.query.s}.json`, 'utf-8'))
  
      try {
        var document = HTMLParser.parse(fs.readFileSync('static/music/index.html', 'utf-8'))
    
        //Video Title
        document.querySelector('meta[itemprop="name"]').setAttribute('content', `${metadata.title} (${metadata.type}) - ${metadata.artist}`)
        document.querySelector('meta[name="twitter:title"]').setAttribute('content', `${metadata.title} (${metadata.type}) - ${metadata.artist}`)
        document.querySelector('meta[name="og:title"]').setAttribute('content', `${metadata.title} (${metadata.type}) - ${metadata.artist}`)
    
        //Thumbnail
        document.querySelector('meta[name="image"]').setAttribute('content', `https:${metadata.thumbnail}`)
        document.querySelector('meta[itemprop="image"]').setAttribute('content', `https:${metadata.thumbnail}`)
        document.querySelector('meta[name="twitter:image:src"]').setAttribute('content', `https:${metadata.thumbnail}`)
        document.querySelector('meta[name="og:image"]').setAttribute('content', `https:${metadata.thumbnail}`)
    
        //Video URL
        document.querySelector('meta[name="twitter:player"]').setAttribute('content', `https:${metadata.audio}`)
        document.querySelector('meta[name="twitter:player:stream"]').setAttribute('content', `https:${metadata.audio}`)
        document.querySelector('meta[name="og:video"]').setAttribute('content', `https:${metadata.audio}`)
    
        //Page URL
        document.querySelector('meta[name="og:url"]').setAttribute('content', req.url)
      
        res.send(document.toString())
      } catch (err) {
        console.error(err)
        res.send(fs.readFileSync('static/music/index.html', 'utf-8'))
      }
    } else {
      return next()
    }
  })
  
  app.use('/', express.static('public'))
  
  app.use('/userdata', express.static('src/db/userdata'))
  
  app.get('/twitter', (req, res) => {
    res.redirect('https://www.twitter.com/UA_Archive')
  })
  
  //API
  app.all('/api*', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    return next()
  })
  
  //Read api dir
  await apiDir('api')
  async function apiDir(dir:string):Promise<void> {
    const api = fs.readdirSync(`src/${dir}`)
    for (var i = 0; i < api.length; i++) {
      if (!dir.includes('docs') && !api[i].endsWith('.map') && !api[i].endsWith('.ts')) {
        if (fs.lstatSync(`src/${dir}/${api[i]}`).isDirectory()) {
          await apiDir(`${dir}/${api[i]}`)
        } else {
          const path = `./${dir}/${api[i]}`;
          (await import(path)).default(app)
        }
      }
    }
  }
  
  //Old V1 API (so anything made with the old endpoints doesn't break)
  //Redirect V1 API paths to /api/v1/...
  app.get('/api/getvideodata/*', (req, res) => {
    const str = req.originalUrl.replace('/api/getvideodata/', '')
    res.redirect(`/api/v1/getvideodata/${str}`)
  })
  
  app.get('/api/getallmetadata*', (req, res) => {
    res.redirect('/api/v1/getallmetadata')
  })
  
  app.get('/api/gets00metadata*', (req, res) => {
    res.redirect('/api/v1/gets00metadata')
  })
  
  app.get('/api/gets01metadata*', (req, res) => {
    res.redirect('/api/gets01metadata')
  })
  
  app.get('/api/getsongdata/:song', (req, res) => {
    res.redirect(`/api/v1/getsongdata/${req.params.song}`)
  })
  
  app.get('/api/getallsongdata', (req, res) => {
    res.redirect('/api/v1/getallsongdata')
  })
  
  app.get('/api/getvidpreviews/:video', (req, res) => {
    res.redirect(`/api/v1/getvidpreviews/${req.params.video}`)
  })
  
  //Swift API
  app.get('/api/swift/getallmetadata', (req, res) => {
    res.redirect('/api/swift/v1/getallmetadata')
  })
  
  app.get('/api*', (req, res, next) => {
    if (req.path.startsWith('/api/docs/')) {
      return next()
    }
    res.status(404).send({error:404})
  })
  
  app.use('/api*', (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({error:{code:500,message:'Internal Server Error',stack:err.stack}})
  })
  
  app.get('*', (req, res) => {
    res.status(404).send(fs.readFileSync('errors/404.html', 'utf-8').replace(/{path}/g, req.path))
  })
  
  app.use('*', (err, req, res, next) => {
    console.error(err.stack)
    var document = fs.readFileSync('errors/500.html', 'utf-8')
    document = document.replace(/{error}/g, err.stack)
    res.status(500).send(document)
  })
  
  app.listen(1024, () => {
    console.log('Server started') 
  })
})()