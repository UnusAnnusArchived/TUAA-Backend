import express from 'express'
import { Application } from 'express'

module.exports = function docs(app:Application) {
  app.use('/api/docs/', express.static('src/api/docs/'))

  //Redirect /api to /api/docs/
  app.get('/api', (req, res) => {
    res.redirect('/api/docs/')
  })
}