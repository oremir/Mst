Mst.ShowBusiness = class extends Mst.ShowStat {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.visible = false;
        this.stats = [];
        this.texts = [];
        this.texts1 = [];
        this.arrows = [];
        this.stats_spacing = properties.stats_spacing;
        this.stats_group = properties.stats_group;
        this.group = Mst.groups[this.stats_group];
        this.stats_rlength = 0;
        this.up_length = 0;

        this.money = 0;
        this.money_i = 0;

        this.type_buy = true;
        this.put_type = "buy";

        this.up_arrow = this.group.create(460, 82, 'arrow_up');
        this.up_arrow.fixedToCamera = true;
        this.up_arrow.inputEnabled = true;
        this.up_arrow.input.useHandCursor = true;
        this.up_arrow.events.onInputDown.add(this.up_stat, this);
        this.up_arrow.visible = false;

        this.down_arrow = this.group.create(460, 297, 'arrow_down');
        this.down_arrow.fixedToCamera = true;
        this.down_arrow.inputEnabled = true;
        this.down_arrow.input.useHandCursor = true;
        this.down_arrow.events.onInputDown.add(this.down_stat, this);
        this.down_arrow.visible = false;

        // it is necessary to save the initial position because we need it to create the stat sprites
        this.initial_position = new Mst.Position(this);

        //this.create_buy_sel();
    }
};

Mst.ShowBusiness.prototype = Object.create(Mst.ShowStat.prototype);
Mst.ShowBusiness.prototype.constructor = Mst.ShowBusiness;

Mst.ShowBusiness.prototype.show_initial_stats = function (nlindex) {
    "use strict";

    // show initial stats
    
    this.stat = "";
    this.prefab_name = "";
    const business = Mst.player.cPlayer.business.opened;
    
    if (business) {
        this.prefab_name = business.name;
        this.stat = business.stats.items;
    }
    
    console.log("Init " + this.prefab_name + ": " + this.stat);
    
    if (this.stat != "") {
        Mst.hud.right_window.show("");
        //this.show_buy_sel();
        Mst.hud.items.set_put_type(this.put_type);
        
        this.stat_splited = this.stat.split("_");

        let lindex = nlindex ? nlindex : 0;
        let lindex_set = false;
        
        this.stats_rlength = 0;
        
        console.log("Put type: " + this.put_type + " Type buy:" + this.type_buy);
        
        for (let stat_index in this.stat_splited) {
            // create new sprite to show stat
            const stat_splited = this.stat_splited[stat_index].split("-");
            const item_frame = parseInt(stat_splited[0]);
            const item_quantity = parseInt(stat_splited[1]);
            const item_cost = parseInt(stat_splited[2]);
            const item_stc = stat_splited[3] ? parseInt(stat_splited[3]) : 1;
            let stat = {};

            if (item_frame === 1 && this.put_type !== "mer_admin") {
                this.money = item_quantity;
                this.money_i = stat_index;
                stat.stat = {};
                stat.stat.frame = 1;
                stat.stat.quantity = item_quantity;
                stat.stat.stcost = item_cost;
                stat.stat.stcmin = item_stc;
                stat.stat.type = "nic";
                stat.text = { type: "nic" };
                stat.text1 = { type: "nic" };
                stat.arrows = { type: "nic" };
            } else {
                if (stat_index >= this.up_length && lindex < 12) {
                    if (this.type_buy) {
                        if (item_quantity > 1) {
                            stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity, item_cost, item_stc);
                            this.stats_rlength++;
                            lindex++;  
                        } else {
                            stat = {};
                            stat.stat = {};
                            stat.stat.frame = item_frame;
                            stat.stat.quantity = item_quantity;
                            stat.stat.stcost = item_cost;
                            stat.stat.stcmin = item_stc;
                            stat.stat.type = "nic";
                            stat.text = { type: "nic" };
                            stat.text1 = { type: "nic" };
                            stat.arrows = { type: "nic" };
                        } 
                    } else {
                        if (this.put_type === "mer_admin") {
                            stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity, item_cost, item_stc);
                            this.stats_rlength++;
                            lindex++;
                        } else {
                            if (item_stc > 0) {
                                stat = this.create_new_stat_sprite(stat_index, item_frame, item_quantity, item_cost, item_stc);
                                this.stats_rlength++;
                                lindex++;
                            } else {
                                stat.stat = {};
                                stat.stat.frame = item_frame;
                                stat.stat.quantity = item_quantity;
                                stat.stat.stcost = item_cost;
                                stat.stat.stcmin = item_stc;
                                stat.stat.type = "nic";
                                stat.text = { type: "nic" };
                                stat.text1 = { type: "nic" };
                                stat.arrows = { type: "nic" };
                            }
                        }
                    }
                } else {
                    stat.stat = {};
                    stat.stat.frame = item_frame;
                    stat.stat.quantity = item_quantity;
                    stat.stat.stcost = item_cost;
                    stat.stat.stcmin = item_stc;
                    stat.stat.type = "nic";
                    stat.text = { type: "nic" };
                    stat.text1 = { type: "nic" };
                    stat.arrows = { type: "nic" };
                }
                                             
            }
            
            this.stats.push(stat.stat);
            this.texts.push(stat.text);
            this.texts1.push(stat.text1);
            this.arrows.push(stat.arrows);
            
            if (lindex === 12 && !lindex_set) {
                console.log(stat_index);
                lindex_set = true;
                this.up_length = stat_index;
            }
        }
        
        this.up_arrow.visible = true;
        this.down_arrow.visible = true;
    } else {
        this.stat_splited = [];
    }
};

Mst.ShowBusiness.prototype.reset = function (position_x, position_y) {
    "use strict";
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    //console.log("reset");
    this.initial_position = new Mst.Position(this);
    this.up_length = 0;
    this.show_initial_stats();
    this.visible = false;
};

Mst.ShowBusiness.prototype.update_stat = function (new_stat) {
    "use strict";
 
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowBusiness.prototype.create_new_stat_sprite = function (stat_index, frame, quantity, stcost, stcmin) {
    "use strict";
    var stat_position, stat, stat_property, frame_int, text, text1, xa, arrows, arl, arr, em, text_style, cost;
    var dupl_stat = {};
    
    cost = Math.ceil(stcost/100);
    if (this.type_buy) {
        var cost_old = cost;
        cost = Math.ceil(stcost/100*1.3);
        if (cost < (cost_old + 2)) {
            cost = cost_old + 2;
        }
    }
    
    
    
    // calculate the next stat position
    stat_position = new Mst.Position(this.initial_position.x + (this.stats_rlength * this.stats_spacing.x),
                                     this.initial_position.y + (this.stats_rlength * this.stats_spacing.y));
    //console.log(this.stats.length);
    //console.log(this.initial_position);
    //console.log(stat_position);
    // get the first dead sprite in the stats group
    stat = this.group.getFirstDead();
    frame_int = frame;
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y); //!!!!!!!!!!!!!
        stat.loadTexture('items_spritesheet', frame_int);
        
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowBusiness prefab
        stat = this.group.create(stat_position.x, stat_position.y, 'items_spritesheet', frame_int); //!!!!!!!!!!
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
    
    if (this.put_type === 'mer_admin') {
        text1 = quantity + "x G:" + cost;
        text =  stcmin;
        xa = 30;
        
        arl = this.group.create(stat_position.x + 88 , stat_position.y + 2, 'arrow_lefts', 0);
        arl.scale.setTo(this.scale.x, this.scale.y);
        arl.anchor.setTo(this.anchor.x, this.anchor.y);
        arl.fixedToCamera = true;
        arl.inputEnabled = true;
        arl.input.useHandCursor = true;
        arl.stat_index = stat_index;
        arl.events.onInputDown.add(this.adm_left, this);
        
        arr = this.group.create(stat_position.x + 95 , stat_position.y + 2, 'arrow_rights', 0);
        arr.scale.setTo(this.scale.x, this.scale.y);
        arr.anchor.setTo(this.anchor.x, this.anchor.y);
        arr.fixedToCamera = true;
        arr.inputEnabled = true;
        arr.input.useHandCursor = true;
        arr.stat_index = stat_index;
        arr.events.onInputDown.add(this.adm_right, this);
        
        em = this.group.create(stat_position.x + 105 , stat_position.y + 2, 'em', 0);
        em.scale.setTo(this.scale.x, this.scale.y);
        em.anchor.setTo(this.anchor.x, this.anchor.y);
        em.fixedToCamera = true;
        em.inputEnabled = true;
        em.input.useHandCursor = true;
        em.stat_index = stat_index;
        em.stcmin = stcmin;
        em.events.onInputDown.add(this.adm_em, this);
        
        arrows = {};
        arrows.arl = arl;
        arrows.arr = arr;
        arrows.em = em;
    } else {
        text1 = Mst.items[frame_int].name;
        text = "G: " + cost;
        xa = 0;
        
        arrows = { type: "nic" };
    }
    
    this.text1 = stat.addChild(Mst.game.make.text(stat_position.x + 22, stat_position.y + 1, text1, text_style));
    this.text1.fixedToCamera = true;
    this.group.add(this.text1);

    this.text = stat.addChild(Mst.game.make.text(stat_position.x + xa + 92, stat_position.y + 1, text, text_style));
    this.text.fixedToCamera = true;
    this.group.add(this.text);
    
    stat.frame = frame_int;
    stat.stcost = stcost;
    stat.stcmin = stcmin;
    stat.cost = cost;
    stat.quantity = quantity;
    stat.stat_index = stat_index;
    
    
    dupl_stat.stat = stat;
    dupl_stat.text = this.text;
    dupl_stat.text1 = this.text1;
    dupl_stat.arrows = arrows;
    
    return dupl_stat;
};

Mst.ShowBusiness.prototype.business_that_item = function (one_item) {
    "use strict";
    var item_index, item_frame, item_cost, f_cost, fcpom, item_quantity, index_gold;
    
    const player = Mst.player;
    
    console.log("Business");
    
    if (player.cPlayer.business.opened) {
        item_index = one_item.stat_index;
        const item = this.stats[item_index];
        
        item_frame = item.frame;
        item_quantity = item.quantity;
        item_cost = item.cost;
        
        if (this.type_buy) {
            

            // ------------------------------------- test player gold --------------------------------------

            const gold = Mst.cPlayer.items.test_gold(item_cost);

            console.log("Gold", gold);

            if (gold) {

                // ------------------------------------- Player - gold ---------------------------------------

                gold.sub(item_cost);

                // ------------------------------------ Player + item ------------------------------------------

                player.cPlayer.items.add(item_frame, 1);
                
                // ------------------------------------- Merchant + gold ---------------------------------------
                
                console.log("Merchant money");
                this.add_item(this.money_i, item_cost);

                // ------------------------------------ Merchan - item ------------------------------------------

                this.subtract_item(item_index, 1);

            } else {
                // Na to nemas
                Mst.hud.alerts.show("Na to nemáš!");
            } 
        } else {
            const item = player.cPlayer.items.get(item_frame);
            
            if (this.put_type === "mer_admin") {
                console.log("admin");
                
                const quant_put = 1;
                
                const is_in = this.subtract_item(item_index, 1);
                if (is_in) item.add(quant_put);
            } else {            
                if (item) {

                    let quant_put = 1;
                    if (player.keys.shift.isDown) {
                        console.log("SHIFT");
                        quant_put = Math.ceil(parseInt(item.quantity)/2);

                    }

                    // ------------------------------------ Player - item ------------------------------------------

                    item.sub(quant_put);

                    // ------------------------------------- Player + gold ---------------------------------------

                    f_cost = item_cost*quant_put;
                    fcpom = f_cost;
                    console.log(f_cost);
                    if (quant_put > 1) {
                        f_cost = Math.ceil((f_cost + item_cost*quant_put*Math.pow(0.95, quant_put))/2);
                        
                        if (f_cost < fcpom*0.7) {
                            f_cost = Math.ceil(fcpom*0.7);
                        }
                        
                        if (f_cost < quant_put) {
                            f_cost = quant_put;
                        }
                        
                        console.log(f_cost);
                    }

                    player.cPlayer.items.add(1, f_cost);

                    // ------------------------------------- Merchant + item ---------------------------------------

                    this.add_item(item_index, quant_put);

                    // ------------------------------------ Merchant - gold ------------------------------------------

                    console.log("Merchant money");
                    this.subtract_item(this.money_i, f_cost);
                } else {
                    Mst.hud.alerts.show("To nemáš!");
                }
            }
        }
    }
};

Mst.ShowBusiness.prototype.adm_left = function (arrow) {
    "use strict";
    console.log(arrow.stat_index);
    var item = this.stats[arrow.stat_index];
    
    if (item.stcmin < 2) {
        item.stcost -= 100;
        if (item.stcost < item.stcmin*100) {
            item.stcost = item.stcmin*100;
        }
        item.cost = Math.ceil(item.stcost/100);
        this.texts1[arrow.stat_index].text = item.quantity + "x G:" + item.cost;
        console.log("Cost: " + item.cost + " Stcost: " + item.stcost);
    } else {
        item.stcmin -= 1;
        if (item.stcmin < 0) {
            item.stcmin = 0;
        }
        this.texts[arrow.stat_index].text = item.stcmin;
        console.log("Cost: " + item.cost + " Stcmin: " + item.stcmin);
    }
};

Mst.ShowBusiness.prototype.adm_right = function (arrow) {
    "use strict";
    console.log(arrow.stat_index);
    var item = this.stats[arrow.stat_index];
    
    if (item.stcmin < 2) {
        item.stcost += 100;
        item.cost = Math.ceil(item.stcost/100);
        this.texts1[arrow.stat_index].text = item.quantity + "x G:" + item.cost;
        console.log("Cost: " + item.cost + " Stcost: " + item.stcost);
    } else {
        item.stcmin += 1;
        this.texts[arrow.stat_index].text = item.stcmin;
        console.log("Cost: " + item.cost + " Stcmin: " + item.stcmin);
    }
};

Mst.ShowBusiness.prototype.adm_em = function (arrow) {
    "use strict";
    console.log(arrow.stat_index);
    var item = this.stats[arrow.stat_index];
    
    console.log(item.stcmin);
    
    switch (item.stcmin) {
        case 0:
            item.stcmin = 1;
        break;
        case 1:
            item.stcmin = item.cost;
        break;
        default:
            item.stcmin = 0;
        break;
    }
    
    this.texts[arrow.stat_index].text = item.stcmin;
    console.log("Cost: " + item.cost + " Stcost: " + item.stcmin);
};


Mst.ShowBusiness.prototype.add_item = function (item_index, item_quantity) {
    "use strict";
    var item;
    
    console.log("Add: " + this.prefab_name + " " + this.name + " " + this.stat);
    
    item = this.stats[item_index];
    
    item.quantity += item_quantity;
    
    console.log(item);
    console.log("Item I:" + item_index + " F:" + item.frame + " Quantity: " + item.quantity);

    if(item.frame !== 1) {
        item.stcost *= Math.pow(0.95, item_quantity);
        console.log(Math.pow(0.95, item_quantity));
        console.log(item.stcost);
        item.cost = Math.ceil(item.stcost/100);
        if (this.type_buy) {
            var cost_old = item.cost;
            item.cost = Math.ceil(item.stcost/100*1.3);
            if (item.cost < (cost_old + 2)) {
                item.cost = cost_old + 2;
            }
        }
        if (item.stcost < item.stcmin*100) {
            item.stcost = item.stcmin*100;
            item.cost = item.stcmin;
        }
        console.log(item.cost);
        this.texts[item_index].text = "G: " + item.cost;
    }
    
    
    console.log("Cost: " + item.cost + " Stcost: " + item.stcost);
    console.log(this.stats);
    
    
};

Mst.ShowBusiness.prototype.add_item_i = function (item_frame, item_quantity) {
    "use strict";
    var item, is_in;
    
    console.log("Add: " + this.prefab_name + " " + this.name + " " + this.stat);
    
    is_in = false;
    
    for (var i = 0; i < this.stats.length; i++) {
        item = this.stats[i];
        if (item.frame === item_frame) {
            item.quantity += item_quantity;
            
            this.texts1[i].text = item.quantity + "x G:" + item.cost;
            console.log("Item I:" + i + " F:" + item.frame + " Quantity: " + item.quantity);
            is_in = true;
            break;
        }
    }
    
    if (!is_in) {
        
        item = {};
        
        item.frame = item_frame;
        item.stcost = 100;
        item.quantity = item_quantity;
        item.type = "nic";
        
        this.stats.push(item);
        this.kill_stats();
        this.up_length = 0;
        this.show_initial_stats();
    }
};

Mst.ShowBusiness.prototype.subtract_item = function (item_index, item_quantity) {
    "use strict";
    var item, is_in, iq_old;
    
    console.log("Subtract: " + this.prefab_name + " " + this.name + " " + this.stat);
    
    item = this.stats[item_index];
    console.log(item);
    
    iq_old = item.quantity;
    item.quantity -= item_quantity;
    
    console.log("Item I:" + item_index + " F:" + item.frame + " Quantity: " + item.quantity);
    
    is_in = true;
    if (item.quantity < 1) {
        item.quantity = iq_old;
        is_in = false;
    }
    
    if(item.frame !== 1) {
        var cost_old = Math.ceil(item.stcost/100);
        console.log(cost_old);
        item.stcost *= 1.1;
        item.cost = Math.ceil(item.stcost/100);
        if (item.cost > (cost_old + 1)) {
            item.cost = cost_old + 1;
            item.stcost = cost_old*100 + 95;
        }
        console.log(item.cost);
        if (this.type_buy) {
            cost_old = item.cost;
            item.cost = Math.ceil(item.stcost/100*1.3);
            console.log(item.cost);
            if (item.cost < (cost_old + 2)) {
                item.cost = cost_old + 2;
            }
        }
//        if (item.stcost < item.stcmin*100) {
//            item.stcost = item.stcmin*100;
//        }
        console.log(item.cost);
        if (this.put_type !== "mer_admin") {
            this.texts[item_index].text = "G: " + item.cost;
        } else {
            this.texts1[item_index].text = item.quantity + "x G:" + item.cost;
        }
    } else {
        item.cost = 1;
        if (this.put_type === "mer_admin") {
            this.texts1[item_index].text = item.quantity + "x G:" + item.cost;
        }
    }
    
    
    console.log("Cost: " + item.cost + " Stcost: " + item.stcost);
    console.log(this.stats);
    console.log(item);
    
    return is_in;
};

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

Mst.ShowBusiness.prototype.update_item = function (item_index, item_frame, item_quantity) {
    "use strict";
    var item_updated, is_in_items;
    is_in_items = true;
    
    item_updated = item_frame + "-" + item_quantity;
    
    if (item_quantity > 0) {
        if (item_index > -1) {
            this.stat_splited[item_index] = item_updated;
        } else {
            is_in_items = false;
            this.stat_splited.push(item_updated);
        }
    } else {
        is_in_items = false;
        this.stat_splited.splice(item_index, 1);
    }

    this.stat = this.stat_splited.join("_");
    Mst.prefabs[this.prefab_name].stats.items = this.stat;
    if (this.prefab_name !== "player") Mst.prefabs[this.prefab_name].save.properties.items = this.stat;
    
    if (is_in_items === false) {
        this.kill_stats();
        this.up_length = 0;
        this.show_initial_stats();
    }
};

Mst.ShowBusiness.prototype.kill_stats = function () {
    var st_up = [];
    
    this.stats.forEach(function(stat) {
        var stat_up = stat.frame + "-" + stat.quantity + "-" + Math.ceil(stat.stcost);
        console.log("Kill stcmin: " + stat.stcmin);
        if (stat.stcmin !== 1) {
            stat_up += "-" + stat.stcmin;
        }
        st_up.push(stat_up);
        //console.log(stat);
        if (stat.type !== 'nic') {
            stat.kill();
        } else {
            stat = {};
        }
    });
    
    console.log(st_up);
    this.stat = st_up.join("_");
    Mst.prefabs[this.prefab_name].stats.items = this.stat;
    Mst.prefabs[this.prefab_name].save.properties.items = this.stat;
    
    this.stats = [];
    this.texts.forEach(function(text) {
        if (text.type !== 'nic') {
            text.destroy();
        } else {
            text = {};
        }
    });
    this.texts1.forEach(function(text) {
        if (text.type !== 'nic') {
            text.destroy();
        } else {
            text = {};
        }
    });
    this.arrows.forEach(function(arrow) {
        //console.log(arrow);
        if (arrow.type !== 'nic') {
            arrow.arl.kill();
            arrow.arr.kill();
            arrow.em.kill();
        } else {
            arrow = {};
        }
    });
    this.texts = [];
    this.texts1 = [];
    this.arrows = [];
    this.visible = false;
    
    this.up_arrow.visible = false;
    this.down_arrow.visible = false;
    
    //this.hide_buy_sel();
    Mst.hud.right_window.hide();
    Mst.hud.items.set_put_type("put");
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

Mst.ShowBusiness.prototype.up_stat = function () {
    "use strict";    

    this.kill_stats();
    
    console.log(this.up_length);
    
    this.up_length -= 13;
        
    if (this.up_length < 0) {
        this.up_length = 0;
    }
    
    console.log(this.up_length);
    
    this.show_initial_stats();
};

Mst.ShowBusiness.prototype.down_stat = function () {
    "use strict";    

    this.kill_stats();
    
    console.log(this.up_length);
    
    if (this.up_length > this.stat_splited.length) {
        this.up_length = this.stat_splited.length - 8;
    }
    
    if (this.up_length < 0) {
        this.up_length = 0;
    }
    
    console.log(this.up_length);
    
    this.show_initial_stats();
};

Mst.ShowBusiness.prototype.set_put_type = function (put_type) {
    "use strict";    

//    if (type_buy) {
//        if (this.type_buy) {
//            
//        } else {
//            this.put_type = "buy";
//        }        
//    } else {
//        
//    }
    if (put_type === "buy") {
        this.type_buy = true;
    } else {
        this.type_buy = false;
    }
    
    this.put_type = put_type;

    this.kill_stats();
    this.up_length = 0;
    this.show_initial_stats();
};
