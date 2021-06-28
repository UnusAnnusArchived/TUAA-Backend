import { Request, Response } from 'express'

export default function download(req:Request, res:Response) {
  var params = []
  if (req.query.filename) {
    params.push(`filename=${req.query.filename}`)
  }
  res.redirect(`https://cdn.unusann.us/download.php?path=${req.path.replace('/cdndownload', '')}&${params.join('&')}`)
}