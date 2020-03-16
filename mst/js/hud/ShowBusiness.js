var Phaser = Phaser || {};
var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowBusiness = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.stats = [];
    this.texts = [];
    this.texts1 = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    this.stat_to_show = properties.stat_to_show;
    this.prefab_name = this.stat_to_show.split(".")[0];
    this.stat_name = this.stat_to_show.split(".")[1]; //items
    
    this.type_buy = true;
    
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
    
    //this.create_buy_sel();
};

Mst.ShowBusiness.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowBusiness.prototype.constructor = Mst.ShowBusiness;

Mst.ShowBusiness.prototype.show_initial_stats = function () {
    "use strict";
    var stat_index, stat, item_frame, item_quantity, item_cost;

    // show initial stats
    
    this.stat = "";
    this.prefab_name = this.game_state.prefabs.player.opened_business;
    
    if (this.prefab_name != "") {
        this.stat = this.game_state.prefabs[this.prefab_name].stats.items;
    }
    
    console.log("Init " + this.prefab_name + ": " + this.stat);
    
    if (this.stat != "") {
        this.game_state.hud.right_window.show("");
        //this.show_buy_sel();
        this.game_state.prefabs.items.set_put_type("buy");
        
        this.stat_splited = this.stat.split("_");
        
        for (stat_index = 0; stat_index < this.stat_splited.length; stat_index += 1) {
            // create new sprite to show stat
            item_frame = this.stat_splited[stat_index].split("-")[0];
            //console.log(item_frame);
            item_cost = this.stat_splited[stat_index].split("-")[2];
            stat = this.create_new_stat_sprite(stat_index, item_frame, item_cost);
            this.stats.push(stat.stat);
            this.texts.push(stat.text);
            this.texts1.push(stat.text1);
        }
    } else {
        this.stat_splited = [];
    }
};

Mst.ShowBusiness.prototype.reset = function (position_x, position_y) {
    "use strict";
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    //console.log("reset");
    this.initial_position = new Phaser.Point(this.x, this.y);
    this.show_initial_stats();
    this.visible = false;
};

Mst.ShowBusiness.prototype.update_stat = function (new_stat) {
    "use strict";
 
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowBusiness.prototype.create_new_stat_sprite = function (stat_index, frame, cost) {
    "use strict";
    var stat_position, stat, stat_property, frame_int, text, text_style;
    var dupl_stat = {};
    // calculate the next stat position
    stat_position = new Phaser.Point(this.initial_position.x + (this.stats.length * this.stats_spacing.x),
                                     this.initial_position.y + (this.stats.length * this.stats_spacing.y));
    //console.log(this.stats.length);
    //console.log(this.initial_position);
    //console.log(stat_position);
    // get the first dead sprite in the stats group
    stat = this.game_state.groups[this.stats_group].getFirstDead();
    frame_int = parseInt(frame);
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
        
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowBusiness prefab
        stat = this.game_state.groups[this.stats_group].create(stat_position.x, stat_position.y, 'items_spritesheet', frame_int); //!!!!!!!!!!
        stat.frame = frame_int;
    }
    
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    stat.fixedToCamera = true;
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.business_that_item, this);
    
    text_style = {"font": "13px Arial", "fill": "#FFFFFF"};
    //this.text = new Phaser.Text(this.game_state.game, stat_position.x + 10, stat_position.y + 8, cost, text_style);
    
    text = this.game_state.core_data.items[frame_int].name;
    this.text1 = stat.addChild(this.game_state.game.make.text(stat_position.x + 22, stat_position.y + 1, text, text_style));
    this.text1.fixedToCamera = true;
    this.game_state.groups[this.stats_group].add(this.text1);
    
    this.text = stat.addChild(this.game_state.game.make.text(stat_position.x + 92, stat_position.y + 1, "G: " + cost, text_style));
    this.text.fixedToCamera = true;
    this.game_state.groups[this.stats_group].add(this.text);
    
    //console.log(this.text);
    //stat.frame = parseInt(frame);
    //this.game_state.game.physics.enable(stat, Phaser.Physics.ARCADE);
    
    stat.cost = parseInt(cost);
    stat.stat_index = stat_index;
    
    
    dupl_stat.stat = stat;
    dupl_stat.text = this.text;
    dupl_stat.text1 = this.text1;
    
    return dupl_stat;
};

Mst.ShowBusiness.prototype.business_that_item = function (one_item) {
    "use strict";
    var item_index, item_frame, item_cost, index_gold, item;
    
    var player = this.game_state.prefabs.player;
    console.log("Business");
    
    if (this.game_state.prefabs.player.opened_business != "") {
        item_index = one_item.stat_index;
        item_frame = this.stats[item_index].frame;
        item_cost = this.stats[item_index].cost;
        
        if (this.type_buy) {
            

            // ------------------------------------- test player gold --------------------------------------

            index_gold = this.game_state.prefabs.items.test_player_gold(item_cost);

            console.log("Index gold:" + index_gold);

            if (index_gold != -1) {

                // ------------------------------------- Player - gold ---------------------------------------

                player.subtract_item(index_gold, item_cost);

                // ------------------------------------ Player + item ------------------------------------------

                tplayer.add_item(item_frame, 1);

            } else {
                // Na to nemas
            } 
        } else {
            item = this.game_state.prefabs.items.index_by_frame(item_frame);
            
            if (item.is_in) {
                
                var quant_put = 1;
                if (player.keys.shift.isDown) {
                    console.log("SHIFT");
                    quant_put = Math.ceil(parseInt(item.quantity)/2);

                }
                
                // ------------------------------------ Player - item ------------------------------------------
            
                player.subtract_item(item.index, quant_put);

                // ------------------------------------- Player + gold ---------------------------------------

                player.add_item(1, item_cost*quant_put);
            } else {
                this.game_state.hud.alert.show_alert("To nemáš!");
            }
        }
    }
};

/*Mst.ShowBusiness.prototype.create_buy_sel = function () {
    "use strict";
    var x, y, text_style;
    
    x = this.game_state.hud.dialogue.x + 8;
    y = this.game_state.hud.dialogue.y + 80;
    
    text_style = {"font": "12px Arial", "fill": "#BF9F00", wordWrap: true, wordWrapWidth: this.width - 25};
    //this.text = new Phaser.Text(this.game_state.game, 273 + 10, 52 + 8, "", text_style);
    //this.text = this.addChild(this.game_state.game.make.text(273 + 10, 52 + 8, "", text_style));
    this.text_buy = this.game_state.game.add.text(x, y, "[koupit]", text_style);
    this.text_buy.fixedToCamera = true;
    this.text_buy.inputEnabled = true;
    this.text_buy.input.useHandCursor = false;
    this.text_buy.events.onInputDown.add(this.business_buy, this);
    this.text_buy.visible = false;
    this.text_buy.fill = "#BCBAB3";
    
    this.text_sell = this.game_state.game.add.text(x + 55, y, "[prodat]", text_style);
    this.text_sell.fixedToCamera = true;
    this.text_sell.inputEnabled = true;
    this.text_sell.input.useHandCursor = true;
    this.text_sell.events.onInputDown.add(this.business_sell, this);
    this.text_sell.visible = false;
};

Mst.ShowBusiness.prototype.show_buy_sel = function () {
    "use strict";
    this.text_buy.visible = true;
    this.text_sell.visible = true;    
};

Mst.ShowBusiness.prototype.hide_buy_sel = function () {
    "use strict";
    this.text_buy.visible = false;
    this.text_sell.visible = false;
};

Mst.ShowBusiness.prototype.business_buy = function () {
    "use strict";
    this.text_buy.input.useHandCursor = false;
    this.text_buy.fill = "#BCBAB3";
    this.text_sell.input.useHandCursor = true;
    this.text_sell.fill = "#BF9F00"
    
    this.type_buy = true;
    this.game_state.prefabs.items.set_put_type("buy");
};

Mst.ShowBusiness.prototype.business_sell = function () {
    "use strict";
    this.text_buy.input.useHandCursor = true;
    this.text_buy.fill = "#BF9F00"
    this.text_sell.input.useHandCursor = false;
    this.text_sell.fill = "#BCBAB3";
    
    this.type_buy = false;
    this.game_state.prefabs.items.set_put_type("sell");
};*/

Mst.ShowBusiness.prototype.put_down_item = function (one_item) {
    "use strict";
    var item_index, item_frame, item_quantity;
    
    // ------------------------------------- Player - item -----------------------------------------   
    
    item_index = one_item.stat_index;
    item_frame = this.stats[item_index].frame;
    item_quantity = this.stats[item_index].quantity;
        
    item_quantity--;
    
    if (item_quantity > 0) {
        this.texts[item_index].text = item_quantity;
        this.stats[item_index].quantity = item_quantity;
    } else {
        one_item.kill();
        this.texts[item_index].destroy();
    }
    
    this.update_item(item_index, item_frame, item_quantity);
    
    // ------------------------------------ Chest + item ------------------------------------------
       
    this.add_item(item_frame, 1);
};

Mst.ShowBusiness.prototype.add_item = function (item_frame) {
    "use strict";
    var item_index, item_quantity, other_item, other_item_prefab, is_not_new_chest, chest_new;
    
    is_not_new_chest = true;
    
    if (this.prefab_name == "player") {
        other_item_prefab = "chestitems";
        if (this.game_state.prefabs.player.opened_chest == "") {
            // - create new chest
            chest_new = this.game_state.prefabs.chest_creator.create_new_chest(item_frame);
            if (chest_new.closed_frame != 3) {
                is_not_new_chest = false;
            }
        }
    } else {
        other_item_prefab = "items";
    }
    
    console.log(this.prefab_name + ": " + this.stat);
    
    if (is_not_new_chest) {
        other_item = this.game_state.prefabs[other_item_prefab].index_by_frame(item_frame);
        item_index = other_item.index;

        if (other_item.is_in) {
            item_quantity = other_item.quantity;
            item_quantity++;
            this.game_state.prefabs[other_item_prefab].texts[item_index].text = item_quantity;
            this.game_state.prefabs[other_item_prefab].stats[item_index].quantity = item_quantity;
        } else {
            item_index = -1;
            item_quantity = 1;
        }

        this.game_state.prefabs[other_item_prefab].update_item(item_index, item_frame, item_quantity); 
    }
    
};

Mst.ShowBusiness.prototype.update_item = function (item_index, item_frame, item_quantity) {
    "use strict";
    var item_updated, is_in_items;
    is_in_items = true;
    
    item_updated = item_frame + "-" + item_quantity;
    
    if (item_quantity > 0) {
        if (item_index > -1) {
            this.stat_splited[item_index] = item_updated
        } else {
            is_in_items = false;
            this.stat_splited.push(item_updated);
        }
    } else {
        is_in_items = false;
        this.stat_splited.splice(item_index, 1);
    }
    
    //console.log(this.stat_splited);
    this.stat = this.stat_splited.join("_");
    //console.log(this.stat_splited.length + " " + this.stat);
    this.game_state.prefabs[this.prefab_name].stats.items = this.stat;

    
    //console.log(this.prefab_name);
    //console.log(this.prefab_name != "player");
    
    if (this.prefab_name != "player") {
        this.game_state.prefabs[this.prefab_name].updated = true;
        //console.log(this.game_state.prefabs[this.prefab_name].updated);
    }
    
    //console.log(this.game_state.prefabs[this.prefab_name]);
    
    if (is_in_items === false) {
        this.kill_stats();
        this.show_initial_stats();
    }
};

Mst.ShowBusiness.prototype.kill_stats = function () {
    this.stats.forEach(function(stat) {
        stat.kill();
    });
    this.stats = [];
    this.texts.forEach(function(text) {
        text.destroy();
    });
    this.texts1.forEach(function(text) {
        text.destroy();
    });
    this.texts = [];
    this.texts1 = [];
    this.visible = false;
    
    //this.hide_buy_sel();
    this.game_state.hud.right_window.hide();
    this.game_state.prefabs.items.set_put_type("put");
};
    
Mst.ShowBusiness.prototype.index_by_frame = function (item_frame) {
    "use strict";
    var is_in_items, index_frame, index_return, item_quantity;
    index_frame = -1;
    is_in_items = false;
    item_quantity = 0;
    index_return = {};
    
    for (var i = 0; i < this.stat_splited.length; i++) {
        if (this.stat_splited[i].split("-")[0] == item_frame) {
            item_quantity = this.stat_splited[i].split("-")[1];
            index_frame = i; 
            is_in_items = true;
        }
    }
    
    index_return.index = index_frame;
    index_return.is_in = is_in_items;
    index_return.frame = item_frame;
    index_return.quantity = item_quantity;
    return index_return;
};