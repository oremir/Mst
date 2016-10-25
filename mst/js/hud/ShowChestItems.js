var Phaser = Phaser || {};
var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowChestItems = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.game_state = game_state;
    this.stats = [];
    this.texts = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
};

Mst.ShowChestItems.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowChestItems.prototype.constructor = Mst.ShowChestItems;

Mst.ShowChestItems.prototype.show_initial_stats = function () {
    "use strict";
    var prefab_name, stat_name, items_packed, items_packed_splited, stat_index, stat, item_frame, item_quantity;
    
    // show initial stats
    prefab_name = this.stat_to_show.split(".")[0];
    stat_name = this.stat_to_show.split(".")[1];
    
    if (prefab_name == this.game_state.prefabs.player.opened_chest) {
        items_packed = this.game_state.prefabs[prefab_name].stats[stat_name];
        //console.log(items_packed);
        items_packed_splited = items_packed.split("_");
        
        for (stat_index = 0; stat_index < items_packed_splited.length; stat_index += 1) {
            // create new sprite to show stat
            item_frame = items_packed_splited[stat_index].split("-")[0];
            //console.log(item_frame);
            item_quantity = items_packed_splited[stat_index].split("-")[1];
            stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity);
            this.stats.push(stat.stat);
            this.texts.push(stat.text);
        }
        this.stat = items_packed;
    }
};

Mst.ShowChestItems.prototype.reset = function (position_x, position_y) {
    "use strict";
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
    this.show_initial_stats();
    this.visible = false;
};

Mst.ShowChestItems.prototype.update_stat = function (new_stat) {
    "use strict";
//    var stat_difference, stat_index, stat;
//    stat_difference = Math.abs(new_stat - this.stat);
//    if (new_stat > this.stat) {
//        // if the new stat is greater, we must create new stat sprites
//        for (stat_index = 0; stat_index < stat_difference; stat_index += 1) {
//            stat = this.create_new_stat_sprite();
//            this.stats.push(stat);
//        }
//    } else {
//        // if the new stat is lower, we must kill extra stat sprites
//        for (stat_index = 0; stat_index < stat_difference; stat_index += 1) {
//            stat = this.stats.pop();
//            stat.kill();
//        }
//    }
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowChestItems.prototype.create_new_stat_sprite = function (stat_index, frame, quantity) {
    "use strict";
    var stat_position, stat, stat_property, frame_int, text, text_style;
    var dupl_stat = {};
    // calculate the next stat position
    stat_position = new Phaser.Point(this.initial_position.x + (this.stats.length * this.stats_spacing.x),
                                     this.initial_position.y + (this.stats.length * this.stats_spacing.y));
    // get the first dead sprite in the stats group
    stat = this.game_state.groups[this.stats_group].getFirstDead();
    frame_int = parseInt(frame);
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowChestItems prefab
        stat = this.game_state.groups[this.stats_group].create(stat_position.x, stat_position.y, 'items_spritesheet', frame_int); //!!!!!!!!!!
    }
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    stat.fixedToCamera = true;
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.put_down_item, this);
    
    text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
    //this.text = new Phaser.Text(this.game_state.game, stat_position.x + 10, stat_position.y + 8, quantity, text_style);
    this.text = stat.addChild(this.game_state.game.make.text(stat_position.x + 10, stat_position.y + 8, quantity, text_style));
    this.text.fixedToCamera = true;
    this.game_state.groups[this.stats_group].add(this.text);
    
    //stat.frame = parseInt(frame);
    //this.game_state.game.physics.enable(stat, Phaser.Physics.ARCADE);
    //stat.quantity = parseInt(quantity);
    
    stat.quantity = parseInt(quantity);
    stat.stat_index = stat_index;
    
    
    dupl_stat.stat = stat;
    dupl_stat.text = this.text;
    
    return dupl_stat;
};

Mst.ShowChestItems.prototype.put_down_item = function (one_item) {
    var item_index, item_quantity;
    
    item_index = one_item.stat_index;
        
    item_quantity = parseInt(this.texts[item_index].text);
    item_quantity --;
    
    if (item_quantity > 0) {
        this.texts[item_index].text = item_quantity;
    } else {
        one_item.kill();
        this.texts[item_index].destroy();
    }
    
    this.update_item(item_index, one_item.frame, item_quantity);
    
    
    //alert(one_item.quantity+" "+one_item.frame);
    //console.log(this);
    //console.log(one_item);
    //alert(one_item.stat_index+" "+this.texts[one_item.stat_index].text);
};

Mst.ShowChestItems.prototype.update_item = function (item_index, item_frame, item_quantity) {
    var items_packed, items_packed_splited, item_updated, is_in_items;
    is_in_items = true;
    
    item_updated = item_frame + "-" + item_quantity;

    items_packed = this.game_state.prefabs.chest.stats.items;
    items_packed_splited = items_packed.split("_");
    
    if (item_quantity > 0) {
        if (items_packed_splited[item_index].split("-")[0] == item_frame) {
            items_packed_splited[item_index] = item_updated;
        } else {
            is_in_items = false;
            for (var i = 0; i < items_packed_splited.length; i++) {
                if (items_packed_splited[i].split("-")[0] == item_frame) {
                    items_packed_splited[item_index] = item_updated; 
                    is_in_items = true;
                }
            }
        }
        if (is_in_items === false) {
            items_packed_splited.push(item_updated);
        }
    }
    
    this.game_state.prefabs.chest.stats.items = items_packed_splited.join("_");
    
    if (is_in_items === false) {
        this.kill_stats();
        this.show_initial_stats();
    }
};

Mst.ShowChestItems.prototype.kill_stats = function () {
    this.stats.forEach(function(stat) {
        stat.kill();
    });
    this.texts.forEach(function(text) {
        text.destroy();
    });
}

Mst.ShowChestItems.prototype.index_by_frame = function (item_frame) {
    var items_packed, items_packed_splited, is_in_items, index_frame, index_return, item_quantity;
    index_frame = -1;
    is_in_items = false;
    item_quantity = 0;
    index_return = {};
    
    items_packed = this.game_state.prefabs.chest.stats.items;
    items_packed_splited = items_packed.split("_");
    
    for (var i = 0; i < items_packed_splited.length; i++) {
        if (items_packed_splited[i].split("-")[0] == item_frame) {
            item_quantity = items_packed_splited[i].split("-")[1];
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
    