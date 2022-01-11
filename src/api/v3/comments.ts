import express, { Application } from 'express'
import atob from 'atob'
import { db } from '../../mysqlSetup'
import Comment, { CommentUser, StoredComment } from '../../../ts/types/comment'
import User from '../../../ts/types/user'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import mdIterator from 'markdown-it-for-inline'
import rateLimit from 'express-rate-limit'
import btoa from 'btoa'
import crypto from 'crypto'

const md = MarkdownIt({html:false,xhtmlOut:false,breaks:true,langPrefix:'',linkify:true}).disable(['image','link']).use(mdIterator, 'url_new_win', 'link_open', (tokens, idx) => {
  const [attrName, href] = tokens[idx].attrs.find(attr => attr[0] === 'href')

  if (href) {
    tokens[idx].attrPush(['target', '_blank'])
    tokens[idx].attrPush(['rel', 'noopener noreferrerr'])
  }
})
const rlimit = rateLimit({windowMs:60000,max:6})

export default function comments(app:Application) {
  app.get('/v3/comments/:video', (req, res) => {
    const showAllComments = !!req.query.all
    const from = parseInt(<string>req.query.from) || 0
    const to = parseInt(<string>req.query.to) || 20

    var comments:StoredComment[] = []

    db.query('SELECT * FROM `comments`', (err, rows:IRow[]) => {
      if (err) return res.status(500).send({error:{code:500,message:'An internal server error occurred while querying the database.',err:err.stack ?? err.toString?.()}})
      for (let i = 0; i < rows.length; i++) {
        try {
          const comment:StoredComment = JSON.parse(fromb64(rows[i].json))
          if (showAllComments || comment.episode === req.params.video) {
            comments.push(comment)
          }
        } catch (err) {
          console.error('Error converting base64 to JSON!')
        }
      }

      var parsedComments:Comment[] = []

      for (let i = 0; i < comments.length; i++) {
        if (typeof comments[i] === 'object') {
          try {
            const fulluser:User = JSON.parse(fs.readFileSync(`src/db/users/${comments[i].uid || comments[i].user.id}.json`, 'utf-8'))
            const user:CommentUser = {
              id: fulluser.id,
              username: fulluser.username,
              pfp: fulluser.pfp
            }
            comments[i].user = user
            parsedComments.push(<Comment>comments[i])
          } catch (err) {
            console.error(err)
            //If we fail to find the user but the comment already has a user attached, send the comment with the user on it. If the comment doesn't have a user attached, send the comment with the user as an error.
            if (comments[i].user) {
              parsedComments.push(<Comment>comments[i])
            } else {
              const user:CommentUser = {
                id: comments[i].uid,
                username: 'Error Getting User Data!',
                pfp: {
                  filename: '/userdata/profilepics/default.jpg',
                  format: 'image/jpeg',
                  width: 256,
                  height: 256,
                  originalFilename: 'default.jpg'
                }
              }
              comments[i].user = user
              parsedComments.push(<Comment>comments[i])
            }
          }
        }
      }

      var sortType:ISortType = 'latest'

      switch (req.query.sort) {
        case 'oldest': {
          sortType = 'oldest'
          break
        }
        case 'rating': {
          sortType = 'rating'
          break
        }
      }

      switch (sortType) {
        case 'latest': {
          parsedComments.sort((a, b) => {
            if (a.stats.published > b.stats.published) {
              return -1
            } else if (a.stats.published < b.stats.published) {
              return 1
            } else if (a.stats.published === b.stats.published) {
              return 0
            }
         })
         break
        }
        case 'oldest': {
          parsedComments.sort((a, b) => {
            if (a.stats.published > b.stats.published) {
              return 1
            } else if (a.stats.published < b.stats.published) {
              return -1
            } else if (a.stats.published === b.stats.published) {
              return 0
            }
          })
          break
        }
        case 'rating': {
          parsedComments.sort((a, b) => {
            const ratingA = a.stats.likes-a.stats.dislikes
            const ratingB = b.stats.likes-b.stats.dislikes
            if (ratingA > ratingB) {
              return -1
            } else if (ratingA < ratingB) {
              return 1
            } else if (ratingA === ratingB) {
              if (a.stats.published > b.stats.published) {
                return -1
              } else if (a.stats.published < b.stats.published) {
                return 1
              } else if (a.stats.published === b.stats.published) {
                return 0
              }
            }
          })
          break
        }
      }

      var limitedComments:Comment[] = []

      for (let i = from; i < to; i++) {
        if (parsedComments[i]) {
          limitedComments.push(parsedComments[i])
        }
      }

      res.send(limitedComments)
    })
  })

  app.post('/v3/comments/:video', rlimit, express.json(), (req, res) => {
    const users = fs.readdirSync('src/db/users')
    const [uid, loginKey] = req.get("Authorization").split(':')
    const comment:string = req.body.comment

    if (comment.length > 500) {
      return res.status(413).send({error:{code:413,message:'Payload Too Large! Comment must be under 500 characters.'}})
    }

    var user:User = null
    for (var i = 0; i < users.length; i++) {
      const currentUser:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (currentUser.id === uid && currentUser.loginKeys.includes(loginKey)) {
        user = currentUser
        break
      }
    }

    if (user === null) {
      return res.status(401).send({error:{code:401,message:'Unauthorized!'}})
    }
    
    const JSONComment:StoredComment = {
      episode: req.params.video,
      uid: user.id,
      user: {
        id: user.id,
        pfp: user.pfp,
        username: user.username
      },
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

    db.query(`INSERT INTO comments (json) values ('${b64Comment})`, (err) => {
      if (err) return res.status(500).send({error:{code:500,message:'An internal server error occurred while querying the database',err:err.stack ?? err.toString?.()}})
      res.send({status:'success',comment:JSONComment})
    })
  })

  app.delete('/v3/comments/video/:uaid/:cid', (req, res) => {
    const [uid, loginKey] = req.get("Authorization").split(':')
    const users = fs.readdirSync('src/db/users')

    const { uaid, cid } = req.params

    var isAdmin = false

    for (let i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (user.id === uid && user.loginKeys.includes(loginKey)) {
        if (user.isAdmin) {
          isAdmin = true
        }
        break
      }
    }

    if (!isAdmin) {
      return res.send({error:{code:401,message:'Unauthorized!'}})
    }

    db.query('SELECT * FROM `comments`', (err, rows:IRow[]) => {
      if (err) return res.status(500).send({error:{code:500,message:'An internal server error occurred while querying the database.',err:err.stack ?? err.toString?.()}})
      for (let i = 0; i < rows.length; i++) {
        try {
          const comment:StoredComment = JSON.parse(fromb64(rows[i].json))
          if (comment.episode === uaid) {
            if (comment.id) {

            } else {
              //Generate comment ID
              const userId = userIDToNumber(comment.uid)
              const postTime = comment.stats.published
              const id = userId*postTime
              comment.id = id.toString()

            }
          }
        } catch (err) {
          console.error('Error converting base64 to JSON!')
        }
      }
    })
  })
}

function fromb64(b64:string) {
  return decodeURIComponent(escape(atob(b64)))
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

      html = html.replace(matches[i], `<a href="/watch/${episode}?t=${seconds}>${matches[i].replace(/:/g, '&colon;')}</a>`)
    }
  }
  
  return html
}

function userIDToNumber(uid:string) {
  const buf = Buffer.from(uid)
  var int = 0
  for (var i = 0; i < buf.length; i++) {
    int += buf[i]
  }

  return int
}

interface IRow {
  json: string
}

type ISortType = 'latest'|'oldest'|'rating'
