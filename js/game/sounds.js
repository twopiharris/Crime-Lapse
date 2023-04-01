ion.sound({
    sounds: [
        // MUSIC
        {
            path: "res/audio/music/",
            name: "xeon",
            preload: true
        },{
            path: "res/audio/music/",
            name: "n_dimensions",
            volume: 0.1,
            ended_callback: function() {
                ion.sound.play("n_dimensions");   // loop bg music
            }
        },{
            path: "res/audio/music/",
            name: "orbital_colossus",
            volume: 0.7,
            ready_callback: function() {
                ion.sound.stop("music/n_dimensions");           // stop playing other music when this starts
            },
            ended_callback: function() {
                ion.sound.play("orbital_colossus");       // loop bg music
            }
        },
        // VOICES
        {
            path: "res/audio/voice/",
            name: "intro",
            ended_callback: function() {
                // when intro dialogue is done playing, activate molebots
                for (var i=0; i<molebots.length; i++) {
                    enemyList.push(molebots[i]);
                    numEnemiesLeft++;
                }
                announcement.announce("Stage 1: Mole Mania", 2000);
            }
        },{
            path: "res/audio/voice/",
            name: "spiderbot_intro",
            ended_callback: function() {
                announcement.announce("Stage 2: Spider Spectacular", 2000);
                for (var i=0; i<spiderbots.length; i++) {
                    spiderbots[i].mesh.isVisible = true;
                    enemyList.push(spiderbots[i]);
                    numEnemiesLeft++;
                }
                roundNum++;
            }
        }, {
            path: "res/audio/voice/",
            name: "4_left"
        },{
            path: "res/audio/voice/",
            name: "3_left"
        },{
            path: "res/audio/voice/",
            name: "2_left"
        },{
            path: "res/audio/voice/",
            name: "1_left"
        },{
            path: "res/audio/voice/",
            name: "molebot_death_1"
        },{
            path: "res/audio/voice/",
            name: "molebot_death_2"
        },{
            path: "res/audio/voice/",
            name: "alah_akbot"
        },{
            path: "res/audio/voice/",
            name: "simon_intro_1",
            ended_callback: function() {
                // when announcer finished introducing simon, make simon move up from ground
                enemyList.push(simon);
                simon.moveUp();
            }
        },{
            path: "res/audio/voice/",
            name: "simon_intro_2"
        },{
            path: "res/audio/voice/",
            name: "simon_intro_3",
            ended_callback: function() {
                announcement.announce('Stage 3: Simon Says "DIE"', 2000);
                ion.sound.play("orbital_colossus");
                simon.activated = true;
                ion.sound.play("startup");
                currentBoss = simon;
            }
        },{
            path: "res/audio/voice/",
            name: "ultra_rapid_fire_mode"
        },
        // SFX
        {
            name: "laserfire01"
        },{
            name: "laserfire02",
            volume: 0.4
        },{
            name: "blink"
        },{
            name: "timeresume"
        },{
            name: "explosion"
        },{
            name: "simon_move_up",
            ended_callback: function() {
                ion.sound.play("simon_intro_2");
            }
        },{
            name: "startup"
        },{
            name: "robot_die"
        },{
            name: "hurt"
        },{
            name: "simon_wrong"
        }
    ],
    path: "res/audio/",
    preload: false,
    multiplay: true
});