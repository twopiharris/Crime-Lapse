var spiderbots = [];

function SpiderBot(mesh) {
    this.mesh = mesh;
    scene.beginAnimation(this.mesh, 0, 10, true);
    this.moveSpeed = 0.035;
    // boundbox and collision
    this.boundBox = BABYLON.Mesh.CreateBox("boundBox", 5, scene);
    var x = Math.random() * 200 - 100;
    var z = Math.random() * 200 - 100;
    this.boundBox.position = new BABYLON.Vector3(x, 0, z);

    this.boundBox.position.y += 2;
    this.mesh.position.y -= 2;
    this.boundBox.position.z -= 1;
    this.mesh.position.z += 1;
    //this.boundBox.isVisible = false;
    this.boundBox.material = invisMaterial;   // using invisMaterial rather than setting isVisible to false so that the mesh can still be picked

    this.mesh.parent = this.boundBox;
    this.boundBox.physicsImpostor = new BABYLON.PhysicsImpostor(this.boundBox, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        restitution: 0,
        nativeOptions: {
            collisionFilterMask: GROUND_MASK + PLAYER_MASK,
            collisionFilterGroup: ENEMY_MASK,
            fixedRotation: true
        }
    }, scene);

    // in order to detonate, need to be within range of player for x frames in a row. this is so it doesnt detonate instantly when player teleports through it
    this.withinRangeCounter = 0;

    this.detonateTimer = 500;
    this.detonateRange = 5;
    // when mesh is hit by laser, subtract 10 from health
     var that = this;
     this.boundBox.hurt = function() {
         that.health = 0;
         if (that.health > 0)
            that.healthBar.width = that.health/100 * 10;
         else if (!that.detonating) {
             that.detonating = true;
             that.detonateTimer = -1;
         }
     };
    // update = function that is called each frame an
    this.update = function() {
        if (this.detonating) {
            this.detonateTimer -= deltaTime;
            // light up red as it gets closer to exploding
            this.mesh.outlineColor = new BABYLON.Color3(Math.min(1, 1 - (this.detonateTimer/1000)), 0, 0);
            if (this.detonateTimer <= 0) {
                new Explosion(this.boundBox.position, 20);
                this.dead = true;
                this.mesh.dispose();
                this.boundBox.dispose();
                numEnemiesLeft--;
                if (numEnemiesLeft == 0) {
                    ion.sound.play("simon_intro_1");
                }
            }
        }
        else {
            var dist = BABYLON.Vector3.Distance(player.mesh.position, this.boundBox.position);
            if (dist < 20) {
                this.withinRangeCounter++;
                if (this.withinRangeCounter >= 20) {
                    this.detonating = true;
                    ion.sound.play("alah_akbot");
                }
            } else {
                this.withinRangeCounter = 0;
            }

        }

        var dir = player.mesh.position.subtract(this.boundBox.position);
        dir.normalize();
        // movement = direction * moveSpeed
        var move = dir.multiply(new BABYLON.Vector3(this.moveSpeed * deltaTime, this.moveSpeed * deltaTime, this.moveSpeed * deltaTime));
        this.boundBox.position.x += move.x;
        this.boundBox.position.z += move.z;
        this.boundBox.lookAt(new BABYLON.Vector3(player.mesh.position.x, 0, player.mesh.position.z));

    };

    
    this.mesh.isVisible = false;
    spiderbots.push(this);
    //enemyList.push(this);
    //numEnemiesLeft++;
}