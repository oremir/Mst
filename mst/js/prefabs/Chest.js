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
        this.is_takeable = (properties.is_takeable === 'true');
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
        default:
            this.animations.stop();
        break;
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
    if (this.alive) {
        if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 22 && this.game_state.prefabs.player.opened_chest === this.name) {
            console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
            console.log("Chest is too far!");
            this.close_chest();
        }
        
        if (this.game_state.prefabs.sword.alive && this.game_state.prefabs.sword.cut) {
            if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.sword) < 19) {
                this.game_state.prefabs.sword.cut_chest(this);
            }
        }
    }
    
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
        
        console.log("Update2:");
        console.log(this.save);
        console.log(JSON.stringify(this.save));
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
                    }
                    
                    
                    
                    this.add_item(89, quantity); //popel
                    index = this.test_item(91, 1); //hrib
                    if (index > -1) {
                        this.subtract_item(index, 1);
                        index = this.test_item(81, 1); //voda
                        this.subtract_item(index, 1);
                        this.add_item(93, 1); //hrib. polevka
                        player.work_rout("cook", "dexterity", 1, 50, 40, 3); // stress, stand_exp, skill_exp, abil_p
                    }
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
            }
        }
        this.chest_loop = 0;
    }

};

Mst.Chest.prototype.open_chest = function (player, chest) {
    "use strict";
    var success = true;
    
    chest.frame = chest.opened_frame;

    if (chest.obj_id === 0) {
        chest.game_state.prefabs.chestitems.show_initial_stats();
        chest.game_state.prefabs.items.set_put_type("put");

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
                chest.game_state.prefabs.chestitems.show_initial_stats();
            
                console.log("Chest open time > 20: " + (n - chest.time)/100000);
                if (stat === 'open' && (n - chest.time)/100000 > 20) {
                    stat = "ok";
                    chest.set_stat(stat);
                }

                if (stat === 'open') {
                    console.log("Chest is open by other player");
                    chest.game_state.hud.alert.show_alert("Otevřel ji někdo jiný!");

                    chest.close_chest();
                    success = false;
                } else {
                    chest.game_state.prefabs.items.set_put_type("put");
                    
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
                            texture: "blank_image",
                            p_name: "kurolez",
                            unique_id: 0,
                            stype: "kurolez",
                            relations_allowed : "false",
                            region: 0,
                            o_type: "NPC"
                        });
                        
                        chest.krlz_sprite.touch_player(chest.krlz_sprite, player);

                    }

                    var nloop = chest.chest_loop;
                    var ltype = chest.chest_loop_frame;
                    chest.loops_done(nloop, ltype);
                }

                console.log("Is opened? " + chest.is_opened);
            })
            .fail(function (data) {
                console.log("Chest open error");
                console.log(data);

                success = false;
            });

        console.log("save chest open");

    }

    console.log("Is opened? " + chest.is_opened);
    
    return success;
};

Mst.Chest.prototype.close_chest = function () {
    "use strict";
    
    this.frame = this.closed_frame;
    this.game_state.prefabs.player.opened_chest = "";
    this.game_state.prefabs.items.set_put_type("equip");
    
    var game_state, chest, name, usr_id, d, n;
    game_state = this.game_state;
    chest = this;
    name = this.name;
    usr_id = game_state.prefabs.player.usr_id;
    this.save.properties.items = this.stats.items;
    this.save.properties.opened_frame = this.opened_frame;
    this.save.properties.closed_frame = this.closed_frame;
    this.save.action = "CLOSE";
    
    console.log(this.save.properties.stype);
    
    if (this.save.properties.stype === "shadow") {
        game_state.prefabs.player.stats.bag = this.stats.items;
        game_state.prefabs.player.save.properties.bag = this.stats.items;
        game_state.prefabs.player.shadow = {};
        game_state.prefabs.chestitems.kill_stats();
        chest.destroy();
    } else {
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
        
        if (typeof(this.krlz_sprite) !== 'undefined') {
            this.krlz_sprite.kill();
            game_state.prefabs.player.key_close();
        }
    }
        
    this.is_opened = false;
    
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

Mst.Chest.prototype.get_chest = function (chest) {
    "use strict";
    var chest_name, closed_frame, key, usr_id, d, n, success, player;
    success = true;
    
    player = this.game_state.prefabs.player;
    chest_name = chest.name;
    
    chest.game_state.prefabs.items.set_put_type("equip");
    
    console.log("GET CHEST - is takeble: " + chest.is_takeable);
    
    if (player.opened_chest === chest_name) {
        if (chest.is_takeable) {
            if (chest.stat !== "open") {
                if (chest.stats.items === "") {
                    console.log(chest);

                    closed_frame = chest.closed_frame;

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
                        default: //ostatní bedny
                            player.add_item(closed_frame, 1);
                        break;
                    }

                    if (chest.sskill !== "") {
                        player.work_rout(chest.sskill, "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    //this.obj_id = 0;
                    chest.kill();
                    player.opened_chest = "";

                    key = this.game_state.keyOfName(chest_name);

                    console.log("Get chest key:");
                    console.log(key);

                    if (key !== "") {
                        this.game_state.save.objects.splice(key, 1);
                    }
                    
                    console.log("Get chest objects:");
                    console.log(this.game_state.save.objects);
                    
                    if (closed_frame === 22) {
                        chest.save.properties.closed_frame = "126";
                        chest.save.properties.opened_frame = "126";
                        
                        d = new Date();
                        n = d.getTime();
                        chest.save.properties.time = n;
                        chest.save.properties.ctime = n;
                        
                        usr_id = player.usr_id;
                        chest.save.action = "CLOSE";

                        console.log("CLOSE 126 CHEST");
                        console.log(this.save);

                        $.post("object.php?time=" + n + "&uid=" + usr_id, chest.save)
                            .done(function (data) {
                                console.log("Chest close success");
                                console.log(data);
                            })
                            .fail(function (data) {
                                console.log("Chest close error");
                                console.log(data);
                            });

                        console.log("save chest close");
                    } else {
                        if (this.obj_id !== 0) {
                            usr_id = player.usr_id;
                            chest.save.action = "GET";

                            d = new Date();
                            n = d.getTime();

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
    
    if (typeof(chest.krlz_sprite) !== 'undefined') {
        chest.krlz_sprite.kill();
        this.game_state.prefabs.player.key_close();
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
    
    this.game_state.prefabs.chestitems.subtract_item(item_index, quantity);
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
    output = false;
    
    console.log(a); console.log(b);
    
    if (typeof (a) !== 'undefined' || typeof (b) !== 'undefined') {
          if (a.length == b.length) {
            for (var i = 0; i < a.length; i++) {
                if (a.f == b.f) {
                    output = (a.q == b.q);
                }
            } 
        } 
    }
    
 
    return output;
};

Mst.Chest.prototype.test_item = function (item_frame, quantity) {
    "use strict";
    var index;
    
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