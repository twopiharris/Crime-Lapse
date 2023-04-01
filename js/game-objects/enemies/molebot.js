// mole bot state constants
var DOWN = 0;
var GOING_UP = 1;
var UP = 2;
var GOING_DOWN = 3;

// mole bot laser material
var laserMaterial = new BABYLON.StandardMaterial("laserMat", scene);
laserMaterial.diffuseColor = new BABYLON.Color3(1,0,0);
laserMaterial.emissiveColor = new BABYLON.Color3(1,0,0);
laserMaterial.specularColor = new BABYLON.Color3(0,0,0);

var molebots = [];

function MoleBot(mesh, circle) {
    this.mesh = mesh;
    this.circle = circle;
    this.circle.isVisible = false;

    this.mesh.position.x = this.circle.position.x = (Math.random() * 180) - 90;     // give random initial position
    this.mesh.position.z = this.circle.position.z = (Math.random() * 180) - 90;
    this.mesh.position.y -= 20;                                                     // since molebot starts in down state, move it down

    // when mesh is hit by laser, subtract 10 from health (function given to mesh because that because the hurt function is called by raycast)
    var that = this;
    this.mesh.hurt = function() {
        that.health -= 10;
        if (that.health > 0)
            that.healthBar.width = that.health/100 * 10;
        else if (!that.dying) {
            //ion.sound.play("molebot_death_" + (Math.round(Math.random()) + 1));
            ion.sound.play("molebot_death_1");
	    that.healthBar.dispose();
            that.healthBarBg.dispose();
            that.dying = true;
            that.state = UP;            // make it start going down
            that.stateTimer = 0;

            numEnemiesLeft--;

            if (numEnemiesLeft <= 4 && numEnemiesLeft > 0) {
                ion.sound.play(numEnemiesLeft + "_left");
            } else if (numEnemiesLeft == 0) {
                ion.sound.play("spiderbot_intro");
            }
        }
    };

    this.health = 100;
    this.healthBarBg = new BABYLON.Sprite("healthbarBackground", healthBarSpriteManager);
    this.healthBar = new BABYLON.Sprite("healthbar", healthBarSpriteManager);
    this.healthBar.cellIndex = 0;
    this.healthBarBg.cellIndex = 1;
    this.healthBar.width = this.healthBarBg.width = 10;
    this.healthBar.height = this.healthBarBg.height = 1;
    this.healthBar.position = this.healthBarBg.position = new BABYLON.Vector3(0, -100, 0);


    this.rotateSpeed = Math.PI / 1000;
    this.state = DOWN;

    // creating a position laser beam (initially hidden)
    this.laser = BABYLON.Mesh.CreateCylinder("laser", 135, 1.5, 1.5, 8, scene, true);
    this.laser.material = laserMaterial;
    this.laser.rotation = new BABYLON.Vector3(Math.PI/2, 0, 0);
    this.laser.parent = this.mesh;
    this.laser.position.z -= 67.5;
    this.laser.position.y += 3.3;
    this.laser.isVisible = false;


    /*this.laser.physicsImpostor = new BABYLON.PhysicsImpostor(this.laser, BABYLON.PhysicsImpostor.CylinderImpostor, {
        mass: 0,
        restitution: 0,
        nativeOptions: {
            collisionFilterMask: PLAYER_MASK,
            collisionFilterGroup: ENEMY_BULLET_MASK
        }
    }, scene);
    this.laser.physicsImpostor.registerOnPhysicsCollide(player.mesh.physicsImpostor, function(main, collided) {
        console.log("hurting player");
        player.hurt(5);
    });*/

    // laser shooting attributes
    this.laserTimer = this.laserDuration = 50;		    // how long laser beam stays out
    //this.laserTimer = 0;
    this.laserCooldown = 200;			                // time between lasers
    this.laserCooldownTimer = 0;
    this.laserSoundTimer = this.laserSoundDelay = 3;    // only play laser sound every x shots

    // state attributes
    this.stateLengths = [Math.random()*2000 + 1000, 2000, Math.random()*4000 + 3000, 2000];       // amount of time to be in each state, index = state constants (DOWN, GOING_UP, UP, GOING_DOWN)
    // since there will be multiple moleBots, don't want them all in sync, randomize their initial stateTimer
    this.stateTimer = Math.random() * 1000;    // stateTimer = how much longer to stay in current state
    this.upSpeed = 10 / 1000;
    this.downSpeed = 10 / 1000;

    molebots.push(this);

    this.update = function() {
        this.stateTimer -= deltaTime;
        // when stateTimer reaches 0, go to next state
        if (this.stateTimer <= 0) {
            // BEFORE CHANGING STATE
            // if change from down state to going up state, move to random position, make black circle appear
            if (this.state == DOWN) {
                this.circle.isVisible = true;
                this.mesh.position.x = this.circle.position.x = (Math.random() * 180) - 90;
                this.mesh.position.z = this.circle.position.z = (Math.random() * 180) - 90;
            }
            if (this.dying && this.state == GOING_DOWN) {
                this.dead = true;
                this.circle.dispose();
                this.mesh.dispose();
                return;
            }
            // CHANGING STATE
            // state constants were set in appropriate order (DOWN -> GOING_UP -> UP -> GOING_DOWN) = (0 -> 1 -> 2 -> 3)
            this.state = (this.state+1) % 4;
            this.stateTimer = this.stateLengths[this.state];

            // AFTER CHANGING STATE
            // if just changed to up state, make healthbar appear
            if (this.state == UP)
                this.healthBar.position = this.healthBarBg.position = new BABYLON.Vector3(this.mesh.position.x, 7, this.mesh.position.z);
            // if just changed to down state, hide black circle and healthbar
            if (this.state == DOWN) {
                this.circle.isVisible = false;
                this.healthBar.position.y = this.healthBarBg.position.y = -100;
            }
        }
        if (this.state == UP) {
            this.mesh.rotation.y += this.rotateSpeed * deltaTime;
            this.laserTimer -= deltaTime;
            if (this.laserTimer <= 0) {
                this.laserTimer = this.laserDuration;
                this.laser.isVisible = !this.laser.isVisible;
                this.laserSoundTimer--;
                if(this.laserSoundTimer <= 0) {
                    this.laserSoundTimer = this.laserSoundDelay;
                    //ion.sound.play("laserfire02");
                }
            }
        }
        if (this.state == GOING_UP) {
            this.mesh.position.y += this.upSpeed * deltaTime;
        }
        if (this.state == GOING_DOWN) {
            this.laser.isVisible = false;
            this.mesh.position.y -= this.downSpeed * deltaTime;
        }
    };
}
