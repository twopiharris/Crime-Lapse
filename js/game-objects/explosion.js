// for explosion animation
var explosionSpriteManager = new BABYLON.SpriteManager("explosionManager", "res/textures/explosion1.png", 50, 512, scene);

function Explosion(position, radius) {
    var distToPlayer = BABYLON.Vector3.Distance(player.mesh.position, position);
    if (distToPlayer < radius) {
        player.hurt(10);
    }
    var explosion = new BABYLON.Sprite("explosion", explosionSpriteManager);
    explosion.size = radius;
    explosion.position = position;
    explosion.playAnimation(0, 16, false, 75);
    ion.sound.play("explosion");
    explosion.disposeWhenFinishedAnimating = true;
}
