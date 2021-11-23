"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var config_json_1 = require("../../../config.json");
function feed(app) {
    app.get('/roku/v1/feed', function (req, res) {
        var allMetadata = [[], []];
        var s00 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/00"));
        for (var i = 0; i < s00.length; i++) {
            allMetadata[0].push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/00/").concat(s00[i]), 'utf-8')));
        }
        var s01 = fs_1.default.readdirSync("".concat(config_json_1.metadataPath, "/01"));
        for (var i = 0; i < s01.length; i++) {
            allMetadata[1].push(JSON.parse(fs_1.default.readFileSync("".concat(config_json_1.metadataPath, "/01/").concat(s01[i]), 'utf-8')));
        }
        res.send({
            providerName: 'The Unus Annus Archive',
            lastUpdated: new Date().toISOString(),
            language: 'en',
            playlists: [
                {
                    name: 'Specials',
                    itemIds: allMetadata[0].map(function (episode) {
                        return "s".concat(episode.season.toString().padStart(2, '0'), ".e").concat(episode.episode.toString().padStart(3, '0'));
                    })
                },
                {
                    name: 'Season 1',
                    itemIds: allMetadata[1].map(function (episode) {
                        return "s".concat(episode.season.toString().padStart(2, '0'), ".e").concat(episode.episode.toString().padStart(3, '0'));
                    })
                }
            ],
            series: [
                {
                    id: 'UnusAnnus',
                    title: 'Unus Annus',
                    seasons: [
                        {
                            seasonNumber: '0',
                            episodes: genSeason(0)
                        },
                        {
                            seasonNumber: '1',
                            episodes: genSeason(1)
                        }
                    ],
                    genres: ['comedy'],
                    thumbnail: 'https://cdn.unusann.us/roku-assets/series-thumbnail.jpg',
                    releaseDate: new Date(allMetadata[1][0].date || allMetadata[1][0].releasedate).toISOString().split('T')[0],
                    shortDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be...',
                    longDescription: 'What would you do if you only had a year left to live? Would you squander the time you were given? Or would you make every second count? Welcome to Unus Annus. In exactly 365 days this channel will be deleted along with all of the daily uploads accumulated since then. Nothing will be saved. Nothing will be reuploaded. This is your one chance to join us at the onset of our adventure. To be there from the beginning. To make every second count. Subscribe now and relish what little time we have left or have the choice made for you as we disappear from existence forever. But remember... everything has an end. Even you. Memento mori. Unus annus.'
                }
            ]
        });
        function genSeason(season) {
            return allMetadata[season].map(function (episode) {
                var _a, _b;
                return {
                    id: "s".concat(episode.season.toString().padStart(2, '0'), ".e").concat(episode.episode.toString().padStart(3, '0')),
                    title: episode.title,
                    content: {
                        dateAdded: new Date(episode.date || episode.releasedate).toISOString(),
                        videos: episode.video ? [{ url: "https://".concat(episode.video), quality: 'FHD', videoType: episode.video.split('.')[episode.video.split('.').length - 1].toUpperCase() }] : episode.sources.map(function (source) {
                            return {
                                url: "https:".concat(source.src),
                                quality: source.size < 720 ? 'SD' : source.size < 1080 ? 'HD' : source.size < 2160 ? 'FHD' : 'UHD',
                                videoType: source.type.split('/')[1].toUpperCase()
                            };
                        }),
                        duration: episode.duration || 43208,
                        captions: (_a = episode.tracks) === null || _a === void 0 ? void 0 : _a.map(function (track) {
                            if (track.kind === 'captions') {
                                return {
                                    url: "https:".concat(track.src),
                                    language: track.srclang,
                                    captionType: 'SUBTITLE'
                                };
                            }
                            else {
                                return undefined;
                            }
                        }),
                        language: 'en'
                    },
                    thumbnail: "https:".concat(((_b = episode.thumbnail) === null || _b === void 0 ? void 0 : _b.replace('.webp', '.jpg')) || episode.posters[1].src),
                    releaseDate: new Date(episode.date || episode.releasedate).toISOString().split('T')[0],
                    episodeNumber: episode.episode,
                    shortDescription: episode.description === '' ? 'This episode doesn\'t have a description.' : episode.description.length > 197 ? "".concat(episode.description.substr(0, 197), "...") : episode.description,
                    longDescription: episode.description.length > 197 ? episode.description : undefined
                };
            });
        }
    });
}
exports.default = feed;
//# sourceMappingURL=feed.js.map