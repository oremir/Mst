var Phaser = Phaser || {};
var Mst = Mst || {};
var game = game || {};
var PhaserInput = PhaserInput || {};

Mst.TiledState = function () {
    "use strict";
    Phaser.State.call(this);
    
    this.prefab_classes = {
        "player": Mst.Player.prototype.constructor,
        "other_player": Mst.OtherPlayer.prototype.constructor,
        "NPC": Mst.NPC.prototype.constructor,
        "bullet": Mst.Bullet.prototype.constructor,
        "enemy_spawner": Mst.EnemySpawner.prototype.constructor,
        "item_spawner": Mst.ItemSpawner.prototype.constructor,
        "chest_creator": Mst.ChestCreator.prototype.constructor,
        "chest": Mst.Chest.prototype.constructor,
        "sword": Mst.Sword.prototype.constructor,
        "goout": Mst.Goout.prototype.constructor,
        "show_stat_with_sprite": Mst.ShowStatWithSprite.prototype.constructor,
        "show_stat_with_text": Mst.ShowStatWithText.prototype.constructor,
        "show_stat_with_bar": Mst.ShowStatWithBar.prototype.constructor,
        "show_items": Mst.ShowItems.prototype.constructor,
        "show_business": Mst.ShowBusiness.prototype.constructor,
        "show_equip": Mst.ShowEquip.prototype.constructor,
        "ren": Mst.Ren.prototype.constructor,
        "quest": Mst.Quest.prototype.constructor
    };
};

Mst.TiledState.prototype = Object.create(Phaser.State.prototype);
Mst.TiledState.prototype.constructor = Mst.TiledState;

Mst.TiledState.prototype.init = function (core_data, map_data, root_data, quest_data) {
    "use strict";
    this.core_data = core_data;
    this.quest_data = quest_data;
    this.map_data = map_data;
    this.root_data = root_data;
    
    console.log(quest_data);
    
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    if (this.root_data.usr_id > 0) {
        // start physics system
        
        this.game.physics.arcade.gravity.y = 0;
    
        // create map and set tileset
        this.map = this.game.add.tilemap(map_data.map.key);
        this.map.addTilesetImage(this.map.tilesets[0].name, map_data.map.tileset);
    } else {
        var load_player;
        
        load_player = JSON.parse(localStorage.getItem("player"));
        console.log("Local Storage Player");
        console.log(load_player);
        
        if (load_player !== null && typeof (load_player.map) !== 'undefined' && typeof (load_player.logged) !== 'undefined' && load_player.logged) {
            game.state.start("BootState", true, false, load_player.map.new_int, load_player.usr_id);
        } else {
        
// ------------------------------------ Login -----------------------------------        
        
            this.login = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "login");
            this.login.anchor.set(0.5);

            //console.log(this.root_data);

            Phaser.Device.whenReady(function () {
                game.plugins.add(PhaserInput.Plugin);
            });

            this.usr_name = this.game.add.inputField(this.game.world.centerX - 175, this.game.world.centerY - 171, {
                    font: '12px Verdana',
                    fill: '#444444',
                    fillAlpha: 0,
                    fontWeight: 'bold',
                    width: 150,
                    max: 20,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#000',
                    borderRadius: 6,
                    placeHolder: 'Username',
                    textAlign: 'left',
                    zoom: true
            });

            this.usr_password = this.game.add.inputField(this.game.world.centerX-175, this.game.world.centerY-139, {
                    font: '12px Verdana',
                    fill: '#444444',
                    fillAlpha: 0,
                    fontWeight: 'bold',
                    width: 150,
                    padding: 8,
                    borderWidth: 1,
                    borderColor: '#000',
                    borderRadius: 6,
                    placeHolder: 'Password',
                    textAlign: 'left',
                    type: PhaserInput.InputType.password,
                    zoom: true
            });
            this.usr_password.blockInput = false;
            this.usr_password.focusOutOnEnter = false;

            this.usr_isinput = false;
        }
    }
};

Mst.TiledState.prototype.create = function () {
    "use strict";
    var group_name, object_layer, object_key, collision_tiles, load_player;
    
    if (this.root_data.usr_id > 0) {
        // create map layers
        this.layers = {};
        this.map.layers.forEach(function (layer) {
            this.layers[layer.name] = this.map.createLayer(layer.name);
            if (layer.properties.collision) { // collision layer
                collision_tiles = [];
                layer.data.forEach(function (data_row) { // find tiles used in the layer
                    data_row.forEach(function (tile) {
                        // check if it's a valid tile index and isn't already in the list
                        if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                            collision_tiles.push(tile.index);
                        }
                    }, this);
                }, this);
                this.map.setCollision(collision_tiles, true, layer.name);
            }
        }, this);
        // resize the world to be the size of the current layer
        this.layers[this.map.layer.name].resizeWorld();

        // create groups
        this.groups = {};
        this.core_data.groups.forEach(function (group_name) {
            this.groups[group_name] = this.game.add.group();
        }, this);

        //console.log(this.groups);

        this.prefabs = {};
        
        this.create_prefab("chest_creator", "chest_creator", {x: 0, y: 0}, {});
        
        // ......................... HUD Init 1 ............................
        
        this.hud = {};
        this.hud.right_window = new Mst.hud(this, "right_window");
        this.hud.alt = new Mst.hud(this, "alt");
        this.hud.dialogue = new Mst.hud(this, "dialogue");
        this.hud.alert = new Mst.hud(this, "alert");

        // ......................... Map Objects ............................
        
        console.log("Map objects:");
        console.log(this.map.objects);
        
        for (object_layer in this.map.objects) {
            if (this.map.objects.hasOwnProperty(object_layer)) {
                // create layer objects
                this.map.objects[object_layer].forEach(this.create_object, this);
            }
        }
        
        this.save = {
            player: {},
            objects: this.map_data.objects
        };
        
        console.log("Map data objects:");
        console.log(this.map_data.objects);
        
        for (object_key in this.map_data.objects) {
            this.create_object(this.map_data.objects[object_key]);

            //console.log(this.core_data.objects[object_key]);
        }

        if (typeof (this.prefabs.player) === 'undefined') {
            load_player = JSON.parse(localStorage.getItem("player"));
            console.log("localStorage");
            console.log(load_player.properties);
            this.create_object(load_player);
        }
        
        this.groups.NPCs.forEachAlive(function (NPC) {
            console.log("Quest bubble: " + NPC.name);
            NPC.test_quest();
        }, this);
        
        this.groups.otherplayers.forEachAlive(function (otherplayer) {
            console.log("Quest bubble: " + otherplayer.name);
            otherplayer.test_quest();
        }, this);
        
        // ......................... HUD Init 2 ..............................
        
        this.hud.stats = this.game.plugins.add(Mst.HUD, this, this.core_data.hud);
        
        // ......................... Core Objects ............................
        
        for (object_key in this.core_data.objects) {
            this.create_object(this.core_data.objects[object_key]);

            //console.log(this.core_data.objects[object_key]);
        }

        //console.log(this.core_data.hud);
        
        console.log("Prefabs:");
        console.log(this.prefabs);
        console.log(this.groups);
    }
      
};

Mst.TiledState.prototype.update = function () {
    "use strict";
    var i_param, usr_output, game;
    
    usr_output = {};
    
    if (this.root_data.usr_id < 1 && this.usr_isinput === false) {
        
// --------------------------------- Login ---------------------------------------
        
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.usr_isinput = true;
            
            i_param = { user: this.usr_name.value, pass: this.usr_password.value};
            
            //console.log(i_param);
            
            game = this.game;
            
            //$(document).ready(function(){
                $.getJSON("login.php", i_param)
                    .done(function (data) {
                        console.log("Login php OK");
                        usr_output = data;
                        console.log(data);
                        var usr_id = parseInt(usr_output.usr_id);
                        var map = parseInt(usr_output.map);
//                        console.log(usr_output);
//                        console.log(usr_id);
//                        console.log(map);
//
//                        updt(usr_id, map);

                        game.state.start("BootState", true, false, map, usr_id);
                    })
                    .fail(function (data) {
                        console.log("Login error");
                        console.log(data);
                    })
            //});
        }
    }
    
    //console.log(typeof(usr_output.usr_id));
    
//    if (typeof(usr_output.usr_id) != 'undefined') {
//        console.log("yes");
//        console.log(usr_output);
//    }
};

Mst.TiledState.prototype.create_object = function (object) {
    "use strict";
    var position, prefab, type;
    // tiled coordinates starts in the bottom left corner
    position = {"x": (parseInt(object.x) + (this.map.tileHeight / 2)), "y": (parseInt(object.y) - (this.map.tileHeight / 2))};
    // create object according to its type
    type = object.type;
    
    if (type == "player") {
        if (object.usr_id != this.root_data.usr_id) {
            type = "other_player";
            //console.log(object);
        }
    }
    
    console.log("Prefab exist? " + object.name);
    console.log(this.prefabs[object.name]);
    
    if (typeof(this.prefabs[object.name]) === 'undefined') {
        this.create_prefab(type, object.name, position, object.properties);
    }
};

Mst.TiledState.prototype.create_prefab = function (type, name, position, properties) {
    "use strict";
    var prefab;
    // create prefab according to its type
    if (this.prefab_classes.hasOwnProperty(type)) {
        prefab = new this.prefab_classes[type](this, name, position, properties);
    }
    //this.prefabs[name] = prefab;
    return prefab;
};

Mst.TiledState.prototype.restart_map = function () {
    "use strict";
    this.game.state.restart(true, false, this.core_data, this.map_data, this.root_data);
};

Mst.TiledState.prototype.save_data = function (go_position, next_map_int, save_state) {
    "use strict";
    var key, game, usr_id;
    game = this.game;
    usr_id = this.root_data.usr_id;
    
    this.groups.otherplayers.forEachAlive(function(one_player) {        
        one_player.save_player();
    }, this);
    
    this.prefabs.player.save_player(go_position, next_map_int);
    
    this.save.player = this.prefabs.player.save;
    
    key = this.keyOfUsrID(this.root_data.usr_id);
    
    console.log(this.save.objects);
    console.log(key);
    
    if (key != "") {
        this.save.objects.splice(key, 1);
    }
    
    console.log(this.save.objects);
    
    var stat1 = this.groups.hud.create(this.prefabs.player.x, this.prefabs.player.y, "circle_inv");
    stat1.scale.setTo(21);
    stat1.anchor.setTo(0.5);
                
    var tween = this.game.add.tween(stat1.scale).to( { x: 0.72, y: 0.72 }, 500, Phaser.Easing.Linear.None);
    tween.onComplete.add(function() {
        if (save_state == "logout") { 
            usr_id = 0;
            console.log("logout");
            location.reload();
        };
        game.state.start("BootState", true, false, next_map_int, usr_id);
    });
    
    var d = new Date();
    var n = d.getTime(); 

    $.post("save.php?time="+n, this.save)
        .done(function(data) {
            console.log( "save success" );
            console.log(JSON.parse(data));
        
            tween.start();
        })
        .fail(function(data) {
            console.log( "save error" );
            console.log(data);
        });
    
    console.log("save");
};

Mst.TiledState.prototype.playerOfUsrID = function (usr_id) {
    "use strict";
    
    console.log("playerOfUsrID:" + usr_id);
    
    var key, object_key, uid;
    key = "";
    for (object_key in this.prefabs) {
//            console.log(object_key);
//            console.log(objects[object_key]);
//            console.log(usr_id);
        if (typeof(this.prefabs[object_key].usr_id) != 'undefined') {
            usr_id = parseInt(usr_id);
            uid = parseInt(this.prefabs[object_key].usr_id);
            if (uid == usr_id) {
                key = object_key;
                console.log(key);
            }
        }
    }

    return key;
};

Mst.TiledState.prototype.keyOfUsrID = function (usr_id) {
    "use strict";
    
    console.log("keyOfUsrID:" + usr_id);
    console.log(this.save.objects);
    
    var key, object_key, uid;
    key = "";
    for (object_key in this.save.objects) {
//            console.log(object_key);
//            console.log(objects[object_key]);
//            console.log(usr_id);
        if (typeof(this.save.objects[object_key].usr_id) != 'undefined') {
            usr_id = parseInt(usr_id);
            uid = parseInt(this.save.objects[object_key].usr_id);
            if (uid == usr_id) {
                key = object_key;
                console.log(key);
            }
        }
    }

    return key;
};

Mst.TiledState.prototype.keyOfName = function (name) {
    "use strict";
    
    console.log("keyOfName:" + name);
    console.log(this.save.objects);
    
    var key, object_key;
    key = "";
    
    if (typeof(this.save) != 'undefined') {
        for (object_key in this.save.objects) {
    //            console.log(object_key);
    //            console.log(objects[object_key]);
    //            console.log(usr_id);
            if (typeof(this.save.objects[object_key].name) != 'undefined') {
                if (this.save.objects[object_key].name == name) {
                    key = object_key;
    //                    console.log(key);
                }
            }
        }
    }

    return key;
};

Mst.hud = function (game_state, name) {
    "use strict";
    var text_style, name_img;
    
    //console.log(name + " " + name.substr(0, 6));
    if (name.substr(0, 6) == "alert_") {
        name_img = "alert";
    } else {
        name_img = name;
    }
    
    Phaser.Image.call(this, game_state.game, 273, 47, name_img);
    
    this.game_state = game_state;    
    this.game_state.groups.hud.add(this);    
    this.name = name;
    
    
    this.visible = false;
    this.alpha = 0.7;
    
    text_style = {"font": "14px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
    //this.text = new Phaser.Text(this.game_state.game, 273 + 10, 52 + 8, "", text_style);
    //this.text = this.addChild(this.game_state.game.make.text(273 + 10, 52 + 8, "", text_style));
    this.text = this.game_state.game.add.text(this.x + 20, this.y + 20, "", text_style);
    
    this.text.fixedToCamera = true;
    this.text.maxWidth = 150;
    
    switch(name) {
        case "alt":
            this.text_alt = {};
            
            break;
        case "dialogue":
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_name = this.game_state.game.add.text(16, 244, "", text_style);
            this.text_name.fixedToCamera = true;
            this.text_dialogue = this.game_state.game.add.text(16, 270, "", text_style);
            this.text_dialogue.fixedToCamera = true;
            this.reset(8, 240);
            this.visible = false;
            this.fixedToCamera = true;
            
            this.dialogue_name = "";
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.hide_dialogue_onclick, this);
            
            break;
        case "alert":
            this.orig_pos = {x: 8, y: 50};
            text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
            this.text_alert = this.game_state.game.add.text(275, 53, "", text_style);
            //this.text_alert.anchor.set(0.5);
            //this.anchor.set(0.5);
            this.fixedToCamera = true;
            
            this.alerts = [];
            this.alert_sprites = [];
            this.show_running = false;
            
            break;
        default:
            if (name.substr(0, 5) == "alert") {
                //console.log(name);

                text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
                this.text_alert = this.game_state.game.add.text(275, 53, "", text_style);
            
                this.timer_alert = this.game_state.game.time.create(false);
                this.i_pos = 0;

                console.log("New alert!");
                console.log(this);
            }
            
            this.fixedToCamera = true;
            
            
    }
    
//    if(name == "alt") {
//        this.text_alt = {};
//        //this.text_alt1 = {};
//        
////        this.inputEnabled = true;
////        this.events.onInputOver.add(this.show_alt_act, this);
////        this.events.onInputOut.add(this.hide_alt, this);
//    }
    
    
    /*this.tween = this.game_state.game.add.tween(this);
    this.tween.to( {alpha: 0}, 1000);
    
    this.tween_text_alt = this.game_state.game.add.tween(this.text_alt);
    this.tween_text_alt.to( {alpha: 0}, 1000);
    
    this.tween_text_alt1 = this.game_state.game.add.tween(this.text_alt1);
    this.tween_text_alt1.to( {alpha: 0}, 1000);*/
    
    //console.log(this);
    
    //this.text = new Mst.hud.text(game_state, name, this.x, this.y, this.width);
};

Mst.hud.prototype = Object.create(Phaser.Image.prototype);
Mst.hud.prototype.constructor = Mst.hud;

Mst.hud.prototype.show = function (text) {
    "use strict";
    this.visible = true;
    this.alpha = 0.7;
    this.text.text = text;
    console.log(this.text);
};

Mst.hud.prototype.hide = function () {
    "use strict";
    this.visible = false;
    this.text.text = "";
};

Mst.hud.prototype.show_alt = function (obj) {
    "use strict";
    var type, texture, text, x, y, text_style;
    
    //this.game_state.hud.alt.hide_alt();
    
    //console.log(obj);
    type = obj.o_type;
    switch(type) {
        case "items":
            texture = "alt";
            text = this.game_state.core_data.items[obj.frame].name;
            x = obj.x - 4;
            y = obj.y - 30;
            
            /*if(obj.frame == 0 || obj.frame == 2) {
                texture = "alt_80_35";
                text = this.game_state.core_data.items[obj.frame];
                x = obj.x - 4;
                y = obj.y - 45;
                
                text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
                this.text_alt1 = this.game_state.game.add.text(x + 6, y + 16, "[vybavit]", text_style);
            }*/
            break;
        case "chestitems":
            texture = "alt";
            text = this.game_state.core_data.items[obj.frame].name;
            x = obj.x - 4;
            y = obj.y - 30;
            
            break;
        case "otherPlayer":
            if (this.name.length < 13) {
                texture = "alt";
            } else {
                texture = "alt_160_20";
            }
            
            text = this.name;
            x = this.x - 4;
            y = this.y - 30;
            
            break;
        case 1:
            
            break;
        default:
            texture = "alt";
            text = "";
            x = 0;
            y = 0;
    }
    
    text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
    //this.text = new Phaser.Text(this.game_state.game, 273 + 10, 52 + 8, "", text_style);
    //this.text = this.addChild(this.game_state.game.make.text(273 + 10, 52 + 8, "", text_style));
    this.text_alt = this.game_state.game.add.text(x + 6, y + 3, text, text_style);
    //this.text_alt.fixedToCamera = true;
    
    this.game_state.hud.alt.reset(x, y);
    this.game_state.hud.alt.loadTexture(texture);
    this.game_state.hud.alt.visible = true;
    this.game_state.hud.alt.alpha = 0.7;
    //this.game_state.hud.alt.text.reset(x, y);
    
    //console.log(x + ":" + y);
    //console.log(obj.text_alt.text);
    console.log(text);
};

Mst.hud.prototype.hide_alt = function () {
    "use strict";
    console.log("hide alt");
    this.game_state.hud.alt.visible = false;
    console.log(this.o_type);
    if (this.o_type != "otherPlayer") {
        this.visible = false;
    }
        
    if (typeof(this.text_alt) != 'undefined') {
        this.text_alt.text = "";
        this.text_alt.destroy;
    }
    
    /*if (typeof(this.text_alt1) != 'undefined') {
        this.text_alt1.text = "";
        this.text_alt1.destroy;
    }   */ 
};

Mst.hud.prototype.show_dialogue = function (name, p_name, text, type) {
    "use strict";
    this.game_state.prefabs.player.close_state.push("Dialogue");
    this.game_state.prefabs.player.close_context.push(this.name);
    
    this.dialogue_name = name;
    
    if (type === 'item') {
        this.fixedToCamera = false;
        this.reset(8, 240);
        this.loadTexture("dialogue_small");
        this.fixedToCamera = true;
        
        this.text_name.fixedToCamera = false;
        this.text_name.x = 16;
        this.text_name.y = 244;
        this.text_name.fixedToCamera = true;
        
        this.text_dialogue.fixedToCamera = false;
        this.text_dialogue.x = 16;
        this.text_dialogue.y = 270;
        this.text_dialogue.fixedToCamera = true;
        
//    } else {
//        if ( name == "hospod") {
//            this.fixedToCamera = false;
//            this.reset(8, 240);
//            this.loadTexture("dialogue_small");
//            this.fixedToCamera = true;
//
//            this.text_name.fixedToCamera = false;
//            this.text_name.x = 16;
//            this.text_name.y = 244;
//            this.text_name.fixedToCamera = true;
//
//            this.text_dialogue.fixedToCamera = false;
//            this.text_dialogue.x = 16;
//            this.text_dialogue.y = 270;
//            this.text_dialogue.fixedToCamera = true;
        } else {
            this.game_state.prefabs.items.kill_stats();
            this.game_state.prefabs.equip.hide();

            this.fixedToCamera = false;
            this.reset(8, 285);
            this.loadTexture("dialogue");
            this.fixedToCamera = true;

            this.text_name.fixedToCamera = false;
            this.text_name.x = 16;
            this.text_name.y = 289;
            this.text_name.fixedToCamera = true;

            this.text_dialogue.fixedToCamera = false;
            this.text_dialogue.x = 16;
            this.text_dialogue.y = 315;
            this.text_dialogue.fixedToCamera = true;
        //}
            

    }
    
    this.visible = true;
    //this.alpha = 0.7;
    this.text_name.text = p_name;
    console.log("name: " + name + " p_name: " + p_name);
    this.text_dialogue.text = text;
};

Mst.hud.prototype.hide_dialogue_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_dialogue();
};

Mst.hud.prototype.hide_dialogue = function () {
    "use strict";
    this.visible = false;
    this.text_name.text = "";
    this.text_dialogue.text = "";
    
    if (!this.game_state.hud.right_window.visible) {
        this.game_state.prefabs.items.kill_stats();
        this.game_state.prefabs.items.show_initial_stats();
        this.game_state.prefabs.equip.show();
    }
    
    this.game_state.prefabs[this.dialogue_name].hide_ren();
};

Mst.hud.prototype.show_alert = function (text) {
    "use strict";
    this.alerts.push(text);
    console.log("Add alert:" + text);
    console.log(this.alerts);
    
    this.next_alert();
    
//    if (this.alerts.length > 14) {
//        this.alerts.shift();
//    }
//
//    if (!this.show_running) {
//        this.show_running = true;
//    } else {
//        this.kill_alerts;
//    }
//
//    this.show_initial_alerts();
//
//    if (!this.timer_alert.running) {
//        //console.log("start timer alert");
//        this.timer_alert.loop(Phaser.Timer.SECOND * 1.6, this.next_alert, this);
//        this.timer_alert.start();
//    }
};

Mst.hud.prototype.next_alert = function () {
    "use strict";
    var text;
    console.log("next alert");
    
    if (this.alert_sprites.length < 13) {
        if (this.alerts.length > 0) {
            text = this.alerts.shift();
            this.create_new_alert(text);
        }
    }
    
//    
//    this.alerts.shift();
//    
//    this.kill_alerts();
//    
//    if (this.alerts.length > 0) {
//        this.show_initial_alerts();
//    } else {
//        this.show_running = false;
//        this.timer_alert.stop();
//    }
};

//Mst.hud.prototype.show_initial_alerts = function () {
//    var alert, i;
//    //console.log("show initial alerts");
//    alert = this;
//    i = 0;
//    
//    this.alerts.forEach(function (alert_text) {
//        alert.create_new_alert(i, alert_text);
//        i++;
//    });    
//};

Mst.hud.prototype.kill_alert = function () {
    
    this.text_alert.text = "";
    this.visible = false;
    this.timer_alert.stop();
    this.kill();
    
    this.game_state.hud.alert.alert_sprites.splice(this);
    console.log(this.game_state.hud.alert.alert_sprites);
    
    this.game_state.hud.alert.next_alert();
};


//Mst.hud.prototype.kill_alerts = function () {
//    //console.log("kill alerts");
//    //console.log(this.alert_sprites);
//    this.alert_sprites.forEach(function (alert_sprite) {
//        //console.log(alert_sprite);
//        alert_sprite.text_alert.text = "";
//        alert_sprite.visible = false;
//        alert_sprite.kill();
//    });
//    
//    this.alert_sprites = [];
//};


Mst.hud.prototype.create_new_alert = function (text) {
    "use strict";
    var i, x, y, texture, alert, length;
    x = this.orig_pos.x;
    y = this.orig_pos.y;
    
    if (text.length < 13) {
        texture = "alt";
    } else {
        texture = "alt_160_20";
    }
    
    if (this.alert_sprites.length < 1) {
        i = 0;
    } else {
        i = this.i_pos_cast() + 1;
    }
    
    console.log("Alert i: " + i);
    
    //console.log(this.game_state.groups.alerts);
    alert = this.game_state.groups.alerts.getFirstDead();
    //console.log(alert);
    
    if (alert) {
        // if there is a dead stat, just reset it
        
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowStatWithSprite prefab
        length = this.game_state.groups.alerts.length;
        alert = new Mst.hud(this.game_state, "alert_" + length);
        this.game_state.groups.alerts.add(alert);
    }
    
    console.log(alert);
    
    alert.fixedToCamera = false;
    alert.reset(x, y + 20*i); //this.reset(x, y + 20*this.n_alert);
    alert.loadTexture(texture);
    alert.fixedToCamera = true;
    alert.visible = true;
    alert.alpha = 0.7;
    alert.text_alert.fixedToCamera = false;
    alert.text_alert.x = x + 8;
    alert.text_alert.y = y + 2 + 20*i; //this.text_alert.y = y + 2 + 20*this.n_alert;
    alert.text_alert.fixedToCamera = true;
    alert.text_alert.text = text;
    alert.i_pos = i;
    
    alert.timer_alert.add(Phaser.Timer.SECOND * 1.6, this.kill_alert, alert);
    alert.timer_alert.start();
    
    //console.log(alert.text_alert);
    this.alert_sprites.push(alert);
    console.log(this.alert_sprites);
};

Mst.hud.prototype.i_pos_cast = function () {
    "use strict";
    var i_pom = 0;
    var i_pos = 0;
    
    console.log(this.alert_sprites);

    for (var i; i < this.alert_sprites.length; i++) {
        i_pom = this.alert_sprites[i].i_pos;
        if (i_pom > i_pos) {
            i_pos = i_pom;
        }
    }
    
    console.log("i_pos " + i_pos);
    
    if (i_pos > 12) {
        i_pos = 0;
        
        for (var i; i < this.alert_sprites.length; i++) {
            i_pom = this.alert_sprites[i].i_pos;
            if (i_pom == i_pos) {
                i_pos++;
            }
        }
    }
    
    console.log("i_pos " + i_pos);
    
    return i_pos;
};


//Mst.hud.prototype.hide_alert = function () {
//    "use strict";
//    this.visible = false;
//    this.text_alert.text = "";
//};

/*Mst.hud.prototype.show_alt_act = function () {
    "use strict";
    console.log("show alt act");
    
    this.game_state.hud.alt.visible = true;
};*/

/*Mst.hud.prototype.hide_alt_tween = function () {
    "use strict";
    console.log("hide alt tween");    
    this.game_state.hud.alt.tween.start();
    this.game_state.hud.alt.tween_text_alt.start();    
    this.game_state.hud.alt.tween_text_alt1.start();
    this.game_state.hud.alt.tween.onComplete.addOnce(this.game_state.hud.alt.hide_alt, this);
};*/