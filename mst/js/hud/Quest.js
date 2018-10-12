var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.Quest = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
    this.quest_text = properties.quest_text;
    this.starting_conditions = properties.starting_conditions;
    this.ending_conditions = properties.ending_conditions;
    this.reward = properties.reward;
    this.assigned = properties.assigned;
    
    this.save = {
        type: "quest",
        name: name,
        x: 0,
        y: 0,
        properties: properties
    }    
};

Mst.Quest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Quest.prototype.constructor = Mst.Quest;

Mst.Quest.prototype.update = function () {
    "use strict";
    
    
};
