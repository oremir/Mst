var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowEquip = function (game_state, name, position, properties) {
    "use strict";
    var new_position, equip;
    
    new_position = {x: position.x, y: position.y - 5};
    
    Mst.ShowStat.call(this, game_state, name, new_position, properties);
    
    this.alpha = 0.7;
    this.stats_group = properties.stats_group;

    this.equiped_item = this.game_state.groups[this.stats_group].create(position.x + 4, position.y, 'items_spritesheet');
    this.equiped_item.fixedToCamera = true;
    this.equiped_item.inputEnabled = true;
    this.equiped_item.input.useHandCursor = true;
    this.equiped_item.events.onInputDown.add(this.unequip, this);
    this.equiped_item.visible = false;
    
    equip = parseInt(this.game_state.prefabs.player.stats.equip);
    if (equip != -1) {        
        this.equiped_item.frame = equip;
        this.equiped_item.visible = true;
    }
};

Mst.ShowEquip.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowEquip.prototype.constructor = Mst.ShowEquip;

Mst.ShowEquip.prototype.reset = function (position_x, position_y) {
    "use strict";
};

Mst.ShowEquip.prototype.update_stat = function (new_stat) {
    "use strict";
    // update the text to show the new stat value
    
    if (new_stat != -1) {        
        this.equiped_item.frame = new_stat;
        this.equiped_item.visible = true;
    } else {
        this.equiped_item.visible = false;
    }
    
    
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowEquip.prototype.equip = function (item_index, item_frame) {
    "use strict";
    
    console.log("Equip: " + item_frame + " " + item_index);
    
    item_frame = parseInt(item_frame);
    
    console.log(this.game_state.core_data.items[item_frame].istool === 'true');
    
    if(this.game_state.core_data.items[item_frame].istool === 'true') {
        this.game_state.prefabs.player.subtract_item(item_index, 1);
        
        this.unequip();
        this.game_state.prefabs.player.stats.equip = item_frame;
        this.game_state.prefabs.sword.reequip(item_frame);
    } else {
        this.game_state.hud.alert.show_alert("To nejde uchopit!");
    }
};

Mst.ShowEquip.prototype.unequip = function () {
    "use strict";
    var item_frame, item_index;
    console.log("Unequip: " + this.game_state.prefabs.player.stats.equip);
    
    item_index = -1;
    item_frame = parseInt(this.game_state.prefabs.player.stats.equip);
    
    if (item_frame != -1) {
        item_index = this.game_state.prefabs.player.add_item(item_frame, 1);
        
        this.game_state.prefabs.player.stats.equip = -1;
        this.game_state.prefabs.sword.reequip(-1);
    }
    return item_index;
};

Mst.ShowEquip.prototype.hide = function () {
    "use strict";
    
    this.visible = false;
    this.equiped_item.visible = false;  
};

Mst.ShowEquip.prototype.show = function () {
    "use strict";
    
    this.visible = true;
    if (this.game_state.prefabs.player.stats.equip !== -1) {
        this.equiped_item.visible = true;
    }
};

