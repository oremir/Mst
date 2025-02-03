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

Mst.TiledState.prototype.init = function (gdata) {
    "use strict";
    this.gdata = gdata;
    
    console.log(gdata.quest);
    
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    if (this.gdata.root.usr_id > 0) {
        // start physics system
        
        this.game.physics.arcade.gravity.y = 0;
    
        // create map and set tileset
        this.map = this.game.add.tilemap(gdata.map.map.key);
        this.map.addTilesetImage(this.map.tilesets[0].name, gdata.map.map.tileset);
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

            //console.log(this.gdata.root);

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
    
    if (this.gdata.root.usr_id > 0) {
        this.save = {
            player: {},
            objects: this.gdata.map.objects
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
                console.log(this.layers[layer.name]);
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
        this.gdata.core.groups.forEach(function (group_name) {
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
        console.log(this.gdata.map.objects);
        
        for (const object of this.gdata.map.objects) {
            this.create_object(object);
        }

        if (typeof (this.prefabs.player) === 'undefined') {
            load_player = JSON.parse(localStorage.getItem("player"));
            console.log("localStorage");
            console.log(load_player.properties);
            this.create_object(load_player);
        }
        
        this.prefabs.player.make_followers();
        
        if (foreg) {
            this.layers.foreground = this.map.createLayer("foreground");
        }
        
        this.gdata.core.groupshud.forEach(function (group_name) {
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
        
        this.hud.stats = this.game.plugins.add(Mst.HUD, this, this.gdata.core.hud);
        
        // ......................... Core Objects ............................
        
        for (object_key in this.gdata.core.objects) {
            this.create_object(this.gdata.core.objects[object_key]);

            //console.log(this.gdata.core.objects[object_key]);
        }
        
        //console.log(this.gdata.core.hud);
        
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
        
        const quests = this.gdata.quest.quests;
        const player = this.prefabs.player;
        
        for (let i in quests) {
            const quest_state = player.test_quest("idstate", quests[i].qid);
            if (quest_state !== "fin") {
                console.log(quests[i].qid + " " + quest_state);
                
                const quest_new = quests[i];
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
        
        this.gdata.quest.rumours = {};
        this.gdata.quest.act_rumours = [];
        for (let i = 0; i < this.gdata.quest.texts.length; i++) {
            if (this.gdata.quest.texts[i].type === 'rumour') {
                this.gdata.quest.rumours[i] = this.gdata.quest.texts[i];
                
                key = this.prefabs.player.stats.rumours.indexOf(i);
                if (key < 0) {
                    this.gdata.quest.act_rumours.push(this.gdata.quest.texts[i]);
                }
            }
        }
        console.log(this.gdata.quest.rumours);
        console.log(this.gdata.quest.act_rumours);
        
        this.prefabs.player.final_tests();
        
        console.log("Prefabs:");
        console.log(this.prefabs);
        console.log(this.groups);
        
        console.log(this.gdata.map);
        this.hud.alert.show_alert("M:" + this.gdata.map.map.map_int);
    }
      
};

Mst.TiledState.prototype.update = function () {
    "use strict";
    var usr_output, game;
    
    usr_output = {};
    
    if (this.gdata.root.usr_id < 1 && this.usr_isinput === false) {
        
// --------------------------------- Login ---------------------------------------
        
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            this.usr_isinput = true;
            
            const i_param = { user: this.usr_name.value, pass: this.usr_password.value};
            
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
                    });
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
        if (object.usr_id != this.gdata.root.usr_id) {
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
    this.game.state.restart(true, false, this.gdata);
};

Mst.TiledState.prototype.save_data = function (go_position, next_map_int, save_state) {
    "use strict";
    var key, game, usr_id;
    game = this.game;
    usr_id = this.gdata.root.usr_id;
    
    this.groups.otherplayers.forEachAlive(function(one_player) {        
        one_player.save_player();
    }, this);
    
    this.prefabs.player.save_player(go_position, next_map_int);
    
    this.save.player = this.prefabs.player.save;
    this.save.enplayer = JSON.stringify(this.prefabs.player.save);
    
    key = this.keyOfUsrID(this.gdata.root.usr_id);
    
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
        }
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
    save.type = "chest";
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
    save.type = "player";
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
    
    const players = [];
    for (let object_key in this.prefabs) {
        if (typeof(this.prefabs[object_key].usr_id) != 'undefined') {
            const uid = parseInt(this.prefabs[object_key].usr_id);
            players.push(uid);
        }
    }

    return players;
};

Mst.TiledState.prototype.get_NPCs = function () {
    "use strict";
    
    const NPCs = [];
    for (let object_key in this.prefabs) {
        if (typeof(this.prefabs[object_key].unique_id) != 'undefined') {
            const uid = parseInt(this.prefabs[object_key].unique_id);
            if (uid > 0) {
                NPCs.push(uid);
            }
        }
    }

    return NPCs;
};


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