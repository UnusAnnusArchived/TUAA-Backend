export default interface Feed {
  providerName: 'The Unus Annus Archive',
  lastUpdated: string,
  language: 'en',
  playlists: Playlist[],
  series: Series[]
}

export interface Playlist {
  name: 'Specials' | 'Season 1',
  itemIds: string[]
}

export interface Series {
  id: 'UnusAnnus',
  title: 'Unus Annus',
  seasons: Season[],
  genres: ['comedy'],
  thumbnail: 'https://cdn.unusann.us/roku-assets/series-thumbnail.jpg',
  releaseDate: '2019-11-15',
  shortDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be...',
  longDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be deleted along with all of the daily uploads accumulated since then. Nothing will be saved. Nothing will be reuploaded. This is your one chance to join us at the onset of our adventure. To be there from the beginning. To make every second count. Subscribe now and relish what little time we have left or have the choice made for you as we disappear from existence forever. But remember... everything has an end. Even you. Memento mori. Unus annus.'
}

export interface Season {
  seasonNumber: '0' | '1',
  episodes: Episode[]
}

export interface Episode {
  id: string,
  title: string,
  content: {
    dateAdded: string,
    videos: Video[],
    duration: number,
    captions: Caption[],
    language: 'en'
  },
  thumbnail: string,
  releaseDate: string,
  episodeNumber: number,
  shortDescription: string,
  longDescription?: string
}

export interface Video {
  url: string,
  quality: 'SD' | 'HD' | 'FHD' | 'UHD',
  videoType: string
}

export interface Caption {
  url: string,
  language: string,
  captionType: 'SUBTITLE'
}