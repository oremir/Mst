var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Spawner = function (game_state, name, position, properties) {
    "use strict";
    
    properties.texture = "blank_image";
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state = game_state;
    this.properties = properties;
    this.position = position;
    
    this.etype = "enemy";
    this.group = properties.group;
    this.pool = this.game_state.groups[properties.pool];
    this.game_state.groups[this.group].add(this);
    
    this.pool_animal = this.game_state.groups["wildanimals"];
    
    this.game_state.prefabs[name] = this;
    this.name = name;
    
    this.spawn_time = {
        min: +properties.spawn_time_min,
        max: +properties.spawn_time_max
    };
    
    var max_level = 4;
    
    if (typeof(properties.level) !== 'undefined') {
        if (properties.level > max_level) {
            this.level = max_level;
        } else {
            this.level = properties.level;
        }
    } else {
        this.level = max_level;
    }
    
    if (typeof(properties.spec) !== 'undefined') {
        this.spec = properties.spec;
    } else {
        this.spec = "";
    }
    
    console.log("Spec: " + this.spec);
    
    this.xdif = parseInt(properties.xdif)*16;
    this.ydif = parseInt(properties.ydif)*16;
    
    this.spawn_timer = this.game_state.time.create();
    this.spawn_timer_animal = this.game_state.time.create();

    this.wave_count = 0;
    this.wave_num = 0;
    this.wave_max = 3;
    this.wave_mmax = 6;
    this.wave_time = 0;
};

Mst.Spawner.prototype = Object.create(Mst.Prefab.prototype);
Mst.Spawner.prototype.constructor = Mst.Spawner;

Mst.Spawner.prototype.schedule_spawn = function (time) {
    "use strict";
    // add a new spawn event with random time between a range
    time += this.game_state.rnd.between(this.spawn_time.min, this.spawn_time.max);
    
    this.spawn_timer.add(Phaser.Timer.SECOND * time, this.spawn, this);
    this.spawn_timer.start();
};

Mst.Spawner.prototype.activate = function () {
    "use strict";
    
    this.spawn();
    
    console.log("Spawn level: " + this.level);
    if (this.level > 1 && this.spec === "") {
        this.spawn_animal();
    }
};

Mst.Spawner.prototype.schedule_spawn_animal = function (time) {
    "use strict";
    // add a new spawn event with random time between a range
    time += this.game_state.rnd.between(this.spawn_time.min, this.spawn_time.max);
    
    this.spawn_timer_animal.add(Phaser.Timer.SECOND * time, this.spawn_animal, this);
    this.spawn_timer_animal.start();
};

Mst.Spawner.prototype.spawn = function () {
    "use strict";
    var object_name, object_position, object, time;
    
    time = 0;
    
    // get new random position and velocity
    object_position = new Phaser.Point(this.game_state.rnd.between(-this.xdif, this.xdif) + this.position.x, this.game_state.rnd.between(-this.ydif, this.ydif) + this.position.y);
    // get first dead object from the pool
    object = this.pool.getFirstDead();
    
    console.log("Enemy count living:" + this.pool.countLiving() + " Wave max: " + this.wave_max + " N: " + this.wave_num);
    
    if (this.pool.countLiving() < this.wave_max) {
        if (!object) {
            // if there is no dead object, create a new one            
            
            object_name = "enemy_" + this.pool.countLiving();
            object = this.create_object(object_name, object_position, this.properties);
            
            console.log("New enemy: " + object_name);
        
        } else {
            // if there is a dead object, reset it to the new position and velocity
            object.reset(object_position);
            
            console.log("Reset enemy: " + object.name);
        }
        this.wave_time += this.wave_count*3;
        this.wave_num++;
        if (this.wave_num >= this.wave_max) {
            this.wave_num = 0;
            this.wave_count++;
            if (this.wave_max < this.wave_mmax) {
                this.wave_max++;
            }
            
            time = this.wave_time*2 + this.wave_count*5 + this.game_state.rnd.between(this.spawn_time.min, this.spawn_time.max)*3;
            
            console.log("New enemy wave: " + this.wave_count + " Time: " + time);
        }
    }
    
    // schedule next spawn
    this.schedule_spawn(time);
};

Mst.Spawner.prototype.spawn_animal = function () {
    "use strict";
    var object_name, object_position, object, time, properties;
    
    properties = this.properties;
    properties.group = "wildanimals";
    properties.pool = "wildanimals";
    
    time = 0;
    
    // get new random position and velocity
    object_position = new Phaser.Point(this.game_state.rnd.between(-this.xdif, this.xdif) + this.position.x, this.game_state.rnd.between(-this.ydif, this.ydif) + this.position.y);
    // get first dead object from the pool
    object = this.pool_animal.getFirstDead();
    
    console.log("Wild Animal count living:" + this.pool_animal.countLiving());
    
    if (this.pool_animal.countLiving() < this.wave_mmax) {
        if (!object) {
            // if there is no dead object, create a new one            
            
            object_name = "animal_" + this.pool_animal.countLiving();
            object = this.create_animal(object_name, object_position, properties);
            
            console.log("New animal: " + object_name);
        
        } else {
            // if there is a dead object, reset it to the new position and velocity
            object.reset(object_position);
            
            console.log("Reset animal: " + object.name);
        }
    }
    
    // schedule next spawn
    this.schedule_spawn_animal(time);
};

Mst.Spawner.prototype.create_animal = function (name, position, properties) {
    "use strict";
    
    // return new Enemy with random frame
    
    switch (this.game_state.game.rnd.between(1, this.level)) {
        case 1:
            properties.texture = "doe_spritesheet";
        break;
        default:
            properties.texture = "doe_spritesheet";
        break;
    }
    
    return new Mst.WildAnimal(this.game_state, name, position, properties);
};
