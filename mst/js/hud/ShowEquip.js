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
    
    this.ability_sprite = this.game_state.groups.hud.create(this.x + 37, this.y + 2, 'abilities_spritesheet', 0);
    this.ability_sprite.fixedToCamera = true;
    this.ability_sprite.inputEnabled = true;
    this.ability_sprite.input.useHandCursor = true;
    this.ability_sprite.events.onInputDown.add(this.search, this);
    
    this.menu_sprite = this.game_state.groups.hud.create(this.x + 37, this.y + 24, 'abilities_spritesheet', 1);
    this.menu_sprite.fixedToCamera = true;
    this.menu_sprite.inputEnabled = true;
    this.menu_sprite.input.useHandCursor = true;
    this.menu_sprite.events.onInputDown.add(this.menu, this);
    
    this.eqs_sprite = this.game_state.groups.hud.create(this.x, this.y + 29, 'fpoint');
    this.eqs_sprite.fixedToCamera = true;
    this.eqs_sprite.inputEnabled = true;
    this.eqs_sprite.input.useHandCursor = true;
    this.eqs_sprite.events.onInputDown.add(this.showexpequip, this);
    
    this.expequip = this.game_state.prefabs.player.stats.expequip;
    this.expequip_visible = false;
    
    this.gframes = [];
    this.expequips = [];
    
    this.initial_position = new Phaser.Point(this.x, this.y);
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
        
        if(typeof (this.game_state.core_data.items[item_frame].properties.eq) === 'undefined') {
            this.unequip();
            this.game_state.prefabs.player.stats.equip = item_frame;
            this.game_state.prefabs.sword.reequip(item_frame);
        } else {
            var index = parseInt(this.game_state.core_data.items[item_frame].properties.eq);
            this.unequipexpi(index);
            
            this.game_state.prefabs.player.stats.expequip[index] = item_frame;
            this.expequip[index] = item_frame;
            
            if (this.expequip_visible) {
                this.expequips[index].loadTexture("items_spritesheet");
                this.expequips[index].frame = item_frame;
            } else {
                this.showexpequip_init();
            }
        }
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
    this.ability_sprite.visible = false;
    this.menu_sprite.visible = false;
    this.eqs_sprite.visible = false;
    
    this.showexpequip_kill();
};

Mst.ShowEquip.prototype.show = function () {
    "use strict";
    
    this.visible = true;
    if (this.game_state.prefabs.player.stats.equip !== -1) {
        this.equiped_item.visible = true;
    }
    this.ability_sprite.visible = true;    
    this.menu_sprite.visible = true;
    this.eqs_sprite.visible = true;
};

Mst.ShowEquip.prototype.search = function () {
    "use strict";
    var b, tilex, tiley, tile, dist, test_ok, b_null, stype, sign;
    
    var player = this.game_state.prefabs.player;
    b = true;
    b_null = true;
    
    if (player.opened_signpost !== '') {
        sign = this.game_state.prefabs[player.opened_signpost];
        
        if (sign.stype === 'secsign') {
            console.log("Secsign");
            sign.loadTexture('signs_spritesheet', 0);
            sign.exposed = true;

            player.add_minutes(16);
            player.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
            this.game_state.hud.alert.show_alert("Nález: znamení!");
            b_null = false;
        }
    }
    
    if (typeof(this.game_state.layers.grass) !== 'undefined') {
        tilex = this.game_state.layers.grass.getTileX(player.x);
        tiley = this.game_state.layers.grass.getTileX(player.y);
        tile = this.game_state.map.getTile(tilex, tiley, this.game_state.layers.grass);
        console.log("Grass: " + player.x + ">" + tilex*16 + "|" + player.y + ">" + tiley*16);
        console.log(tile);

        if (tile === null) {
            b = true;
            console.log("Not grass tile");
        } else {
            b = false;
            console.log("Grass tile");
        }
    }
    
    stype = "wild";
    
    this.game_state.groups.spawners.forEachAlive(function (spawner) {
        dist = Math.sqrt(Math.pow((player.x - spawner.x),2) + Math.pow((player.y - spawner.y),2));
        console.log("Test search spawner: " + spawner.name + " " + dist);
        console.log(spawner.name.substr(0, 11));
        
        if (dist < 180 && spawner.name.substr(0, 11) === 'itemspawner') {
            b = false;
            console.log("Itemspawner close");
            stype = spawner.stype;
        }
        
    }, this);
    
    test_ok = false;
    if (!b && b_null) {
        if (stype === 'wild') {
            test_ok = this.game_state.prefabs.sword.rnd_take(20, "seeker");
        } else {
            test_ok = this.game_state.prefabs.sword.rnd_take(21, "seeker");
        }
    }
    
    if (test_ok) {
        player.add_minutes(12);
        player.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
    } else {
        if (b_null) {
            player.add_minutes(16);
            player.work_rout("seeker", "exploration", 5, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
            this.game_state.hud.alert.show_alert("Nic jsi nenašel!");
        }
    }
};

Mst.ShowEquip.prototype.menu = function () {
    "use strict";
    
};

Mst.ShowEquip.prototype.showexpequip = function () {
    "use strict";
    
    if (!this.expequip_visible) {
        this.showexpequip_init();
    } else {
        this.showexpequip_kill();
    }
};

Mst.ShowEquip.prototype.showexpequip_init = function () {
    "use strict";
    var stat, item_frame;
    
    for (var i = 0; i < this.expequip.length; i++) {
        // create new sprite to show stat
        item_frame = this.expequip[i];
        stat = this.create_new_eq_sprite(i, item_frame);
        this.gframes.push(stat.gframe);
        this.expequips.push(stat.stat);
    }
    
    this.expequip_visible = true;
};

Mst.ShowEquip.prototype.showexpequip_kill = function () {
    "use strict";
    
    this.gframes.forEach(function (gframe) {
        gframe.kill();
    });
    this.gframes = [];
    this.expequips.forEach(function (eq) {
        eq.kill();
    });
    this.expequips = [];
    this.expequip_visible = false;
};

Mst.ShowEquip.prototype.create_new_eq_sprite = function (index, frame) {
    "use strict";
    var stat_position, gframe, stat, frame_int, dupl_stat;
    
    frame_int = parseInt(frame);
    
    stat_position = new Phaser.Point(this.initial_position.x, 
                                     this.initial_position.y - 280 + (index * 30));
    
    gframe = this.game_state.groups[this.stats_group].create(stat_position.x, stat_position.y, "frame_item");
    gframe.fixedToCamera = true;
    gframe.alpha = 0.8;
    
    if (frame_int === 0) {
        stat = this.game_state.groups[this.stats_group].create(stat_position.x + 4, stat_position.y + 5, 'equip_spritesheet', index);
        stat.frame = index;
    } else {
        stat = this.game_state.groups[this.stats_group].create(stat_position.x + 4, stat_position.y + 5, 'items_spritesheet', frame_int);
        stat.frame = frame_int;
    }
    stat.index = index;
    
    stat.fixedToCamera = true;
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.unequipexp, this);
    
    dupl_stat = {};
    dupl_stat.gframe = gframe;
    dupl_stat.stat = stat;
    return dupl_stat;
};

Mst.ShowEquip.prototype.unequipexp = function (item) {
    "use strict";    
    var item_frame, item_index;
    //console.log(item);
    console.log("Unequip exp: " + item.frame);
    
    item_index = 0;
    item_frame = parseInt(item.frame);
    var index = item.index;
    
    if (this.expequip[index] !== 0) {
        item_index = this.game_state.prefabs.player.add_item(item_frame, 1);
        
        item.loadTexture("equip_spritesheet");
        item.frame = index;
        
        this.game_state.prefabs.player.stats.expequip[index] = 0;
        this.expequip[index] = 0;
    }
    return item_index;
};

Mst.ShowEquip.prototype.unequipexpi = function (index) {
    "use strict";
    
    var item_frame, item_index, item;
    //console.log(item);
    
    item_index = 0;
    if (this.expequip[index] !== 0) {
        item = this.expequips[index];
        
        console.log("Unequip expi: " + this.expequip[index]);
        
        item_frame = parseInt(this.expequip[index]);
        item_index = this.game_state.prefabs.player.add_item(item_frame, 1);
        
        if (typeof (item.frame) !== 'undefined') {
            item.loadTexture("equip_spritesheet");
            item.frame = index;
        }
        
        this.game_state.prefabs.player.stats.expequip[index] = 0;
        this.expequip[index] = 0;
    }
    return item_index;
};
