import * as Multer from 'multer'
import sharp from 'sharp'
import fs from 'fs'
import { Application } from 'express'
import User from '../../../../ts/types/user'
import { randomBytes } from 'crypto'

const multer = Multer.default({dest: 'src/db/userdata/profilepics'})

export default function changepfp(app:Application) {
  app.post('/v2/account/changepfp', multer.single('pfp'), (req, res) => {
    const users = fs.readdirSync('src/db/users')
    const { loginKey } = req.body

    var user:User
    for (var i = 0; i < users.length; i++) {
      const currentUser:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (currentUser.loginKeys.includes(loginKey)) {
        user = currentUser
        break
      }
    }

    if (!user) {
      return res.send({error:'Not logged in!'})
    }

    sharp(req.file.path).metadata().then((imageMeta) => {
      let pfpid = randomBytes(4).toString('hex')

      var size = 256

      if (imageMeta.width < 256 && imageMeta.height < 256) {
        size = Math.max(imageMeta.width, imageMeta.height)
      }

      if (!fs.existsSync(`src/db/userdata/profilepics/${user.id}`)) {
        fs.mkdirSync(`src/db/userdata/profilepics/${user.id}`)
      }

      sharp(req.file.path).resize(size, size).toFile(`src/db/userdata/profilepics/${user.id}/${pfpid}.jpg`).then(() => {
        fs.unlinkSync(req.file.path)
        fs.unlinkSync(`src/db${user.pfp.filename}`)

        user.pfp.originalFilename = req.file.originalname
        user.pfp.filename = `/userdata/profilepics/${user.id}/${pfpid}.jpg`
        user.pfp.width = size
        user.pfp.height = size
    
        fs.writeFileSync(`src/db/users/${user.id}.json`, JSON.stringify(user, null, 2))
    
        if (req.query.redirect) {
          res.redirect(<string>req.query.redirect)
        } else {
          res.send({status:'success'})
        }
      })
    })

  })
}
