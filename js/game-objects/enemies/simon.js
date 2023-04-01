var simonBulletList = [];
var bombList = [];

function Simon(mesh, buttons) {
    this.mesh = mesh;

    this.hp = 100;
    this.maxHP = 100;

    this.shootTimer = 0;
    this.explosiveShootTimer = 0;
    this.explosiveShootDelay = 500;

    this.buttons = buttons;
    this.colors = ["red", "green", "blue", "yellow"];
    this.rgb = [new BABYLON.Color3(1,0,0), new BABYLON.Color3(0,1,0), new BABYLON.Color3(0,0,1), new BABYLON.Color3(1,1,0)];

    this.enraged = false;
    this.enrageTimer = 10000;
    this.angerLength = 10000;
    this.angerFloorTimer = 500;
    this.angerFloorDelay = 500;

    this.dying = false;
    this.dead = false;
    this.deathTimer = 3000;
    this.deathLength = 3000;

    this.rotateDir = 1;

    this.aboveGround = false;

    // for shooting bullets in 4 diff directions
    this.angleOffsets = [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,Math.PI/2, 0), new BABYLON.Vector3(0,-Math.PI/2, 0), new BABYLON.Vector3(0, Math.PI, 0)];
    this.attackPatterns = [
        {
            name: "dodgable spurts",
            fireRate: 0.02,
            fireRateAccel: 0,
            bulletAccel: 0.01,
            individualBulletAccel: 0,
            bulletSpeedMin: 0.5,
            bulletSpeedMax: 1.5,
            rotateAccel: 0,
            rotateSpeedMin: Math.PI/60,
            rotateSpeedMax: Math.PI/60
        },
        {
            name: "angrymode pi/2 -> 3pi/4",
            fireRate: 0.02,
            fireRateAccel: 0,
            bulletAccel: 0,
            individualBulletAccel: 0,
            bulletSpeedMin: 1,
            bulletSpeedMax: 1,
            rotateAccel: 0.001,
            rotateSpeedMin: Math.PI/2,
            rotateSpeedMax: 3*Math.PI/4
        }
    ];
    this.switchToAttackPattern = function(pattern) {
        this.fireRate = pattern.fireRate;
        this.fireRateAccel = pattern.fireRateAccel;

        this.bulletAccel = pattern.bulletAccel;
        this.individualBulletAccel = pattern.individualBulletAccel;
        this.bulletSpeedMin = pattern.bulletSpeedMin;
        this.bulletSpeedMax = pattern.bulletSpeedMax;
        this.bulletSpeed = this.bulletSpeedMin;

        this.rotateAccel = pattern.rotateAccel;
        this.rotateSpeedMin = pattern.rotateSpeedMin;
        this.rotateSpeedMax =  pattern.rotateSpeedMax;
        this.rotateSpeed = this.rotateSpeedMin;
    };
    this.switchToAttackPattern(this.attackPatterns[0]);

    // give each button a push function (called when shot at)
    for (var i=0; i<buttons.length; i++) {
        var that = this;
        buttons[i].simonButton = function() {
            that.pushButton(this);
        }
    }
    this.pushButton = function(button) {
        for(var i=0; i<this.buttons.length; i++) {
            if (this.buttons[i] == button) {
                // testing: hit red button while simon is turned off -> turn him on
                if(!this.preparingToActivate && this.colors[i] == "red") {
                    this.preparingToActivate = true;
                    ion.sound.play("simon_intro_3");
                    floor.color = this.colors[0];
                    changeShaderMatColor(floor, this.rgb[0]);
                }
                // if color matches floor color and not enraged: damage simon, flip rotate direction, enrage if hp == 75% || 50% || 25%
                else if (floor.color == this.colors[i] && !this.enraged) {
                    var currentColorIndex = this.colors.indexOf(floor.color);
                    var newColorIndex = currentColorIndex;
                    // ensure new random color is not equal to current color
                    while(newColorIndex == currentColorIndex) {
                        newColorIndex = Math.ceil(Math.random()*3);
                    }
                    changeShaderMatColor(floor, this.rgb[newColorIndex]);
                    floor.color = this.colors[newColorIndex];
                    // flip rotation direction on button press
                    this.rotateDir *= -1;
                    this.hp -= 5;
                    if(this.hp == 75 || this.hp == 50 || this.hp == 25) {
                        this.enraged = true;
                        this.switchToAttackPattern(this.attackPatterns[1]);
                        ion.sound.play("ultra_rapid_fire_mode");
                    }
                }
                // wrong color hit: shoot bombs in each direction
                else {
                    ion.sound.play("simon_wrong");
                    new EnemyBomb(this.mesh.position, this.mesh.rotation.clone());
                    new EnemyBomb(this.mesh.position, this.mesh.rotation.add(new BABYLON.Vector3(0, Math.PI/2, 0)));
                    new EnemyBomb(this.mesh.position, this.mesh.rotation.add(new BABYLON.Vector3(0, Math.PI, 0)));
                    new EnemyBomb(this.mesh.position, this.mesh.rotation.add(new BABYLON.Vector3(0, -Math.PI/2, 0)));
                }
            }
        }
    };

    this.moveUp = function() {
        if (!this.movingUp)
            ion.sound.play("simon_move_up");

        this.movingUp = this.mesh.position.y < 0;
        if (this.movingUp)
            this.mesh.position.y += (45/6200 * deltaTime);      // need to move up 45 units over 5.6 seconds (length of moveup sound)
        else {
            this.mesh.position.y = 0;
        }
    };
    this.update = function() {
        // nice dodgable spurts:
        // bulletAccel = 0.01
        // rotateAccel = 0.001
        if (this.movingUp)
            this.moveUp();

        // rotation flips at pi/2 and 3pi/4
        // Accel = Math.PI / 32
        // Math.PI/13  -> waves with gaps
        // Math.PI/14  -> ^^^
        // Maht.PI/20  -> super clean waves/gaps with slight stutters
        //this.rotateAccel = (this.rotateAccel + this.rotateDrag) % (2*Math.PI);


        // if dying but not completely dead yet, do death animation (make buttons lose saturation/brightness)
        if (this.dying && !this.dead) {
            this.enraged = false;
            this.activated = false;
            this.deathTimer -= deltaTime;
            if (this.deathTimer <= 0) {
                this.dying = false;
                this.dead = true;
                ion.sound.stop("orbital_colossus");
            } else {
                for (var i = 0; i < this.buttons.length; i++) {
                    // brightness and saturation are both proportional to deathTimer (as timer goes down, brightness/saturation go down)
                    var brightness = Math.max(0.25 * 255, (this.deathTimer / this.deathLength) * 255);
                    var saturation = Math.max(0, this.deathTimer / this.deathLength);
                    var hsv = RGBtoHSV(this.rgb[i]);
                    hsv[1] = saturation;
                    hsv[2] = brightness;
                    var newColor = HSVtoRGB(hsv);
                    this.buttons[i].material.emissiveColor = newColor;
                }
            }
        }
        // if health just reached 0, play death sound then start dying
        else if (this.hp <= 0 && !this.dead) {
            ion.sound.play("robot_die");
            this.dying = true;
        }


        // if turned on
        if (this.activated) {
            this.shootTimer -= deltaTime;
            this.explosiveShootTimer -= deltaTime;

            this.rotateSpeed += this.rotateAccel;
            if (this.rotateSpeed > this.rotateSpeedMax)
                this.rotateSpeed = this.rotateSpeedMin;
            this.mesh.rotation.y += (this.rotateSpeed * this.rotateDir);

            this.bulletSpeed += this.bulletAccel;
            if (this.bulletSpeed > this.bulletSpeedMax)
                this.bulletSpeed = this.bulletSpeedMin;

            this.fireRate += this.fireRateAccel;
            if (this.fireRate > this.fireRateMax)
                this.fireRate = this.fireRateMin;


            // if enraged, make floor flash, and shoot bombs in random directions using a timer
            // stay enraged until enrage timer reaches 0
            if (this.enraged) {
                this.angerFloorTimer -= deltaTime;
                // making floor flash different colors while enraged
                if (this.angerFloorTimer <= 0) {
                    this.angerFloorTimer = this.angerFloorDelay;
                    // make sure new color isnt same as old color
                    var currentColorIndex = this.colors.indexOf(floor.color);
                    var newColorIndex = currentColorIndex;
                    while (newColorIndex == currentColorIndex) {
                        newColorIndex = Math.floor(Math.random() * 4);
                    }
                    changeShaderMatColor(floor, this.rgb[newColorIndex]);
                    floor.color = this.colors[newColorIndex];
                }
                // shooting a bomb in random direction when timer reaches 0
                if (this.explosiveShootTimer <= 0) {
                    this.explosiveShootTimer = this.explosiveShootDelay;
                    new EnemyBomb(this.mesh.position, this.mesh.rotation.add(this.angleOffsets[Math.floor(Math.random() * 4)]));
                }
                // decrement enrage timer. When 0, stop being enraged (switch to non-enraged attack pattern)
                this.enrageTimer -= deltaTime;
                if (this.enrageTimer <= 0) {
                    this.enrageTimer = this.angerLength;
                    this.enraged = false;
                    this.switchToAttackPattern(this.attackPatterns[0]);
                }
            }
            // if time to shoot -> shoot 4 bullets in all directions
            if (this.shootTimer <= 0) {
                // reset shoot timer
                this.shootTimer = 1 / this.fireRate;
                // positioning bullets appropriately
                var bullet1 = new EnemyBullet(this.bulletSpeed, this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.rotation.clone());
                var bullet2 = new EnemyBullet(this.bulletSpeed, this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.rotation.add(new BABYLON.Vector3(0, Math.PI / 2, 0)));
                var bullet3 = new EnemyBullet(this.bulletSpeed, this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.rotation.add(new BABYLON.Vector3(0, Math.PI, 0)));
                var bullet4 = new EnemyBullet(this.bulletSpeed, this.mesh.position.add(new BABYLON.Vector3(0, 3, 0)), this.mesh.rotation.add(new BABYLON.Vector3(0, 3 * Math.PI / 2, 0)));
                // move bullets along their local Z so they're not inside pillar
                bullet1.mesh.translate(BABYLON.Axis.Z, -7, BABYLON.Space.LOCAL);
                bullet2.mesh.translate(BABYLON.Axis.Z, -7, BABYLON.Space.LOCAL);
                bullet3.mesh.translate(BABYLON.Axis.Z, -7, BABYLON.Space.LOCAL);
                bullet4.mesh.translate(BABYLON.Axis.Z, -7, BABYLON.Space.LOCAL);
            }
        }
    }
}





/* Boxes are unfinished, they were similiar to molebots in that they pop in/out of ground
var boxes = [];
function Box(mesh, id) {
    this.mesh = mesh;
    this.id = id;
    
    this.down = true;
    this.height = mesh.getBoundingInfo().boundingBox.extendSize.y;

    // state attributes
    this.stateLengths = [Math.random()*2000 + 1000, 2000, Math.random()*4000 + 3000, 2000];       // amount of time to be in each state, index = state constants (DOWN, GOING_UP, UP, GOING_DOWN)
    // since there will be multiple moleBots, don't want them all in sync, randomize their initial stateTimer
    this.stateTimer = 0;
    this.speed = 100 / 1000;
    this.state = DOWN;

    this.enabled = false;

    // enable: enable the box and make it start moving up
    this.enable = function() {
        this.enabled = true;
        this.mesh.position.y = 0;
        this.state = GOING_UP;
        this.stateTimer = this.stateLengths[this.state];
    };
    
    // disable: disable the box 
    this.disable = function() {
        // if already down, stay down
        if (this.state == DOWN)
            this.enabled = false;
        // else, start moving down and then get disabled once it is down
        else {
            this.state = GOING_DOWN;
            this.stateTimer = this.stateLengths[this.state];
        }
    };
    this.update = function() {
        if (this.enabled) {
            this.stateTimer -= deltaTime;
            // when stateTimer reaches 0, go to next state
            if (this.stateTimer <= 0) {
                // (DOWN -> GOING_UP -> UP -> GOING_DOWN) = (0 -> 1 -> 2 -> 3)
                this.state = (this.state + 1) % 4;
                this.stateTimer = this.stateLengths[this.state];

                // when box returns to down state, ensure its position is reset, disable it, and pick a new box to enable
                if (this.state == DOWN) {
                    this.mesh.position.y = 0;
                    this.enabled = false;
                    // if simon is still enraged, find a new disabled box to enable
                    if (simon.enraged) {
                        var nextBox;
                        while (true) {
                            nextBox = boxes[Math.ceil(Math.random()*(boxes.length-1))];
                            console.log("trying to activate " + nextBox.id);
                            if (!nextBox.enabled && nextBox.id != this.id) {
                                nextBox.enable();
                                break;
                            }
                        }
                    }
                }
            }

            if (this.state == GOING_UP) {
                this.mesh.position.y += this.speed;
            }
            if (this.state == GOING_DOWN) {
                this.mesh.position.y -= this.speed
            }
        }
    };
    
    boxes.push(this);
}*/