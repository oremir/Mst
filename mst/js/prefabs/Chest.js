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
        if (typeof(properties.obj_id) !== 'undefined') {
            this.obj_id = parseInt(properties.obj_id);
        } else {
            this.obj_id = 0;
        }
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
    if (typeof(properties.is_takeable) !== 'undefined') {
        this.is_takeable = (properties.is_takeable === 'true');
    } else {
        this.is_takeable = true;
    }
    
    this.sskill = "";
    if (typeof(properties.sskill) !== 'undefined') {
        this.sskill = properties.sskill;
    }
    
    console.log("Chest " + this.name + " takable:" + this.is_takeable);
    
    this.is_opened = false;
    
    this.body.immovable = true;
    console.log(this.closed_frame);
    this.frame = this.closed_frame;
    this.anchor.setTo(0.5);
    
    this.chest_timer = this.game_state.time.create();
    this.chest_loop = 0;
    this.chest_loop_frame = 0;
    this.chest_fire = 0;
    
    this.animations.add('ficauldron', [56, 57], 10, true);
    this.animations.add('fiwcauldron', [74, 75], 10, true);
    this.animations.add('fire', [83, 84, 85, 86, 87, 88], 10, true);
    
    
    switch (this.closed_frame) {
        case 56:
            this.animations.play("ficauldron");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 56;
        break;
        case 74:
            this.animations.play("fiwcauldron");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 74;
        break;
        case 83:
            this.animations.play("fire");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 83;
        break;
        default:
            this.animations.stop();
        break;
    }    
    
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
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 21 && this.game_state.prefabs.player.opened_chest === this.name) {
            console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
            console.log("Chest is too far!");
            this.close_chest();
        }
        
        if (this.game_state.prefabs.sword.alive && this.game_state.prefabs.sword.cut) {
            if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 19) {
                this.game_state.prefabs.sword.cut_chest(this);
            }
        }
    }
    
    if (this.updated) {
        if (this.stats.items === "") {
            if (this.is_takeable) {
                this.input.useHandCursor = true;

                if (this.closed_frame === 3) {
                    this.get_chest(this);
                }
            } else {
                this.input.useHandCursor = false;
            }
        } else {
            this.input.useHandCursor = false;
        }
        
        var is_timed = true;
        
        switch (this.closed_frame) {
            case 56:
                console.log("Play anim kotlik");
                this.animations.play("ficauldron");
            break;
            case 74:
                console.log("Play anim kotlik s vodou");
                this.animations.play("fiwcauldron");
            break;
            case 83:
                console.log("Play anim ohen");
                this.animations.play("fire");
            break;
            default:
                this.animations.stop();
                is_timed = false;
            break;
        }
        
        if (!this.chest_timer.running && is_timed) {
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            console.log("Chest timer start!");
        }
        
        console.log("Update1:");
        console.log(this.name);
        console.log(this.save);
        console.log(JSON.stringify(this.save));
        
        this.save.properties.items = this.stats.items;
        this.save.properties.opened_frame = this.opened_frame;
        this.save.properties.closed_frame = this.closed_frame;
        
        console.log("Update2:");
        console.log(this.save);
        console.log(JSON.stringify(this.save));
        console.log(this.frame);
        
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

Mst.Chest.prototype.time_up = function () {
    "use strict";
    var f, cook, in_chest, ij;
    
    console.log("Chest " + this.name + " time up!");
    switch (this.closed_frame) {
        case 56: //Kotlik hori
            this.animations.stop();
            
            this.frame = 53; //Kotlik
            this.closed_frame = 53;
            this.opened_frame = 53;
            this.updated = true;
        break;
        case 74: //Kotlik s vodou hori
            this.animations.stop();
            
            this.frame = 71; //Kotlik s vodou
            this.closed_frame = 71;
            this.opened_frame = 71;
            this.updated = true;
        break;
        case 83: //Drevo hori
            this.animations.stop();
            
            this.frame = 89; //popel
            this.closed_frame = 89;
            this.opened_frame = 89;
            this.updated = true;
            
            console.log(this.frame);
        break;
    }
    
    this.chest_loop++;
    
    if (this.is_opened) {
        this.loops_done(this.chest_loop, this.chest_loop_frame);
    }
};

Mst.Chest.prototype.loops_done = function (nloop, type) {
    "use strict";
    var f, q, fc, qc, index, in_chest, cook, ij;
    
    console.log("Loops done / l:" + nloop + " f:" + type);
    
    if (nloop > 0) {
        for (i = 0; i < nloop; i++) {
            switch (type) {
                case 56: //kotlik hori
                    index = this.test_item(92, 1); //ohen
                    this.subtract_item(index, 1);
                    this.add_item(89, 1); //popel
                break;
                case 74: //kotlik s vodou hori
                    index = this.test_item(92, 1); //ohen
                    this.subtract_item(index, 1);
                    this.add_item(89, 1); //popel
                    index = this.test_item(91, 1); //hrib
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        index = this.test_item(81, 1); //voda
                        this.subtract_item(index, 1);
                        this.add_item(93, 1); //hrib. polevka
                    }
                break;
                case 83: //drevo hori
                    index = this.test_item(92, 1); //ohen
                    this.subtract_item(index, 1);
                    in_chest = this.in_chest_ord();
                    if (in_chest.length > 0) {
                        for (var i = 0; i < in_chest.length; i++) {
                            f = in_chest[i].f;
                            if (typeof(this.game_state.core_data.items[f].properties.cook) !== undefined) {
                                index = this.test_item(f, 1);
                                this.subtract_item(index, 1);

                                cook = this.game_state.core_data.items[f].properties.cook;
                                for (var j = 0; j < cook[0]; j++) {
                                    ij = 2 * j + 1;
                                    fc = cook[ij];
                                    qc = cook[ij + 1];
                                    this.add_item(fc, qc);

                                }
                            }

                        }
                    }
                break;
            }
        }
        this.chest_loop = 0;
    }

};

Mst.Chest.prototype.open_chest = function (player, chest) {
    "use strict";
    var success = true;
    
    console.log("Open! " + chest.name + " / Stat: " + chest.stat + " / ObjID: " + chest.obj_id + " / Opened chest: " + player.opened_chest + " / Stats: ");
    console.log(chest.stats);
    
    if (chest.stat !== "open") {
        chest.frame = chest.opened_frame;
        player.opened_chest = chest.name;

        if (chest.obj_id === 0) {
            chest.game_state.prefabs.chestitems.show_initial_stats();
            
            chest.is_opened = true;
            chest.updated = true;
            
            var nloop = chest.chest_loop;
            var ltype = chest.chest_loop_frame;
            chest.loops_done(nloop, ltype);
            
            console.log("Chest is open!");
            chest.game_state.hud.alert.show_alert("Otevřena!");
        } else {
            var game_state, name, usr_id, map, d, n, stat;

            //game_state = this.game_state;
            //name = this.name;
            usr_id = player.usr_id;
            //map = this.game_state.root_data.map_int;
            
            chest.save.properties.items = chest.stats.items;
            chest.save.properties.opened_frame = chest.opened_frame;
            chest.save.properties.closed_frame = chest.closed_frame;
            chest.save.action = "OPEN";

            d = new Date();
            n = d.getTime();

            console.log(chest.save);

            $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
                .done(function (data) {
                    console.log("Chest open success");
                    console.log(data);
                    var resp, items, properties;
                    resp = JSON.parse(data);
                    properties = resp.obj.properties;
                    items = resp.obj.properties.items;
                    stat = resp.stat;
                    console.log(items);

                    chest.load_chest(properties, stat);
                    chest.set_stat(stat);
                    chest.game_state.prefabs.chestitems.show_initial_stats();
                
                    if (stat == 'open') {
                        console.log("Chest is open by other player");
                        chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");
                        
                        chest.close_chest();
                        success = false;
                    } else {
                        chest.is_opened = true;
                        chest.updated = true;
                        
                        console.log("Chest is open!");
                        chest.game_state.hud.alert.show_alert("Otevřena!");
                        
                        var nloop = chest.chest_loop;
                        var ltype = chest.chest_loop_frame;
                        chest.loops_done(nloop, ltype);
                    }
                
                    console.log("Is opened? " + chest.is_opened);
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
        
        console.log("Chest is open by other player");
        chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");
    }
    
    console.log("Is opened? " + chest.is_opened);
    
    return success;
};

Mst.Chest.prototype.close_chest = function () {
    "use strict";
    
    this.frame = this.closed_frame;
    this.game_state.prefabs.player.opened_chest = "";
    this.is_opened = false;
    
    var game_state, chest, name, usr_id, d, n;
    game_state = this.game_state;
    chest = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.properties.items = this.stats.items;
    this.save.properties.opened_frame = this.opened_frame;
    this.save.properties.closed_frame = this.closed_frame;
    this.save.action = "CLOSE";

    if (this.stat !== "open") {
        d = new Date();
        n = d.getTime();

        console.log("CLOSE CHEST");
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
            
                console.log("Chest is close");
                chest.game_state.hud.alert.show_alert("Zavřena!");
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
    
    if (this.is_takeable) {
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
                
                if (chest.sskill !== "") {
                    this.game_state.prefabs.player.work_rout(chest.sskill, "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                }

                //this.obj_id = 0;
                this.kill();
                this.game_state.prefabs.player.opened_chest = "";

                key = this.game_state.keyOfName(chest_name);

                console.log("Get chest key:");
                console.log(key);

                if (key !== "") {
                    this.game_state.save.objects.splice(key, 1);
                }

                console.log("Get chest objects:");
                console.log(this.game_state.save.objects);

                if (this.obj_id !== 0) {
                    usr_id = this.game_state.prefabs.player.usr_id;
                    chest.save.action = "GET";

                    d = new Date();
                    n = d.getTime();

                    $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
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
    } else {
        success = false;
    }
    
    return success;
};

Mst.Chest.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    var success = true;
    console.log(this.is_opened);
    
    if (this.stat !== "open") {
        if (this.is_opened) {
            this.game_state.prefabs.chestitems.add_item(item_frame, quantity); //chestitems
        }
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

Mst.Chest.prototype.change_frame = function (frame) {
    "use strict";
    
    this.frame = frame;
    this.closed_frame = frame;
    this.opened_frame = frame;
    this.updated = true;
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
    console.log("Is opened? " + this.is_opened);
    return index;
};

Mst.Chest.prototype.load_chest = function (properties, stat) {
    "use strict";
    
    this.stats.items = properties.items;
    this.save.properties.items = this.stats.items;
    
    this.stat = stat;
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
    var test = false;
    this.collide_t = false;

    //console.log("Collision dist: ");
    
//    this.game_state.layers.collision.layer.data.forEach(function(tile) {
//        console.log(tile);
//    });
    
    //console.log(this.game_state.layers.collision.layer.data);
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_tile(), null, this);
    console.log(this.collide_t);
    return this.collide_t;
    
};

Mst.Chest.prototype.collide_tile = function () {
    "use strict";

    this.collide_t = true;
    console.log("Collision dist: " );
};