import { Request, Response, NextFunction } from 'express'

export function handle404(req:Request, res:Response) {
  res.status(404).send({error:{number:404,code:'ERRNOTFOUND',message:'404 Not Found! The resource you are trying to access does not exist.'}})
}

export function handle500(err:Error, req:Request, res:Response, next:NextFunction) {
  res.status(500).send({error:{number:500,code:'ERRINTERNAL',message:'500 Internal Server Error! The server was unable to complete your request due to a configuration error.',stack:err.stack}})
}
