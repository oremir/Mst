class MController extends WithInit {
    constructor(view, properties, sup) {
        super(view, properties, sup);
        this.view = view;
    }

    _model() {
        return new MModel(this, this.properties);
    }
}

class MControllerObject {
    constructor(controller, modelObject) {
        this.controller = controller;
        this.modelObject = modelObject;
    }
}

class CGame extends MController {
    constructor(vGame, properties) {
        super(vGame, properties);
        this.vGame = vGame;
        this.mGame = this.model;
        this.gdata = properties;
        this.quests = new CGQuests(this.mGame);
        this.hud = new CHud(this, this.mGame.hud);
        this._groups = null;
        this._prefabs = null;
        this._cPlayer = null;
        this._mPlayer = null;
        this._cases = null;
        this.init = new CGInit(this);
    }

    _model() {
        return new MGame(this, this.properties);
    }

    get groups() {
        if (this._groups) return this._groups;
        this._uGetter("groups", this);
    }

    set groups(x) {
        this._uSetter("groups", this);
    }

    get prefabs() {
        if (this._prefabs) return this._prefabs;
        this._uGetter("prefabs", this);
    }

    set prefabs(x) {
        this._uSetter("prefabs", this);
    }

    get cPlayer() {
        if (this._cPlayer) return this._cPlayer;
        this._uGetter("cPlayer", this);
    }

    set cPlayer(x) {
        this._uSetter("cPlayer", this);
    }

    get mPlayer() {
        if (this._mPlayer) return this._mPlayer;
        this._uGetter("mPlayer", this);
    }

    set mPlayer(x) {
        this._uSetter("mPlayer", this);
    }

    get cases() {
        if (this._cases) return this._cases;
        this._uGetter("cases", this);
    }

    set cases(x) {
        this._uSetter("cases", this);
    }

    final_init() {
        this.cPlayer.followers.init();

        let nurse = null;

        if (this.mPlayer.killed) {
            console.log("KILLED!");
            this.groups.NPCs.forEachAlive(function (NPC) {
                if (!nurse) nurse = NPC.test_nurse();
            }, this);

            if (!nurse) {
                this.groups.otherplayers.forEachAlive(function (otherplayer) {
                    if (!nurse) nurse = otherplayer.test_nurse();

                    otherplayer.gweek = this.mPlayer.gtime.get_week(otherplayer.gtimems, 0);
                }, this);
            }

            if (!nurse) {
                switch (this.mPlayer.region) {
                    case 2:
                        this.mGame.make_otherplayer({ "x": 170, "y": 487 }, 45, "dead");
                    break;
                    case 3:
                        this.mGame.make_otherplayer({ "x": 234, "y": 186 }, 53, "dead");
                    break;
                }
            } else {
                this.mPlayer.set_killed(false);
            }
        }

        const item = this.cPlayer.items.test(195, 1);
        console.log("Kompot ", item);

        this.groups.NPCs.forEachAlive(function (NPC) {
            if (NPC.stype === "kerik") {
                if (index > -1) {
                    NPC.condi(true);
                }
            }
        }, this);

        let sp_dist = 100000;
        let en_sp = null;
        Mst.groups.spawners.forEachAlive(function (spawner) {
            console.log("Test spawner: " + spawner.name + " " + spawner.etype);
            if (spawner.etype === "enemy") {
                //console.log(spawner);
                const dist = Mst.game.physics.arcade.distanceBetween(spawner, this.cPlayer.vPlayer);
                console.log("Spawner dist: " + dist);
                if (dist < sp_dist) {
                    sp_dist = dist;
                    en_sp = spawner;
                }
            }
            if (spawner.etype === "item") {
                console.log("Activate Item Spawner", spawner);
                spawner.activate();
            }
        }, this);

        console.log("Activate Enemy Spawner", en_sp);
        if (en_sp) en_sp.activate();

        const cwait = { type: "wait", tm: Mst.time };
        this.cPlayer.quests.update("wait", cwait);

        this.cPlayer.cases.test_culprit();
        this.cases.ftprints.make(0);
        this.cases.ftprints.prepare_ftp();
        this.cases.ftprints.prepare_onmap();
    }
}

class CGInit extends MInit {
    constructor(cGame) {
        super();
        this.cGame = cGame;
    }

    get groups() {
        return this._uGetter("groups", this);
    }

    set groups(groups) {
        const ngroups = this.cGame.mGame.groups.init(groups);
        console.log("Init Groups", ngroups);
        this.cGame._groups = ngroups;
        Mst.init_groups(ngroups);
    }

    get groupshud() {
        return this._uGetter("groupshud", this);
    }

    set groupshud(groupshud) {
        const ngroups = this.cGame.mGame.groups.init(groupshud);
        console.log("Init Groups HUD", ngroups);
        this.cGame._groups = ngroups;
        this.cGame.hud.init_groups(ngroups);
        Mst.init_groups(ngroups);
        this.cGame.hud.init();
    }

    get prefabs() {
        return this._uGetter("prefabs", this);
    }

    set prefabs(prefabs) {
        this.cGame._prefabs = prefabs;
    }

    get cPlayer() {
        return this._uGetter("cPlayer", this);
    }

    set cPlayer(cPlayer) {
        console.log("CPlayer Init");
        this.cGame._cPlayer = cPlayer;
        this.mPlayer = cPlayer.mPlayer;
        this.cases = this.cGame.mGame.cases;
        console.log(cPlayer);
    }

    get mPlayer() {
        return this._uGetter("mPlayer", this);
    }

    set mPlayer(mPlayer) {
        this.cGame._mPlayer = mPlayer;
    }

    get cases() {
        return this._uGetter("cases", this);
    }

    set cases(cases) {
        this.cGame._cases = new CGCases(this.cGame, cases);
    }

    final() {
        this.cGame.final_init();
    }
}

class CGQuests {
    constructor(mGame) {
        this.mGame = mGame;
        this.gdata_quests = mGame.quests;
        this.gdata = mGame.gdata;
    }

    init() {
        Mst.groups.NPCs.forEachAlive(function (NPC) {
            console.log("Test Quest bubble: " + NPC.name);
            NPC.add_ren();
            NPC.init_quest();
        }, this);

        Mst.groups.otherplayers.forEachAlive(function (otherplayer) {
            console.log("Test Quest bubble: " + otherplayer.name);
            otherplayer.add_ren();
            otherplayer.init_quest();
        }, this);

        this.gdata.quest.rumours = {};
        this.gdata.quest.act_rumours = [];
        for (const rumour of this.gdata.quest.texts) {
            if (rumour.type === "rumour") {
                const tid = rumour.tid;
                this.gdata.quest.rumours[tid] = rumour;

                const key = Mst.player.stats.rumours.indexOf(tid);
                if (key < 0) this.gdata.quest.act_rumours.push(rumour);
            }
        }
        console.log(this.gdata.quest.rumours);
        console.log(this.gdata.quest.act_rumours);
    }
}

class CGCases {
    constructor(cGame, mCases) {
        this.cGame = cGame;
        console.log(this);
        this.mCases = mCases;
        this.ftprints = new CGCFtprints(cGame, this.mCases);
        this.loaded = this.mCases.loaded;

        cGame.cPlayer.mPlayer.cases.init_loaded(this.loaded, this.ftprints);
        cGame.cPlayer.cases.init_loaded(this.loaded, this.ftprints);
    }
}

class CGCFtprints {
    constructor(cGame, mCases) {
        this.cGame = cGame;
        this.cPlayer = cGame.cPlayer;
        this.loaded = mCases.loaded;
        this.mFtprints = mCases.ftprints;
        this.a = this.mFtprints.a;
    }

    make(cc) {
        this.mFtprints.make(cc);
    }

    prepare_ftp() {
        this.mFtprints.prepare_ftp();
    }

    prepare_onmap() {
        this.mFtprints.prepare_onmap();
    }

    distance(cftp) {
        const x = parseInt(cftp.x);
        const y = parseInt(cftp.y);
        const dist = Mst.game.physics.arcade.distanceToXY(this.cPlayer.vPlayer, x, y);
        console.log(dist);
        return dist;
    }

    return_near() {
        const ftprints = this.a;

        for (let id in ftprints) {
            if (!ftprints[id].v) ftprints[id].v = 0;

            if (this.distance(ftprints[id]) < 35 && ftprints[id].v < 1) {
                ftprints[id].v = 1;
                ftprints[id].mfid = id;
                return ftprints[id];
            }
        }
        return null;
    }

    unpack(ftp) {
        const a_ftp = ftp.split("|");
        if (a_ftp[0] === 'ftp') return {
            type: a_ftp[0],
            m: parseInt(a_ftp[1]),
            x: parseInt(a_ftp[2]),
            y: parseInt(a_ftp[3]),
            xy: a_ftp[2]  + "|" + a_ftp[3],
            mfid: parseInt(a_ftp[4])
        };
        return null;
    }

    near(ftp) {
        const eo_ftp = this.unpack(ftp);
        const ftprints = this.a;
        console.log(eo_ftp);

        if (eo_ftp) {
            if (!isNaN(eo_ftp.mfid)) {
                const fid = eo_ftp.mfid;

                if (ftprints[fid]) {
                    const n_ftp = ftprints[fid].x + "|" + ftprints[fid].y;

                    if (this.distance(ftprints[fid]) < 40 && n_ftp === eo_ftp.xy) {
                        return true;
                    }
                }
            } else {
                for (var id in ftprints) {
                    const n_ftp = ftprints[id].x + "|" + ftprints[id].y;

                    if (this.distance(ftprints[id]) < 40 && n_ftp === eo_ftp.xy) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    test(nid, ftp) {
        const ret = {
            b: false,
            id: -1,
            type: "",
            len: -1
        };
        const eo_ftp = this.unpack(ftp[nid]);
        console.log(eo_ftp);

        if (eo_ftp) {
            if (!isNaN(eo_ftp.mfid)) {
                let n_ftp = 0;
                let n_oev14 = 0;
                let id_oev14 = -1;
                let last_a2 = "";
                for (let id in ftp) {
                    const eo_ftp2 = this.unpack(ftp[id]);

                    if (eo_ftp2) {
                        n_ftp++;
                    } else {
                        const a_evi = ftp.split("|");
                        if (a_evi[0] === '14') {
                            n_oev14++;
                            id_oev14 = id;
                            ret.type = a_evi[1];
                            ret.len = a_evi.length;
                            console.log(a_evi);
                            console.log(ret);
                            last_a2 = a_evi[ret.len - 1].substr(0,1);
                            console.log(last_a2);
                        }
                    }
                }

                console.log("F: " + n_ftp + " 14: " + (ret.len - 2));
                ret.b = (n_ftp > (ret.len - 2));

                if (last_a2 === 'M') ret.b = false;

                ret.id = id_oev14;
                console.log(ret);
            }
        }

        return ret;
    }

    get_badge_val(b_id, b_key, uid, type, context) {
        return this.cPlayer.cases.get_badge_val(b_id, b_key, uid, type, context);
    }

    investigate(ncase, nid) {
        const ftp = ncase.evidences;

        console.log("Investigate ftp: " + ftp[nid]);

        let n_evidence = "";
        const eo_ftp = this.unpack(ftp[nid]);
        console.log(eo_ftp);

        if (eo_ftp) {
            if (!isNaN(eo_ftp.mfid)) {
                const fid = eo_ftp.mfid;
                const t_ftp = this.a[fid];

                const bb = this.test(nid, ftp);
                if (bb.b) {
                    let oev14_type = "new";
                    let oev14_id = -1;
                    if (bb.n > -1) {
                        oev14_type = bb.type;
                        oev14_id = bb.id;
                    }

                    console.log(oev14_type);
                    const pcid = parseInt(t_ftp.pcid);
                    const uid = parseInt(t_ftp.culprit);
                    const oev14_ftp = ftp[oev14_id];

                    switch (oev14_type) {
                        case "new":
                            const cont2 = "14|W|" + pcid  + "|" + nid;
                            const full_case = ncase.get_full(cont2);

                            console.log(pcid);
                            console.log(full_case);

                            if (full_case) n_evidence = "14|W|" + full_case.gweek + "|" + oev14_id;
                        break;
                        case "W":
                            const len = bb.len;
                            console.log(len);
                            switch (len) {
                                case 3: {
                                    const cont2 = oev14_ftp + "|F|" + pcid + "|" + oev14_id;

                                    const ub_val = this.get_badge_val("14", "F", uid, "player", cont2);
                                    if (ub_val) n_evidence = oev14_ftp + "|F" + ub_val + "|" + oev14_id;
                                break;
                                }
                                case 4: {
                                    const cont2 = oev14_ftp + "|S|" + pcid + "|" + oev14_id;

                                    const ub_val = this.get_badge_val("14", "S", uid, "player", cont2);
                                    if (ub_val) n_evidence = oev14_ftp + "|S" + ub_val + "|" + oev14_id;
                                break;
                                }
                                case 5: {
                                    const cont2 = oev14_ftp + "|H|" + pcid + "|" + oev14_id;

                                    const ub_val = this.get_badge_val("14", "H", uid, "player", cont2);
                                    if (ub_val) n_evidence = oev14_ftp + "|H" + ub_val + "|" + oev14_id;
                                break;
                                }
                                case 6: {
                                    const cont2 = oev14_ftp + "|M|" + pcid + "|" + oev14_id;

                                    const ub_val = this.get_badge_val("14", "M", uid, "player", cont2);
                                    if (ub_val) n_evidence = oev14_ftp + "|M" + ub_val + "|" + oev14_id;
                                break;
                                }
                            }
                        break;
                    }
                }
            }
        }
        return n_evidence;
    }
}
