var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Spawner = function (game_state, name, position, properties) {
    "use strict";
    //Mst.Prefab.call(this, game_state, position, properties);
    
    this.game_state = game_state;
    this.properties = properties;
    this.position = position;
    
    this.pool = this.game_state.groups[properties.pool];
    
    this.spawn_time = properties.spawn_time;
    
    this.spawn_timer = this.game_state.time.create();
    this.schedule_spawn();
};

Mst.Spawner.prototype = Object.create(Mst.Prefab.prototype);
Mst.Spawner.prototype.constructor = Mst.Spawner;

Mst.Spawner.prototype.schedule_spawn = function () {
    "use strict";
    var time;
    // add a new spawn event with random time between a range
    time = this.game_state.rnd.between(this.spawn_time.min, this.spawn_time.max);
    this.spawn_timer.add(Phaser.Timer.SECOND * time, this.spawn, this);
    this.spawn_timer.start();
};

Mst.Spawner.prototype.spawn = function () {
    "use strict";
    var object_name, object_position, object;
    // get new random position and velocity
    object_position = new Phaser.Point(this.game_state.rnd.between(-70, 70) + this.position.x, this.game_state.rnd.between(-70, 70) + this.position.y);
    // get first dead object from the pool
    object = this.pool.getFirstDead();
    
    //console.log(this.pool.countLiving());
    
    if (this.pool.countLiving() < 5) {
        if (!object) {
            // if there is no dead object, create a new one
            //object_name = "object_" + this.pool.countLiving();
            object_name = "object_" + this.pool.countLiving();
            object = this.create_object(object_name, object_position, this.properties);
        
        } else {
            // if there is a dead object, reset it to the new position and velocity
            object.reset(object_position);
        }
    }
    
    // schedule next spawn
    this.schedule_spawn();
};
