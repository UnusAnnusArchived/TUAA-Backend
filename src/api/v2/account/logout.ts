import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function logout(app:Application) {
  app.use('/v2/account/logout', express.json())

  app.post('/v2/account/logout', (req, res) => {
    const users = fs.readdirSync('src/db/users')

    const postInfo = {
      id: <string>req.body.id,
      loginKey: <string>req.body.loginKey
    }

    var hasAccount = false

    for (var i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))

      if (user.id == postInfo.id) {
        hasAccount = true
        const index = user.loginKeys.indexOf(postInfo.loginKey)
        user.loginKeys.splice(index, 1)
        fs.writeFileSync(`src/db/users/${users[i]}`, JSON.stringify(user, null, 2))
        res.send({status:'success'})
        break
      }
    }

    if (!hasAccount) {
      res.send({status:'error',error:'Account does not exist!'})
    }
  })
}
