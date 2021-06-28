import * as Multer from 'multer'
import sharp from 'sharp'
import fs from 'fs'
import { Application } from 'express'
import User from '../../../../ts/types/user'

const multer = Multer.default({dest: 'src/db/userdata/profilepics'})

export default function changepfp(app:Application) {
  app.post('/api/v2/account/changepfp', multer.single('pfp'), (req, res) => {
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

    sharp(req.file.path).resize(64, 64).toFile(`src/db/userdata/profilepics/${user.id}.jpg`).then(() => {
      fs.unlinkSync(req.file.path)
    })

    user.pfp.originalFilename = req.file.originalname
    user.pfp.filename = `/userdata/profilepics/${user.id}.jpg`

    fs.writeFileSync(`src/db/users/${user.id}.json`, JSON.stringify(user, null, 2))

    if (req.query.redirect) {
      res.redirect(<string>req.query.redirect)
    } else {
      res.send({status:'success'})
    }
  })
}