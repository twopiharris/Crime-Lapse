window.onload = init();

/* ----- INITIALIZE GLOBAL VARIABLES ----- */
var canvas, hudCanvas, colorCanvas, ctx, hudCtx, colorCtx;
var engine, scene, camera, camera2, light;
var bulletMaterial;
var prevTime = Date.now();
var deltaTime = 0;

// meshes
var floor, currentBoss, walls = [], simon;

// collision masks
var GROUND_MASK = 1;
var PLAYER_MASK = 2;
var ENEMY_MASK = 4;
var WAYPOINT_MASK = 8;
var ENEMY_BULLET_MASK = 16;

var roundNum = 1;

/* ----- SET UP SCENE ----- */
function init() {
    // main game canvas
    canvas = document.getElementById('canvas');
    // separate canvas for drawing HUD
    hudCanvas = document.getElementById('overlayCanvas');
    hudCtx = hudCanvas.getContext('2d');
    canvas.width = hudCanvas.width = window.innerWidth;
    canvas.height = hudCanvas.height = window.innerHeight;
    // separate 1 pixel canvas for creating color texture images (necessary for toon shader as it requires a texture rather than just a diffuse color)
    colorCanvas = document.getElementById('colorCanvas');
    colorCtx = colorCanvas.getContext('2d');
    colorCanvas.width = colorCanvas.height = 1;

    engine = new BABYLON.Engine(canvas, true);
    // stop engine from warning about "unable to find manifest files"
    engine.enableOfflineSupport = false;    

    scene = new BABYLON.Scene(engine);
    scene.enablePhysics();

    // camera.attachControl(canvas, true);   // camera.inputs.clear();  //camera.angularSensibility = 2000;
    camera = new BABYLON.FreeCamera("First Person Camera", BABYLON.Vector3.Zero(), scene);
    camera.angularSensibility = 1200;           // camera mouse sensitivity (lower = faster)
    camera.inertia = 0;                         // remove camera rotation acceleration
    scene.activeCamera = camera;

    camera2 = new BABYLON.FreeCamera("Spectator Camera", new BABYLON.Vector3(-50, 10, 0), scene);
    camera2.rotation = new BABYLON.Vector3(0, 90, 0);
    camera2.angularSensibility = 6000;
    camera2.keysUp.push(87);
    camera2.keysDown.push(83);
    camera2.keysLeft.push(65);
    camera2.keysRight.push(68);

    /*light = new BABYLON.PointLight("pointlight1", new BABYLON.Vector3(0, 100, 0), scene);
    light.intensity = 1;*/

    light = new BABYLON.PointLight("pointlight", new BABYLON.Vector3(0, 20, 0), scene);


    //create skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 4000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("res/textures/skybox/bkg2", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.isTerrain = true;
}

// make sure everything resizes when screen size changes
window.addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    hudCanvas.width = window.innerWidth;
    hudCanvas.height = window.innerHeight;
    engine.resize();
}, false);

