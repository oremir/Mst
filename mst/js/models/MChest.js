class MChest {
    constructor(cChest, vChest, name, position, properties) {
        this.vChest = vChest;
        this.cChest = cChest;
        this.mGame = cChest.mGame;
        this.vGame = cChest.vGame;
        this.interface = new MCInterface(this.vGame, name, position, properties);
        this.items = new MCItems(this, this.mGame, this.interface.stats);
        this.cases = new MCCases(this, this.mGame, this.interface.cases);
        
        this.name = name;

        this.stats = this.interface.stats;
        this.closed_frame = this.interface.closed_frame;
        this.opened_frame = this.interface.opened_frame;
        this.save = this.interface.save;
        this.set_obj_id(this.interface.obj_id);
        this.is_takeable = this.interface.is_takeable;
        this.sskill = this.interface.sskill;
        this.owner = this.interface.owner;
        this.level = this.interface.level;

        
        this.stat = "";
        this.is_opened = false;

        if (this.cases.stolen) {
            if (this.owner === this.vGame.prefabs.player.mPlayer.usr_id) {
                this.show_bubble(3);
            } else {
                if (this.closed_frame === 199) this.vChest.kill();
            }
        }

        this.time = this.interface.time;
        this.ctime = this.interface.ctime;
        this.s1type = this.interface.s1type;
        this.s2type = this.interface.s2type;
    }
    
    init() {
        console.log("S1TYPE closed frame: " + this.closed_frame);
        if (this.closed_frame === 131 || this.closed_frame === 132) {
            this.s1type = "tree";
            this.save.properties.s1type = "tree";
        }
        
        //if ((n - this.ctime)/100000 > 1) {
        if ((this.time - this.ctime)/100000 > 846) {
            switch (this.closed_frame) {
                case 126: { // sazenice
                    const rnd_test = Math.floor(Math.random() * 100);
                    let r_frame = 131; // Strom malý
                    if (rnd_test > 50) r_frame = 132; // Keř
                    this.s1type = "tree";
                    this.save.properties.s1type = "tree";
                    this.vChest.change_frame(r_frame);
                    this.save_chest();
                    //this.time = n;
                    this.ctime = this.time;
                break;
                }
                case 130: { // Keř malý
                    const rnd_test = Math.floor(Math.random() * 100);
                    let r_frame = 133; // Keř s bobulí
                    if (rnd_test > 50) r_frame = 132; // Keř
                    this.vChest.change_frame(r_frame);
                    //this.time = n;
                    this.ctime = this.time;
                break;
                }
                case 132: // Keř malý
                    this.vChest.change_frame(133); // Keř s bobulí
                    //this.time = n;
                    this.ctime = this.time;
                break;
                case 158: // Kvetinac zem. zal.
                    if (this.s1type !== "plant") {
                        if (this.stats.items.length > 6) {
                            this.vChest.change_frame(140); // Kvetinac saz.
                            //this.time = n;
                            this.ctime = this.time;
                        }
                    } else {
                        this.vChest.change_frame(139); // Kvetinac zem.
                        //this.time = n;
                        this.ctime = this.time;
                    }
                break;
                case 159: // Kvetinac saz. zal.
                    this.vChest.change_frame(141); // Kvetinac rosl.
                    //this.time = n;
                    this.ctime = this.time;
                break;
                case 160: { // Kvetinac rost. zal.
                    this.vChest.change_frame(139); // Kvetinac zem.
                    const plant_a1 = this.stats.items.split("_");
                    console.log(plant_a1);
                    const plant_frame = plant_a1[1].split("-")[0];
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
                    this.ctime = this.time;
                break;
                }
                case 229: // pole zem. zal.
                    this.vChest.change_frame(227); // pole zem.
                    //this.time = n;
                    this.ctime = this.time;
                break;
                case 230: // pole sem. zal.
                    this.vChest.change_frame(231); // pole saz.
                    //this.time = n;
                    this.ctime = this.time;
                break;
                case 233: // pole saz. zal.
                    this.vChest.change_frame(232); // pole rosl.
                    //this.time = n;
                    this.ctime = this.time;
                break;
                case 234: // pole rost. zal.
                    this.vChest.change_frame(227); // pole zem.
                    const plant_a1 = this.stats.items.split("_");
                    console.log(plant_a1);
                    const plant_frame = plant_a1[0].split("-")[0];
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
                    this.ctime = this.time;
                break;
            }
        }
        
        if ((this.time - this.ctime)/100000 > 423) {
            switch (this.closed_frame) {
                case 126: { // sazenice
                    const rnd_test = Math.floor(Math.random() * 100);
                    let r_frame = 131; // Strom malý
                    if (rnd_test > 50) r_frame = 130; // Keř malý
                    this.vChest.change_frame(r_frame);
                    this.save_chest();
                    //this.time = n;
                    this.ctime = this.time;
                break;
                }
                case 130: { // Keř malý
                    const rnd_test = Math.floor(Math.random() * 100);
                    let r_frame = 133; // Keř s bobulí
                    if (rnd_test > 50) r_frame = 132; // Keř
                    this.vChest.change_frame(r_frame);
                    //this.time = n;
                    this.ctime = this.time;
                break;
                }
                case 132: // Keř malý
                    this.vChest.change_frame(133); // Keř s bobulí
                    //this.time = n;
                    this.ctime = this.time;
                break;
            }
        }
        
        if ((this.time - this.ctime)/100000 > 4) {
            switch (this.closed_frame) {
                case 166: // kos
                    //this.time = n;
                    this.ctime = this.time;
                break;
            }
        }
    }

    set_stat(stat) {
        "use strict";    
        this.stat = stat;
    }

    test_stat() {
        const d = new Date();
        const n = d.getTime();
            
        console.log("Player - Chest open time > 20: " + (n - this.time)/100000);
        console.log(n + " " + this.time + " " + this.ctime);
        if (this.stat === 'open' && (n - this.time)/100000 > 20) this.set_stat("ok");
        console.log(this.stat);
        return this.stat;
    }

    csave(chest, action) {
        this.save.properties.items = chest.stats.items;
        this.save.properties.opened_frame = chest.opened_frame;
        this.save.properties.closed_frame = chest.closed_frame;
        this.save.properties.cases = chest.cases.save_cases();
        this.save.properties.taken = chest.cases.save_taken();
        this.save.action = action;
        if (action === 'OPEN') this.cases.taken = {};
    }

    updated_save() {
        console.log(this.name);
        console.log(this.save);
        console.log(JSON.stringify(this.save));
    
        console.log("OF: " + this.opened_frame + " CF: " + this.closed_frame + " It: " + this.stats.items);
    
        this.save.properties.items = this.stats.items;
        this.save.properties.opened_frame = this.opened_frame;
        this.save.properties.closed_frame = this.closed_frame;
        console.log(this.frame);
    
        const key = this.mGame.keyOfName(this.name);
        if (key) {
            if (this.stats.items === "" && this.closed_frame === 3) {
                this.mGame.save.objects.splice(key, 1);
            } else {
                this.mGame.save.objects[key] = this.save;
            }
        } else {
            if (!(this.stats.items === "" && this.closed_frame === 3)) {
                this.mGame.save.objects.push(this.save);
            }
        }
    }

    save_chest() {
        "use strict";
        const game_state = this.vGame;
        const chest = this;
        const usr_id = game_state.prefabs.player.mPlayer.usr_id;
    
        this.csave(this, "CLOSE");
    
        if (this.stat !== "open") {
            const d = new Date();
            const n = d.getTime();
            this.save.properties.time = n;
    
            console.log("SAVE CHEST");
            console.log(this.save);
    
            $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
                .done(function (data) {
                    console.log("Chest save success");
                    console.log(data);
                    const resp = JSON.parse(data);
                    const obj_id = resp.obj.obj_id;
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
    }

    close_chest() {
        "use strict";
        
        const game_state = this.vGame;
        const player = game_state.prefabs.player;
        const chest = this;
        const usr_id = player.mPlayer.usr_id;
        
        this.vChest.close_frame();
        player.cPlayer.chest.close();
        game_state.prefabs.items.set_put_type("equip");
    
        this.items.unpacked = this.items.unpack(this.stats.items);
    
        this.csave(this, "CLOSE");
        
        this.save.properties.taken = this.cases.save_taken();
        this.cases.add_taken(this.save.properties.taken);
        
        console.log(this.save.properties.stype);
        
        if (this.save.properties.stype === "shadow") {
            console.log("Shadow name: " + this.name);
            if (this.name === 'bag') {
                player.stats.bag = this.stats.items;
                player.mPlayer.save.properties.bag = this.stats.items;
            }
            player.shadow = {};
            game_state.prefabs.chestitems.kill_stats();
            this.vChest.destroy();
        } else {
            console.log(chest.obj_id + "|" + chest.stats.items + "|" + chest.name.substr(0, 5));
            const is_empty_item = (chest.obj_id === 0 && chest.stats.items === '' && chest.name.substr(0, 5) === 'item_');
            console.log("Empty item: " + is_empty_item);
            if (!is_empty_item) {
                console.log("Chest is not empty item");
            
                if (this.stat !== "open" && this.is_opened) {
                    const d = new Date();
                    const n = d.getTime();
                    this.save.properties.time = n;
    
                    console.log("CLOSE CHEST");
                    console.log(this.save);
    
                    $.post("object.php?time=" + n + "&uid=" + usr_id, this.save)
                        .done(function (data) {
                            console.log("Chest close success");
                            console.log(data);
                            const resp = JSON.parse(data);
                            const obj_id = resp.obj.obj_id;
                            console.log("ObjID: " + obj_id);
    
                            chest.set_obj_id(obj_id);
    
                            game_state.prefabs.chestitems.kill_stats();
    
                            console.log("Chest is closed");
                            game_state.cGame.hud.alerts.show("Zavřena!");
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
                game_state.cGame.hud.alerts.show("Zavřena!");
            }
            
            if (this.vChest.krlz_sprite) {
                this.vChest.krlz_sprite.kill();
                game_state.prefabs.player.cPlayer.key_close();
            }
        }
            
        this.is_opened = false;
    }

    get_chest_core(chest) {
        "use strict";
        
        const cPlayer = this.vGame.prefabs.player.cPlayer;
        const usr_id = this.vGame.prefabs.player.mPlayer.usr_id;
        const chest_name = chest.name;
        const closed_frame = chest.mChest.closed_frame;
    
        chest.mChest.save.properties.taken = chest.mChest.cases.save_taken();
        chest.mChest.cases.add_taken(chest.mChest.save.properties.taken);
    
        chest.kill();
        cPlayer.chest.close();
    
        if (chest.plant) {
            chest.plant.kill();
        }
        
        if (chest.krlz_sprite) {
            chest.krlz_sprite.kill();
            cPlayer.key_close();
        }
    
        if (chest.mChest.closed_frame === 237) {
            this.mGame.groups.NPCs.forEachAlive(function (NPC) {
                if (NPC.stype === "tlustocerv") {
                    console.log("Tlustocerv salat not run");
                    NPC.condi(false);
                }
            }, chest);
        }
    
        this.vGame.setGridXY(chest.tilex, chest.tiley, 0);
    
        const key = this.mGame.keyOfName(chest_name);
        if (key) this.mGame.save.objects.splice(key, 1);
    
        console.log("Get chest objects:");
        console.log(this.mGame.save.objects);
    
        console.log(chest.cChest.cases);
        if (!chest.cChest.cases.is_empty) {
            chest.mChest.closed_frame = "199";
            chest.mChest.opened_frame = "199";
            chest.mChest.save.properties.closed_frame = "199";
            chest.mChest.save.properties.opened_frame = "199";
    
            chest.mChest.save.properties.is_takeable = false;
            chest.mChest.save.properties.cases = chest.cases;
    
            const d = new Date();
            const n = d.getTime();
            chest.mChest.save.properties.time = n;
            chest.mChest.save.properties.ctime = n;    
            chest.mChest.save.action = "CLOSE";
    
            console.log("CLOSE Case 199 CHEST");
            console.log(this.mChest.save);
    
            $.post("object.php?time=" + n + "&uid=" + usr_id, chest.mChest.save)
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
                chest.mChest.save.properties.closed_frame = "126";
                chest.mChest.save.properties.opened_frame = "126";
    
                chest.mChest.save.properties.is_takeable = true;
    
                const d = new Date();
                const n = d.getTime();
                chest.mChest.save.properties.time = n;
                chest.mChest.save.properties.ctime = n;
                chest.mChest.save.action = "CLOSE";
    
                console.log("CLOSE 126 CHEST");
                console.log(chest.mChest.save);
    
                $.post("object.php?time=" + n + "&uid=" + usr_id, chest.mChest.save)
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
                    chest.mChest.save.action = "GET";
    
                    const d = new Date();
                    const n = d.getTime();
    
                    $.post("object.php?time=" + n + "&uid=" + usr_id, chest.mChest.save)
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
    }

    open_chest(player, chest) {
        "use strict";
        
        let stat = "error";
        if (chest.obj_id === 0) {
            console.log("Chest open obj_id 0");
            chest.cChest.open_chest_fin(player, chest);
        } else {
            const usr_id = player.mPlayer.usr_id;
    
            this.csave(chest.mChest, "OPEN");
    
            const d = new Date();
            const n = d.getTime();
    
            console.log(chest.mChest.save);
    
            $.post("object.php?time=" + n + "&uid=" + usr_id, chest.mChest.save)
                .done(function (data) {
                    console.log("Chest open success");
                    console.log(data);
                    const resp = JSON.parse(data);
                    const properties = resp.obj.properties;
                    const stat = resp.stat;
                    console.log(properties.items);
    
                    chest.mChest.load_chest(properties, stat);
                    const nstat = chest.mChest.test_stat();
                    chest.mChest.set_stat(nstat);
    
                    if (chest.mChest.stat === 'open') {
                        console.log("Chest is open by other player");
                        chest.game_state.cGame.hud.alerts.show("Otevřel ji někdo jiný!");
    
                        chest.mChest.close_chest();
                    } else {
                        player.cPlayer.chest.open_fin(player, chest);
                    }
    
                    console.log("Is opened? " + chest.mChest.is_opened);
                })
                .fail(function (data) {
                    console.log("Chest open error");
                    console.log(data);
                });
    
            console.log("save chest open");
    
        }
    
        console.log("Is opened? " + chest.mChest.is_opened);
        
        return stat;
    }

    load_chest(properties, stat) {
        "use strict";
        this.stats.items = properties.items ? properties.items : "";
        this.save.properties.items = this.stats.items;
        this.items.unpacked = this.items.unpack(this.stats.items);
        
        this.set_stat(stat);
    }
    
    set_owner(owner) {
        "use strict";
        this.owner = owner;
        this.save.properties.owner = owner;
    }
    
    set_obj_id(obj_id) {
        "use strict";
        this.obj_id = parseInt(obj_id);
        this.vChest.obj_id = this.obj_id;
        this.save.obj_id = this.obj_id;
    }


}

class MCInterface {
    constructor(vGame, name, position, properties) {
        this.vGame = vGame;
        console.log("Items: " + properties.items);
        if (!properties.items) properties.items = "";

        this.stats = {
            items: properties.items
        };

        this.closed_frame = parseInt(properties.closed_frame) || 4;
        this.opened_frame = parseInt(properties.opened_frame) || 5;

        let obj_id = this.vGame.mGame.get_obj_id(name);
        if (!obj_id) {
            obj_id = 0;
            if (properties.obj_id) obj_id = parseInt(properties.obj_id);
        }
        this.obj_id = obj_id;
        
        this.save = {
            type: "chest",
            name: name,
            obj_id: this.obj_id,
            x: position.x - 8,
            y: position.y + 8,
            properties: properties,
            map_int: this.vGame.gdata.root.map_int
        };

        if (properties.is_takeable) {
            if (typeof(properties.is_takeable) === 'boolean') {
                this.is_takeable = properties.is_takeable;
            } else {
                this.is_takeable = (properties.is_takeable === 'true');
            }
        } else {
            this.is_takeable = true;
        }
        console.log("Chest " + name + " takable:" + this.is_takeable);
        
        this.sskill = "";
        if (properties.sskill) this.sskill = properties.sskill;
        
        this.owner = 0;
        if (properties.owner) this.owner = parseInt(properties.owner);
        
        this.level = 0;
        if (properties.level) this.level = parseInt(properties.level);
        
        this.cases = null;
        if (properties.cases) this.cases = properties.cases;

        const d = new Date();
        const n = d.getTime();
        this.time = n;
        if (properties.time) this.time = parseInt(properties.time);
        this.ctime = this.time;
        if (properties.ctime) this.ctime = parseInt(properties.ctime);
        
        if (properties.s1type) {
            this.s1type = properties.s1type;
        } else {
            this.s1type = "";
            this.save.properties.s1type = "";
        }
        
        if (properties.s2type) this.s2type = properties.s2type;
        
        console.log("Chest time diff: " + (this.time - this.ctime));
        console.log((this.time - this.ctime)/100000);
    }
}

class MCItems {
    constructor(mChest, mGame, stats) {
        this.mChest = mChest;
        this.mGame = mGame;
        this.stats = stats;
        this.core = stats.items;
        this.unpacked = this.unpack(stats.items);    
        console.log(this.unpacked);
    }

    unpack(items) {
        "use strict";
        const ret = {};
        if (items !== '') {
            const aitem = items.split("_");
            console.log(aitem);
            for (let id in aitem) {
                const ai = aitem[id].split("-");
                const key = parseInt(ai[0]);
                ret[key] = parseInt(ai[1]);
            }
        }
        return ret;
    }
    
    pack(uitem) {
        "use strict";
        const an = [];
        for (let key in uitem) {
            an.push(key + "-" + uitem[key]);
        }
        
        return an.join("_");
    }
    
    add_item_u(item_frame, quantity) {
        "use strict";
    
        console.log("Chest add item unpacked: " + item_frame + "x" + quantity + " Opened: " + this.is_opened);
        
        if (this.unpacked[item_frame]) {
            const q = parseInt(this.unpacked[item_frame]) + parseInt(quantity);
            this.unpacked[item_frame] = q;
        } else {
            const q = parseInt(quantity);
            this.unpacked[item_frame] = q;
        }
        
        this.stats.items = this.pack(this.unpacked);
        console.log("Item added: " + this.stats.items);
        console.log(this);
        if (this.mChest.obj_id !== 0) this.mChest.save_chest();
    }
    
    add(item_frame, quantity) {
        "use strict";
        console.log("Chest add item: " + item_frame + "x" + quantity + " Opened: " + this.is_opened);
        
        if (this.stat !== "open") {
            if (this.is_opened) {
                this.mGame.vGame.prefabs.chestitems.add_item(item_frame, quantity); //chestitems
                return true;
            }
        }
        return false;
    }
    
    subtract(item_index, quantity) {
        "use strict";
        this.mGame.vGame.prefabs.chestitems.subtract_item(item_index, quantity);
    }
    
    subtract_all(item_index) {
        "use strict";
        this.mGame.vGame.prefabs.chestitems.subtract_all(item_index);
    }
    
    take_all() {
        "use strict";
        const content = this.mGame.vGame.prefabs.chestitems.in_chest();
        
        if (content.length > 0) {
            for (var i = content.length - 1; i > -1; i--) {
                this.subtract_all(i);
            }
        }
        
        return content;
    }

    in_chest_ord() {
        "use strict";
        return this.mGame.vGame.prefabs.chestitems.in_chest_ord();
    }
    
    test(item_frame, quantity) {
        "use strict";
        console.log("Test chest item frame: " + item_frame);
        
        const index = this.mGame.vGame.prefabs.chestitems.test_item(item_frame, quantity);
        console.log(index);
        return index;
    }
    
    index(item_frame) {
        "use strict";
        return this.mGame.prefabs.chestitems.index_by_frame(item_frame);
    }
}

class MCCases {
    constructor(mChest, mGame, cases) {
        this.core = cases;
        this.stolen = false;
        this.case_id = -1;
        this.culprit_id = -1;
        this.mw_context = "";
        this.taken = {};
        this.player = mGame.vGame.prefabs.player;
        this.map = mGame.gdata.root.map_int;
        this.mGame = mGame;
        this.mChest = mChest;
        this.cChest = mChest.cChest;
        this.vChest = mChest.vChest;

        if (cases) {
            const ncases = [];
            if (typeof (cases) === 'object') {
                for (let key in cases) {
                    ncases[key] = this.core[key];
                }
                this.core = ncases;
            }
        } else {
            this.core = [];
        }
        this.stolen = false;
        if (!this.is_empty()) this.stolen = true;
        
        this.save = { cases: this.core };
    }

    is_empty() {
        return this.core.length < 1;
    }

    set_pcid(id, pcid) {
        "use strict";
        this.core[id].PCID = pcid;
        this.save.cases = this.core;
    }
    
    set_investigate() {
        "use strict";
        for (const ncase of this.core) {
            if (ncase.PCID === -1) {
                ncase.PCID = -2;
                
                console.log(ncase);
                break;
            }
        }
    }
    
    steal() {
        "use strict";
        
        console.log("Chest steal");
        
        const player = this.player;
        const map = this.map;
        this.case_id = this.core.length;
        
        const new_case = {
            "CID": this.case_id,
            "ID": this.mChest.obj_id,
            "PCID": -1,
            "Owner": this.mChest.owner,
            "Culprit": player.mPlayer.usr_id,
            "C14": player.mPlayer.stats.badges["14"],
            "C15": player.mPlayer.stats.badges["15"],
            "CpID": -1,
            "M": map,
            "type":"stolen",
            "gtms": player.mPlayer.gtime.ms,
            "gweek": player.stats.gtimeweek,
            "taken": "",
            "witness": {},
            "ftprints": []
        };
        const players = this.mGame.get_players();
        const NPCs = this.mGame.get_NPCs();
        new_case.witness[map] = {
            "m": map,
            "p": players,
            "n": NPCs,
            "id": 1
        };
        new_case.witness.lid = 1;
        
        const ftprint = {
            m: map,
            x: Math.round((player.x - 8 )/16)*16 + 8,
            y: Math.round((player.y + 8 )/16)*16 - 8
        };
        new_case.ftprints.push(ftprint);
        
        let wt = 0;
        if (players.length > 0 || NPCs.length > 0) wt = 1;
        
        const new_culprit = {
            "CID": this.case_id,
            "ID": this.obj_id,
            "M": map,
            "gweek": player.stats.gtimeweek,
            "wt": wt,
            "count": 0
        };
        
        this.culprit_id = player.cPlayer.cases.add_culprit(new_culprit);
        new_case.CpID = this.culprit_id;

        this.core.push(new_case);
        
        this.cChest.open_chest_fin(player, this.vChest);
        
        console.log("Stolen");
        console.log(this);
        console.log(player);
    }
    
    rollback() {
        "use strict";
        const id = this.case_id;
        const culprit_id = this.core[id].CpID;
        
        this.case_id = -1;
        this.core.splice(id, 1);
        this.save.cases = this.core;
        this.culprit_id = -1;
        this.player.cPlayer.cases.rollback_culprit(culprit_id);
    }
    
    add_witness(cid) {
        "use strict";
    
        const map = this.map;
        
        if (!this.core[cid].witness[map]) {
            const players = this.mGame.get_players();
            const NPCs = this.mGame.get_NPCs();
            
            if (players.length > 0 || NPCs.length > 0) {
                let lid = parseInt(this.core[cid].witness.lid);
                lid++;
                this.core[cid].witness.lid = lid;
                
                this.core[cid].witness[map] = {
                    "m": map,
                    "p": players,
                    "n": NPCs,
                    "id": lid
                };
            }
        }
    }
    
    add_ftprints(cid) {
        "use strict";
    
        const ftprint = {
            m: this.map,
            x: Math.round((this.player.x - 8 )/16)*16 + 8,
            y: Math.round((this.player.y + 8 )/16)*16 - 8
        };
        let ftprints = [];
        
        //console.log(typeof (this.cases[cid].ftprints));
        if (typeof (this.core[cid].ftprints) === 'object') {
            for (let key in this.core[cid].ftprints) {
                ftprints.push(this.core[cid].ftprints[key]);
            }
        } else {
            ftprints = this.core[cid].ftprints;
        }
        ftprints.push(ftprint);
        this.core[cid].ftprints = ftprints;
        this.save.cases = this.core;
    }
    
    add_taken(taken) {
        "use strict";
        if (this.case_id > -1) {
            if (this.check_taken()) {
                this.core[this.case_id].taken = taken;
                console.log(this.core);
                this.save.cases = this.core;
            } else {
                this.rollback();
            }
        }
    }
    
    check_taken() {
        "use strict";
        console.log("TAKEN check");
        console.log(this.taken);
        
        for (let key in this.taken) {
            if (this.taken[key] < 0) return true;
        }
        return false;
    }

    change_taken(frame, quantity) {
        "use strict";
        
        if (!this.taken[frame]) {
            this.taken[frame] = quantity;
        } else {
            this.taken[frame] += quantity;
        }    
        
        console.log("TAKEN CHNG");
        console.log(this.taken);
    }
    
    save_taken() {
        "use strict";
        
        const taken_a = [];
        let taken = "";
        
        console.log("TAKEN");
        console.log(this.taken);
        
        for (let key in this.taken) {
            taken = key + "?" + this.taken[key];
            taken_a.push(taken);        
        }
        
        console.log(this.check_taken());
        
        return "TAKEN-UID:" + this.mGame.gdata.root.usr_id + "|" + taken_a.join("|");
    }

    save_cases() {
        return this.save.cases;
    }
}