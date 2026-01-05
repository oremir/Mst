class CPlayer extends CPerson {
    constructor(vPlayer, name, position, properties) {
        super(vPlayer, name, position, properties);
        this.vPlayer = vPlayer;
        this.mPlayer = this.model;

        this.chest = new CPOpenedChest();
        this.overlap = new CPOpenedOverlap();
        this.business = new CPOpened();
        this.ren = new CPOpenedRen();
        this.signpost = new CPOpened();
        this.fight = new CPOpenedFight();

        this.items = this.mPlayer.items;
        this.quests = new CPQuests(this.mPlayer, vPlayer, this, this.mPlayer.quests);
        this.cases = new CPCases(this.mPlayer, this.mPlayer.cases, this.mPlayer.culprit);
        this.relations = new CPRelations(this.mPlayer.stats.relations);
        this.buffs = new CPBuffs(this.mPlayer.stats.buffs);
        this.followers = new CPFollowers(this.mPlayer.followers, this.mPlayer.save.properties.followers);
        this.expAlert = new CPExpAlert();

        const weapon = Mst.core.objects.sword;
        this.weapon = Mst.create_object(weapon);
        this.weapon.cSword.init_cPlayer(this);
        this.weapon.reequip(this.mPlayer.stats.equip);
        console.log(this.weapon);

        this.no_pass_OP = true;

        Mst.cGame.init.cPlayer = this;
    }

    _model() {
        return new MPlayer(this, this.name, this.position, this.properties);
    }

    key_right() {
        this.weapon.direction.x = 1;
        this.weapon.hit.scale.setTo(this.weapon.direction.x, 1);
        this.weapon.check_rod();
        this.chest.direction = {"x": 1, "y": 0};
    }

    key_left() {
        this.weapon.direction.x = -1;
        this.weapon.hit.scale.setTo(this.weapon.direction.x, 1);
        this.weapon.check_rod();
        this.chest.direction = {"x": -1, "y": 0};
    }

    key_up() {
        this.weapon.direction.y = -1;
        this.weapon.check_rod();
        this.chest.direction = {"x": 0, "y": -1};
    }

    key_down() {
        this.weapon.direction.y = 1;
        this.weapon.check_rod();
        this.chest.direction = {"x": 0, "y": 1};
    }

    key_action() {
        const opened_chest = this.chest.opened;
        console.log(opened_chest);

        if (opened_chest) {
            if (opened_chest.stats.items === '') opened_chest.cChest.get_chest(opened_chest);
        }
    }

    key_close() {
        Mst.hud.close.key();
    }

    key_change_type() {
        if (Mst.hud.items.text_bot.text !== "") Mst.hud.items.change_put_type();
    }

    unequip () {
        return this.vPlayer.unequip();
    }

    level(skill) {
        this.mPlayer.level(skill);
    }

    distance(obj) {
        return Mst.game.physics.arcade.distanceBetween(obj, Mst.player);
    }

    detect(obj) {
        return this.distance(obj) <= 200;
    }

    set_logoff() {
        const cwait = { type: "logout" };
        this.quests.update("wait", cwait);

        this.mPlayer.save.logged = false;
    }

    add_newsppr(num) {
        if (this.mPlayer.newsppr.indexOf(num) < 0) {
            ret = true;
            this.mPlayer.newsppr.push(num);
            this.mPlayer.save.properties.newsppr = this.mPlayer.newsppr;

            this.items.add(225, 1);

            Mst.hud.alerts.show("+noviny");
            return true;
        }
        return false;
    }

    work_rout(skill, ability, stress, stand_exp, skill_exp, abil_p) {
        this.mPlayer.gtime.add_minutes(4);
        this.mPlayer.add_stress(stress);
        this.mPlayer.add_exp("standard", stand_exp);
        this.mPlayer.add_exp(skill, skill_exp);
        this.add_ability(ability, abil_p, 0);
    }

    add_ability(abil, num1, num2) {
        let ability = this.mPlayer.stats.abilities[abil];

        if (!ability) ability = 8;

        ability = parseInt(ability);

        let quantity = 0;
        let rnd_test = 0;

        if (ability < 100) {
            rnd_test = Math.floor(Math.random() * 200);
        } else {
            if (ability < 500) {
                rnd_test = Math.floor(Math.random() * 1000);
            } else {
                if (ability < 900) {
                    rnd_test = Math.floor(Math.random() * 5000);
                } else {
                    if (ability < 999) {
                        rnd_test = Math.floor(Math.random() * 10000);
                    } else {
                        rnd_test = 10000;
                        ability = 999;
                    }
                }
            }
        }

        if (rnd_test < num1) quantity = 1;

        if (ability < 999) {
            quantity += num2;
        } else {
            ability = 999;
        }

        if (ability === 'constitution') {
            this.mPlayer.stats.health_max = Math.ceil(ability/2);
            const hmpom = Math.ceil(ability/4 + 80);

            if (this.mPlayer.stats.health_max < hmpom) this.mPlayer.stats.health_max = hmpom;
            if (this.mPlayer.stats.health_max < 100) this.mPlayer.stats.health_max = 100;
        }

        ability += quantity;
        this.mPlayer.stats.abilities[abil] = ability;
        this.mPlayer.save.properties.abilities[abil] = ability;
    }

    add_rumour(rumour) {
        const key = this.mPlayer.stats.rumours.indexOf(rumour);
        if (key < 0) {
            this.mPlayer.stats.rumours.push(rumour);
            this.mPlayer.save.properties.rumours = this.stats.rumours;
        }
        console.log(this.mPlayer.stats.rumours);
    }
}

class CPOpened {
    constructor() {
        this.opened = null;
    }

    open(val) {
        this.opened = val;
    }

    close() {
        this.opened = null;
    }
}

class CPOpenedRen extends CPOpened {
    constructor() {
        super();
        this.speak = new CPOpened();
    }
}

class CPOpenedFight extends CPOpened {
    constructor() {
        super();
        this.timer = Mst.game.time.create(false);
    }

    open(dist) {
        if (dist <= 70) {
            super.open(true);
        } else {
            if (!this.timer.running) {
                this.timer.add(Phaser.Timer.SECOND * 10, this.close, this);
                this.timer.start();
            }
        }
    }

    close() {
        console.log("Close fight");
        super.close();
    }
}

class CPOpenedChest extends CPOpened {
    constructor() {
        super();
        this.direction = {"x": 0, "y": 1};
        this.timer = Mst.game.time.create(false);
    }

    open(chest) {
        console.log(this.timer.length);

        if (this.timer.length < 1) {
            console.log(this);
            console.log("Open! " + chest.name + " / Stat: " + chest.mChest.stat + " / Owner: " + chest.mChest.owner + " UsrID: " + Mst.usr_id + " / ObjID: " + chest.obj_id + " / Stats: ");
            console.log(chest.stats);
            console.log(chest);

            super.open(chest);

            const cstat = chest.mChest.test_stat();

            if (cstat !== "open") {
                chest.mChest.open_chest(Mst.player, chest);
            } else {
                console.log("Chest is open by other player");
                Mst.hud.alerts.show("Otevřel ji někdo jiný!");
                this.timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                this.timer.start();
                this.close();
            }
        }

        const dist = {
            x: Mst.player.x - chest.x,
            y: Mst.player.y - chest.y
        };

        if (this.direction.x === 0) {
            if (dist.x > 0) {
                Mst.player.x++;
            } else {
                Mst.player.x--;
            }
        } else {
            if (dist.y > 0) {
                Mst.player.y++;
            } else {
                Mst.player.y--;
            }
        }
    }

    open_fin() {
        const chest = this.opened;
        if (!chest) {
            console.log("Chest not opened", this);
            return null;
        }
        
        const owner = parseInt(chest.mChest.owner);

        console.log("Player open chest fin", owner);

        if (chest.stat !== "open") {
            if (owner !== 0) {
                if (owner === Mst.usr_id) {
                    if (chest.mChest.cases.stolen) {
                        chest.mChest.mw_context = "investigate";
                        Mst.hud.middle_window.open("Vykradeno! Chcete to vyšetřit?", chest, ["no", "investigate"]);
                    }

                    chest.cChest.open_chest_fin();
                } else {
                    console.log("Chest is owned by other player");
                    chest.mChest.mw_context = "steal";
                    Mst.hud.middle_window.open("To patří jinému!", chest, ["ok", "steal"]);
                    this.timer.add(Phaser.Timer.SECOND * 0.7, function(){}, this);
                    this.timer.start();
                }
            } else {
                chest.cChest.open_chest_fin();
            }
        }
    }
    
    close() {
        super.close();
    }
}

class CPOpenedOverlap extends CPOpened {
    constructor() {
        super();
        this.timer = Mst.game.time.create(false);
    }

    open(val) {
        super.open(val);

        this.timer.add(Phaser.Timer.SECOND * 3, this.take, this);
    }

    take(overlap) {
        console.log("Hide overlap");
        console.log(overlap);

        if (overlap.opened) {
            overlap.opened.kill();
            overlap.close();

            Mst.cPlayer.items.add(180,1);
            Mst.vPlayer.body.immovable = false;
        }
    }
}

class CPExpAlert {
    constructor() {
        this.timer = Mst.game.time.create(false);
        this.o = {};
    }

    exp(skill, quantity) {
        const text = skill + " exp: +" + quantity;
        console.log(text);

        if (!this.timer.running) {
            console.log("Timer is not running");
            Mst.hud.alerts.show(text);

            this.timer.loop(Phaser.Timer.SECOND * 1.8, this.done, this);
            this.timer.start();
        } else {
            console.log("Timer is running");
            if (this.o[skill]) {
                this.o[skill].q += quantity;
            } else {
                this.o[skill] = {};
                this.o[skill].s = skill;
                this.o[skill].q = quantity;
            }
        }
    }

    done() {
        console.log("Alert timer end");
        let iz = 0;

        for (let id in this.o) {
            const eal = this.o[id];
            if (eal.q > 0) {
                const skill = eal.s;
                const text =  skill + " exp: +" + eal.q;
                Mst.hud.alerts.show(text);
                iz += eal.q;
                this.o[skill].q = 0;
            }
        }

        if (iz < 1) this.timer.stop();
    }
}

class CPRelation extends MArrayItem {
    constructor(arr, id, value){
        super(arr, id, value);
        this.exp = new MProperty(value.exp);
        this.view = this;
        this.identity = new MPrefabIdentity(this, arr.identities);
    }

    get name() {
        if (this.identity) return this.identity.name;
        return this.value.name;
    }

    get uid() {
        if (this.identity) return this.identity.id;
        return this.value.uid;
    }

    get type() {
        if (this.identity) return this.identity.type;
        return this.value.type;
    }

    eq(identity) {
        return this.identity.eq(identity.id, identity.type);
    }

    add_exp(exp) {
        console.log("Add exp", exp);
        this.exp.add(exp);
        this.save();
        console.log(this);
    }

    save() {
        this.value.exp = this.exp.save();
        return super.save();
    }
}

class CPRelations extends MArray {
    constructor(relations) {
        super(relations, true);
        this.identities = new MIdentities();
        this.name = "relations";
        this._make(relations);
        console.log(this);
    }

    _model(index, value) {
        return new CPRelation(this, index, value);
    }

    _get_model(name, uid, type, exp) {
        return {
            name: name,
            uid: uid,
            type: type,
            exp: exp
        };
    }

    _clean(relation, person) {
        for (let rel of this) {        
            if (!rel.uid) { // jen docasne !!!!!!!!
                let rname = "";
                if (person.name === 'nun_1') rname = "nun";
                if (person.name === 'merchant_0') rname = "merchant";
                if (rel.name === rname && rel.value.region === person.region && rel.type === person.otype) {
                    const model = this._new(person, rel);
                    rel = this._model(rel.id, model);
                    relation = rel;
                }
            } else {
                if (this.compare(rel, person)) {
                    for (const rel2 of this) { // jen docasne ... odstran multi
                        if (this.compare(rel2, person) && rel.id !== rel2.id) {
                            rel.add_exp(rel2.exp.get());
                            rel2.remove();
                        }
                    }
                }
            }
        }
        return relation;
    }

    _new(person, rel) {
        const uid = person.uid;
        const otype = person.otype;
        const name = person.p_name;
        const exp = rel ? rel.exp : 1;
        return this._get_model(name, uid, otype, exp);
    }

    _add_new(person) {
        const model = this._new(person);
        this.add(model);
        console.log("Push", model);
    }

    getp(person) {
        console.log("Heart get", person, this.identities);
        const identity = new MIdentity(person.uid, person.otype);
        return this.identities.get_prefab(identity);
    }

    get(uid, type) {        
        const identity = new MIdentity(uid, type);
        return this.identities.get_prefab(identity);
    }

    compare(rel, person) {
        const identity = new MIdentity(person.uid, person.otype); 
        console.log("Relation [] r type: " + rel.type + " p type: " + identity.type + " r id: " + rel.uid + " p id " + identity.id);
        return rel.eq(identity);
    }

    update(person, exp) {
        console.log("Update relation", person);
        let relation_selected = this.getp(person);
        console.log(relation_selected);
        relation_selected = this._clean(relation_selected, person);
        console.log(relation_selected);
        if (!relation_selected) return this._add_new(person);
        return relation_selected.add_exp(exp);
    }

    get_name(uid, type) {
        const relation = this.get(uid, type);
        if (relation) return relation.name;
        return "";
    }

    get_exp(person) {
        const relation = this.getp(person);
        console.log(relation, this);
        if (relation) return relation.exp.get();
        return -1;
    }
}

class CPBuffs {
    constructor(buffs) {
        this.a = buffs;

        console.log("Bufs");
        for (const buff of this.a) {
            const bufftime = parseInt(buff.endtm) - tt;
            console.log("End time: " + buff.endtm + " A time: " + tt + " Ev time: " + bufftime);
            if (bufftime > 0) {
                Mst.game.time.events.add(bufftime, this.close, this, buff);
                console.log(Mst.game.time.events);
            } else {
                this.close(buff);
            }
        }
    }

    index(btype) {
        console.log(this.a);
        for (let i in this.a) {
            console.log(btype + " " + this.a[i].btp);
            if (btype === parseInt(this.a[i].btp)) return i;
        }
        return -1;
    }

    add(btype, time) {
        const index = this.index(btype);
        const endtime = Mst.time + time * 1000;

        let btnm = "";
        switch (btype) {
                case 1:
                    btnm = "Antilevitace";
                break;
        }

        let new_buff = null;
        if (index < 0) {
            new_buff = {
                "btp" : btype,
                "btnm" : btnm,
                "endtm" : endtime
            };

            this.a.push(new_buff);
        } else {
            const newendtime = time * 1000 + parseInt(this.a[index].endtm);
            new_buff = this.a[index];
            this.a[index].endtm = newendtime;
        }

        Mst.game.time.events.add(Phaser.Timer.SECOND * time, this.close, this, new_buff);
        console.log(this.a);
    }

    close(buff) {
        console.log(buff);

        const index = this.index(buff.btp);
        if (index > -1) this.a.splice(index, 1);

        console.log(this.a);
    }
}

class CPFollowers {
    constructor(followers, st_followers) {
        this.st = st_followers;
        this.m = followers;
        this.a = [];
    }

    init() {
        for (let key in this.st) {
            const follower = this.create(key);
            if (follower) this.a[key] = follower;
        }
    }

    create(fwr) {
        const pfollower = Mst.prefabs[fwr];

        if (pfollower) {
            const name = pfollower.name;
            const position = pfollower.position;
            const properties = pfollower.save.properties;

            console.log(pfollower);
            console.log(properties);

            pfollower.destroy();

            console.log(position);
            console.log(properties);

            const follower = new Mst.Follower(name, position, properties);

            console.log(follower);
            return follower;
        } else {
            const afwr = fwr.split("_");
            const type = afwr[0];
            const id = afwr[1];
            return null;
        }
    }

    save(go_position, go_map_int) {
        console.log(this.m);

        for (let key in this.m) {
            this.m[key].save_follower(go_position, go_map_int);
        }
    }
}

class CPQuests {
    constructor(mPlayer, vPlayer, cPlayer, quests) {
        this.mQuests = quests;
        this.quest = quests.quest;
        this.ass_quest = quests.ass_quest;
        this.stat_quests = quests.core;
        this.mPlayer = mPlayer;
        this.vPlayer = vPlayer;
        this.cPlayer = cPlayer;

        console.log(mPlayer);
    }

    test(type, condition) {
        return this.mQuests.test(type, condition);
    }

    quest_by_name(name) {
        console.log(name, this.ass_quest, this.quest);
        const qid = this.ass_quest[name].qid;
        return this.quest[qid];
    }

    update(type, condition) {
        console.log('\x1b[106mAccomplish - Update: ' + type);

        console.log(this.ass_quest);
        for (let name in this.ass_quest) {
            const quest = this.quest_by_name(name);
            console.log(quest);

            if (quest.is_ass()) {
                const succ = quest.update(type, condition);
                console.log(quest);

                if (succ) {
                    const person = Mst.mGame.get_person(quest.owner, quest.owner_type);
                    if (person) {
                        person.ren_sprite.quest.state = "acc";
                        person.show_bubble(5); // ! question mark - quest accomplished
                    }
                }
            }
        }

        this.mPlayer.save.properties.quests = this.stat_quests;
        console.log(this.stat_quests);
    }

    finish(quest) {
        this.mQuests.finish(quest);

        const reward = quest.properties.reward;

        for (const rews of reward) {
            const rewa = rews.split("_");

            switch (rewa[0]) {
                case 'exp': {
                    const quantity = parseInt(rewa[1]);
                    this.mPlayer.add_exp("standard", quantity);
                    console.log("Exp +" + quantity);
                break;
                }
                case 'exps': {
                    const quantity = parseInt(rewa[2]);
                    this.mPlayer.add_exp(rewa[1], quantity);
                    console.log(rewa[1] + " +" + quantity);
                break;
                }
                case 'itm': {
                    const item_frame = parseInt(rewa[1]);
                    const quantity = parseInt(rewa[2]);
                    this.cPlayer.items.add(item_frame, quantity);
                break;
                }
            }
        }
    }

    hide_dialogue(ren_player) {
        const quest = ren_player.ren_sprite.quest;

        if (quest.nextq) {
            let is_ok = true;
            if (quest.target) {
                if (quest.target !== ren_player.usr_id) is_ok = false;
            }

            if (is_ok) {
                if (quest.state !== "pre") {
                    console.log("Next quest exist & (target not exist | target is actual) & not pre ");
                    const [new_quest, ren, text] = quest.next();
                    console.log('\x1b[102mShow dialogue tiled not pre ' + new_quest.name);
                    ren.show_dialogue(text);
                } else {
                    console.log("Next quest exist & (target not exist | target is actual) & pre");
                    console.log("Quest showed? " + quest.showed + " " + quest.state);
                    if (typeof(quest.showed) === 'undefined') {
                        quest.showed = false;
                    }
                    if (quest.ending_conditions.type === "text" && quest.showed) {
                        const [new_quest, ren, text] = quest.next();
                        console.log('\x1b[102mShow dialogue tiled pre ' + new_quest.name);
                        ren.show_dialogue(text);
                    }
                }
            } else {
                if(quest.state === 'pre') {
                    console.log("Next quest pre / other person: " + quest.name);
                } else {
                    console.log("Same quest not pre / other person: " + quest.properties.target);
                }
            }
        } else {
            console.log(quest.ending_conditions.type);
            if (quest.ending_conditions.type === "textpow" || quest.ending_conditions.type === "text") {
                quest.finish();
                ren_player.ren_sprite.quest = null;
                console.log("Tiled / not next - Test Quest");
                ren_player.init_quest();
            }
            if (quest.ptype === 'multi') {
                const text = quest.get_text(1);

                if (text !== 'finish') {
                    if (quest.is_last()) {
                        console.log('\x1b[102mShow dialogue multi end ' + quest.name);

                        if(quest.state !== 'ass') {
                            ren_player.ren_sprite.show_dialogue(text, ["assign"]);
                        } else {
                            ren_player.ren_sprite.show_dialogue(text);
                        }
                    } else {
                        console.log('\x1b[102mShow dialogue multi ' + quest.name);

                        ren_player.ren_sprite.show_dialogue(text);
                    }
                }
            }
        }
    }
}

class CPCases {
    constructor(mPlayer, cases) {
        this.mPlayer = mPlayer;
        this.case = cases.case;
        this.mCases = cases;
        this.loaded = cases.loaded;
        this.ftprints = cases.ftprints;
        this.culprit = cases.culprit;
        this.act_pcid = -1;
    }

    init_loaded(loaded, ftprints) {
        this.loaded = loaded;
        this.ftprints = ftprints;
    }

    is_empty() {
        return this.case.length < 1;
    }

    length() {
        return this.case.length;
    }

    for_each(f) {
        const c = this.case.map(f);
    }

    set_act_pcid(pcid) {
        this.act_pcid = pcid;
    }

    get_act_pcid() {
        this.act_pcid = this.act_pcid > -1 ? this.act_pcid : 0;
        return this.act_pcid;
    }

    get_act_case() {
        const pcid = this.get_act_pcid();
        return this.case[pcid];
    }

    get_act_full_case(context) {
        const pcid = this.get_act_pcid();
        const cc = this.case[pcid].get_full(context);
        return {
            cuid: parseInt(cc.Culprit),
            ctype: "player",
            gweek: parseInt(cc.gweek),
            get_culprit: this.get_act_culprit
        };
    }

    get_act_culprit(context) {
        const cc = this.get_act_full_case();
        const fp = this.get_full_person(cc.cuid, cc.ctype, context);

        const ub14 = this.unpack_badge("14", cc.cuid, cc.ctype, context);
        const ub15 = this.unpack_badge("15", cc.cuid, cc.ctype, context);

        const ind = parseInt(ub15.R);
        const rasa = Mst.core.rasa[ind];
        const ind2 = parseInt(ub15.F);
        const postava = Mst.core.postava[ind2];
        return {
            ub14: ub14,
            ub15: ub15,
            gender: fp.gender,
            R: ub15.R,
            rasa: rasa,
            F: ub15.F,
            postava: postava,
            A: ub15.A,
            H: ub14.H
        };
    }

    get_full_person(uid, type, context) {
        return this.loaded.get_full_person(uid, type, context);
    }

    get_badge_val(b_id, b_key, uid, type, context) {
        return this.mCases.get_badge_val(b_id, b_key, uid, type, context);
    }

    unpack_badge(b_id, uid, type, context) {
        return this.mCases.unpack_badge(b_id, uid, type, context);
    }

    init_witness(n, uid, type) {
        return this.mCases.init_witness(n, uid, type);
    }

    add_evidence_to_act_case(evi) {
        const pcid = this.get_act_pcid();
        this.case[pcid].add_evidence(evi);
    }

    add_ftprints_tocase(cftp) {
        const owner = parseInt(cftp.owner);
        const fpcid = parseInt(cftp.pcid);

        if (owner === this.mPlayer.usr_id) {
            if (this.case[fpcid]) {
                const n_ftp = "ftp|" + cftp.m + "|" + cftp.x + "|" + cftp.y + "|" + cftp.mfid;
                this.case[fpcid].add_evidence(n_ftp);
                return fpcid;
            }
        }
        return -1;
    }

    add_chest(c) {
        const ccases = c.cChest.cases.core;

        for (const ccase of ccases) {
            let bcc = false;
            const c_id = parseInt(ccase.ID);
            const c_cid = parseInt(ccase.CID);
            for (const acase of this.case) {
                if (acase.chest.id === c_id && acase.chest.cid === c_cid) {
                    bcc = true;
                    break;
                }
            }

            if (!bcc) {
                if (!ccase.type) ccase.type = "stolen";

                const pcid = this.mCases.add_case(ccase);
                c.cChest.set_pcid(c_id, pcid);

                console.log(this);
            }
        }
    }

    add_culprit(culprit) {
        this.culprit.push(culprit);
        return this.culprit.length - 1;
    }

    rollback_culprit(id) {
        this.culprit.splice(id, 1);
    }

    test_culprit() {
        const map = this.map;
        const new_culprit = [];

        for (const culprit of this.culprit) {
            let count = parseInt(culprit.count);
            const wt = parseInt(culprit.wt);
            const mapc = parseInt(culprit.M);
            if (map !== mapc) {
                count++;
            }

            culprit.count = count;

            if (count < 6) {
                new_culprit.push(culprit);
            } else {
                if (wt < 1 && count < 15) {
                    new_culprit.push(culprit);
                }
            }
        }

        this.culprit = new_culprit;
    }
}
