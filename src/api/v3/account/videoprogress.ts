import express, { Application } from 'express'
import fs from 'fs'
import User from '../../../../ts/types/user'

export default function videoProgress(app:Application) {
  app.get('/v3/account/videoprogress/:uaid', (req, res) => {
    const { uaid } = req.params
    const [uid, loginKey] = req.get("Authorization").split(':')
    const users = fs.readdirSync('src/db/users')

    var loginIsValid = false

    for (let i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (user.id === uid && user.loginKeys.includes(loginKey)) {
        loginIsValid = true
        break
      }
    }

    if (loginIsValid) {
      if (uaid) {
        try {
          const videoProgress = JSON.parse(fs.readFileSync(`src/db/uservideoprogress/${uid}/${uaid}.json`, 'utf-8'))
          res.send(videoProgress)
        } catch {
          res.send({uaid,progress:0})
        }
      } else {
        res.status(400).send({error:{code:400,message:'Missing Fields!'}})
      }
    } else {
      res.status(401).send({error:{code:401,message:'Unauthorized'}})
    }
  })
  
  app.put('/v3/account/videoprogress/:uaid', express.json(), (req, res) => {
    const { uaid } = req.params
    const [uid, loginKey] = req.get("Authorization").split(':')
    const { progress } = req.body
    const users = fs.readdirSync('src/db/users')

    var loginIsValid = false

    for (let i = 0; i < users.length; i++) {
      const user:User = JSON.parse(fs.readFileSync(`src/db/users/${users[i]}`, 'utf-8'))
      if (user.id === uid && user.loginKeys.includes(loginKey)) {
        loginIsValid = true
        break
      }
    }

    if (loginIsValid) {
      if (uaid && progress) {
        const videoProgress = {
          uaid,
          progress
        }
        if (!fs.existsSync(`src/db/uservideoprogress/${uid}`)) {
          fs.mkdirSync(`src/db/uservideoprogress/${uid}`)
        }
        fs.writeFileSync(`src/db/uservideoprogress/${uid}/${uaid}.json`, JSON.stringify(videoProgress))
        res.send(videoProgress)
      } else {
        res.status(400).send({error:{code:400,message:'Missing Fields!'}})
      }
    } else {
      res.status(401).send({error:{code:401,message:'Unauthorized!'}})
    }
  })
}
