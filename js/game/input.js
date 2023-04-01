/* ----- KEY INPUT ----- */
var keys = [];
var W_KEY = 87, S_KEY = 83, A_KEY = 65, D_KEY = 68, SPACE_KEY = 32, R_KEY = 82, E_KEY = 69, Q_KEY = 81, SHIFT_KEY = 16;

window.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    // only want to jump when key is pressed (not held) so putting this here
    if (keys[SPACE_KEY] && controlsEnabled) {
        if (player.jumpCount > 0) {
            player.isFalling = true;
            player.jumpTimer = 200;
            player.jumpCount--;
            player.mesh.physicsImpostor.applyImpulse(new BABYLON.Vector3(0, 12, 0), new BABYLON.Vector3(0, 0, 0));
        }
    }
});
window.addEventListener("keyup", function(e) {
    delete keys[e.keyCode];
});


// controlsEnabled toggles controls for when in different camera views (dont want to move player when in spectator cam)
var controlsEnabled = true;
function keyListener() {
    // press 1 -> camera 1 (FPS cam)
    if (keys[49]) {
        controlsEnabled = true;
        camera.attachControl(canvas, false);
        camera2.detachControl(canvas, false);
        scene.activeCamera = camera;
    }
    // press 2 -> camera 2 (Free Look cam)
    if (keys[50]) {
        controlsEnabled = false;
        scene.activeCamera = camera2;
        camera.detachControl(canvas, false);
        camera2.attachControl(canvas, false);

    }
    // press R -> reload
    if (keys[R_KEY])
        player.gun.reload();
    // press E -> go back in time (not pressing E -> decrement blink cooldown)
    if (keys[E_KEY] && player.backInTimeTimer <= 0) {
        player.goBackInTime();
    }
    else if (player.backInTimeTimer > 0)
        player.backInTimeTimer -= deltaTime;

    if (controlsEnabled) {
        var moveSpeed = 1, blinkSpeed = 10;
        if (player.isFalling) {
            moveSpeed /= 5;
            player.mesh.position.x += player.deltaPos.x / 2;
            player.mesh.position.z += player.deltaPos.z / 2;
        } else {
            player.deltaPos = player.mesh.position.subtract(player.prevPos);
        }
        player.prevPos = player.mesh.position.clone();
        // if moving diagonal, normalize move speed (pythag theorem -> divide by sqrt(2))
        if ((keys[W_KEY] || keys[S_KEY]) && (keys[A_KEY] || keys[D_KEY])) {
            moveSpeed /= 1.4142;
            blinkSpeed /= 1.4142;
        }
        
        if (keys[W_KEY]) {
            //player.mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(Math.sin(camera.rotation.y) * vel, 0, Math.cos(camera.rotation.y) * vel));
            player.mesh.position.z += Math.cos(camera.rotation.y) * moveSpeed;
            player.mesh.position.x += Math.sin(camera.rotation.y) * moveSpeed;
            player.mesh.position.add(new BABYLON.Vector3(Math.sin(camera.rotation.y) * moveSpeed, 0, Math.cos(camera.rotation.y) * moveSpeed));
        }
        if (keys[S_KEY]) {
            player.mesh.position.z -= Math.cos(camera.rotation.y) * moveSpeed;
            player.mesh.position.x -= Math.sin(camera.rotation.y) * moveSpeed;
            //player.mesh.translate(BABYLON.Axis.Z, -moveSpeed, BABYLON.Space.LOCAL);
        }
        if (keys[A_KEY]) {
            //player.mesh.translate(BABYLON.Axis.X, -moveSpeed, BABYLON.Space.LOCAL);
            player.mesh.position.z += Math.sin(camera.rotation.y) * moveSpeed;
            player.mesh.position.x -= Math.cos(camera.rotation.y) * moveSpeed;
        }
        if (keys[D_KEY]) {
            //player.mesh.translate(BABYLON.Axis.X, moveSpeed, BABYLON.Space.LOCAL);
            player.mesh.position.z -= Math.sin(camera.rotation.y) * moveSpeed;
            player.mesh.position.x += Math.cos(camera.rotation.y) * moveSpeed;
        }

        // right click -> initiate player blink
        if (player.initiatingBlink) {
            // FIND DIRECTION TO SHOOT RAY (ray will decide length of teleport based on collision with walls etc)
            // directional keys will change blink's direction (rotate it about camera's local y axis)
            var inputDir = new BABYLON.Vector2(0,0);
            if (keys[W_KEY])
                inputDir.addInPlace(new BABYLON.Vector2(0,1));
            if (keys[S_KEY])
                inputDir.addInPlace(new BABYLON.Vector2(0,-1));
            if (keys[A_KEY])
                inputDir.addInPlace(new BABYLON.Vector2(-1,0));
            if (keys[D_KEY])
                inputDir.addInPlace(new BABYLON.Vector2(1,0));
            // no directional key pressed? just go forward
            if (inputDir.length() == 0)
                inputDir = new BABYLON.Vector2(0,1);
            inputDir.normalize();
            // angle = arc cos (u dot v // ||u||*||v||). both normalized already so don't need to divide by length
            var theta = Math.acos(BABYLON.Vector2.Dot(inputDir,new BABYLON.Vector2(0,1)));
            if (inputDir.x < 0)
                theta *= -1;
            // now that directional angle has been found, we want to rotate cameras forward direction around camera's local y-axis by this angle
            var localYAxis = camera.getDirection(BABYLON.Axis.Y);
            var cameraDirection = camera.getTarget().subtract(camera.position).normalize();
            cameraDirection.y = 0; // ignore up/down (can only blink on x/z plane)
            var ray = new BABYLON.Ray(camera.position, rotateVecAboutAxis(cameraDirection, theta, BABYLON.Axis.Y));
            var hit = scene.pickWithRay(ray, function(mesh) {
               // only allowing this ray to hit "terrain" (isTerrain is set to true on ground and wall meshes)
                return mesh.isTerrain;
            });
            if (hit.pickedMesh) {
                var hitPos = hit.pickedPoint;
                var distToHit = BABYLON.Vector3.Distance(hitPos, camera.position);
                var dir = hitPos.subtract(camera.position);
                dir.normalize();
                if(distToHit > player.width*1.5) {
                    // subtract players height from distance so he doesn't go into walls/floors
                    var teleportDist = Math.min(distToHit, 60) - player.width*1.5;
                    // make blink duration proportional to teleport distance
                    player.blinkFrame = Math.ceil(teleportDist/(60-player.width*1.5) * player.blinkDuration);
                    // move gun in opposite direction of movement for animation
                    var gunMove = new BABYLON.Vector3(inputDir.x, 0, inputDir.y).multiplyByFloats(-1.5,-1.5,-1.5);
                    player.gun.mesh.position.addInPlace(gunMove);
                    // multiply the normalized distance vector by the length of the teleport to get the final displacement vector
                    // spread the distance out over the number of frames in player's blink
                    dir = dir.multiplyByFloats(teleportDist/player.blinkFrame, teleportDist/player.blinkFrame, teleportDist/player.blinkFrame);
                    player.blinkMovement = dir;

                    player.deltaPos = new BABYLON.Vector3(0,0,0);
                    if (player.blinkRecharge <= 0)
                        player.blinkRecharge = player.blinkRechargeRate;
                    player.blinkCharges--;
                    ion.sound.play("blink");

                   

                }
            }
            player.initiatingBlink = false;

        }


        if (player.blinkCharges < player.maxBlinkCharges) {
            player.blinkRecharge -= deltaTime;
            if(player.blinkRecharge <= 0) {
                player.blinkCharges++;
                player.blinkRecharge = player.blinkRechargeRate;
            }
        }

        if (player.blinkFrame > 0) {
            player.mesh.position = player.mesh.position.add(player.blinkMovement);
            player.blinkFrame--;
            if(player.blinkFrame == 0)
                player.blinkTimer = 150;
        }


    }
};

// MOUSE CLICK LISTENER
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
window.addEventListener("mousedown", function(e) {
    if (!document.pointerLockElement)
        canvas.requestPointerLock();
    else if (havePointerLock) {
        if (e.button == 0 && player.gun)
            player.gun.shooting = true;
        else if (player.blinkTimer <= 0 && player.blinkFrame == 0 && player.blinkCharges > 0)
            player.initiatingBlink = true;
    }
});
window.addEventListener("mouseup", function(e) {
    if (e.button == 0 && player.gun)
        player.gun.shooting = false;
    /*else {
        player.startLookingDownSight = false;
        player.stopLookingDownSight = true;
    }*/
});


// function that gets mouse position inside canvas
function getMousePosition(canvas, event) {
    var x = 0; y = 0;
    if (event.x != undefined && event.y != undefined) {
        x = event.x;
        y = event.y;
    }
    else { // firefox compatibility
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    return { x:x, y:y };
}

var entryCoordinates = {x:-1, y:-1};
var mouseMove = function (e) {
    if (entryCoordinates.x == -1)
        entryCoordinates = getMousePosition(canvas, e);

    if (controlsEnabled) {
        var xSensitivity = 0.001, ySensitivity = 0.0015;
        camera.rotation.x += ySensitivity * (e.movementY || e.mozMovementY || e.webkitMovementY || 0);
        camera.rotation.y += xSensitivity * (e.movementX || e.mozMovementX || e.webkitMovementX || 0);
    }
    lastMove = Date.now();
};

// point lock on -> enable mouse listener | point lock off -> disable mouse listener
var havePointerLock = false;
var toggleMouseMove = function() {
    havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if (havePointerLock)
        scene.activeCamera.attachControl(canvas, false);
    else
        scene.activeCamera.detachControl(canvas, false);
};
document.addEventListener('pointerlockchange', toggleMouseMove, false);
document.addEventListener('mozpointerlockchange', toggleMouseMove, false);
document.addEventListener('webkitpointerlockchange', toggleMouseMove, false);
