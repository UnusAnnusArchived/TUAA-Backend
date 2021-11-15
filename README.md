# *This repo has been archived*
Please visit the new repo [here](https://github.com/UnusAnnusArchived/TUAA-Backend)

<hr>

# The Unus Annus Archive Backend
Here is an example CDN if you're looking to setup your own (you will need to modify a bit of code since the current one is hard-coded into a few things)

```bash
├── 00/ # Season 0 (Specials)
│   ├── 001/ # Specials - Episode 1
│   │   ├── 1080.mp4 # Specials - Episode 1 - 1080p
│   │   ├── 720.mp4 # Specials - Episode 1 - 720p
│   │   ├── 480.mp4 # Specials - Episode 1 - 480p
│   │   ├── 360.mp4 # Specials - Episode 1 - 360p
│   │   └── 240.mp4 # Specials - Episode 1 - 240p
│   ├── ...
│   ├── 007/ # Specials - Episode 1
│   │   ├── 2160.mp4 # Specials - Episode 7 - 2160p (4K)
│   │   ├── 1440.mp4 # Specials - Episode 7 - 1440p
│   │   ├── 1080.mp4 # Specials - Episode 7 - 1080p
│   │   ├── 720.mp4 # Specials - Episode 7 - 720p
│   │   ├── 480.mp4 # Specials - Episode 7 - 480p
│   │   ├── 360.mp4 # Specials - Episode 7 - 360p
│   │   └── 240.mp4 # Specials - Episode 7 - 240p
│   └── ...
├── 01/ # Season 1
│   ├── 001 # Season 1 - Episode 1
│   │   ├── 2160.mp4 # Season 1 - Episode 1 - 2160p (4K)
│   │   ├── 1440.mp4 # Season 1 - Episode 1 - 1440p
│   │   ├── 1080.mp4 # Season 1 - Episode 1 - 1080p
│   │   ├── 720.mp4 # Season 1 - Episode 1 - 720p
│   │   ├── 480.mp4 # Season 1 - Episode 1 - 480p
│   │   ├── 360.mp4 # Season 1 - Episode 1 - 360p
│   │   └── 240.mp4 # Season 1 - Episode 1 - 240p
│   ├── 002 # Season 1 - Episode 2
│   │   ├── 1080.mp4 # Season 1 - Episode 2 - 1080p
│   │   ├── 720.mp4 # Season 1 - Episode 2 - 720p
│   │   ├── 480.mp4 # Season 1 - Episode 2 - 480p
│   │   ├── 360.mp4 # Season 1 - Episode 2 - 360p
│   │   └── 240.mp4 # Season 1 - Episode 2 - 240p
├── thumbnails/
│   ├── 00/ # Specials Thumbnails
│   │   ├── 001.jpg # Specials - Episode 1 Thumbnail (jpg)
│   │   ├── 001.webp # Specials - Episode 1 Thumbnail (webp)
│   │   ├── 002.jpg # Specials - Episode 2 Thumbnail (jpg)
│   │   ├── 002.webp # Specials - Episode 2 Thumbnail (webp)
│   │   └── ...
│   ├── 01/ # Season 1 Thumbnails
│   │   ├── 001.jpg # Season 1 - Episode 1 Thumbnail (jpg)
│   │   ├── 001.webp # Season 1 - Episode 1 Thumbnail (webp)
│   │   ├── 002.jpg # Season 1 - Episode 2 Thumbnail (jpg)
│   │   ├── 002.webp # Season 1 - Episode 2 Thumbnail (webp)
│   │   └── ...
├── subs/
│   ├── 00/ # Specials Subtitles
│   │   ├── 001.en.vtt # Specials - Episode 1 Subtitles (English)
│   │   ├── 002.en.vtt # Specials - Episode 2 Subtitles (English)
│   │   └── ...
│   ├── 01/ # Season 1 Subtitles
│   │   ├── 001.en.vtt # Season 1 - Episode 1 Subtitles (English)
│   │   ├── 002.en.vtt # Season 1 - Episode 2 Subtitles (English)
│   │   └── ...
├── site-assets/
│   ├── autoplay/
│   │   └── next.svg
│   ├── social-media/
│   │   ├── discord.svg
│   │   └── twitter.svg 
│   └── share.svg

```

*You can also use [our cdn](https://cdn.unusann.us) or [our cdn github](https://github.com/TheUnusAnnusArchive/TUAA-CDN) to see the entire structure*

You'll also need to setup a server with nodejs installed, download the source code to it, run `npm install` in the source code folder, copy `config.template.json` to `config.json` and configure it, run `npx tsc` to compile the TypeScript, and then run `node .` and you'll have a working server. You should also change the email addresses in some of the html documents in `/public/` to your own, or remove them completely.

If you want the server to run on port 80 instead of port 1024, go to the bottom of `/src/main.ts` and change `app.listen(1024)` to `app.listen(80)`, then run `npx tsc` to compile the changes.


### Sorry if this documentation isn't very good, I wrote it up in just a couple minutes. Please make an issue if you don't understand or need help with something.
