import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function logout(app:Application) {
    app.get('/v3/account/logout', (req, res) => {
    const [uid, loginKeys] = req.get("Authorization").split(':')
    const users = fs.readdirSync('src/db/users')

    var user:User

    for (var i = 0; i < users.length; i++) {
      const currentUser:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))

      if (currentUser.id == uid) {
        user = user
        break
      }
    }

    if (user) {
      if (loginKeys.includes('*')) {
        user.loginKeys = []
        fs.writeFileSync(`src/db/users/${users[i]}`, JSON.stringify(user, null, 2))
      } else {
        for (var i = 0; i < loginKeys.length; i++) {
          const loginKey = loginKeys[i]
          const index = user.loginKeys.indexOf(loginKey)
          user.loginKeys.splice(index, 1)
        }
        fs.writeFileSync(`src/db/users/${users[i]}`, JSON.stringify(user, null, 2))
      }
      res.send({status:'success'})
    } else {
      res.status(404).send({status:'error',error:'Account does not exist!'})
    }
  })
}
