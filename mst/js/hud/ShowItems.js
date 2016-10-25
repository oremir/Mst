var Phaser = Phaser || {};
var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowItems = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.game_state = game_state;
    this.stats = [];
    this.texts = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    this.stat_to_show = properties.stat_to_show;
    this.prefab_name = this.stat_to_show.split(".")[0];
    this.stat_name = this.stat_to_show.split(".")[1]; //items
    
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Phaser.Point(this.x, this.y);
};

Mst.ShowItems.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowItems.prototype.constructor = Mst.ShowItems;

Mst.ShowItems.prototype.show_initial_stats = function () {
    "use strict";
    var stat_index, stat, item_frame, item_quantity;

    // show initial stats
    
    this.stat = "";
    
    if (this.prefab_name != "player") {
        this.prefab_name = this.game_state.prefabs.player.opened_chest;    
    } 
    
    //console.log(this.prefab_name);
    
    if (this.prefab_name != "") {
        this.stat = this.game_state.prefabs[this.prefab_name].stats.items;
    }
    
    if (this.stat != "") {        
        this.stat_splited = this.stat.split("_");
        
        for (stat_index = 0; stat_index < this.stat_splited.length; stat_index += 1) {
            // create new sprite to show stat
            item_frame = this.stat_splited[stat_index].split("-")[0];
            //console.log(item_frame);
            item_quantity = this.stat_splited[stat_index].split("-")[1];
            stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity);
            this.stats.push(stat.stat);
            this.texts.push(stat.text);
        }
    }
};

Mst.ShowItems.prototype.reset = function (position_x, position_y) {
    "use strict";
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    //console.log("reset");
    this.initial_position = new Phaser.Point(this.x, this.y);
    this.show_initial_stats();
    this.visible = false;
};

Mst.ShowItems.prototype.update_stat = function (new_stat) {
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

Mst.ShowItems.prototype.create_new_stat_sprite = function (stat_index, frame, quantity) {
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
    //console.log(stat);
    if (stat) {
        // if there is a dead stat, just reset it
        //alert(1);
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowItems prefab
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

Mst.ShowItems.prototype.put_down_item = function (one_item) {
    "use strict";
    var item_index, item_frame, item_quantity, other_item, other_item_prefab;
    // Player
    
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
    
    //Chest
    
    //console.log(this.game_state.prefabs);
    //console.log(this.game_state.prefabs.chestitems);
    
    if (this.prefab_name == "player") {
        other_item_prefab = "chestitems";
    } else {
        other_item_prefab = "items";
    }
    
    console.log(this.prefab_name);
    
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
    
    
    //alert(one_item.quantity+" "+one_item.frame);
    //console.log(this);
    //console.log(one_item);
    //alert(one_item.stat_index+" "+this.texts[one_item.stat_index].text);
};

Mst.ShowItems.prototype.update_item = function (item_index, item_frame, item_quantity) {
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
    
    console.log(this.stat_splited);
    this.stat = this.stat_splited.join("_");
    console.log(this.stat_splited.length + " " + this.stat);
    this.game_state.prefabs[this.prefab_name].stats.items = this.stat;
    
    if (is_in_items === false) {
        this.kill_stats();
        this.show_initial_stats();
    }
};

Mst.ShowItems.prototype.kill_stats = function () {
    this.stats.forEach(function(stat) {
        stat.kill();
    });
    this.stats = [];
    this.texts.forEach(function(text) {
        text.destroy();
    });
    this.texts = [];
    this.visible = false;
};
    
Mst.ShowItems.prototype.index_by_frame = function (item_frame) {
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