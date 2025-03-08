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
    console.log(gdata);
    this.cGame = new CGame(this, gdata);
    this.mGame = this.cGame.mGame;
    
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
    }
};

Mst.TiledState.prototype.create = function () {
    "use strict";
    
    if (this.gdata.root.usr_id > 0) {
        // create map layers
        console.log(this.map);
        this.layers = {};
        let foreg = false;
        this.map.layers.forEach(function (layer) {
            if (layer.name !== "foreground") {
                this.layers[layer.name] = this.map.createLayer(layer.name);
                console.log("Layer: " + layer.name);
                console.log(this.layers[layer.name]);
                if (layer.properties.collision) { // collision layer
                    const collision_tiles = [];
                    const grid = [];
                    layer.data.forEach(function (data_row) { // find tiles used in the layer
                        const col = [];
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

        const groups = this.cGame.create_groups(this.gdata.core.groups, this.gdata.core.groupshud);
        this.cGame.init_hud(groups);

        this.prefabs = {};
        
        this.create_prefab("chest_creator", "chest_creator", {x: 0, y: 0}, {});        
        
        // ......................... Map Objects ............................
        
        console.log("Map objects:");
        console.log(this.map.objects);
        
        for (let object_layer in this.map.objects) {
            if (this.map.objects.hasOwnProperty(object_layer)) {
                // create layer objects
                this.map.objects[object_layer].forEach(this.create_object, this);
            }
        }
        
        console.log("Map data objects:");
        console.log(this.gdata.map.objects);
        
        this.gdata.map.objects.forEach(this.create_object, this);

        if (!this.prefabs.player) {
            const load_player = JSON.parse(localStorage.getItem("player"));
            console.log("localStorage");
            console.log(load_player.properties);
            this.create_object(load_player);
        }
        
        this.prefabs.player.cPlayer.followers.init();
        
        this.cGame.set_prefabs(this.prefabs);
        
        if (foreg) this.layers.foreground = this.map.createLayer("foreground");
        
        //this.gdata.core.groupshud.forEach((group_name) => this.cGame.groups[group_name] = this.game.add.group(), this);
        
        // ......................... HUD Init 1 ............................
        
        //this.hud = {};
        //this.hud.close = new Mst.hud(this, "close");
        //this.hud.right_window = new Mst.hud(this, "right_window");
        //this.hud.middle_window = new Mst.hud(this, "middle_window");
        //this.hud.cards = new Mst.hud(this, "cards");
        //this.hud.book = new Mst.hud(this, "book");
        //this.hud.newsppr = new Mst.hud(this, "newsppr");
        //this.hud.alt = new Mst.hud(this, "alt");
        //this.hud.question = new Mst.hud(this, "question");
        //this.hud.dialogue = new Mst.hud(this, "dialogue");
        //this.hud.alert = new Mst.hud(this, "alert");
        
        // ......................... Night Init ..............................
        
        this.night = new Mst.night(this, this.prefabs.player.mPlayer.save.properties.gtimealpha);
        
        // ......................... HUD Init 2 ..............................
        
        this.mGame.hud.stats = {};
        this.mGame.hud.plug = this.game.plugins.add(Mst.HUD, this, this.gdata.core.hud);
        console.log(this.hud);
        
        // ......................... Test quest ............................
        
        this.cGame.create_persons();
        this.cGame.quests.init();        
        this.cGame.final_tests();
        
        console.log("Prefabs:");
        console.log(this.prefabs);
        console.log(this.mGame.groups);
        
        console.log(this.gdata.map);
        this.cGame.hud.alerts.show("M:" + this.gdata.map.map.map_int);
    }      
};

Mst.TiledState.prototype.create_object = function (object) {
    "use strict";
    // tiled coordinates starts in the bottom left corner
    const position = {"x": (parseInt(object.x) + (this.map.tileHeight / 2)), "y": (parseInt(object.y) - (this.map.tileHeight / 2))};
    // create object according to its type
    let type = object.type;
    
    if (type == "player") {
        if (object.usr_id != this.gdata.root.usr_id) type = "other_player";
    }
    
    console.log("Prefab exist? " + object.name);
    const prefab = this.prefabs[object.name];
    
    console.log(prefab);
    if (!prefab) return this.create_prefab(type, object.name, position, object.properties);
    return prefab;
};

Mst.TiledState.prototype.create_prefab = function (type, name, position, properties) {
    "use strict";
    let prefab = null;
    // create prefab according to its type
    if (this.prefab_classes.hasOwnProperty(type)) prefab = new this.prefab_classes[type](this, name, position, properties);
    return prefab;
};

Mst.TiledState.prototype.restart_map = function () {
    "use strict";
    this.game.state.restart(true, false, this.gdata);
};

Mst.TiledState.prototype.getGridXY = function (x, y) {
    "use strict";
    return this.grid[y][x];
};

Mst.TiledState.prototype.setGridXY = function (x, y, val) {
    "use strict";
    this.grid[y][x] = val;
};

Mst.night = function (vGame, alpha) {
    "use strict";
       
    Phaser.Image.call(this, vGame.game, 0, 0, "night");      
    vGame.cGame.groups.night.add(this);
    
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
