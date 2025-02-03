Mst.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

Mst.prototype = Object.create(Phaser.State.prototype);
Mst.prototype.constructor = Mst.LoadingState;

Mst.LoadingState.prototype.init = function (gdata) {
    "use strict";
    this.gdata = gdata;
};

Mst.LoadingState.prototype.preload = function () {
    "use strict";
        
    if (this.gdata.root.usr_id > 0) {
        const root_assets = {};
        root_assets.map_assets = this.gdata.map.assets;
        root_assets.core_assets = this.gdata.core.assets;
        
        const d = new Date();
        const n = d.getTime(); 
    
        for (let root_asset_key in root_assets) {
            const assets = root_assets[root_asset_key];
            for (let asset_key in assets) { // load assets according to asset key
                if (assets.hasOwnProperty(asset_key)) {
                    const asset = assets[asset_key];
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
    }
};

Mst.LoadingState.prototype.create = function () {
    "use strict";
    
//    this.login = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "login");
//    this.login.anchor.set(0.5);
//    console.log(this.login);
//    alert(1);
    
    this.game.state.start("GameState", true, false, this.gdata);
};