import Comment, { PostCommentResponse } from '../../../ts/types/comment'
import { LimitedUser } from '../../../ts/types/user'
import { globalmetadata } from './main.js'
import * as utf8 from './utf8.js'
import moment from '../../../node_modules/moment/dist/moment.js'

var amountLoaded = 0
var commentsLoaded = false

export async function loadComments(from:number = 0, to:number = 20) {
  const user:LimitedUser = JSON.parse(localStorage.getItem('user'))
  if (user) {
    (<HTMLImageElement>document.getElementById('currentpfp')).src = user.pfp.filename
    document.getElementById('currentusername').innerText = user.username
  } else {
    document.getElementById('addcomment').style.display = 'none'
  }

  const div = document.getElementById('comments')

  const comments = await fetch(`/api/v2/comments/get/${globalmetadata.id}?from=${from}&to=${to}`).then(res => res.json())

  if (from == 0) {
    document.getElementById('comments').innerHTML = ''
  }

  if (from == 0 && comments.length == 0) {
    document.getElementById('comments').innerHTML = '<h4 style="text-align:center;">No comments</h4>'
  } else {
    comments.forEach((comment:Comment) => {
      console.log(comment)
      const template = <HTMLElement>(<HTMLTemplateElement>document.getElementById('comment-template')).content.cloneNode(true);

      (<HTMLImageElement>template.querySelector('#profpic')).src = comment.user.pfp.filename;
      (<HTMLSpanElement>template.querySelector('#username')).innerText = utf8.decode(comment.user.username)
      template.querySelector('#text').innerHTML = utf8.decode(comment.comment.html)
      template.querySelector('#time').innerHTML = moment(comment.stats.published).fromNow()
      template.querySelector('#time').setAttribute('title', moment(comment.stats.published).format('dddd, MMMM, D, YYYY h:mm A'))

      template.querySelector('#profpic').addEventListener('error', () => {
        (<HTMLImageElement>template.querySelector('#profpic')).src = '/userdata/profilepics/default.jpg'
      })

      div.appendChild(template)

      amountLoaded = to
      commentsLoaded = true
    })
  }
}

function loadMoreComments() {
  loadComments(amountLoaded, amountLoaded+20)
}

document.getElementById('submitcomment').onclick = submitComment

async function submitComment() {
  const comment = (<HTMLInputElement>document.getElementById('commenttext')).value
  if (comment === '') {
    return
  }

  const loginKey = localStorage.getItem('loginKey')
  if (loginKey) {
    const { id } = globalmetadata

    var { response, status } = await fetch(`/api/v2/comments/post/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({comment, loginKey: loginKey || ''})
    }).then(async(res) => {
      return {
        response: await res.text(),
        status: res.status
      }
    })
    if (status === 429) {
      return alert('You\'re being rate limited!\nPlease try again in a few minutes.')
    }
    const res:PostCommentResponse = JSON.parse(response)
    if (res.status == 'success') {
      loadComments();
      (<HTMLInputElement>document.getElementById('commenttext')).value = ''
    } else {
      if (res.error.code === 3) {
        alert('Invalid message length! Maximum is 500 characters.')
      } else {
        const err = new Error(res.error?.message || 'Unknown error whilst submitting comment')
        alert(err)
        throw err
      }
    }
  } else {
    throw new Error('Cannot submit comment when not logged in!')
  }
}

window.addEventListener('scroll', () => {
  if (document.documentElement.scrollHeight - document.documentElement.scrollTop === document.documentElement.clientHeight) {
    loadMoreComments()
  }
})