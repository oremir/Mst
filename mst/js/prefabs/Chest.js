var Mst = Mst || {};

Mst.Chest = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log("y: "+position.y)
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.stats = {
        items: properties.items
    };
    
    this.closed_frame = parseInt(properties.closed_frame) || 4;
    this.opened_frame = parseInt(properties.opened_frame) || 5;
    
    var key;
    key = this.game_state.keyOfName(name);
        
    if (key === "") {
        this.obj_id = 0;
    } else {
        this.obj_id = parseInt(this.game_state.save.objects[key].obj_id);
    }
    
    this.save = {
        type: "chest",
        name: name,
        obj_id: this.obj_id,
        x: position.x - (this.game_state.map.tileHeight / 2),
        y: position.y + (this.game_state.map.tileHeight / 2),
        properties: properties,
        map_int: this.game_state.root_data.map_int
    };
    
    //console.log("y: "+this.save.y)
    
    this.body.immovable = true;
    console.log(this.closed_frame);
    this.frame = this.closed_frame;
    this.anchor.setTo(0.5);
    
    this.inputEnabled = true;
    this.events.onInputDown.add(this.get_chest, this);
    
    this.updated = false;
    this.stat = "";
};

Mst.Chest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Chest.prototype.constructor = Mst.Chest;

Mst.Chest.prototype.update = function () {
    "use strict";
    if (this.alive) {
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 20 && this.game_state.prefabs.player.opened_chest === this.name) {
            this.close_chest();
        }
        
        if (this.game_state.prefabs.sword.alive && this.game_state.prefabs.sword.cut) {
            if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 18) {
                this.game_state.prefabs.sword.cut_chest(this);
            }
        }
    }
    
    if (this.updated) {
        if (this.stats.items === "") {
            this.input.useHandCursor = true;

            if (this.closed_frame === 3) {
                this.get_chest(this);
            }
        } else {
            this.input.useHandCursor = false;
        }
        
        this.save.properties.items = this.stats.items;
        this.save.properties.opened_frame = this.opened_frame;
        this.save.properties.closed_frame = this.closed_frame;
        
        var key;
        key = this.game_state.keyOfName(this.name);
    
        //console.log(key);

        if (key !== "") {
            if (this.stats.items === "" && this.closed_frame === 3) {
                this.game_state.save.objects.splice(key, 1);
            } else {
                this.game_state.save.objects[key] = this.save;
            }
        } else {
            if (!(this.stats.items === "" && this.closed_frame === 3)) {
                this.game_state.save.objects.push(this.save);
            }
        }
        
        //console.log(this.game_state.save.objects);
        this.updated = false;
    }
};

Mst.Chest.prototype.reset = function (position) {
    "use strict";
    
    Phaser.Sprite.prototype.reset.call(this, position.x, position.y);
};

Mst.Chest.prototype.open_chest = function (player, chest) {
    "use strict";
    var success = true;
    
    if (this.stat !== "open") {
        this.frame = this.opened_frame;
        player.opened_chest = this.name;

        if (this.obj_id === 0) {
            this.game_state.prefabs.chestitems.show_initial_stats();
        } else {
            var game_state, name, usr_id, map, d, n, stat;

            var t = this;

            game_state = this.game_state;
            name = this.name;
            usr_id = player.usr_id;
            //map = this.game_state.root_data.map_int;
            this.save.action = "OPEN";

            d = new Date();
            n = d.getTime();

            console.log(this.save);

            $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
                .done(function (data) {
                    console.log("Chest open success");
                    console.log(data);
                    var resp, items;
                    resp = JSON.parse(data);
                    items = resp.obj.properties.items;
                    stat = resp.stat;
                    console.log(items);

                    chest.set_items(items);
                    chest.set_stat(stat);
                    game_state.prefabs.chestitems.show_initial_stats();
                
                    if (stat == 'open') {
                        console.log("Chest is open by other player");
                        chest.close_chest();
                        success = false;
                    }
                })
                .fail(function (data) {
                    console.log("Chest open error");
                    console.log(data);
                
                    success = false;
                });

            console.log("save chest open");

        }
    } else {
        success = false;
    }
    
    return success;
};

Mst.Chest.prototype.close_chest = function () {
    "use strict";
    
    this.frame = this.closed_frame;
    this.game_state.prefabs.player.opened_chest = "";
    
    var game_state, chest, name, usr_id, d, n;
    game_state = this.game_state;
    chest = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.action = "CLOSE";

    if (this.stat !== "open") {
        d = new Date();
        n = d.getTime();

        console.log(this.save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
            .done(function (data) {
                console.log("Chest close success");
                console.log(data);
                var resp, obj_id;
                resp = JSON.parse(data);
                obj_id = resp.obj.obj_id;
                console.log("ObjID: " + obj_id);

                chest.set_obj_id(obj_id);

                game_state.prefabs.chestitems.kill_stats();
            })
            .fail(function (data) {
                console.log("Chest close error");
                console.log(data);
            });

        console.log("save chest close");
    } else {
        game_state.prefabs.chestitems.kill_stats();
    }
    
};

Mst.Chest.prototype.get_chest = function (chest) {
    "use strict";
    var chest_name, closed_frame, key, usr_id, d, n, success;
    success = true;
    
    if (chest.stat !== "open") {
        if (chest.stats.items === "") {
            console.log(chest);
            chest_name = chest.name;
            closed_frame = chest.closed_frame;

            switch(closed_frame) {
                case 3: //věci 
                
                break;
                case 7: //dřevo
                    this.game_state.prefabs.player.add_item(32, 1); //prkno
                break;
                case 19: //ohrada
                    this.game_state.prefabs.player.add_item(24, 1); //hůl
                break;
                default: //ostatní bedny
                    this.game_state.prefabs.player.add_item(closed_frame, 1);
                break;
            }

            //this.obj_id = 0;
            this.kill();
            this.game_state.prefabs.player.opened_chest = "";

            key = this.game_state.keyOfName(chest_name);

            console.log(key);

            if (key !== "") {
                this.game_state.save.objects.splice(key, 1);
            }

            console.log(this.game_state.save.objects);

            if (this.obj_id !== 0) {
                usr_id = this.game_state.prefabs.player.usr_id;
                this.save.action = "GET";

                d = new Date();
                n = d.getTime();

                $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
                    .done(function (data) {
                        console.log("Chest get success");
                        console.log(data);
                    })
                    .fail(function (data) {
                        console.log("Chest get error");
                        console.log(data);
                    });

                console.log("save chest get");
            }
        } else {
            success = false;
        }
    } else {
        success = false;
    }
    
    return success;
};

Mst.Chest.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    var success = true;
    
    if (this.stat !== "open") {
        this.game_state.prefabs.chestitems.add_item(item_frame, quantity);
    } else {
        success = false;
    }
    
    return success;
};

Mst.Chest.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    
    this.game_state.prefabs.chestitems.subtract_item(item_index, quantity);
};

Mst.Chest.prototype.subtract_all = function (item_index) {
    "use strict";
    
    this.game_state.prefabs.chestitems.subtract_all(item_index);
};

Mst.Chest.prototype.take_all = function () {
    "use strict";
    var content;
    
    content = this.game_state.prefabs.chestitems.in_chest();
    
    if (content.length > 0) {
        for (var i = content.length - 1; i > -1; i--) {
            this.subtract_all(i);            
        }
    }
    
    return content;
};

Mst.Chest.prototype.in_chest_ord = function () {
    "use strict";
    var content;
    
    content = this.game_state.prefabs.chestitems.in_chest_ord();
    return content;
};

Mst.Chest.prototype.chest_compare = function (a, b) {
    "use strict";
    var output;
    output = false;
    
    console.log(a); console.log(b);
    
    if (typeof (a) !== 'undefined' || typeof (b) !== 'undefined') {
          if (a.length == b.length) {
            for (var i = 0; i < a.length; i++) {
                if (a.f == b.f) {
                    output = (a.q == b.q);
                }
            } 
        } 
    }
    
 
    return output;
};

Mst.Chest.prototype.test_item = function (item_frame, quantity) {
    "use strict";
    var index;
    
    index = this.game_state.prefabs.chestitems.test_item(item_frame, quantity);
    console.log(index);
    return index;
};

Mst.Chest.prototype.set_items = function (items) {
    "use strict";
    
    this.stats.items = items;
};

Mst.Chest.prototype.set_stat = function (stat) {
    "use strict";
    
    this.stat = stat;
};

Mst.Chest.prototype.set_obj_id = function (obj_id) {
    "use strict";
    
    this.obj_id = parseInt(obj_id);
    this.save.obj_id = this.obj_id;
};

Mst.Chest.prototype.collide_test = function () {
    "use strict";
//    var x, y;
//    
//    x = Math.round(this.x/16)*16;
//    y = Math.round(this.y/16)*16;
//    console.log(this.x + ":" + x + "|" + this.y + ":" + y);
    //this.reset(x, y);
    //this.game_state.game.physics.arcade.moveToXY(this, x, y, 10000, 1);
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_tile(), null, this);
    //console.log("Collision dist: " + dist);
};

Mst.Chest.prototype.collide_tile = function () {
    "use strict";

    console.log("Collision dist: " );
};