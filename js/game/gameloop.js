var numFrames = 0;
var fps = 0;

var rainbow = [1, 0, 0];
var decColor = 0; var incColor = 1;

var goingLeft = true;

var startGameLoop = function() {
    scene.executeWhenReady(function() {
        prevTime = Date.now();
        ion.sound.play("n_dimensions");
        ion.sound.play("intro");
        engine.runRenderLoop(function () {
            // updating delta time
            deltaTime = Date.now() - prevTime;
            prevTime = Date.now();

            // check for mouse/keyboard input
            keyListener();
            // move and dispose of bullets
            moveBullets();
            // make enemies do what they're supposed to
            //enemyupdate();
            //simon.update();
            // deal with player stuff (moving, teleporting, shooting, going back in time, etc)
            //player.
            player.blinkTimer -= deltaTime;

            player.currentFrameStep = (player.currentFrameStep + 1) % player.timeFrameStep;


            // make players gun move back to default location if it moved back from shooting
            if (player.gun) {
                player.gun.recoilRecover();
                // do everything related to the players gun
                player.gun.shootHandler();
            }
            /* keep gun outline lit up for set time after shooting
            if (player.gun.lit) {
                player.gun.lightTimer -= deltaTime;
                if (player.gun.lightTimer <= 0) {
                    player.gun.lit = false;
                    player.gun.mesh.outlineColor = new BABYLON.Color3(0, 0, 0);
                }
            }*/
            // keep gun lasers visible for one single frame (first frame gets set to dead, second frame removes it)
            for (var i=laserList.length-1; i>-1; i--) {
                if (laserList[i].dead) {
                    laserList[i].line.dispose();
                    laserList.splice(i,1);
                }
                else
                    laserList[i].dead = true;
            }


            /* original pos = (2, -0.8, 5.5)
            if (player.stopLookingDownSight) {
                player.gun.mesh.position.x += 1 / deltaTime * 3;
                player.gun.mesh.position.y -= 1 / deltaTime * 9/10;
                player.gun.mesh.position.z += 1 / deltaTime * 3.75;

                if (player.gun.mesh.position.x >= 2) {
                    player.gun.mesh.position = new BABYLON.Vector3(2, -0.8, 5.5);
                    player.stopLookingDownSight = false;
                }

                player.gun.defaultZ = player.gun.mesh.position.z;
            }
            else if (player.startLookingDownSight) {
                player.gun.mesh.position.x -= 1 / deltaTime * 3;
                player.gun.mesh.position.y += 1 / deltaTime * 9/10;
                player.gun.mesh.position.z -= 1 / deltaTime * 3.75;
                if(player.gun.mesh.position.x <= 0) {
                    player.startLookingDownSight = false;
                    player.gun.mesh.position = new BABYLON.Vector3(0, -0.25, 3.5);
                }

                player.gun.defaultZ = player.gun.mesh.position.z;
            }*/
            

            /* make enemies move, face the right direction, and kill them if they die
            for (var i=enemyList.length-1; i>-1; i--) {
                // health < 0 -> die
                if (enemyList[i].health <= 0) {
                    // create explosion when dead
                    new Explosion(enemyList[i].boundBox.position, 15);
                    enemyList[i].boundBox.dispose();
                    enemyList[i].mesh.dispose();
                    enemyList.splice(i,1);
                    ion.sound.play("explosion");
                }
                else {
                    var enemy = enemyList[i];
                    enemy.chaseTimer -= deltaTime;
                    if (enemy.chaseTimer <= 0) {
                        enemy.chaseTimer = enemyList[i].chasePrecision;
                        enemy.chase(player.mesh.position);
                    }
                    // make sure enemies are facing the direction they are walking
                    var anim = enemy.boundBox.animations[0];
                    if (anim) {
                        // look for the next keyframe (key frames represent each turn in the path) and look towards it's position
                        for (var j = 0; j < anim.getKeys().length; j++) {
                            if (anim.getKeys()[j].frame > anim.currentFrame) {
                                enemy.boundBox.lookAt(anim.getKeys()[j].value);
                                break;
                            }
                        }
                    }
                }
            }*/


            /*for (var i=0; i<boxes.length; i++)
                boxes[i].update();
            */
            for (var i = enemyList.length - 1; i > -1; i--) {
                enemyList[i].update();
                if (enemyList[i].dead)
                    enemyList.splice(i, 1);
            }
            

            player.backInTimeDelay -= deltaTime;
            if (player.goingBack)
                player.traverseTime();
            else if (player.currentFrameStep == 0) {
                player.prevPositions.push(player.mesh.position.clone());
                player.prevRotations.push(camera.rotation.clone());
            }
            if (player.prevPositions.length > player.timeMemory) {
                player.prevPositions.shift();
            }

            //player.mesh.rotation.y = camera.rotation.y;

            camera.position.x = player.mesh.position.x;
            camera.position.y = player.mesh.position.y + player.mesh.getBoundingInfo().boundingBox.extendSize.y;
            camera.position.z = player.mesh.position.z;

            /*if (player.mesh.intersectsMesh(ground, false)) {
                player.jumpCount = 2;
                player.isFalling = false;
            }*/


            /*
            incColor = decColor == 2 ? 0 : decColor + 1;
            rainbow[decColor] -= 5/255;
            rainbow[incColor] += 5/255;

            if (rainbow[decColor] <= 0) {
                rainbow[decColor] = 0;
                rainbow[incColor] = 1;
                decColor = (decColor + 1) % 3;
            }
             player.gun.mesh.outlineColor = new BABYLON.Color3(rainbow[0], rainbow[1], rainbow[2]);*/

            scene.render();

            drawUI();
        });
    });
};

