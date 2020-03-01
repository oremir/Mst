var Phaser = Phaser || {};
var Engine = Engine || {};
var Mst = Mst || {};

Mst.ShowItems = function (game_state, name, position, properties) {
    "use strict";
    Mst.ShowStat.call(this, game_state, name, position, properties);
    this.visible = false;
    this.game_state = game_state;
    this.gframes = [];
    this.stats = [];
    this.texts = [];
    this.stats_spacing = properties.stats_spacing;
    this.stats_group = properties.stats_group;
    this.stat_to_show = properties.stat_to_show;
    this.prefab_name = this.stat_to_show.split(".")[0];
    this.prefab_frame = 0;
    this.stat_name = this.stat_to_show.split(".")[1]; //items
    
    this.put_type = "put";
    
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
    this.prefab_frame = 0;
    
    if (this.prefab_name !== "player") {
        this.prefab_name = this.game_state.prefabs.player.opened_chest;
    }
    
    if (this.prefab_name !== "") {
        this.stat = this.game_state.prefabs[this.prefab_name].stats.items;
        this.prefab_frame = this.game_state.prefabs[this.prefab_name].closed_frame;
    }
    
    console.log("Init " + this.prefab_name + ": " + this.stat);
    
    if (this.stat !== "") {
        this.stat_splited = this.stat.split("_");
        
        for (stat_index = 0; stat_index < this.stat_splited.length; stat_index += 1) {
            // create new sprite to show stat
            item_frame = this.stat_splited[stat_index].split("-")[0];
            //console.log(item_frame);
            item_quantity = this.stat_splited[stat_index].split("-")[1];
            stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity);
            this.gframes.push(stat.gframe);
            this.stats.push(stat.stat);
            this.texts.push(stat.text);
        }
    } else {
        this.stat_splited = [];
    }
};

Mst.ShowItems.prototype.reset = function (position_x, position_y) {
    "use strict";
    
    console.log("Reset " + this.prefab_name + ": " + this.stat);
    
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
    var stat_position, gframe, gframe_str, stat, stat_property, frame_int, text, text_style, text_dist_x, dupl_stat, stats_spacing_y, new_stats_length;
    dupl_stat = {};
    
    text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
    // calculate the next stat position
    stat_position = new Phaser.Point(this.initial_position.x + (this.stats.length * this.stats_spacing.x),
                                     this.initial_position.y + (this.stats.length * this.stats_spacing.y));
    
    //console.log(this.prefab_name);
    if (this.prefab_name.substr(0, 5) === "chest") {
        stats_spacing_y = Math.floor(this.stats.length/12) * this.stats_spacing.x;
        new_stats_length = this.stats.length % 12;
        stat_position = new Phaser.Point(this.initial_position.x + (new_stats_length * this.stats_spacing.x),
                                         this.initial_position.y + stats_spacing_y);
    }
    //console.log(new_stats_length);
    //console.log(this.initial_position);
    //console.log(stat_position);
    
    if (this.prefab_name === "player") {
        if (stat_index < 1 && typeof (this.frame_bot) === 'undefined') {
            this.frame_bot = this.game_state.groups[this.stats_group].create(stat_position.x - 4, stat_position.y + 20, 'frame_bot');
            this.frame_bot.fixedToCamera = true;
            this.frame_bot.alpha = 0.5;
            this.frame_bot.inputEnabled = true;
            this.frame_bot.input.useHandCursor = true;
            this.frame_bot.events.onInputDown.add(this.change_put_type, this);

            this.text_bot = this.game_state.game.add.text(stat_position.x + 1, stat_position.y + 23, "Položit", text_style);
            this.text_bot.fixedToCamera = true;
        } else {
            this.frame_bot.visible = true;
            this.text_bot.text = this.translate_put_type();
        }
    }
        
    frame_int = parseInt(frame);
    
    gframe_str = "frame_item";
    
    switch (this.prefab_frame) {
        case 7: // drevo
            switch (frame_int) {
                case 32: // prkno
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 56: // zel. kotlik hori
            switch (frame_int) {
                case 92: // ohen
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 69: // dzban plny
            switch (frame_int) {
                case 81: // voda
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 71: // zel. kotlik plny
            switch (frame_int) {
                case 81: // voda
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 74: // zel. kotlik plny hori
            switch (frame_int) {
                case 81: // voda
                    gframe_str = "frame_item_fial";
                break;
                case 92: // ohen
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 77: // zel. kotlik na drevu
            switch (frame_int) {
                case 32: // prkno
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 79: // zel. kotlik na drevu plny
            switch (frame_int) {
                case 32: // prkno
                    gframe_str = "frame_item_fial";
                break;                    
                case 81: // voda
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 83: // ohen
            switch (frame_int) {
                case 92: // ohen
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        default:
            gframe_str = "frame_item";
        break;
    }
    console.log(frame_int + ":" + this.prefab_frame + "> " + gframe_str);
    
    gframe = this.game_state.groups[this.stats_group].getFirstDead();
    if (gframe) {
        // if there is a dead gframe, just reset it
        gframe.reset(stat_position.x - 4, stat_position.y - 5);
        gframe.loadTexture(gframe_str);
        
    } else {
        // if there are no dead gframes, create a new one
        // gframe sprite uses the same texture as the ShowItems prefab
        gframe = this.game_state.groups[this.stats_group].create(stat_position.x - 4, stat_position.y - 5, gframe_str);
    }
    gframe.fixedToCamera = true;
    gframe.alpha = 0.5;
    
    // get the first dead sprite in the stats group
    stat = this.game_state.groups[this.stats_group].getFirstDead();
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
        
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowItems prefab
        stat = this.game_state.groups[this.stats_group].create(stat_position.x, stat_position.y, 'items_spritesheet', frame_int); //!!!!!!!!!!
        stat.frame = frame_int;
    }
    
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    stat.fixedToCamera = true;
    stat.o_type = "items";
    stat.o_position = stat_position;
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.put_down_item, this);
    stat.events.onInputOver.add(this.game_state.hud.alt.show_alt, this);
    stat.events.onInputOut.add(this.game_state.hud.alt.hide_alt, this);
    //stat.text_alt = {};
    
    
    
    //console.log("Log: " + Math.floor(Math.log(quantity)/Math.log(10)));
    
    switch (Math.floor(Math.log(quantity) / Math.log(10))) {
        case 0:
            text_dist_x = 17;
            break;
        case 1:
            text_dist_x = 10;
            break;
        case 2:
            text_dist_x = 3;
            break;
        case 3:
            text_dist_x = 0;
            break;
        default:
            text_dist_x = 10;
    }
    
    
    //this.text = new Phaser.Text(this.game_state.game, stat_position.x + 10, stat_position.y + 8, quantity, text_style);
    this.text = stat.addChild(this.game_state.game.make.text(stat_position.x + text_dist_x, stat_position.y + 8, quantity, text_style));
    this.text.fixedToCamera = true;
    this.game_state.groups[this.stats_group].add(this.text);
    
    //stat.frame = parseInt(frame);
    //this.game_state.game.physics.enable(stat, Phaser.Physics.ARCADE);
    //stat.quantity = parseInt(quantity);
    
    stat.quantity = parseInt(quantity);
    stat.stat_index = stat_index;
    
    dupl_stat.gframe = gframe;
    dupl_stat.stat = stat;
    dupl_stat.text = this.text;
    
    return dupl_stat;
};

Mst.ShowItems.prototype.put_down_item = function (one_item) {
    "use strict";
    var item_index, item_frame, item_quantity, other_item_prefab, is_not_new_chest, chest_new, player, collide_test;
    
    console.log("put down");
    console.log(one_item);
    player = this.game_state.prefabs.player;
    
    item_index = one_item.stat_index;
    item_frame = this.stats[item_index].frame;
    
    switch (this.put_type) {
        case "put":
            if (player.opened_business === "") {
                if (this.prefab_name === "player") {
                    
                    // ------------------------------------- - item -----------------------------------------

                    item_quantity = this.subtract_item(item_index, 1);

                    // ------------------------------------- + item -----------------------------------------
                    
                    
                    if (player.opened_chest === "") { // zadna bedna otevrena - delam novou
                        // - create new chest
                        chest_new = this.game_state.prefabs.chest_creator.create_new_chest(item_frame);
                        //this.game_state.game.physics.arcade.collide(chest_new, this.game_state.layers.collision, console.log("kolidy kolidy"), null, this);
                        var a = this.game_state.layers.collision.getTiles(chest_new.x, chest_new.y, 3, 3);
                        var b = false;
                        console.log(a);
                        a.forEach(function(tile) {
                            console.log(tile.canCollide);
                            if (tile.canCollide !== null) {
                                b = true;
                            }
                        });
                        console.log(b);
                        //var testik = chest_new.collide_test();
                        if (!b) {
                            chest_new.set_owner(player.usr_id);
                            
                            switch (chest_new.closed_frame) {
                                case 3: //věci - obecně
                                    chest_new.add_item(item_frame, 1);
                                break;
                                case 7: //dřevo
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.add_item(item_frame, item_quantity);
                                    }
                                break;
                                case 21: //kámen
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.add_item(item_frame, item_quantity);
                                    }
                                break;
                                case 30: //kmen
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.add_item(item_frame, item_quantity);
                                    }
                                break;
                                case 69: //dzban s vodou
                                    chest_new.add_item(81, 1); //cista voda
                                break;
                                case 71: //zel. kotlik s vodou
                                    chest_new.add_item(81, 1); //cista voda
                                break;
                            }
                        } else {
                            console.log("Sem to nejde polozit");
                            this.game_state.hud.alert.show_alert("Sem to nejde položit");
                            if (chest_new.closed_frame == 3) {
                                this.add_item(item_frame, 1);
                            }
                            chest_new.get_chest(chest_new);
                        }
                    } else { //má otevřenou jinou truhlu - davam to do ni
                        var opened_chest = this.game_state.prefabs.player.opened_chest;
                        var chest_frame = this.game_state.prefabs[opened_chest].closed_frame;
                        
                        console.log("Put down: " + chest_frame + " item: " + item_frame);
                        
                        switch (chest_frame) {
                            case 7: //Drevo
                                switch (item_frame) {
                                    case 53: //Zel. kotlik
                                        this.game_state.prefabs[opened_chest].change_frame(77); //na drevu
                                        
                                        this.game_state.prefabs[opened_chest].add_item(32, 1); //prkno
                                    break;
                                    case 71: //Zel. kotlik s vodou
                                        this.game_state.prefabs[opened_chest].chest_loop_frame = 79;
                                        this.game_state.prefabs[opened_chest].change_frame(79); //na drevu
                                        
                                        this.game_state.prefabs[opened_chest].add_item(32, 1); //prkno
                                        this.game_state.prefabs[opened_chest].add_item(81, 1); //cista voda
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, 1);
                                    break;
                                }
                            break;
                            case 83: //Ohen
                                switch (item_frame) {
                                    case 53: //Zel. kotlik
                                        this.game_state.prefabs[opened_chest].chest_loop_frame = 56;
                                        this.game_state.prefabs[opened_chest].change_frame(56); //hori
                                    break;
                                    case 71: //Zel. kotlik s vodou
                                        this.game_state.prefabs[opened_chest].chest_loop_frame = 74;
                                        this.game_state.prefabs[opened_chest].change_frame(74); //hori
                                        
                                        this.game_state.prefabs[opened_chest].add_item(81, 1); //cista voda
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, 1);
                                    break;
                                }
                            break;
                            default:
                                this.game_state.prefabs.chestitems.add_item(item_frame, 1);
                            break;
                        }
                    }
                } else { // beru z bedny
                    var is_fluid = (this.game_state.core_data.items[item_frame].properties.fluid === 'true');                    
                    var takeit = true;
                    var opened_chest = this.game_state.prefabs.player.opened_chest;
                    var chest_frame = this.game_state.prefabs[opened_chest].closed_frame;
                    var sub_water = this.game_state.core_data.items[chest_frame].properties.sub_water;
                    
                    if (is_fluid) {
                        switch (item_frame) {
                            case 81: //voda
                                var index = player.test_item(6, 1); //Dzban
                                if (index > -1) {
                                    player.subtract_item(index, 1);
                                    item_frame = 69; //Dzban s vodou
                                    
                                    this.game_state.prefabs[opened_chest].change_frame(sub_water);
                                    if (chest_frame == 56) {
                                        this.game_state.prefabs[opened_chest].animations.play("ficauldron");
                                    }
                                } else {
                                    var index = player.test_item(53, 1); //Zel. kotlik
                                    if (index > -1) {
                                        player.subtract_item(index, 1);
                                        item_frame = 71; //Zel. kotlik s vodou
                                        
                                        this.game_state.prefabs[opened_chest].change_frame(sub_water);
                                        if (chest_frame == 56) {
                                            this.game_state.prefabs[opened_chest].animations.play("ficauldron");
                                        }
                                    } else {                                       
                                        takeit = false;                                        
                                    }                            
                                }
                            break;
                            case 93: //Hrib. polevka
                                var index = player.test_item(94, 1); //Miska
                                if (index > -1) {
                                    player.subtract_item(index, 1);
                                    item_frame = 95; //Miska s polevkou
                                    
                                    this.game_state.prefabs[opened_chest].change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            default:
                               takeit = false;
                            break;
                        }
                    }
                    
                    switch (chest_frame) {
                        case 77: // zel. kotlik na drevu
                            switch (item_frame) {
                                case 32: // prkno
                                    if (item_quantity < 1) { // kdyz seberu vsechny
                                        this.game_state.prefabs[opened_chest].change_frame(53); //zel. kotlik
                                    }
                                break;
                            }
                        break;
                        case 79: // zel. kotlik na drevu s vodou
                            switch (item_frame) {
                                case 32: // prkno
                                    if (item_quantity < 1) { // kdyz seberu vsechny
                                        this.game_state.prefabs[opened_chest].change_frame(71); //zel. kotlik v vodou
                                    }
                                break;
                            }
                        break;
                     }
                    
                    if (takeit) {
                        
                        // ------------------------------------- - item -----------------------------------------

                        item_quantity = this.subtract_item(item_index, 1);

                        // ------------------------------------- + item -----------------------------------------
                        
                        this.game_state.prefabs.items.add_item(item_frame, 1);
                        
                    } else {
                        console.log("To nejde vzit");
                        this.game_state.hud.alert.show_alert("To nejde vzít");
                    }
                }
            }
            break;
        case "equip":
            player.equip(item_index, item_frame);
            break;
        case "use":
            var opened_chest = this.game_state.prefabs.player.opened_chest;
            var use_sub = (this.game_state.core_data.items[item_frame].properties.use_sub === 'true');
    
            console.log(this.game_state.core_data.items[item_frame]);

            if (use_sub) {
                this.subtract_item(item_index, 1);
            }
            
            switch (item_frame) {
                case 6: //Džbán
                    if (opened_chest !== "") {
                        var chest_frame = this.game_state.prefabs[opened_chest].closed_frame;
                        
                        if (chest_frame == 80) {
                            this.add_item(69, 1);
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }

                    break;
                case 33: //Trnka
                    player.add_health(5);
                    player.subtract_stress(8);
                    break;
                case 36: //Maso
                    player.add_health(10);
                    player.subtract_stress(15);
                    break;
                case 37: //Pec. maso
                    player.add_health(20);
                    player.subtract_stress(30);
                    break;
                case 40: //Lišejník
                    player.add_health(3);
                    player.subtract_stress(7);
                    break;
                case 45: //Křesadlo
                    if (opened_chest !== "") {
                        var chest_frame = this.game_state.prefabs[opened_chest].closed_frame;
                        
                        switch (chest_frame) {
                            case 7: //Drevo
                                this.game_state.prefabs[opened_chest].chest_loop_frame = 83; //Ohen
                                this.game_state.prefabs[opened_chest].change_frame(83);
                                this.game_state.prefabs[opened_chest].add_item(92, 1); //Ohen
                            break;
                            case 77: //Zel. kotlik na drevu
                                this.game_state.prefabs[opened_chest].chest_loop_frame = 56; //hori
                                this.game_state.prefabs[opened_chest].change_frame(56);
                                var index = this.game_state.prefabs[opened_chest].test_item(32, 1); //Prkno
                                this.game_state.prefabs[opened_chest].subtract_item(index, 1);
                                this.game_state.prefabs[opened_chest].add_item(92, 1); //Ohen
                            break;
                            case 79: //Zel. kotlik s vodou na drevu
                                this.game_state.prefabs[opened_chest].chest_loop_frame = 74; //hori
                                this.game_state.prefabs[opened_chest].change_frame(74);
                                var index = this.game_state.prefabs[opened_chest].test_item(32, 1); //Prkno
                                this.game_state.prefabs[opened_chest].subtract_item(index, 1);
                                this.game_state.prefabs[opened_chest].add_item(92, 1); //Ohen
                            break;
                            default:
                                
                            break;
                        }
                    }
                    break;
                case 53: //Žel. kotlík
                    if (opened_chest !== "") {
                        var chest_frame = this.game_state.prefabs[opened_chest].closed_frame;
                        
                        if (chest_frame == 80) {
                            this.add_item(71, 1);
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }

                    break;
                case 95: //Hrib. polevka
                    player.add_health(30);
                    player.subtract_stress(42);
                    this.add_item(94, 1); // miska
                    break;
            }
            break;
        case "sell":
            break;
        case "buy":
            break;
    }
};

Mst.ShowItems.prototype.collide_tile = function () {
    "use strict";
    
    console.log("chest collision");
    var dist = this.game_state.game.physics.arcade.distanceBetween(chest, tile);
    console.log("Collision dist: " + dist);
};

Mst.ShowItems.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    var item_frame, item_quantity;
    
    console.log("Subtract: " + this.prefab_name + " " + this.name + " " + this.stat);
    
    console.log(this.stats);
    item_frame = this.stats[item_index].frame;
    item_quantity = parseInt(this.stats[item_index].quantity);
        
    item_quantity -= parseInt(quantity);
    
    this.stats[item_index].quantity = item_quantity;
    this.texts[item_index].text = item_quantity;
    
    this.update_item(item_index, item_frame, item_quantity);
    
    return item_quantity;
};

Mst.ShowItems.prototype.subtract_all = function (item_index) {
    "use strict";
    var item_frame, item_quantity;
    
    console.log("Subtract all: " + this.prefab_name + " " + this.name + " " + this.stat);    
    console.log(this.stats);
    console.log(this.stats[item_index]);
    
    item_frame = this.stats[item_index].frame;
    item_quantity = parseInt(this.stats[item_index].quantity);
    
    this.update_item(item_index, item_frame, 0);
    
    return item_quantity;
};

Mst.ShowItems.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    var item_index, item_quantity, other_item;
    
    console.log("Add: " + this.prefab_name + " " + this.name + " " + this.stat);
    
    
    other_item = this.index_by_frame(item_frame);
    item_index = other_item.index;

    if (other_item.is_in) {
        item_quantity = parseInt(other_item.quantity);
        item_quantity += parseInt(quantity);
        this.texts[item_index].text = item_quantity;
        this.stats[item_index].quantity = item_quantity;
    } else {
        item_index = -1;
        item_quantity = parseInt(quantity);
    }
    
    if (this.prefab_name === "player") {
        var item = { f: item_frame, q: item_quantity };
        this.game_state.prefabs.player.update_quest("have", item);
    }

    item_index = this.update_item(item_index, item_frame, item_quantity);
    return item_index;
};

Mst.ShowItems.prototype.update_item = function (item_index, item_frame, item_quantity) {
    "use strict";
    var item_updated, is_in_items;
    console.log("Update item: " + this.prefab_name + " " + this.name + " " + this.stat);
    is_in_items = true;
    
    item_updated = item_frame + "-" + item_quantity;
    
    if (item_quantity > 0) {
        if (item_index > -1) {
            this.stat_splited[item_index] = item_updated;
        } else {
            is_in_items = false;
            this.stat_splited.push(item_updated);
            item_index = this.stat_splited.length - 1;
        }
    } else {
        is_in_items = false;
        this.stat_splited.splice(item_index, 1);
        item_index = -1;
    }
    
    //console.log(this.stat_splited);
    this.stat = this.stat_splited.join("_");
    console.log(this.stat_splited.length + " " + this.stat);
    this.game_state.prefabs[this.prefab_name].stats.items = this.stat;

    
    //console.log(this.prefab_name);
    //console.log(this.prefab_name != "player");
    
    if (this.prefab_name !== "player") {
        this.game_state.prefabs[this.prefab_name].updated = true;
        //console.log(this.game_state.prefabs[this.prefab_name].updated);
    }
    
    //console.log(this.game_state.prefabs[this.prefab_name]);
    
    if (is_in_items === false) {
        this.kill_stats();
        this.show_initial_stats();
    }
    
    return item_index;
};

Mst.ShowItems.prototype.kill_stats = function () {
    "use strict";
    this.gframes.forEach(function (gframe) {
        gframe.kill();
    });
    this.stats.forEach(function (stat) {
        //stat.text_alt.text = "";
        stat.kill();
    });
    this.stats = [];
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    this.visible = false;
    
    this.game_state.hud.alt.hide_alt();
    if (this.prefab_name === "player" && typeof (this.frame_bot) !== 'undefined') {
        this.frame_bot.visible = false;
        this.text_bot.text = "";
    }
};
    
Mst.ShowItems.prototype.index_by_frame = function (item_frame) {
    "use strict";
    var is_in_items, index, index_return, item_quantity;
    index = -1;
    is_in_items = false;
    item_quantity = 0;
    index_return = {};
    
    for (var i = 0; i < this.stat_splited.length; i++) {
        if (this.stat_splited[i].split("-")[0] == item_frame) {
            item_quantity = this.stat_splited[i].split("-")[1];
            index = i; 
            is_in_items = true;
        }
    }
    
    index_return.index = index;
    index_return.is_in = is_in_items;
    index_return.frame = parseInt(item_frame);
    index_return.quantity = parseInt(item_quantity);
    return index_return;
};

Mst.ShowItems.prototype.in_chest = function () {
    "use strict";
    var item_frame, item_quantity;
    var item = {};
    var output = [];
    
    for (var i = 0; i < this.stat_splited.length; i++) {
        item_frame = parseInt(this.stat_splited[i].split("-")[0]);
        item_quantity = parseInt(this.stat_splited[i].split("-")[1]);
        item = {
            f: item_frame,
            q: item_quantity
        };
        output.push(item);
    }
    
    return output;
};

Mst.ShowItems.prototype.in_chest_ord = function () {
    "use strict";
    var output;
    
    output = this.in_chest();
        
    output.sort(function(a, b){return a.f - b.f});
    console.log(output);
    
    return output;
};

Mst.ShowItems.prototype.test_item = function (frame, quantity) {
    "use strict";
    var enough_quantity, item;
    
    enough_quantity = -1;
    
    item = this.index_by_frame(frame);
    console.log(item);

    if (item.quantity >= quantity) {
        enough_quantity = item.index;
    }
        
    return enough_quantity;
};

Mst.ShowItems.prototype.test_player_item = function (frame, quantity) {
    "use strict";
    var enough_quantity, item;
    
    enough_quantity = -1;
    
    if (this.prefab_name == "player") {
        item = this.index_by_frame(frame);
        
        if (item.quantity > quantity) {
            enough_quantity = item.index;
        }
    }
    
    return enough_quantity;
};

Mst.ShowItems.prototype.test_player_gold = function (cost) {
    "use strict";
    
    return this.test_player_item(1, cost);
/*    var enough_gold, item;
    
    enough_gold = -1;
    
    if (this.prefab_name == "player") {
        item = this.index_by_frame(1);
        
        if (item.quantity > cost) {
            enough_gold = item.index;
        }
    }
    
    return enough_gold;*/
};

Mst.ShowItems.prototype.change_put_type = function () {
    "use strict";
    var new_put_type;
    console.log(this.text_bot.text);
    
    switch(this.put_type) {
        case "put":
            new_put_type = "equip";
            break;
        case "equip":
            new_put_type = "use";
            break;
        case "use":
            new_put_type = "put";
            break;
        case "sell":
            new_put_type = "buy";
            this.game_state.prefabs.businessitems.business_buy();
            break;
        case "buy":
            new_put_type = "sell";
            this.game_state.prefabs.businessitems.business_sell();
            break;
        default:
            new_put_type = "put";
    }
    this.set_put_type(new_put_type);
    
    console.log(this.text_bot.text);
};

Mst.ShowItems.prototype.set_put_type = function (new_put_type) {
    "use strict";
    this.put_type = new_put_type;
    this.text_bot.text = this.translate_put_type();
};

Mst.ShowItems.prototype.translate_put_type = function () {
    "use strict";
    var text;
    
    switch(this.put_type) {
        case "put":
            text = "Položit";
            break;
        case "equip":
            text = "Uchopit";
            break;
        case "use":
            text = "Použít";
            break;
        case "sell":
            text = "Prodat";
            break;
        case "buy":
            text = "Koupit";
            break;
        default:
            text = "nic";
    }
    
    return text;
};