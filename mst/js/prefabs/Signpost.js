var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Signpost = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
    this.signpost_text = properties.text;
    this.signpost_alt = properties.alt;
    
    if (typeof(properties.is_takeable) !== 'undefined') {
        this.is_takeable = (properties.is_takeable === 'true');
    } else {
        this.is_takeable = true;
    }
};

Mst.Signpost.prototype = Object.create(Mst.Prefab.prototype);
Mst.Signpost.prototype.constructor = Mst.Quest;

Mst.Signpost.prototype.update = function () {
    "use strict";
    
    
};

Mst.Signpost.prototype.open_collision = function (player) {
    "use strict";
    
     
};
