import MusicMetadata from "./musicmetadata";

export interface GlobalMetadata {
  videos?: Metadata[][],
  music?: MusicMetadata[]
}

export default interface Metadata {
  video?: string,
  sources?: Source[],
  tracks?: Track[],
  thumbnail?: string,
  posters?: Poster[],
  previewSprites?: PreviewSprite[]
  season: number,
  episode: number,
  title: string,
  description: string,
  date?: number,
  releasedate?: number,
  islast?: boolean,
  duration?: number,
  id?: string,
  version?: number,
  seasonname?: string
}

export interface Source {
  src: string,
  type: string,
  size: number
}

export interface Track {
  kind: string,
  label: string,
  srclang: string,
  src: string,
  styles?: string[]
}

export interface Poster {
  src: string,
  type: string
}

export interface PreviewSprite {
  src: string,
  length: number
}