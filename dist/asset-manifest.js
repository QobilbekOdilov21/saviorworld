// v0.2 runtime uses regenerated character art and supplied UI.
import {FRAMES} from './frame-manifest.js?v=0.2';
import {UI} from './ui-manifest.js?v=0.2';
const MEDIA = {
  "stages": [
    {
      "id": "stage_1_rainy_ruined_city",
      "name": "STORMFALL CITY",
      "nameUz": "Bo‘ronli shahar",
      "background": "assets/stages/1-background.webp",
      "foreground": "assets/stages/1-foreground.webp",
      "color": "#69baff",
      "ground": 0.86,
      "thumb": "assets/stages/1-thumb.webp",
      "weather": [
        "assets/stages/1-weather-1.webp",
        "assets/stages/1-weather-2.webp",
        "assets/stages/1-weather-3.webp",
        "assets/stages/1-weather-4.webp",
        "assets/stages/1-weather-5.webp",
        "assets/stages/1-weather-6.webp",
        "assets/stages/1-weather-7.webp",
        "assets/stages/1-weather-8.webp"
      ],
      "full": "assets/stages/1-full.webp"
    },
    {
      "id": "stage_2_hell_cavern",
      "name": "HELLFIRE CAVERN",
      "nameUz": "Olovli g‘or",
      "background": "assets/stages/2-background.webp",
      "foreground": "assets/stages/2-foreground.webp",
      "color": "#ff7a30",
      "ground": 0.85,
      "thumb": "assets/stages/2-thumb.webp",
      "weather": [
        "assets/stages/2-weather-1.webp",
        "assets/stages/2-weather-2.webp",
        "assets/stages/2-weather-3.webp",
        "assets/stages/2-weather-4.webp",
        "assets/stages/2-weather-5.webp",
        "assets/stages/2-weather-6.webp",
        "assets/stages/2-weather-7.webp",
        "assets/stages/2-weather-8.webp"
      ],
      "full": "assets/stages/2-full.webp"
    },
    {
      "id": "stage_3_frozen_glacial_realm",
      "name": "GLACIAL REALM",
      "nameUz": "Muzlik olami",
      "background": "assets/stages/3-background.webp",
      "foreground": "assets/stages/3-foreground.webp",
      "color": "#6de8ff",
      "ground": 0.86,
      "thumb": "assets/stages/3-thumb.webp",
      "weather": [
        "assets/stages/3-weather-1.webp",
        "assets/stages/3-weather-2.webp",
        "assets/stages/3-weather-3.webp",
        "assets/stages/3-weather-4.webp",
        "assets/stages/3-weather-5.webp",
        "assets/stages/3-weather-6.webp",
        "assets/stages/3-weather-7.webp",
        "assets/stages/3-weather-8.webp"
      ],
      "full": "assets/stages/3-full.webp"
    },
    {
      "id": "stage_4_orbital_ai_cyber_core",
      "name": "ORBITAL CORE",
      "nameUz": "Orbital yadro",
      "background": "assets/stages/4-background.webp",
      "foreground": "assets/stages/4-foreground.webp",
      "color": "#65ffe4",
      "ground": 0.86,
      "thumb": "assets/stages/4-thumb.webp",
      "weather": [
        "assets/stages/4-weather-1.webp",
        "assets/stages/4-weather-2.webp",
        "assets/stages/4-weather-3.webp",
        "assets/stages/4-weather-4.webp",
        "assets/stages/4-weather-5.webp",
        "assets/stages/4-weather-6.webp",
        "assets/stages/4-weather-7.webp",
        "assets/stages/4-weather-8.webp"
      ],
      "full": "assets/stages/4-full.webp"
    },
    {
      "id": "stage_5_obsidian_void_temple",
      "name": "OBSIDIAN TEMPLE",
      "nameUz": "Obsidian ibodatxonasi",
      "background": "assets/stages/5-background.webp",
      "foreground": "assets/stages/5-foreground.webp",
      "color": "#cb75ff",
      "ground": 0.86,
      "thumb": "assets/stages/5-thumb.webp",
      "weather": [
        "assets/stages/5-weather-1.webp",
        "assets/stages/5-weather-2.webp",
        "assets/stages/5-weather-3.webp",
        "assets/stages/5-weather-4.webp",
        "assets/stages/5-weather-5.webp",
        "assets/stages/5-weather-6.webp",
        "assets/stages/5-weather-7.webp",
        "assets/stages/5-weather-8.webp"
      ],
      "full": "assets/stages/5-full.webp"
    }
  ],
  "music": [
    {
      "id": "metal-impact",
      "title": "Metal Impact",
      "file": "assets/audio/metal-impact.mp3",
      "duration": 183.0
    },
    {
      "id": "omnibus-i",
      "title": "Omnibus I",
      "file": "assets/audio/omnibus-i.mp3",
      "duration": 193.06
    },
    {
      "id": "omnibus-ii",
      "title": "Omnibus II",
      "file": "assets/audio/omnibus-ii.mp3",
      "duration": 198.0
    },
    {
      "id": "heartbeat-i",
      "title": "Battle Heartbeat I",
      "file": "assets/audio/heartbeat-i.mp3",
      "duration": 169.9
    },
    {
      "id": "heartbeat-ii",
      "title": "Battle Heartbeat II",
      "file": "assets/audio/heartbeat-ii.mp3",
      "duration": 169.61
    }
  ],
  "intro": "assets/video/sysone-intro.mp4"
};
export const ART = {...MEDIA, version:2, fighters:FRAMES.fighters, ui:UI, vfx:UI.staticEffects, clash:FRAMES.clash};
