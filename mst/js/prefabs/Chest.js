var Mst = Mst || {};

Mst.Chest = function (game_state, name, position, properties) {
    "use strict";
    
    //console.log("y: "+position.y)
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.stats = {
        items: properties.items
    };
    
    this.closed_frame = parseInt(properties.closed_frame) || 4;
    this.opened_frame = parseInt(properties.opened_frame) || 5;    
    
    
    //console.log(this.game_state.grid);
    
    this.tilex = this.game_state.layers.background.getTileX(this.x);
    this.tiley = this.game_state.layers.background.getTileY(this.y);
    console.log(this.tilex + "|" + this.tiley);
    this.game_state.setGridXY(this.tilex, this.tiley, 1);
    
    console.log(this.game_state.grid);
    
    var key;
    key = this.game_state.keyOfName(name);
        
    if (key === "") {
        if (typeof(properties.obj_id) !== 'undefined') {
            this.obj_id = parseInt(properties.obj_id);
        } else {
            this.obj_id = 0;
        }
    } else {
        this.obj_id = parseInt(this.game_state.save.objects[key].obj_id);
    }
    
    this.save = {
        type: "chest",
        name: name,
        obj_id: this.obj_id,
        x: position.x - (this.game_state.map.tileHeight / 2),
        y: position.y + (this.game_state.map.tileHeight / 2),
        properties: properties,
        map_int: this.game_state.root_data.map_int
    };
    
    //console.log("y: "+this.save.y)
    if (typeof(properties.is_takeable) !== 'undefined') {
        if (typeof(properties.is_takeable) === 'boolean') {
            this.is_takeable = properties.is_takeable;
        } else {
            this.is_takeable = (properties.is_takeable === 'true');
        }
    } else {
        this.is_takeable = true;
    }
    
    this.sskill = "";
    if (typeof(properties.sskill) !== 'undefined') {
        this.sskill = properties.sskill;
    }
    
    this.owner = 0;
    if (typeof (properties.owner) !== 'undefined') {
        this.owner = properties.owner;
    }
        
    console.log("Chest " + this.name + " takable:" + this.is_takeable);
    
    if (typeof(properties.level) !== 'undefined') {
        this.level = parseInt(properties.level);
    } else {
        this.level = 0;
    }
    
    if (typeof(properties.cases) !== 'undefined') {
        this.cases = properties.cases;
        
        var cases = [];
        if (typeof (this.cases) === 'object') {
            for (var key in this.cases) {
                cases[key] = this.cases[key];
            }
        } else {
            cases = this.cases;
        }
        this.cases = cases;
        
        this.stolen = false;
        if (this.cases.length > 0) {
            this.stolen = true;
        }        
        this.case_id = -1;
        this.culprit_id = -1;
        this.mw_context = "";
    } else {
        this.cases = [];
        this.stolen = false;
        this.case_id = -1;        
        this.culprit_id = -1;
        this.mw_context = "";
    } 
    
    var d = new Date();
    var n = d.getTime();
    
    if (typeof(properties.time) !== 'undefined') {
        this.time = parseInt(properties.time);
    } else {

        this.time = n;
    }
    
    if (typeof(properties.ctime) !== 'undefined') {
        this.ctime = parseInt(properties.ctime);
    } else {

        this.ctime = this.time;
    }
    
    if (typeof(properties.s1type) !== 'undefined') {
        this.s1type = properties.s1type;
    } else {
        this.s1type = "";
        this.save.properties.s1type = "";
    }
    
    if (typeof(properties.s2type) !== 'undefined') {
        this.s2type = properties.s2type;
    }
    
    console.log("S1TYPE closed frame: " + this.closed_frame);
    if (this.closed_frame === 131 || this.closed_frame === 132) {
        this.s1type = "tree";
        this.save.properties.s1type = "tree";
    }
    
    console.log("Chest time diff: " + (n - this.ctime));
    console.log((n - this.ctime)/100000);
    
    //if ((n - this.ctime)/100000 > 1) {
    if ((n - this.ctime)/100000 > 846) {
        switch (this.closed_frame) {
            case 126: // sazenice
                var rnd_test = Math.floor(Math.random() * 100);
                if (rnd_test > 50) {
                    var r_frame = 132; // Keř
                } else {
                    var r_frame = 131; // Strom malý
                }
                this.s1type = "tree";
                this.save.properties.s1type = "tree";
                this.change_frame(r_frame);
                this.save_chest();
                //this.time = n;
                this.ctime = n;
            break;
            case 130: // Keř malý
                var rnd_test = Math.floor(Math.random() * 100);
                if (rnd_test > 50) {
                    var r_frame = 132; // Keř
                } else {
                    var r_frame = 133; // Keř s bobulí
                }
                this.change_frame(r_frame);
                //this.time = n;
                this.ctime = n;
            break;
            case 132: // Keř malý
                this.change_frame(133); // Keř s bobulí
                //this.time = n;
                this.ctime = n;
            break;
            case 158: // Kvetinac zem. zal.
                if (this.s1type !== "plant") {
                    if (this.stats.items.length > 6) {
                        this.change_frame(140); // Kvetinac saz.
                        //this.time = n;
                        this.ctime = n;
                    }
                } else {
                    this.change_frame(139); // Kvetinac zem.
                    //this.time = n;
                    this.ctime = n;
                }
            break;
            case 159: // Kvetinac saz. zal.
                this.change_frame(141); // Kvetinac rosl.
                //this.time = n;
                this.ctime = n;
            break;
            case 160: // Kvetinac rost. zal.
                this.change_frame(139); // Kvetinac zem.
                var plant_a1 = this.stats.items.split("_");
                console.log(plant_a1);
                var plant_frame = plant_a1[1].split("-")[0];
                console.log("Plant frame: " + plant_frame);
                switch (plant_frame) {
                    case "143": // šafrán
                        this.s1type = "plant";
                        this.save.properties.s1type = "plant";
                        this.s2type = "142";
                        this.save.properties.s2type = "142";
                    break;
                    case "163": // meduňka
                        this.s1type = "plant";
                        this.save.properties.s1type = "plant";
                        this.s2type = "164";
                        this.save.properties.s2type = "164";
                    break;
                    case "178": // kotvičník
                        this.s1type = "plant";
                        this.save.properties.s1type = "plant";
                        this.s2type = "179";
                        this.save.properties.s2type = "179";
                    break;                    
                }
                
                //this.time = n;
                this.ctime = n; 
            break;
            case 229: // pole zem. zal.
                this.change_frame(227); // pole zem.
                //this.time = n;
                this.ctime = n;
            break;
            case 230: // pole sem. zal.
                this.change_frame(231); // pole saz.
                //this.time = n;
                this.ctime = n;
            break;
            case 233: // pole saz. zal.
                this.change_frame(232); // pole rosl.
                //this.time = n;
                this.ctime = n;
            break;
            case 234: // pole rost. zal.
                this.change_frame(227); // pole zem.
                var plant_a1 = this.stats.items.split("_");
                console.log(plant_a1);
                var plant_frame = plant_a1[0].split("-")[0];
                console.log("Plant frame: " + plant_frame);
                switch (plant_frame) {
                    case "236": // salat saz.
                        this.s1type = "plant";
                        this.save.properties.s1type = "plant";
                        this.s2type = "237";
                        this.save.properties.s2type = "237";
                    break;                  
                }
                
                //this.time = n;
                this.ctime = n; 
            break;
        }
    }
    
    if ((n - this.ctime)/100000 > 423) {
        switch (this.closed_frame) {
            case 126: // sazenice
                var rnd_test = Math.floor(Math.random() * 100);
                if (rnd_test > 50) {
                    var r_frame = 130; // Keř malý
                } else {
                    var r_frame = 131; // Strom malý
                }
                this.change_frame(r_frame);
                this.save_chest();
                //this.time = n;
                this.ctime = n;
            break;
            case 130: // Keř malý
                var rnd_test = Math.floor(Math.random() * 100);
                if (rnd_test > 50) {
                    var r_frame = 132; // Keř
                } else {
                    var r_frame = 133; // Keř s bobulí
                }
                this.change_frame(r_frame);
                //this.time = n;
                this.ctime = n;
            break;
            case 132: // Keř malý
                this.change_frame(133); // Keř s bobulí
                //this.time = n;
                this.ctime = n;
            break;
        }
    }
    
    if ((n - this.ctime)/100000 > 4) {
        switch (this.closed_frame) {
            case 166: // kos
                //this.time = n;
                this.ctime = n;
            break;
        }
    }
    
    this.taken = {};
    
    this.is_opened = false;
    
    this.body.immovable = true;
    console.log(this.closed_frame);
    this.frame = this.closed_frame;
    this.anchor.setTo(0.5);
    
    this.chest_timer = this.game_state.time.create();
    this.chest_loop = 0;
    this.chest_loop_frame = 0;
    this.chest_fire = 0;
    
    this.animations.add('ficauldron', [56, 57], 10, true);
    this.animations.add('fifurnace', [65, 66], 10, true);
    this.animations.add('fiwcauldron', [74, 75], 10, true);    
    this.animations.add('fire', [83, 84, 85, 86, 87, 88], 10, true);
    
    
    switch (this.closed_frame) {
        case 56:
            this.animations.play("ficauldron");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 56;
        break;
        case 65:
            this.animations.play("fifurnace");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 65;
        break;
        case 74:
            this.animations.play("fiwcauldron");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 74;
        break;
        case 83:
            this.animations.play("fire");
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            this.chest_loop_frame = 83;
        break;
        case 139: // Kvetinac zem.
            if (typeof(properties.s2type) !== 'undefined') {
                if (this.s2type !== '') {
                    var ind = parseInt(this.s2type);
                    console.log(ind);
                    this.plant = this.game_state.groups.bubbles.create(this.x - 8, this.y - 16, 'items_spritesheet', 0);
                    this.plant.loadTexture('items_spritesheet', ind);
                    //this.plant.frame = ind;
                    this.chest_loop = 1;
                    this.chest_loop_frame = 139;
                }
            }
        break;
        case 140: // Kvetinac saz.
            this.chest_loop = 1;
            this.chest_loop_frame = 140;
        break;
        case 166: // Kos
            this.chest_loop = 1;
            this.chest_loop_frame = 166;
        break;
        case 227: // pole zem.
            if (typeof(properties.s2type) !== 'undefined') {
                if (this.s2type !== '') {
                    var ind = parseInt(this.s2type);
                    console.log(ind);
                    this.plant = this.game_state.groups.bubbles.create(this.x - 8, this.y - 12, 'items_spritesheet', 0);
                    this.plant.loadTexture('items_spritesheet', ind);
                    //this.plant.frame = ind;
                    this.chest_loop = 1;
                    this.chest_loop_frame = 227;
                }
            }
        break;
        case 231: // pole saz.
            this.chest_loop = 1;
            this.chest_loop_frame = 231;
        break;
        case 237: // salat
            console.log("Salat run");
            this.salat_lives = 100;
            this.game_state.groups.NPCs.forEachAlive(function (NPC) {
                if (NPC.stype === "tlustocerv") {
                    console.log("Tlustocerv salat run");
                    NPC.condi(true, this);
                }
            }, this);
        break;
        default:
            this.animations.stop();
        break;
    }
    
    this.bubble = this.game_state.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    if (this.stolen) {
        var owner = parseInt(this.owner);
        if (owner === this.game_state.prefabs.player.usr_id) {
            this.show_bubble(3);
        } else {
            if (this.closed_frame === 199) {
                this.kill();
            }
        }
    }
    
    this.inputEnabled = true;
    this.events.onInputDown.add(this.get_chest, this);
    
    this.updated = false;
    this.stat = "";
};

Mst.Chest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Chest.prototype.constructor = Mst.Chest;

Mst.Chest.prototype.update = function () {
    "use strict";
    //if (this.alive) {
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 22) { 
        if (this.game_state.prefabs.player.opened_chest === this.name) {
            console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
            console.log("Chest is too far!");
            if (this.game_state.hud.middle_window.visible) {
                this.game_state.hud.middle_window.option_ok();
            }
            this.close_chest();
        }
    }

//    if (this.game_state.prefabs.sword.alive && this.game_state.prefabs.sword.cut) {
//        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 19) {
//            this.game_state.prefabs.sword.cut_chest(this);
//        }
//    }
    //}
    
    if (this.updated) {
        if (this.stats.items === "") {
            if (this.is_takeable) {
                this.input.useHandCursor = true;

                if (this.closed_frame === 3) {
                    this.get_chest(this);
                }
            } else {
                this.input.useHandCursor = false;
            }
        } else {
            this.input.useHandCursor = false;
        }
        
        if (this.bubble_showed) {
            this.bubble.x = this.x;
            this.bubble.y = this.y - 16;
        }
        
        var is_timed = true;
        
        switch (this.closed_frame) {
            case 56:
                console.log("Play anim kotlik");
                this.animations.play("ficauldron");
            break;
            case 65:
                console.log("Play anim vyhen");
                this.animations.play("fifurnace");
            break;
            case 74:
                console.log("Play anim kotlik s vodou");
                this.animations.play("fiwcauldron");
            break;
            case 83:
                console.log("Play anim ohen");
                this.animations.play("fire");
            break;
            case 104:
                is_timed = true;
            break;
            case 139: //kvetinac zem.
                if (this.s1type === 'plant') {
                }
                is_timed = false;
            break;
            case 140:
                is_timed = true;
            break;
            case 166: // Kos
                is_timed = false;
            break;
            case 227: //pole zem.
                if (this.s1type === 'plant') {
                }
                is_timed = false;
            break;
            case 231: //pole saz.
                is_timed = true;
            break;
            default:
                this.animations.stop();
                is_timed = false;
            break;
        }
        
        if (!this.chest_timer.running && is_timed) {
            this.chest_timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.chest_timer.start();
            console.log("Chest timer start!");
        }
        
        console.log("Update1:");
        console.log(this.name);
        console.log(this.save);
        console.log(JSON.stringify(this.save));
        
        console.log("OF: " + this.opened_frame + " CF: " + this.closed_frame + " It: " + this.stats.items);
        
        this.save.properties.items = this.stats.items;
        this.save.properties.opened_frame = this.opened_frame;
        this.save.properties.closed_frame = this.closed_frame;
        
//        console.log("Update2:");
//        console.log(this.save);
//        console.log(JSON.stringify(this.save));
        console.log(this.frame);
        
        var key;
        key = this.game_state.keyOfName(this.name);
    
        //console.log(key);

        if (key !== "") {
            if (this.stats.items === "" && this.closed_frame === 3) {
                this.game_state.save.objects.splice(key, 1);
            } else {
                this.game_state.save.objects[key] = this.save;
            }
        } else {
            if (!(this.stats.items === "" && this.closed_frame === 3)) {
                this.game_state.save.objects.push(this.save);
            }
        }
        
        //console.log(this.game_state.save.objects);
        this.updated = false;
    }
};

Mst.Chest.prototype.reset = function (position) {
    "use strict";
    
    Phaser.Sprite.prototype.reset.call(this, position.x, position.y);
};

Mst.Chest.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    console.log("Bubble show " + this.obj_id);
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
};

Mst.Chest.prototype.hide_bubble = function (hidecond) {
    "use strict";
    
    console.log("Bubble hide " + this.obj_id);
    this.bubble_showed = false;
    this.bubble.visible = false;
};

Mst.Chest.prototype.time_up = function () {
    "use strict";
    var f, cook, in_chest, ij;
    
    console.log("Chest " + this.name + " time up!");
    switch (this.closed_frame) {
        case 56: //Kotlik hori
            this.animations.stop();
            
            this.frame = 53; //Kotlik
            this.closed_frame = 53;
            this.opened_frame = 53;
            this.updated = true;
        break;
        case 65: //Vyhen hori
            this.animations.stop();
            
            this.frame = 64; //Vyhen
            this.closed_frame = 64;
            this.opened_frame = 64;
            this.updated = true;
        break;
        case 74: //Kotlik s vodou hori
            this.animations.stop();
            
            this.frame = 71; //Kotlik s vodou
            this.closed_frame = 71;
            this.opened_frame = 71;
            this.updated = true;
        break;
        case 83: //Drevo hori
            this.animations.stop();
            
            this.frame = 89; //popel
            this.closed_frame = 89;
            this.opened_frame = 89;
            this.updated = true;
            
            console.log(this.frame);
        break;
        case 104: //kam. nadoba s tav.
            this.frame = 60; //kam. nadoba
            this.closed_frame = 60;
            this.opened_frame = 60;
            this.chest_loop_frame = 104;
            this.updated = true;
            
            console.log(this.frame);
        break;
    }
    
    this.chest_loop++;
    
    if (this.is_opened) {
        this.loops_done(this.chest_loop, this.chest_loop_frame);
    }
};

Mst.Chest.prototype.loops_done = function (nloop, type) {
    "use strict";
    var player, f, q, fc, qc, item, index, ind2, quantity, quant2, quant_red, in_chest, recipe, cook, ij;
    
    player = this.game_state.prefabs.player;
    
    var d = new Date();
    var n = d.getTime();
    
    console.log("Loops done / l:" + nloop + " f:" + type + " time: " + (n - this.ctime)/100000);
    
    if (nloop > 0) {
        for (i = 0; i < nloop; i++) {
            switch (type) {
                case 56: //kotlik hori
                    item = this.index_item(92); //ohen
                    this.subtract_item(item.index, item.quantity);
                    quantity = Math.ceil(item.quantity / 2);
                    this.add_item(89, quantity); //popel
                break;
                case 65: //vyhen hori
                    item = this.index_item(92); //ohen
                    this.subtract_item(item.index, item.quantity);
                    quantity = Math.ceil(item.quantity / 2);
                    quant_red = Math.floor(quantity / 2);
                    this.add_item(89, quantity); //popel
                    item = this.index_item(97); //zel. ruda
                    ind2 = item.index;
                    quant2 = item.quantity;
                    
                    if (quant2 > quant_red) {                        
                        if (quant_red > 0) {
                            this.subtract_item(ind2, quant_red);
                            this.add_item(103, quant_red); //tav. zelezo
                        }
                    } else {
                        if (quant2 > 0) {
                            this.subtract_item(ind2, quant2);
                            this.add_item(103, quant2); //tav. zelezo
                        }
                    }
                break;
                case 74: //kotlik s vodou hori
                    item = this.index_item(92); //ohen
                    this.subtract_item(item.index, item.quantity);
                    quantity = Math.ceil(item.quantity / 2);
                    
                    in_chest = this.in_chest_ord();
                    if (in_chest.length > 0) {
                        recipe = [{f: 147, q: 1}, {f: 155, q: 1}, {f: 167, q: 1}, {f: 170, q: 1}, {f: 171, q: 1}]; //čistící lektvar
                        // destil.v. 147, čnělka šafránu 155, výměšek plísňáčka 167, oko švába 170, čistivka 171, 
                        if (this.chest_compare(in_chest, recipe)) {
                            console.log("Čistící lektvar");
                            index = this.test_item(147, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(155, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(167, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(170, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(171, 1);
                            this.subtract_item(index, 1);
                            this.add_item(173, 1); // čistící lektvar
                            this.updated = true;
                            player.work_rout("alchemy", "intelligence", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        recipe = [{f: 147, q: 1}, {f: 155, q: 1}, {f: 165, q: 1}, {f: 177, q: 1}, {f: 184, q: 1}]; // antilevitační lektvar
                        // destil.v. 147, čnělka šafránu 155, list meduňky 165, kotvičník plod 177, výh. angostury 184, 
                        if (this.chest_compare(in_chest, recipe)) {
                            console.log("Antilevitační lektvar");
                            index = this.test_item(147, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(155, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(165, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(177, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(184, 1);
                            this.subtract_item(index, 1);
                            this.add_item(188, 1); // antilevitační lektvar
                            this.updated = true;
                            player.work_rout("alchemy", "intelligence", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                        
                        recipe = [{f: 33, q: 3}, {f: 81, q: 1}, {f: 193, q: 1}]; // Trnkový kompot
                        // trnka 3x 33, voda 81, cukr 193 
                        if (this.chest_compare(in_chest, recipe)) {
                            console.log("Trnkový kompot");
                            index = this.test_item(33, 3);
                            this.subtract_item(index, 3);
                            index = this.test_item(81, 1);
                            this.subtract_item(index, 1);
                            index = this.test_item(193, 1);
                            this.subtract_item(index, 1);
                            this.add_item(194, 1); // Trnkový kompot
                            this.updated = true;
                            player.work_rout("cook", "dexterity", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                        }
                    }
                    
                    index = this.test_item(91, 1); //hrib
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        index = this.test_item(81, 1); //voda
                        this.subtract_item(index, 1);
                        this.add_item(93, 1); //hrib. polevka
                        
                        player.update_quest("make", 93);
                        player.work_rout("cook", "dexterity", 1, 50, 40, 3); // stress, stand_exp, skill_exp, abil_p
                    }
                    
                    this.add_item(89, quantity); //popel
                break;
                case 83: //drevo hori
                    item = this.index_item(92); //ohen
                    this.subtract_item(item.index, item.quantity);
                    quantity = Math.floor(item.quantity / 2);
                    this.add_item(89, quantity); //popel
                    in_chest = this.in_chest_ord();
                    if (in_chest.length > 0) {
                        for (var i = 0; i < in_chest.length; i++) {
                            f = in_chest[i].f;
                            cook = this.game_state.core_data.items[f].properties.cook;
                            if (typeof(cook) !== 'undefined') {
                                index = this.test_item(f, 1);
                                this.subtract_item(index, 1);

                                for (var j = 0; j < cook[0]; j++) {
                                    ij = 2 * j + 1;
                                    fc = cook[ij];
                                    qc = cook[ij + 1];
                                    this.add_item(fc, qc);

                                }
                                
                                player.work_rout("cook", "dexterity", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                            }

                        }
                    }
                break;
                case 104:
                    index = this.test_item(105, 1); //zhav. zelezo
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(98, 1); //zelezo
                    }
                break;
                case 139:
                    index = this.test_item(143, 1); //Safran cibulka
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(142, 1); //safran
                    }
                    index = this.test_item(163, 1); //Medunka cibulka
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(164, 1); //medunka
                    }
                    index = this.test_item(178, 1); //kotvičník cibulka
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(179, 1); //kotvičník
                    }
                break;                
                case 140:
                    index = this.test_item(161, 1); //Safran sem.
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(143, 1); //safran cibulka
                    }                    
                    index = this.test_item(162, 1); //Medunka sem.
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(163, 1); //Medunka saz.
                    }                   
                    index = this.test_item(177, 1); //Kotvičník sem.
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(178, 1); //Kotvičník saz.
                    }
                break; 
                case 166:
                    index = this.test_item(167, 1); //vymesek plisnacka
                    if (index < 0) {
                        var index2 = this.test_item(157, 1); //bioodpad
                        if (index2 > -1) {
                            this.subtract_item(index2, 1);
                            this.add_item(167, 1); //vymesek plisnacka
                        } else {
                            index2 = this.test_item(172, 1); //bioodpad2
                            if (index2 > -1) {
                                this.subtract_item(index2, 1);
                                this.add_item(167, 1); //vymesek plisnacka
                            }
                        }
                    }
                break;
                case 227: //pole zem.
                    index = this.test_item(236, 1); //salat saz.
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(237, 1); //salat
                    }
                break;                
                case 231: //pole saz.
                    index = this.test_item(235, 1); //salat sem.
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        this.add_item(236, 1); //salat saz.
                    }
                break;
            }
        }
        this.chest_loop = 0;
    }

};

Mst.Chest.prototype.open_chest = function (player, chest) {
    "use strict";
    
    if (chest.obj_id === 0) {
        console.log("Chest open obj_id 0");
        chest.game_state.prefabs.chestitems.show_initial_stats();
        chest.game_state.prefabs.items.set_put_type("put");

        chest.frame = chest.opened_frame;
        chest.is_opened = true;
        chest.updated = true;

        var nloop = chest.chest_loop;
        var ltype = chest.chest_loop_frame;
        chest.loops_done(nloop, ltype);

        console.log("Chest is open!");
        chest.game_state.hud.alert.show_alert("Otevřena!");
    } else {
        var game_state, name, usr_id, map, d, n, stat;

        //game_state = this.game_state;
        //name = this.name;
        usr_id = player.usr_id;
        //map = this.game_state.root_data.map_int;

        chest.save.properties.items = chest.stats.items;
        chest.save.properties.opened_frame = chest.opened_frame;
        chest.save.properties.closed_frame = chest.closed_frame;
        chest.save.properties.taken = chest.save_taken();
        chest.taken = {};
        chest.save.action = "OPEN";

        var d = new Date();
        var n = d.getTime();

        console.log(chest.save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
            .done(function (data) {
                console.log("Chest open success");
                console.log(data);
                var resp, items, properties;
                resp = JSON.parse(data);
                properties = resp.obj.properties;
                items = resp.obj.properties.items;
                stat = resp.stat;
                console.log(items);

                chest.load_chest(properties, stat);
                chest.set_stat(stat);
                            
                console.log("Chest open time > 20: " + (n - chest.time)/100000);
                if (stat === 'open' && (n - chest.time)/100000 > 20) {
                    stat = "ok";
                    chest.set_stat(stat);
                }

                if (stat === 'open') {
                    console.log("Chest is open by other player");
                    chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");

                    chest.close_chest();
                } else {
                    player.open_chest_fin(player, chest);
                }

                console.log("Is opened? " + chest.is_opened);
            })
            .fail(function (data) {
                console.log("Chest open error");
                console.log(data);
            });

        console.log("save chest open");

    }

    console.log("Is opened? " + chest.is_opened);
    
    return stat;
};

Mst.Chest.prototype.open_chest_fin = function (player, chest) {
    "use strict";
    
    chest.game_state.prefabs.chestitems.show_initial_stats();
    chest.game_state.prefabs.items.set_put_type("put");
    
    chest.frame = chest.opened_frame;
    chest.is_opened = true;
    chest.updated = true;

    console.log("Chest is open!");
    chest.game_state.hud.alert.show_alert("Otevřena!");

    if (chest.closed_frame === 80) {
        chest.game_state.hud.alert.show_alert("Vodní zdroj");
    }

    var rnd_test = Math.floor(Math.random() * 100);
    if (chest.s1type === "tree" && player.opened_ren === "" && rnd_test > 70) {
        chest.krlz_sprite =  new Mst.NPC(chest.game_state, "kurolez", {x: chest.x, y: chest.y}, {
            group: "NPCs",
            pool: "NPCs",
            texture: "blank_image",
            p_name: "kurolez",
            unique_id: 0,
            stype: "kurolez",
            relations_allowed : "false",
            region: 0,
            o_type: "NPC"
        });

        chest.krlz_sprite.add_ren();

        chest.krlz_sprite.touch_player(chest.krlz_sprite, player);

    }

    var nloop = chest.chest_loop;
    var ltype = chest.chest_loop_frame;
    chest.loops_done(nloop, ltype);
};

Mst.Chest.prototype.close_chest = function () {
    "use strict";
    
    this.frame = this.closed_frame;
    this.game_state.prefabs.player.opened_chest = "";
    this.game_state.prefabs.items.set_put_type("equip");
    
    var game_state, chest, name, usr_id, d, n, tkc, is_empty_item;
    
    game_state = this.game_state;
    chest = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.properties.items = this.stats.items;
    this.save.properties.opened_frame = this.opened_frame;
    this.save.properties.closed_frame = this.closed_frame;
    this.save.properties.taken = this.save_taken();
    if (this.case_id > -1) {
        tkc = this.steal_check_taken();
        if (tkc) {
            this.steal_add_taken();
        } else {
            this.steal_rollback();
        }
    }
    
    this.save.action = "CLOSE";
    
    console.log(this.save.properties.stype);
    
    if (this.save.properties.stype === "shadow") {
        console.log("Shadow name: " + this.name);
        if (this.name === 'bag') {
            game_state.prefabs.player.stats.bag = this.stats.items;
            game_state.prefabs.player.save.properties.bag = this.stats.items;
        }
        game_state.prefabs.player.shadow = {};
        game_state.prefabs.chestitems.kill_stats();
        chest.destroy();
    } else {
        console.log(chest.obj_id + "|" + chest.stats.items + "|" + chest.name.substr(0, 5));
        is_empty_item = (chest.obj_id === 0 && chest.stats.items === '' && chest.name.substr(0, 5) === 'item_');
        console.log("Empty item: " + is_empty_item);
        if (!is_empty_item) {
            console.log("Chest is not empty item");
        
            if (this.stat !== "open" && chest.is_opened) {
                d = new Date();
                n = d.getTime();
                this.save.properties.time = n;

                console.log("CLOSE CHEST");
                console.log(this.save);

                $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
                    .done(function (data) {
                        console.log("Chest close success");
                        console.log(data);
                        var resp, obj_id;
                        resp = JSON.parse(data);
                        obj_id = resp.obj.obj_id;
                        console.log("ObjID: " + obj_id);

                        chest.set_obj_id(obj_id);

                        game_state.prefabs.chestitems.kill_stats();

                        console.log("Chest is closed");
                        chest.game_state.hud.alert.show_alert("Zavřena!");
                    })
                    .fail(function (data) {
                        console.log("Chest close error");
                        console.log(data);
                    });

                console.log("save chest close");

            } else {
                game_state.prefabs.chestitems.kill_stats();
            }
        } else {
            console.log("Chest close is empty item");
            game_state.prefabs.chestitems.kill_stats();
            chest.game_state.hud.alert.show_alert("Zavřena!");
        }
        
        if (typeof(this.krlz_sprite) !== 'undefined') {
            this.krlz_sprite.kill();
            game_state.prefabs.player.key_close();
        }
    }
        
    this.is_opened = false;
    
};

Mst.Chest.prototype.option_ok = function () {
    "use strict";
    
    console.log("Chest option ok - close: ok");
    this.game_state.prefabs.player.opened_chest = "";
};

Mst.Chest.prototype.option_no = function () {
    "use strict";
    
    console.log("Chest option no");
    
    if (this.mw_context === 'investigate') {
        for (var id in this.cases) {
            if (this.cases[id].PCID === -1) {
                this.cases[id].PCID = -2;
                
                console.log(this.cases[id]);
                
                break;
            }
        }
    }
};

Mst.Chest.prototype.option_investigate = function () {
    "use strict";
    
    console.log("Chest option investigate");
    this.game_state.prefabs.player.add_case(this);
};

Mst.Chest.prototype.option_steal = function () {
    "use strict";
    
    console.log("Chest option steal");
    console.log("Owner: " + this.owner);
    
    this.game_state.prefabs.player.add_sin(8);
    console.log("Player sin: " + this.game_state.prefabs.player.stats.sin);
    
    var key = this.game_state.playerOfUsrID(this.owner);
    var owner = this.game_state.prefabs[key];
    console.log(owner);
    if (typeof (owner) !== 'undefined') {
        owner.ren_sprite.show_dialogue("To je moje!");
        this.game_state.prefabs.player.opened_chest = "";
    } else {
        if (this.game_state.prefabs.player.stats.sin > 200) {
            this.game_state.prefabs.player.opened_chest = this.name;
            this.steal();
        } else {
            this.game_state.hud.alert.show_alert("To se nedělá!");
            this.game_state.prefabs.player.opened_chest = "";
        }
    }
};

Mst.Chest.prototype.add_case_pcid = function (id, pcid) {
    "use strict";
    
    this.cases[id].PCID = pcid;
    this.save.properties.cases = this.cases;    
};

Mst.Chest.prototype.test_new_cases = function () {
    "use strict";
    
    var b = false;
    
    for (var id in this.cases) {
        if (this.cases[id].PCID === -1 || typeof (this.cases[id].PCID) === 'undefined') {
            b = true;
            break;
        }
    }
    
    return b;
};

Mst.Chest.prototype.steal = function () {
    "use strict";
    
    console.log("Chest steal");
    
    var player = this.game_state.prefabs.player;
    var map = this.game_state.root_data.map_int;
    this.case_id = this.cases.length;
    
    var new_case = {
        "CID": this.case_id,
        "ID": this.obj_id,
        "PCID": -1,
        "Owner": this.owner,
        "Culprit": player.usr_id,
        "C14": player.test_badge("14"),
        "C15": player.test_badge("15"),
        "CpID": -1,
        "M": map,
        "type":"stolen",
        "gtms": player.gtime.ms,
        "gweek": player.stats.gtimeweek,
        "taken": "",
        "witness": {},
        "ftprints": []
    };
    var players = this.game_state.get_players();
    var NPCs = this.game_state.get_NPCs();
    new_case.witness[map] = {
        "m": map,
        "p": players,
        "n": NPCs,
        "id": 1
    };
    new_case.witness.lid = 1;
    
    var ftprint = {
        m: map,
        x: Math.round((player.x - 8 )/16)*16 + 8,
        y: Math.round((player.y + 8 )/16)*16 - 8
    };
    new_case.ftprints.push(ftprint);
    
    this.cases.push(new_case);
    
    var wt = 0;
    if (players.length > 0 || NPCs.length > 0) {
        wt = 1; 
    }
    
    var new_culprit = {
        "CID": this.case_id,
        "ID": this.obj_id,
        "M": map,
        "gweek": player.stats.gtimeweek,
        "wt": wt,
        "count": 0
    }
    
    this.culprit_id = player.add_culprit(new_culprit);
    this.cases[this.case_id].CpID = this.culprit_id;
    
    
    this.open_chest_fin(player, this);
    
    console.log("Stolen");
    console.log(this);
    console.log(player);
};

Mst.Chest.prototype.steal_rollback = function () {
    "use strict";
    
    var id = this.case_id;
    var culprit_id = this.cases[id].CpID;
    
    this.case_id = -1;
    this.cases.splice(id, 1);
    this.save.properties.cases = this.cases;
    this.culprit_id = -1;
    this.game_state.prefabs.player.rollback_culprit(culprit_id);
};

Mst.Chest.prototype.steal_add_witness = function (cid) {
    "use strict";

    var map = this.game_state.root_data.map_int;
    
    if (typeof (this.cases[cid].witness[map]) === 'undefined') {
        var players = this.game_state.get_players();
        var NPCs = this.game_state.get_NPCs();
        
        if (players.length > 0 || NPCs.length > 0) {
            var lid = parseInt(this.cases[cid].witness.lid);
            lid++;
            this.cases[cid].witness.lid = lid;
            
            this.cases[cid].witness[map] = {
                "m": map,
                "p": players,
                "n": NPCs,
                "id": lid
            };
        }
    }
};

Mst.Chest.prototype.steal_add_ftprints = function (cid) {
    "use strict";

    var ftprint = {
        m: this.game_state.root_data.map_int,
        x: Math.round((this.game_state.prefabs.player.x - 8 )/16)*16 + 8,
        y: Math.round((this.game_state.prefabs.player.y + 8 )/16)*16 - 8
    };
    var ftprints = [];
    
    //console.log(typeof (this.cases[cid].ftprints));
    if (typeof  (this.cases[cid].ftprints) === 'object') {
        for (var key in this.cases[cid].ftprints) {
            ftprints[key] = this.cases[cid].ftprints[key];
        }
    } else {
        ftprints = this.cases[cid].ftprints;
    }
    
//    console.log(cid);
//    console.log(this.cases);
//    console.log(this.cases[cid]);
//    console.log(ftprints);
    
    ftprints.push(ftprint);
    this.cases[cid].ftprints = ftprints;
};

Mst.Chest.prototype.steal_add_taken = function () {
    "use strict";
    if (this.case_id > -1) {
        this.cases[this.case_id].taken = this.save.properties.taken;
        console.log(this.cases);
        this.save.properties.cases = this.cases;
    }
};

Mst.Chest.prototype.steal_check_taken = function () {
    "use strict";
    
    var taken_a = [];
    var bt = false;
    
    console.log("TAKEN check");
    console.log(this.taken);
    
    for (var key in this.taken) {
        if (this.taken[key] < 0) {
            bt = true;
        }
    }
    
    return bt;
};

Mst.Chest.prototype.save_taken = function () {
    "use strict";
    
    var taken_a = [];
    var taken = "";
    
    console.log("TAKEN");
    console.log(this.taken);
    
    for (var key in this.taken) {
        taken = key + "?" + this.taken[key];
        taken_a.push(taken);        
    }
    
    console.log(this.steal_check_taken());
    
    return "TAKEN-UID:" + this.game_state.root_data.usr_id + "|" + taken_a.join("|");
};

Mst.Chest.prototype.save_chest = function () {
    "use strict";
        
    var game_state, chest, name, usr_id, d, n;
    game_state = this.game_state;
    chest = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.properties.items = this.stats.items;
    this.save.properties.opened_frame = this.opened_frame;
    this.save.properties.closed_frame = this.closed_frame;
    this.save.properties.taken = this.save_taken();
    this.save.action = "CLOSE";

    if (this.stat !== "open") {
        d = new Date();
        n = d.getTime();
        this.save.properties.time = n;

        console.log("SAVE CHEST");
        console.log(this.save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
            .done(function (data) {
                console.log("Chest save success");
                console.log(data);
                var resp, obj_id;
                resp = JSON.parse(data);
                obj_id = resp.obj.obj_id;
                console.log("ObjID: " + obj_id);

                chest.set_obj_id(obj_id);
            
                console.log("Chest is saved");
            })
            .fail(function (data) {
                console.log("Chest save error");
                console.log(data);
            });

        console.log("save chest save");
        
    }
    
    this.is_opened = false;
    
};

Mst.Chest.prototype.get_chest_core = function (chest) {
    "use strict";
    
    const player = this.game_state.prefabs.player;
    const chest_name = chest.name;
    const closed_frame = chest.closed_frame;

    chest.save.properties.taken = chest.save_taken();
    if (this.case_id > -1) {
        const tkc = chest.steal_check_taken();
        if (tkc) {
            chest.steal_add_taken();
        } else {
            chest.steal_rollback();
        }
    }

    chest.kill();
    player.opened_chest = "";

    if (typeof(chest.plant) !== 'undefined') {
        chest.plant.kill();
    }
    
    if (typeof(chest.krlz_sprite) !== 'undefined') {
        chest.krlz_sprite.kill();
        player.key_close();
    }

    if (this.closed_frame === 237) {
        this.game_state.groups.NPCs.forEachAlive(function (NPC) {
            if (NPC.stype === "tlustocerv") {
                console.log("Tlustocerv salat not run");
                NPC.condi(false);
            }
        }, this);
    }

    this.game_state.setGridXY(chest.tilex, chest.tiley, 0);

    const key = this.game_state.keyOfName(chest_name);

    if (key !== "") {
        this.game_state.save.objects.splice(key, 1);
    }

    console.log("Get chest objects:");
    console.log(this.game_state.save.objects);

    console.log(chest.cases);
    if (chest.cases.length > 0) {
        chest.closed_frame = "199";
        chest.opened_frame = "199";
        chest.save.properties.closed_frame = "199";
        chest.save.properties.opened_frame = "199";

        chest.save.properties.is_takeable = false;
        chest.save.properties.cases = chest.cases;

        const d = new Date();
        const n = d.getTime();
        chest.save.properties.time = n;
        chest.save.properties.ctime = n;

        const usr_id = player.usr_id;
        chest.save.action = "CLOSE";

        console.log("CLOSE Case 199 CHEST");
        console.log(this.save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
            .done(function (data) {
                console.log("Chest get stolen success");
                console.log(data);
            })
            .fail(function (data) {
                console.log("Chest get stolen error");
                console.log(data);
            });

        console.log("save chest get stolen");
    } else  { 
        if (closed_frame === 22) {
            chest.save.properties.closed_frame = "126";
            chest.save.properties.opened_frame = "126";

            chest.save.properties.is_takeable = true;

            const d = new Date();
            const n = d.getTime();
            chest.save.properties.time = n;
            chest.save.properties.ctime = n;

            const usr_id = player.usr_id;
            chest.save.action = "CLOSE";

            console.log("CLOSE 126 CHEST");
            console.log(this.save);

            $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
                .done(function (data) {
                    console.log("Chest get stump success");
                    console.log(data);
                })
                .fail(function (data) {
                    console.log("Chest get stump error");
                    console.log(data);
                });

            console.log("save chest get stump");
        } else {
            if (this.obj_id !== 0) {
                const usr_id = player.usr_id;
                chest.save.action = "GET";

                const d = new Date();
                const n = d.getTime();

                $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
                    .done(function (data) {
                        console.log("Chest get success");
                        console.log(data);
                    })
                    .fail(function (data) {
                        console.log("Chest get error");
                        console.log(data);
                    });

                console.log("save chest get");
            }
        }
    } 
};

Mst.Chest.prototype.get_chest = function (chest) {
    "use strict";
    
    let success = true;
    
    const player = this.game_state.prefabs.player;
    const chest_name = chest.name;
    
    chest.game_state.prefabs.items.set_put_type("equip");
    
    console.log("GET CHEST - is takeble: " + chest.is_takeable + " Poch: " + player.opened_chest + " Chn: " + chest_name);
    
    if (player.opened_chest === chest_name) {
        if (chest.is_takeable) {
            if (chest.stat !== "open") {
                if (chest.stats.items === "") {
                    console.log(chest);

                    const closed_frame = chest.closed_frame;
                    
                    switch(closed_frame) {
                        case 3: //věci 

                        break;
                        case 7: //dřevo
                            player.add_item(32, 1); //prkno
                        break;
                        case 19: //ohrada
                            player.add_item(24, 1); //hůl
                        break;
                        case 20: //krovi
                            player.add_item(123, 1); //trava
                        break;
                        case 21: //kamen
                            player.add_item(21, 1);
                            
                            var rnd_test = Math.floor(Math.random() * 100);
                            if (rnd_test > 70) {
                                player.add_item(135, 1); // Stínka
                                
                                console.log("RND take chest: 135 - stinka");
                                this.game_state.hud.alert.show_alert("Nález! " + this.game_state.core_data.items[135].name + "!");
                                player.work_rout("forager", "exploration", 1, 1, 2, 3); // stress, stand_exp, skill_exp, abil_p
                            } 
                        break;
                        case 22: //parez
                            player.add_item(31, 1); //spalek
                        break;
                        case 127: //Měď. ruda
                            player.add_item(47, 1); //Měď. ruda
                        break;
                        case 128: //Cín. ruda
                            player.add_item(48, 1); //Cín. ruda
                        break;
                        case 129: //Žel. ruda
                            player.add_item(97, 1); //Žel. ruda
                        break;
                        case 130: //Keř malý
                            player.add_item(43, 1); //Větev
                        break;
                        case 131: //Strom malý
                            player.add_item(30, 1); //Kmen
                        break;
                        case 213: //bariera II
                            player.add_item(43, 1); //vetev
                        break;
                        case 227: //pole
                            player.add_item(238, 1); //hlina
                        break;
                        case 229: //pole zal.
                            player.add_item(238, 1); //hlina
                        break;
                        default: //ostatní bedny
                            player.add_item(closed_frame, 1);
                        break;
                    }

                    if (chest.sskill !== "") {
                        player.work_rout(chest.sskill, "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                    }
                    
                    this.get_chest_core(chest);
                } else {
                    success = false;
                    console.log("Chest is not empty!");
                }
            } else {
                success = false;
                console.log("Chest is open by any other!");
            }
        } else {
            success = false;
            console.log("Chest is not takeble!");
        }
    } else {
        success = false;
        console.log("Chest is not open!");
    }
    
    return success;
};

Mst.Chest.prototype.rnd_take = function (frame, skill) {
    "use strict";
    var player, rtake, rtake_sp, iframe, level, rnd_core, rnd_test, test_ok, exp, max;
    
    console.log("RND take CHEST!!! Level: " + this.level);
    
    player = this.game_state.prefabs.player;
    rtake = this.game_state.core_data.items[frame].properties.rtake;
    
    if (typeof (rtake) === 'undefined') {
        rtake = [];
    }
    
    if (this.level > 0) {
        if (this.level < rtake.length) {
            max = this.level + 1;
        } else {
            max = rtake.length;
        }
    } else {
        max = rtake.length;
    }
    
    test_ok = false;
    
    for (var i = 0; i < max; i++) {
        rtake_sp = rtake[i].split("_");
        iframe = parseInt(rtake_sp[0]);
        level = parseInt(rtake_sp[1]);
        
        rnd_core = 20;
        if (level > 0) {
            rnd_core = Math.max(20, 50 - player.level(skill));
        }
        
        rnd_test = Math.floor(Math.random() * rnd_core);
        console.log("RND test " + rnd_test);
        if (rnd_test < 3 && player.level(skill) > level) {
            player.add_item(iframe, 1);
            console.log("RND take chest: " + iframe);
            this.game_state.hud.alert.show_alert("Nález! " + this.game_state.core_data.items[iframe].name + "!");
            exp = (level + 1)*2;
            player.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
            test_ok = true;
            break;
        }
    }
    
    console.log("RND take test1: " + rnd_test);
    
    rnd_test = Math.floor(Math.random() * 20);

    console.log("RND take test2: " + rnd_test);
    
    if (!test_ok && rnd_test < 6 && rtake.length > 0) {
        rnd_test = Math.floor(Math.random() * rtake.length);
        rtake_sp = rtake[rnd_test].split("_");
        iframe = parseInt(rtake_sp[0]);
        level = parseInt(rtake_sp[1]);
        
        if (player.level(skill) > level) {
            player.add_item(iframe, 1);
            console.log("RND take sword next: " + iframe);
            this.game_state.hud.alert.show_alert("Nález! " + this.game_state.core_data.items[iframe].name + "!");
            exp = (level + 1)*2;
            player.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
        }
        
    }
};

Mst.Chest.prototype.add_item = function (item_frame, quantity) {
    "use strict";
    var success = true;
    console.log("Chest add item: " + item_frame + "x" + quantity + " Opened: " + this.is_opened);
    
    if (this.stat !== "open") {
        if (this.is_opened) {
            this.game_state.prefabs.chestitems.add_item(item_frame, quantity); //chestitems
        }
    } else {
        success = false;
    }
    
    return success;
};

Mst.Chest.prototype.subtract_item = function (item_index, quantity) {
    "use strict";
    var item;
    
    item = this.game_state.prefabs.chestitems.subtract_item(item_index, quantity);
};

Mst.Chest.prototype.change_taken = function (frame, quantity) {
    "use strict";
    
    if (typeof (this.taken[frame]) === 'undefined') {
        this.taken[frame] = quantity;
    } else {
        this.taken[frame] += quantity;
    }    
    
    console.log("TAKEN CHNG");
    console.log(this.taken);
};

Mst.Chest.prototype.subtract_all = function (item_index) {
    "use strict";
    
    this.game_state.prefabs.chestitems.subtract_all(item_index);
};

Mst.Chest.prototype.take_all = function () {
    "use strict";
    var content;
    
    content = this.game_state.prefabs.chestitems.in_chest();
    
    if (content.length > 0) {
        for (var i = content.length - 1; i > -1; i--) {
            this.subtract_all(i);            
        }
    }
    
    return content;
};

Mst.Chest.prototype.change_frame = function (frame) {
    "use strict";
    
    if (typeof (frame) !== 'undefined') {
        this.frame = frame;
        this.closed_frame = frame;
        this.opened_frame = frame;
        this.updated = true;
    }
};

Mst.Chest.prototype.in_chest_ord = function () {
    "use strict";
    var content;
    
    content = this.game_state.prefabs.chestitems.in_chest_ord();
    
    return content;
};

Mst.Chest.prototype.chest_compare = function (a, b) {
    "use strict";
    var output;
    output = true;
    
    console.log(a); console.log(b);
    
    if (typeof (a) !== 'undefined' || typeof (b) !== 'undefined') {
          if (a.length == b.length) {
            for (var i = 0; i < a.length; i++) {
                if (a[i].f == b[i].f) {
                    output = (a[i].q == b[i].q) && output;
                } else { 
                    output = false;
                }
            } 
        } else {
            output = false;
        }
    } else {
        output = false;
    }
    
    console.log(output);
    return output;
};

Mst.Chest.prototype.test_item = function (item_frame, quantity) {
    "use strict";
    var index;
    
    console.log("Test chest item frame: " + item_frame);
    
    index = this.game_state.prefabs.chestitems.test_item(item_frame, quantity);
    console.log(index);
    console.log("Is opened? " + this.is_opened);
    return index;
};

Mst.Chest.prototype.index_item = function (item_frame) {
    "use strict";
    var item;
    
    item = this.game_state.prefabs.chestitems.index_by_frame(item_frame);
    return item;
};


Mst.Chest.prototype.load_chest = function (properties, stat) {
    "use strict";
    
    this.stats.items = properties.items;
    this.save.properties.items = this.stats.items;
    
    this.stat = stat;
};

Mst.Chest.prototype.set_stat = function (stat) {
    "use strict";
    
    this.stat = stat;
};

Mst.Chest.prototype.set_owner = function (owner) {
    "use strict";
    
    this.owner = owner;
    this.save.properties.owner = owner;
};

Mst.Chest.prototype.set_obj_id = function (obj_id) {
    "use strict";
    
    this.obj_id = parseInt(obj_id);
    this.save.obj_id = this.obj_id;
};

Mst.Chest.prototype.collide_test = function () {
    "use strict";
    var test = false;
    this.collide_t = false;

    //console.log("Collision dist: ");
    
//    this.game_state.layers.collision.layer.data.forEach(function(tile) {
//        console.log(tile);
//    });
    
    //console.log(this.game_state.layers.collision.layer.data);
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_tile(), null, this);
    console.log(this.collide_t);
    return this.collide_t;
    
};

Mst.Chest.prototype.collide_tile = function () {
    "use strict";

    this.collide_t = true;
    console.log("Collision dist: " );
};