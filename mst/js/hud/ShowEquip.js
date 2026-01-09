Mst.ShowEquip = class extends Mst.ShowStat {
    constructor(name, position, properties) {
        const new_position = {x: position.x, y: position.y - 5};
        super(name, new_position, properties);

        this.alpha = 0.7;

        this.equiped_item = this.group.create(position.x + 4, position.y, 'items_spritesheet');
        this.equiped_item.fixedToCamera = true;
        this.equiped_item.inputEnabled = true;
        this.equiped_item.input.useHandCursor = true;
        this.equiped_item.events.onInputDown.add(this.unequip, this);
        this.equiped_item.visible = false;

        const equip = parseInt(Mst.player.stats.equip);
        if (equip != -1) {
            this.equiped_item.frame = equip;
            this.equiped_item.visible = true;
        }

        this.ability_sprite = this.group.create(this.x + 37, this.y + 2, 'abilities_spritesheet', 0);
        this.ability_sprite.fixedToCamera = true;
        this.ability_sprite.inputEnabled = true;
        this.ability_sprite.input.useHandCursor = true;
        this.ability_sprite.events.onInputDown.add(this.search, this);

        this.menu_sprite = this.group.create(this.x + 37, this.y + 24, 'abilities_spritesheet', 1);
        this.menu_sprite.fixedToCamera = true;
        this.menu_sprite.inputEnabled = true;
        this.menu_sprite.input.useHandCursor = true;
        this.menu_sprite.events.onInputDown.add(this.menu, this);

        this.eqs_sprite = this.group.create(this.x, this.y + 29, 'fpoint');
        this.eqs_sprite.fixedToCamera = true;
        this.eqs_sprite.inputEnabled = true;
        this.eqs_sprite.input.useHandCursor = true;
        this.eqs_sprite.events.onInputDown.add(this.showexpequip, this);

        this.expequip = Mst.player.stats.expequip;
        this.expequip_visible = false;

        this.gframes = [];
        this.expequips = [];

        this.initial_position = new Mst.Position(this);
    }
};

Mst.ShowEquip.prototype.reset = function (position_x, position_y) {
    "use strict";
};

Mst.ShowEquip.prototype.update_stat = function (new_stat) {
    "use strict";
    if (new_stat !== -1) {
        this.equiped_item.frame = new_stat;
        this.equiped_item.visible = true;
    } else {
        this.equiped_item.visible = false;
    }

    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowEquip.prototype.equip = function (item) {
    "use strict";
    
    console.log("Equip: " + item.frame + " " + item.index);

    console.log(Mst.items[item.frame].istool === 'true');
    
    if(Mst.items[item.frame].istool === 'true') {
        item.sub();
        
        if(!Mst.items[item.frame].properties.eq) {
            this.unequip();
            Mst.player.stats.equip = item.frame;
            Mst.cPlayer.weapon.reequip(item.frame);
        } else {
            const index = parseInt(Mst.items[item.frame].properties.eq);
            this.unequipexpi(index);
            
            Mst.player.stats.expequip[index] = item.frame;
            this.expequip[index] = item.frame;
            
            if (this.expequip_visible) {
                this.expequips[index].loadTexture("items_spritesheet");
                this.expequips[index].frame = item.frame;
            } else {
                this.showexpequip_init();
            }
        }
    } else {
        Mst.hud.alerts.show("To nejde uchopit!");
    }
};

Mst.ShowEquip.prototype.unequip = function () {
    "use strict";
    console.log("Unequip: " + Mst.player.stats.equip);
    const item_frame = parseInt(Mst.player.stats.equip);
    
    if (item_frame != -1) {
        const item = Mst.cPlayer.items.add(item_frame, 1);
        
        Mst.player.stats.equip = -1;
        Mst.cPlayer.weapon.reequip(-1);
        return item;
    }
    return null;
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
    if (Mst.player.stats.equip !== -1) {
        this.equiped_item.visible = true;
    }
    this.ability_sprite.visible = true;    
    this.menu_sprite.visible = true;
    this.eqs_sprite.visible = true;
};

Mst.ShowEquip.prototype.search = function () {
    "use strict";
    
    const player = Mst.player;
    const cGame = Mst.cGame;
    let b_null = true;
    
    if (player.cPlayer.signpost.opened) {
        const sign = player.cPlayer.signpost.opened;
        
        if (sign.stype === 'secsign') {
            console.log("Secsign");
            sign.loadTexture('signs_spritesheet', 0);
            sign.exposed = true;

            player.mPlayer.gtime.add_minutes(16);
            player.cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
            Mst.hud.alerts.show("Nález: znamení!");
            b_null = false;
        }
    }
    
    if (b_null) {
        const cftp = cGame.cases.ftprints.return_near();
        
        if (cftp) {
            player.mPlayer.gtime.add_minutes(12);
            Mst.hud.alerts.show("Nález: stopy!");
            player.cPlayer.work_rout("tracer", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p

            const pcid = player.cPlayer.cases.add_ftprints_tocase(cftp);
            console.log(cftp);
            if (pcid > -1) {
                const t1 = {
                    pcid: pcid,
                    c_type: "evidence"
                };
                Mst.hud.book.show_book();
                Mst.hud.book.book_investigate(t1);
            }
            b_null = false;
        }
    }
    
    if (b_null) {
        let b = true;
        if (Mst.layers.grass) {
            const tile = Mst.map.getTileLayer(player, "grass");
            if (!tile) b = false;
            console.log("Grass tile", b, tile);
        }

        let test_ok = false;
        const spawner = Mst.groups.getItemSpawnerDistance(player, 180);
        if (spawner && b) {
            if (spawner.stype === 'wild') {
                test_ok = player.cPlayer.weapon.cSword.rnd_take(20, "seeker");
            } else {
                test_ok = player.cPlayer.weapon.cSword.rnd_take(21, "seeker");
            }
        }

        if (test_ok) {
            player.mPlayer.gtime.add_minutes(12);
            player.cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
            b_null = false;
        }
    }
    
    if (b_null) {
        player.mPlayer.gtime.add_minutes(16);
        player.cPlayer.work_rout("seeker", "exploration", 5, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
        Mst.hud.alerts.show("Nic jsi nenašel!");
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
    
    for (let i = 0; i < this.expequip.length; i++) {
        // create new sprite to show stat
        const item_frame = this.expequip[i];
        const stat = this.create_new_eq_sprite(i, item_frame);
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
    const frame_int = parseInt(frame);
    
    const stat_position = new Mst.Position(this.initial_position.x,
                                           this.initial_position.y - 280 + (index * 30));
    
    const gframe = Mst.groups[this.stats_group].create(stat_position.x, stat_position.y, "frame_item");
    gframe.fixedToCamera = true;
    gframe.alpha = 0.8;

    let stat = null;
    if (frame_int === 0) {
        stat = Mst.groups[this.stats_group].create(stat_position.x + 4, stat_position.y + 5, 'equip_spritesheet', index);
        stat.frame = index;
    } else {
        stat = Mst.groups[this.stats_group].create(stat_position.x + 4, stat_position.y + 5, 'items_spritesheet', frame_int);
        stat.frame = frame_int;
    }
    stat.index = index;
    
    stat.fixedToCamera = true;
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.unequipexp, this);
    
    const dupl_stat = {};
    dupl_stat.gframe = gframe;
    dupl_stat.stat = stat;
    return dupl_stat;
};

Mst.ShowEquip.prototype.unequipexp = function (item) {
    "use strict";
    console.log("Unequip exp: " + item.frame);
    
    let item_index = 0;
    item_frame = parseInt(item.frame);
    const index = item.index;
    
    if (this.expequip[index] !== 0) {
        item_index = Mst.cPlayer.items.add(item_frame, 1);
        
        item.loadTexture("equip_spritesheet");
        item.frame = index;
        
        Mst.player.stats.expequip[index] = 0;
        this.expequip[index] = 0;
    }
    return item_index;
};

Mst.ShowEquip.prototype.unequipexpi = function (index) {
    "use strict";
    
    let item_index = 0;
    if (this.expequip[index] !== 0) {
        const item = this.expequips[index];
        
        console.log("Unequip expi: " + this.expequip[index]);
        
        const item_frame = parseInt(this.expequip[index]);
        item_index = Mst.cPlayer.items.add(item_frame, 1);
        
        if (typeof (item.frame) !== 'undefined') {
            item.loadTexture("equip_spritesheet");
            item.frame = index;
        }
        
        Mst.player.stats.expequip[index] = 0;
        this.expequip[index] = 0;
    }
    return item_index;
};
