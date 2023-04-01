crossHairIMG = new Image();
crossHairIMG.src = "res/textures/crosshair.png";
crossHairIMG.width = crossHairIMG.height = 32;



// function to make a message fade in/out on screen
var announcement =  {
    message: "",
    duration: 1000,
    timer: 99999,
    fadeInLength: 250,
    fadeOutLength: 500,
    opacity: 0,

    announce: function(message, duration) {
        announcement.message = message;
        announcement.duration = duration;
        announcement.timer = 0;
    },
    draw: function() {
        if (announcement.timer <= announcement.duration + announcement.fadeInLength + announcement.fadeOutLength) {
            announcement.timer += deltaTime;
            if (announcement.timer <= announcement.fadeInLength)
                announcement.opacity = Math.min(1, announcement.timer / announcement.fadeInLength);
            if (announcement.timer >= announcement.duration + announcement.fadeInLength)
                announcement.opacity = Math.max(0, 1-(announcement.timer - announcement.duration - announcement.fadeInLength) / announcement.fadeOutLength);

            hudCtx.textAlign = "center";
            hudCtx.font = "100px roadrage";
            hudCtx.fillStyle = "rgba(255,255,255," + announcement.opacity + ")";
            hudCtx.fillText(announcement.message, canvas.width / 2, canvas.height / 4);
        }
    }
};

var hudIMG = new Image();
hudIMG.src = "res/textures/hud.png";
var hudHealthIMG = new Image();
hudHealthIMG.src = "res/textures/hud_health.png";
var hudTimeIMG = new Image();
hudTimeIMG.src = "res/textures/hud_timeframe.png";

var uiDrawCounter = 0;
function drawUI() {
    // only draw ui every few frames, no point in it being 60 fps
    uiDrawCounter = (uiDrawCounter+1)%3;
    if (uiDrawCounter > 0)
        return;

    hudCtx.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    hudCtx.drawImage(hudIMG, 0, 0, hudCanvas.width, hudCanvas.height);
    hudCtx.drawImage(crossHairIMG, canvas.width/2 - crossHairIMG.width/2, canvas.height/2 - crossHairIMG.height/2, crossHairIMG.width, crossHairIMG.height);

    hudCtx.font = "50px lazer84";
    hudCtx.fillStyle = "red";
    for (var i=0; i<player.maxBlinkCharges; i++ ) {
        if (i < player.blinkCharges)
            hudCtx.fillRect(canvas.width / 2 - 15, canvas.height / 2 + 60 - 10 * i, 30, 5);
        else if (i == player.blinkCharges) {
            var width = (1-(player.blinkRecharge / player.blinkRechargeRate)) * 30;
            hudCtx.fillRect(canvas.width / 2 - 15, canvas.height / 2 + 60 - 10 * i, width, 5);
        }
    }

    var offset = 740;
    var width = player.prevPositions.length / 60 * (hudTimeIMG.width-2*offset);
    hudCtx.drawImage(hudTimeIMG, 0, 0, width+offset, hudTimeIMG.height, 0, 0, (width+offset)*canvas.width/hudTimeIMG.width, canvas.height);
    offset = 585;
    width = player.hp / 100 * (hudHealthIMG.width-2*offset);
    hudCtx.drawImage(hudHealthIMG, 0, 0, width+offset, hudHealthIMG.height, 0, 0, (width+offset)*canvas.width/hudTimeIMG.width, canvas.height);
    //hudCtx.fillText("AMMO: " + player.gun.ammo + " | CLIP: " + player.gun.ammoInClip + "/" + player.gun.clipSize, 10, window.innerHeight-10);

    hudCtx.textAlign = "right";
    //hudCtx.fillText("FPS: " + Math.round((1/deltaTime)*1000), canvas.width-10, 50);

    // if boss, draw boss's health at top center of screen
    if (currentBoss) {
        var bgWidth = canvas.width/3;
        var width = Math.max(0,currentBoss.hp)/currentBoss.maxHP * bgWidth;
        hudCtx.fillStyle = "rgb(200,200,200)";
        hudCtx.fillRect(canvas.width/2 - bgWidth/2, 10, bgWidth, 30);
        hudCtx.fillStyle = "rgb(250, 0, 50)";
        hudCtx.fillRect(canvas.width/2 - bgWidth/2, 10, width, 30);
        hudCtx.fillStyle = "black";
        hudCtx.font = "20px Arial";
        hudCtx.textAlign = "center";
        hudCtx.fillText("BOSS HP", canvas.width/2, 33);
    }

    // not fighting boss, draw how many number of enemies remain

    hudCtx.fillStyle = "rgb(155,155,155)";
    hudCtx.font = (40*canvas.width/1920) + "px lazer84";
    hudCtx.textAlign = "left";
    var y = canvas.height/1080 * 50;
    hudCtx.fillText("Enemies Left: " + numEnemiesLeft, 10, y);
    hudCtx.font = (50*canvas.width/1920) + "px lazer84";
    hudCtx.textAlign = "right";
    hudCtx.fillText("Round: " + roundNum, canvas.width-10, y);


    hudCtx.textAlign = "left";
    hudCtx.fillText("FPS: " + Math.round(engine.fps), 10, canvas.height - 50);

    announcement.draw();
}