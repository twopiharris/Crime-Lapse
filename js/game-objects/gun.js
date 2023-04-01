function Gun(name, mesh, clipSize, shootDelay) {
    this.name = name;
    this.mesh = mesh;
    this.defaultPos = this.mesh.position.clone();
    this.clipSize = clipSize;
    this.ammoInClip = this.clipSize;
    this.ammo = this.clipSize * 10;
    this.sounds = ["laserfire01"];

    this.shootTimer = 0;
    this.shootDelay = shootDelay;
    this.shooting = false;

    this.damage = 10;           // amount of damage each bullet does
    this.lit = false;
    this.lightTimer = 500;

    this.heat = 0;              //  current "overheatedness" of gun
    this.overheatRate = 10;     //  heat each bullet gives
    this.cooldownRate = 1;      //  heat cooled down each frame (separate speed from when overheated)
    this.overheatedCooldownRate = 0.75;
}

Gun.prototype.recoilRecover = function() {
    var diff = this.mesh.position.subtract(this.defaultPos);
    diff = diff.divide(new BABYLON.Vector3(5,5,5));
    this.mesh.position.subtractInPlace(diff);
};

var lineMat = new BABYLON.StandardMaterial("mat1", scene);
lineMat.alpha = 1.0;
lineMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 8.0);
lineMat.backFaceCulling = false;

var laserList = [];

Gun.prototype.cooldown = function() {
    // simulate a slower cooldown rate by adding some of it back
    this.cooldownRate = this.overheatedCooldownRate;
    if (this.heat <= 0) {
        this.heat = 0;
        this.isOverheated = false;
    }
};


// function that deals with gun shooting each frame
// takes care of timing, creating bullets/raycasting, and managing gun's "overheatedness" as well as the associated outline color
Gun.prototype.shootHandler = function() {
    this.shootTimer += deltaTime;
    this.mesh.outlineColor = new BABYLON.Color3(this.heat/100, 0, 0);

    this.heat = Math.max(0,this.heat - this.cooldownRate);

    if(this.isOverheated)
        this.cooldown();
    else if (this.shooting && this.shootTimer > this.shootDelay) {
        this.shootTimer = 0;
        // shoot ray from center of screen
        var hit = scene.pick(canvas.width/2, canvas.height/2, null, false, camera);
        // initialize endPos in case ray didn't hit anything (laser needs to go somewhere)
        var endPos = new BABYLON.Vector3(0,0,100);
        // if ray hit somethiing
        if (hit.pickedMesh) {
            // ENEMY -> hurt it
            if (hit.pickedMesh.enemy)
                hit.pickedMesh.enemy.health -= this.damage;
            // SIMON BUTTON -> activate it
            if (hit.pickedMesh.simonButton)
                hit.pickedMesh.simonButton();
            // HURTABLE ENEMY -> hurt it
            if (hit.pickedMesh.hurt)
                hit.pickedMesh.hurt();
            
            endPos = hit.pickedPoint;
        }

        // offset startPos to shoot from gun's tip
        var startPos = new BABYLON.Vector3(2,-1.25,6);
        // transform endPos based on cameras view
        var m = new BABYLON.Matrix();
        camera.getWorldMatrix().invertToRef(m);
        endPos = BABYLON.Vector3.TransformCoordinates(endPos,m);

        var line = BABYLON.Mesh.CreateLines("line", [startPos, endPos], scene);
        //this.line.parent = this.mesh;
        line.enableEdgesRendering();
        line.edgesWidth = 20;
        line.edgesColor = new BABYLON.Color4(1, 0, 0.2, 1);
        line.material = lineMat;
        line.parent = camera;

        /*
        var distance = BABYLON.Vector3.Distance(startPos, endPos);
        var cylinder = BABYLON.Mesh.CreateCylinder("laser", distance, 0.15, 0.15, 8, scene, true);
        cylinder.setPivotMatrix(BABYLON.Matrix.Translation(0, -distance/2, 0));
        cylinder.position = endPos;
        var v1 = endPos.subtract(startPos);
        v1.normalize();
        var v2 = new BABYLON.Vector3(0,1,0);
        var axis = BABYLON.Vector3.Cross(v1,v2);
        axis.normalize();
        var angle = Math.acos(BABYLON.Vector3.Dot(v1,v2));

        cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, -angle);

        new Laser(cylinder, distance);
        */

        new Laser(line);

        //this.mesh.outlineColor = new BABYLON.Color4(1, 0, 0.2, 1);
        this.lit = true;
        this.lightTimer = 100;


        this.mesh.position.z -= 0.5;
        /*this.ammo = this.ammo > 0 ? this.ammo-1 : 0;
        this.ammoInClip--;
        this.mesh.position.z -= 1;
        if (this.ammoInClip < 1) {
            this.reload();
        }*/
        var soundToPlay = this.sounds[Math.floor(Math.random() * this.sounds.length)];
        ion.sound.play(soundToPlay);

        this.heat = Math.min(100, this.heat+this.overheatRate);
        /*if(this.heat == 100) {
            this.isOverheated = true;
            ion.sound.play("overheat");
        }*/
    }
};

Gun.prototype.reload = function() {
    this.ammoInClip = Math.min(this.clipSize, this.ammo);
};


function Laser(line) {
    this.line = line;
    this.dead = false;
    laserList.push(this);
}
