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
    
    if (this.prefab_name === "player") {
        this.put_type = "equip";
    } else {
        this.put_type = "put";
    }
    
    
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
    
    console.log(this.prefab_name);
    if (this.prefab_name !== "player") {
        this.prefab_name = "";
        if (this.game_state.prefabs.player.cPlayer.chest.opened) {
            this.prefab_name = this.game_state.prefabs.player.cPlayer.chest.opened.name;        
            this.prefab_frame = this.game_state.prefabs[this.prefab_name].mChest.closed_frame;
        }
    }
    
    if (this.prefab_name !== "") {
        this.stat = this.game_state.prefabs[this.prefab_name].stats.items;
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
    if (this.prefab_name.substr(0, 5) === "chest" || this.prefab_name === "bag" || this.prefab_name.substr(0, 5) === "bedna") {
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
            this.frame_bot = this.game_state.mGame.groups[this.stats_group].create(stat_position.x - 4, stat_position.y + 20, 'frame_bot');
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
        case 64: // vyhen
            switch (frame_int) {
                case 103: // tav. zelezo
                    gframe_str = "frame_item_fial";
                break;
                case 183: // zhav. med
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        case 65: // vyhen hori
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
                case 147: // Destil. voda
                    gframe_str = "frame_item_fial";
                break;
                case 149: // Tinktura
                    gframe_str = "frame_item_fial";
                break;                
                case 152: // Inkoust
                    gframe_str = "frame_item_fial";
                break;                   
                case 173: // Cistici l.
                    gframe_str = "frame_item_fial";
                break;
                case 188: // Antilevitacni l.
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
                case 147: // Destil. voda
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
        case 104: // kam. nadoba s tav.
            switch (frame_int) {
                case 105: // zhav. zelezo
                    gframe_str = "frame_item_fial";
                break;
            }
        break;
        default:
            gframe_str = "frame_item";
        break;
    }
    console.log(frame_int + ":" + this.prefab_frame + "> " + gframe_str);
    
    gframe = this.game_state.mGame.groups[this.stats_group].getFirstDead();
    if (gframe) {
        // if there is a dead gframe, just reset it
        gframe.reset(stat_position.x - 4, stat_position.y - 5);
        gframe.loadTexture(gframe_str);
        
    } else {
        // if there are no dead gframes, create a new one
        // gframe sprite uses the same texture as the ShowItems prefab
        gframe = this.game_state.mGame.groups[this.stats_group].create(stat_position.x - 4, stat_position.y - 5, gframe_str);
    }
    gframe.fixedToCamera = true;
    gframe.alpha = 0.5;
    
    // get the first dead sprite in the stats group
    stat = this.game_state.mGame.groups[this.stats_group].getFirstDead();
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
        
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowItems prefab
        stat = this.game_state.mGame.groups[this.stats_group].create(stat_position.x, stat_position.y, 'items_spritesheet', frame_int); //!!!!!!!!!!
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
    stat.events.onInputOver.add(this.show_alt, this);
    stat.events.onInputOut.add(this.hide_alt, this);
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
    this.game_state.mGame.groups[this.stats_group].add(this.text);
    
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

Mst.ShowItems.prototype.show_alt = function (item) {
    "use strict";
    this.game_state.mGame.hud.alt.show(item);
};

Mst.ShowItems.prototype.hide_alt = function () {
    "use strict";
    this.game_state.mGame.hud.alt.hide();
};

Mst.ShowItems.prototype.put_down_item = function (one_item) {
    "use strict";
    var item_sub, item_index, item_frame, item_quantity, item, quant_put, other_item_prefab, is_not_new_chest, chest_new, collide_test;
    
    console.log("put down " + this.put_type);
    console.log(one_item);
    const player = this.game_state.prefabs.player;
    const opened_chest = player.cPlayer.chest.opened;
    
    item_index = one_item.stat_index;
    item_frame = this.stats[item_index].frame;
    item_quantity = this.stats[item_index].quantity;
    console.log("II: " + item_index + " IF: " + item_frame + " IQ: " + item_quantity);
    
    switch (this.put_type) {
        case "put":
            if (!player.cPlayer.business.opened) {
                if (this.prefab_name === "player") {
                    //console.log(player.keys.shift.isDown);
                    quant_put = 1;
                    if (player.keys.shift.isDown && opened_chest) {
                        console.log("SHIFT");
                        quant_put = Math.ceil(parseInt(this.stats[item_index].quantity)/2);
                        
                    }
                    
                    // ------------------------------------- - item -----------------------------------------

                    item_sub = this.subtract_item(item_index, quant_put);
                    item_quantity = item_sub.q;

                    // ------------------------------------- + item -----------------------------------------
                    
                    console.log("Opened chest: " + opened_chest.name);
                    if (!opened_chest) { // zadna bedna otevrena - delam novou
                        // - create new chest
                        chest_new = this.game_state.prefabs.chest_creator.create_new_chest(item_frame);
                        //this.game_state.game.physics.arcade.collide(chest_new, this.game_state.layers.collision, console.log("kolidy kolidy"), null, this);
                        
                        const b = !chest_new.exist;
                        
//                        var a = this.game_state.layers.collision.getTiles(chest_new.x, chest_new.y, 3, 3);
//                        console.log(a);
//                        a.forEach(function(tile) {
//                            console.log(tile.canCollide);
//                            if (tile.canCollide !== null) {
//                                b = true;
//                            }
//                        });
                        
                        console.log(b);
                        //var testik = chest_new.collide_test();
                        if (!b) {
                            chest_new.mChest.set_owner(player.mPlayer.usr_id);

                            switch (chest_new.mChest.closed_frame) {
                                case 3: //věci - obecně
                                    chest_new.cChest.items.add(item_frame, quant_put);
                                break;
                                case 7: //dřevo
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.cChest.items.add(item_frame, item_quantity);
                                    }
                                break;
                                case 21: //kámen
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.cChest.items.add(item_frame, item_quantity);
                                    }
                                break;
                                case 30: //kmen
                                    if (item_quantity > 0) {
                                        item_quantity = this.subtract_all(item_index);
                                        chest_new.cChest.items.add(item_frame, item_quantity);
                                    }
                                break;
                                case 41: //batoh
                                    chest_new.stats.items = player.stats.bag;
                                    this.game_state.prefabs.chestitems.show_initial_stats();
                                    player.stats.bag = "";
                                    player.mPlayer.save.properties.bag = "";
                                break;
                                case 69: //dzban s vodou
                                    chest_new.cChest.items.add(81, 1); //cista voda
                                break;
                                case 71: //zel. kotlik s vodou
                                    chest_new.cChest.items.add(81, 1); //cista voda
                                break;
                                case 104: //kam. nadoba s tav.
                                    chest_new.cChest.items.add(105, 1); //zhav. zelezo
                                break;
                            }
                        } else {
                            console.log("Sem to nejde polozit");
                            this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                            if (chest_new.mChest.closed_frame == 3) {
                                this.add_item(item_frame, quant_put);
                            }
                            chest_new.cChest.get_chest(chest_new);
                        }
                    } else { //má otevřenou jinou truhlu - davam to do ni
                        const chest_frame = opened_chest.mChest.closed_frame;
                        
                        console.log("Put down: " + chest_frame + " item: " + item_frame);
                        
                        const uput = { f: item_frame, wr: chest_frame };
                        player.cPlayer.quests.update("put", uput);
                        
                        switch (chest_frame) {
                            case 7: //Drevo
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 53: //Zel. kotlik
                                        opened_chest.change_frame(77); //na drevu
                                        opened_chest.cChest.items.add(32, 1); //prkno
                                        
                                        if (quant_put > 1) {
                                            quant_put -= 1;
                                            this.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    case 71: //Zel. kotlik s vodou
                                        opened_chest.cChest.loop.frame = 79;
                                        opened_chest.change_frame(79); //na drevu
                                        
                                        opened_chest.cChest.items.add(32, 1); //prkno
                                        opened_chest.cChest.items.add(81, 1); //cista voda
                                        
                                        if (quant_put > 1) {
                                            quant_put -= 1;
                                            this.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 41: //batoh
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 112: { //kopřiva
                                        console.log(player.cPlayer.ren.opened);
                                        const index = player.cPlayer.items.test(192,1); //dóza
                                        if (player.cPlayer.ren.opened === 'cmelotrysk_ren' && index > -1) {
                                            player.cPlayer.items.subtract(index, 1);
                                            player.cPlayer.items.add(197, 1); // Med čmelotryska l.
                                            player.mPlayer.add_exp("standard", 50);
                                            player.mPlayer.add_exp("magcrecare", 45);
                                            console.log("Med");
                                            this.game_state.cGame.hud.alerts.show("Dar: med!");
                                        } else {
                                            this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    }
                                    case 195: //Trnkový kompot l.
                                        console.log(player.player.cPlayer.ren.opened);
                                        if (player.cPlayer.ren.opened === 'kerik_ren') {
                                            player.cPlayer.items.add(200, 1); // svetlokvet
                                            player.cPlayer.items.add(192, 1); //dóza
                                            player.mPlayer.add_exp("standard", 50);
                                            player.mPlayer.add_exp("magcrecare", 45);
                                            console.log("světlokvět");
                                            this.game_state.cGame.hud.alerts.show("Dar: světlokvět!");
                                        } else {
                                            this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                        }
                                        
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 60: //kam. nadoba
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 105: //zhav. zelezo
                                        opened_chest.cChest.loop.frame = 104;
                                        opened_chest.change_frame(104); //s tav.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, 1);
                                        
                                        if (quant_put > 1) {
                                            quant_put -= 1;
                                            this.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 83: //Ohen
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 53: //Zel. kotlik
                                        opened_chest.cChest.loop.frame = 56;
                                        opened_chest.change_frame(56); //hori
                                        
                                        if (quant_put > 1) {
                                            quant_put -= 1;
                                            this.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    case 71: //Zel. kotlik s vodou
                                        opened_chest.cChest.loop.frame = 74;
                                        opened_chest.change_frame(74); //hori
                                        
                                        opened_chest.cChest.items.add(81, 1); //cista voda
                                        
                                        if (quant_put > 1) {
                                            quant_put -= 1;
                                            this.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 138: //kvetinac prazd.
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 137: //zemina
                                        opened_chest.change_frame(139); //kvetinac zem.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 139: //kvetinac zem.
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 143: //safran cibulka
                                        opened_chest.change_frame(140); //kvetinac saz.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;                                        
                                    case 163: //medunka saz.
                                        opened_chest.change_frame(140); //kvetinac saz.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;                                   
                                    case 178: //kotvičník saz.
                                        opened_chest.change_frame(140); //kvetinac saz.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 158: //kvetinac zem. zal
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 143: //safran cibulka
                                        opened_chest.change_frame(159); //kvetinac saz. zal.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    case 163: //medunka saz.
                                        opened_chest.change_frame(159); //kvetinac saz. zal.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;                                        
                                    case 178: //kotvičník saz.
                                        opened_chest.change_frame(159); //kvetinac saz.zal.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 213: //bariera II
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;                                     
                                    case 43: //vetev
                                        opened_chest.change_frame(214); //hranice
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 227: //pole zem.
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 235: //salat sem.
                                        opened_chest.change_frame(228); //pole sem.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    case 236: //salat saz.
                                        opened_chest.change_frame(231); //pole saz.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            case 229: //pole zem. zal.
                                switch (item_frame) {
                                    case 41: //batoh
                                        this.add_item(item_frame, quant_put);
                                        
                                        console.log("Sem to nejde polozit");
                                        this.game_state.cGame.hud.alerts.show("Sem to nejde položit");
                                    break;
                                    case 235: //salat sem.
                                        opened_chest.change_frame(230); //pole sem. zal.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    case 236: //salat saz.
                                        opened_chest.change_frame(233); //pole saz. zal.
                                        
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }
                            break;
                            default:
                                console.log(item_frame);
                                switch (item_frame) {
                                    case 41: //batoh
                                        if (player.stats.bag !== "") {
                                            this.add_item(item_frame, quant_put);

                                            console.log("Batoh není prázdný");
                                            this.game_state.cGame.hud.alerts.show("Batoh není prázdný");
                                        } else {
                                            this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                        }
                                    break;
                                    case 112: //kopřiva
                                        console.log(player.cPlayer.ren.opened);
                                        const index = player.cPlayer.items.test(192,1); //dóza
                                        if (player.cPlayer.ren.opened === 'cmelotrysk_ren' && index > -1) {
                                            player.cPlayer.items.subtract(index, 1);
                                            player.cPlayer.items.add(197, 1); // Med čmelotryska l.
                                            player.mPlayer.add_exp("standard", 50);
                                            player.mPlayer.add_exp("magcrecare", 45);
                                            console.log("Med");
                                            this.game_state.cGame.hud.alerts.show("Dar: med!");
                                        } else {
                                            this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                        }
                                        
                                    break;
                                    case 135: //stinka
                                        console.log(player.cPlayer.ren.opened);
                                        if (player.cPlayer.ren.opened === 'kurolez_ren') {
                                            player.cPlayer.items.add(136, 1);
                                            player.mPlayer.add_exp("standard", 50);
                                            player.mPlayer.add_exp("magcrecare", 45);
                                            console.log("Dubenka");
                                            this.game_state.cGame.hud.alerts.show("Dar: duběnky!");
                                        } else {
                                            this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                        }
                                        
                                    break;
                                    
                                    default:
                                        this.game_state.prefabs.chestitems.add_item(item_frame, quant_put);
                                    break;
                                }                                
                            break;
                        }
                    }
                } else { // beru z bedny
                    const is_fluid = (this.game_state.gdata.core.items[item_frame].properties.fluid === 'true');
                    let takeit = true;
                    let tquant = 1;
                    const chest_frame = opened_chest.mChest.closed_frame;
                    const sub_water = this.game_state.gdata.core.items[chest_frame].properties.sub_water;
                    
                    if (is_fluid) {
                        switch (item_frame) {
                            case 81: { //voda
                                const index = player.cPlayer.items.test(6, 1); //Dzban
                                if (index > -1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 69; //Dzban s vodou
                                    
                                    opened_chest.change_frame(sub_water);
                                    if (chest_frame == 56) {
                                        opened_chest.animations.play("ficauldron");
                                    }
                                } else {
                                    const index = player.cPlayer.items.test(53, 1); //Zel. kotlik
                                    if (index > -1) {
                                        player.cPlayer.items.subtract(index, 1);
                                        item_frame = 71; //Zel. kotlik s vodou
                                        
                                        opened_chest.change_frame(sub_water);
                                        if (chest_frame == 56) {
                                            opened_chest.animations.play("ficauldron");
                                        }
                                    } else {                                       
                                        takeit = false;                                        
                                    }                            
                                }
                            break;
                            }
                            case 93: { //Hrib. polevka
                                const index = player.cPlayer.items.test(94, 1); //Miska
                                if (index > -1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 95; //Miska s polevkou
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                       
                                    const index = player.cPlayer.items.test(220, 1); //drev. miska
                                    if (index > -1) {
                                        player.cPlayer.items.subtract(index, 1);
                                        item_frame = 221; //drev. miska s polevkou

                                        opened_chest.change_frame(sub_water);
                                    } else {                       
                                        takeit = false;       
                                    }   
                                    }
                            break;
                            }
                            case 103: { //tav. zelezo
                                const index = player.cPlayer.items.test(60, 1); //kam. nadoba
                                console.log(index + " " + item_quantity);
                                if (index > -1 && item_quantity > 3) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 104; //kam. nadoba s tav
                                    tquant = 4;
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 105: { //zhav. zelezo
                                const equip = parseInt(player.stats.equip);
                                if (equip === 106) { //kleste
                                    opened_ches.change_frame(sub_water);
                                } else {
                                    takeit = false;  
                                }
                            break;
                            }
                            case 109: { //zhav.zel.tyc
                                const equip = parseInt(player.stats.equip);
                                if (equip === 106) { //kleste
                                    opened_chest.change_frame(sub_water);
                                } else {
                                    takeit = false;  
                                }
                            break;
                            }
                            case 147: { //Destil. voda
                                const index = player.cPlayer.items.test(154, 1); //Lahvicka
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 146; //Destil. voda l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 149: { //Tinktura
                                const index = player.cPlayer.items.test(154, 1); //Lahvicka
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 148; //Tinktura l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 152: { //Inkoust
                                const index = player.cPlayer.items.test(154, 1); //Lahvicka
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 151; //Inkoust l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 173: { //Cistici lek.
                                const index = player.cPlayer.items.test(154, 1); //Lahvicka
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 174; //Cistici lek. l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 183: //zhav. med
                                const equip = parseInt(player.stats.equip);
                                if (equip === 106) { //kleste
                                    opened_chest.change_frame(sub_water);
                                } else {
                                    takeit = false;  
                                }
                            break;
                            case 188: { //Antilevitacni lek.
                                const index = player.cPlayer.items.test(154, 1); //Lahvicka
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 189; //Antilevitacni lek. l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 194: { //Trnkový kompot
                                const index = player.cPlayer.items.test(192, 1); //Doza
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 195; //Trnkový kompot l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {                                    
                                    takeit = false;       
                                }
                            break;
                            }
                            case 196: { //Med čmelotryska
                                const index = player.cPlayer.items.test(192, 1); //Doza
                                const in_chest = opened_chest.cChest.items.in_chest_ord();
                                if (index > -1 && in_chest.length == 1) {
                                    player.cPlayer.items.subtract(index, 1);
                                    item_frame = 197; //Med čmelotryska l.
                                    
                                    opened_chest.change_frame(sub_water);
                                } else {
                                    takeit = false;       
                                }
                            break;
                            }
                            default:
                               takeit = false;
                            break;
                        }
                    }
                    
                    switch (chest_frame) {
                        case 77: // zel. kotlik na drevu
                            switch (item_frame) {
                                case 32: // prkno
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(53); //zel. kotlik
                                    }
                                break;
                            }
                        break;
                        case 79: // zel. kotlik na drevu s vodou
                            switch (item_frame) {
                                case 32: // prkno
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(71); //zel. kotlik v vodou
                                    }
                                break;
                            }
                        break;                            
                        case 139: // kvetinac zem.
                            switch (item_frame) {
                                case 137: // zemina
                                    if (opened_chest.s1type === '') {
                                        if (item_quantity < 2) { // kdyz seberu vsechny
                                            opened_chest.change_frame(138); //kvetinac prazd.
                                        }
                                    } else {
                                        takeit = false;
                                    }
                                break;
                                case 142: // safran
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                                case 164: // medunka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                                case 179: // kotvičník
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                            }
                        break;
                        case 140: // kvetinac saz.
                            switch (item_frame) {
                                case 137: // zemina
                                    takeit = false;
                                break;
                                case 143: // safran cibulka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(139); //kvetinac zem.
                                        console.log(takeit);
                                    }
                                break;
                                case 163: // medunka saz.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(139); //kvetinac zem.
                                        console.log(takeit);
                                    }
                                break;
                                case 178: // kotvičník saz.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(139); //kvetinac zem.
                                        console.log(takeit);
                                    }
                                break;
                            }
                        break;
                        case 141: // kvetinac rost.
                            switch (item_frame) {
                                case 137: // zemina
                                    takeit = false;
                                break;
                                case 143: // safran cibulka
                                    takeit = false;
                                break;
                                case 163: // meduňka cibulka
                                    takeit = false;
                                break;
                                case 178: // kotvičník cibulka
                                    takeit = false;
                                break;
                            }
                        break;                          
                        case 158: // kvetinac zem. zal.
                            switch (item_frame) {
                                case 137: // zemina
                                    if (opened_chest.s1type === '') {
                                        if (item_quantity < 2) { // kdyz seberu vsechny
                                            opened_chest.change_frame(138); //kvetinac prazd.
                                        }
                                    } else {
                                        takeit = false;
                                    }
                                break;
                                case 142: // safran
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                                case 164: // meduňka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                                case 179: // kotvičník
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') opened_chest.plant.kill();
                                    }
                                break;
                            }
                        break;
                        case 159: // kvetinac saz. zal.
                            switch (item_frame) {
                                case 137: // zemina
                                    takeit = false;
                                break;
                                case 143: // safran cibulka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(158); //kvetinac zem. zal.
                                    }
                                break;
                                case 163: // meduňka cibulka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(158); //kvetinac zem. zal.
                                    }
                                break;
                                case 178: // kotvičník cibulka
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(158); //kvetinac zem. zal.
                                    }
                                break;
                            }
                        break;
                        case 160: // kvetinac rost. zal.
                            switch (item_frame) {
                                case 137: // zemina
                                    takeit = false;
                                break;
                                case 143: // safran cibulka
                                    takeit = false;
                                break;
                                case 163: // meduňka cibulka
                                    takeit = false;
                                break;
                                case 178: // kotvičník cibulka
                                    takeit = false;
                                break;
                            }
                        break;
                        case 214: // hranice
                            switch (item_frame) {
                                case 43: // vetev
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(213); //bariera II
                                    }
                                break;
                            }
                        break;                            
                        case 227: // pole zem.
                            switch (item_frame) {
                                case 237: // salat
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined')  {
                                            opened_chest.plant.kill();
                                            const rnd_test = Math.ceil(Math.random() * 3);
                                            player.cPlayer.items.add(235, rnd_test); //sem. salat
                                        }                                        
                                    }
                                break;
                            }
                        break;
                        case 228: // pole sem.
                            switch (item_frame) {
                                case 235: // salat sem.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(227); //pole zem.
                                        console.log(takeit);
                                    }
                                break;
                            }
                        break;
                        case 229: // pole zem. zal.
                            switch (item_frame) {
                                case 237: // salat
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.s1type = "";
                                        opened_chest.s2type = "";
                                        opened_chest.save.properties.s1type = "";
                                        opened_chest.save.properties.s2type = "";
                                        if (typeof(opened_chest.plant) !== 'undefined') {
                                            opened_chest.plant.kill();
                                            const rnd_test = Math.ceil(Math.random() * 3);
                                            player.cPlayer.items.add(235, rnd_test); //sem. salat
                                        }                                 
                                    }
                                break;
                            }
                        break;
                        case 230: // pole sem. zal.
                            switch (item_frame) {
                                case 235: // salat sem.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(229); //pole zem. zal.
                                        console.log(takeit);
                                    }
                                break;
                            }
                        break;
                        case 231: // pole saz.
                            switch (item_frame) {
                                case 236: // salat saz.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(227); //pole zem.
                                        console.log(takeit);
                                    }
                                break;
                            }
                        break;
                        case 232: // pole rost.
                            switch (item_frame) {
                                case 236: // salat saz.
                                    takeit = false;
                                break;
                            }
                        break;
                        case 233: // pole saz. zal.
                            switch (item_frame) {
                                case 236: // salat saz.
                                    if (item_quantity < 2) { // kdyz seberu vsechny
                                        opened_chest.change_frame(229); //pole zem. zal.
                                        console.log(takeit);
                                    }
                                break;
                            }
                        break;
                        case 234: // pole rost. zal.
                            switch (item_frame) {
                                case 236: // salat saz.
                                    takeit = false;
                                break;
                            }
                        break;
                     }
                    
                    if (takeit) {
                        quant_put = 1;
                        if (player.keys.shift.isDown && tquant < 2) {
                            console.log("SHIFT");
                            quant_put = Math.ceil(parseInt(this.stats[item_index].quantity)/2);
                            tquant = quant_put;
                        }
                        
                        // ------------------------------------- - item -----------------------------------------
                        
                        item_sub = this.subtract_item(item_index, tquant);
                        item_quantity = item_sub.q;

                        // ------------------------------------- + item -----------------------------------------
                        
                        this.game_state.prefabs.items.add_item(item_frame, quant_put);
                        
                    } else {
                        console.log("To nejde vzit");
                        this.game_state.cGame.hud.alerts.show("To nejde vzít");
                    }
                }
            }
            break;
        case "equip":
            player.equip(item_index, item_frame);
            break;
        case "use":
            const use_sub = (this.game_state.gdata.core.items[item_frame].properties.use_sub === 'true');
    
            console.log(this.game_state.gdata.core.items[item_frame]);

            if (use_sub) {
                this.subtract_item(item_index, 1);
            }
            
            if (opened_chest) {
                const uuse = { t: item_frame, on: opened_chest.mChest.closed_frame };
                player.cPlayer.quests.update("use", uuse);
            }
            
            switch (item_frame) {
                case 6: //Džbán
                    if (opened_chest) {
                        var chest_frame = opened_chest.mChest.closed_frame;
                        
                        if (chest_frame == 80) {
                            this.add_item(69, 1);
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }

                    break;
                case 21: //Kamen
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        const item = chest.cChest.items.index(96); //Pazourek
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, item.quantity);
                            chest.cChest.items.add(186, item.quantity); //Pazourkove ostri
                            
                            player.cPlayer.quests.update("make", 186);
                            player.cPlayer.work_rout("survival", "exploration", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                    }
                    break;
                case 33: //Trnka
                    player.mPlayer.add_health(5);
                    player.mPlayer.subtract_stress(8);
                    break;
                case 36: //Maso
                    player.mPlayer.add_health(10);
                    player.mPlayer.subtract_stress(15);
                    break;
                case 37: //Pec. maso
                    player.mPlayer.add_health(20);
                    player.mPlayer.subtract_stress(30);
                    break;
                case 40: //Lišejník
                    player.mPlayer.add_health(3);
                    player.mPlayer.subtract_stress(7);
                    break;
                case 41: //Batoh
                    if (!opened_chest) {
                        var position = { x: player.x, y: player.y };
                        var properties = {
                            group: "shadows",
                            pool: "shadows",
                            stype: "shadow",
                            items: player.stats.bag,
                            closed_frame: 41,
                            opened_frame: 41,
                            texture: "blank_image"
                        };
                            
                        player.shadow = new Mst.Chest(this.game_state, "bag", position, properties);
                        player.cPlayer.chest.open(player.shadow);
                    }
                    
                    break;
                case 45: //Křesadlo
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        switch (chest_frame) {
                            case 7: //Drevo
                                chest.cChest.loop.frame = 83; //Ohen
                                chest.change_frame(83);
                                chest.cChest.items.add(92, 2); //Ohen
                            break;
                            case 64: //Výheň
                                item = chest.cChest.items.index(49); //Uhli
                                if (item.index > -1) {
                                    chest.cChest.items.subtract(item.index, item.quantity);
                                    chest.cChest.items.add(92, item.quantity*4); //Ohen
                                    
                                    chest.cChest.loop.frame = 65; //hori
                                    chest.change_frame(65);
                                } else {
                                    this.game_state.cGame.hud.alerts.show("Chce to uhlí!");
                                }
                            break;
                            case 77: //Zel. kotlik na drevu
                                chest.cChest.loop.frame = 56; //hori
                                chest.change_frame(56);
                                item = chest.cChest.items.test(32); //Prkno
                                chest.cChest.items.subtract(item.index, item.quantity);
                                chest.cChest.items.add(92, item.quantity*2); //Ohen
                            break;
                            case 79: //Zel. kotlik s vodou na drevu
                                chest.cChest.loop.frame = 74; //hori
                                chest.change_frame(74);
                                item = chest.cChest.items.index(32); //Prkno
                                chest.cChest.items.subtract(item.index, item.quantity);
                                chest.cChest.items.add(92, item.quantity*2); //Ohen
                            break;
                            case 214: //hranice
                                item = chest.cChest.items.index(43); //vetev
                                if (item.index > -1) {
                                    chest.cChest.items.subtract(item.index, item.quantity);
                                    chest.cChest.items.add(92, item.quantity + 1); //Ohen
                                    
                                    chest.cChest.loop.frame = 83; //hori
                                    chest.change_frame(83);
                                }
                            break;
                            default:
                                
                            break;
                        }
                    }
                    break;
                case 46: //Hmoždíř
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        const item = chest.cChest.items.index(136); //Dubenky
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, item.quantity);
                            chest.cChest.items.add(144, item.quantity); //Dubenky drc.
                        }
                    }
                    break;
                case 53: //Žel. kotlík
                    if (opened_chest) {
                        const chest_frame = opened_chest.closed_frame;
                        
                        if (chest_frame == 80) {
                            this.add_item(71, 1);
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }

                    break;
                case 62: //Konev
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;
                        
                        if (chest_frame == 80) {
                            this.add_item(63, 1); //konev pln.
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }

                    break;
                case 95: //Hrib. polevka
                    player.mPlayer.add_health(30);
                    player.mPlayer.subtract_stress(42);
                    this.add_item(94, 1); // miska
                    break;
                case 117: //Nůž
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        let recipe = [{f: 39, q: 1}, {f: 185, q: 1}]; //Kůže, reminek
                        let in_chest = chest.cChest.items.in_chest_ord();
                        if (chest.cChest.items.chest_compare(in_chest, recipe)) {
                            chest.cChest.items.take_all();
                            chest.cChest.items.add(201, 1); //Prak
                            player.cPlayer.quests.update("make", 201);
                        }
                        
                        item = chest.cChest.items.index(39); //Kůže
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(185, 10); //Řemínek
                            
                            player.cPlayer.quests.update("make", 185);
                            player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(142); //Safran
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(155, 1); //Šafrán. čnělka
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            var rnd_test = Math.ceil(Math.random() * 4);
                            
                            chest.cChest.items.add(161, rnd_test); //Šafrán. seminko
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(164); //Medunka
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(165, 1); //Medunka list
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            const rnd_test = Math.ceil(Math.random() * 4);
                            
                            chest.cChest.items.add(162, rnd_test); //Medunka seminko
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(179); //Kotvičník
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            let rnd_test = Math.ceil(Math.random() * 5);
                            const test_q = player.cPlayer.quests.quest[36].is_ass();
                            console.log("Test quest 36 knife: " + test_q + "RT " + rnd_test);
                            
                            if (test_q && rnd_test < 2) {
                                rnd_test = 2;
                            }
                            
                            chest.cChest.items.add(177, rnd_test); //Kotvičník plod
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(169); //Šváb
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(170, 2); //Oko svaba
                            chest.cChest.items.add(172, 1); //Bioodpad 2
                            
                            player.cPlayer.work_rout("alchemy", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        recipe = [{f: 21, q: 1}, {f: 43, q: 3}, {f: 185, q: 1}]; //kamen, 3 klacky, reminek
                        in_chest = chest.cChest.items.in_chest_ord();
                        if (chest.cChest.items.chest_compare(in_chest, recipe)) {
                            chest.cChest.items.take_all();
                            chest.cChest.items.add(217, 1); //Ohnova souprava
                            player.cPlayer.quests.update("make", 217);
                        }
                        
                    }
                    break;
                case 146: //Destil. voda l.
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;
                        
                        if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                            opened_chest.change_frame(71); //Zel. kotlik s vodou
                            opened_chest.cChest.items.add(147, 1); //Destil. voda
                            this.add_item(154, 1); //Lahvicka
                        } else {
                            if (chest_frame == 77 || chest_frame == 79) { //Žel. kotlík na drevu
                                opened_chest.change_frame(79); //Zel. kotlik s vodou na drevu
                                opened_chest.cChest.items.add(147, 1); //Destil. voda
                                this.add_item(154, 1); //Lahvicka
                            } else { 
                                this.add_item(item_frame, 1);
                            }
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }
                    break;
                case 148: //Tintura l.
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;
                        
                        if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                            opened_chest.change_frame(71); //Zel. kotlik s vodou
                            opened_chest.cChest.items.add(149, 1); //Tinktura
                            this.add_item(154, 1); //Lahvicka
                        } else {
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }
                    break;
                case 154: //Lahvička
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;

                        this.add_item(item_frame, 1);
                    } else {
                        this.add_item(item_frame, 1);
                    }
                    break;
                case 174: //Cistici lektvar l.
                    if (player.cPlayer.signpost.opened) {
                        const sign = player.cPlayer.signpost.opened;
                        
                        if (sign.exposed) {
                            sign.loadTexture('blank_image');
                            this.add_item(176, 1); //Serpentin
                            player.cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
                            this.game_state.cGame.hud.alerts.show("Nález: serpentin!");
                            
                            this.add_item(154, 1); //Lahvicka
                        } else {    
                            this.add_item(item_frame, 1);
                        }
                    } else {
                        if (player.cPlayer.overlap.opened) {
                            const web = player.cPlayer.overlap.opened;
                            
                            this.add_item(181, 1); //Terra sigillata
                            player.cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
                            this.game_state.cGame.hud.alerts.show("Nález: terra sigillata!");
                            
                            this.add_item(154, 1); //Lahvicka
                            
                        } else {    
                            this.add_item(item_frame, 1);
                        }
                    }
                    break;
                case 185: //reminek
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        item = chest.cChest.items.index(43); //Vetev
                        if (item.index > -1) {
                            if (item.quantity > 3) {
                                chest.cChest.items.subtract(item.index, 4);
                                chest.cChest.items.add(114, 1); //Ram

                                player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                        }
                        
                        item = chest.cChest.items.index(116); //Hrot
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(117, 1); //Nuz
                            
                            player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }   
                        
                        item = chest.cChest.items.index(186); //Paz. hrot
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(187, 1); //Paz. nuz
                            
                            player.cPlayer.quests.update("make", 187);
                            player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                    } else {
                        this.add_item(item_frame, 1);
                    }
                    break;
                case 186: //Paz. hrot
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        item = chest.cChest.items.index(39); //Kůže
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(185, 5); //Řemínek
                            
                            player.cPlayer.quests.update("make", 185);
                            player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                    }
                    break;
                case 187: //Paz. nůž
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        let recipe = [{f: 39, q: 1}, {f: 185, q: 1}]; //Kůže, reminek
                        let in_chest = chest.cChest.items.in_chest_ord();
                        if (chest.cChest.items.chest_compare(in_chest, recipe)) {
                            chest.cChest.items.take_all();
                            chest.cChest.items.add(201, 1); //Prak
                            player.cPlayer.quests.update("make", 201);
                        }
                        
                        item = chest.cChest.items.index(39); //Kůže
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(185, 10); //Řemínek
                            
                            player.cPlayer.quests.update("make", 185);
                            player.cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(142); //Safran
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(155, 1); //Šafrán. čnělka
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            const rnd_test = Math.ceil(Math.random() * 4);
                            
                            chest.cChest.items.add(161, rnd_test); //Šafrán. seminko
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(164); //Medunka
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(165, 1); //Medunka list
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            const rnd_test = Math.ceil(Math.random() * 4);
                            
                            chest.cChest.items.add(162, rnd_test); //Medunka seminko
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(179); //Kotvičník
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(157, 1); //Bioodpad
                            
                            let rnd_test = Math.ceil(Math.random() * 5);
                            const test_q = player.cPlayer.quests.quest[36].is_ass();
                            console.log("Test quest 36 knife: " + test_q + "RT " + rnd_test);
                            
                            if (test_q && rnd_test < 2) {
                                rnd_test = 2;
                            }
                            
                            chest.cChest.items.add(177, rnd_test); //Kotvičník plod
                            
                            player.cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            player.cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        item = chest.cChest.items.index(169); //Šváb
                        if (item.index > -1) {
                            chest.cChest.items.subtract(item.index, 1);
                            chest.cChest.items.add(170, 2); //Oko svaba
                            chest.cChest.items.add(172, 1); //Bioodpad 2
                            
                            player.cPlayer.work_rout("alchemy", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        recipe = [{f: 21, q: 1}, {f: 43, q: 3}, {f: 185, q: 1}]; //kamen, 3 klacky, reminek
                        in_chest = chest.cChest.items.in_chest_ord();
                        if (chest.cChest.items.chest_compare(in_chest, recipe)) {
                            chest.cChest.items.take_all();
                            chest.cChest.items.add(217, 1); //Ohnova souprava
                            player.cPlayer.quests.update("make", 217);
                        }
                        
                    }
                    break;
                case 189: //Antilevitační lekt. l.
                    player.cPlayer.buffs.add(1, 60); // antilevitace 10 min
                    this.add_item(154, 1); //Lahvicka
                    break;
                case 192: //Doza
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;

                        this.add_item(item_frame, 1);
                    } else {
                        this.add_item(item_frame, 1);
                    }
                    break;
                case 193: //cukr
                    player.mPlayer.add_health(22);
                    player.mPlayer.subtract_stress(32);
                    break;
                case 195: //Trnkový kompot l.
                    player.mPlayer.add_health(40);
                    player.mPlayer.subtract_stress(58);
                    this.add_item(192, 1); //Doza
                    break;
                case 197: //Med čmelotryska l.
                    if (opened_chest) {
                        const chest_frame = opened_chest.mChest.closed_frame;
                        
                        if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                            opened_chest.change_frame(71); //Zel. kotlik s vodou
                            opened_chest.cChest.items.add(196, 1); //Med čmelotryska
                            this.add_item(192, 1); //Doza
                        } else {
                            if (chest_frame == 77 || chest_frame == 79) { //Žel. kotlík na drevu
                                opened_chest.change_frame(79); //Zel. kotlik s vodou na drevu
                                opened_chest.cChest.items.add(196, 1); //Med čmelotryska
                                this.add_item(192, 1); //Doza
                            } else { 
                                this.add_item(item_frame, 1);
                            }
                        }
                    } else {
                        player.mPlayer.add_health(18);
                        player.mPlayer.subtract_stress(25);
                    }
                    break;
                case 198: //denik
                    this.game_state.mGame.hud.book.show();
                    break;
                case 217: //Ohn. souprava
                    if (opened_chest) {
                        const chest = opened_chest;
                        const chest_frame = chest.mChest.closed_frame;
                        
                        switch (chest_frame) {
                            case 7: //Drevo
                                chest.cChest.loop.frame = 83; //Ohen
                                chest.change_frame(83);
                                chest.cChest.items.add(92, 2); //Ohen
                            break;
                            case 77: //Zel. kotlik na drevu
                                chest.cChest.loop.frame = 56; //hori
                                chest.change_frame(56);
                                item = chest.cChest.items.test(32); //Prkno
                                chest.cChest.items.subtract(item.index, item.quantity);
                                chest.cChest.items.add(92, item.quantity*2); //Ohen
                            break;
                            case 79: //Zel. kotlik s vodou na drevu
                                chest.cChest.loop.frame = 74; //hori
                                chest.change_frame(74);
                                item = chest.cChest.items.index(32); //Prkno
                                chest.cChest.items.subtract(item.index, item.quantity);
                                chest.cChest.items.add(92, item.quantity*2); //Ohen
                            break;
                            case 214: //hranice
                                item = chest.cChest.items.index(43); //vetev
                                if (item.index > -1) {
                                    chest.cChest.items.subtract(item.index, item.quantity);
                                    chest.cChest.items.add(92, item.quantity + 1); //Ohen
                                    
                                    chest.cChest.loop.frame = 83; //hori
                                    chest.change_frame(83);
                                }
                            break;
                            default:
                                
                            break;
                        }
                    }
                    break;
                case 225: //noviny
                    this.game_state.mGame.hud.newsppr.show();
                    break;
            }
            break;
        case "sell":
            break;
        case "buy":
            break;
        case "mer_admin":
            console.log("admin put down items");
            
            this.subtract_item(item_index, 1);
            this.game_state.prefabs.businessitems.add_item_i(item_frame, 1);
            
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
    var item_frame, item_quantity, item;
    
    console.log("Subtract: I: " + item_index + "/" + quantity + " " + this.prefab_name + " " + this.name + " " + this.stat);
    
    console.log(this.stats);
    item_frame = this.stats[item_index].frame;
    item_quantity = parseInt(this.stats[item_index].quantity);
        
    quantity = parseInt(quantity);
    item_quantity -= quantity;
    
    this.stats[item_index].quantity = item_quantity;
    this.texts[item_index].text = item_quantity;
    
    this.update_item(item_index, item_frame, item_quantity);
    
    if (this.name === 'chestitems') {
        this.game_state.prefabs[this.prefab_name].cChest.cases.change_taken(item_frame, -quantity);
    }
    
    item = {
        i: item_index,
        f: item_frame,
        q: item_quantity
    };
    
    return item;
};

Mst.ShowItems.prototype.subtract_all = function (item_index) {
    "use strict";
    var item_frame, item_quantity;
    
    console.log("Subtract all: " + this.prefab_name + " " + this.name + " " + this.stat);    
    console.log(this.stats);
    console.log(this.stats[item_index]);
    
    if (this.stats.length > 0) {
        item_frame = this.stats[item_index].frame;
        item_quantity = parseInt(this.stats[item_index].quantity);

        this.update_item(item_index, item_frame, 0);
    } else {
        item_quantity = -1;
    }
    
    return item_quantity;
};

Mst.ShowItems.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    var item_index, item_quantity, other_item;
    
    console.log("Add: " + this.prefab_name + " " + this.name + " " + this.stat);
    //console.log(this.stat);
    
    
    other_item = this.index_by_frame(item_frame);
    item_index = other_item.index;
    
    quantity = parseInt(quantity);

    if (other_item.is_in) {
        item_quantity = parseInt(other_item.quantity);
        item_quantity += quantity;
        this.texts[item_index].text = item_quantity;
        this.stats[item_index].quantity = item_quantity;
    } else {
        item_index = -1;
        item_quantity = quantity;
    }
    
    if (this.prefab_name === "player") {
        var item = { f: item_frame, q: item_quantity };
        console.log(item);
        this.game_state.prefabs.player.cPlayer.quests.update("have", item);
    }
    
    //console.log(this.name);
    if (this.name === 'chestitems') {
        //console.log(this.prefab_name);
        this.game_state.prefabs[this.prefab_name].cChest.cases.change_taken(item_frame, quantity);
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
    if (this.prefab_name !== "player") this.game_state.prefabs[this.prefab_name].mChest.save.properties.items = this.stat;
    
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
    
    this.game_state.mGame.hud.alt.hide();
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
        
    output.sort((a, b) => a.f - b.f);
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
            new_put_type = "sell";
            break;
        case "buy":
            new_put_type = "buy";
            break;
        case "mer_admin":
            new_put_type = "mer_admin";
            break;
        default:
            new_put_type = "equip";
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
        case "mer_admin":
            text = "Správa";
            break;
        default:
            text = "nic";
    }
    
    return text;
};
