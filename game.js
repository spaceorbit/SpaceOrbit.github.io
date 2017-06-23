var game = function() {

// Set up an instance of the Quintus engine  and include
// the Sprites, Scenes, Input and 2D module. The 2D module
// includes the `TileLayer` class as well as the `2d` componet.
var Q = window.Q = Quintus({ audioSupported: [ 'mp3', 'ogg' ] })
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Dialogue").enableSound()
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls().touch();


Q.animations("Spaceship_anim", {
  still: { frames: [0], rate: 1, flip: false, loop: false},
  hit: { frames: [0,1,0,1,0,1,0], rate: 2/10, flip: false, loop: false, next: "still"}
});
Q.animations("spaceship_anim", {
  right: { frames: [1], rate: 1, flip: false, loop: false},
  left: { frames: [0], rate: 1, flip: false, loop: false},
  go_left: { frames: [2], rate: 1, flip: false, loop: false, next: "left"},
  go_right: { frames: [3], rate: 1, flip: false, loop: false, next: "right"},
  right_3D: { frames: [5], rate: 1, flip: false, loop: false},
  left_3D: { frames: [4], rate: 1, flip: false, loop: false}
});

Q.animations("explosion_anim", {
  explode: { frames: [0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47], rate: 1/10, flip: false, loop: false, trigger: "finished"},
  explode_and_fire: { frames: [0,0,0,0, 1, 2,3,4,5,6,7,8], rate: 1/10, flip: false, loop: false, next: "fireExtension"},
  fireExtension: { frames: [9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36], rate: 1/10, flip: false, loop: true}
});
Q.animations("debris_anim", {
  far_away: { frames: [0], rate: 1/10, flip: false, loop: false},
  close_by: { frames: [1], rate: 1/10, flip: false, loop: false},
});

// Objeto explosión (usada en la Intro)
Q.Sprite.extend("Explosion", {
  init:function(paramX, paramY, paramScale, explode){
    this._super({
      sprite:"explosion_anim",
      sheet:"explosion",
      x: paramX,
      y: paramY,
      scale: paramScale,
      z: 5,
      opacity: 0.7
    });
    this.add('animation, tween');
    this.on("finished", this, "end");
    this.p.sensor = true;
    this.animate({scale: this.p.scale * 2}, 2);

    // Dos comportamientos posibles: que explote y desaparezca, o que explote y continúe
    if(explode == true){
      this.play("explode");
    }
    else{
      this.play("explode_and_fire");
    }
    if(Q.state.get("audio") == "on")
      Q.audio.play("explosion.mp3");
  },
  end: function(){
    this.destroy();
  }
});

// Objeto Estación (Usada tanto en la intro como la meta)
Q.Sprite.extend("Station", {
  init:function(paramX, paramY, paramAsset){
    this._super({
      asset: paramAsset,
      x: paramX,
      y: paramY,
      scale: 1,
      zIndex: 2
    });
    this.add('animation, tween');
    this.p.sensor = true;
  }
});

// Objeto que representa el final del horizonte de sucesos (círculo negro)
Q.Sprite.extend("Tunnel", {
  init:function(paramX, paramY, paramAsset, zIndex){
    this._super({
      asset: paramAsset,
      x: paramX,
      y: paramY, 
      gravity:0,
      scale: 0.1,
      z: zIndex,
      t: 0
    });
    this.add('2d, animation, tween');
    this.p.sensor=true;
    // Va aumentando de tamaño según el tiempo para que de ilusión de tener fin
    this.animate({scale: 0.6}, 14, Q.Easing.Quadratic.In);

  },
  step: function(){
    this.p.t++;
    if(this.p.t >= 800){ // A los 800 tiempos desaparece
      this.destroy();
    }
  }
});

// Objeto "astro" agujero negro. Sprite con la forma de Gargantua
Q.Sprite.extend("Wormhole", {
  init:function(paramX, paramY, paramAsset, z){
    this._super({
      asset: paramAsset,
      x: paramX,
      y: paramY, 
      gravity:0,
      scale: 0.2,
      zIndex: 3
    });
    this.add('2d, animation, tween');
    //this.p.sensor=true;
    this.p.h = 5000;
    this.p.w = 5000;
    // Aumentar w y h para que colisione en cualquier caso.
    // Al colisionar, aumentar escala y comenzar event horizon, 
    // luego ya se eliminará wormhole y podrá salir
  }
});

// Sprite de planeta
Q.Sprite.extend("Planet", {
  init: function(paramX, paramY, paramAsset, paramR, paramD, paramN, z, paramRewards){
    this._super({
      asset: paramAsset,
      x: paramX,
      y: paramY,
      d: paramD,
      r: paramR,
      n: paramN,
      zIndex: z,
      nRewards: paramRewards,
      ready: false,
      t: 0
    });
    this.p.sensor = true;
  },
  step: function(dt){
    this.p.t++;
    if(this.p.nRewards > 0 && this.p.t%70 == 0){
      var debrisNum = Math.floor(Math.random() * 5) + 1;
      var debrisObj = Q.state.get('debris')[debrisNum];
      var scale = 0.5;
      if(debrisObj.name != "meteorite" && debrisObj.name != "satellite"){
        scale = 1;
      }
      // paramX, paramY, paramVx, paramVy, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType, paramPlanet
      this.stage.insert(new Q.Debris(this.p.x, this.p.y, debrisObj.name, debrisObj.sheet, scale, 4, "Orbit", debrisObj.type, this));
      //this.stage.insert(new Q.OxygenCharge(this.p.x, this.p.y, true, this));
      this.p.nRewards--;
    }
  }
});


// Crea todos los astros del juego, según el objeto planets de Q.state
function createPlanets(stage){
  //var universe = stage.insert(new Q.Universe());

  var planets = Q.state.get("planets");
  var orbits = {};
  for(var i = 1; i < 8; i++){
    var p = planets[i];
      stage.insert(new Q.Planet(p.x, p.y, i + ".png", p.r, p.d, i, 1, p.n));
      orbits[i] = {x1: p.x - 2*(p.r + p.d), x2: p.x + 2*(p.r + p.d)};
  }
  var wh = planets["wormhole"];
  //stage.insert(new Q.Blackhole(wh.x, wh.y, "interiorCircularInfluence.png", 1, 1));
  console.log(wh.x + " " + wh.y);
  stage.insert(new Q.Wormhole(wh.x, wh.y, "wormhole.png", 5));
  orbits["wormhole"] = {x1: wh.x - 2*(wh.r + wh.d), x2: wh.x};

  var wh2 = planets["wormhole2"];
  //stage.insert(new Q.Blackhole(wh.x, wh.y, "interiorCircularInfluence.png", 1, 1));
  console.log(wh2.x + " " + wh2.y);
  stage.insert(new Q.Wormhole(wh2.x, wh2.y, "wormhole.png", 5));
  orbits["wormhole2"] = {x1: wh2.x - 2*(wh2.r + wh2.d), x2: wh2.x};

  Q.state.set("orbits", orbits);
}

// Sprite que representa la deformación del espacio-tiempo alrededor del Wormhole (efecto visual). No necesariamente útil.
Q.Sprite.extend("Blackhole", {
  init:function(paramX, paramY, paramAsset, paramScale, z){
    this._super({
      asset: paramAsset,
      x: paramX,
      y: paramY, 
      gravity: 0,
      scale: paramScale,
      created: false,
      zIndex: z
    });
    this.add('2d, animation, tween');
    this.p.sensor=true;
    // Lo eliminamos cuando la nave choca con él
    this.on("hit", this, function(collision){
      if(collision.obj.isA("Spaceship")){
        this.destroy();
      }
    });
  },
  // Creamos recursivamente los "anillos de distorsión", según la escala inicial
  step: function(){
    if(this.p.created == false){
      this.p.created = true;
      // Caso recursivo
      if(this.p.scale > 0.4 && this.p.asset != "wormhole.png"){
        this.animate({angle: 5000 * (1.2 - this.p.scale)}, 180);
        this.stage.insert(new Q.Blackhole((this.p.x + (this.p.w - this.p.w*this.p.scale)/100), (this.p.y + (this.p.h - this.p.h*this.p.scale)/100), "interiorCircularInfluence.png", this.p.scale - 0.2, 1));
      }
      // Caso base. Cuando ha terminado de crear los anillos, crea el Wormhole
      else if (this.p.scale < 0.4 && this.p.scale > 0.2){
        this.stage.insert(new Q.Wormhole((this.p.x + (this.p.w - this.p.w*this.p.scale)/100), (this.p.y + (this.p.h - this.p.h*this.p.scale)/100), "wormhole.png", 2));
      }
    }
  }
});

// Clase que representa un lado del campo de estrellas de EventHorizon
Q.Sprite.extend("QuarterStarfield", {
  init:function(paramX, paramY, paramSide, zIndex){
    this._super({
      asset:"quarterStarfield.png",
      x: paramX,
      y: paramY,
      scale: 0.25,
      gravity: 0.01,
      opacity: 0,
      side: paramSide,
      z: zIndex
    });

    // Ahora tenemos que girar el sprite para poder cubrir todas las paredes del horizonte de sucesos
    if(Math.random() > 0.5 ){
      this.p.asset = "quarterStarfield.png";
    }
    if(this.p.side == "bottom"){
      this.p.vy = 180;
      this.p.angle = 0;
    }
    else if (this.p.side == "top"){
      this.p.vy = -180;
      this.p.angle = 180;
    }
    else if (this.p.side == "right"){
      this.p.vx = 180;
      this.p.angle = -90;
    }
    else if (this.p.side == "left"){
      this.p.vx = -180;
      this.p.angle = 90;
    }
    this.add('animation, tween');
    this.p.sensor=true;
    this.animate({scale: 0.4, opacity: 1}, 0.5, Q.Easing.Linear, {callback: function(){
      this.animate({scale: 3, opacity: 0}, 4); // Extendemos hacia fuera para dar efecto de túnel
    }});
    this.animate({angle: this.p.angle}); // Rotamos en función del side
    
    var self = this;
    setTimeout(function(){
      self.destroy(); // A los 4 segundos muere
    }, 4000);
  },
  step: function(){    
  }
});

// Clase Horizonte de sucesos
Q.Sprite.extend("EventHorizon", {
  init:function(paramX, paramY, stage, zIndex){
    this._super({
      asset:"vortex.png", // Imágen de "remolino". Las paredes del túnel
      x: paramX,
      y: paramY,
      scale: 0.6,
      opacity: 0,
      t: 0, // Factor "tiempo"
      z: zIndex || 0,
      created: false
    });
    this.add('animation, tween');
    this.p.sensor=true;
    // Hacemos que aparezca en pantalla de forma continua
    this.animate({opacity: 0.8}, 2, {callback: function(){

    }}); 
    // Lo vamos girando con el tiempo
    this.animate({angle: -150}, 8);
    // Guardamos el objeto en Q.state para posterior uso en modo 3D
    Q.state.set('eventHorizon', this);
  },
  step: function(){
    this.p.t++;
    if(!this.p.created){
      // Creamos el fondo del túnel al principio
      this.stage.insert(new Q.Tunnel(this.p.x, this.p.y, "blackhole.png", 3));
      this.p.created = true;
    }
    if(this.p.t%100 == 0){ // Cada cierto tiempo creamos nuevos campos de estrellas
      this.stage.insert(new Q.QuarterStarfield(this.p.x, this.p.y + 50, "bottom", 2));
      this.stage.insert(new Q.QuarterStarfield(this.p.x, this.p.y - 50, "top", 2));
      this.stage.insert(new Q.QuarterStarfield(this.p.x + 30, this.p.y - 20, "right", 2));
      this.stage.insert(new Q.QuarterStarfield(this.p.x - 30, this.p.y - 20, "left", 2));
    }
    if(this.p.t >= 800){
      // Hacemos que la nave salga del agujero negro
      this.animate({opacity: 0, scale: 2.5}, 2, {callback: function(){
        Q.state.set("dim", "2D");
        this.destroy();
      }});
    }
  }
});

// Global Quintus variables
Q.state.set({
      dim: "2D",
      nPlanet: 0, // Índice del planeta detectado por el radar
      planets: { // Coordenadas, distancia de órbita, radio del planeta
        0: {},
        1: { x: 1540, y: 330, d: 400, r: 130, name: "Fiery", g: 9.8},
        2: { x: 4240, y: 330, d: 450, r: 160, name: "Reddy", g: 6},
        wormhole : { x: 6240, y: 330, d: 850, r: 10, name: "Gargantua", g: 0},
        3: { x: 8840, y: 330, d: 500, r: 210, name: "Greeny", g: 4},
        4: { x: 12340, y: 330, d: 250, r: 250, name: "Veggie", g: 8},
        5: { x: 20040, y: 530, d: 600, r: 300, name: "Bluey", g: 2},
        6: { x: 25200, y: 230, d: 400, r: 125, name: "Stormzy", g: 10},
        7: { x: 37200, y: 30, d: 700, r: 350, name: "Purply", g: 12}
      },
      debris: {
        1: {name: 'meteorite', asset:"debris1.png", damage: 30},
        2: {name: 'satellite', asset:"debris2.png", damage: 50}
      },
      numDebris: 4,
      orbits: { // Estos datos se rellenan al crear la partida
        1: {x1: 0, x2: 0},
        2: {x1: 0, x2: 0},
        3: {x1: 0, x2: 0},
        4: {x1: 0, x2: 0},
        5: {x1: 0, x2: 0},
        6: {x1: 0, x2: 0},
        7: {x1: 0, x2: 0},
        wormhole: {x1: 0, x2: 0}
      },
      eventHorizon: undefined,
      player: {
        oxygen: 100,
        shipHealth: 100
      },
      orbimeters: 150000,
      distanceToRadius: 0,
      minDistanceX: 0,
      audio: 'on',
      modoDios: 'off',
      difficulties: ['LOW', 'MEDIUM', 'HIGH'],
      difficulty: 0
});

// Función que se llama en el step de Spaceship para ver si hay astros cercanos
function radar(x){
  var orbits = Q.state.get("orbits");
    // Modificamos la variable nPlanet de Q.state (es el planeta detectado por el radar, para activar la atracción gravitatoria)
    if(x > orbits["1"].x1 && x < orbits["1"].x2){
      //console.log("En órbita de planeta 1");
      Q.state.set("nPlanet", 1);
    }
    else if(x > orbits["2"].x1 && x < orbits["2"].x2){
      //console.log("En órbita de planeta 2");
      Q.state.set("nPlanet", 2);
    }
    else if(x > orbits["wormhole"].x1 && x < orbits["wormhole"].x2){
      //console.log("En órbita de wormhole");
      Q.state.set("nPlanet", "wormhole");
    }
    else if(x > orbits["wormhole2"].x1 && x < orbits["wormhole2"].x2){
      //console.log("En órbita de wormhole");
      Q.state.set("nPlanet", "wormhole2");
    }
    else if(x > orbits["3"].x1 && x < orbits["3"].x2){
      //console.log("En órbita de planeta 3");
      Q.state.set("nPlanet", 3);
    }
    else if(x > orbits["4"].x1 && x < orbits["4"].x2){
      //console.log("En órbita de planeta 4");
      Q.state.set("nPlanet", 4);
    }
    else if(x > orbits["5"].x1 && x < orbits["5"].x2){
      //console.log("En órbita de planeta 5");
      Q.state.set("nPlanet", 5);
    }
    else if(x > orbits["6"].x1 && x < orbits["6"].x2){
      //console.log("En órbita de planeta 6");
      Q.state.set("nPlanet", 6);
    }
    else if(x > orbits["1"].x1 && x < orbits["1"].x2){
      //console.log("En órbita de planeta 7");
      Q.state.set("nPlanet", 7);
    }
    else{
      //console.log("Fuera de órbita");
      Q.state.set("nPlanet", 0);
    }
}

// Objeto del jugador
Q.Sprite.extend("Spaceship", {
  init:function(paramX, paramY, paramVx, paramVy, zIndex, paramDim){
    this._super({
      sprite:"spaceship_anim",
      sheet:"spaceship",
      x: paramX,
      y: paramY,
      vx: paramVx,
      vy: paramVy,
      gravity:0,
      scale: 0.5,
      dir: "right",
      t: 0,
      m: 0, // Factor de tiempo para actualizar las distancias
      z: zIndex,
      dimension: paramDim,
      stuck: false,
      conversation: false
    });
    this.add('2d, animation, tween');
    this.play("right");
    
    this.p.sensor = true;
    this.p.h = 16;

    // En lugar de usar PlatformerControls, usamos la propulsión en el espacio
    // Separamos en dos casos: 2D y 3D.
    //    2D: la nave va acumulando velocidad vx, vy hasta un tope
    //    3D: la nave se mueve hacia los laterales con velocidad uniforme
    Q.input.on("up", this, function(){
      if(this.p.dimension == "2D"){
        if(Q.state.get("player").fuel > 0){ // Si tenemos combustible
          this.play("go_" + this.p.dir);
          // Si nos hemos chocado con un planeta
          if(this.p.stuck){
            if(this.p.directions.up == true){
              this.p.y -= 10;
              this.p.vy = -360; // Propulsamos con una velocidad relativamente alta para salir de órbita. 
              // Se podría parametrizar en base a la atracción gravitatoria!
              this.p.stuck = false;
              var p = Q.state.get("player");
              p.fuel -= 50;
              if(p.fuel <= 0)
                p.fuel = 0;
                // Comprobar v = 0 y EndGame
              Q.state.set("player", p);
            }
          }
          else{ // Comportamiento ordinario. Hasta 4 propulsiones
            this.p.vy -= 80;
            if(this.p.vy < -320){
              this.p.vy = -320;
            }
            var p = Q.state.get("player");
            p.fuel -= 1;
            if(p.fuel <= 0)
                p.fuel = 0;
            Q.state.set("player", p); 
          }
        }
      }
      else{
        this.play(this.p.dir + "_3D");
        this.p.vy = -120;
      }
    });
    Q.input.on("down", this, function(){
      if(this.p.dimension == "2D"){
        if(Q.state.get("player").fuel > 0){ // Si tenemos combustible
          this.play("go_" + this.p.dir);
          // Si nos hemos chocado con algún planeta
          if(this.p.stuck){
            if(this.p.directions.up == false){
              this.p.y += 10;
              this.p.vy = 360; // Propulsamos con una velocidad relativamente alta para salir de órbita. 
              // Se podría parametrizar en base a la atracción gravitatoria!
              this.p.stuck = false;
              var p = Q.state.get("player");
              p.fuel -= 50;
              if(p.fuel <= 0)
                p.fuel = 0;
              Q.state.set("player", p);
            }
          }
          else{ // Comportamiento ordinario. Hasta 4 propulsiones
            this.p.vy += 80;
            if(this.p.vy > 320){
              this.p.vy = 320;
            }
            var p = Q.state.get("player");
            p.fuel -= 1;
            if(p.fuel <= 0)
                p.fuel = 0;
            Q.state.set("player", p); 
          }
        }
      }
      else{
        this.play(this.p.dir + "_3D");
        this.p.vy = 120;
      }
    });
    Q.input.on("left", this, function(){
      this.p.dir = "left";
      if(this.p.dimension == "2D"){
        if(Q.state.get("player").fuel > 0){ // Si tenemos combustible
          this.play("go_" + this.p.dir);
          if(this.p.stuck){
            if(this.p.directions.right == false){
              this.p.x -= 10;
              this.p.vx = -360; // Propulsamos con una velocidad relativamente alta para salir de órbita. 
              // Se podría parametrizar en base a la atracción gravitatoria!
              this.p.stuck = false;
              var p = Q.state.get("player");
              p.fuel -= 50;
              if(p.fuel <= 0)
                p.fuel = 0;
              Q.state.set("player", p);
            }
          }
          else{
            this.p.vx -= 80;
            if(this.p.vx < -320){
              this.p.vx = -320;
            }
            var p = Q.state.get("player");
            p.fuel -= 1;
            if(p.fuel <= 0)
                p.fuel = 0;
            Q.state.set("player", p); 
          }
        }
      }
      else{
        this.play(this.p.dir + "_3D");
        this.p.vx = -120;
      }
    });
    Q.input.on("right", this, function(){
      this.p.dir = "right";
      if(this.p.dimension == "2D"){
        if(Q.state.get("player").fuel > 0){ // Si tenemos combustible
          this.play("go_" + this.p.dir);
          // Si nos hemos chocado con algún planeta
          if(this.p.stuck){
            if(this.p.directions.right == true){
              this.p.x += 10; 
              this.p.vx = 360; // Propulsamos con una velocidad relativamente alta para salir de órbita. 
              // Se podría parametrizar en base a la atracción gravitatoria!
              this.p.stuck = false;
              var p = Q.state.get("player");
              p.fuel -= 50;
              if(p.fuel <= 0)
                p.fuel = 0;
              Q.state.set("player", p);
            }
          }
          else{
            this.p.vx += 80;
            if(this.p.vx > 320){
              this.p.vx = 320;
            }
            var p = Q.state.get("player");
            p.fuel -= 1;
            if(p.fuel <= 0)
                p.fuel = 0;
            Q.state.set("player", p);        
          }
        }
      }
      else{
        this.play(this.p.dir + "_3D");
        this.p.vx = 120;
      }
    });
    // Cuando se dispara con SPACE, creamos una bala con la dirección correcta
    Q.input.on("fire", this, function(){
      var offsetX = (this.p.dir == "right" ? 25 : -25);
      var p = Q.state.get("player");
      if(p.blaster > 0){
        p.blaster -= 5;
        Q.stage().insert(new Q.Bullet(this.p.x + offsetX, this.p.y + 8, this.p.dir , this.p.x, this.p.y));
        if(Q.state.get("audio") == "on")
          Q.audio.play("fireAux.mp3"); // Reproducimos audio de blaster
      }
      if(p.blaster <= 0)
        p.blaster = 0;
      Q.state.set("player", p);
      
    });

    // Esto es por propósitos de desarrollador. Para saber las coordenadas de la nave en un momento concreto
    Q.input.on("S", this, function(){
      console.log("x: " + this.p.x);
      console.log("y: " + this.p.y);
    });

    //----------------MODO DIOS --------------- //

    Q.input.on("ONE", this, function(){
      if(Q.state.get("modoDios") == "on"){
        Q.state.set("level", 1);
        this.p.x = 200;
        // Configurar contadores de debrisSpawner y conversaciones correctamente
      }
    });
    Q.input.on("TWO", this, function(){
      if(Q.state.get("modoDios") == "on"){
        Q.state.set("level", 2);
        this.p.x = 21000;
      }
    });
    Q.input.on("THREE", this, function(){
      if(Q.state.get("modoDios") == "on"){
        Q.state.set("level", 3);
        this.p.x = 84000;
      }
    });
    Q.input.on("FOUR", this, function(){
      if(Q.state.get("modoDios") == "on"){
        this.p.x = 9000;
      }
    });
    Q.input.on("FIVE", this, function(){
      if(Q.state.get("modoDios") == "on"){
        this.p.x = 41000;
        Q.state.set("level", 2);
      }
    });
    Q.input.on("EIGHT", this, function(){
      Q.state.set("audio", "on");
    });
    Q.input.on("NINE", this, function(){
      Q.state.set("audio", "off");
    });

    // Actualizamos RADAR cada vez que ocurra un cambio en Q.state
    Q.state.on("change", function(){
        Q.stageScene("RADAR", 1);
    });

    this.on("bump.top, bump.bottom, bump.left, bump.right", this, function(collision){
      if(collision.obj.isA("Wormhole")){
        // Primero escalar el agujero negro
          // Después crear el resto de elementos
        var col = collision.obj;
        this.animate({x: collision.obj.p.x, y: collision.obj.p.y + 200}, 5, {callback: function(){
          // Cambiamos el modo de juego a 3D
          Q.state.set("dim", "3D");
          
        }});
        collision.obj.animate({scale: 70, opacity: 0.5}, 6, Q.Easing.Quadratic.InOut, {callback: function(){
          collision.obj.destroy();
          // Entramos en el horizonte de sucesos (túnel)
          this.stage.insert(new Q.EventHorizon(col.p.x, col.p.y, 1, 1));
          // Creamos un Spawner de basura en 3D
          this.stage.insert(new Q.DebrisSpawner(this, "3D", this.p.x, this.p.y));
          // Permitimos hasta 10 elementos de basura espacial por el túnel
          Q.state.set("numDebris", 10);
          Q.state.set("nPlanet", "0"); // Desactivamos el radar de la nave
        }});

      }
      if(collision.obj.isA("Blackhole")){
        collision.obj.destroy();
        console.log("Has chocado con la circunferencia");
        Q.state.set("nPlanet", "0");
      }
    });

    // Cambiamos el estado de la nave según el modo de juego
    Q.state.on("change.dim", this, function(){
      if(Q.state.get("dim") == "2D"){
        this.p.dimension = "2D";
        this.p.x *= 2; // Atravesamos el espacio-tiempo
        Q.state.inc("level");
        Q.Dialogue.play("2");
        this.stage.insert(new Q.DebrisSpawner(this, "Asteroids", this.p.x, this.p.y));
        this.animate({scale: 0.5}, 2, Q.Easing.Quadratic.Out);
        Q.state.set("minDistanceX", this.p.x - 200);
      }
      else{
        this.p.dimension = "3D";
        Q.Dialogue.play("wormhole");
        this.animate({scale: 1}, 2, Q.Easing.Quadratic.Out);
      }
    });
    // Cada vez que se incrementa el nivel del juego (se pasa un agujero negro)
    Q.state.on("change.level", this, function(){
      // Crear lluvia de meteoritos
      var level = Q.state.get("level");

    });
  },

  die: function(){
    this.destroy();
  },

  step: function(dt){

    //if(Q.state.get("dim") == "2D"){ // Activamos el radar cuando no esté en agujero negro
      radar(this.p.x);
    //}
    //

    if(this.p.vx != 0 && this.p.m%16*60 == 0){
        Q.state.set("orbimeters", Math.trunc(130000 - this.p.x));
        var p = Q.state.get("player")
        p.blaster +=1;
        if(p.blaster >= 100){ // El blaster se regenera con la velocidad de la nave, usando la energía estelar fotovoltaica
          p.blaster = 100;
        }
        Q.state.set("player", p);
    }

    this.p.m++; // Aumentamos m
    this.p.t+= 1/(16*60); // Calculamos los segundos que han pasado
    var planets = Q.state.get("planets"); // Cogemos el objeto planetas de la variable global Q.state
    var nPlanet = Q.state.get("nPlanet"); // Cogemos el índice del planeta actual

    // Si estamos en modo 3D
    if (Q.state.get("dim") == "3D"){
      // Si nos intentamos salir del horizonte de sucesos por los lados
      if(this.p.x < (parseInt(planets[nPlanet].x) - Q.width/2)){
        console.log("X nave: " + this.p.x);
        // Mantenemos la nave a raya
        this.p.x = parseInt(planets[nPlanet].x) - Q.width/2;
      }
      else if(this.p.x > (parseInt(planets[nPlanet].x) + Q.width/2)){
        this.p.x = parseInt(planets[nPlanet].x) + Q.width/2;
        console.log("X nave: " + this.p.x);
      }
    }

    // Si estamos en modo 2D
    if(nPlanet != 0 && Q.state.get("dim") == "2D"){
      var d = Math.sqrt((planets[nPlanet].x - this.p.x) * (planets[nPlanet].x - this.p.x) + (planets[nPlanet].y - this.p.y) * (planets[nPlanet].y - this.p.y));
      if(this.p.m%16*60 == 0)
        Q.state.set("distanceToRadius", Math.trunc(d));

      // Si ha entrado en órbita (la distancia al planeta es menor que la distancia de órbita (planets[nPlanet].d)) y no ha llegado a la superficie (usamos el radio)
      if (d < planets[nPlanet].d && !(d > -planets[nPlanet].r && d < planets[nPlanet].r)){
            //console.log("Has entrado en el campo gravitatorio");
        // Calculamos distancias
        var dx = planets[nPlanet].x - this.p.x;
        var dy = planets[nPlanet].y - this.p.y;
        var g = planets[nPlanet].g; // Obtenemos la gravedad del planeta
        var ax = dx < 0 ? -g : g;
        var ay = dy < 0 ? -g : g;

        // Calculamos las velocidades: v = v0 + a*t
        this.p.vx = ax*this.p.t + this.p.vx;
        this.p.vy = ay*this.p.t + this.p.vy;
      }
      else{
            //console.log("Has salido del campo gravitatorio");
      }
      // Si ha llegado a la superficie (Ha chocado con el planeta)
      if(d > -planets[nPlanet].r && d < planets[nPlanet].r && planets[nPlanet].g != 0 && !this.p.stuck){
        this.p.vx = 0;
        this.p.vy = 0;
        this.p.stuck = true;
        this.wreckShip(Math.floor(2*planets[nPlanet].g));
        // Ahora guardamos las direcciones en las que puede despegar
        this.p.directions = { // Inicializamos a izquierda y abajo (se pueden usar las teclas DOWN y LEFT)
          right: false,
          up: false
          // Podríamos incluso guardarnos datos del planeta para parametrizar la velocidad de propulsión
        }
        if(planets[nPlanet].x - this.p.x <= 0){ // Habilitamos hacia la derecha
          this.p.directions.right = true;
        }
        if(planets[nPlanet].y - this.p.y >= 0){ // Habilitamos hacia arriba
          this.p.directions.up = true;
        }
        // Luego en las teclas de dirección, se comprueban propulsores
        // Así no puede ir hacia "dentro" del planeta
      }
    }
    else if (nPlanet == 0){

    }  

    // Comprobamos que no se salga del mapa
    if(this.p.y < 10){
      this.p.y = 10;
    } 
    if(this.p.y > Q.height - 10){
      this.p.y = Q.height - 10;
    }

    // Comprobamos que no pueda volver atrás en niveles (tras pasar un agujero negro)
    if(this.p.x <= Q.state.get("minDistanceX")){
      this.p.x = Q.state.get("minDistanceX");
    }

    // Comprobamos el tiempo para reducir la cantidad de oxígeno
    if(this.p.m%500 == 0){
      var player = Q.state.get('player');
      player.oxygen -= 1;
      Q.state.set('player', player);
      if(player.oxygen == 0){
        this.destroy();
      }
    }
  },
  wreckShip: function(damage){
    var p = Q.state.get("player");
    p.shipHealth -= damage;
    if(p.shipHealth <= 0){
      p.shipHealth = 0;
      this.stage.insert(new Q.Explosion(this.p.x, this.p.y, 0.4, true));
      this.destroy();
      // Llamar a EndGame
    }
    Q.state.set("player", p);
  },
  useFuel: function(fuel){
    var p = Q.state.get("player");
    p.fuel -= fuel;
    if(p.fuel <= 0){
      p.fuel = 0; 
      // Comprobar v = 0 y EndGame
      if(this.p.vx == 0 && this.p.vy == 0){
        this.destroy();
        // Llamar a EndGame
      }
    }
    Q.state.set("player", p);
  }

});

// Objeto bala
Q.Sprite.extend("Bullet", {
  init:function(paramX, paramY, paramDir, paramOrgX, paramOrgY){
    this._super({
      asset: "bullet.png",
      x: paramX,
      y: paramY,
      vx: 800,
      vy: 0,
      dir: paramDir,
      orgX: paramOrgX,
      orgY: paramOrgY,
      scale: 1,
      z: 9,
      t: 0
    });
    this.add('animation, tween');
    this.p.sensor=true;

    // Si estamos en modo 3D
    if(Q.state.get("dim") == "3D"){
       var evH = Q.state.get('eventHorizon'); // Cogemos los datos del Horizonte de sucesos de Q.state
        // Disparamos hacia el centro del horizonte de sucesos (hacia el final del túnel)
        this.animate({x: evH.p.x, y: evH.p.y, scale: 0}, 1, {callback: function(){
          this.destroy();
      }});
    }
  },
  step: function(dt){
    this.p.t++;
    if(Q.state.get('dim')== '2D'){
      if(this.p.dir == 'right'){
       this.p.x += dt*this.p.vx;
      }else{
        this.p.x -= dt*this.p.vx;
      }
      if(this.p.y < 0 || this.p.y>screen.height){
        this.destroy();
      }
    }
    if(this.p.t >= 800){
      this.destroy();
    }
  }
});


Q.component("orbit", {
  added: function(){
    // Calcular arrays de posiciones de la órbita
    this.entity.p.u = new Array(); // Rellenaremos con las posiciones "verticales"
    var alpha = Math.PI/2; // Iniciamos el desplazamiento a 90 grados
    var incAlpha = Math.PI/200; // Calculamos el ángulo de rotación
    var yIni = this.entity.p.planet.p.y - this.entity.p.planet.p.d;
    alpha -= incAlpha;
    var k = 0;
    while(k < 200){
      // Vamos añadiendo la coordenada y correspondiente.
      // La calculamos con trigonometría para que los puntos de la circunferencia equidisten
      this.entity.p.u.push(yIni + (this.entity.p.planet.p.d - Math.sin(alpha)*this.entity.p.planet.p.d));
      alpha -= incAlpha;
      if(alpha <= 0){
        alpha = 2*Math.PI - incAlpha; // Reseteamos a 360-incAlpha en el caso de que llegue a 0
      }
      k++;
    }
    // Ahora tenemos u[] lleno de las primeras coordenadas
    // Necesitamos rellenar v[], que tendrá el doble de tamaño, con las coordenadas "x" de la circunferencia
    // Ecuación de la circunferencia: (v - x)^2 + (u - y)^2 = r^2
    this.entity.p.v = new Array();
    for (var i = this.entity.p.u.length - 1; i >= 0; i--) {
      // Despejar (v - x)
      var vMx = Math.sqrt(this.entity.p.planet.p.d*this.entity.p.planet.p.d - (this.entity.p.u[i] - this.entity.p.planet.p.y)*(this.entity.p.u[i] - this.entity.p.planet.p.y));
      // Calcular el valor de la derecha 
      var v1 = vMx + this.entity.p.planet.p.x;
      // Ahora añadimos la coordenada al array
      this.entity.p.v.push(v1);
    };
    
    for (var i = 0; i < this.entity.p.u.length; i++) {
      // Despejar (v - x)
      var vMx = -Math.sqrt(this.entity.p.planet.p.d*this.entity.p.planet.p.d - (this.entity.p.u[i] - this.entity.p.planet.p.y)*(this.entity.p.u[i] - this.entity.p.planet.p.y));
      // Calcular el valor de la izquierda
      var v2 = this.entity.p.planet.p.x + vMx;
      // Ahora añadimos la coordenada al array
      this.entity.p.v.push(v2);
    };
    // Ahora tenemos dos arrays.
    // Para que recorra la órbita, tenemos que recorrer de abajo a arriba, y de arriba a abajo el array u[]
    // En cada pasada, acceder a la mitad de las coordenadas de v[] y repetir

    // Declaramos unas coordenadas locales para el objeto
    this.entity.p.x = this.entity.p.v[0];
    this.entity.p.y = this.entity.p.u[0];
    this.entity.p.i = 0; // Índice de u[]. Será ascendente y descendente, alternando direcciones cuando llegue a los límites
    this.entity.p.j = 0; // Índice de v[]. Irá de 0 a 80, volviendo a 0 cada vez que se complete una vuelta a la órbita
    
    this.entity.p.dirY = 1; // Dirección y del objeto
    
  },
  extend: {
    stepDebris: function(dt){
      // Recorrer arrays de posiciones de la órbita
      this.p.y = this.p.u[this.p.i];
      this.p.i += this.p.dirY;
      if(this.p.dirY == 1 && this.p.i ==this.p.u.length){ // Si la i ha llegado a arriba
        this.p.dirY = -1; // Ahora la i irá hacia abajo
        this.p.i--;
      }
      if(this.p.dirY == -1 && this.p.i == -1){ // Si la i ha llegado a abajo
        this.p.dirY = 1; // Ahora la i irá hacia arriba
        this.p.i++;
      }

      this.p.x = this.p.v[this.p.j];
      this.p.j++;
      if(this.p.j == this.p.v.length){
        this.p.j = 0;
      }
    }
  }
});
Q.component("debris2D", {
  added: function(){
    this.entity.p.vx = -(Math.random())*10;
    this.entity.p.vy = (Math.random() * 2 - 1)*10;
  },
  extend: {
    stepDebris: function(dt){
      this.p.x += dt* this.p.vx;
      this.p.y += dt* this.p.vy;

      this.play("far_away");
      if(this.p.y < 0 || this.p.y>screen.height){ // Si se sale de la pantalla, lo eliminamos
        this.destroy();
      }
    }
  }
});
Q.component("debris3D", {
  added: function(){
    var self = this.entity;
    this.entity.animate({scale: this.entity.p.scale * 5}, 5, Q.Easing.Linear, {callback: function(){
        self.animate({scale: self.p.scale * 2, opacity: 0}, 4, Q.Easing.Linear, {callback: function(){
          self.destroy();
        }});
    }});
    // Velocidades x e y aleatorias, velocidad z simulación de constante
    this.entity.p.vx = (Math.random() * 2 - 1)*40;
    this.entity.p.vy = (Math.random() * 2 - 1)*40;
  },
  extend: {
    stepDebris: function(dt){
      this.p.x += dt* this.p.vx;
      this.p.y += dt* this.p.vy;

      if(this.p.scale >= 1.3){ // En cuanto pase por el plano Z del jugador, hacemos que esté detrás (para que se pinte bien)
        this.p.z = 15;
        this.play("far_away");
      }
      if(this.p.scale >= 1.1 && this.p.scale <= 1.3){
        this.play("close_by");
      }
      if(this.p.y < 0 || this.p.y>screen.height){ // Si se sale de la pantalla, lo eliminamos
        this.destroy();
      }
    }
  }
});

Q.component("reward", {
  added: function(){
    this.entity.on("hit.sprite", this, function(collision){
      if(collision.obj.isA("Spaceship")){
        // Distinguir entre tipos de Recompensa (oxígeno, combustible, reparar nave...)
        // Comparar que esté en 2D o en 3D (Comprobar escala)
        if(this.entity.p.movType == "2D" || this.entity.p.movType == "Orbit" || (this.entity.p.movType == "3D" && this.entity.p.scale >= 1.1 && this.entity.p.scale <= 1.3)){
          var p = Q.state.get("player");
          if(this.entity.p.name == "OxygenCharge"){
            p.oxygen += 5; // Reponemos oxígeno
            if(p.oxygen > 100 ) 
              p.oxygen = 100; // Pero que no se pase de 100%
          }
          else if(this.entity.p.name == "Fuel"){
            p.fuel += 50; // Reponemos combustible
            if(p.fuel > 100) 
              p.fuel = 100; // Pero que no se pase de 100%
          }
          else if(this.entity.p.name == "Screw"){
            p.shipHealth += 30; // Mejoramos el estado de la nave
            if(p.shipHealth > 100) 
              p.shipHealth = 100; // Pero que no se pase de 100%
          }
          Q.state.set("player", p); // Actualizamos el estado de la nave
          this.entity.destroy(); // Destruimos el Debris
        }
      }
    });
  }
});

Q.component("hostile", {
  added: function(){
    this.entity.on("hit.sprite", this, function(collision){
      if(collision.obj.isA("Bullet")){
        collision.obj.destroy();
        var posX = this.entity.p.x; 
        var posY = this.entity.p.y;
        //paramX, paramY, paramScale, explode
        this.entity.stage.insert(new Q.Explosion(posX, posY, this.entity.p.scale/1.5, true));
        if(this.entity.p.name == "meteorite"){ // Si es un meteorito
          if(this.entity.p.scale >= 0.5){
            // paramX, paramY, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType, paramPlanet
            Q.stage().insert(new Q.Debris(posX, posY, this.entity.p.name, this.entity.p.sheet, this.entity.p.scale/2, 4, this.entity.p.movType, "Hostile", this.entity.p.planet));
            Q.stage().insert(new Q.Debris(posX, posY, this.entity.p.name, this.entity.p.sheet, this.entity.p.scale/2, 4, this.entity.p.movType, "Hostile", this.entity.p.planet));
          }  
        }else{ // Si no es un meteorito
          var rand = Math.round(Math.random());
          if(rand == 0){
            Q.stage().insert(new Q.Debris(posX, posY, "OxygenCharge", "oxygen", 1, 4, this.entity.p.movType, "Reward", this.entity.p.planet));
          }else{
            Q.stage().insert(new Q.Debris(posX, posY, "Screw", "screw", 1, 4, this.entity.p.movType, "Reward", this.entity.p.planet));
          }
        }
        this.entity.destroy();
      }
      else if (collision.obj.isA("Spaceship")){
        // Comparar que esté en 2D o en 3D (Comprobar escala)
        if(this.entity.p.movType == "2D" || this.entity.p.movType == "Orbit" || (this.entity.p.movType == "3D" && this.entity.p.scale >= 1.1 && this.entity.p.scale <= 1.3)){
          this.entity.stage.insert(new Q.Explosion(this.entity.p.x, this.entity.p.y, 0.4, true));
          // Empeoramos el estado de la nave
          if(this.entity.p.name == "meteorite"){
            collision.obj.wreckShip(Math.floor(20 * this.entity.p.scale));
          }
          else if(this.entity.p.name == "satellite"){
            collision.obj.wreckShip(10); 
          }
          this.entity.destroy();
        }      
      }
    });
  }
});

// Clase que representa el objeto Debris (corresponde a la basura espacial)
Q.Sprite.extend("Debris", {
  init:function(paramX, paramY, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType, paramPlanet){
    this._super({
      sheet: paramSheet,
      sprite: "debris_anim",
      x: paramX,
      y: paramY,
      scale: paramScale,
      name: paramName,
      // Falta paramdamage!
      opacity: 0,
      gravity: 0,
      t: 0, // Factor "tiempo"
      z: zIndex,
      movType: paramMovType,
      type: paramType
    });
    this.p.sensor=true;
    var components = '2d, animation, tween';
    if(this.p.movType == "2D"){
      components += ', debris2D';
    }
    else if(this.p.movType == "3D"){
      components += ', debris3D';
    }
    else if(this.p.movType == "Orbit"){
      this.p.planet = paramPlanet;
      components += ', orbit';
    }

    if(this.p.type == "Hostile"){
      components += ', hostile';
    }
    else if(this.p.type == "Reward"){
      components += ', reward';
    }
    this.add(components);
    // Común
    this.play("far_away"); // Por defecto
    this.animate({opacity: 1}, 2); // Hacemos que aparezca con fundido de entrada 
    this.animate({angle: -3000}, 80); // Hacemos que rote para más realismo
  },
  step: function(dt){
    this.stepDebris(dt); // this.p.type determina el comportamiento de movimiento de Debris
  }
});

Q.component("asteroidField",{
  added: function(){
    this.entity.p.cont = 30; // Hasta 30 asteroides
    this.entity.p.level = Q.state.get("level"); // Puede ser 2 ó 3 (2 -> Campo de asteroides, 3 -> Lluvia de meteoritos)
  },
  extend:{
    spawn: function(dt){
      if(this.p.cont > 0){
        console.log("Cont: " + this.p.cont);
        var x = Math.floor(Math.random() * 8000); // Un número aleatorio entre 0 y 7999
        x += Q.state.get("planets")["wormhole2"].x*2 + 1000; // Lo desplazamos a la posición correcta
        var debris;
        console.log("x: " + x);
        var y;
        if(this.p.level == 2){ // Si es un campo de asteroides
          // Crear meteoritos a partir de la posición y del player, y en un rango de posiciones x
          y = this.p.play.p.y + (Math.random() * 2 - 1)*screen.height/2;
          debris = new Q.Debris(x, y, "meteorite" , "debris1", 1, 4, "2D", "hostile");
          this.stage.insert(debris);
          this.p.cont--;
        }
        else if (this.p.level == 3 && this.p.t%100 == 0){ // Si es una lluvia de asteroides
          y = 0; // Vienen por arriba de la pantalla
          debris = new Q.Debris(x, y, "meteorite" , "debris1", 1, 4, "2D", "hostile");
          debris.p.vy = 30*Q.state.get("difficulty"); // Hacemos que caiga hacia abajo
          this.stage.insert(debris);
          this.p.cont--;
        } 
      }
    }
  }
});

Q.component("spawnerOrbit", {
  added: function(){
    this.entity.p.cont = this.entity.p.infoPlanet.nRewards;
  },
  extend:{
    spawn: function(dt){
      if(this.p.t%70 == 0){
        var debrisNum = Math.floor(Math.random() * 5) + 1;
        var debrisObj = Q.state.get('debris')[debrisNum];
        var scale = 0.5;
        if(debrisObj.name != "meteorite" && debrisObj.name != "satellite"){
          scale = 1;
        }
        // paramX, paramY, paramVx, paramVy, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType, paramPlanet
        this.stage.insert(new Q.Debris(this.p.x, this.p.y, debrisObj.name, debrisObj.sheet, scale, 4, "Orbit", debrisObj.type, this.entity.p.infoPlanet.planet));
        //this.stage.insert(new Q.OxygenCharge(this.p.x, this.p.y, true, this));
        this.p.nRewards--;
      }
    }
  }
});

Q.component("spawner2D", {
  added: function(){
    this.entity.p.cont = 15;
  },
  extend: {
    spawn: function(dt){
      if(this.p.movType != Q.state.get("dim")){ // En cuanto cambie la dimensión, lo eliminamos
        this.destroy();
      }
      var nPlanet = Q.state.get('nPlanet');
      // Cada 50 instantes creamos (o no) un nuevo objeto basura
      if(this.p.t%50 == 0 && this.p.cont > 0 && nPlanet == 0){
        var num = Math.round(Math.random()); //si num es igual a 0 inserta un objeto debris
        if(num == 0){
          //POSICIONAMIENTO
          var posX, posY;
          // Escogemos un Debris al azar
          var debrisNum = Math.floor(Math.random() * 5) + 1;
          var debrisObj = Q.state.get('debris')[debrisNum];
          posX = this.p.play.p.x + screen.width/2;
          posY = this.p.play.p.y + (Math.random() * 2 - 1)*screen.height/3;
          // paramX, paramY, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType
          Q.stage().insert(new Q.Debris(posX, posY, debrisObj.name , debrisObj.sheet, debrisObj.scale, 4, this.p.movType, debrisObj.type));
          this.p.cont--;
        }
      }
    }
  }
});

Q.component("spawner3D", {
  added: function(){
    this.entity.p.cont = 15;
  },
  extend: {
    spawn: function(dt){
      if(this.p.movType != Q.state.get("dim")){ // En cuanto cambie la dimensión, lo eliminamos
        this.destroy();
      }
      var nDebris = Q.state.get('numDebris');
      var nPlanet = Q.state.get('nPlanet');
      var planets = Q.state.get('planets');
      var planet = planets[nPlanet];
      // Cada 100 instantes creamos (o no) un nuevo objeto basura
      if(this.p.t%50 == 0 && this.p.cont > 0 && planet.g == 0){ // AQUÍ MEJOR COMPARAR CON .g == 0 
        var num = Math.round(Math.random()); //si num es igual a 0 inserta un objeto debris
        if(num == 0){
          //POSICIONAMIENTO
          var scale;
          var posX, posY;
          // Escogemos un Debris al azar
          var debrisNum = Math.floor(Math.random() * 5) + 1;
          var debrisObj = Q.state.get('debris')[debrisNum];
          // paramX, paramY, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType
          Q.stage().insert(new Q.Debris(this.p.x, this.p.y, debrisObj.name , debrisObj.sheet, 0.25*debrisObj.scale, 4, this.p.movType, debrisObj.type));
          this.p.cont--;
        }
      }
    }
  }
});

Q.Sprite.extend("DebrisSpawner", {
   init:function( player, paramDim, paramX, paramY, paramInfoPlanet){
    this._super({
      play: player,
      cont: 0,
      t: 0,
      movType: paramDim,
      x: paramX,
      y: paramY
    });

    // Separamos en casos
    if(this.p.movType == "2D"){
      this.add('spawner2D');
    }
    else if(this.p.movType == "3D"){
      this.add('spawner3D');
    }
    else if(this.p.movType == "Orbit"){
      this.p.infoPlanet = paramInfoPlanet;
      this.add('spawnerOrbit');
    }
    else if(this.p.movType == "Asteroids"){
      this.add('asteroidField');
    }

  },
  step: function(dt){
    this.p.t++;
    if(this.p.cont <= 0){
      this.destroy();
    }
    this.spawn(dt);
  }
});
// Clase que va introducionde objetos Debris de forma aleatoria
/*
Q.Sprite.extend("DebrisSpawner", {
  init:function( player, paramDim, paramX, paramY){
    this._super({
      play: player,
      cont: 0,
      t: 0,
      dim: paramDim,
      x: paramX,
      y: paramY
    });
  },
  step: function(dt){
    this.p.t++;
    if(this.p.dim != Q.state.get("dim")){ // En cuanto cambie la dimensión, lo eliminamos
      this.destroy();
    }
    var nDebris = Q.state.get('numDebris');
    var nPlanet = Q.state.get('nPlanet');
    var planets = Q.state.get('planets');
    var planet = planets[nPlanet];
    // Cada 100 instantes creamos (o no) un nuevo objeto basura
    if(this.p.t%50 == 0 && this.p.cont < nDebris && (nPlanet == 0 || planet.g == 0)){ // AQUÍ MEJOR COMPARAR CON .g == 0 
      var num = Math.round(Math.random()); //si num es igual a 0 inserta un objeto debris
      if(num == 0){
        //POSICIONAMIENTO
        var scale;
        var posX, posY;
        // Escogemos un Debris al azar
        var debrisNum = Math.floor(Math.random() * 5) + 1;
        var debrisObj = Q.state.get('debris')[debrisNum];

        if(this.p.dim == "2D"){
          scale = debrisObj.scale;
          posX = this.p.play.p.x + screen.width/2.5;
          posY = this.p.play.p.y + (Math.random() * 2 - 1)*screen.height/3;
        }
        else if(this.p.dim == "3D"){
          scale = 0.25*debrisObj.scale;
          posX = this.p.x;
          posY = this.p.y;
        }
        this.p.cont++;
        // paramX, paramY, paramName, paramSheet, paramScale, zIndex, paramMovType, paramType
        Q.stage().insert(new Q.Debris(posX, posY, debrisObj.name , debrisObj.sheet, scale, 4, this.p.dim, debrisObj.type));
      }
    }
  }
});*/

Q.Sprite.extend("Fondo", {
  init: function(asset) {
      this._super({
        w: Q.width,
        h: Q.height,
        x: Q.width / 2,
        y: Q.height / 2
      });
      this.p.asset = asset;
      this.size(true);
      this.scale = false;
  },
  step: function(dt){
    if (!this.scale){
      var scaleX = Q.width / this.p.w;
      var scaleY = Q.width / this.p.h;
      this.matrix.scale(scaleX, scaleX);
      this.scale = true;
    }
  }
});

Q.scene("RADAR", function(stage){

  var n = Q.state.get("nPlanet");

  if(n != 0){

    var planets = Q.state.get("planets");
    var distanceToRadius = Q.state.get("distanceToRadius");
    var planet = planets[n];

    var planetName = planet.name;
    var planetRadius = planet.r;
    var planetOrbit = planet.d;
    var planetGravity = planet.g;
    if(planetGravity == 0){
      planetGravity = "Infinite";
    }

    var textName = new Q.UI.Text({family: "ethnocentric",x: Q.width - 30, y: 40, label: "Planet: " + planetName, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "right"});
    var textRadius = new Q.UI.Text({family: "ethnocentric",x: Q.width - 30, y: 60, label: "Radius: " + planetRadius, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "right"});

    var textDistanceRadius = new Q.UI.Text({family: "ethnocentric",x: Q.width/2, y: 40, label: "Distance to core: " + distanceToRadius, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "center"});
    var textOrbit = new Q.UI.Text({family: "ethnocentric",x: Q.width/2, y: 60, label: "Orbit: " + planetOrbit, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "center"});
    var textGravity = new Q.UI.Text({family: "ethnocentric",x: Q.width/2, y: 80, label: "Gravity: " + planetGravity, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "center"});
    if(Q.state.get("dim") == "2D"){
      stage.insert(textName);
      stage.insert(textRadius);
      stage.insert(textDistanceRadius);
      stage.insert(textOrbit);
      stage.insert(textGravity);
    }
  }
});

Q.scene("HUD", function(stage){
  var n = Q.state.get("nPlanet");
  var planets = Q.state.get("planets");
  var planet = planets[n];
  if(planet.g != 0){
    var orbimeters = Q.state.get("orbimeters");
    var textOrbimeters = new Q.UI.Text({family: "ethnocentric", x: Q.width - 30, y: 10, label: "Orbimeters to Station: " + orbimeters, color: "#FFDA6C", outlineWidth: 3, size: 14, align: "right"});
    stage.insert(textOrbimeters);
  }
  
  // Datos de la nave
  var player = Q.state.get("player");
  var oxygen = player["oxygen"];
  var textOxygen = new Q.UI.Text({family: "ethnocentric", x: 30, y: 40, label: "Oxygen: " + oxygen + "%", color: "#FFDA6C", outlineWidth: 3, size: 14, align: "left"});
  stage.insert(textOxygen);

  var ship = player["shipHealth"];
  var textShip = new Q.UI.Text({family: "ethnocentric", x: 30, y: 60, label: "Ship: " + ship + "%", color: "#FFDA6C", outlineWidth: 3, size: 14, align: "left"});
  stage.insert(textShip);

  var fuel = player["fuel"];
  var textFuel = new Q.UI.Text({family: "ethnocentric", x: 30, y: 80, label: "Fuel: " + fuel + "%", color: "#FFDA6C", outlineWidth: 3, size: 14, align: "left"});
  stage.insert(textFuel);

  var blaster = player["blaster"];
  var textBlaster = new Q.UI.Text({family: "ethnocentric", x: 30, y: 100, label: "Blaster: " + blaster + "%", color: "#FFDA6C", outlineWidth: 3, size: 14, align: "left"});
  stage.insert(textBlaster);

  Q.state.on("change", function(){
    var p = Q.state.get("player");
    var orbimeters = Q.state.get("orbimeters");
    textOrbimeters.p.label = "Orbimeters to Station: " + orbimeters;
    textOxygen.p.label = "Oxygen: " + p.oxygen + "%";
    textShip.p.label = "Ship: " + p.shipHealth + "%";
    textFuel.p.label = "Fuel: " + p.fuel + "%";
    textBlaster.p.label = "Blaster: " + p.blaster + "%";
  });

});

Q.load(["space_station1.png", "space_station2.png", "space_station3.png", "explosion.json","explosion.png", "Starship_Pilot.png", "Space_Captain.png", "Space_Commander.png", "fireAux.mp3","explosion.mp3", "interstellar.mp3", "godmode.mp3", "spaceship.png", "spaceship.json", "1.png","2.png", "3.png","4.png","5.png","6.png","7.png",
  "8.png","blackhole.png", "quarterStarfield.png",
  "quarterStarfield2.png", "vortex.png", "wormhole.png",
  "interiorCircularInfluence.png", "exteriorCircularInfluence.png",
  "bgProst.png", "fondo.png", "fondo2.png", "debris1.png",
  "debris2.png", "debris1.json", "debris2.json", "bullet.png","screw.png", "screw.json", "fuel.png", "fuel.json", "oxygen.png", "oxygen.json", "leftarrow.png", "rightarrow.png"], function(){
        Q.compileSheets("spaceship.png", "spaceship.json");
        Q.compileSheets("explosion.png", "explosion.json");
        Q.compileSheets("debris1.png", "debris1.json");
        Q.compileSheets("debris2.png", "debris2.json");
        Q.compileSheets("oxygen.png", "oxygen.json");
        Q.compileSheets("fuel.png", "fuel.json");
        Q.compileSheets("screw.png", "screw.json");
    
    Q.stageScene("menu");
    
    Q.debug = false;
});


Q.scene("level1",function(stage) {
      stage.insert(new Q.Repeater({ asset: "bgProst.png", speedX: 0.2, speedY: 0.2, type: 0 }));
      // Creamos los astros
      createPlanets(stage);
      // La nave
      var Spaceship = stage.insert(new Q.Spaceship(200, 520, 20, 0, 10, "2D"));
      // Y el spawner en 2D
      var spawner = stage.insert(new Q.DebrisSpawner(Spaceship, "2D"));
      // Seguimos el movimiento de la nave
      stage.add("viewport").follow(Spaceship,{ x: true, y: false });
});

Q.scene("Intro",function(stage) {
     
  // A los 2 segundos, comienza el diálogo
      Q.Dialogue.play("1");
  
  var s1, s2, s3;


  // Serie de explosiones en el satélite
  setTimeout(function(){
      stage.insert(new Q.Explosion(Q.width/3+50, Q.height/3+20, 0.5, "explode"));
      s2.animate({angle: 60, y: s1.p.y - 100, x: s1.p.x + 120}, 40);
  }, 14000);
  setTimeout(function(){
      stage.insert(new Q.Explosion(Q.width/2+20, Q.height/3+10, 0.3, "explode"));
      
  }, 15000);
  setTimeout(function(){
      stage.insert(new Q.Explosion(Q.width/2, Q.height/2, 0.8, "explode"));
      s1.animate({angle: -20, y: s1.p.y - 100, x: s1.p.x + 120}, 40);
      s3.animate({angle: 40, y: s1.p.y - 100, x: s1.p.x - 120}, 40);
  }, 16000);


  // Hacemos que desaparezcan las partes del satélite con fundido de salida
  setTimeout(function(){
      s1.animate({opacity: 0}, 2);
      s2.animate({opacity: 0}, 2);
      s3.animate({opacity: 0}, 2);
  }, 50000);

  var button = stage.insert(new Q.UI.Button({x: screen.width/2, y: screen.height/2,fill: "#CCCCCC", w: screen.width, h: screen.height, asset: "bgProst.png"}));
  
  var s2 = stage.insert(new Q.Station(Q.width/2, Q.height/2, "space_station2.png"));
  var s1 = stage.insert(new Q.Station(Q.width/2, Q.height/2, "space_station1.png"));
  var s3 = stage.insert(new Q.Station(Q.width/2, Q.height/2, "space_station3.png"));
  
  button.on("click",function() {
    Q.clearStages();

    Q.state.reset({
      dim: "2D",
      nPlanet: 0, // Índice del planeta detectado por el radar
      planets: { // Coordenadas, distancia de órbita, radio del planeta
        0: {},
        1: { x: 2000, y: 330, d: 400, r: 130, name: "Fiery", g: 9.8, n: 3},
        2: { x: 6000, y: 330, d: 450, r: 160, name: "Reddy", g: 6, n: 2},
        wormhole : { x: 10540, y: 330, d: 850, r: 10, name: "Gargantua", g: 0},
        // Al pasar el agujero, se multiplica x 2 la spaceship.p.x
        // Lluvia de meteoritos en 21000
        3: { x: 26840, y: 330, d: 500, r: 210, name: "Greeny", g: 4, n: 5},
        4: { x: 34040, y: 330, d: 350, r: 250, name: "Veggie", g: 8, n: 4},
        wormhole2: { x: 42000, y: 330, d: 850, r: 10, name: "Ssakcalb", g: 0},
        // Al pasar el agujero, se multiplica x 2 la spaceship.p.x
        // Lluvia de meteoritos un poco más difícil en 84000
        5: { x: 950040, y: 530, d: 600, r: 300, name: "Bluey", g: 2, n: 6},
        6: { x: 100200, y: 230, d: 400, r: 125, name: "Stormzy", g: 10, n: 1},
        7: { x: 110200, y: 30, d: 700, r: 350, name: "Purply", g: 12, n: 0}
      },
      debris: {
        1: {name: 'meteorite', scale: 1, sheet: "debris1", damage: 30, type: "Hostile"},
        2: {name: 'satellite', scale: 1, sheet: "debris2", damage: 50, type: "Hostile"},
        3: {name: 'OxygenCharge', scale: 1, sheet: "oxygen", type: "Reward"},
        4: {name: 'Fuel', scale: 1, sheet: "fuel", type: "Reward"},
        5: {name: 'Screw', scale: 1, sheet: "screw", type: "Reward"}
      },
      numDebris: 10,
      orbits: { // Estos datos se rellenan al crear la partida. Dependen de planets
        1: {x1: 0, x2: 0},
        2: {x1: 0, x2: 0},
        3: {x1: 0, x2: 0},
        4: {x1: 0, x2: 0},
        5: {x1: 0, x2: 0},
        6: {x1: 0, x2: 0},
        7: {x1: 0, x2: 0},
        wormhole: {x1: 0, x2: 0}
      },
      eventHorizon: undefined,
      player: {
        oxygen: 100, // Oxígeno de la nave
        shipHealth: 100, // Estado de reparación de la nave
        fuel: 100, // Combustible
        blaster: 100 // Munición. Se recarga con la energía estelar (con el tiempo)
      },
      orbimeters: 130000,
      distanceToRadius: 0,
      minDistanceX: 0,
      level: 1,
      modoDios: "on",
      audio: "on",
      difficulties: ['LOW', 'MEDIUM', 'HIGH'],
      difficulty: 0
    });
  
    Q.stageScene('level1', 0);
    Q.stageScene('HUD', 2);
    Q.stageScene('RADAR', 3);

  });
});

Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));

  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }));         
  var label = container.insert(new Q.UI.Text({x:5, y: -10 - button.p.h, 
                                                   label: stage.options.label, color: "#FFFFFF" }));
  button.on("click",function() {
    Q.clearStages();
    Q.audio.stop();
    //Q.state.reset({score: 0, Spaceship: " ", game: "playing", lifePoints: 5, hint: "Hint: find the power of the Gods"});
    //Q.audio.play('music_main.mp3',{ loop: true });
    Q.stageScene('level1', 0);
    //Q.stageScene('playerScene', 3);
    Q.stageScene('HUD', 2);
    Q.stageScene('RADAR', 3);
  });


  container.fit(20);
});


Q.scene('menu',function(stage) {
  var fondo = stage.insert(new Q.Fondo("fondo.png"));

  var musicTextLabel = stage.insert(new Q.UI.Text({x: Q.width/2 - 100,y: (Q.height/2), label: "Music", family: "ethnocentric",color: "#FFFFFF"}));
  var difTextLabel = stage.insert(new Q.UI.Text({x: Q.width/2 - 100 ,y: (Q.height/2) +80, label: "Difficulty", family: "ethnocentric",color: "#FFFFFF"}));
  var godTextLabel = stage.insert(new Q.UI.Text({x: Q.width/2 - 100 ,y: (Q.height/2) +160, label: "God Mode", family: "ethnocentric",color: "#FFFFFF"}));

  var musicLabel = stage.insert(new Q.UI.Text({x: Q.width/2 + 150,y: Q.height/2, label: "ON", family: "ethnocentric",color: "#FFFFFF"}));
  var difLabel = stage.insert(new Q.UI.Text({x: Q.width/2 + 150 ,y: Q.height/2 +80, label: "LOW", family: "ethnocentric",color: "#FFFFFF"}));
  var godLabel = stage.insert(new Q.UI.Text({x: Q.width/2 + 150 ,y: Q.height/2 +160, label: "OFF", family: "ethnocentric",color: "#FFFFFF"}));

  var buttonLM = stage.insert(new Q.UI.Button({x: musicLabel.p.x - 80, y: musicLabel.p.y+15, w: 50, h: 50, asset:"leftarrow.png" }));
  var buttonRM = stage.insert(new Q.UI.Button({x: musicLabel.p.x + 80, y: musicLabel.p.y+15, w: 50, h: 50, asset:"rightarrow.png" }));
  var buttonLL = stage.insert(new Q.UI.Button({x: difLabel.p.x - 110, y: difLabel.p.y+15, w: 50, h: 50, asset:"leftarrow.png" }));
  var buttonRL = stage.insert(new Q.UI.Button({x: difLabel.p.x + 110, y: difLabel.p.y+15, w: 50, h: 50, asset:"rightarrow.png" }));
  var buttonLG = stage.insert(new Q.UI.Button({x: godLabel.p.x - 110, y: godLabel.p.y+15, w: 50, h: 50, asset:"leftarrow.png" }));
  var buttonRG = stage.insert(new Q.UI.Button({x: godLabel.p.x + 110, y: godLabel.p.y+15, w: 50, h: 50, asset:"rightarrow.png" }));

  var enterText = stage.insert(new Q.UI.Button({x: screen.width/2+30, y: difLabel.p.y + 180, label: "Press ENTER to START", font: "ethnocentric", keyActionName: "confirm"}));

  enterText.on("click",function(){
    Q.stageScene('Intro', 0);
  });

  buttonLM.on("click",function() {
    var m = Q.state.get('audio');
    if(m == 'on'){
      Q.state.set('audio', "off");
      musicLabel.p.label = "OFF";
    }else{
      Q.state.set('audio', "on");
      musicLabel.p.label = "ON";
    }
  });

  buttonRM.on("click",function() {
    var m = Q.state.get('audio');
    if(m == 'on'){
      Q.state.set('audio', "off");
      musicLabel.p.label = "OFF";
    }else{
      Q.state.set('audio', "on");
      musicLabel.p.label = "ON";
    }
  });

  buttonLL.on("click",function() {
    var num = Q.state.get('difficulty');
    if(num > 0){
      num--;
    }else {
      num = 2;
    }
    Q.state.set('difficulty', num);
      var text =  Q.state.get('difficulties')[num];
      difLabel.p.label = text;
  });

  buttonRL.on("click",function() {
    var num = Q.state.get('difficulty');
    if(num < 2){
      num++;
    }else {
      num = 0;
    }
    Q.state.set('difficulty', num);
    var text =  Q.state.get('difficulties')[num];
    difLabel.p.label = text;
  });

  buttonLG.on("click",function() {
    var m = Q.state.get('modoDios');
    if(m == 'on'){
      Q.state.set('modoDios', "off");
      godLabel.p.label = "OFF";
      fondo.p.asset = "fondo.png";
      Q.audio.stop('godmode.mp3');
    }else{
      Q.state.set('modoDios', "on");
      godLabel.p.label = "ON";
      fondo.p.asset = "fondo2.png";
      if(Q.state.get('audio') == 'on'){
        Q.audio.play('godmode.mp3',{ loop: true });
      }
    }
  });

  buttonRG.on("click",function() {
    var m = Q.state.get('modoDios');
    if(m == 'on'){
      Q.state.set('modoDios', "off");
      godLabel.p.label = "OFF";
      fondo.p.asset = "fondo.png";
      Q.audio.stop('godmode.mp3');
    }else{
      Q.state.set('modoDios', "on");
      godLabel.p.label = "ON";
      fondo.p.asset = "fondo2.png";
      if(Q.state.get('audio') == 'on'){
        Q.audio.play('godmode.mp3',{ loop: true });
      }
    }
  });

});
}
