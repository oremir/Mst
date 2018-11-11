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
        properties: properties
    }
    
    //console.log("y: "+this.save.y)
    
    this.body.immovable = true;
    console.log(this.closed_frame);
    this.frame = this.closed_frame;
    this.anchor.setTo(0.5);
    
    this.inputEnabled = true;
    this.events.onInputDown.add(this.get_chest, this);
    
    this.updated = false;
};

Mst.Chest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Chest.prototype.constructor = Mst.Chest;

Mst.Chest.prototype.update = function () {
    "use strict";
    if (this.alive) {
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 20 && this.game_state.prefabs.player.opened_chest == this.name) {
            this.close_chest();
        }
    }        
    
    if (this.updated) {
        if (this.stats.items == "") {
            this.input.useHandCursor = true;

            if (this.closed_frame == 3) {
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

        if (key != "") {
            if (this.stats.items == "" && this.closed_frame == 3) {
                this.game_state.save.objects.splice(key, 1);
            } else {
                this.game_state.save.objects[key] = this.save;
            }
        } else {
            if (!(this.stats.items == "" && this.closed_frame == 3)) {
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
    
    this.frame = this.opened_frame;
    player.opened_chest = this.name;
        
    if (this.obj_id == 0) {
        this.game_state.prefabs.chestitems.show_initial_stats();
    } else {        
        var game_state, name, usr_id, map;
        game_state = this.game_state;
        name = this.name;
        usr_id = player.usr_id;
        //map = this.game_state.root_data.map_int;
        this.save.action = "OPEN";

        var d = new Date();
        var n = d.getTime(); 

        $.post("object.php?time="+n+"&uid="+usr_id, this.save)
            .done(function(data) {
                console.log( "Chest open success" );
                console.log(data);
                var resp = JSON.parse(data);
                var items = resp.obj.properties.items;
                console.log(items);

                chest.set_items(items);
                game_state.prefabs.chestitems.show_initial_stats();
            })
            .fail(function(data) {
                console.log( "Chest open error" );
                console.log(data);
            });

        console.log("save");
    }
};

Mst.Chest.prototype.close_chest = function () {
    "use strict";
    
    this.frame = this.closed_frame;    
    this.game_state.prefabs.player.opened_chest = "";
    
    if (this.obj_id == 0) {
        this.game_state.prefabs.chestitems.kill_stats();
    } else {        
        var game_state, name, usr_id;
        game_state = this.game_state;
        name = this.name;
        usr_id = game_state.prefabs.player.usr_id;
        this.save.action = "CLOSE";

        var d = new Date();
        var n = d.getTime(); 

        $.post("object.php?time="+n+"&uid="+usr_id, this.save)
            .done(function(data) {
                console.log( "Chest close success" );
                console.log(data);

                game_state.prefabs.chestitems.kill_stats();
            })
            .fail(function(data) {
                console.log( "Chest close error" );
                console.log(data);
            });

        console.log("save");
    }
    
};

Mst.Chest.prototype.get_chest = function (chest) {
    "use strict";
    var chest_name, closed_frame, key;
    
    
    
    if (chest.stats.items == "") {
        console.log(chest);
        chest_name = chest.name;
        closed_frame = chest.closed_frame;

        if (closed_frame != 3) {
            this.game_state.prefabs.player.add_item(closed_frame, 1);
        }

        this.kill();
        this.game_state.prefabs.player.opened_chest = "";
        
        key = this.game_state.keyOfName(chest_name);

        console.log(key);

        if (key != "") {
            this.game_state.save.objects.splice(key, 1);
        }

        console.log(this.game_state.save.objects);
        
        if (this.obj_id != 0) {
            var usr_id;
            usr_id = this.game_state.prefabs.player.usr_id;
            this.save.action = "GET";

            var d = new Date();
            var n = d.getTime(); 

            $.post("object.php?time="+n+"&uid="+usr_id, this.save)
                .done(function(data) {
                    console.log( "Chest get success" );
                    console.log(data);
                })
                .fail(function(data) {
                    console.log( "Chest get error" );
                    console.log(data);
                });

            console.log("save");
        }
    }
};

Mst.Chest.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    
    this.game_state.prefabs.chestitems.add_item(item_frame, quantity);
};

Mst.Chest.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    
    this.game_state.prefabs.chestitems.subtract_item(item_index, quantity);
};

Mst.Chest.prototype.set_items = function (items) {
    "use strict";
    
    this.stats.items = items;
};