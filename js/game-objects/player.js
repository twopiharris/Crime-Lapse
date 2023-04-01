var player = {
  mesh: BABYLON.Mesh.CreateCylinder("PlayerCylinder", 10, 5, 5, 24, 1, scene),
  hp: 100,
  gun: null,

  prevPos: new BABYLON.Vector3(0,0,0),
  deltaPos: 0, // for simulating physics when jumping (keep applying previous movement while mid-air)

  // STACK OF LAST X POSITIONS (X = frame rate * number of seconds to roll back (maybe 60 * 3 = 180?)
  // treat like a queue in each game loop -> putting latest frame at front, popping off oldest frame
  // treat like stack when going back in time -> moving to latest frame then popping it off
  prevPositions: [],
  prevRotations: [],
  timeMemory: 60,

  intiatingBlink: false,
  blinkTimer: 0,            // blink cooldown (delay after blinking before blinking again)
  blinkDuration: 8,         // how many frames blink takes
  blinkFrame: 0,            // current frame of blink  (0 = not blinking, blinkDuration = just started blinking)
  maxBlinkCharges: 3,       // number of charges of blink player can store
  blinkCharges: 3,          // number of blink charges player currently has
  blinkRechargeRate: 2000,  // how many millseconds it takes for a blink to recharge
  blinkRecharge: 0,         // how recharged current blink charge is

  jumpCount: 2,

  backInTimeTimer: 0,
  backInTimeDelay: 2000,
  goingBack: false,
  timeFrameStep: 3,
  currentFrameStep: 0,

  hurt: function(damage) {
    this.hp = Math.max(this.hp - damage, 0);
    ion.sound.play("hurt");
  },
  goBackInTime: function() {
    if (this.prevPositions.length >= this.timeMemory && !this.goingBack && this.backInTimeDelay <= 0) {
      this.goingBack = true;
      ion.sound.play("timeresume");
      controlsEnabled = false;
      document.removeEventListener("mousemove", mouseMove, false);
    }
  },
  traverseTime: function() {
    if (this.prevPositions.length > 0) {
      var diff = this.prevPositions.pop().subtract(this.mesh.position);
      this.mesh.position.x += diff.x;
      this.mesh.position.y += diff.y;
      this.mesh.position.z += diff.z;
      camera.rotation = this.prevRotations.pop();
    }
    else {
      this.goingBack = false;
      this.backInTimeDelay = 2000;
      controlsEnabled = true;
      document.addEventListener("mousemove", mouseMove, false);
    }
  },

  stopLookingDownSight: false,
  startLookingDownSight: false
};

player.mesh.position = new BABYLON.Vector3(0, 10, 0);
player.width = player.mesh.getBoundingInfo().boundingBox.extendSize.z;
//player.mesh.position.y = 11;

player.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(player.mesh, BABYLON.PhysicsImpostor.CylinderImpostor, {
  mass: 1,
  restitution: 0,
  nativeOptions: {
    collisionFilterMask: GROUND_MASK + ENEMY_BULLET_MASK,
    collisionFilterGroup: PLAYER_MASK,
    fixedRotation: true
  }
}, scene);

player.mesh.isVisible = false;
player.mesh.isPickable = false;