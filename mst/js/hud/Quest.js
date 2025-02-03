Mst.Quest = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.quest_id = properties.qid;
    this.owner = properties.owner;
    this.owner_type = properties.owner_type;
    this.quest_text = properties.quest_text;
    this.starting_conditions = properties.start_cond;
    this.ending_conditions = properties.end_cond;
    this.reward = properties.reward;
    
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
