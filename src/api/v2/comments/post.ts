import express, { Application } from 'express'
import fs from 'fs'
import btoa from 'btoa'
import MarkdownIt from 'markdown-it'
import rateLimit from 'express-rate-limit'
import User from '../../../../ts/types/user'
import Comment, { StoredComment } from '../../../../ts/types/comment'
import { db } from '../../../mysqlSetup'

const md = MarkdownIt({html:false,xhtmlOut:false,breaks:true,langPrefix:'',linkify:true}).disable(['image', 'link'])
const rlimit = rateLimit({windowMs:60000,max:6})

export default function post(app:Application) {
  app.use('/api/v2/comments/post/:video', rlimit)

  app.use('/api/v2/comments/post/:video', express.json())

  app.post('/api/v2/comments/post/:video', (req, res) => {
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
        html: md.render(comment)
      },
      stats: {
        published: Date.now(),
        likes: 0,
        dislikes: 0
      }
    }

    const b64Comment = btoa(JSON.stringify(JSONComment))

    db.query(`INSERT INTO comments (json) values ('${b64Comment}')`, (err) => {
      if (err) return res.send({error:err})
      res.send({status:'success',comment:JSONComment})
    })
  })
}