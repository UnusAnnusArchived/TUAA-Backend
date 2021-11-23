import { Application } from 'express'
import atob from 'atob'
import { db } from '../../../mysqlSetup'
import Comment, { CommentUser, StoredComment } from '../../../../ts/types/comment'
import User from '../../../../ts/types/user'
import fs from 'fs'

export default function get(app:Application) {
  app.get('/v2/comments/get/:video', (req, res) => {
    const from = parseInt(<string>req.query.from) || 0
    const to = parseInt(<string>req.query.to) || 20

    var comments:StoredComment[] = []

    db.query(`SELECT * FROM \`comments\``, (err, rows:{json:string}[]) => {
      if (err) return res.send({error:err})
      for (var i = 0; i < rows.length; i++) {
        try {
          const comment:StoredComment = JSON.parse(fromb64(rows[i].json))
          if (comment.episode == req.params.video) {
            comments.push(comment)
          }
        } catch (err) {
          console.error('Error converting base64 to JSON!')
        }
      }
      
      var parsedComments:Comment[] = []
      
      for (var i = 0; i < comments.length; i++) {
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

      var sortType = 'latest'

      if (req.query.sort === 'oldest') {
        sortType = 'oldest'
      } else if (req.query.sort === 'rating') {
        sortType = 'rating'
      }

      if (sortType === 'latest') {
        parsedComments.sort((a, b) => {
          if (a.stats.published > b.stats.published) {
            return -1
          } else if (a.stats.published < b.stats.published) {
            return 1
          } else if (a.stats.published === b.stats.published) {
            return 0
          }
        })
      } else if (sortType === 'oldest') {
        parsedComments.sort((a, b) => {
          if (a.stats.published > b.stats.published) {
            return 1
          } else if (a.stats.published < b.stats.published) {
            return -1
          } else if (a.stats.published === b.stats.published) {
            return 0
          }
        })
      } else if (sortType === 'rating') {
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
      }

      var limitedComments:Comment[] = []

      for (var i = from; i < to; i++) {
        if (parsedComments[i]) {
          limitedComments.push(parsedComments[i])
        }
      }
      
      res.send(limitedComments)
    })
  })
}

function fromb64(b64:string) {
  return decodeURIComponent(escape(atob(b64)))
}
