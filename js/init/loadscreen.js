/* ---- MATERIALS ---- */
var wireframeMaterial = new BABYLON.StandardMaterial("wireframeMaterial", scene);
wireframeMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
wireframeMaterial.wireframe = true;

// contains order for meshes to be loaded in as well as setup functions for each mesh being loaded
var meshLoadOrder = [
    // GUN / ARM MESH
    {
        filename: "res/models/gun.babylon",
        scene: scene,
        onsuccess: function(meshes) {
            var gun = scene.getMeshByName("Gun");
            var arm = scene.getMeshByName("Arm");
            giveCellShaderMaterial(gun);
            gun.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
            gun.parent = camera;
            gun.position = new BABYLON.Vector3(2, -0.8, 5.5);
            gun.renderingGroupId = 1;

            gun.renderOutline = true;
            gun.outlineColor = new BABYLON.Color3(0,0,0);
            arm.parent = gun;
            arm.position = new BABYLON.Vector3(0, -1.5, -0.7);
            arm.renderingGroupId = 1;
            giveCellShaderMaterial(arm);

            arm.renderOutline = true;
            arm.outlineColor = new BABYLON.Color3(0,0,0);
            arm.outlineWidth = 0.05;
            //lense.parent = gun;
            player.gun = new Gun("assaultRifle", gun, 30, 100);

            gun.isPickable = arm.isPickable = false;
        },
        progressCallBack: loadCallback
    },
    // LEVEL MESH
    {
        filename: "res/models/space_arena.babylon",
        scene: scene,
        onsuccess: function(meshes) {
            // wall meshes
            for (var i=1; i<5; i++) {
                var wall = scene.getMeshByName("wall" + i);
                wall.isTerrain = true;
                wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    restitution: 0,
                    nativeOptions: {
                        collisionFilterMask: PLAYER_MASK + ENEMY_MASK + ENEMY_BULLET_MASK,
                        collisionFilterGroup: GROUND_MASK,
                        fixedRotation: true
                    }
                }, scene);
                wall.physicsImpostor.registerOnPhysicsCollide(player.mesh.physicsImpostor, function(main, collided) {
                    player.jumpCount = 2;
                    player.isFalling = false;
                });
                giveCellShaderMaterial(wall);
                wall.renderOutline = true;
                wall.outlineColor = BABYLON.Color3.Black();
                wall.outlineWidth = 0.2;
            }
            /* cube meshes
            for (var i=1; i<7; i++) {
                var cube = scene.getMeshByName("cube"+i);
                cube.isTerrain = true;
                cube.physicsImpostor = new BABYLON.PhysicsImpostor(cube, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    restitution: 0,
                    nativeOptions: {
                        collisionFilterMask: PLAYER_MASK + ENEMY_MASK + ENEMY_BULLET_MASK,
                        collisionFilterGroup: GROUND_MASK,
                        fixedRotation: true
                    }
                }, scene);
                cube.physicsImpostor.registerOnPhysicsCollide(player.mesh.physicsImpostor, function(main, collided) {
                    player.jumpCount = 2;
                    player.isFalling = false;
                });
                giveCellShaderMaterial(cube);
                cube.renderOutline = true;
                cube.outlineColor = BABYLON.Color3.Black();
                cube.outlineWidth = 0.05;
                new Box(cube, i);
            }*/
            // floor and ceiling have same properties, so repeat steps for both
            floor = scene.getMeshByName("floor");
            var walls = ["floor", "ceiling"];
            for (var i=0; i<2; i++) {
                var obj = scene.getMeshByName(walls[i]);
                obj.physicsImpostor = new BABYLON.PhysicsImpostor(obj, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    restitution: 0,
                    nativeOptions: {
                        collisionFilterMask: PLAYER_MASK + ENEMY_BULLET_MASK,
                        collisionFilterGroup: GROUND_MASK
                    }
                }, scene);
                giveCellShaderMaterial(obj);
                obj.isTerrain = true;
                player.mesh.physicsImpostor.registerOnPhysicsCollide(obj.physicsImpostor, function(main, collided) {
                    player.jumpCount = 2;
                    player.isFalling = false;
                });
            }


            /*for (var i=1; i<9; i++) {
                cube = scene.getMeshByName("cube"+i);
                cube.renderOutline = true;
                cube.outlineColor = new BABYLON.Color3(0,0,0);
                cube.outlineWidth = 0.1;
                cube.physicsImpostor = new BABYLON.PhysicsImpostor(cubes, BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 0,
                    restitution: 1,
                    nativeOptions: {
                    collisionFilterMask: PLAYER_MASK + ENEMY_MASK,
                    collisionFilterGroup: GROUND_MASK,
                    fixedRotation: true
                }
            }, scene);
            cube.physicsImpostor.registerOnPhysicsCollide(player.mesh.physicsImpostor, function(main, collided) {
                 player.jumpCount = 2;
                 player.isFalling = false;
            });
            giveCellShaderMaterial(cube);
           }
            */
        },
        progressCallBack: loadCallback
    },
    // MOLE-BOT MESH
    {
        filename: "res/models/mole_bot.babylon",
        scene: scene, //disabledScene,
        onsuccess: function(meshes) {
            var circle = meshes[0];         // the circle that appears when a moleBot appears/disappears from ground
            var moleMesh = meshes[1];
            giveCellShaderMaterial(moleMesh);
            giveCellShaderMaterial(circle);

            // moleMesh.physicsImpostor = ... (is cloned by default)
            for (var i=0; i<3; i++) {
                new MoleBot(moleMesh.clone(), circle.clone());
            }

            circle.dispose();
            moleMesh.dispose();
        }
    },
    // SPIDERBOT MESH
    {
        filename: "res/models/spiderbot.babylon",
        scene: scene,
        //numTimesToLoad: 5,
        onsuccess: function(meshes) {
            var spiderBotMesh = meshes[0];
            spiderBotMesh.position.z -= 0.5;
            spiderBotMesh.isPickable = false;    // only want to pick bounding box
            spiderBotMesh.rotation.y += Math.PI/2;
            spiderBotMesh.computeBonesUsingShaders = false;
            spiderBotMesh.renderOutline = true;
            spiderBotMesh.outlineWidth = 0.05;
            spiderBotMesh.outlineColor = BABYLON.Color3.Black();

            scene.beginAnimation(spiderBotMesh.skeleton, 0, 10, true);

            for (var i=0; i<10; i++) {
                var clone = spiderBotMesh.clone("spiderbot clone");
                clone.skeleton = spiderBotMesh.skeleton.clone("spiderbot armature clone");
                //clone.material = spiderBotMesh.material;
                scene.beginAnimation(clone.skeleton, 0, 10, true);
                //giveCellShaderMaterial(clone);
                new SpiderBot(clone);
            }
            spiderBotMesh.dispose();
        }
    },
    // SIMON MESH
    {
        filename: "res/models/simon.babylon",
        scene: scene,
        onsuccess: function(meshes) {
            var simonMesh = scene.getMeshByName("Simon");
            simonMesh.position = new BABYLON.Vector3(0, -45, 0);
            simonMesh.scaling = new BABYLON.Vector3(5, 5, 5);
            giveCellShaderMaterial(simonMesh);
            var buttons = [scene.getMeshByName("Red"), scene.getMeshByName("Green"), scene.getMeshByName("Blue"), scene.getMeshByName("Yellow")];
            var litButtonMaterials = [];
            var unlitButtonMaterials = [];
            var colors = [new BABYLON.Color3(1,0,0), new BABYLON.Color3(0,1,0),new BABYLON.Color3(0,0,1),new BABYLON.Color3(1,1,0)]
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].parent = simonMesh;
                buttons[i].material.emissiveColor = colors[i];
                buttons[i].material.diffuseColor = new BABYLON.Color3(0,0,0);
                litButtonMaterials[i] = buttons[i].material;
                //giveCellShaderMaterial(buttons[i]);
                unlitButtonMaterials[i] = buttons[i].material;
            }
            for (var i=0; i<meshes.length; i++) {
                meshes[i].renderOutline = true;
                meshes[i].outlineColor = new BABYLON.Color3(0, 0, 0);
                meshes[i].outlineWidth = 0.05;
            }
            simon = new Simon(simonMesh, buttons);
        },
        progressCallBack: loadCallback
    }
    // TERRAIN & NAV MESH
    /*{
     meshNames: "",
     rootUrl: "",
     filename: "models/flat level.babylon",
     scene: scene,
     onsuccess: function(meshes) {
     scene.getMeshByName("Ground").dispose();

     // setting up navigation
     navmesh = scene.getMeshByName("Navmesh");
     navmesh.material = wireframeMaterial;
     navmesh.isPickable = false;
     zoneNodes = navigation.buildNodes(navmesh);
     navigation.setZoneData('level', zoneNodes);
     },
     progressCallBack: loadCallback
     },
     // SPIDER BOT MESH
     {
     meshNames: "",
     rootUrl: "",
     filename: "models/akbot_fast.babylon",
     scene: scene,
     onsuccess: function(spiderbot, particles, skeletons) {
     //giveCellShaderMaterial(spiderbot[0]);
     var boundBox = BABYLON.Mesh.CreateBox("spiderBox", 3, scene);
     boundBox.isVisible = false;
     spiderbot[0].position.z -= 0.5;
     spiderbot[0].parent = boundBox;
     spiderbot[0].isPickable = false;    // only want to pick bounding box

     boundBox.physicsImpostor = new BABYLON.PhysicsImpostor(boundBox, BABYLON.PhysicsImpostor.BoxImpostor, {
     mass: 0,
     restitution: 0,
     nativeOptions: {
     collisionFilterMask: GROUND_MASK + PLAYER_MASK,
     collisionFilterGroup: ENEMY_MASK,
     fixedRotation: true
     }
     }, scene);

     /*for (var i=0; i<5; i++) {
     var bb = boundBox.clone();
     bb.position = new BABYLON.Vector3(Math.random() * 50, 0, Math.random() * 50);
     var spider = spiderbot[0].clone();
     spider.skeletons = [];
     spider.skeletons[0] = skeletons[0].clone("skeleton clone");
     scene.beginAnimation(spider, 0, 10, 1, true);
     //spider.skeletons[0] = skeletons[0].clone();
     //scene.beginAnimation(spider.skeletons[0], 0, 10, 1, true);

     spider.parent = bb;
     enemyList.push(new Enemy("alahuAkbot"+i, spider, bb, 1));
     }

     alahuAkbot = new Enemy("alahuAkbot", spiderbot[0], boundBox, 1);
     enemyList.push(alahuAkbot);

     },
     progressCallBack: loadCallback
     },*/
    // SPACE SHIP MESH
    /*{
        meshNames: "",
        rootUrl: "",
        filename: "models/ship.babylon",
        scene: scene,
        onsuccess: function(ship) {
            giveCellShaderMaterial(ship[0]);
            ship[0].scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
            ship[0].receiveShadows = true;

            var boundBox = BABYLON.Mesh.CreateBox("ship bounding box", 20, scene);
            boundBox.material = wireframeMaterial;
            var groundBox = BABYLON.Mesh.CreateBox("ship ground box", 10, scene);
            groundBox.material = wireframeMaterial;
            
            var height = 30;
            groundBox.position = new BABYLON.Vector3(0, 3, 0);

            boundBox.position = new BABYLON.Vector3(0, height+10, 0);
            ship[0].position = new BABYLON.Vector3(0, -10, 0);

            ship[0].parent = boundBox;
            boundBox.parent = groundBox;

            var waypointMat = new BABYLON.StandardMaterial("waypointMaterial", scene);
            waypointMat.emissiveColor = new BABYLON.Color3(1, 1, 0);

            var wayPoint1 = BABYLON.Mesh.CreateSphere("waypoint1", 8, 4, scene);
            wayPoint1.material = waypointMat;
            wayPoint1.position = new BABYLON.Vector3(-120, 1, -120);
            var way1 = new Waypoint(wayPoint1, null, null);

            var wayPoint2 = BABYLON.Mesh.CreateSphere("waypoint2", 8, 4, scene);
            wayPoint2.material = waypointMat;
            wayPoint2.position = new BABYLON.Vector3(-120, 1, 120);
            var way2 = new Waypoint(wayPoint2, way1, null);

            var wayPoint3 = BABYLON.Mesh.CreateSphere("waypoint3", 8, 4, scene);
            wayPoint3.material = waypointMat;
            wayPoint3.position = new BABYLON.Vector3(120, 1, 120);
            var way3 = new Waypoint(wayPoint3, way2, null);

            var wayPoint4 = BABYLON.Mesh.CreateSphere("waypoint4", 8, 4, scene);
            wayPoint4.material = waypointMat;
            wayPoint4.position = new BABYLON.Vector3(120, 1, -120);
            var way4 = new Waypoint(wayPoint4, way3, way1);
            var waypoints = [way1, way2, way3, way4];
            ship[0].rotation = new BABYLON.Vector3(90,0,0);
            groundBox.position = new BABYLON.Vector3(100, 0, 0);
            boss = new Ship(ship[0], boundBox, groundBox, 1000, waypoints, height);

            //boss.flyTo(wayPoint1.position);
        },
        progressCallBack: loadCallback
    }*/
];


// loadCallback: shows load progress % for each mesh, when 100% loads next mesh in meshLoadOrder
// if meshLoadOrder length = 0, done loading meshes, so add the rest of the scripts to the page
var initialLoadLength = meshLoadOrder.length;
function loadCallback(evt) {
    if (evt.lengthComputable) {
        var progress = (evt.loaded * 100 / evt.total).toFixed();
        //console.log("Loading, please wait..." + progress + "%");
        if (progress >= 100) {
            hudCtx.fillStyle = "white";
            hudCtx.font = "100px lazer84";
            hudCtx.textAlign = "center";
            hudCtx.fillText('loading...', canvas.width/2, canvas.height/2);
            if (meshLoadOrder.length > 0) {
                if (meshLoadOrder[0].numTimesToLoad && meshLoadOrder[0].numTimesToLoad > 0) {
                    meshLoadOrder[0].numTimesToLoad--;
                    BABYLON.SceneLoader.ImportMesh("", "", meshLoadOrder[0].filename, meshLoadOrder[0].scene, meshLoadOrder[0].onsuccess, loadCallback);
                }
                else {
                    var m = meshLoadOrder.shift();
                    BABYLON.SceneLoader.ImportMesh("", "", m.filename, m.scene, m.onsuccess, loadCallback);
                }
            } else {
                hudCtx.clearRect(0,0,canvas.width, canvas.height);
                // check whether document is already loaded or else the event listener may never fire
                if (document.readyState == 'complete')
                    startGameLoop();
                else
                    window.addEventListener('DomContentLoaded', startGameLoop());
            }
        }
    } else {
        console.log("showloadProgress - event length is not computable");
        dlCount = evt.loaded / (1024 * 1024);
        //console.log("Loading, please wait..." + Math.floor(dlCount * 100.0) / 100.0 + " MB already loaded.");
    }
}
