
var bulletMaterial = new BABYLON.StandardMaterial("bulletMaterial", scene);
bulletMaterial.emissiveColor = bulletMaterial.diffuseColor = new BABYLON.Color3(0.8, 0, 0.2);
bulletMaterial.specularColor = new BABYLON.Color3(0,0,0);

bulletList = [];

function Bullet(owner) {
    this.damage = 10;
    this.posOffset = new BABYLON.Vector3(4.5, 12, 2.4);
    this.mesh = scene.getMeshByName("Bullet").clone(); //BABYLON.Mesh.CreateCylinder("bullet", 12, 1, 1, 8, 1, scene);


    this.mesh.rotation = new BABYLON.Vector3(camera.rotation.x + Math.PI/2, camera.rotation.y, 0).add(owner.rotation);
    this.mesh.material = bulletMaterial;
    this.mesh.position = camera.position;
    this.mesh.translate(BABYLON.Axis.X, this.posOffset.x, BABYLON.Space.LOCAL);
    this.mesh.translate(BABYLON.Axis.Y, this.posOffset.y, BABYLON.Space.LOCAL);
    this.mesh.translate(BABYLON.Axis.Z, this.posOffset.z, BABYLON.Space.LOCAL);

    this.speed = 10;
    this.lifeSpan = 1000;

    bulletList.push(this);
}
Bullet.prototype.move = function() {
    this.mesh.translate(BABYLON.Axis.Y, this.speed, BABYLON.Space.LOCAL);
};

var bulletSprites = new BABYLON.SpriteManager("bulletManager", "res/textures/bullet_circle.png", 1000, 47, scene);
var bombSprites = new BABYLON.SpriteManager("explosiveBulletManager", "res/textures/bomb.png", 100, 256, scene);

// enemy bullets have an invisible mesh for collisions but are drawn with 2D sprites
function EnemyBullet(speed, pos, rot) {
    this.sprite = new BABYLON.Sprite("bullet", bulletSprites);
    this.sprite.size = 5;
    this.sprite.position = pos;
    this.speed = speed;

    // this mesh is only used for BABYLON.Mesh's built in functions like local axis movement which sprites dont have (simpler than doing the math myself)
    this.mesh = BABYLON.Mesh.CreateSphere("empty", 1, 5, scene);
    this.mesh.position = pos;
    //this.mesh.rotationQuaternion = new BABYLON.Quaternion(rot.x,rot.y,rot.z,rot.w);
    this.mesh.rotation = rot;

    this.mesh.isVisible = false;
    this.lifeTime = 3000;

    this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 0,
        restitution: 0,
        nativeOptions: {
            collisionFilterMask: PLAYER_MASK + GROUND_MASK,
            collisionFilterGroup: ENEMY_BULLET_MASK,
        }
    }, scene);

    var that = this;
    for (var i=0; i<walls.length; i++) {
        this.mesh.physicsImpostor.registerOnPhysicsCollide(walls[i].physicsImpostor, function (main, collided) {
            that.dead = true;
        });
    }

    this.mesh.physicsImpostor.registerOnPhysicsCollide(player.mesh.physicsImpostor, function(main, collided) {
        if(!that.dead) {
            player.hurt(1);
            that.dead = true;
        }
    });
    simonBulletList.push(this);
}
EnemyBullet.prototype.move = function() {
    this.mesh.translate(BABYLON.Axis.Z, -deltaTime/30 * this.speed, BABYLON.Space.LOCAL);
    this.sprite.position = this.mesh.position;
};

function EnemyBomb(pos, rot) {
    this.mesh = BABYLON.Mesh.CreateSphere("Empty", 8, 8, scene);
    this.mesh.rotation = rot.clone();
    var posOffset = new BABYLON.Vector3(Math.sin(rot.y)*7, 33, Math.cos(rot.y)*7);
    this.mesh.position = pos.add(posOffset);
    this.mesh.isVisible = false;

    this.sprite = new BABYLON.Sprite("explosive bullet", bombSprites);
    this.sprite.size = 6;
    this.sprite.position = this.mesh.position;

    this.damage = 20;
    this.dead = false;

    this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
        mass: 1,
        restitution: 0,
        nativeOptions: {
            collisionFilterMask: PLAYER_MASK + GROUND_MASK,
            collisionFilterGroup: ENEMY_BULLET_MASK,
        }

    }, scene);
    var that = this;
    this.mesh.physicsImpostor.registerOnPhysicsCollide(floor.physicsImpostor, function(main, collided) {
        that.dead = true;
    });
    var force = Math.random()*24 + 8;
    var impulse = new BABYLON.Vector3(Math.sin(rot.y)*force, 0, Math.cos(rot.y) * force);
    this.mesh.physicsImpostor.applyImpulse(impulse, this.mesh.position);
    this.lifeTime = 2000;

    bombList.push(this);
}

function moveBullets() {
    // iterating lists backwards to allow splicing
    /* move player bullets (no longer used)
    for (var i = bulletList.length-1; i>-1; i--) {
        bulletList[i].move();
        bulletList[i].lifeSpan -= deltaTime;
        if (bulletList[i].lifeSpan < 0) {
            bulletList[i].mesh.dispose();
            bulletList.splice(i, 1);
        }
    }*/
    // move enemy bullets
    for (i = simonBulletList.length-1; i > -1; i--) {
        var bullet = simonBulletList[i];
        bullet.lifeTime -= deltaTime;
        if(bullet.lifeTime < 0 || bullet.dead) {
            bullet.sprite.dispose();
            bullet.mesh.dispose();
            simonBulletList.splice(i,1);
        }
        else
            bullet.move();
    }
    // check for explosives that need to be removed
    for (i = bombList.length-1; i > -1; i--) {
        var bomb = bombList[i];
        bomb.lifeTime -= deltaTime;
        if (bomb.lifeTime < 0 || bomb.dead) {
            new Explosion(bomb.mesh.position, bomb.damage);
            bomb.sprite.dispose();
            bomb.mesh.dispose();
            bombList.splice(i,1);
        }
    }
}