import express, { Application } from 'express'
import crypto from 'crypto'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function signup(app:Application) {
  app.use('/api/v2/account/signup', express.json())

  app.post('/api/v2/account/signup', (req, res) => {
    const users = fs.readdirSync('src/db/users')

    var body:Body = req.body

    interface Body {
      email: string,
      username: string,
      password: string,
      confirmpassword: string
    }

    if (body.email && body.username && body.password && body.confirmpassword) {
      if (body.password === body.confirmpassword) {
        var exists = false
        
        for (var i = 0; i < users.length; i++) {
          const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
          if (user.email.toLowerCase() === body.email.toLowerCase()) {
            exists = true
          } else if (user.username.toLowerCase() === body.username.toLowerCase()) {
            exists = true
          }
        }

        if (exists) {
          res.send({success:false,error:{code:1,message:'Account exists!'}})
        } else {
          const salt = crypto.randomBytes(64).toString('hex')
          const hash = crypto.scryptSync(body.password, salt, 64).toString('hex')
          const id = crypto.randomBytes(16).toString('hex')

          const user:User = {
            id,
            email: body.email,
            username: body.username,
            hash,
            salt,
            pfp: {
              originalFilename: 'default.jpg',
              filename: '/userdata/profilepics/default.jpg',
              width: 64,
              height: 64,
              format: 'image/jpeg'
            },
            loginKeys: []
          }

          fs.writeFileSync(`src/db/users/${id}.json`, JSON.stringify(user, null, 2))

          res.send({success:true,loginURI:'/api/v2/account/login'})
        }
      } else {
        res.send({success:false,error:{code:0,message:'Passwords do not match!'}})
      }
    } else {
      res.send({success:false,error:{code:2,message:'Missing info!'}})
    }
  })
}