Mst.ChestCreator = function (name, position, properties) {
    "use strict";
    this.name = "chest_creator";
    
    this.pool = Mst.groups.chests;
    
    this.properties = {
        group: "chests",
        pool: "chests",
        items: "",
        closed_frame: 4,
        opened_frame: 5,        
        texture: "items_spritesheet"
    };

    Mst.mGame.prefabs[name] = this;
};

Mst.ChestCreator.prototype = Object.create(Mst.Prefab.prototype);
Mst.ChestCreator.prototype.constructor = Mst.ChestCreator;

Mst.ChestCreator.prototype.create_object = function (name, position, properties) {
    "use strict";
    // return new chest
    return new Mst.Chest(name, position, properties);
};
