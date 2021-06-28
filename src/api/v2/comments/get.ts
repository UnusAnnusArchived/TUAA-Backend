import { Application } from 'express'
import atob from 'atob'
import { db } from '../../../mysqlSetup'
import Comment, { CommentUser, StoredComment } from '../../../../ts/types/comment'
import User from '../../../../ts/types/user'
import fs from 'fs'

export default function get(app:Application) {
  app.get('/api/v2/comments/get/:video', (req, res) => {
    const from = parseInt(<string>req.query.from) || 0
    const to = parseInt(<string>req.query.to) || 20

    var comments:StoredComment[] = []

    db.query(`SELECT * FROM \`comments\` LIMIT ${from}, ${to}`, (err, rows:{json:string}[]) => {
      if (err) return res.send({error:err})
      for (var i = 0; i < rows.length; i++) {
        const comment:StoredComment = JSON.parse(atob(rows[i].json))
        if (comment.episode == req.params.video) {
          comments.push(comment)
        }
      }

      var parsedComments:Comment[] = []

      for (var i = from; i < to; i++) {
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
            parsedComments.push(<Comment>comments[i])
          }
        }
      }

      var sortType = 'latest'

      if (req.query.sort === 'oldest') {
        sortType = 'oldest'
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
      } else {
        parsedComments.sort((a, b) => {
          if (a.stats.published > b.stats.published) {
            return 1
          } else if (a.stats.published < b.stats.published) {
            return -1
          } else if (a.stats.published === b.stats.published) {
            return 0
          }
        })
      }
      
      res.send(parsedComments)
    })
  })
}