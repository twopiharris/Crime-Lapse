var invisMaterial = new BABYLON.StandardMaterial("invisMaterial", scene);
invisMaterial.alpha = 0;

var enemyList = [];
var enemiesActivated = false;
var numEnemiesLeft = 0; // cannot just use enemyList.length because some enemies are deactivated/hidden, and also it takes some time for things to die

// manager for enemy healthbar sprites
var healthBarSpriteManager = new BABYLON.SpriteManager("healthbarManager", "res/textures/healthbar.png", 50, 64, scene);

function enemyHandler() {
    
}