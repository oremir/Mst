var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.ItemSpawner = function (game_state, name, position, properties) {
    "use strict";
    var item;
    
    //Mst.Prefab.call(this, game_state, position, properties);
    
    this.game_state = game_state;
    this.properties = properties;
    this.position = position;
    
    this.pool = this.game_state.groups[properties.pool];
    
    this.items = [];
    
    for (var i = 0; i < this.game_state.core_data.items.length; i++) {
        //console.log(this.game_state.core_data.items[i].properties.spawn);
        if (this.game_state.core_data.items[i].properties.spawn !== undefined) {
            item = {
                frame: i,
                obj: this.game_state.core_data.items[i]
            };
            this.items.push(item);
        }
    }
    //console.log(this.items);
    this.b_test = false;
    
    this.j = 0;
    
    this.spawn();
};

Mst.ItemSpawner.prototype = Object.create(Mst.Prefab.prototype);
Mst.ItemSpawner.prototype.constructor = Mst.ItemSpawner;

Mst.ItemSpawner.prototype.spawn = function () {
    "use strict";
    var object_name, object_position, object, index, frame, itst, x, y, dist;
    // get new random position
    object_position = new Phaser.Point(this.game_state.rnd.between(-120, 220) + this.position.x, this.game_state.rnd.between(-120, 120) + this.position.y);
    
    // return new Item with random frame
    
    index = this.game_state.game.rnd.between(0, this.items.length - 1);
    frame = this.items[index].frame;
    console.log("I"+index+"F"+frame);
    
    // get first dead object from the pool
    object = this.pool.getFirstDead();
    
    //console.log("Item count living:" + this.pool.countLiving());
    
    if (this.j < 20) {
        if (!object) {
            // if there is no dead object, create a new one            
            
            object_name = this.create_name();
            object = this.create_object(object_name, object_position, this.properties);
            
            console.log("New item: " + object_name);
        } else {
            // if there is a dead object, reset it to the new position and velocity
            object.reset(object_position);
            
            console.log("Reset item: " + object.name);
        }
        //console.log(object);
        
        var a = this.game_state.layers.collision.getTiles(object.x, object.y, 3, 3);
        var b = false;
        //console.log(a);
        a.forEach(function(tile) {
            //console.log(tile.canCollide);
            if (tile.canCollide !== null) {
                b = true;
            }
        });
        //console.log(b);
        //var testik = chest_new.collide_test();
        
        this.b_test = false;
        
        this.game_state.groups.chests.forEachAlive(function(one_chest) {
            this.game_state.game.physics.arcade.overlap(object, one_chest, this.test, null, this);
        }, this);
        
        //console.log(this.b_test);
        b = b || this.b_test;
        //console.log(b);        
        
        this.game_state.map_data.objects.forEach(function (map_object) {
            x = map_object.x;
            y = map_object.y;
            dist = this.game_state.game.physics.arcade.distanceToXY(object, x, y, this);
            //console.log(dist);
            if (dist < 40) {
                //console.log(dist);
                b = true;
            }
        }, this);
        
        
//        this.pool.forEachAlive(function(ob) {
//            if (ob.name !== object.name) {
//                console.log(ob);
//                if (ob.overlap(object)) {                    
//                    b = true;
//                    console.log(b);
//                }
//            }
//        });
        
        //console.log(b);
        
        if (!b) {                        



            object.stats.items = "";
            object.closed_frame = frame;
            object.opened_frame = frame;
            object.frame = frame;
            //object.updated = true;

            if (object.closed_frame == 22) {
                object.is_takeable = false;
                object.save.properties.is_takeable = false;
            } else {
                object.is_takeable = true;
                object.save.properties.is_takeable = true;              
            }



        } else {
            console.log("Item killed / collision");
            object.kill();
        }
        
        
        
        
//                   object.stats.items = "";
//            object.closed_frame = frame;
//            object.opened_frame = frame;
//            object.frame = frame;
//            //object.updated = true;
        
        

        
        // next spawn
        this.spawn();
    }
};

Mst.ItemSpawner.prototype.create_object = function (name, position, properties) {
    "use strict";
        
    return new Mst.Chest(this.game_state, name, position, properties);
};

Mst.ItemSpawner.prototype.create_name = function () {
    "use strict";
    var name, a;
    var names = [];
    //var j = this.pool.countLiving();
    var object_name = "item_" + this.j;
    
    //console.log(this.game_state.map_data.objects);
    //console.log(this.game_state.map_data.objects.length);
    
    for (var i = 0; i < this.game_state.map_data.objects.length; i++) {
        //console.log(i);
        //console.log(this.game_state.map_data.objects[i].name);
        name = this.game_state.map_data.objects[i].name;
        a = name.split("_");
        names.push(parseInt(a[1]));
    }
      
    names.sort(function(a, b){return a - b});
      
    //console.log(names);
    
    while (names.indexOf(this.j) > -1) {
        this.j++;
    }
    
    var object_name = "item_" + this.j;
    
//    for (var i = 0; i < names.length; i++) {
//        //console.log(object_name + " " + names[i]);
//        if (j == names[i]) {
//            //console.log(object_name);
//            j++;
//            object_name = "item_" + j;
//            console.log("Prefab exist? " + object_name);
//            console.log(this.game_state.prefabs[object_name]);
//            if (typeof(this.game_state.prefabs[object_name] !== 'undefined')) {
//                j++;
//                object_name = "item_" + j;
//            }
//        }
//    }
    
    this.j++;
    
    return object_name;
};

Mst.ItemSpawner.prototype.test = function () {
    "use strict";

        //console.log("Overlap!");
        this.b_test = true;
};
