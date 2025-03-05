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
    this.pool = this.game_state.mGame.groups[properties.pool];
    this.game_state.mGame.groups[properties.group].add(this);
    
    this.game_state.prefabs[name] = this;
    this.name = name;
    
    this.etype = "item";
    
    this.xdif = parseInt(properties.xdif)*16;
    this.ydif = parseInt(properties.ydif)*16;
    
    this.spawnernum = name.substr(11, 2);
    console.log(this.spawnernum);
    
    this.items = [];
    this.stype = properties.stype;
    
    for (let i in this.game_state.gdata.core.items) {
        const spawn = this.game_state.gdata.core.items[i].properties.spawn;
        console.log(i, spawn);
        if (spawn) {
            if (this.stype === spawn || spawn === "uni") {
                item = {
                    frame: parseInt(i),
                    obj: this.game_state.gdata.core.items[i]
                };
                this.items.push(item);
            }
        }
    }
    console.log(this.items);
    
    this.max_number = 20;
    if (properties.max_number) this.max_number = parseInt(properties.max_number);
    
    this.b_test = false;
    
    this.j = 0;
    this.k = 0;
    
    this.spawn();
};

Mst.ItemSpawner.prototype = Object.create(Mst.Prefab.prototype);
Mst.ItemSpawner.prototype.constructor = Mst.ItemSpawner;

Mst.ItemSpawner.prototype.spawn = function () {
    "use strict";
    var itst, x, y, tilex, tiley, tile, dist;
    
    // return new Item with random frame
    
    const index = this.game_state.game.rnd.between(0, this.items.length - 1);
    const frame = this.items[index].frame;
    console.log("I"+index+"F"+frame);
        
    if (this.j < this.max_number && this.k < (this.max_number*2)) {
        //console.log(this.game_state.layers);
        
        // get new random position
        const object_position = new Phaser.Point(this.game_state.rnd.between(-this.xdif, this.xdif) + this.position.x, this.game_state.rnd.between(-this.ydif, this.ydif) + this.position.y);
        
        let b = false;
        let tilex = 0;
        let tliey = 0;
                
        if (this.game_state.layers.grass) {
            tilex = this.game_state.layers.grass.getTileX(object_position.x);
            tiley = this.game_state.layers.grass.getTileY(object_position.y);
            const tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.grass);
            console.log("Grass: " + object_position.x + ">" + tilex*16 + "|" + object_position.y + ">" + tiley*16);
            console.log(tile);
            
            if (tile === null) {
                b = true;
                console.log("Item not created / not grass tile");
            } else {
                b = false;
            }
        } else {
            tilex = this.game_state.layers.collision.getTileX(object_position.x);
            tiley = this.game_state.layers.collision.getTileY(object_position.y);
            const tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.collision);
            console.log(object_position.x + ">" + tilex*16 + "|" + object_position.y + ">" + tiley*16);
            console.log(tile);
            
            if (tile === null) {
                b = false;
            } else {
                b = true;
                console.log("Item not created / collision tile");
            }
        }
        
        object_position.x = tilex*16 + 8;
        object_position.y = tiley*16 + 8;        
        
        //this.properties.spawn_field_ind = this.calc_spawn_field_ind(tilex, tiley);

        if (!b) this.new_item(frame, object_position, 0);
        
        this.k++;
                
        // next spawn
        
        this.spawn();
                
    }
};

Mst.ItemSpawner.prototype.new_item = function (frame, object_position, cond) {
    "use strict";
    
    // get first dead object from the pool
    let object = this.pool.getFirstDead();
    
    //console.log("Item count living:" + this.pool.countLiving());
        
    let b = false;
    
    if (cond === 0) {
        console.log(this.game_state.gdata.map.objects);
        this.game_state.gdata.map.objects.forEach(function (map_object) {
            //console.log(map_object.x+"|"+map_object.y);
            const x = parseInt(map_object.x);
            const y = parseInt(map_object.y);
            //console.log(Math.pow((x - object_position.x),2) + Math.pow((y - object_position.y),2));
            const dist = Math.sqrt(Math.pow((x - object_position.x),2) + Math.pow((y - object_position.y),2));
            //console.log("Dist: "+dist);
            if (dist < 40) {
                //console.log("Item not created / collision dist");
                b = true;
            }
        }, this);
    } else {
        b = false;
    }
    
    const tilex = this.game_state.layers.background.getTileX(object_position.x);
    const tiley = this.game_state.layers.background.getTileY(object_position.y);
    
    if (this.game_state.getGridXY(tilex, tiley) === 1) {
        b = true;
        console.log("Item grid collision");
    }

    if (!b) {
        if (!object) {
            // if there is no dead object, create a new one            

            const object_name = this.create_name();
            const properties = this.properties;
            properties.opened_frame = frame;
            properties.closed_frame = frame;
            object = this.create_object(object_name, object_position, properties);

            console.log("New item: " + object_name);
        } else {
            // if there is a dead object, reset it to the new position and velocity
            object.reset(object_position);

            console.log("Reset item: " + object.name);
        }
        console.log(object);

        if (cond === 0) {
            const a = this.game_state.layers.collision.getTiles(object.x, object.y, 3, 3);

            //console.log(a);
            a.forEach(function(tile) {
                //console.log(tile.canCollide);
                if (tile.canCollide !== null) {
                    b = true;
                }
            });
            console.log(b);
            //var testik = chest_new.collide_test();

            this.b_test = false;

            this.game_state.mGame.groups.chests.forEachAlive(function(one_chest) {
                this.game_state.game.physics.arcade.overlap(object, one_chest, this.test, null, this);
            }, this);

            console.log(this.b_test);
            b = b || this.b_test;
        } else {
            b = false;
        }
        
        console.log(b);

//            this.game_state.gdata.map.objects.forEach(function (map_object) {
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
            object.mChest.closed_frame = frame;
            object.mChest.opened_frame = frame;
            object.frame = frame;

            if (object.mChest.closed_frame == 22) {
                object.mChest.is_takeable = false;
                object.mChest.save.properties.is_takeable = false;
            } else {
                object.mChest.is_takeable = true;
                object.mChest.save.properties.is_takeable = true;              
            }
        } else {
            console.log("Item killed / collision");
            object.kill();
        }
    } else {
        console.log("Item not created / collision dist");  
    }
        
   return object;
};


Mst.ItemSpawner.prototype.create_object = function (name, position, properties) {
    "use strict";        
    return new Mst.Chest(this.game_state, name, position, properties);
};

Mst.ItemSpawner.prototype.create_name = function () {
    "use strict";
    const names = [];
    //var j = this.pool.countLiving();
    let object_name = "item_" + this.spawnernum + "_" + this.j;
    
    //console.log(this.game_state.gdata.map.objects);
    //console.log(this.game_state.gdata.map.objects.length);
    
    for (const object of this.game_state.gdata.map.objects) {
        const name = object.name;
        const a = name.split("_");
        if (a[1] === this.spawnernum) {
            names.push(parseInt(a[2]));
        } else {
            names.push(parseInt(a[1]));
        }
    }
      
    names.sort((a, b) => a - b);
      
    //console.log(names);
    
    while (names.indexOf(this.j) > -1) {
        this.j++;
    }
    
    object_name = "item_"  + this.spawnernum + "_" + this.j;
    
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
