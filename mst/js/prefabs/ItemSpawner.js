var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.ItemSpawner = function (game_state, name, position, properties) {
    "use strict";
    var item;
    
    properties.texture = "blank_image";
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    properties.texture = "items_spritesheet";
    
    this.game_state = game_state;
    this.properties = properties;
    this.position = position;
    
    this.group = properties.pool || properties.group;
    this.pool = this.game_state.groups[properties.pool];
    this.game_state.groups[this.group].add(this);
    
    this.game_state.prefabs[name] = this;
    this.name = name;
    
    this.xdif = parseInt(properties.xdif)*16;
    this.ydif = parseInt(properties.ydif)*16;
    
    this.items = [];
    this.stype = properties.stype;
    
    for (var i = 0; i < this.game_state.core_data.items.length; i++) {
        //console.log(this.game_state.core_data.items[i].properties.spawn);
        var spawn = this.game_state.core_data.items[i].properties.spawn;
        if (spawn !== undefined) {
            if (this.stype === spawn || spawn === "uni") {
                item = {
                    frame: i,
                    obj: this.game_state.core_data.items[i]
                };
                this.items.push(item);
            }
        }
    }
    //console.log(this.items);
    
    if (typeof(properties.max_number) !== 'undefined') {
        this.max_number = parseInt(properties.max_number);
    } else {
        this.max_number = 20;
    }
    
    this.b_test = false;
    
    this.j = 0;
    this.k = 0;
    
    this.spawn();
};

Mst.ItemSpawner.prototype = Object.create(Mst.Prefab.prototype);
Mst.ItemSpawner.prototype.constructor = Mst.ItemSpawner;

Mst.ItemSpawner.prototype.spawn = function () {
    "use strict";
    var object_name, object_position, object, index, frame, itst, x, y, tilex, tiley, tile, dist;
    // get new random position
    object_position = new Phaser.Point(this.game_state.rnd.between(-this.xdif, this.xdif) + this.position.x, this.game_state.rnd.between(-this.ydif, this.ydif) + this.position.y);
    
    // return new Item with random frame
    
    index = this.game_state.game.rnd.between(0, this.items.length - 1);
    frame = this.items[index].frame;
    console.log("I"+index+"F"+frame);
    
    // get first dead object from the pool
    object = this.pool.getFirstDead();
    
    //console.log("Item count living:" + this.pool.countLiving());
    
    if (this.j < this.max_number && this.k < (this.max_number*2)) {
        tilex = this.game_state.layers.collision.getTileX(object_position.x);
        tiley = this.game_state.layers.collision.getTileX(object_position.y);
        tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.collision);
        console.log(object_position.x + ">" + tilex*16 + "|" + object_position.y + ">" + tiley*16);
        console.log(tile);
        
        object_position.x = tilex*16 + 8;
        object_position.y = tiley*16 + 8;
        
        var b = false;
        
        if (tile === null) {
            b = false;
        } else {
            b = true;
            console.log("Item not created / collision tile");
        }
        
        this.game_state.map_data.objects.forEach(function (map_object) {
            //console.log(map_object.x+"|"+map_object.y);
            x = parseInt(map_object.x);
            y = parseInt(map_object.y);
            //console.log(Math.pow((x - object_position.x),2) + Math.pow((y - object_position.y),2));
            dist = Math.sqrt(Math.pow((x - object_position.x),2) + Math.pow((y - object_position.y),2));
            console.log("Dist: "+dist);
            if (dist < 40) {
                //console.log("Item not created / collision dist");
                b = true;
            }
        }, this);
        
        if (b) {
            console.log("Item not created / collision dist");
        }
        
        if (!b) {
            this.properties.spawn_field_ind = this.calc_spawn_field_ind(tilex, tiley);
        
        
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

//            this.game_state.map_data.objects.forEach(function (map_object) {
//                x = map_object.x;
//                y = map_object.y;
//                dist = this.game_state.game.physics.arcade.distanceToXY(object, x, y, this);
//                console.log("Dist: "+dist);
//                if (dist < 40) {
//                    //console.log(dist);
//                    b = true;
//                }
//            }, this);


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
        }
        
        this.k++;
                
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

Mst.ItemSpawner.prototype.calc_spawn_field_ind = function (tilex, tiley) {
    "use strict";
    var xzero, yzero, xdifmax, x, y, ind;
    
    xzero = Math.floor((this.position.x - this.xdif)/16);
    yzero = Math.floor((this.position.y - this.ydif)/16);
    xdifmax = this.xdif/8;
    x = tilex - xzero;
    y = tiley - yzero;
    ind = y*xdifmax + x;

    console.log("xdifmax:"+xdifmax+" X0:"+xzero+"Y0:"+yzero+" X"+tilex+"|"+x+"Y"+tiley+"|"+y+" Ind:"+ind);

    return ind;
};

Mst.ItemSpawner.prototype.test = function () {
    "use strict";

        //console.log("Overlap!");
        this.b_test = true;
};
