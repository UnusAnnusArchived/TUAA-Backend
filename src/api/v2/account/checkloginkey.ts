import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function checkloginkey(app:Application) {
  app.use('/v2/account/checkloginkey', express.json())

  app.post('/v2/account/checkloginkey', (req, res) => {
    const { loginKey } = req.body
    const users = fs.readdirSync('src/db/users')

    var isValid = false

    for (var i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (user.loginKeys.includes(loginKey)) {
        //If the key is valid, send the client updated data in case it changed
        isValid = true
        res.send({isValid,user:{id:user.id,email:user.email,username:user.username,pfp:user.pfp}})
        break
      }
    }

    if (!isValid) {
      res.send({isValid})
    }
  })
}
