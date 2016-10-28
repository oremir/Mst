var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.TiledState = function () {
    "use strict";
    Phaser.State.call(this);
    
    this.prefab_classes = {
        "player": Mst.Player.prototype.constructor,
        "enemy_spawner": Mst.EnemySpawner.prototype.constructor,
        "chest": Mst.Chest.prototype.constructor,
        "sword": Mst.Sword.prototype.constructor,
        "goout": Mst.Goout.prototype.constructor,
        "show_stat_with_sprite": Mst.ShowStatWithSprite.prototype.constructor,
        "show_stat_with_text": Mst.ShowStatWithText.prototype.constructor,
        "show_stat_with_bar": Mst.ShowStatWithBar.prototype.constructor,
        "show_items": Mst.ShowItems.prototype.constructor
    }
};

Mst.TiledState.prototype = Object.create(Phaser.State.prototype);
Mst.TiledState.prototype.constructor = Mst.TiledState;

Mst.TiledState.prototype.init = function (core_data, map_data, root_data) {
    "use strict";
    this.core_data = core_data;
    this.map_data = map_data;
    this.root_data = root_data;
    
    
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
        
// ------------------------------------ Login -----------------------------------        
        
        this.login = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "login");
        this.login.anchor.set(0.5);
    
        console.log(this.root_data);
        
        Phaser.Device.whenReady(function () {
            game.plugins.add(Fabrique.Plugins.InputField);
        });
        
        this.usr_name = this.game.add.inputField(this.game.world.centerX-175, this.game.world.centerY-171, {
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
                type: Fabrique.InputType.password,
                zoom: true
        });
        this.usr_password.blockInput = false;
        this.usr_password.focusOutOnEnter = false;
        
        this.usr_isinput = false;
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
        for (object_layer in this.map.objects) {
            if (this.map.objects.hasOwnProperty(object_layer)) {
                // create layer objects
                this.map.objects[object_layer].forEach(this.create_object, this);
            }
        }
        
        this.save = {
            player: {},
            objects: this.map_data.objects
        }
        
        for (object_key in this.map_data.objects) {
            this.create_object(this.map_data.objects[object_key]);

            //console.log(this.core_data.objects[object_key]);
        }

        if (typeof(this.prefabs.player) == 'undefined') {
            load_player = JSON.parse(localStorage.getItem("player"));
            console.log(load_player.properties);
            this.create_object(load_player);
        }


        // ......................... Core Objects a HUD ............................

        for (object_key in this.core_data.objects) {
            this.create_object(this.core_data.objects[object_key]);

            //console.log(this.core_data.objects[object_key]);
        }

        //console.log(this.core_data.hud);

        this.hud = this.game.plugins.add(Mst.HUD, this, this.core_data.hud);
    }
      
};

Mst.TiledState.prototype.update = function () {
    "use strict";
    var i_param, usr_output, game;
    
//    function updt(usr_id, map) {
//        console.log(usr_id +" "+ map);
//        //this.game.state.start("BootState", true, false, map, usr_id);
//    };
    
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
                    .done(function(data) {
                        console.log( "success" );
                        usr_output = data;
                        console.log(data);
                        var usr_id = parseInt(usr_output.usr_id);
                        var map = "assets/maps/map"+parseInt(usr_output.map)+".json";
//                        console.log(usr_output);
//                        console.log(usr_id);
//                        console.log(map);
//
//                        updt(usr_id, map);

                        game.state.start("BootState", true, false, map, usr_id);
                    })
                    .fail(function(data) {
                        console.log( "error" );
                        console.log(data);
                    })
            //});
            
            //this.game_state.game.state.start("BootState", true, false, this.next_map, usr_output.);
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
    var position, prefab;
    // tiled coordinates starts in the bottom left corner
    position = {"x": object.x + (this.map.tileHeight / 2), "y": object.y - (this.map.tileHeight / 2)};
    // create object according to its type
    
    this.create_prefab(object.type, object.name, position, object.properties);
};

Mst.TiledState.prototype.create_prefab = function (type, name, position, properties) {
    "use strict";
    var prefab;
    // create prefab according to its type
    if (this.prefab_classes.hasOwnProperty(type)) {
        prefab = new this.prefab_classes[type](this, name, position, properties);
    }
    this.prefabs[name] = prefab;
    return prefab;
};

Mst.TiledState.prototype.restart_map = function () {
    "use strict";
    this.game.state.restart(true, false, this.core_data, this.map_data, this.root_data);
};

Mst.TiledState.prototype.save_data = function (go_position, next_map) {
    "use strict";
    
    this.prefabs.player.save_player(go_position, next_map);
    
    this.save.player = this.prefabs.player.save;
    
    var d = new Date();
    var n = d.getTime(); 

    $.getJSON("save.php?time="+n, this.save)
        .done(function(data) {
            console.log( "save success" );
            console.log(data);
        })
        .fail(function(data) {
            console.log( "save error" );
            console.log(data);
        });
    
    console.log("save");
};
