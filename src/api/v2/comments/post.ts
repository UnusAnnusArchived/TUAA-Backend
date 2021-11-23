import express, { Application } from 'express'
import fs from 'fs'
import btoa from 'btoa'
import MarkdownIt from 'markdown-it'
import mdIterator from 'markdown-it-for-inline'
import rateLimit from 'express-rate-limit'
import User from '../../../../ts/types/user'
import Comment, { StoredComment } from '../../../../ts/types/comment'
import { db } from '../../../mysqlSetup'

const md = MarkdownIt({html:false,xhtmlOut:false,breaks:true,langPrefix:'',linkify:true}).disable(['image', 'link']).use(mdIterator, 'url_new_win', 'link_open', (tokens, idx) => {
  const [attrName, href] = tokens[idx].attrs.find(attr => attr[0] === 'href')

  if (href) {
    tokens[idx].attrPush(['target', '_blank'])
    tokens[idx].attrPush(['rel', 'noopener noreferrer'])
  }
})
const rlimit = rateLimit({windowMs:60000,max:6})

export default function post(app:Application) {
  app.use('/v2/comments/post/:video', rlimit)

  app.use('/v2/comments/post/:video', express.json())

  app.post('/v2/comments/post/:video', (req, res) => {
    const users = fs.readdirSync('src/db/users')

    const comment:string = req.body.comment
    const loginKey:string = req.body.loginKey

    if (comment.length > 500) {
      return res.send({error:{code:3,message:'Invalid message length!'}})
    }

    var user:User

    for (var i = 0; i < users.length; i++) {
      const currentUser:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (currentUser.loginKeys.includes(loginKey)) {
        user = currentUser
        break
      }
    }

    if (!user) {
      return res.status(401).send({error:{code:401,message:'Unauthorized!'}})
    }

    const JSONComment:StoredComment = {
      episode: req.params.video,
      uid: user.id,
      comment: {
        plaintext: comment,
        html: plainTextToHTML(comment, req.params.video)
      },
      stats: {
        published: Date.now(),
        likes: 0,
        dislikes: 0
      }
    }

    const b64Comment = tob64(JSON.stringify(JSONComment))

    db.query(`INSERT INTO comments (json) values ('${b64Comment}')`, (err) => {
      if (err) return res.send({error:err})
      res.send({status:'success',comment:JSONComment})
    })
  })
}

function tob64(string:string) {
  return btoa(unescape(encodeURIComponent(string)))
}

function plainTextToHTML(plaintext:string, episode:string) {
  const timeReg = /(?:([0-5]?[0-9]):)?([0-5]?[0-9]):([0-5][0-9])/g

  var html = md.render(plaintext)

  if (plaintext.match(timeReg)) {
    const matches = plaintext.match(timeReg)
    
    for (var i = 0; i < matches.length; i++) {
      const split = matches[i].split(':')
      var seconds = parseInt(split[split.length-1])
      seconds += parseInt(split[split.length-2])*60
      if (split.length === 3) {
        seconds += (parseInt(split[0])*60)*60
      }

      html = html.replace(matches[i], `<a href="/watch/?v=${episode}&t=${seconds}">${matches[i].replace(/:/g, '&colon;')}</a>`)
    }
  }

  return html
}
