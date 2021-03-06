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
    var position_new, position_new_player, chest_new, name_new,  tilex, tiley, tile, b;
    
    position_new = {
        x: Math.round((this.game_state.prefabs.player.x - 8 + (this.game_state.prefabs.player.direction_chest.x * 16))/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 + (this.game_state.prefabs.player.direction_chest.y * 16))/16)*16 - 8
    };
    
    position_new_player = {
        x: Math.round((this.game_state.prefabs.player.x - 8 )/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 )/16)*16 - 8
    };
    
    console.log("create chest " + item_frame);
    console.log(position_new);
    console.log(position_new_player);
    
    this.game_state.prefabs.player.x = position_new_player.x
    this.game_state.prefabs.player.y = position_new_player.y;
    
    name_new = this.create_new_chest_name();
    chest_new = this.create_object(name_new, position_new, this.properties);
    
//    chest_new = this.pool.getFirstDead();
    
//    if (!chest_new) {
//        // if there is no dead object, create a new one
//        name_new = this.create_new_chest_name();
//        chest_new = this.create_object(name_new, position_new, this.properties);
//
//    } else {
//        // if there is a dead object, reset it to the new position and velocity
//        chest_new.reset(position_new);
//        name_new = chest_new.name;
//    }
    
    chest_new.stats.items = "";
    
    console.log("Items: " + chest_new.stats.items);
    
    if (typeof(this.game_state.layers.grass) !== 'undefined') {
        tilex = this.game_state.layers.grass.getTileX(chest_new.x);
        tiley = this.game_state.layers.grass.getTileX(chest_new.y);
        tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.grass);
        console.log("Grass: " + chest_new.x + ">" + tilex*16 + "|" + chest_new.y + ">" + tiley*16);
        console.log(tile);

        if (tile === null) {
            b = false;
            console.log("Not grass tile");
        } else {
            b = true;
            console.log("Grass tile");
        }
    }
                            
    
    switch (item_frame) {
        case 4:
            chest_new.closed_frame = 4;
            chest_new.opened_frame = 5;
            break;
        case 6:
            chest_new.closed_frame = 6;
            chest_new.opened_frame = 6;
            break;
        case 7:
            chest_new.closed_frame = 7;
            chest_new.opened_frame = 7;
            break;
        case 21:
            chest_new.closed_frame = 21;
            chest_new.opened_frame = 21;
            break;
        case 24:
            chest_new.closed_frame = 19;
            chest_new.opened_frame = 19;
            break;
        case 29:
            chest_new.closed_frame = 29;
            chest_new.opened_frame = 29;
            break;
        case 30:
            chest_new.closed_frame = 30;
            chest_new.opened_frame = 30;
            break;
        case 31:
            chest_new.closed_frame = 31;
            chest_new.opened_frame = 31;
            break;
        case 32:
            chest_new.closed_frame = 7;
            chest_new.opened_frame = 7;
            break;
        case 41:
            chest_new.closed_frame = 41;
            chest_new.opened_frame = 41;
            break;
        case 43:
            chest_new.closed_frame = 19;
            chest_new.opened_frame = 19;
            break;
        case 52:
            chest_new.closed_frame = 52;
            chest_new.opened_frame = 52;
            break;
        case 53:
            chest_new.closed_frame = 53;
            chest_new.opened_frame = 53;
            break;
        case 58:
            chest_new.closed_frame = 58;
            chest_new.opened_frame = 58;
            break;
        case 59:
            chest_new.closed_frame = 59;
            chest_new.opened_frame = 59;
            break;
        case 60:
            chest_new.closed_frame = 60;
            chest_new.opened_frame = 60;
            break;
        case 64:
            chest_new.closed_frame = 64;
            chest_new.opened_frame = 64;
            break;
        case 71:
            chest_new.closed_frame = 71;
            chest_new.opened_frame = 71;
            break;
        case 98:
            chest_new.closed_frame = 98;
            chest_new.opened_frame = 98;
            break;
        case 104:
            chest_new.closed_frame = 104;
            chest_new.opened_frame = 104;
            break;
        case 108:
            chest_new.closed_frame = 108;
            chest_new.opened_frame = 108;
            break;
        case 114:
            chest_new.closed_frame = 114;
            chest_new.opened_frame = 114;
            break;
        case 126:
            if (b) {
                chest_new.closed_frame = 126;
                chest_new.opened_frame = 126;
            } else {
                chest_new.closed_frame = 3;
                chest_new.opened_frame = 3;
            }
            break;
        case 138:
            chest_new.closed_frame = 138;
            chest_new.opened_frame = 138;
            break;            
        case 166:
            chest_new.closed_frame = 166;
            chest_new.opened_frame = 166;
            break;
        default:
            chest_new.closed_frame = 3;
            chest_new.opened_frame = 3;
            break;
    }
    
    chest_new.frame = chest_new.opened_frame;
    chest_new.is_opened = true;
    chest_new.updated = true;
    
    this.game_state.prefabs.player.opened_chest = name_new;
    this.game_state.prefabs.chestitems.show_initial_stats();
    
    console.log(chest_new);
    
    return chest_new;
};