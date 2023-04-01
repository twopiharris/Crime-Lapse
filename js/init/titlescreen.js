//ion.sound.play("nightcall_8bit");

// load title screen images
var pressKeyImg = new Image();
pressKeyImg.src = "res/textures/press_any_key.png";
var bg = new Image();
bg.src = "res/textures/title.jpg";


var fadeInterval, alpha = -1, fadeDir = 1;
bg.onload = function() {

    //window.addEventListener("keydown", startLoading);

    fadeInterval = setInterval(function() {
        if (pressKeyImg) {
            hudCtx.clearRect(0, 0, canvas.width, canvas.height);

            hudCtx.globalAlpha = 1;
            hudCtx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            alpha += (0.15 * fadeDir);
            if (Math.abs(alpha) >= 1) {
                fadeDir *= -1;
                alpha = Math.round(alpha);
            }

            // alpha is bouncing between (-1, 1).  add 1 and divide by 2 to get between (0, 1)
            hudCtx.globalAlpha = (alpha + 1) / 2;
            hudCtx.drawImage(pressKeyImg, 0, 0, canvas.width, canvas.height);
        }
    }, 1000/30);
};





function startLoading() {
    // clear title screen, play sound, go to loading screen
    clearInterval(fadeInterval);
    bg = null;
    pressKeyImg = null;
    hudCtx.globalAlpha = 1;
    ion.sound.play("blink");

    // remove event listener and stop playing title music
    //window.removeEventListener("keydown", startLoading);

    
    var m = meshLoadOrder.shift();
    BABYLON.SceneLoader.ImportMesh("", "", m.filename, m.scene, m.onsuccess, m.progressCallBack);
}

startLoading();
