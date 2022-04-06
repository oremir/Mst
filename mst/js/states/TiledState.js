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
        "follower": Mst.Follower.prototype.constructor,
        "bullet": Mst.Bullet.prototype.constructor,
        "enemy_spawner": Mst.EnemySpawner.prototype.constructor,
        "item_spawner": Mst.ItemSpawner.prototype.constructor,
        "chest_creator": Mst.ChestCreator.prototype.constructor,
        "chest": Mst.Chest.prototype.constructor,
        "enemy": Mst.Enemy.prototype.constructor,
        "wildanimal": Mst.WildAnimal.prototype.constructor,
        "sword": Mst.Sword.prototype.constructor,
        "signpost": Mst.Signpost.prototype.constructor,
        "bed": Mst.Bed.prototype.constructor,
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
    var group_name, object_layer, object_key, collision_tiles, load_player, key, foreg, grid, col;
    
    if (this.root_data.usr_id > 0) {
        this.save = {
            player: {},
            objects: this.map_data.objects
        };
        
        this.finder = new EasyStar.js();
        
        // create map layers
        console.log(this.map);
        this.layers = {};
        foreg = false;
        this.map.layers.forEach(function (layer) {
            if (layer.name !== "foreground") {
                this.layers[layer.name] = this.map.createLayer(layer.name);
                console.log("Layer: " + layer.name);
                console.log(this.layers[layer.name])
                if (layer.properties.collision) { // collision layer
                    collision_tiles = [];
                    grid = [];
                    layer.data.forEach(function (data_row) { // find tiles used in the layer
                        col = [];
                        data_row.forEach(function (tile) {
                            // check if it's a valid tile index and isn't already in the list
                            if (tile.index > 0 && collision_tiles.indexOf(tile.index) === -1) {
                                collision_tiles.push(tile.index);
                                col.push(1);
                            } else {
                                col.push(0);
                            }
                        }, this);   
                        grid.push(col);
                    }, this);
                    this.map.setCollision(collision_tiles, true, layer.name);
                    this.grid = grid;
                    console.log(this.grid);
                }
            } else {
                foreg = true;
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
        
        
        
        // ......................... Map Objects ............................
        
        console.log("Map objects:");
        console.log(this.map.objects);
        
        for (object_layer in this.map.objects) {
            if (this.map.objects.hasOwnProperty(object_layer)) {
                // create layer objects
                this.map.objects[object_layer].forEach(this.create_object, this);
            }
        }
        
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
        
        this.prefabs.player.make_followers();
        
        if (foreg) {
            this.layers["foreground"] = this.map.createLayer("foreground");
        }
        
        this.core_data.groupshud.forEach(function (group_name) {
            this.groups[group_name] = this.game.add.group();
        }, this);
        
        // ......................... HUD Init 1 ............................
        
        this.hud = {};
        this.hud.right_window = new Mst.hud(this, "right_window");
        this.hud.middle_window = new Mst.hud(this, "middle_window");
        this.hud.cards = new Mst.hud(this, "cards");
        this.hud.book = new Mst.hud(this, "book");
        this.hud.newsppr = new Mst.hud(this, "newsppr");
        this.hud.alt = new Mst.hud(this, "alt");
        this.hud.question = new Mst.hud(this, "question");
        this.hud.dialogue = new Mst.hud(this, "dialogue");
        this.hud.alert = new Mst.hud(this, "alert");
        
        // ......................... Night Init ..............................
        
        this.night = new Mst.night(this, this.prefabs.player.save.properties.gtimealpha);
        
        // ......................... HUD Init 2 ..............................
        
        this.hud.stats = this.game.plugins.add(Mst.HUD, this, this.core_data.hud);
        
        // ......................... Core Objects ............................
        
        for (object_key in this.core_data.objects) {
            this.create_object(this.core_data.objects[object_key]);

            //console.log(this.core_data.objects[object_key]);
        }
        
        //console.log(this.core_data.hud);
        
        // ......................... Test quest ............................
        
        this.items = {};
        this.items.NPCs = {};
        this.items.otherplayers = {};
        
        this.groups.NPCs.forEachAlive(function (NPC) {            
            this.items.NPCs[NPC.unique_id] = NPC.name;
            //console.log("Test NPCs: ");
            //console.log(this.items.NPCs);
        }, this);
        
        this.groups.otherplayers.forEachAlive(function (otherplayer) {            
            this.items.otherplayers[otherplayer.usr_id] = otherplayer.name;
            //console.log("Test otherplayers: ");
            //console.log(this.items.otherplayers);
        }, this);
        
        console.log("Items:");
        console.log(this.items);
        
        var quest_state, quest_new;
        var quests = this.quest_data.quests;
        var player = this.prefabs.player;
        
        for (var i = 0; i < quests.length; i++) {
            quest_state = player.test_quest("idstate", quests[i].qid);
            if (quest_state !== "fin") {
                console.log(quests[i].qid + " " + quest_state);
                
                quest_new = quests[i];
                quest_new.state = quest_state;
                
                player.quests[quest_new.qid] = quest_new;
            }            
        }
        
        this.groups.NPCs.forEachAlive(function (NPC) {
            console.log("Test Quest bubble: " + NPC.name);
            NPC.add_ren();
            NPC.test_quest();
        }, this);
        
        this.groups.otherplayers.forEachAlive(function (otherplayer) {
            console.log("Test Quest bubble: " + otherplayer.name);
            otherplayer.add_ren();
            otherplayer.test_quest();
        }, this);
        
        this.quest_data.rumours = {};
        this.quest_data.act_rumours = [];
        for (var i = 0; i < this.quest_data.texts.length; i++) {
            if (this.quest_data.texts[i].type === 'rumour') {
                this.quest_data.rumours[i] = this.quest_data.texts[i];
                
                key = this.prefabs.player.stats.rumours.indexOf(i);
                if (key < 0) {
                    this.quest_data.act_rumours.push(this.quest_data.texts[i]);
                }
            }
        }
        console.log(this.quest_data.rumours);
        console.log(this.quest_data.act_rumours);
        
        this.prefabs.player.final_tests();
        
        console.log("Prefabs:");
        console.log(this.prefabs);
        console.log(this.groups);
        
        console.log(this.map_data);
        this.hud.alert.show_alert("M:" + this.map_data.map.map_int);
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
    this.save.enplayer = JSON.stringify(this.prefabs.player.save);
    
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

Mst.TiledState.prototype.make_object = function (position, oid, type) {
    "use strict";
    
    var game_state = this;
    var chest = {};
    var player = this.prefabs.player;
    var uid = player.usr_id;
    var a_type = type.split("|");
    if (typeof (a_type[1]) !== 'undefined') {
        type = a_type[0];
    }
        
    var save = {};
    save.type = "chest"
    save.action = "LOAD";
    save.obj_id = oid;
    save.name = "";

    var d = new Date();
    var n = d.getTime();

    console.log(save);

    $.post("object.php?time=" + n + "&uid=" + uid, save)
        .done(function (data) {
            console.log("Chest load success");
            console.log(data);
            var resp, name, properties;
            resp = JSON.parse(data);
            properties = resp.obj.properties;
            name = resp.obj.name;
        
            game_state.save.objects.push(resp.obj);
        
            if (type === 'test witness' || type === 'Prepare ftp' || type === '14' || type === 'Questions') {
                properties.texture = "blank_spritesheet";
            }
        
            chest = new Mst.Chest(game_state, name, position, properties);
            
            if (type === "Questions") {
                var dname = parseInt(a_type[2]);
                console.log("Make - witness name: " + dname);
                var ren = game_state.prefabs[dname].ren_sprite;
                console.log(ren);

                ren.next_question("", "");
            }
        
            if (type === 'Prepare ftp') {
                player.prepare_ftprints_onmap();
            }
        })
        .fail(function (data) {
            console.log("Chest load error");
            console.log(data);

            success = false;
        });
        
    return chest;
};

Mst.TiledState.prototype.make_otherplayer = function (position, uid, type) {
    "use strict";
    
    var game_state = this;
    var otherplayer = {};
    var player = this.prefabs.player;
    var a_type = type.split("|");
    if (typeof (a_type[1]) !== 'undefined') {
        type = a_type[0];
    }
    
    
    var save = {};
    save.type = "player"
    save.action = "LOAD";
    save.obj_id = 0;
    save.name = "";

    var d = new Date();
    var n = d.getTime();

    console.log(save);

    $.post("object.php?time=" + n + "&uid=" + uid, save)
        .done(function (data) {
            console.log("OtherPlayer load success");
            console.log(data);
            var resp, name, properties;
            resp = JSON.parse(data);
            properties = resp.obj.properties;
            name = resp.obj.name;
        
            game_state.save.objects.push(resp.obj);
        
            console.log(type);
        
            if (type === "investigate") {
                properties.texture = "blank_spritesheet";
            }
        
            otherplayer = new Mst.OtherPlayer(game_state, name, position, properties);
            otherplayer.add_ren();
            otherplayer.test_quest();
        
            //console.log(otherplayer);
        
            if (type === "dead") {
                var nurse = otherplayer.test_nurse();
                
                player.killed = false;
                player.save.properties.killed = false;
            }
        
            if (type === "investigate") {
                player.cases_loaded.person[uid] = otherplayer;
                
                console.log(a_type);
                var pcid_id = a_type.length - 2;
                var nid_id = a_type.length - 1;
                var bt3_id = a_type.length - 3;
                
                var pcid = parseInt(a_type[pcid_id]);
                var nid = parseInt(a_type[nid_id]);              
                var bt = a_type[1];
                var bt2 = a_type[2];
                var bt3 = a_type[bt3_id];
                
                if (bt !== 'P1' && bt !== 'Book') {
                //var badge = otherplayer.badges[bt];
                    
                    var ub_val2 = player.get_badge_val("14", bt2, uid, type, "");
                    var ub_val3 = player.get_badge_val("14", bt3, uid, type, "");
                    
                    var new_evidence = "";

                    if (a_type.length < 6) {
                        if (ub_val2 !== '') {
                            new_evidence = bt + "|" + bt2 + "|" + ub_val;
                            player.cases[pcid].evidences.push(new_evidence);
                        }
                    } else {
                        if (ub_val3 !== '') {
                            for (var i = 1; i < pcid_id; i++) {
                                new_evidence += a_type[i];
                                if (i < bt3_id) {
                                    new_evidence += "|";
                                } else {
                                    new_evidence += ub_val3;
                                }
                            }

                            player.cases[pcid].evidences[nid] = new_evidence;
                        }
                    }
                    const t2 = {
                        pcid: pcid,
                        c_type: "evidence"
                    };

                    game_state.hud.book.book_investigate(t2);
                } else {
                    if (bt === 'Book') {
                        const firstid = parseInt(bt2);
                        const t2 = {
                            pcid: nid,
                            pcid1: pcid,
                            firstid: firstid,
                            c_type: "evidence",
                            c_type1: "show"
                        };
                        
                        game_state.hud.book.book_investigate(t2);
                    }
                }
            }
        })
        .fail(function (data) {
            console.log("OtherPlayer load error");
            console.log(data);

            success = false;
        });
        
    return otherplayer;    
};

Mst.TiledState.prototype.getGridXY = function (x, y) {
    "use strict";
    
    return this.grid[y][x];
};

Mst.TiledState.prototype.setGridXY = function (x, y, val) {
    "use strict";
    
    this.grid[y][x] = val;
};

Mst.TiledState.prototype.playerOfUsrID = function (usr_id) {
    "use strict";
    
    console.log("playerOfUsrID:" + usr_id);
    
    var key, object_key, uid;
    key = "";
    for (object_key in this.prefabs) {
        //console.log(object_key);
        //console.log(this.prefabs[object_key]);
        //console.log(usr_id);
        if (typeof(this.prefabs[object_key].usr_id) != 'undefined') {
            usr_id = parseInt(usr_id);
            uid = parseInt(this.prefabs[object_key].usr_id);
            console.log(uid);
            if (uid === usr_id) {
                key = object_key;
                console.log(key);
            }
        }
    }

    return key;
};

Mst.TiledState.prototype.NPCofID = function (usr_id) {
    "use strict";
    
    console.log("NPCofID:" + usr_id);
    
    var key, object_key, uid;
    key = "";
    for (object_key in this.prefabs) {
//            console.log(object_key);
//            console.log(objects[object_key]);
//            console.log(usr_id);
        if (typeof(this.prefabs[object_key].unique_id) != 'undefined') {
            usr_id = parseInt(usr_id);
            uid = parseInt(this.prefabs[object_key].unique_id);
            if (uid === usr_id) {
                key = object_key;
                console.log(key);
            }
        }
    }

    return key;
};

Mst.TiledState.prototype.objectofID = function (obj_id) {
    "use strict";
    
    console.log("objectofID:" + obj_id);
    
    var key, object_key, oid;
    key = "";
    for (object_key in this.prefabs) {
//            console.log(object_key);
//            console.log(this.prefabs[object_key]);
//            console.log(usr_id);
        if (typeof(this.prefabs[object_key].obj_id) != 'undefined') {
            obj_id = parseInt(obj_id);
            oid = parseInt(this.prefabs[object_key].obj_id);
            if (oid === obj_id) {
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
        if (typeof(this.save.objects[object_key].usr_id) !== 'undefined') {
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
    //console.log(this.save.objects);
    
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

Mst.TiledState.prototype.get_players = function () {
    "use strict";
    var object_key, uid, players;
    
    players = [];
    for (object_key in this.prefabs) {
        if (typeof(this.prefabs[object_key].usr_id) != 'undefined') {
            uid = parseInt(this.prefabs[object_key].usr_id);
            players.push(uid);
        }
    }

    return players;
};

Mst.TiledState.prototype.get_NPCs = function () {
    "use strict";
    var object_key, uid, NPCs;
    
    NPCs = [];
    for (object_key in this.prefabs) {
        if (typeof(this.prefabs[object_key].unique_id) != 'undefined') {
            uid = parseInt(this.prefabs[object_key].unique_id);
            if (uid > 0) {
                NPCs.push(uid);
            }
        }
    }

    return NPCs;
};

Mst.hud = function (game_state, name) {
    "use strict";
    var text_style, name_img;
    
    //console.log(name + " " + name.substr(0, 6));
    if (name.substr(0, 6) == "alert_") {
        name_img = "alert";
    } else {
        name_img = name;
        
        if (name === 'newsppr') {
            name_img = "newspprf_back";
        }
        
        if (name === 'cards') {
            name_img = "blank_image";
        }
    }
    
    Phaser.Image.call(this, game_state.game, 273, 47, name_img);
    
    this.game_state = game_state;
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
            this.game_state.groups.hud.add(this);
            this.text_alt = {};
            
            
            
            break;
            
        case "question":
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_question = this.game_state.game.add.text(16, 242, "", text_style);
            this.text_question.fixedToCamera = true;
            this.reset(8, 240);
            this.visible = false;
            this.fixedToCamera = true;
            
            this.question_obj = {};
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.use_question, this);
            
            break;
        case "dialogue":            
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_name = this.game_state.game.add.text(16, 244, "", text_style);
            this.text_name.fixedToCamera = true;
            this.text_dialogue = this.game_state.game.add.text(16, 270, "", text_style);
            this.text_dialogue.fixedToCamera = true;
            this.text_heart = this.game_state.game.add.text(480, 270, "", text_style);
            this.text_heart.fixedToCamera = true;
            this.reset(8, 240);
            this.visible = false;
            this.fixedToCamera = true;
            
            this.dialogue_name = "";
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.hide_dialogue_onclick, this);
            
            break;
        case "cards":            
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.reset(8, 240);
            this.visible = false;
            this.fixedToCamera = true;
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.hide_cards_onclick, this);
            
            this.cards = [];
            this.cards_player_deck = [];
            this.cards_enemy_deck = [];
            this.cards_enemy_draw = [];
            
            break;    
        case "middle_window":            
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_mw = this.game_state.game.add.text(162, 69, "", text_style);
            this.text_mw.fixedToCamera = true;
            this.reset(150, 57);
            this.visible = false;
            this.fixedToCamera = true;
            this.options = [];
            this.mw_object = {};
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.hide_mw_onclick, this);
            
            break;
        case "book":            
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_book = this.game_state.game.add.text(162, 69, "", text_style);
            this.text_book.fixedToCamera = true;
            this.reset(10, 42);
            this.visible = false;
            this.fixedToCamera = true;
            this.texts = [];
            this.book_obj = [];
            this.nid = -1;
            this.act_case = -1;
            
            this.inputEnabled = true;
            this.events.onInputDown.add(this.hide_book_onclick, this);
            
            break;
        case "newsppr":            
            this.game_state.groups.hud.add(this);
            text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_nwpr = this.game_state.game.add.text(162, 69, "", text_style);
            this.text_nwpr.fixedToCamera = true;
            this.reset(10, 49);
            this.visible = false;
            this.fixedToCamera = true;
            this.texts = [];
            this.np_obj = [];
            this.o_text = "";
            
            this.inputEnabled = true;
            this.input.useHandCursor = true;
            this.events.onInputDown.add(this.hide_newsppr_onclick, this);
            
            break;
        case "alert":
            this.game_state.groups.hud.add(this);
            this.orig_pos = {x: 8, y: 50};
            text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
            this.text_alert = this.game_state.game.add.text(275, 53, "", text_style);
            //this.text_alert.anchor.set(0.5);
            //this.anchor.set(0.5);
            this.fixedToCamera = true;
            
            this.alerts = [];
            this.alert_sprites = [];
            this.alerts_i = [];
            this.indexes = {};
            this.show_running = false;
            
            break;
        default:            
            if (name.substr(0, 5) == "alert") {
                this.game_state.groups.hud.add(this);
                //console.log(name);

                text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
                this.text_alert = this.game_state.game.add.text(275, 53, "", text_style);
            
                this.timer_alert = this.game_state.game.time.create(false);
                this.i_pos = 0;

                console.log("New alert!");
                console.log(this);
            } else {
                this.game_state.groups.unhud.add(this);
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

Mst.hud.prototype.show_mw = function (text, object, options) {
    "use strict";
    var player = this.game_state.prefabs.player;
    
    console.log(player.opened_mw);
    
    if (player.opened_mw === '') {
        player.opened_mw = "MW";
        player.close_state.push("MW");
        player.close_context.push(object.name);
        this.visible = true;
        this.alpha = 0.7;
        this.text_mw.text = text;
        console.log(this.text_mw);

        this.mw_object = object;

        if (typeof(options) !== 'undefined') {
            this.show_options(options);
        }
        
        return true;
    } else {
        return false;
    }
};

Mst.hud.prototype.hide_mw_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_mw();
};

Mst.hud.prototype.hide_mw = function () {
    "use strict";
    this.visible = false;
    this.game_state.prefabs.player.opened_mw = "";
    this.text_mw.text = "";
    this.hide_options();
    this.mw_object.hited = false;
    this.mw_object = {};
};

Mst.hud.prototype.show_options = function (options) {
    "use strict";
    var key, x, y, text, text_style;
    
    console.log(this.game_state.hud.middle_window);
    
//    x = this.game_state.hud.middle_window.x + 13;
//    y = this.game_state.hud.middle_window.y + 75;
    
    x = 163;
    y = 212;
    
    text_style = {"font": "12px Arial", "fill": "#BF9F00"};
    for (key in options) {
        text = this.game_state.game.add.text(x + (60 * key), y, "", text_style);
        text.fixedToCamera = true;
        text.inputEnabled = true;
        text.input.useHandCursor = true;
        
        switch (options[key]) {
            case "yes":
                text.text = "[ano]";
                text.events.onInputDown.add(this.option_yes, this);
                break;
            case "no":
                text.text = "[ne]";
                text.events.onInputDown.add(this.option_no, this);
                break;
            case "ok":
                text.text = "[ok]";
                text.events.onInputDown.add(this.option_ok, this);
                break;
            case "steal":
                text.text = "[ukrást]";
                text.events.onInputDown.add(this.option_steal, this);
                break;
            case "investigate":
                text.text = "[vyšetřit]";
                text.events.onInputDown.add(this.option_investigate, this);
                break;
        }
        
        this.options.push(text);
    }
};

Mst.hud.prototype.hide_options = function () {
    "use strict";
    this.options.forEach(function (option) {
        option.destroy();
    });
};

Mst.hud.prototype.option_yes = function () {
    "use strict";
    this.mw_object.option_yes();
    this.hide_mw_onclick();
};

Mst.hud.prototype.option_no = function () {
    "use strict";
    this.mw_object.option_no();
    this.hide_mw_onclick();
};

Mst.hud.prototype.option_ok = function () {
    "use strict";
    this.mw_object.option_ok();
    this.hide_mw_onclick();
};

Mst.hud.prototype.option_steal = function () {
    "use strict";
    this.mw_object.option_steal();
    this.hide_mw_onclick();
};

Mst.hud.prototype.option_investigate = function () {
    "use strict";
    this.mw_object.option_investigate();
    this.hide_mw_onclick();
};

Mst.hud.prototype.show_cards = function () {
    "use strict";
    console.log("Show cards");
    
    this.game_state.prefabs.player.close_state.push("Cards");
    this.game_state.prefabs.player.close_context.push("Cards");
    
    const card = this.game_state.groups.cards.create(20, 220, 'card_spritesheet', 0);
    card.fixedToCamera = true;
    card.inputEnabled = true;
    card.events.onInputDown.add(this.hide_cards_onclick, this);
    card.visible = true;
    this.game_state.hud.cards.cards.push(card);
    
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    this.game_state.prefabs.items.kill_stats();
    this.game_state.prefabs.equip.hide();
};

Mst.hud.prototype.hide_cards_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_cards();
};

Mst.hud.prototype.hide_cards = function () {
    "use strict";
    
    //console.log(this);
    
    this.game_state.hud.cards.cards.forEach(function (card) {
        card.destroy();
    });
    
    this.visible = false;    
    
    this.game_state.prefabs.items.show_initial_stats();
    this.game_state.prefabs.equip.show();
};

Mst.hud.prototype.show_book = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.push("Book");
    this.game_state.prefabs.player.close_context.push("Book");
    
    this.visible = true;
    this.alpha = 1;
    
    this.game_state.prefabs.items.kill_stats();
    this.game_state.prefabs.equip.hide();
    
    this.book_main();
};

Mst.hud.prototype.hide_book_content = function () {
    "use strict";
    
    this.book_obj.forEach(function (obj) {
        obj.destroy();
    });
    this.np_obj = [];
    
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
};

Mst.hud.prototype.hide_book_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_book();
};

Mst.hud.prototype.hide_book = function () {
    "use strict";
    
    //console.log(this);
    
    this.visible = false;
    this.hide_book_content();    
    
    this.game_state.prefabs.items.show_initial_stats();
    this.game_state.prefabs.equip.show();
};

Mst.hud.prototype.book_main = function (n) {
    "use strict";
    
    this.book_make_bookmark(0, 0, "main");
    this.book_make_bookmark(1, 1, "acquaintance");
    this.book_make_bookmark(2, 1, "investigate");    
    
    const player = this.game_state.prefabs.player;
    
    const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };
    const text_value = player.name;
    let text = this.game_state.game.add.text(60, 105, text_value, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    let f_texture = "";
    if (player.ren_texture === "") {
        if (player.gender === "male") {
            f_texture = "male_f";
        } else {
            f_texture = "female_f";
        }  
    } else {
        f_texture = player.ren_texture.substring(0, player.ren_texture.length - 3) + "f";
    }
    
    console.log(f_texture);
    
    const photo = this.game_state.groups.hud.create(60, 124, f_texture);
    photo.fixedToCamera = true;
    photo.visible = true;
    this.book_obj.push(photo);
    
    const stopy = player.stats.badges['14'];
    const vzhled = player.stats.badges['15'];
    console.log(stopy);
    console.log(vzhled);
    const stopy_a = stopy.split("|");
    const vzhled_a = vzhled.split("|");
    
    let ind = parseInt(vzhled_a[0].substr(1,vzhled_a[0].length));
    const rasa = this.game_state.core_data.rasa[ind];
    text = this.game_state.game.add.text(130, 125, rasa, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    let vyskavaha = stopy_a[0].substr(1,stopy_a[0].length) + " cm, ";
    vyskavaha += stopy_a[1].substr(1,stopy_a[1].length) + " kg ";
    text = this.game_state.game.add.text(130, 138, vyskavaha, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    const bota = "Bota: " + stopy_a[2].substr(1,stopy_a[2].length);
    text = this.game_state.game.add.text(130, 151, bota, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    const vek = "cca " + vzhled_a[1].substr(1,vzhled_a[1].length) + " let";
    text = this.game_state.game.add.text(130, 164, vek, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    text = this.game_state.game.add.text(130, 177, "Vlasy:", text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    ind = parseInt(vzhled_a[3].substr(1,vzhled_a[3].length));
    const vlasy = this.game_state.core_data.barva[ind];
    text = this.game_state.game.add.text(135, 190, vlasy, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    ind = parseInt(vzhled_a[4].substr(1,vzhled_a[4].length));
    const vlasyd = this.game_state.core_data.delkavlasu[ind];
    text = this.game_state.game.add.text(135, 203, vlasyd, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
    
    ind = parseInt(vzhled_a[2].substr(1,vzhled_a[2].length));
    const postava = "Postava: " + this.game_state.core_data.postava[ind];
    text = this.game_state.game.add.text(60, 220, postava, text_style);
    text.fixedToCamera = true;
    this.texts.push(text);
};
    
    

Mst.hud.prototype.book_acquaintance = function (n) {
    "use strict";
    
    this.book_make_bookmark(0, 1, "main");
    this.book_make_bookmark(1, 0, "acquaintance");
    this.book_make_bookmark(2, 1, "investigate");
    
    const rel = this.game_state.prefabs.player.stats.relations;
    rel.sort(function(a, b){return b.exp - a.exp});
    
    const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };
    let index = 0;
    let index2 = 0;
    
    for (let key in rel) {
        if (key < 18) {
            const text_value = rel[key].name + "\t " + rel[key].exp;
            //text = this.game_state.game.add.text(293, 95 + 14 * index, text_value, text_style);
            const text = this.game_state.game.add.text(60, 105 + 13 * index, text_value, text_style);
            text.fixedToCamera = true;
            this.texts.push(text);
            index ++;
        }
        if (key > 17 && key < 35) {
            const text_value = rel[key].name + "\t " + rel[key].exp;
            const text = this.game_state.game.add.text(310, 105 + 14 * index2, text_value, text_style);
            //text = this.game_state.game.add.text(60, 105 + 13 * index, text_value, text_style);
            text.fixedToCamera = true;
            this.texts.push(text);
            index2 ++;
        }
        
    }
};

Mst.hud.prototype.book_investigate = function (t1) {
    "use strict";
    var text;
    
    console.log(t1);
    
    let nid = -1;
    if (typeof (t1) === 'undefined') {
        nid = this.nid;
    } else {
        nid = t1.pcid;
    }
    
    this.hide_book_content();
    
    this.book_make_bookmark(0, 1, "main");
    this.book_make_bookmark(1, 1, "acquaintance");
    this.book_make_bookmark(2, 0, "investigate");
    
    const player = this.game_state.prefabs.player;
    const cases = player.cases;
    const cases_loaded = player.cases_loaded;
    
    const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };
    let index = 0;
    
    if (nid < 0) {
        for (let pcid in cases) {
            let text_value = "#" + pcid + " ";
            switch (cases[pcid].type) {
                case "stolen":
                    text_value += "Krádež";
                break;
            }
            text_value += " na M: " + cases[pcid].M;
            const text = this.game_state.game.add.text(60, 105 + 13 * index, text_value, text_style);
            
            text.inputEnabled = true;
            text.input.useHandCursor = true;
            text.pcid = pcid;
            text.c_type = "evidence";
            text.events.onInputDown.add(this.book_investigate, this, text);
            text.fixedToCamera = true;
            this.texts.push(text);
            
            if (pcid === this.act_case) {
                console.log(pcid + ": active");
            }
            
            index++;
        }
    } else {
        if (t1.c_type === 'evidence') {
            //console.log(cases);
            const evidences = cases[nid].evidences;
            this.act_case = nid;
            //console.log(this);
            
            let text_value = "#" + nid + " ";
            switch (cases[nid].type) {
                case "stolen":
                    text_value += "Krádež";
                break;
            }
            text_value += " na M: " + cases[nid].M;
            let text = this.game_state.game.add.text(60, 105, text_value, text_style);
            text.fixedToCamera = true;
            this.texts.push(text);

            index++;
            
            let firstid = 0;            
            console.log(index + evidences.length);
            if ((index + evidences.length) > 18) {
                if (typeof(t1.firstid) !== 'undefined') {
                    firstid = t1.firstid;
                }
                
                if (firstid + 18 < evidences.length) {
                    const tpage = this.game_state.groups.hud.create(475, 348, 'book_bm_spritesheet', 3);
                    tpage.inputEnabled = true;
                    tpage.input.useHandCursor = true;
                    tpage.pcid = nid;
                    tpage.firstid = firstid + 17;
                    tpage.c_type = "evidence";
                    tpage.events.onInputDown.add(this.book_investigate, this, tpage);
                    tpage.fixedToCamera = true;
                    tpage.visible = true;
                    this.book_obj.push(tpage);
                    console.log(tpage);
                }

                if (firstid > 0) {
                    const tpage1 = this.game_state.groups.hud.create(28, 348, 'book_bm_spritesheet', 2);
                    tpage1.inputEnabled = true;
                    tpage1.input.useHandCursor = true;
                    tpage1.pcid = nid;
                    tpage1.firstid = firstid - 17;
                    tpage1.c_type = "evidence";
                    tpage1.events.onInputDown.add(this.book_investigate, this, tpage1);
                    tpage1.fixedToCamera = true;
                    tpage1.visible = true;
                    this.book_obj.push(tpage1);
                }
            }
            
            for (let id = firstid; id < evidences.length; id++) {
                console.log("Index: " + index + " Id: " + id);
                if (index < 18) {
                    const a_ne = evidences[id].split("|");
                    const e_type = a_ne[0];
                    if (e_type === 'NPC' || e_type === 'player') {
                        const e_uid = parseInt(a_ne[1]);
                        const e_name = player.get_relation_name(e_uid, e_type)
                        text_value = "- " + e_name;
                        console.log(e_name + " - evidence: " + evidences[id]);
                    } else {
                        text_value = "- " + evidences[id];
                    }
                    text = this.game_state.game.add.text(70, 105 + 13 * index, text_value, text_style);
                    text.fixedToCamera = true;
                    text.inputEnabled = true;
                    text.pcid = nid;
                    text.pcid1 = id;
                    text.firstid = firstid;
                    text.c_type = "evidence";
                    text.c_type1 = "show";
                    text.input.useHandCursor = true;
                    text.events.onInputDown.add(this.book_investigate, this, text);
                    this.texts.push(text);

                    const near = player.near_ftprints(evidences[id])
                    console.log(near);
                    const near2 = player.test_ftprint(id, evidences);
                    console.log(near2);
                    if (near && near2.b) {
                        const lupa = this.game_state.groups.hud.create(57, 106 + 13 * index, 'lupa11', 0);
                        lupa.inputEnabled = true;
                        lupa.input.useHandCursor = true;
                        lupa.pcid = id;
                        lupa.pcid1 = nid;
                        lupa.c_type = "ftp";
                        lupa.events.onInputDown.add(this.book_investigate, this, lupa);
                        lupa.fixedToCamera = true;
                        lupa.visible = true;
                        this.book_obj.push(lupa);
                    }
                }

                index++;
            } 
            
            if (t1.c_type1 === 'show') {
                console.log("Book investigate show");
                console.log(evidences[t1.pcid1]);
                
                const wit_un = player.unpack_witness(evidences[t1.pcid1]);
                console.log(wit_un);
                
                const e_uid = parseInt(wit_un.uid);
                if (wit_un.type === 'NPC' || wit_un.type === 'player') {
                    const cont = "Book|" + "|" + firstid + "|" + t1.pcid1 + "|" + nid;
                    const character = player.get_full_person(e_uid, wit_un.type, cont);
                    console.log(character);
                    
                    if (typeof (character) !== 'undefined') {
                        text_value = character.name;
                        text = this.game_state.game.add.text(310, 105, text_value, text_style);
                        text.fixedToCamera = true;
                        this.texts.push(text);

                        let fsuff = "";
                        let f_texture = "";                        
                        if (character.gender === "male") {
                            f_texture = "male_f";
                        } else {
                            f_texture = "female_f";
                            fsuff = "a";
                        }  
                        if (character.ren_texture !== "") {
                            f_texture = character.ren_texture.substring(0, character.ren_texture.length - 3) + "f";
                        }

                        console.log(f_texture);

                        const photo = this.game_state.groups.hud.create(310, 124, f_texture);
                        photo.fixedToCamera = true;
                        photo.visible = true;
                        this.book_obj.push(photo);

                        const stopy = character.badges['14'];
                        const vzhled = character.badges['15'];
                        console.log(stopy);
                        console.log(vzhled);
                        
                        if (typeof (stopy) !== 'undefined') {
                            const stopy_a = stopy.split("|");

                            let vyskavaha = stopy_a[0].substr(1,stopy_a[0].length) + " cm, ";
                            vyskavaha += stopy_a[1].substr(1,stopy_a[1].length) + " kg ";
                            text = this.game_state.game.add.text(130 + 250, 138, vyskavaha, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            const bota = "Bota: " + stopy_a[2].substr(1,stopy_a[2].length);
                            text = this.game_state.game.add.text(130 + 250, 151, bota, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                        }

                        if (typeof (vzhled) !== 'undefined') {
                            const vzhled_a = vzhled.split("|");

                            let ind = parseInt(vzhled_a[0].substr(1,vzhled_a[0].length));
                            const rasa = this.game_state.core_data.rasa[ind];
                            text = this.game_state.game.add.text(130 + 250, 125, rasa, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                        
                            const vek = "cca " + vzhled_a[1].substr(1,vzhled_a[1].length) + " let";
                            text = this.game_state.game.add.text(130 + 250, 164, vek, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            text = this.game_state.game.add.text(130 + 250, 177, "Vlasy:", text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                            ind = parseInt(vzhled_a[3].substr(1,vzhled_a[3].length));
                            const vlasy = this.game_state.core_data.barva[ind];
                            text = this.game_state.game.add.text(135 + 250, 190, vlasy, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                            ind = parseInt(vzhled_a[4].substr(1,vzhled_a[4].length));
                            const vlasyl = this.game_state.core_data.delkavlasu[ind];
                            text = this.game_state.game.add.text(135 + 250, 203, vlasyl, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            ind = parseInt(vzhled_a[2].substr(1,vzhled_a[2].length));
                            const postava = "Postava: " + this.game_state.core_data.postava[ind];
                            text = this.game_state.game.add.text(60 + 250, 220, postava, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                        }
                        
                        if (typeof (wit_un.o.M) !== 'undefined') {
                            text_value = "Byl" + fsuff + " na mapě " + wit_un.o.M;
                        } else {
                            text_value = "Nepamatuje si, kde byl" + fsuff;
                        }
                        
                        text = this.game_state.game.add.text(60 + 250, 246, text_value, text_style);
                        text.fixedToCamera = true;
                        this.texts.push(text);
                        
                        if (wit_un.o.P === '1' && typeof(wit_un.o.R) !== 'undefined') {
                            const cgender = wit_un.o.G;
                            let mztxt = "";
                            if (cgender === 'M') {
                                fsuff = "";
                                mztxt = "muž";
                            } else {
                                fsuff = "a";
                                mztxt = "žena";
                            }
                            let ind = parseInt(wit_un.o.R);
                            let txt = this.game_state.core_data.rasa[ind];
                            text_value = "Byl to " + txt + ", " + mztxt + ".";                        
                            text_value += " Výška " + wit_un.o["14H"] + " cm.";

                            text = this.game_state.game.add.text(60 + 250, 259, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            text_value = "Věk asi " + wit_un.o.A + " let.";

                            ind = parseInt(wit_un.o.F);
                            txt = this.game_state.core_data.postava[ind];
                            text_value += " Postava " + txt + ".";

                            text = this.game_state.game.add.text(60 + 250, 272, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                        } else {
                            text_value = "Nikoho neviděl" + fsuff;
                            text = this.game_state.game.add.text(60 + 250, 259, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);
                        }
                    }
                } else {                    
                    text_value = evidences[t1.pcid1];
                    text = this.game_state.game.add.text(310, 105 + 13, text_value, text_style);
                    text.fixedToCamera = true;
                    this.texts.push(text);
                }
            }
        } else {
            const evidences = cases[t1.pcid1].evidences; 
            let new_evidence = player.investigate_ftprint(nid, evidences);
            console.log(new_evidence);
            if (new_evidence !== '') {
                const a_ne = new_evidence.split("|");
                const ane_nid = parseInt(a_ne.pop());
                new_evidence = a_ne.join("|");
                
                if (a_ne.length < 4) {
                    player.cases[t1.pcid1].evidences.push(new_evidence);
                } else {
                    player.cases[t1.pcid1].evidences[ane_nid] = new_evidence;
                }
            }
            const t2 = {
                pcid: t1.pcid1,
                c_type: "evidence"
            }; 
            
            this.book_investigate(t2);
        }
    }
};

Mst.hud.prototype.book_make_bookmark = function (n, m, o_text) {
    "use strict";
    
    let bk_mrk = this.game_state.groups.hud.create(502, 85 + 45 * n, 'book_bm_spritesheet', m);
    bk_mrk.inputEnabled = true;
    bk_mrk.input.useHandCursor = true;
    bk_mrk.events.onInputDown.add(this.book_bookmark, this);
    bk_mrk.fixedToCamera = true;
    bk_mrk.o_text = o_text;
    bk_mrk.visible = true;
    this.book_obj.push(bk_mrk);
    
    bk_mrk = this.game_state.groups.hud.create(512, 92 + 45 * n, 'book_ico_spritesheet', n);
    bk_mrk.fixedToCamera = true;
    bk_mrk.visible = true;
    this.book_obj.push(bk_mrk);
};

Mst.hud.prototype.book_bookmark = function (bm) {
    "use strict";
    
    this.hide_book_content();
    
    switch(bm.o_text) {
        case "main":
            console.log(bm.o_text);
        
            this.book_main();
        break;
        case "acquaintance":
            console.log(bm.o_text);
        
            this.book_acquaintance(0);
        break;
            
        case "investigate":
            console.log(bm.o_text);
        
            this.book_investigate();
        break;
    }
};

Mst.hud.prototype.show_question = function (obj, text) {
    "use strict";
    this.game_state.prefabs.player.close_state.push("Question");
    this.game_state.prefabs.player.close_context.push("Question");
    
    console.log(text);
    
    this.question_obj = obj;
    
    this.text_question.text = text;
    this.visible = true;
    this.alpha = 0.6;
};

Mst.hud.prototype.use_question = function () {
    "use strict";
    var text = this.question_obj.new_answer_text;
    var context = this.question_obj.answer_context;
    
    this.question_obj.next_question(text, context);
    this.hide_question_onclick();
};

Mst.hud.prototype.hide_question_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_question();
};

Mst.hud.prototype.hide_question = function () {
    "use strict";
    
    //console.log(this);
    console.log("Hide question: " + this.text_question.text);
    this.visible = false;
    this.text_question.text = "";
};

Mst.hud.prototype.show_newsppr = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.push("Newsppr");
    this.game_state.prefabs.player.close_context.push("Newsppr");
    
    this.visible = true;
    this.alpha = 1;
    
    this.game_state.prefabs.items.kill_stats();
    this.game_state.prefabs.equip.hide();
    
    this.show_np_content("");
};

Mst.hud.prototype.show_np_content = function (cont) {
    "use strict";
    var np_img, np, article, text_style, text_title, text;
    
    console.log("Show content newspaper");
    
    this.np_i = 16;
    np = this.game_state.quest_data.texts[16];
    console.log(np);
    
    console.log(cont);
    
    if (cont === '') {
        var a_np_ass = [
            { n: "np_1h-poklad", o: "poklad", x: 35, y: 140},
            { n: "np_arti", o: "poklad", x: 30, y: 180},
            { n: "np_horline", x: 30, y: 310},
            { n: "np_vertlinei", x: 140, y: 130},
            { n: "np_1h-art-pelargon", o: "pelargon", x: 170, y: 130},
            { n: "np_vertlinei", x: 360, y: 130},
            { n: "np_1h-diplomat", o: "diplomat", x: 395, y: 140},
            { n: "np_artii", o: "diplomat", x: 390, y: 180},
            { n: "np_1h-mse", o: "mse", x: 35, y: 325},
            { n: "np_artwide", o: "mse", x: 30, y: 345},
            { n: "np_vertlineii", x: 260, y: 330},        
            { n: "np_1h-kouty", o: "kouty", x: 285, y: 325},
            { n: "np_artwide", o: "kouty", x: 280, y: 345}
        ];

        for (var i = 0; i < a_np_ass.length; i++) {
            np_img = {};
            np_img = this.game_state.groups.hud.create(a_np_ass[i].x, a_np_ass[i].y, a_np_ass[i].n);
            np_img.visible = true;
            np_img.alpha = 1;
            np_img.fixedToCamera = true;
            if (typeof (a_np_ass[i].o) !== 'undefined') {
                np_img.o_text = a_np_ass[i].o;
                np_img.inputEnabled = true;
                np_img.input.useHandCursor = true;
                np_img.events.onInputDown.add(this.show_np_content, this);
            }

            this.np_obj.push(np_img);
            //console.log(this.np_obj);
        }
    } else {
        this.hide_np_content();
        console.log(cont.o_text);
        
        this.game_state.prefabs.player.close_state.push("Newsppr");
        this.game_state.prefabs.player.close_context.push("Newsppr");
        this.o_text = cont.o_text;
        article = np.content[cont.o_text];
        console.log(article);
        
        if (typeof (article.r) !== 'undefined') {
            this.game_state.prefabs.player.add_rumour(article.r);
        }
        
        text_style = {"font": "bold 16px Bookman Old Style", "fill": "#000000", tabs: 40 };
        text_title = this.game_state.game.add.text(40, 135, article.title, text_style);
        text_title.fixedToCamera = true;
        this.texts.push(text_title);
        text_style = {"font": "10px Bookman Old Style", "fill": "#000000", wordWrap: true, wordWrapWidth: this.width - 55};
        text = this.game_state.game.add.text(40, 160, article.c, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);
    }
};

Mst.hud.prototype.hide_np_content = function () {
    "use strict";
    
    this.np_obj.forEach(function (obj) {
        obj.destroy();
    });
    this.np_obj = [];
};

Mst.hud.prototype.hide_newsppr_onclick = function () {
    "use strict";
    this.game_state.prefabs.player.close_state.pop();
    this.game_state.prefabs.player.close_context.pop();
    this.hide_newsppr();
};

Mst.hud.prototype.hide_newsppr = function () {
    "use strict";
    
    //console.log(this);
    console.log("Hide newspaper: " + this.o_text);
    
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    
    if (this.o_text === "") {
        this.visible = false;
        
        this.hide_np_content();

        this.game_state.prefabs.items.show_initial_stats();
        this.game_state.prefabs.equip.show();
    } else {
        this.o_text = "";
        
        this.show_np_content("");
    }
};

Mst.hud.prototype.show_alt = function (obj) {
    "use strict";
    var type, texture, text, x, y, text_style;
    
    //this.game_state.hud.alt.hide_alt();
    
    //console.log(obj);
    type = obj.o_type;
    switch(type) {
        case "items":
            console.log(this.game_state.core_data.items[obj.frame].name.length);
            if (this.game_state.core_data.items[obj.frame].name.length < 12) {
                texture = "alt";
            } else {
                texture = "alt_160_20";
            }
            //texture = "alt";
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
            if (this.game_state.core_data.items[obj.frame].name.length < 12) {
                texture = "alt";
            } else {
                texture = "alt_160_20";
            }
            //texture = "alt";
            text = this.game_state.core_data.items[obj.frame].name;
            x = obj.x - 4;
            y = obj.y - 30;
            
            break;
        case "otherPlayer":
            if (this.name.length < 12) {
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
    
    //this.game_state.hud.alt.fixedToCamera = false;
    this.game_state.hud.alt.reset(x, y);
    //this.game_state.hud.alt.fixedToCamera = true;
    this.game_state.hud.alt.loadTexture(texture);
    this.game_state.hud.alt.visible = true;
    this.game_state.hud.alt.alpha = 0.7;
    if (type === 'chestitems') {
        this.game_state.hud.alt.alpha = 0.85;
    }
    
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
        
    if (typeof (this.text_alt) !== 'undefined') {
        this.text_alt.text = "";
        //this.text_alt.destroy();
    }
    
    /*if (typeof(this.text_alt1) != 'undefined') {
        this.text_alt1.text = "";
        this.text_alt1.destroy();
    }   */ 
};

Mst.hud.prototype.show_dialogue = function (name, p_name, text, type, heart) {
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
            
            if (heart > 0) {
                this.heart_sprite = this.game_state.groups.hud.create(this.x + 465, this.y + 6, 'hearts_spritesheet', 0);
                this.heart_sprite.fixedToCamera = true;
                
                this.text_heart.fixedToCamera = false;
                this.text_heart.x = 457;
                this.text_heart.y = 290;
                this.text_heart.fixedToCamera = true;
                this.text_heart.text = heart;
            }
            
            this.atck_sprite = this.game_state.groups.hud.create(this.x + 485, this.y + 6, 'attack_spritesheet', 0);
            this.atck_sprite.fixedToCamera = true;
            this.atck_sprite.inputEnabled = true;
            this.atck_sprite.input.useHandCursor = true;
            this.atck_sprite.events.onInputDown.add(this.show_cards, this, this);
        //}
            

    }
    
    this.visible = true;
    //this.alpha = 0.7;
    this.text_name.text = p_name;
    console.log("name: " + name + " p_name: " + p_name);
    this.text_dialogue.text = text;
};

Mst.hud.prototype.hide_dialogue_onclick = function (next) {
    "use strict";
    var quest, new_quest, ren_player, new_ren_player, text;
    
    console.log('\x1b[102mHide dialogue tiled');
    
    var player = this.game_state.prefabs.player;
    player.close_state.pop();
    player.close_context.pop();
    this.hide_dialogue();
    
    if (next === 1) {
        console.log("Next dialogue");
    } else {
        console.log(this.game_state.prefabs[this.dialogue_name].ren_sprite.quest);
        quest = this.game_state.prefabs[this.dialogue_name].ren_sprite.quest;
        ren_player = this.game_state.prefabs[this.dialogue_name];
        
        console.log("Hide dialogue continue / Quest name: " + quest.name);
        if (typeof(quest.name) !== 'undefined') {
            if (typeof(quest.properties.nextq) !== 'undefined') {
                var is_ok = true;
                if (typeof(quest.properties.target) !== 'undefined') {
                    var target = parseInt(quest.properties.target);
                    console.log(target);
                    console.log(ren_player.usr_id);
                    if (target !== ren_player.usr_id) {
                        is_ok = false;
                    }
                }
                console.log(is_ok);
                console.log(quest.state);

                if (is_ok) {
                    if (quest.state !== "pre") {
                        console.log("Next quest exist & (target not exist | target is actual) & not pre ");
                        quest.state = "fin";
                        player.finish_quest(quest);

                        console.log(this.game_state.quest_data.quests);
                        var quests = this.game_state.quest_data.quests;
                        var ind = parseInt(quest.properties.nextq);
                        new_quest = quests[ind];
                        console.log("Next quest: " + ind);
                        console.log("Owner: " + new_quest.properties.owner);

                        var key = this.game_state.playerOfUsrID(new_quest.properties.owner);
                        new_ren_player = this.game_state.prefabs[key];

                        new_ren_player.ren_sprite.new_quest(new_quest);
                        new_quest = new_ren_player.ren_sprite.quest;
                        console.log('\x1b[102mShow dialogue tiled not pre ' + new_quest.name);

                        if (new_quest.properties.ptype === 'multi') {
                            text = new_ren_player.ren_sprite.get_quest_ptext(0);
                        } else {
                            text = new_quest.properties.quest_text;
                            player.assign_quest(new_quest);
                        }
                        new_ren_player.ren_sprite.show_dialogue(text);   

                        if (typeof(new_quest.properties.target) !== 'undefined') {
                            new_ren_player.hide_bubble(0);

                            key = this.game_state.playerOfUsrID(new_quest.properties.target);
                            if (key !== "") {
                                new_ren_player = this.game_state.prefabs[key];
                                new_ren_player.ren_sprite.new_quest(new_quest);
                                new_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
                            }     
                        }  else {
                            new_ren_player.test_bubble();
                        }
                    } else {
                        console.log("Next quest exist & (target not exist | target is actual) & pre");
                        console.log("Quest showed? " + quest.showed + " " + quest.state);
                        console.log(quest);
                        if (typeof(quest.showed) === 'undefined') {
                            quest.showed = false;
                        }
                        if (quest.properties.ending_conditions.type === "text" && quest.showed) {
                            quest.state = "fin";
                            player.finish_quest(quest);

                            console.log(this.game_state.quest_data.quests);
                            var quests = this.game_state.quest_data.quests;
                            var ind = parseInt(quest.properties.nextq);
                            new_quest = quests[ind];
                            console.log("Next quest: " + ind);
                            console.log("Owner: " + new_quest.properties.owner);

                            var key = this.game_state.playerOfUsrID(new_quest.properties.owner);
                            new_ren_player = this.game_state.prefabs[key];

                            new_ren_player.ren_sprite.new_quest(new_quest);
                            new_quest = new_ren_player.ren_sprite.quest;
                            console.log('\x1b[102mShow dialogue tiled pre ' + new_quest.name);

                            if (new_quest.properties.ptype === 'multi') {
                                text = new_ren_player.ren_sprite.get_quest_ptext(0);
                            } else {
                                text = new_quest.properties.quest_text;
                                player.assign_quest(new_quest);
                            }
                            new_ren_player.ren_sprite.show_dialogue(text);

                            if (typeof(new_quest.properties.target) !== 'undefined') {
                                new_ren_player.hide_bubble(0);

                                key = this.game_state.playerOfUsrID(quests[ind].properties.target);
                                if (key !== "") {
                                    new_ren_player = this.game_state.prefabs[key];
                                    new_ren_player.ren_sprite.new_quest(new_quest);
                                    new_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
                                }     
                            } else {
                                new_ren_player.test_bubble();
                            }
                        }
                    }
                } else {

                    if(quest.state === 'pre') {
                        console.log("Next quest pre / other person: " + quest.name);
//
//                        if (quest.properties.ptype === 'multi') {
//                            text = ren_player.ren_sprite.get_quest_ptext(0);
//                        } else {
//                            text = quest.properties.quest_text;
//                            player.assign_quest(quest);
//                        }
//
//                        ren_player.ren_sprite.show_dialogue(text);
                    } else {
                        console.log("Same quest not pre / other person: " + quest.properties.target);
                        
//                        ren_player.hide_bubble(0);
//                        console.log(player.opened_ren);
//
//                        var key = this.game_state.playerOfUsrID(quest.properties.target);
//                        if (key !== "") {
//                            new_ren_player = this.game_state.prefabs[key];
//                            new_ren_player.ren_sprite.new_quest(quest);
//                            new_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
//                        }
                    }
                }
            } else {
                console.log(quest.properties.ending_conditions.type);
                if (quest.properties.ending_conditions.type === "textpow" || quest.properties.ending_conditions.type === "text") {
                    quest.state = "fin";
                    player.finish_quest(quest);
                    this.game_state.prefabs[this.dialogue_name].ren_sprite.quest = {};
                    console.log("Tiled / not next - Test Quest");
                    this.game_state.prefabs[this.dialogue_name].test_quest();
                }
                if (quest.properties.ptype === 'multi') {
                    text = ren_player.ren_sprite.get_quest_ptext(1);

                    if (text !== 'finish') {
                        var p_max = ren_player.ren_sprite.quest.i_point_m - 1;

                        if (ren_player.ren_sprite.quest.i_point === p_max) {
                            console.log('\x1b[102mShow dialogue multi end ' + quest.name);

                            if(quest.state !== 'ass') {
                                ren_player.ren_sprite.show_dialogue(text, ["assign"]);
                            } else {
                                ren_player.ren_sprite.show_dialogue(text);
                            }
                        } else {
                            console.log('\x1b[102mShow dialogue multi ' + quest.name);

                            ren_player.ren_sprite.show_dialogue(text);
                        }
                    }
                }
            }
        } else {
            console.log("Next broadcast");
            player.next_broadcast();
        }        
    }
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
    
    if (typeof(this.heart_sprite) !== 'undefined') {
        this.heart_sprite.kill();
        this.text_heart.text = "";
    }
    
    if (typeof(this.atck_sprite) !== 'undefined') {
        this.atck_sprite.kill();
    }
    
    console.log(this.dialogue_name);
    if (typeof(this.game_state.prefabs[this.dialogue_name]) !== 'undefined') {
        this.game_state.prefabs[this.dialogue_name].hide_ren();
    }
};

Mst.hud.prototype.show_alert = function (text) {
    "use strict";
    this.alerts.push(text);
    //console.log("Add alert:" + text);
    //console.log(this.alerts);
    
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
    var text, alert, i;
    //console.log("next alert");
    
    if (this.alert_sprites.length < 13) {
        if (this.alerts.length > 0) {
            text = this.alerts.shift();
            alert = this.create_new_alert(text);
            
            i = alert.i_pos;
            
            this.alerts_i.push(i);
            
            //console.log(text);
            //console.log(this.alert_sprites);
            //console.log(this.alerts_i);
            
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
    "use strict";
    
    var pom = this.text_alert.text;
    
    for (var i = 0; i < this.game_state.hud.alert.alerts_i.length; i++) {
        if (this.i_pos === this.game_state.hud.alert.alerts_i[i]) {
           this.game_state.hud.alert.alerts_i.splice(i, 1);
        }
    }
    
    this.text_alert.text = "";
    this.visible = false;
    this.timer_alert.stop();
    this.kill();
    
    this.game_state.hud.alert.alert_sprites.splice(this, 1);
    //console.log("Kill alert:" + pom);
    //console.log(this.game_state.hud.alert.alerts_i);
    //console.log(this.game_state.hud.alert.alert_sprites);
    
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
    
    //console.log("Alert i: " + i);
    
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
    
    alert.aatext = text;
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
    //console.log(this.alert_sprites);
    
    return alert;
};

Mst.hud.prototype.i_pos_cast = function () {
    "use strict";
    var i_pom = 0;
    var i_pos = 0;
    
    console.log(this.alert_sprites);

    for (var i = 0; i < this.alerts_i.length; i++) {
        i_pom = this.alerts_i[i];
        if (i_pom > i_pos) {
            i_pos = i_pom;
        }
    }
    
    //console.log("i_pos " + i_pos);
    
    if (i_pos > 12) {
        i_pos = 0;
        
        for (var i = 0; i < this.alerts_i.length; i++) {
            i_pom = this.alerts_i[i];
            if (i_pom === (i_pos + 1)) {
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

Mst.night = function (game_state, alpha) {
    "use strict";
       
    Phaser.Image.call(this, game_state.game, 0, 0, "night");
    
    this.game_state = game_state;    
    this.game_state.groups.night.add(this);    
    this.name = "night";
    
    this.scale.setTo(35);
    
    if (alpha > 0) {
        this.visible = true;
        this.alpha = alpha;
    } else {
        this.visible = false;
        this.alpha = 0;
    }    
    
    this.fixedToCamera = true;
    
};

Mst.night.prototype = Object.create(Phaser.Image.prototype);
Mst.night.prototype.constructor = Mst.night;

Mst.night.prototype.add_night = function () {
    "use strict";
    
    if (!this.visible) {
        this.visible = true;
        this.alpha = 0;
    } else {
        if (this.alpha < 0.85) {
            this.alpha += 0.05;
            console.log("Alpha:" + this.alpha);
        }
    }
    
    return this.alpha;
};

Mst.night.prototype.show = function () {
    "use strict";
    this.visible = true;
    this.alpha = 0.7;
};

Mst.night.prototype.hide = function () {
    "use strict";
    this.visible = false;
    this.alpha = 0;
};