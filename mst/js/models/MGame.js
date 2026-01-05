class WithInit {
    constructor(sCaller, properties, sup) {
        this.sCaller = sCaller;
        this.properties = properties;
        if (!sup) this.model = this._model();
    }

    _model() {
        return null;
    }

    _uSetter(type, object) {
        console.log("Error", type, object);
        throw new Error("Not possible set this controller property: " + type);
    }

    _uGetter(type, object, value) {
        console.log("Error", type, object);
        if (!value) throw new Error("Not initialized property: " + type);
    }
}

class MInit {
    constructor() {

    }

    _uGetter(type, obj) {
        console.log("Error", type, obj);
        throw new Error("Not possible get init property: " + type);
    }
}

class MModel extends WithInit {
    constructor(controller, properties) {
        super(controller, properties, true);
        this.controller = controller;
        this.view = controller.sCaller;
        console.log(controller);
    }
}

class MGQuest {
    constructor() {
        this.gdata_quests = Mst.quest.quests;
    }
}

class MGInit extends MInit {
    constructor(mGame) {
        super();
        this.mGame = mGame;
    }

    get mPlayer() {
        return this._uGetter("mPlayer", this);
    }

    set mPlayer(mPlayer) {
        console.log("MPlayer Init");
        this.mGame._mPlayer = mPlayer;
        this.cases = this.mGame._mPlayer.cases;
        console.log(mPlayer);
    }

    get cases() {
        return this._uGetter("cases", this);
    }

    set cases(cases) {
        this.mGame._cases = new MGCases(cases);
    }
}

class MGame extends MModel {
    constructor(cGame, properties) {
        super(cGame, properties);
        this.cGame = cGame;
        this.vGame = cGame.sCaller;
        this.gdata = properties;
        this.quests = new MGQuest(this);
        this._cases = null;
        this._mPlayer = null;

        this.load_mst = Mst.load_mst;
        console.log(this.load_mst);

        this.save = {
            player: {},
            objects: this.gdata.map.objects
        };

        this.finder = new EasyStar.js();

        this.prefabs = {};
        this.groups = new MGroups();
        this.identities = new MIdentities();

        this.workItems = new Mst.Model.WorkItems();
        Mst.init_workItems(this.workItems);

        console.log(this);
        this.hud = new MHud(this);

        this.init = new MGInit(this);

        Mst.init_mgame(this);
    }

    get cases() {
        if (this._cases) return this._cases;
        this._uGetter("cases", this);
    }

    set cases(x) {
        this._uSetter("cases", this);
    }

    get mPlayer() {
        if (this._mPlayer) return this._mPlayer;
        this._uGetter("mPlayer", this);
    }

    set mPlayer(x) {
        this._uSetter("mPlayer", this);
    }

    get_person(uid, type) {
        const identity = new MIdentity(uid, type);
        return this.identities.get_prefab(identity);
    }

    get_object(oid) {
        const identity = new MIdentity(oid, "chest");
        return this.identities.get_prefab(identity);
    }

    keyOfUsrID(usr_id) {
        console.log("keyOfUsrID:" + usr_id);
        console.log(this.save.objects);
        for (let object_key in this.save.objects) {
            if (this.save.objects[object_key].usr_id) {
                usr_id = parseInt(usr_id);
                const uid = parseInt(this.save.objects[object_key].usr_id);
                if (uid == usr_id) {
                    console.log(object_key);
                    return object_key;
                }
            }
        }
        return null;
    }

    keyOfName(name) {
        console.log("keyOfName:" + name);
        if (this.save) {
            for (let object_key in this.save.objects) {
                if (this.save.objects[object_key].name) {
                    if (this.save.objects[object_key].name == name) return object_key;
                }
            }
        }
        return null;
    }

    get_obj_id(name) {
        const key = this.keyOfName(name);
        if (key) return parseInt(this.save.objects[key].obj_id);
        return 0;
    }

    get_usr_id(name) {
        const key = this.keyOfName(name);
        if (key) return parseInt(this.save.objects[key].usr_id);
        return 0;
    }

    get_players() {
        const players = [];
        for (let object_key in this.prefabs) {
            if (this.prefabs[object_key].usr_id) {
                const uid = parseInt(this.prefabs[object_key].usr_id);
                players.push(uid);
            }
        }
        return players;
    }

    get_NPCs() {
        const NPCs = [];
        for (let object_key in this.prefabs) {
            if (this.prefabs[object_key].unique_id) {
                const uid = parseInt(this.prefabs[object_key].unique_id);
                if (uid > 0) {
                    NPCs.push(uid);
                }
            }
        }
        return NPCs;
    }

    save_data(go_position, next_map_int, save_state) {
        this.save_state = save_state;
        this.save_tween = false;
        this.save_post = false;

        this.groups.otherplayers.forEachAlive(function(one_player) {
            one_player.save_player();
        }, this);

        this.mPlayer.save_player(go_position, next_map_int);

        this.save.player = this.mPlayer.save;
        this.save.enplayer = JSON.stringify(this.mPlayer.save);

        const key = this.keyOfUsrID(Mst.usr_id);

        console.log(this.save.objects);
        console.log(key);

        if (key) this.save.objects.splice(key, 1);

        console.log(this.save.objects);

        const stat1 = this.groups.hud.create(this.prefabs.player.x, this.prefabs.player.y, "circle_inv");
        stat1.scale.setTo(21);
        stat1.anchor.setTo(0.5);

        const tween = Mst.game.add.tween(stat1.scale).to( { x: 0.72, y: 0.72 }, 500, Phaser.Easing.Linear.None);
        tween.onComplete.add(this.save_data_tween, this);
        tween.start();
        const save_data_post = this.save_data_post;
        const tt = this;

        $.post("save.php?time="+Mst.time, this.save)
            .done(function(data) {
                console.log( "save success" );
                console.log(JSON.parse(data));

                save_data_post(tt);
            })
            .fail(function(data) {
                console.log( "save error" );
                console.log(data);
            });

        console.log("save");
    }

    save_data_tween() {
        this.save_tween = true;
        if (this.save_post) this.save_data_fin();
    }

    save_data_post(tt) {
        tt.save_post = true;
        if (tt.save_tween) tt.save_data_fin();
    }

    save_data_fin() {
        console.log("save_data_fin");
        let usr_id = Mst.usr_id;
        let login = true;
        const next_map_int = this.mPlayer.save.map.new_int;
        if (this.save_state === "logout") {
            usr_id = 0;
            login = false;
        }

        Mst.save_mst(usr_id, next_map_int, login);

        if (this.save_state == "logout") {
            console.log("logout");
            location.href = "login.html";
            //location.reload();
        }

        Mst.game.state.start("BootState", true, false, next_map_int, usr_id);
    }

    make_object(position, oid, type) {
        const mGame = this;
        const cases = this.mPlayer.cases;
        const ftprints = this.mPlayer.cases.ftprints;
        const uid = this.mPlayer.usr_id;
        const a_type = type.split("|");
        if (a_type[1]) type = a_type[0];

        const save = {};
        save.type = "chest";
        save.action = "LOAD";
        save.obj_id = oid;
        save.name = "";

        console.log(save);

        let chest = null;

        $.post("object.php?time=" + Mst.time + "&uid=" + uid, save)
            .done(function (data) {
                console.log("Chest load success");
                console.log(data);
                const resp = JSON.parse(data);
                const properties = resp.obj.properties;
                const name = resp.obj.name;

                mGame.save.objects.push(resp.obj);

                if (type === 'test witness' || type === 'Prepare ftp' || type === '14' || type === 'Questions') {
                    properties.texture = "blank_spritesheet";
                }

                chest = new Mst.Chest(name, position, properties);

                if (type === "Questions") {
                    const dname = a_type[2];
                    console.log("Make - witness name: " + dname);
                    const ren = Mst.prefabs[dname].ren_sprite;
                    console.log(ren);

                    ren.next_question("", "");
                }

                if (type === 'Prepare ftp') {
                    ftprints.prepare_ftp();
                    ftprints.prepare_onmap();
                }

                if (type === 'test witness') {
                    const pcid = parseInt(a_type[1]);
                    const uid = a_type[2];
                    const type = a_type[3];
                    cases.init_witness(pcid, uid, type);
                }
            })
            .fail(function (data) {
                console.log("Chest load error");
                console.log(data);

                success = false;
            });

        return chest;
    }

    make_otherplayer(position, uid, type) {
        const mGame = this;
        const mPlayer = this.mPlayer;
        const acont = type.split("|");
        if (acont[1]) type = acont.shift();

        const save = {};
        save.type = "player";
        save.action = "LOAD";
        save.obj_id = 0;
        save.name = "";
        console.log(save);

        let otherplayer = null;

        $.post("object.php?time=" + Mst.time + "&uid=" + uid, save)
            .done(function (data) {
                console.log("OtherPlayer load success");
                console.log(data);
                const resp = JSON.parse(data);
                const properties = resp.obj.properties;
                const name = resp.obj.name;

                mGame.save.objects.push(resp.obj);

                console.log(type);

                if (type === "investigate") properties.texture = "blank_spritesheet";

                otherplayer = new Mst.OtherPlayer(name, position, properties);
                otherplayer.add_ren();
                otherplayer.init_quest();

                //console.log(otherplayer);

                if (type === "dead") {
                    otherplayer.test_nurse();
                    mPlayer.set_killed(false);
                }

                if (type === "investigate") {
                    const mbi = mPlayer.cases.make_book_investigate(uid, type, acont);

                    Mst.hud.book.book_investigate(mbi);
                }
            })
            .fail(function (data) {
                console.log("OtherPlayer load error");
                console.log(data);

                success = false;
            });

        return otherplayer;
    }
}

class MGroups {
    constructor() {

    }

    init(groups) {
        groups.forEach((group_name) => this.add(group_name), this);
        return this;
    }

    add(name) {
        switch(name) {
            case 'chests':
                this.chests = new Mst.GroupChest(name);
            break;
            case 'enemies':
                this.enemies = new Mst.GroupEnemy(name);
            break;
            default:
                this[name] = new Mst.Group(name);
            break;
        }
    }

    getItemSpawnerDistance(position, mdist) {
        let sp = null;
        Mst.groups.spawners.forEachAlive(function (spawner) {
            const dist = Mst.pointDistance(position, spawner);
            console.log("Test search spawner:", spawner.name, spawner.name.substr(0, 11), dist);

            if (dist < mdist && spawner.name.substr(0, 11) === 'itemspawner') {
                sp = spawner;
                console.log("Itemspawner close");
            }

        }, this);
        return sp;
    }
}

class MProperty {
    constructor(value, max) {
        this.value = Mst.parseInt(value);
        this._max = Mst.parseIntNull(max);
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = Mst.parseInt(value);
    }

    set max(value) {
        this._max = Mst.parseIntNull(value);
        this.reset();
    }

    get max() {
        return this._max;
    }

    reset(max) {
        if (max) this.max = max;
        if (this.max) this.value = this.max;
    }

    add(value) {
        const add = this.value + Mst.parseInt(value);
        if (this.max && add > this.max) {
            this.value = this.max;
            return add;
        }
        this.value = add;
        return null;
    }

    sub(value) {
        const sub = this.value - Mst.parseInt(value);
        this.value = sub;
        if (sub < 1) this.value = 0;
        return sub;
    }

    save() {
        return this.value;
    }
}

class MIdentity {
    constructor(id, type) {
        this._id = null;
        this.type = type;

        this.id = id;
    }

    set id(id) {
        this._id = Mst.parseIntNull(id);
    }

    get id() {
        return this._id;
    }

    get ids() {
        return String(this._id);
    }
    
    eq(id, ntype) {
        const nid = Mst.parseIntNull(id);
        return this.type === ntype && this.id === nid;
    }

    reset(id, type) {
        this.id = id;
        this.type = type;
    }
}

class MPrefabIdentity extends MIdentity {
    constructor(mPrefab, identities) {
        super();
        this.mPrefab = mPrefab;
        this.name = mPrefab.name;
        this.orig = {
            name: mPrefab.oname, // zatim nefunguje
            type: mPrefab.otype
        };
        
        this.identities = identities;
        this.id = this._prefab_id;
        this.type = this._prefab_type;
        console.log(this);
        identities.set(this, mPrefab.view);
    }

    get _prefab_id() {
        console.log("Get Prefab Id", this._prefab_type, this.mPrefab);
        if (this._prefab_type === "player" || this._prefab_type === "player") return this.mPrefab.uid;
        return this.mPrefab.id;
    }

    get _prefab_type() {
        if (this.mPrefab.otype) return this.mPrefab.otype;
        return this.mPrefab.type;
    }

    init(id, type, prefab) {
        this.id = id;
        this.type = type;
        this.identities.set(this, prefab);
    }

    reset(id, type, prefab) {
        this.init(id, type, prefab);
    }
}

class MIdentities {
    constructor() {
        this.prefabs = {};
    }

    set(identity, prefab) {
        const id = identity.id;
        const type = identity.type;

        if (id && type) {
            if (!this[type]) this[type] = {};
            this[type][id] = identity;

            if (prefab) {
                if (!this.prefabs[type]) this.prefabs[type] = {};
                this.prefabs[type][id] = prefab;
            }
        }
    }

    get(identity) {
        const id = identity.id;
        const type = identity.type;
        if (this[type]) return this[type][id];
        return null;
    }

    get_prefab(identity) {
        const id = identity.id;
        const type = identity.type;
        console.log("Get Prefab", type, identity, this.prefabs[type]);
        if (this.prefabs[type]) return this.prefabs[type][id];
        return null;
    }
}

class MArrayItem {
    constructor(arr, id, value) {
        this.arr = arr;
        this._id = id;
        this.value = value;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
        this.arr.core[this.id] = value;
        return this;
    }

    remove() {
        return this.arr.remove(this.id);
    }

    save() {
        this.arr.core[this.id] = this.value;
        return this.value;
    }
}

class MArray extends Array {
    constructor(core, sup) {
        super();
        this.core = core;
        if (!sup) this._make(core);
    }

    _model(index, value) {
        return new MArrayItem(this, index, value);
    }

    _make(core) {
        if (!core) core = [];
        for (const item of core) {
            this._add(item);
        }
    }

    _reset_ids(start) {
        if (!start) start = 0;
        for (let i = start; i < this.length; i++) {
            this[i].id = i;
        }
    }

    _add(value) {
        const index = this.length;
        const item = this._model(index, value);
        this.push(item);
        return item;
    }

    add(value) {
        this.core.push(value);
        return this._add(value);
    }

    update(id, value) {
        if (!this[id]) return this.add(value);
        this[id].set(value);
        return this[id];
    }

    remove(id) {
        if (id > -1) {
            const ret = this[id];
            this.splice(id, 1);
            this.core.splice(id, 1);
            this._reset_ids(id);
            return ret;
        }
        return null;
    }

    save() {
        console.log("Array save:", this.name, this.core)
        return this.core;
    }

    reset(core) {
        this.core = core;
        this._make(core);
    }
}

class MArrayString extends MArray {
    constructor(string, split) {
        const core = string.length > 0 ? string.split(split) : [];
        super(core);
        this.split = split;
    }

    save() {
        console.log(this.core);
        return this.core.join(this.split);
    }

    reset(string, split) {
        this.split = split;
        const core = string.length > 0 ? string.split(this.split) : [];
        super.reset(core);
    }
}



class MGCases {
    constructor(mPCases) {
        this.mPCases = mPCases;
        this.ftprints = new MGCFtprints(this, mPCases);
        this.loaded = new MGCLoaded(mPCases);
    }
}

class MGCFtprints {
    constructor(mCases, mPCases) {
        this.mCases = mCases;
        this.mPCases = mPCases;
        this.culprit = mPCases.culprit;
        this.a = [];
    }

    add(ftprint) {
        this.a.push(ftprint);
    }

    save(culprit, ftprint, witness, map) {
        const ftprint_save = {
            type: "ftprint",
            name: "ftprint",
            obj_id: culprit.ID,
            x: 0,
            y: 0,
            properties: {
                group: "ftprint",
                items: "",
                texture: "blank",
                time: "",
                cid: culprit.CID
            },
            action: "FTPRINT",
            ftprint: ftprint,
            witness: witness,
            map_int: map
        };

        const n = Mst.time;
        ftprint_save.properties.time = n;

        console.log("Ftprint insert:");
        console.log(ftprint_save);

        $.post("object.php?time=" + n + "&uid=" + Mst.usr_id, ftprint_save)
            .done((data) => {
                console.log("Ftprint save success");
                console.log(data);
                const resp = JSON.parse(data);

                console.log("Ftprint is saved");
            })
            .fail((data) => {
                console.log("Ftprint save error");
                console.log(data);
            });
    }

    make(cc) {
        console.log("Add ftprints");

        const map = Mst.map_int;

        const ftprint = {
            m: map,
            x: Math.round((Mst.player.x - 8) / 16) * 16 + 8,
            y: Math.round((Mst.player.y + 8) / 16) * 16 - 8
        };

        let witness = null;

        if (cc === 0) {
            const players = Mst.mGame.get_players();
            const NPCs = Mst.mGame.get_NPCs();

            if (players.length > 0 || NPCs.length > 0) {
                witness = {
                    m: map,
                    p: players,
                    n: NPCs,
                    id: 0
                };
            }
        }

        console.log(this.culprit);
        for (const culprit of this.culprit) {
            if (culprit.M === map) {
                console.log("Ft same map");

                const chest = Mst.mGame.get_object(culprit.ID);
                chest.cChest.cases.add_ftprints(culprit.CID);
                if (!this.cPlayer.chest.opened) {
                    chest.mChest.save_chest();
                } else {
                    if (this.cPlayer.chest.opened.name !== chest.name) chest.mChest.save_chest();
                }
            } else {
                console.log("Ft other map");
                this.save(culprit, ftprint, witness, map);
            }
        }
    }

    prepare_ftp() {
        const mCases = this.mCases;
        this.mPCases.for_each((ncase) => mCases.loaded.load_case(ncase.pcid, "Prepare ftp"));
    }

    prepare_onmap() {
        console.log(this);
        const loaded = this.mCases.loaded;
        const map = this.map;
        const a_pcid = [];
        const mFtprints = this;

        Mst.groups.chests.forEachAlive((chest) => {
            console.log(chest);
            if (!chest.cChest) return null;
            if (!chest.cChest.cases) return null;
            chest.cChest.cases.for_each((ccase) => {
                let b_in = false;
                let p_in = false;
                const pcid = parseInt(ccase.PCID);
                const pcl = loaded.cases[pcid];
                if (pcl) {
                    if (pcl.ftp_vis === 1) {
                        p_in = true;
                    } else {
                        pcl.ftp_vis = 1;
                    }
                }

                if (!p_in) {
                    const ftprints = ccase.ftprints;
                    const gweek = parseInt(ccase.gweek) + 3;
                    for (let id in ftprints) {
                        const m = parseInt(ftprints[id].m);
                        //console.log(m + "|" + map + " " + gweek + "|" + Mst.gtimeweek);

                        if (m === map && gweek > Mst.gtimeweek) {
                            const new_ftprints = JSON.parse(JSON.stringify(ftprints[id]));
                            new_ftprints.cid = ccase.CID;
                            new_ftprints.id = ccase.ID;
                            new_ftprints.fid = id;
                            new_ftprints.pcid = ccase.PCID;
                            new_ftprints.owner = ccase.Owner;
                            new_ftprints.culprit = ccase.Culprit;
                            mFtprints.add(new_ftprints);
                            b_in = true;
                        }
                    }
                    const owner = parseInt(ccase.Owner);
                    if (b_in && owner === Mst.usr_id) a_pcid.push(ccase.PCID);
                }
            });
        }, this);
        console.log("Prepared ftprints");
        console.log(this.a);
    }
}

class MGCLoaded {
    constructor(cases) {
        this.cases = {};
        this.person = {};
        this.NPC = {};
        this.case = cases;
        this.witness = new MGCWitness(this, cases);
    }

    get_ptype(type) {
        if (type === "player") return "person";
        return "NPC";
    }

    load_person(uid, type, context) {
        const ptype = this.get_ptype(type);
        const person = Mst.mGame.get_person(uid, type);
        if (person) {
            this[ptype][uid] = person;

            return person;
        } else {
            if (type === "player") {
                const cont2 = "investigate|" + context;
                Mst.mGame.make_otherplayer({ x: 0, y: 0 }, uid, cont2);
            }
            return null;
        }
    }

    get_full_person(uid, type, context) {
        const ptype = this.get_ptype(type);

        if (this[ptype][uid]) return this[ptype][uid];

        return this.load_person(uid, type, context);
    }

    add_case(acase, pcid) {
        this.cases[pcid] = JSON.parse(JSON.stringify(acase));
        return this.cases[pcid];
    }

    load_case(pcid, context) {
        const pc = this.case[pcid];
        const oid = pc.chest.id;
        const cid = pc.chest.cid;
        const chest = Mst.mGame.get_object(oid);
        console.log(chest);

        if (chest) {
            const ncase = this.add_case(chest.cases[cid], pcid);
            return ncase;
        } else {
            Mst.mGame.make_object({ x: 0, y: 0 }, oid, context);
            return null;
        }
    }

    get_full_case(pcid, context) {
        if (!this.cases[pcid]) return this.load_case(pcid, context);
        return JSON.parse(JSON.stringify(this.cases[pcid]));
    }
}

class MGCWitness {
    constructor(loaded, cases) {
        this.o = {};
        this.cases = [];
        this.case = cases;
        this.loaded = loaded;
    }

    have_case(pcid) {
        return this.cases.indexOf(pcid) > -1;
    }

    get_new_case(pcase) {
        return {
            uid: "",
            type: "",
            map: pcase.M,
            cid: pcase.CID,
            id: pcase.ID,
            pcid: pcase.PCID,
            culprit: false
        };
    }

    set_new_case(new_case, uid, type, map) {
        new_case.map = map;
        new_case.type = type;
        new_case.uid = uid;
        return JSON.parse(JSON.stringify(new_case));
    }

    getw(type, uids, pcid) {
        if (this.o[type]) {
            if (this.o[type][uids]) {
                if (this.o[type][uids][pcid]) return this.o[type][uids][pcid];
            }
        }
        return null;
    }

    winit(ncase, uid, type) {
        const uids = String(uid);
        const pcid = ncase.pcid;
        const witstr = "test witness|" + pcid + "|" + uids + "|" + type;
        const pcase = ncase.get_full(witstr);
        if (pcase) {
            if (!this.have_case(pcid)) this.load(pcase);
            return this.getw(type, uids, pcid);
        }
        return null;
    }

    load(pcase) {
        const witness = this.o;
        console.log(pcase);

        const pcid = parseInt(pcase.PCID);
        this.cases.push(pcid);
        const nwc = this.get_new_case(pcase);

        for (let m in pcase.witness) {
            console.log(m);
            if (m !== "lid") {
                const pmwitness = pcase.witness[m];
                console.log(pmwitness);

                let ntype = "player";
                let a_wit = pmwitness.p;

                for (let id in a_wit) {
                    console.log(ntype + " i: " + id + " uid " + a_wit[id]);
                    const uidw = a_wit[id];
                    const new_wcase = this.set_new_case(nwc, uidw, ntype, m);
                    new_wcase.culprit = uidw === pcase.Culprit;

                    if (!witness[ntype]) witness[ntype] = {};
                    if (!witness[ntype][uidw]) witness[ntype][uidw] = {};
                    witness[ntype][uidw][pcid] = new_wcase;
                    console.log(new_wcase);
                    console.log(witness[ntype]);
                }

                ntype = "NPC";
                a_wit = pmwitness.n;

                for (let id in a_wit) {
                    console.log(ntype + " i: " + id + " uid " + a_wit[id]);
                    const uidw = a_wit[id];
                    const new_wcase = this.set_new_case(nwc, uidw, ntype, m);

                    if (!witness[ntype]) witness[ntype] = {};
                    if (!witness[ntype][uidw]) witness[ntype][uidw] = {};
                    witness[ntype][uidw][pcid] = new_wcase;
                    console.log(new_wcase);
                    console.log(witness[ntype]);
                }
            }
        }
        console.log(witness);
    }
}
