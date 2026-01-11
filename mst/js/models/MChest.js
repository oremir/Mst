class MChest extends MPrefab {
    constructor(cChest, name, position, properties) {
        console.log(properties);
        super(cChest, name, position, properties);
        this.vChest = this.view;
        this.cChest = cChest;

        this.closed_frame = this.interface.closed_frame;
        this.opened_frame = this.interface.opened_frame;
        this._is_takeable = true;
        this.sskill = this.interface.sskill;
        this.owner = this.interface.owner;
        this.level = this.interface.level;
        this._tname = "chest";

        this.stat = "";
        this.is_opened = false;

        this.time = this.interface.time;
        this.ctime = this.interface.ctime;
        this.s1type = this.interface.s1type;
        this.s2type = this.interface.s2type;
    }

    _interface() {
        return new MCInterface(this, this.name, this.position, this.properties);
    }

    init(name, position) {
        super.init(name, position);

        this.save = this.interface.save;
        this.is_takeable = this.interface.is_takeable;
        this.tname = this.interface.tname;
        this.obj_id = this.interface.obj_id;
        this.identity.init(this.obj_id, "chest", this.view);
        this.items = new MCItems(this.interface.stats.items);
        this.cases = new MCCases(this, this.interface.cases);

        this.cChest.init();

        if (this.cases.stolen) {
            if (this.owner === Mst.usr_id) {
                this.show_bubble(3);
            } else {
                if (this.closed_frame === 199) this.vChest.kill();
            }
        }

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

    set is_takeable(is_takeable) {
        this._is_takeable = is_takeable;
        console.log(this);
        this.save.properties.is_takeable = is_takeable;
    }

    get is_takeable() {
        return this._is_takeable;
    }

    set tname(tn) {
        this._tname = tn;
        this.save.properties.tname = tn;
    }

    get tname() {
        return this._tname;
    }

    set_stat(stat) {
        this.stat = stat;
    }

    test_stat() {
        const n = Mst.time;

        console.log("Player - Chest open time > 20: " + (n - this.time)/100000);
        console.log(n + " " + this.time + " " + this.ctime);
        if (this.stat === 'open' && (n - this.time)/100000 > 20) this.set_stat("ok");
        console.log(this.stat);
        return this.stat;
    }

    csave(chest, action) {
        this.save.x = this.position.x - 8;
        this.save.y = this.position.y + 8;
        this.save.properties.items = chest.items.save();
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

        this.save.properties.items = this.items.save();
        this.save.properties.opened_frame = this.opened_frame;
        this.save.properties.closed_frame = this.closed_frame;
        console.log(this.frame);

        const key = Mst.mGame.keyOfName(this.name);
        if (key) {
            if (this.stats.items === "" && this.closed_frame === 3) {
                Mst.mGame.save.objects.splice(key, 1);
            } else {
                Mst.mGame.save.objects[key] = this.save;
            }
        } else {
            if (!(this.stats.items === "" && this.closed_frame === 3)) {
                Mst.mGame.save.objects.push(this.save);
            }
        }
    }

    save_chest() {
        const chest = this;

        this.csave(this, "CLOSE");

        if (this.stat !== "open") {
            const n = Mst.time;
            this.save.properties.time = n;

            console.log("SAVE CHEST");
            console.log(this.save);

            $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, this.save)
                .done(function (data) {
                    console.log("Chest save success");
                    console.log(data);
                    const resp = JSON.parse(data);
                    const obj_id = resp.obj.obj_id;
                    console.log("ObjID: " + obj_id);

                    chest.obj_id = obj_id;

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
        const player = Mst.player;
        const chest = this;

        this.vChest.close_frame();
        Mst.cPlayer.chest.close();
        Mst.hud.items.set_put_type("equip");

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
            Mst.hud.chestitems.kill_stats();
            this.vChest.destroy();
        } else {
            console.log(chest);
            console.log(chest.obj_id, chest.stats.items, chest.name.substr(0, 5));
            const is_empty_item = (chest.obj_id === 0 && chest.stats.items === '' && chest.name.substr(0, 5) === 'item_');
            console.log("Empty item: " + is_empty_item);
            if (!is_empty_item) {
                console.log("Chest is not empty item");

                if (this.stat !== "open" && this.is_opened) {
                    const n = Mst.time;
                    this.save.properties.time = n;

                    console.log("CLOSE CHEST");
                    console.log(this.save);

                    $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, this.save)
                        .done(function (data) {
                            console.log("Chest close success");
                            console.log(data);
                            const resp = JSON.parse(data);
                            const obj_id = resp.obj.obj_id;
                            console.log("ObjID: " + obj_id);

                            chest.obj_id = obj_id;

                            Mst.hud.chestitems.kill_stats();

                            console.log("Chest is closed");
                            Mst.hud.alerts.show("Zavřena!");
                        })
                        .fail(function (data) {
                            console.log("Chest close error");
                            console.log(data);
                        });

                    console.log("save chest close");

                } else {
                    Mst.hud.chestitems.kill_stats();
                }
            } else {
                console.log("Chest close is empty item");
                Mst.hud.chestitems.kill_stats();
                Mst.hud.alerts.show("Zavřena!");
            }

            if (this.vChest.krlz_sprite) {
                this.vChest.krlz_sprite.kill();
                Mst.cPlayer.key_close();
            }
        }

        this.is_opened = false;
    }

    get_chest_core(chest) {
        const cPlayer = Mst.cPlayer;
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
            Mst.groups.NPCs.forEachAlive(function (NPC) {
                if (NPC.stype === "tlustocerv") {
                    console.log("Tlustocerv salat not run");
                    NPC.condi(false);
                }
            }, chest);
        }

        Mst.map.removeTile(chest.tile);

        const key = Mst.mGame.keyOfName(chest_name);
        if (key) Mst.mGame.save.objects.splice(key, 1);

        console.log("Get chest objects:");
        console.log(Mst.mGame.save.objects);

        console.log(chest.cChest.cases);
        if (!chest.cChest.cases.is_empty) {
            chest.mChest.closed_frame = "199";
            chest.mChest.opened_frame = "199";
            chest.mChest.save.properties.closed_frame = "199";
            chest.mChest.save.properties.opened_frame = "199";

            chest.mChest.save.properties.is_takeable = false;
            chest.mChest.save.properties.cases = chest.cases;

            const n = Mst.time;
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
                chest.mChest.save.properties.closed_frame = 126;
                chest.mChest.save.properties.opened_frame = 126;

                chest.mChest.save.properties.is_takeable = true;

                const n = Mst.time;
                chest.mChest.save.properties.time = n;
                chest.mChest.save.properties.ctime = n;
                chest.mChest.save.action = "CLOSE";

                console.log("CLOSE 126 CHEST");
                console.log(chest.mChest.save);

                $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, chest.mChest.save)
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

                    $.post("object.php?time=" + Mst.time + "&uid=" + Mst.usr_id, chest.mChest.save)
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
        let stat = "error";
        if (chest.obj_id === 0) {
            console.log("Chest open obj_id 0");
            chest.cChest.open_chest_fin();
        } else {
            this.csave(chest.mChest, "OPEN");
            console.log(chest.mChest.save);

            $.post("object.php?time=" + Mst.time + "&uid=" + Mst.usr_id, chest.mChest.save)
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
                        Mst.hud.alerts.show("Otevřel ji někdo jiný!");

                        chest.mChest.close_chest();
                    } else {
                        Mst.cPlayer.chest.open_fin();
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
        this.stats.items = properties.items ? properties.items : "";
        this.items = new MCItems(this.stats.items);
        this.cChest.items = this.items;
        this.save.properties.items = this.items.save();

        this.set_stat(stat);
    }

    set_owner(owner) {
        this.owner = owner;
        this.save.properties.owner = owner;
    }

    set obj_id(obj_id) {
        this._obj_id = parseInt(obj_id);
        this.vChest.obj_id = this._obj_id;
        this.save.obj_id = this._obj_id;
    }

    get obj_id() {
        return this._obj_id;
    }

    init_obj_id() {
        let obj_id = Mst.mGame.get_obj_id(this.name);
        if (!obj_id) {
            obj_id = 0;
            if (this.properties.obj_id) obj_id = parseInt(this.properties.obj_id);
        }
        return obj_id;
    }

    reset(name, position, properties) {
        super.reset(name, position, properties);

        this.closed_frame = this.interface.closed_frame;
        this.opened_frame = this.interface.opened_frame;
        this.is_takeable = this.interface.is_takeable;
        this.sskill = this.interface.sskill;
        this.owner = this.interface.owner;
        this.level = this.interface.level;

        this.is_opened = false;

        this.time = this.interface.time;
        this.ctime = this.interface.ctime;
        this.s1type = this.interface.s1type;
        this.s2type = this.interface.s2type;

        this.obj_id = this.interface.obj_id;
        this.identity.init(this.obj_id, "chest", this.view);
        this.cases = new MCCases(this, this.interface.cases);

        this.cChest.init();
        this.vChest.init();
    }
}

class MCInterface extends MPrefabInterface {
    constructor(mChest, name, position, properties) {
        console.log(properties);
        super(mChest, properties);
        this.mChest = mChest;

        properties.group = "chests";
        this.group_name = "chests";

        this.closed_frame = parseInt(properties.closed_frame) || 4;
        this.opened_frame = parseInt(properties.opened_frame) || 5;

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

        this.time = Mst.time;
        if (properties.time) this.time = parseInt(properties.time);
        this.ctime = this.time;
        if (properties.ctime) this.ctime = parseInt(properties.ctime);

        this.s1type = properties.s1type ? properties.s1type : "";
        if (properties.s2type) this.s2type = properties.s2type;

        this.tname = properties.tname ? properties.tname : "chest";

        console.log("Chest time diff: " + (this.time - this.ctime));
        console.log((this.time - this.ctime)/100000);
    }

    init(name, position) {
        super.init(name, position);

        let obj_id = Mst.mGame.get_obj_id(name);
        if (!obj_id) {
            obj_id = 0;
            if (this.properties.obj_id) obj_id = parseInt(this.properties.obj_id);
        }
        this.obj_id = obj_id;

        this.save.type = "chest";
        this.save.obj_id = this.obj_id;
        this.save.map_int = Mst.map_int;
        if (this.s1type === "") this.save.properties.s1type = "";
    }

    reset(name, position, properties) {
        super.reset(name, position, properties);

        this.closed_frame = parseInt(properties.closed_frame) || 4;
        this.opened_frame = parseInt(properties.opened_frame) || 5;

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

        this.time = Mst.time;
        if (properties.time) this.time = parseInt(properties.time);
        this.ctime = this.time;
        if (properties.ctime) this.ctime = parseInt(properties.ctime);

        this.s1type = properties.s1type ? properties.s1type : "";
        if (properties.s2type) this.s2type = properties.s2type;
        this.tname = properties.tname ? properties.tname : "chest";

        let obj_id = Mst.mGame.get_obj_id(name);
        if (!obj_id) {
            obj_id = 0;
            if (this.properties.obj_id) obj_id = parseInt(this.properties.obj_id);
        }
        this.obj_id = obj_id;

        this.save.type = "chest";
        this.save.obj_id = this.obj_id;
        this.save.map_int = Mst.map_int;
    }
}

class MCItems extends MPItems {
    constructor(items) {
        console.log(items);
        super(items);
    }

    in_chest() {
        const output = [];
        for (const item of this) {
            const nitem = {
                f: item.frame,
                q: item.quantity
            };
            output.push(nitem);
        }
        return output;
    }

    in_chest_ord() {
        const output = this.in_chest();
        output.sort((a, b) => a.f - b.f);
        return output;
    }

    compare(a, b) {
        if (a || b) {
              if (a.length == b.length) {
                let output = true;
                for (let i in a) {
                    if (a[i].f == b[i].f) {
                        output = (a[i].q == b[i].q) && output;
                    } else {
                        output = false;
                    }
                }
                return output;
            }
        }
        return false;
    }

    take_all() {
        const content = this.in_chest();

        if (content.length > 0) {
            for (let i = content.length - 1; i > -1; i--) {
                this[i].sub_all();
            }
        }
        return content;
    }
}

Mst.FactoryChest = class extends Mst.Factory {
    constructor(group, name) {
        super(group, name);

        this.set_tname("chest");

        this._spawner = null;
        this._items = [];
        this._properties = {
            group: "chests",
            pool: "chests",
            items: "",
            closed_frame: 4,
            opened_frame: 5,
            texture: "items_spritesheet"
        };
        this.ind = {
            j: 0,
            k: 0,
            _max: 20,
            set max(max) {
                const m = Mst.parseIntNull(max);
                if (m) this._max = m;
            },
            get max() {
                return this._max;
            },
            init: function(c) {
                this.j = c;
                this.k = c;
            },
            add(item) {
                if (item) this.j++;
                this.k++;
            },
            get check() {
                return this.j < this.max && this.k < (this.max*2);
            }
        };
    }

    _template() {
        return new Mst.Chest(this.names.new, this.position, this._properties);
    }

    get spawner() {
        return this._spawner;
    }

    set spawner(spawner) {
        this._spawner = spawner;
        this._make_items();
    }

    get position_by_player() {
        const p =  {
            x: Math.round((Mst.player.x - 8 + (Mst.cPlayer.chest.direction.x * 16))/16)*16 + 8,
            y: Math.round((Mst.player.y + 8 + (Mst.cPlayer.chest.direction.y * 16))/16)*16 - 8
        };
        this.position = p;
        return p;
    }

    get spawn_position() {
        const p = Mst.map.getNormRnd(this.spawner.position, this.spawner.dif);
        this.position = p;
        return p;
    }

    get new_frame() {
        const index = Mst.rnd(0, this._items.length - 1);
        const frame = this._items[index].frame;
        console.log("I", index, "F", frame);
        return frame;
    }

    _make_items() {
        for (let i in Mst.items) {
            const spawn = Mst.items[i].properties.spawn;
            if (spawn) {
                if (this._spawner.stype === spawn || spawn === "uni") {
                    const item = {
                        frame: parseInt(i),
                        obj: Mst.items[i]
                    };
                    this._items.push(item);
                }
            }
        }
    }
};

Mst.GroupChest = class extends Mst.Group {
    constructor(name) {
        super(name);
    }

    _template_factory() {
        return new Mst.FactoryChest(this, this.name);
    }

    get spawner() {
        return this.factory.spawner;
    }

    set spawner(spawner) {
        this.factory.spawner = spawner;
    }

    get new_position_by_player() {
        return this.factory.position_by_player;
    }

    get spawn_position() {
        return this.factory.spawn_position;
    }

    get_new_position(object) {
        return {
            x: Math.round((object.x - 8)/16)*16 + 8,
            y: Math.round((object.y + 8)/16)*16 - 8
        };
    }

    get frame() {
        return this.factory._properties.closed_frame;
    }

    set frame(frame) {
        this.factory._properties.closed_frame = frame.closed_frame;
        this.factory._properties.opened_frame = frame.opened_frame;
    }

    get new_frame() {
        return this.factory.new_frame;
    }

    set_player_new_position() {
        const player = Mst.player;
        const np = this.get_new_position(player);
        player.x = np.x;
        player.y = np.y;
        console.log(player);
    }

    countItems() {
        const count = this.children.reduce((acc, item) => item.isAliveItem ? ++acc : acc, 0);
        console.log("Count Items: " + count);
        return count;
    }
    
    get items() {
        return this.children.filter((item) => item.isAliveItem);
    }

    create_new_chest(frame) {
        const chest = this.drop_new_chest(this.new_position_by_player, frame, "chest");
        if (chest) this.set_player_new_position();
        return chest;
    }

    spawn_new_chest() {
        const frame = this.new_frame;
        const position = this.spawn_position;
        let b = Mst.map.checkGrass(position);
        if (Mst.map.checkTileDistance(position, 40)) b = true;
        if (b) {
            console.log("Item properties", this.factory._properties);
            const object = this.drop_new_chest(position, frame, "item");            
            this.spawn_add(object);
            if (object) {
                const mo = object.mChest;
                mo.is_takeable = mo.close_frame !== 22;
                mo.tname = "item";
                console.log(object.name, object);
                return object;
            }
        }
        return null;
    }

    drop_new_chest(object, frame, tname) {
        this.tname = tname ? tname : "drop";
        const np = object.stats ? this.get_new_position(object) : object;
        const b = Mst.map.checkCollision(np);
        console.log("Chest colision", b);

        if (!b) {
            console.log("Drop new chest ", frame);
            this.frame = Mst.workItems.new_chest_frame(frame, tname);
            console.log("Drop chest properties", this.factory._properties);
            return this.getNext();
        }
        return null;
    }

    init_spawn() {
        const c = this.countItems();
        this.factory.ind.init(c);
    }   

    get spawn_check() {
        return this.factory.ind.check;
    }
    
    get spawn_max() {
        return this.factory.ind.max;
    }

    set spawn_max(max) {
        this.factory.ind.max = max;
    }

    spawn_add(o) {
        this.factory.ind.add(o);
    }
};

class MCCases {
    constructor(mChest, cases) {
        this.core = cases;
        this.stolen = false;
        this.case_id = -1;
        this.culprit_id = -1;
        this.mw_context = "";
        this.taken = {};
        this.map = Mst.map_int;
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
        this.core[id].PCID = pcid;
        this.save.cases = this.core;
    }

    set_investigate() {
        for (const ncase of this.core) {
            if (ncase.PCID === -1) {
                ncase.PCID = -2;

                console.log(ncase);
                break;
            }
        }
    }

    steal() {
        console.log("Chest steal");

        const player = Mst.player;
        const map = this.map;
        this.case_id = this.core.length;

        const new_case = {
            "CID": this.case_id,
            "ID": this.mChest.obj_id,
            "PCID": -1,
            "Owner": this.mChest.owner,
            "Culprit": Mst.usr_id,
            "C14": player.mPlayer.stats.badges["14"],
            "C15": player.mPlayer.stats.badges["15"],
            "CpID": -1,
            "M": map,
            "type":"stolen",
            "gtms": player.mPlayer.gtime.ms,
            "gweek": Mst.gtimeweek,
            "taken": "",
            "witness": {},
            "ftprints": []
        };
        const players = Mst.mGame.get_players();
        const NPCs = Mst.mGame.get_NPCs();
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
            "gweek": Mst.gtimeweek,
            "wt": wt,
            "count": 0
        };

        this.culprit_id = player.cPlayer.cases.add_culprit(new_culprit);
        new_case.CpID = this.culprit_id;

        this.core.push(new_case);

        this.cChest.open_chest_fin();

        console.log("Stolen");
        console.log(this);
        console.log(player);
    }

    rollback() {
        const id = this.case_id;
        const culprit_id = this.core[id].CpID;

        this.case_id = -1;
        this.core.splice(id, 1);
        this.save.cases = this.core;
        this.culprit_id = -1;
        Mst.cPlayer.cases.rollback_culprit(culprit_id);
    }

    add_witness(cid) {
        const map = this.map;

        if (!this.core[cid].witness[map]) {
            const players = Mst.mGame.get_players();
            const NPCs = Mst.mGame.get_NPCs();

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
        const ftprint = {
            m: this.map,
            x: Math.round((Mst.player.x - 8 )/16)*16 + 8,
            y: Math.round((Mst.player.y + 8 )/16)*16 - 8
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
        console.log("TAKEN check");
        console.log(this.taken);

        for (let key in this.taken) {
            if (this.taken[key] < 0) return true;
        }
        return false;
    }

    change_taken(frame, quantity) {
        if (!this.taken[frame]) {
            this.taken[frame] = quantity;
        } else {
            this.taken[frame] += quantity;
        }

        console.log("TAKEN CHNG");
        console.log(this.taken);
    }

    save_taken() {
        const taken_a = [];
        let taken = "";

        console.log("TAKEN");
        console.log(this.taken);

        for (let key in this.taken) {
            taken = key + "?" + this.taken[key];
            taken_a.push(taken);
        }

        console.log(this.check_taken());

        return "TAKEN-UID:" + Mst.usr_id + "|" + taken_a.join("|");
    }

    save_cases() {
        return this.save.cases;
    }
}
