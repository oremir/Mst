class CChest extends CPrefab {
    constructor(vChest, name, position, properties) {
        super (vChest, name, position, properties, true);
        this.vChest = vChest;
        this.mChest = this.model;
    }

    init() {
        this.items = this.mChest.items;
        console.log(this);
        //console.log(JSON.stringify(this), this);
        if (this.mChest.cases) this.cases = new CCCases(this.mChest.cases);
        this.loop = new CCLoop(this, this.mChest, this.vChest);
    }

    _model() {
        return new MChest(this, this.name, this.position, this.properties);
    }

    updated(frame) {
        const ret = this.loop.updated(frame);

        console.log("Update1:");

        this.mChest.updated_save();

        return ret;
    }

    open_chest_fin() {
        Mst.hud.chestitems.show_initial_stats();
        Mst.hud.items.set_put_type("put");
        const chest = this.vChest;

        chest.open_frame();
        this.mChest.is_opened = true;
        chest.updated(this.mChest.closed_frame);

        console.log("Chest is open!");
        console.log(this);
        Mst.hud.alerts.show("Otevřena!");

        if (chest.closed_frame === 80) Mst.hud.alerts.show("Vodní zdroj");

        const rnd_test = Math.floor(Math.random() * 100);
        if (chest.s1type === "tree" && !Mst.cPlayer.ren.opened && rnd_test > 70) {
            chest.krlz_sprite =  new Mst.NPC("kurolez", {x: chest.x, y: chest.y}, {
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
            chest.krlz_sprite.touch_player();
        }

        const nloop = this.loop.count;
        const ltype = this.loop.frame;
        this.loop.done(nloop, ltype);
    }

    get_chest(chest) {
        let success = true;

        const player = Mst.player;
        const chest_name = chest.name;

        Mst.hud.items.set_put_type("equip");

        if (!player.cPlayer.chest.opened) {
            console.log("Chest is not open by player!");
            return false;
        }

        console.log("GET CHEST - is takeble: " + chest.mChest.is_takeable + " Poch: " + player.cPlayer.chest.opened.name + " Chn: " + chest_name, chest);

        if (player.cPlayer.chest.opened.name !== chest_name) {
            console.log("Chest is not open!");
            return false;
        }
        if (!chest.mChest.is_takeable) {
            console.log("Chest is not takeble!");
            return false;
        }
        if (chest.mChest.stat === "open") {
            console.log("Chest is open by any other!");
            return false;
        }
        if (chest.stats.items !== "") {
            console.log("Chest is not empty!");
            return false;
        }

        console.log(chest);

        const closed_frame = chest.mChest.closed_frame;

        switch(closed_frame) {
            case 3: //věci

            break;
            case 7: //dřevo
                player.cPlayer.items.add(32, 1); //prkno
            break;
            case 19: //ohrada
                player.cPlayer.items.add(24, 1); //hůl
            break;
            case 20: //krovi
                player.cPlayer.items.add(123, 1); //trava
            break;
            case 21: //kamen
                player.cPlayer.items.add(21, 1);

                var rnd_test = Math.floor(Math.random() * 100);
                if (rnd_test > 70) {
                    player.cPlayer.items.add(135, 1); // Stínka

                    console.log("RND take chest: 135 - stinka");
                    Mst.hud.alerts.show("Nález! " + Mst.items[135].name + "!");
                    player.cPlayer.work_rout("forager", "exploration", 1, 1, 2, 3); // stress, stand_exp, skill_exp, abil_p
                }
            break;
            case 22: //parez
                player.cPlayer.items.add(31, 1); //spalek
            break;
            case 127: //Měď. ruda
                player.cPlayer.items.add(47, 1); //Měď. ruda
            break;
            case 128: //Cín. ruda
                player.cPlayer.items.add(48, 1); //Cín. ruda
            break;
            case 129: //Žel. ruda
                player.cPlayer.items.add(97, 1); //Žel. ruda
            break;
            case 130: //Keř malý
                player.cPlayer.items.add(43, 1); //Větev
            break;
            case 131: //Strom malý
                player.cPlayer.items.add(30, 1); //Kmen
            break;
            case 213: //bariera II
                player.cPlayer.items.add(43, 1); //vetev
            break;
            case 227: //pole
                player.cPlayer.items.add(238, 1); //hlina
            break;
            case 229: //pole zal.
                player.cPlayer.items.add(238, 1); //hlina
            break;
            default: //ostatní bedny
                player.cPlayer.items.add(closed_frame, 1);
            break;
        }

        if (chest.mChest.sskill !== "") {
            player.cPlayer.work_rout(chest.mChest.sskill, "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
        }

        this.mChest.get_chest_core(chest);

        return success;
    }

    rnd_take(frame, skill) {
        console.log("RND take CHEST!!! Level: " + this.level);

        const player = Mst.player;
        let rtake = Mst.items[frame].properties.rtake;

        if (!rtake) rtake = [];

        let max = rtake.length;
        if (this.level > 0) {
            if (this.level < rtake.length) max = this.level + 1;
        }

        let test_ok = false;

        for (let i = 0; i < max; i++) {
            const rtake_sp = rtake[i].split("_");
            const iframe = parseInt(rtake_sp[0]);
            const level = parseInt(rtake_sp[1]);

            let rnd_core = 20;
            if (level > 0) {
                rnd_core = Math.max(20, 50 - player.mPlayer.level(skill));
            }

            const rnd_test = Math.floor(Math.random() * rnd_core);
            console.log("RND test " + rnd_test);
            if (rnd_test < 3 && player.mPlayer.level(skill) > level) {
                player.cPlayer.items.add(iframe, 1);
                console.log("RND take chest: " + iframe);
                Mst.hud.alerts.show("Nález! " + Mst.items[iframe].name + "!");
                const exp = (level + 1)*2;
                player.cPlayer.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
                test_ok = true;
                break;
            }
        }

        const rnd_test1 = Math.floor(Math.random() * 20);

        console.log("RND take test2: " + rnd_test1);

        if (!test_ok && rnd_test1 < 6 && rtake.length > 0) {
            const rnd_test = Math.floor(Math.random() * rtake.length);
            const rtake_sp = rtake[rnd_test].split("_");
            const iframe = parseInt(rtake_sp[0]);
            const level = parseInt(rtake_sp[1]);

            if (player.mPlayer.level(skill) > level) {
                player.cPlayer.items.add(iframe, 1);
                console.log("RND take sword next: " + iframe);
                Mst.hud.alerts.show("Nález! " + Mst.items[iframe].name + "!");
                const exp = (level + 1)*2;
                player.cPlayer.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
            }
        }
    }
}

class CCLoop {
    constructor(cChest, mChest, vChest) {
        this.cChest = cChest;
        this.mChest = mChest;
        this.vChest = vChest;
        this.timer = Mst.game.time.create();
        this.count = 0;
        this.frame = 0;
        this.fire = 0;
    }

    set_anim(frame) {
        switch (frame) {
            case 56:
                this.timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
                this.timer.start();
                this.frame = 56;
                return ["ficauldron", null];
            case 65:
                this.timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
                this.timer.start();
                this.frame = 65;
                return ["fifurnace", null];
            case 74:
                this.timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
                this.timer.start();
                this.frame = 74;
                return ["fiwcauldron", null];
            case 83:
                this.timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
                this.timer.start();
                this.frame = 83;
                return ["fire", null];
            case 139: // Kvetinac zem.
                if (this.mChest.s2type) {
                    if (this.mChest.s2type !== '') {
                        const ind = parseInt(this.s2type);
                        console.log(ind);
                        const plant = Mst.groups.bubbles.create(this.x - 8, this.y - 16, 'items_spritesheet', 0);
                        plant.loadTexture('items_spritesheet', ind);
                        //this.plant.frame = ind;
                        this.count = 1;
                        this.frame = 139;
                        return ["null", plant];
                    }
                }
                return ["null", null];
            case 140: // Kvetinac saz.
                this.count = 1;
                this.frame = 140;
                return ["null", null];
            case 166: // Kos
                this.count = 1;
                this.frame = 166;
                return ["null", null];
            case 227: // pole zem.
                if (this.mChest.s2type) {
                    if (this.mChest.s2type !== '') {
                        const ind = parseInt(this.s2type);
                        console.log(ind);
                        const plant = Mst.groups.bubbles.create(this.x - 8, this.y - 12, 'items_spritesheet', 0);
                        plant.loadTexture('items_spritesheet', ind);
                        this.count = 1;
                        this.frame = 227;
                        return ["null", plant];
                    }
                }
                return ["null", null];
            case 231: // pole saz.
                this.count = 1;
                this.frame = 231;
                return ["null", null];
            case 237: // salat
                console.log("Salat run");
                const vChest = this.vChest;
                this.mChest.salat_lives = 100;
                Mst.groups.NPCs.forEachAlive(function (NPC) {
                    if (NPC.stype === "tlustocerv") {
                        console.log("Tlustocerv salat run");
                        NPC.condi(true, vChest);
                    }
                }, this);
                return ["null", null];
            default:
                return ["stop", null];
        }
    }

    updated(frame) {
        let is_timed = true;
        switch (frame) {
            case 56:
                console.log("Play anim kotlik");
                return "ficauldron";
            case 65:
                console.log("Play anim vyhen");
                return "fifurnace";
            case 74:
                console.log("Play anim kotlik s vodou");
                return "fiwcauldron";
            case 83:
                console.log("Play anim ohen");
                return "fire";
            case 104:
                is_timed = true;
            break;
            case 139: //kvetinac zem.
                if (this.mChest.s1type === 'plant') { }
                is_timed = false;
            break;
            case 140:
                is_timed = true;
            break;
            case 166: // Kos
                is_timed = false;
            break;
            case 227: //pole zem.
                if (this.mChest.s1type === 'plant') {}
                is_timed = false;
            break;
            case 231: //pole saz.
                is_timed = true;
            break;
            default:
                is_timed = false;
                return "stop";
        }

        if (!this.timer.running && is_timed) {
            this.timer.add(Phaser.Timer.SECOND * 10, this.time_up, this);
            this.timer.start();
            console.log("Chest timer start!");
        }

        return null;
    }

    time_up() {
        console.log("Chest " + this.mChest.name + " time up!");
        switch (this.mChest.closed_frame) {
            case 56: //Kotlik hori
                this.vChest.change_frame(53); //Kotlik
            break;
            case 65: //Vyhen hori
                this.vChest.change_frame(64); //Vyhen
            break;
            case 74: //Kotlik s vodou hori
                this.vChest.change_frame(71); //Kotlik s vodou
            break;
            case 83: //Drevo hori
                this.vChest.change_frame(89); //Popel
            break;
            case 104: //kam. nadoba s tav.
                this.vChest.change_frame(60); //Kam. nadoba
            break;
        }

        this.count++;

        if (this.mChest.is_opened) this.done(this.loop, this.frame);
    }

    done(nloop, type) {
        const cPlayer = Mst.cPlayer;

        console.log("Loops done / l:" + nloop + " f:" + type + " time: " + (Mst.time - this.mChest.ctime)/100000);

        if (nloop > 0) {
            for (let i = 0; i < nloop; i++) {
                switch (type) {
                    case 56: { //kotlik hori
                        const item = this.cChest.items.get(92); //ohen
                        const qc = item.sub_all();
                        const quantity = Math.ceil(qc / 2);
                        this.cChest.items.add(89, quantity); //popel
                    break;
                    }
                    case 65: { //vyhen hori
                        const item = this.cChest.items.get(92); //ohen
                        const qc = item.sub_all();
                        const quantity = Math.ceil(qc / 2);
                        const quant_red = Math.floor(quantity / 2);
                        this.cChest.items.add(89, quantity); //popel
                        const item2 = this.cChest.items.get(97); //zel. ruda
                        const quant2 = item2.quantity;

                        if (quant2 > quant_red) {
                            if (quant_red > 0) {
                                item2.sub(quant_red);
                                this.cChest.items.add(103, quant_red); //tav. zelezo
                            }
                        } else {
                            if (quant2 > 0) {
                                item2.sub(quant_red);
                                this.cChest.items.add(103, quant2); //tav. zelezo
                            }
                        }
                    break;
                    }
                    case 74: { //kotlik s vodou hori
                        let item = this.cChest.items.get(92); //ohen
                        const qc = item.sub_all();
                        const quantity = Math.ceil(qc / 2);

                        const in_chest = this.cChest.items.in_chest_ord();
                        if (in_chest.length > 0) {
                            let recipe = [{f: 147, q: 1}, {f: 155, q: 1}, {f: 167, q: 1}, {f: 170, q: 1}, {f: 171, q: 1}]; //čistící lektvar
                            // destil.v. 147, čnělka šafránu 155, výměšek plísňáčka 167, oko švába 170, čistivka 171,
                            if (this.cChest.items.compare(in_chest, recipe)) {
                                console.log("Čistící lektvar");
                                item = this.cChest.items.test(147, 1);
                                item.sub();
                                item = this.cChest.items.test(155, 1);
                                item.sub();
                                item = this.cChest.items.test(167, 1);
                                item.sub();
                                item = this.cChest.items.test(170, 1);
                                item.sub();
                                item = this.cChest.items.test(171, 1);
                                item.sub();
                                this.cChest.items.add(173, 1); // čistící lektvar
                                this.vChest.updated(74);
                                cPlayer.work_rout("alchemy", "intelligence", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                            }

                            recipe = [{f: 147, q: 1}, {f: 155, q: 1}, {f: 165, q: 1}, {f: 177, q: 1}, {f: 184, q: 1}]; // antilevitační lektvar
                            // destil.v. 147, čnělka šafránu 155, list meduňky 165, kotvičník plod 177, výh. angostury 184,
                            if (this.cChest.items.compare(in_chest, recipe)) {
                                console.log("Antilevitační lektvar");
                                let item = this.cChest.items.test(147, 1);
                                item.sub();
                                item = this.cChest.items.test(155, 1);
                                item.sub();
                                item = this.cChest.items.test(165, 1);
                                item.sub();
                                item = this.cChest.items.test(177, 1);
                                item.sub();
                                item = this.cChest.items.test(184, 1);
                                item.sub();
                                this.cChest.items.add(188, 1); // antilevitační lektvar
                                this.vChest.updated(74);
                                cPlayer.work_rout("alchemy", "intelligence", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                            }

                            recipe = [{f: 33, q: 3}, {f: 81, q: 1}, {f: 193, q: 1}]; // Trnkový kompot
                            // trnka 3x 33, voda 81, cukr 193
                            if (this.cChest.items.compare(in_chest, recipe)) {
                                console.log("Trnkový kompot");
                                let item = this.cChest.items.test(33, 3);
                                this.cChest.items.subtract(item, 3);
                                item = this.cChest.items.test(81, 1);
                                item.sub();
                                item = this.cChest.items.test(193, 1);
                                item.sub();
                                this.cChest.items.add(194, 1); // Trnkový kompot
                                this.vChest.updated(74);
                                cPlayer.work_rout("cook", "dexterity", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                            }
                        }

                        item = this.cChest.items.test(91, 1); //hrib
                        if (item) {
                            item.sub();
                            const item2 = this.cChest.items.test(81, 1); //voda
                            this.cChest.items.subtract(item2, 1);
                            this.cChest.items.add(93, 1); //hrib. polevka

                            cPlayer.quests.update("make", 93);
                            cPlayer.work_rout("cook", "dexterity", 1, 50, 40, 3); // stress, stand_exp, skill_exp, abil_p
                        }

                        this.cChest.items.add(89, quantity); //popel
                    break;
                    }
                    case 83: { //drevo hori
                        const item = this.cChest.items.get(92); //ohen
                        const qc = item.sub_all();
                        const quantity = Math.ceil(qc / 2);
                        this.cChest.items.add(89, quantity); //popel
                        const in_chest = this.cChest.items.in_chest_ord();
                        if (in_chest.length > 0) {
                            for (let i = 0; i < in_chest.length; i++) {
                                const f = in_chest[i].f;
                                const cook = Mst.items[f].properties.cook;
                                if (cook) {
                                    const item = this.cChest.items.test(f, 1);
                                    item.sub();

                                    for (var j = 0; j < cook[0]; j++) {
                                        const ij = 2 * j + 1;
                                        const fc = cook[ij];
                                        const qc = cook[ij + 1];
                                        this.cChest.items.add(fc, qc);

                                    }

                                    cPlayer.work_rout("cook", "dexterity", 1, 40, 30, 3); // stress, stand_exp, skill_exp, abil_p
                                }

                            }
                        }
                    break;
                    }
                    case 104: {
                        const item = this.cChest.items.test(105, 1); //zhav. zelezo
                        if (item) {
                            item.sub();
                            this.cChest.items.add(98, 1); //zelezo
                        }
                    break;
                    }
                    case 139: {
                        let item = this.cChest.items.test(143, 1); //Safran cibulka
                        if (item) {
                            item.sub();
                            this.cChest.items.add(142, 1); //safran
                        }
                        item = this.cChest.items.test(163, 1); //Medunka cibulka
                        if (item) {
                            item.sub();
                            this.cChest.items.add(164, 1); //medunka
                        }
                        item = this.cChest.items.test(178, 1); //kotvičník cibulka
                        if (item) {
                            item.sub();
                            this.cChest.items.add(179, 1); //kotvičník
                        }
                    break;
                    }
                    case 140: {
                        let item = this.cChest.items.test(161, 1); //Safran sem.
                        if (item) {
                            item.sub();
                            this.cChest.items.add(143, 1); //safran cibulka
                        }
                        item = this.cChest.items.test(162, 1); //Medunka sem.
                        if (item) {
                            item.sub();
                            this.cChest.items.add(163, 1); //Medunka saz.
                        }
                        item = this.cChest.items.test(177, 1); //Kotvičník sem.
                        if (item) {
                            item.sub();
                            this.cChest.items.add(178, 1); //Kotvičník saz.
                        }
                    break;
                    }
                    case 166: {
                        const item = this.cChest.items.test(167, 1); //vymesek plisnacka
                        if (item < 0) {
                            var item2 = this.cChest.items.test(157, 1); //bioodpad
                            if (item2 > -1) {
                                this.cChest.items.subtract(item2, 1);
                                this.cChest.items.add(167, 1); //vymesek plisnacka
                            } else {
                                item2 = this.cChest.items.test(172, 1); //bioodpad2
                                if (item2 > -1) {
                                    this.cChest.items.subtract(item2, 1);
                                    this.cChest.items.add(167, 1); //vymesek plisnacka
                                }
                            }
                        }
                    break;
                    }
                    case 227: { //pole zem.
                        const item = this.cChest.items.test(236, 1); //salat saz.
                        if (item) {
                            item.sub();
                            this.cChest.items.add(237, 1); //salat
                        }
                    break;
                    }
                    case 231: { //pole saz.
                        const item = this.cChest.items.test(235, 1); //salat sem.
                        if (item) {
                            item.sub();
                            this.cChest.items.add(236, 1); //salat saz.
                        }
                    break;
                    }
                }
            }
            this.count = 0;
        }
    }
}

class CCCases {
    constructor(cases) {
        this.mCCases = cases;
        this.core = cases.core;
    }

    for_each(f) {
        const c = this.core.map(f);
    }

    is_empty() {
        return this.mCCases.is_empty();
    }

    set_pcid(id, pcid) {
        this.mCCases.set_pcid(id, pcid);
    }

    set_investigate() {
        this.mCCases.set_investigate();
    }

    change_taken(frame, quantity) {
        this.mCCases.change_taken(frame, quantity);
    }

    add_ftprints(cid) {
        this.mCCases.add_ftprints(cid);
    }

    steal() {
        this.mCCases.steal();
    }
}
