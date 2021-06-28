import { Request, Response, NextFunction } from 'express'

module.exports = function shortUrlManager(req:Request, res:Response, next:NextFunction) {
  if (req.hostname == 'uaarchive.tk') {
    if (req.path == '/') {
      res.redirect('https://unusann.us')
    } else if (req.path.replace('/', '').match(/^s0[0-1].e[0-3][0-9][0-9]$/g)) {
      res.redirect(`https://unusann.us/watch/?v=${req.path.replace('/', '')}`)
    } else {
      res.redirect(`https://unusann.us${req.path}`)
    }
  } else {
    return next()
  }
}