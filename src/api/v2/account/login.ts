import express, { Application } from 'express'
import crypto from 'crypto'
import fs from 'fs'
import sendEmail from '../../../nodemailerSetup'
import User from '../../../../ts/types/user'

export default function login(app:Application) {
  app.use('/v2/account/login', express.json())

  app.post('/v2/account/login', (req, res) => {
    console.log(res.getHeaders())
    const users = fs.readdirSync('src/db/users')

    const postInfo = {
      username: (<string>req.body.username).toLowerCase(),
      password: <string>req.body.password,
      sendEmail: (<string>req.body.sendEmail)?.toLowerCase() || 'true'
    }

    var isEmail = false
    if (postInfo.username.includes('@')) isEmail = true

    var validUser:boolean|User = false
    var loginKey:string

    for (var i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))

      if (postInfo.username === user[isEmail ? 'email' : 'username'].toLowerCase()) {
        const genHash = crypto.scryptSync(postInfo.password, user.salt, 64).toString('hex')
        if (user.hash === genHash) {
          loginKey = crypto.randomBytes(8).toString('hex')
          user.loginKeys.push(loginKey)
          fs.writeFileSync(`src/db/users/${user.id}.json`, JSON.stringify(user, null, 2))
          validUser = user
        }
        break
      }
    }
    if (validUser) {
      res.send({
        isValid: true,
        loginKey,
        user:  {
          id: validUser.id,
          email: validUser.email,
          username: validUser.username,
          pfp: validUser.pfp
        }
      })
      if (postInfo.sendEmail === 'true') {
        sendEmail('newLogin', validUser.email, (string, isHTML = false) => {
          validUser = <User>validUser // (because ts is being weird)
          var str = string.replace(/{{ user.email }}/g, validUser.email).replace(/{{ user.pfp.filename }}/g, validUser.pfp.filename)
          if (isHTML) {
            str = str.replace(/{{ user.username }}/g, validUser.username.replace(/ /g, '&nbsp;'))
          } else {
            str = str.replace(/{{ user.username }}/g, validUser.username)
          }
          return str
        })
      }
    } else {
      res.send({isValid:false})
    }
  })
}
