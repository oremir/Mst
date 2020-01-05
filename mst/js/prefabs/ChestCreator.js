var Phaser = Phaser || {};
var Mst = Mst || {};

Mst.ChestCreator = function (game_state, name, position, properties) {
    "use strict";
    
    this.game_state = game_state;
    this.name = "chest_creator";
    
    this.pool = this.game_state.groups["chests"];     
    
    this.game_state.prefabs[name] = this;
    
    this.properties = {
        group: "chests",
        pool: "chests",
        items: "",
        closed_frame: 4,
        opened_frame: 5,        
        texture: "items_spritesheet"
    }
};

Mst.ChestCreator.prototype = Object.create(Mst.Prefab.prototype);
Mst.ChestCreator.prototype.constructor = Mst.ChestCreator;

Mst.ChestCreator.prototype.create_object = function (name, position, properties) {
    "use strict";
    // return new chest
    return new Mst.Chest(this.game_state, name, position, properties);
};

Mst.ChestCreator.prototype.create_new_chest_name = function () {
    "use strict";    
    var name, name_test, name_test_length, name_number, name_count, chest_key;
    
    name_count = this.pool.countLiving();
    
    // test if chest name not exist
    
    //console.log(this.pool.children);
    
    for (chest_key in this.pool.children) {        
        name_test = this.pool.children[chest_key].name;
        name_test_length = name_test.length;
        //console.log(name_test);
        //console.log(name_test.substring(6,name_test_length));
        name_number = parseInt(name_test.substring(6,name_test_length));
        
        if (name_number >= name_count) {
             name_count = name_number + 1;           
        }
    }
        
    name = "chest_" + name_count;
    //console.log(name);
    return name;
};

Mst.ChestCreator.prototype.create_new_chest = function (item_frame) { 
    "use strict";    
    var position_new, chest_new, name_new;
    
    position_new = {
        x: (this.game_state.prefabs.player.x + (this.game_state.prefabs.player.direction_chest.x * 16)),
        y: (this.game_state.prefabs.player.y + (this.game_state.prefabs.player.direction_chest.y * 16))
    };
    
    console.log("create chest " + item_frame);
    
    chest_new = this.pool.getFirstDead();
    
    if (!chest_new) {
        // if there is no dead object, create a new one
        name_new = this.create_new_chest_name();
        chest_new = this.create_object(name_new, position_new, this.properties);

    } else {
        // if there is a dead object, reset it to the new position and velocity
        chest_new.reset(position_new);
        name_new = chest_new.name;
    }
    
    chest_new.stats.items = "";
    
    console.log(chest_new.stats.items);
    
    switch (item_frame) {
        case 4:
            chest_new.closed_frame = 4;
            chest_new.opened_frame = 5;
            break;
        case 6:
            chest_new.closed_frame = 6;
            chest_new.opened_frame = 6;
            break;
        case 30:
            chest_new.closed_frame = 30;
            chest_new.opened_frame = 30;
            break;
        case 31:
            chest_new.closed_frame = 31;
            chest_new.opened_frame = 31;
            break;
        default:
            chest_new.closed_frame = 3;
            chest_new.opened_frame = 3;
            break;
    }
    
    chest_new.frame = chest_new.opened_frame;
    chest_new.updated = true;
    
    this.game_state.prefabs.player.opened_chest = name_new;
    this.game_state.prefabs.chestitems.show_initial_stats();
    
    console.log(chest_new);
    
    return chest_new;
};