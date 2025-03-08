class CGame {
    constructor(vGame, properties) {
        this.vGame = vGame;
        this.mGame = new MGame(this, vGame, properties);
        this.gdata = properties;
        this.quests = new CGQuest(this.mGame);
        this.hud = new CHud(this.mGame.hud);
        this.mGame.hud.init(this.hud);
        this.groups = null;
        this.prefabs = null;
        this.cPlayer = null;
        this.mPlayer = null;
        this.cases = null;
    }
    
    create_groups(groups, groupshud) {
        this.groups = this.mGame.create_groups(groups, groupshud);
    }
    
    set_prefabs(prefabs) {
        this.prefabs = this.mGame.set_prefabs(prefabs);
    }
    
    create_persons() {
        this.mGame.create_persons();
    }
    
    init_cPlayer(cPlayer) {
        console.log("CPlayer Init");
        this.cPlayer = cPlayer;        
        this.cPlayer.init_hud(this.hud);
        this.mPlayer = cPlayer.mPlayer;
        this.cases = new CGCases(this);
        console.log(cPlayer);
        return cPlayer;
    }

    init_hud(groups) {
        this.hud.init_groups(groups);
        this.hud.init();
    }
    
    final_tests() {
        let nurse = false;

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

        const index = this.cPlayer.items.test(195, 1);
        console.log("Kompot " + index);

        this.groups.NPCs.forEachAlive(function (NPC) {
            if (NPC.stype === "kerik") {
                if (index > -1) {
                    NPC.condi(true);
                }
            }
        }, this);

        let sp_dist = 100000;
        let en_sp = null;
        this.mGame.groups.spawners.forEachAlive(function (spawner) {
            console.log("Test spawner: " + spawner.name + " " + spawner.etype);
            if (spawner.etype === "enemy") {
                //console.log(spawner);
                const dist = this.vGame.game.physics.arcade.distanceBetween(spawner, this.cPlayer.vPlayer);
                console.log("Spawner dist: " + dist);
                if (dist < sp_dist) {
                    sp_dist = dist;
                    en_sp = spawner;
                }
            }
            if (spawner.etype === "item") this.cPlayer.item_spawner = spawner;
        }, this);

        console.log(en_sp);
        if (en_sp) en_sp.activate();

        const d = new Date();
        const n = d.getTime();
        const cwait = { type: "wait", tm: n };
        this.cPlayer.quests.update("wait", cwait);

        this.cPlayer.cases.test_culprit();
        this.cases.ftprints.make(0);
        this.cases.ftprints.prepare_ftp();
        this.cases.ftprints.prepare_onmap();
    }
}

class CGQuest {
    constructor(mGame) {
        this.mGame = mGame;
        this.gdata_quests = mGame.quests.gdata_quests;
        this.gdata = mGame.gdata;
    }
    
    init() {
        this.mGame.groups.NPCs.forEachAlive(function (NPC) {
            console.log("Test Quest bubble: " + NPC.name);
            NPC.add_ren();
            NPC.init_quest();
        }, this);

        this.mGame.groups.otherplayers.forEachAlive(function (otherplayer) {
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

                const key = this.mGame.prefabs.player.stats.rumours.indexOf(tid);
                if (key < 0) this.gdata.quest.act_rumours.push(rumour);
            }
        }
        console.log(this.gdata.quest.rumours);
        console.log(this.gdata.quest.act_rumours);
    }
}

class CGCases {
    constructor(cGame) {
        this.cGame = cGame;
        this.mCases = cGame.mGame.cases;
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
        const dist = this.cGame.vGame.game.physics.arcade.distanceToXY(this.cPlayer.vPlayer, x, y);
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