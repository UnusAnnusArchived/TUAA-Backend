import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function logoutall(app:Application) {
  app.use('/api/v2/account/logoutall', express.json())
  
  app.post('/api/v2/account/logoutall', (req, res) => {
    const users = fs.readdirSync('src/db/users')

    const postInfo = {
      id: <string>req.body.id
    }

    var hasAccount = false

    for (var i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))

      if (user.id == postInfo.id) {
        hasAccount = true
        user.loginKeys = []
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