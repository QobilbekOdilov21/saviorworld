// Supplied UI and original effect strips, extracted without creative redraw.
export const UI = {
  "version": 2,
  "buttons": {
    "arcade_tower": "assets/ui-v2/button-arcade_tower.webp",
    "back": "assets/ui-v2/button-back.webp",
    "fight_action": "assets/ui-v2/button-fight_action.webp",
    "fighters_roster": "assets/ui-v2/button-fighters_roster.webp",
    "local_2p_pvp": "assets/ui-v2/button-local_2p_pvp.webp",
    "settings": "assets/ui-v2/button-settings.webp",
    "versus_1p_ai": "assets/ui-v2/button-versus_1p_ai.webp"
  },
  "avatars": {
    "savior": "assets/ui-v2/avatar-savior.webp",
    "ignis": "assets/ui-v2/avatar-ignis.webp",
    "glacia": "assets/ui-v2/avatar-glacia.webp",
    "aether_x": "assets/ui-v2/avatar-aether_x.webp",
    "malakor": "assets/ui-v2/avatar-malakor.webp"
  },
  "avatarCards": {
    "savior": "assets/ui-v2/avatar-card-savior.webp",
    "ignis": "assets/ui-v2/avatar-card-ignis.webp",
    "glacia": "assets/ui-v2/avatar-card-glacia.webp",
    "aether_x": "assets/ui-v2/avatar-card-aether_x.webp",
    "malakor": "assets/ui-v2/avatar-card-malakor.webp"
  },
  "portraits": {
    "savior": "assets/ui-v2/portrait-savior.webp",
    "ignis": "assets/ui-v2/portrait-ignis.webp",
    "glacia": "assets/ui-v2/portrait-glacia.webp",
    "aether_x": "assets/ui-v2/portrait-aether_x.webp",
    "malakor": "assets/ui-v2/portrait-malakor.webp"
  },
  "hud": {
    "top": "assets/ui-v2/hud-top-original.webp",
    "meterBlue": "assets/ui-v2/meter-blue-original.webp",
    "meterGold": "assets/ui-v2/meter-gold-original.webp",
    "fpsBadge": "assets/ui-v2/badge-90fps.webp",
    "chrome": "assets/ui-v2/hud-top-chrome.webp",
    "geometry": {
      "size": [
        1322,
        211
      ],
      "leftHpPolygon": [
        [
          47,
          81
        ],
        [
          536,
          81
        ],
        [
          554,
          120
        ],
        [
          65,
          120
        ]
      ],
      "rightHpPolygon": [
        [
          786,
          81
        ],
        [
          1275,
          81
        ],
        [
          1257,
          120
        ],
        [
          768,
          120
        ]
      ],
      "leftHpRect": [
        47,
        81,
        507,
        39
      ],
      "rightHpRect": [
        768,
        81,
        507,
        39
      ],
      "timerCenter": [
        661,
        119
      ],
      "timerRadius": 55,
      "timerAperture": [
        606,
        64,
        716,
        174
      ],
      "leftFillDirection": "right-to-left",
      "rightFillDirection": "left-to-right",
      "drawOrder": [
        "dark fill windows and timer disc",
        "dynamic HP fills",
        "chrome",
        "dynamic timer text"
      ]
    },
    "meterBlueChrome": "assets/ui-v2/meter-blue-chrome.webp",
    "meterGoldChrome": "assets/ui-v2/meter-gold-chrome.webp",
    "meterGeometry": {
      "size": [
        599,
        99
      ],
      "fillPolygon": [
        [
          52,
          34
        ],
        [
          532,
          34
        ],
        [
          517,
          66
        ],
        [
          55,
          66
        ]
      ],
      "fillRect": [
        52,
        34,
        480,
        32
      ],
      "goldFillDirection": "left-to-right",
      "blueFillDirection": "right-to-left",
      "indicatorLedNote": "Small source LEDs are ornamental. Actual energy percentage must remain explicit dynamic text."
    }
  },
  "banners": {
    "brutality": "assets/ui-v2/banner-brutality.webp",
    "final_round": "assets/ui-v2/banner-final_round.webp",
    "flawless_victory": "assets/ui-v2/banner-flawless_victory.webp",
    "match_over": "assets/ui-v2/banner-match_over.webp",
    "round_1": "assets/ui-v2/banner-round_1.webp",
    "round_2": "assets/ui-v2/banner-round_2.webp",
    "fatality": "assets/ui-v2/banner-fatality.webp",
    "fight": "assets/ui-v2/banner-fight.webp",
    "finish_him": "assets/ui-v2/banner-finish_him.webp"
  },
  "touch": {
    "block": "assets/ui-v2/touch-block.webp",
    "grab": "assets/ui-v2/touch-grab.webp",
    "heavy": "assets/ui-v2/touch-heavy.webp",
    "light": "assets/ui-v2/touch-light.webp",
    "special": "assets/ui-v2/touch-special.webp",
    "xray": "assets/ui-v2/touch-xray.webp",
    "dpad_8way_base": "assets/ui-v2/touch-dpad_8way_base.webp",
    "joystick_thumb_knob": "assets/ui-v2/touch-joystick_thumb_knob.webp"
  },
  "cards": [
    "assets/ui-v2/stage_01_rainy_city.webp",
    "assets/ui-v2/stage_02_hell_cavern.webp",
    "assets/ui-v2/stage_03_glacial_realm.webp",
    "assets/ui-v2/stage_04_cyber_core.webp",
    "assets/ui-v2/stage_05_void_temple.webp"
  ],
  "references": [
    {
      "title": "Asl bosh menyu konsepti",
      "file": "assets/ui-v2/reference-01_main_menu.webp",
      "referenceOnly": true
    },
    {
      "title": "Asl personaj tanlash konsepti",
      "file": "assets/ui-v2/reference-02_character_select.webp",
      "referenceOnly": true
    },
    {
      "title": "Asl VS yuklash konsepti",
      "file": "assets/ui-v2/reference-03_vs_loading_screen.webp",
      "referenceOnly": true
    },
    {
      "title": "Asl HP va taymer paneli",
      "file": "assets/ui-v2/hud-top-original.webp",
      "referenceOnly": true
    },
    {
      "title": "Asl ko‘k energiya paneli",
      "file": "assets/ui-v2/meter-blue-original.webp",
      "referenceOnly": true
    },
    {
      "title": "Asl oltin energiya paneli",
      "file": "assets/ui-v2/meter-gold-original.webp",
      "referenceOnly": true
    }
  ],
  "effects": {
    "proj_aether_x_plasma_orb": {
      "atlas": "assets/fx-v2/proj_aether_x_plasma_orb-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": true,
      "duration": 0.4,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "proj_glacia_ice_lance": {
      "atlas": "assets/fx-v2/proj_glacia_ice_lance-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": true,
      "duration": 0.4,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "proj_ignis_hellfire_meteor": {
      "atlas": "assets/fx-v2/proj_ignis_hellfire_meteor-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": true,
      "duration": 0.4,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "proj_malakor_obsidian_chain_wave": {
      "atlas": "assets/fx-v2/proj_malakor_obsidian_chain_wave-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": true,
      "duration": 0.4,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "proj_savior_lightning_spear": {
      "atlas": "assets/fx-v2/proj_savior_lightning_spear-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": true,
      "duration": 0.4,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "vfx_block_shield_hex_flash": {
      "atlas": "assets/fx-v2/vfx_block_shield_hex_flash-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": false,
      "duration": 0.22,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "vfx_critical_blood_shatter": {
      "atlas": "assets/fx-v2/vfx_critical_blood_shatter-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": false,
      "duration": 0.22,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    },
    "vfx_hit_spark_gold_electric": {
      "atlas": "assets/fx-v2/vfx_hit_spark_gold_electric-90.webp",
      "cell": 320,
      "cols": 12,
      "frames": 12,
      "fps": 90,
      "sourceDuration": 0.13333333333333333,
      "loop": false,
      "duration": 0.22,
      "note": "Original complete strip; duration may be retimed by the animation clock. No dissolve interpolation."
    }
  },
  "staticEffects": {
    "proj_aether_x_plasma_orb": "assets/fx-v2/proj_aether_x_plasma_orb-still.webp",
    "proj_glacia_ice_lance": "assets/fx-v2/proj_glacia_ice_lance-still.webp",
    "proj_ignis_hellfire_meteor": "assets/fx-v2/proj_ignis_hellfire_meteor-still.webp",
    "proj_malakor_obsidian_chain_wave": "assets/fx-v2/proj_malakor_obsidian_chain_wave-still.webp",
    "proj_savior_lightning_spear": "assets/fx-v2/proj_savior_lightning_spear-still.webp",
    "vfx_block_shield_hex_flash": "assets/fx-v2/vfx_block_shield_hex_flash-still.webp",
    "vfx_critical_blood_shatter": "assets/fx-v2/vfx_critical_blood_shatter-still.webp",
    "vfx_hit_spark_gold_electric": "assets/fx-v2/vfx_hit_spark_gold_electric-still.webp"
  },
  "menuBackground": "assets/ui-v2/menu-background.webp",
  "clashBackground": "assets/ui-v2/clash-background.webp",
  "tower": "assets/ui-v2/arcade-tower.webp",
  "clashFramesSource": "FRAMES.clash"
};
