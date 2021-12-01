var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

Mst.prototype = Object.create(Phaser.State.prototype);
Mst.prototype.constructor = Mst.LoadingState;

Mst.LoadingState.prototype.init = function (core_data, map_data, root_data, quest_data) {
    "use strict";
    this.core_data = core_data;
    this.quest_data = quest_data;
    this.map_data = map_data;
    this.root_data = root_data;
};

Mst.LoadingState.prototype.preload = function () {
    "use strict";
    var assets, asset_loader, root_asset_key, asset_key, asset;
        
    if (this.root_data.usr_id > 0) {
        var root_assets = new Object();
        root_assets.map_assets = this.map_data.assets;
        root_assets.core_assets = this.core_data.assets;
        
        var d = new Date();
        var n = d.getTime(); 
    
        for (root_asset_key in root_assets) {
            assets = root_assets[root_asset_key];
            for (asset_key in assets) { // load assets according to asset key
                if (assets.hasOwnProperty(asset_key)) {
                    asset = assets[asset_key];
                    switch (asset.type) {
                    case "image":
                        this.load.image(asset_key, asset.source);
                        break;
                    case "spritesheet":
                        this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
                        break;
                    case "tilemap":
                        this.load.tilemap(asset_key, asset.source+"?time="+n, null, Phaser.Tilemap.TILED_JSON);
                        break;
                    case "audio":
                        this.load.audio(asset_key, asset.source);
                        break;
                    }
                }
            }
        }
    } else {        

        
        
    }
};

Mst.LoadingState.prototype.create = function () {
    "use strict";
    
//    this.login = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "login");
//    this.login.anchor.set(0.5);
//    console.log(this.login);
//    alert(1);
    
    this.game.state.start("GameState", true, false, this.core_data, this.map_data, this.root_data, this.quest_data);
};