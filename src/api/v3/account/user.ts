import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function checklogin(app:Application) {
  app.get('/v3/account/user', (req, res) => {
    const [uid, loginKey] = req.get("Authorization").split(':')
    const users = fs.readdirSync('src/db/users')

    var isValidLogin = false

    for (var i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (user.id === uid && user.loginKeys.includes(loginKey)) {
        //If the key is valid, send the client updated user data in case it changed
        isValidLogin = true
        res.send({
          isValidLogin,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            pfp: user.pfp,
            isAdmin: user.isAdmin
          }
        })
        break
      }
    }

    if (!isValidLogin) {
      res.send({isValidLogin})
    }
  })
}
