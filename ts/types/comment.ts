import { UserProfilePicture } from './user'

export interface StoredComment {
  episode: string,
  uid: string,
  user?: CommentUser,
  comment: CommentText,
  stats: CommentStatistics
}

export default interface Comment {
  episode: string,
  user: CommentUser,
  comment: CommentText,
  stats: CommentStatistics
}

export interface CommentText {
  plaintext: string,
  html: string
}

export interface CommentStatistics {
  published: number,
  likes: number,
  dislikes: number
}

export interface CommentUser {
  id: string,
  username: string,
  pfp: UserProfilePicture
}

export interface PostCommentResponse {
  error?: {
    code: number,
    message: string
  },
  status?: string,
  comment?: Comment
}