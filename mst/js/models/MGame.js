class MGame {
    constructor(cGame, vGame, properties) {
        this.cGame = cGame;
        this.vGame = vGame;
        this.gdata = properties;
        this.mPlayer = null;
        this.quests = new MGQuest(this);
        this.cases = null;

        this.load_mst = JSON.parse(localStorage.getItem("mst"));
        console.log(this.load_mst);
        
        this.save = {
            player: {},
            objects: this.gdata.map.objects
        };
        
        this.finder = new EasyStar.js();
        
        this.prefabs = {};
        this.groups = {};
        this.persons = {};
        this.persons.NPCs = {};
        this.persons.otherplayers = {};
        
        this.hud = new MHud(vGame.game, this);
    }
    
    init_mPlayer(mPlayer) {
        console.log("MPlayer Init");
        this.mPlayer = mPlayer;
        this.mPlayer.init_hud(this.hud);
        this.cases = new MGCases(this, mPlayer);
        return mPlayer;
    }
    
    create_groups(groups, groupshud) {
        groups.forEach((group_name) => this.groups[group_name] = this.vGame.game.add.group(), this);
        groupshud.forEach((group_name) => this.groups[group_name] = this.vGame.game.add.group(), this);
        console.log(this.groups);
        return this.groups;
    }
    
    create_persons() {
        this.groups.NPCs.forEachAlive((NPC) => this.persons.NPCs[NPC.unique_id] = NPC.name, this);        
        this.groups.otherplayers.forEachAlive((otherplayer) => this.persons.otherplayers[otherplayer.usr_id] = otherplayer.name, this);
        
        console.log("Persons:");
        console.log(this.persons);
        return this.persons;
    }
    
    set_prefabs(prefabs) {
        this.prefabs = prefabs;
        return this.prefabs;
    }
    
    playerOfUsrID(usr_id) {
        "use strict";

        console.log("playerOfUsrID:" + usr_id);
        for (let object_key in this.prefabs) {
            if (this.prefabs[object_key].usr_id) {
                usr_id = parseInt(usr_id);
                const uid = parseInt(this.prefabs[object_key].usr_id);
                console.log(uid);
                if (uid === usr_id) {
                    console.log(object_key);
                    return object_key;
                }
            }
        }
        return null;
    }

    NPCofID(usr_id) {
        "use strict";

        console.log("NPCofID:" + usr_id);
        for (let object_key in this.prefabs) {
            if (this.prefabs[object_key].unique_id) {
                usr_id = parseInt(usr_id);
                const uid = parseInt(this.prefabs[object_key].unique_id);
                if (uid === usr_id) {
                    console.log(object_key);
                    return object_key;
                }
            }
        }
        return null;
    }
    
    get_name(uid, type) {
        "use strict";
        if (type === 'player') return this.playerOfUsrID(uid);
        return this.NPCofID(uid);
    }
    
    get_person(uid, type) {
        "use strict";
        const name = this.get_name(uid, type);
        if (name) return this.prefabs[name];
        return null;
    }

    objectofID(obj_id) {
        "use strict";

        console.log("objectofID:" + obj_id);
        for (let object_key in this.prefabs) {
            if (this.prefabs[object_key].obj_id) {
                obj_id = parseInt(obj_id);
                const oid = parseInt(this.prefabs[object_key].obj_id);
                if (oid === obj_id) {
                    console.log(object_key);
                    return object_key;
                }
            }
        }
        return null;
    }

    get_object(oid) {
        "use strict";
        const key = this.objectofID(oid);
        if (key) return this.prefabs[key];
        return null;
    }

    keyOfUsrID(usr_id) {
        "use strict";

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
        "use strict";

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
        "use strict";

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
        "use strict";

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
        "use strict";
        this.save_state = save_state;
        this.save_tween = false;
        this.save_post = false;
        
        this.groups.otherplayers.forEachAlive(function(one_player) {        
            one_player.save_player();
        }, this);

        this.mPlayer.save_player(go_position, next_map_int);

        this.save.player = this.mPlayer.save;
        this.save.enplayer = JSON.stringify(this.mPlayer.save);

        const key = this.keyOfUsrID(this.gdata.root.usr_id);

        console.log(this.save.objects);
        console.log(key);

        if (key) this.save.objects.splice(key, 1);

        console.log(this.save.objects);

        const stat1 = this.groups.hud.create(this.prefabs.player.x, this.prefabs.player.y, "circle_inv");
        stat1.scale.setTo(21);
        stat1.anchor.setTo(0.5);

        const tween = this.vGame.game.add.tween(stat1.scale).to( { x: 0.72, y: 0.72 }, 500, Phaser.Easing.Linear.None);
        tween.onComplete.add(this.save_data_tween, this);
        tween.start();
        const save_data_post = this.save_data_post;
        const tt = this;

        const d = new Date();
        const n = d.getTime();

        $.post("save.php?time="+n, this.save)
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
        "use strict";
        console.log("save_data_fin");
        let usr_id = this.gdata.root.usr_id;
        let login = true;
        const next_map_int = this.mPlayer.save.map.new_int;
        if (this.save_state === "logout") {
            usr_id = 0;
            login = false;
        }

        const mst_inst = {
            "usr_id": usr_id,
            "map": next_map_int,
            "login": login
        };

        localStorage.setItem("mst", JSON.stringify(mst_inst));

        if (this.save_state == "logout") {
            console.log("logout");
            location.href = "login.html";
            //location.reload();
        }

        this.vGame.game.state.start("BootState", true, false, next_map_int, usr_id);
    }
    
    make_object(position, oid, type) {
        "use strict";
        const mGame = this;
        const vGame = this.vGame;
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

        const d = new Date();
        const n = d.getTime();

        console.log(save);
        
        let chest = null;

        $.post("object.php?time=" + n + "&uid=" + uid, save)
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

                chest = new Mst.Chest(vGame, name, position, properties);

                if (type === "Questions") {
                    const dname = a_type[2];
                    console.log("Make - witness name: " + dname);
                    const ren = vGame.prefabs[dname].ren_sprite;
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
        "use strict";
        const mGame = this;
        const vGame = this.vGame;
        const mPlayer = this.mPlayer;
        const a_type = type.split("|");
        if (a_type[1]) type = a_type[0];

        const save = {};
        save.type = "player";
        save.action = "LOAD";
        save.obj_id = 0;
        save.name = "";
        console.log(save);

        const d = new Date();
        const n = d.getTime();

        let otherplayer = null;

        $.post("object.php?time=" + n + "&uid=" + uid, save)
            .done(function (data) {
                console.log("OtherPlayer load success");
                console.log(data);
                const resp = JSON.parse(data);
                const properties = resp.obj.properties;
                const name = resp.obj.name;

                mGame.save.objects.push(resp.obj);

                console.log(type);

                if (type === "investigate") properties.texture = "blank_spritesheet";

                otherplayer = new Mst.OtherPlayer(vGame, name, position, properties);
                otherplayer.add_ren();
                otherplayer.init_quest();

                //console.log(otherplayer);

                if (type === "dead") {
                    const nurse = otherplayer.test_nurse();

                    mPlayer.killed = false;
                    mPlayer.save.properties.killed = false;
                }

                if (type === "investigate") {
                    const mbi = mPlayer.cases.make_book_investigate(uid, a_type);

                    vGame.hud.book.book_investigate(mbi);
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

class MGQuest {
    constructor(mGame) {
        this.gdata_quests = mGame.gdata.quest.quests;
    }
}

class MGCases {
    constructor(mGame, mPlayer) {
        this.mGame = mGame;
        this.mPlayer = mPlayer;
        this.ftprints = new MGCFtprints(mGame, this, mPlayer.cases.culprit);
        this.loaded = new MGCLoaded(mGame, mPlayer.cases.case);
    }
}
    
class MGCFtprints {
    constructor(mGame, mCases, culprit) {
        this.mGame = mGame;
        this.mCases = mCases;
        this.culprit = culprit;
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

        const d = new Date();
        const n = d.getTime();
        ftprint_save.properties.time = n;
        const usr_id = this.mGame.gdata.root.usr_id;

        console.log("Ftprint insert:");
        console.log(ftprint_save);

        $.post("object.php?time=" + n + "&uid=" + usr_id, ftprint_save)
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
        "use strict";

        console.log("Add ftprints");

        const map = this.mGame.gdata.root.map_int;

        const ftprint = {
            m: map,
            x: Math.round((this.mGame.prefabs.player.x - 8) / 16) * 16 + 8,
            y: Math.round((this.mGame.prefabs.player.y + 8) / 16) * 16 - 8
        };

        let witness = null;

        if (cc === 0) {
            const players = this.mGame.get_players();
            const NPCs = this.mGame.get_NPCs();

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

                const chest = this.mGame.get_object(culprit.ID);
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
        const mPCases = this.mCases.mPlayer.cases;
        mPCases.for_each((ncase) => mCases.loaded.load_case(ncase.pcid, "Prepare ftp"));
    }

    prepare_onmap() {
        "use strict";
        console.log(this);
        const loaded = this.mCases.loaded;
        const map = this.map;
        const a_pcid = [];
        const mPlayer = this.mPlayer;
        const mFtprints = this;

        this.mGame.groups.chests.forEachAlive((chest) => {
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
                        //console.log(m + "|" + map + " " + gweek + "|" + this.stats.gtimeweek);

                        if (m === map && gweek > this.mPlayer.stats.gtimeweek) {
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
                    if (b_in && owner === mPlayer.usr_id) a_pcid.push(ccase.PCID);
                }
            });
        }, this);
        console.log("Prepared ftprints");
        console.log(this.a);
    }
}

class MGCLoaded {
    constructor(mGame, cases) {
        this.mGame = mGame;
        this.cases = {};
        this.person = {};
        this.NPC = {};
        this.case = cases;
        this.witness = new MGCWitness(this, cases);
    }

    get_ptype(type) {
        "use strict";
        if (type === "player") return "person";
        return "NPC";
    }

    load_person(uid, type, context) {
        "use strict";
        const ptype = this.get_ptype(type);
        const person = this.mGame.get_person(uid, type);
        if (person) {
            this[ptype][uid] = person;

            return person;
        } else {
            if (type === "player") {
                const cont2 = "investigate|" + context;
                this.mGame.make_otherplayer({ x: 0, y: 0 }, uid, cont2);
            }
            return null;
        }
    }

    get_full_person(uid, type, context) {
        "use strict";
        const ptype = this.get_ptype(type);

        if (this[ptype][uid]) return this[ptype][uid];

        return this.load_person(uid, type, context);
    }

    add_case(acase, pcid) {
        "use strict";
        this.cases[pcid] = JSON.parse(JSON.stringify(acase));
        return this.cases[pcid];
    }

    load_case(pcid, context) {
        "use strict";
        const pc = this.case[pcid];
        const oid = pc.chest.id;
        const cid = pc.chest.cid;
        const chest = this.mGame.get_object(oid);
        console.log(chest);

        if (chest) {
            const ncase = this.add_case(chest.cases[cid], pcid);
            return ncase;
        } else {
            this.mGame.make_object({ x: 0, y: 0 }, oid, context);
            return null;
        }
    }

    get_full_case(pcid, context) {
        "use strict";
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
            if (!this.have_case(pcid)) this.load(pcase, uids, type);
            return this.getw(type, uids, pcid);
        }
        return null;
    }

    load(pcase, uids, type) {
        "use strict";
        
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