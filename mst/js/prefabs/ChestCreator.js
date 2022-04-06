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
    
    const position_new = {
        x: Math.round((this.game_state.prefabs.player.x - 8 + (this.game_state.prefabs.player.direction_chest.x * 16))/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 + (this.game_state.prefabs.player.direction_chest.y * 16))/16)*16 - 8
    };

    const tilex = this.game_state.layers.background.getTileX(position_new.x);
    const tiley = this.game_state.layers.background.getTileY(position_new.y);
    
    let b = false;
    if (this.game_state.getGridXY(tilex, tiley) === 1) {
        b = true;
        console.log("Chest grid colision");
    }
    
    const position_new_player = {
        x: Math.round((this.game_state.prefabs.player.x - 8 )/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 )/16)*16 - 8
    };
    
    console.log("create chest " + item_frame);
    console.log(position_new);
    console.log(position_new_player);
    
    this.game_state.prefabs.player.x = position_new_player.x
    this.game_state.prefabs.player.y = position_new_player.y;
    
    switch (item_frame) {
        case 4:
            this.properties.closed_frame = 4;
            this.properties.opened_frame = 5;
            break;
        case 6:
            this.properties.closed_frame = 6;
            this.properties.opened_frame = 6;
            break;
        case 7:
            this.properties.closed_frame = 7;
            this.properties.opened_frame = 7;
            break;
        case 21:
            this.properties.closed_frame = 21;
            this.properties.opened_frame = 21;
            break;
        case 24:
            this.properties.closed_frame = 19;
            this.properties.opened_frame = 19;
            break;
        case 29:
            this.properties.closed_frame = 29;
            this.properties.opened_frame = 29;
            break;
        case 30:
            this.properties.closed_frame = 30;
            this.properties.opened_frame = 30;
            break;
        case 31:
            this.properties.closed_frame = 31;
            this.properties.opened_frame = 31;
            break;
        case 32:
            this.properties.closed_frame = 7;
            this.properties.opened_frame = 7;
            break;
        case 41:
            this.properties.closed_frame = 41;
            this.properties.opened_frame = 41;
            break;
        case 43:
            this.properties.closed_frame = 213;
            this.properties.opened_frame = 213;
            break;
        case 52:
            this.properties.closed_frame = 52;
            this.properties.opened_frame = 52;
            break;
        case 53:
            this.properties.closed_frame = 53;
            this.properties.opened_frame = 53;
            break;
        case 58:
            this.properties.closed_frame = 58;
            this.properties.opened_frame = 58;
            break;
        case 59:
            this.properties.closed_frame = 59;
            this.properties.opened_frame = 59;
            break;
        case 60:
            this.properties.closed_frame = 60;
            this.properties.opened_frame = 60;
            break;
        case 64:
            this.properties.closed_frame = 64;
            this.properties.opened_frame = 64;
            break;
        case 71:
            this.properties.closed_frame = 71;
            this.properties.opened_frame = 71;
            break;
        case 98:
            this.properties.closed_frame = 98;
            this.properties.opened_frame = 98;
            break;
        case 104:
            this.properties.closed_frame = 104;
            this.properties.opened_frame = 104;
            break;
        case 108:
            this.properties.closed_frame = 108;
            this.properties.opened_frame = 108;
            break;
        case 114:
            this.properties.closed_frame = 114;
            this.properties.opened_frame = 114;
            break;
        case 126:
            if (b) {
                this.properties.closed_frame = 126;
                this.properties.opened_frame = 126;
            } else {
                this.properties.closed_frame = 3;
                this.properties.opened_frame = 3;
            }
            break;
        case 138:
            this.properties.closed_frame = 138;
            this.properties.opened_frame = 138;
            break;            
        case 166:
            this.properties.closed_frame = 166;
            this.properties.opened_frame = 166;
            break;
        case 237:
            this.properties.closed_frame = 237;
            this.properties.opened_frame = 237;
            break;
        default:
            this.properties.closed_frame = 3;
            this.properties.opened_frame = 3;
            break;
    }
    
    const name_new = this.create_new_chest_name();
    const chest_new = this.create_object(name_new, position_new, this.properties);
    
    if (b) {
        chest_new.exist = false;
    } else {
        chest_new.exist = true;
    }
    
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
        const tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.grass);
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
    
    chest_new.frame = this.properties.opened_frame;
    chest_new.is_opened = true;
    chest_new.updated = true;
    
    this.game_state.prefabs.player.opened_chest = name_new;
    this.game_state.prefabs.chestitems.show_initial_stats();
    
    console.log(chest_new);
    
    return chest_new;
};

Mst.ChestCreator.prototype.drop_new_chest = function (object, item_frame) { 
    "use strict";
    
    const position_new = {
        x: Math.round((object.x - 8)/16)*16 + 8,
        y: Math.round((object.y + 8)/16)*16 - 8
    };

    const tilex = this.game_state.layers.background.getTileX(position_new.x);
    const tiley = this.game_state.layers.background.getTileY(position_new.y);
    
    console.log("create chest " + item_frame);
    console.log(position_new);
    
    this.properties.closed_frame = item_frame;
    this.properties.opened_frame = item_frame;
    
    const name_new = this.create_new_chest_name();
    let chest_new = {};
    
    if (this.game_state.getGridXY(tilex, tiley) === 1) {
        console.log("Chest grid colision");
        chest_new.exist = false;
    } else {
        chest_new = this.create_object(name_new, position_new, this.properties);
        chest_new.exist = true;
        chest_new.stats.items = "";
        chest_new.frame = this.properties.opened_frame;
    }
    
    console.log(chest_new);
    
    return chest_new;
};