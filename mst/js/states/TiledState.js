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
        "chest": Mst.Chest.prototype.constructor,
        "enemy": Mst.Enemy.prototype.constructor,
        "wildanimal": Mst.WildAnimal.prototype.constructor,
        "sword": Mst.Sword.prototype.constructor,
        "signpost": Mst.Signpost.prototype.constructor,
        "bed": Mst.Bed.prototype.constructor,
        "goout": Mst.Goout.prototype.constructor,
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
    
    if (Mst.logged) {
        // start physics system
        
        this.game.physics.arcade.gravity.y = 0;

        this.map = new Mst.Map(gdata.map);
        Mst.init(this);
    }
};

Mst.TiledState.prototype.create = function () {
    "use strict";
    
    if (Mst.logged) {
        this.map.create();
        Mst.init_layers(this.map.layers);

        this.cGame.init.groups = this.gdata.core.groups;
        
        // ......................... Map Objects ............................

        
        this.map.create_objects(this);
        
        

        //if (!this.prefabs.player) {
        //    const load_player = JSON.parse(localStorage.getItem("player"));
        //    console.log("localStorage");
        //    console.log(load_player.properties);
        //    this.create_object(load_player);
        //}
        
        console.log(this.mGame.prefabs);
        this.prefabs = this.mGame.prefabs;
        Mst.init_prefabs(this.prefabs);
        this.cGame.init.prefabs = this.mGame.prefabs;
        
        this.map.create_foreg();
        
        this.cGame.init.groupshud = this.gdata.core.groupshud;
        
        // ......................... Night Init ..............................
        
        this.night = new Mst.Night(Mst.mPlayer.save.properties.gtimealpha);
        
        // ......................... HUD Init 2 ..............................
        
        this.mGame.hud.init_hud_plug(this.gdata.core.hud);
        console.log(this.mGame.hud, Mst);
        
        // ......................... Test quest ............................
        
        this.cGame.quests.init();
        this.cGame.final_init();
        
        console.log("Prefabs:");
        console.log(this.prefabs);
        console.log(Mst.groups);
        
        console.log(this.gdata.map);
        this.cGame.hud.alerts.show("M:" + Mst.map_int);
        
        Mst.init(this);
        console.log(Mst);
    }
};

Mst.TiledState.prototype.create_object = function (object) {
    "use strict";
    // tiled coordinates starts in the bottom left corner
    console.log(object, this.map.tileHeight);
    const position = {
        "x": (parseInt(object.x) + (this.map.tileHeight / 2)),
        "y": (parseInt(object.y) - (this.map.tileHeight / 2))
    };
    // create object according to its type
    let type = object.type;
    
    if (type == "player") {
        if (object.usr_id != Mst.usr_id) type = "other_player";
    }
    
    console.log("Prefab exist? " + object.name);
    const prefab = this.mGame.prefabs[object.name];
    
    console.log(prefab);
    if (!prefab) return this.create_prefab(type, object.name, position, object.properties);
    return prefab;
};

Mst.TiledState.prototype.create_prefab = function (type, name, position, properties) {
    "use strict";
    // create prefab according to its type
    if (this.prefab_classes.hasOwnProperty(type)) return new this.prefab_classes[type](name, position, properties);
    return null;
};

Mst.TiledState.prototype.restart_map = function () {
    "use strict";
    this.game.state.restart(true, false, this.gdata);
};

Mst.Map = class {
    constructor(map) {
        // create map and set tileset
        this._map = Mst.game.add.tilemap(map.map.key);
        this._map.addTilesetImage(this._map.tilesets[0].name, map.map.tileset);
        this._core = map;
        this._layers = null;
        this._grid = null;
        this._foreg = false;

        Mst.init_map(this);
    }

    create() {
        // create map layers
        console.log(this._map);
        this._layers = {};
        this._foreg = false;
        this._map.layers.forEach(function (layer) {
            if (layer.name !== "foreground") {
                this._layers[layer.name] = this._map.createLayer(layer.name);
                console.log("Layer: " + layer.name);
                console.log(this._layers[layer.name]);
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
                    this._map.setCollision(collision_tiles, true, layer.name);
                    this._grid = grid;
                    console.log(this.grid);
                }
            } else {
                this._foreg = true;
            }
        }, this);
        // resize the world to be the size of the current layer
        this._layers[this._map.layer.name].resizeWorld();
    }

    create_objects(vGame) {
        console.log("Map objects:", this._map.objects);        
        for (let object_layer in this._map.objects) {
            if (this._map.objects.hasOwnProperty(object_layer)) {
                // create layer objects
                this._map.objects[object_layer].forEach(vGame.create_object, vGame);
            }
        }

        console.log("Map data objects:", this.objects);
        this.objects.forEach(vGame.create_object, vGame);
    }

    create_foreg() {
        if (this._foreg) this._layers.foreground = this._map.createLayer("foreground");
    }

    get layers() {
        return this._layers;
    }

    get objects() {
        return this._core.objects;
    }
    
    get map_objects() {
        return this._map.objects;
    }
    
	get tileHeight () {
		return this._map.tileHeight;
	}

    get region() {
        return parseInt(this._core.map.region);
    }

    getGridXY(tile) {
        return this._grid[tile.y][tile.x];
    }

    checkGrid(position) {
        const tile = this.getTile(position);
        return this.getGridXY(tile) === 1;
    }

    checkCollision(position) {
        if (this.getTileLayer(position, "collision")) return true;
        if (this.checkGrid(position)) return true;
        return false;
    }

    checkGrass(position) {
        if (Mst.layers.grass) {
            if (this.getTileLayer(position, "grass")) return true;
            return false;
        }
        return true;
    }

    checkTiles(position, layer) {
        const tiles = this.layers[layer].getTiles(position.x, position.y, 3, 3);
        if (layer === "collision") tiles.some((tile) => tile.canCollide !== null);
        return !tiles.some((tile) => tile.index > -1);
    }

    checkTileDistance(position, mdist) {
        return this.objects.some((map_object) => Mst.pointDistance(position, map_object) < mdist, this);
    }

    setGridXY(tile, val) {
        this._grid[tile.y][tile.x] = val;
    }
    
    get gridOn() {
        return null;
    }
    
    get gridOff() {
        return null;
    }

    set gridOn(tile) {
        this.setGridXY(tile, 1);
    }

    set gridOff(tile) {
        this.setGridXY(tile, 1);
    }

    setTile(position) {
        const tile = this.getTile(position);
        console.log(tile.x, tile.y);
        this.gridOn = tile;
        return tile;
    }

    removeTile(tile) {
        this.gridOff = tile;
    }

    getNormRnd(position, dif) {
        const pos = new Mst.RndPosition(position, dif);
        const tile = this.getTile(pos);
        return new Mst.Position(tile.x*16 + 8, tile.y*16 + 8);
    }

    getTile(position) {
        console.log(position);
        return {
            x: this._layers.background.getTileX(position.x),
            y: this._layers.background.getTileY(position.y)
        };
    }

    getTileLayer(position, layer) {
        const tile = this.getTile(position);
        console.log(layer + ": " + position.x + ">" + tile.x*16 + "|" + position.y + ">" + tile.y*16);
        return this._map.getTile(tile.x, tile.y, layer);
    }

    getTileDir(tile, layer) {
        const x = Mst.cPlayer.chest.direction.x + tile.x;
        const y = Mst.cPlayer.chest.direction.y + tile.y;
        return this._map.getTile(x, y, layer);
    }
};

Mst.Night = class extends Phaser.Image {
    constructor(alpha) {
        super(Mst.game, 0, 0, "night");
        Mst.cGame.groups.night.add(this);

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
    }

    add_night() {
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
    }
    
    show() {
        this.visible = true;
        this.alpha = 0.7;
    }
    
    hide() {
        this.visible = false;
        this.alpha = 0;
    }
};
