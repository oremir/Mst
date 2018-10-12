var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.BootState = function () {
    "use strict";
    Phaser.State.call(this);
};

Mst.prototype = Object.create(Phaser.State.prototype);
Mst.prototype.constructor = Mst.BootState;

Mst.BootState.prototype.init = function (map_file, usr_id) {
    "use strict";
    
    var d = new Date();
    var n = d.getTime(); 
    
    this.core_file = "assets/maps/core.json";
    this.map_file = map_file;
    this.usr_id = usr_id;
};

Mst.BootState.prototype.preload = function () {
    "use strict";
    
    var d = new Date();
    var n = d.getTime(); 
    
    if (this.usr_id > 0) {
        this.load.text("core", this.core_file);
        this.load.text("map", this.map_file+"?time="+n);
    } else {
        var a = this.load.image("login", "assets/images/loader2.png");
        //console.log(a);
    }
};

Mst.BootState.prototype.create = function () {
    "use strict";
    var map_text, map_data, core_text, core_data, root_data;

    if (this.usr_id > 0) {
        map_text = this.game.cache.getText("map");
        //console.log(map_text);
        map_data = JSON.parse(map_text);
        //console.log(map_data);

        core_text = this.game.cache.getText("core");
        core_data = JSON.parse(core_text);
    }
    
    root_data = { map_file: this.map_file, usr_id: this.usr_id };
    
    console.log("Boot State");
    console.log(root_data);
        
    this.game.state.start("LoadingState", true, false, core_data, map_data, root_data);
};