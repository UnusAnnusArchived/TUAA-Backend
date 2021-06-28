import nodemailer, { SendMailOptions, SentMessageInfo } from 'nodemailer'
import fs from 'fs'

export const mailer = nodemailer.createTransport(require('./config.json').smtp)

export var noReplyEmail: string = 'noreply@unusannusarchive.tk'

export var emails = {}

const dir = fs.readdirSync('emails')
for (var i = 0; i < dir.length; i++) {
  (<Email>emails[dir[i]]) = {
    subject: fs.readFileSync(`emails/${dir[i]}/subject.txt`, 'utf-8'),
    text: fs.readFileSync(`emails/${dir[i]}/index.txt`, 'utf-8'),
    html: fs.readFileSync(`emails/${dir[i]}/index.html`, 'utf-8')
  }
}

export interface Email {
  subject: string,
  text: string,
  html: string
}

export default function sendEmail(type:string, to:string, replaceFunction:(string:string, isHTML:boolean) => string = (string:string) => { return string }):Promise<SentMessageInfo> {
  if (emails[type]) {
    const email:Email = emails[type]
    return mailer.sendMail({
      from: noReplyEmail,
      to,
      subject: replaceFunction(email.subject, false),
      text: replaceFunction(email.text, false),
      html: replaceFunction(email.html, true)
    })
  } else {
    throw new Error('Email type does not exist!')
  }
}