class CSword {
    constructor(vSword, name, position, properties) {
        this.vSword = vSword;
        this.mSword = new MSword(this);

        this.cut_type = this.mSword.cut_type;
        this.fr_left = this.mSword.fr_left;
        this.fr_right = this.mSword.fr_right;

        this.b_pool = Mst.groups.playerbullets;
    }

    init_cPlayer(cPlayer) {
        this.cPlayer = cPlayer;
    }

    set_cut_type(ct, fl, fr) {
        this.cut_type = ct;
        this.fr_left = fl;
        this.fr_right = fr;
    }

    swing() {
        let frame = 0;
        let index = -1;
        let btest = true;
        if (this.cut_type === "fire") {
            const item = this.cPlayer.items.test(125, 1); //arrow
            console.log(item);
            if (item) {
                item.sub();
                index = item.id;

                console.log(this.cPlayer.chest.direction);
                if (this.cPlayer.chest.direction.y === 0) {
                    frame = this.fr_left;
                } else {
                    frame = this.fr_right;
                }
                this.cPlayer.work_rout("archer", "dexterity", 0, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
            } else {
                Mst.hud.alerts.show("Není střelivo!");
            }
        } else {
            if (this.vSword.direction.x === 1) {
                frame = this.fr_right;
            } else {
                frame = this.fr_left;
            }

            if (this.cut_type === "magic") {
                this.cPlayer.work_rout("magic", "intelligence", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p

                this.create_bullet(0, -1);
            }

            if (this.cut_type === "rod") {
                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p

                if (this.rod.visible) {
                    if (this.float.trembling) {
                        const rnd_test = Math.floor(Math.random() * 7);
                        switch (rnd_test) {
                            case 0:
                                this.cPlayer.items.add(241, 1); // stara bota
                                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                            case 1:
                                this.cPlayer.items.add(242, 1); // rozbita lahev
                                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                            case 2:
                                this.cPlayer.items.add(243, 1); // rasa
                                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                            case 3:
                                this.cPlayer.items.add(244, 1); // kapr
                                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                            case 4:
                                this.cPlayer.items.add(245, 1); // okoun
                                this.cPlayer.work_rout("fisher", "dexterity", 1, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;

                        }
                    }
                } else {
                    if (Mst.layers.water) {
                        const position = new Mst.Position(this.rod.x, this.rod.y + 12);
                        btest = Mst.map.checkTiles(position, "water");
                        console.log("Rod check water", btest);
                    }
                }
            }

            if (this.cut_type === "sling") {
                const item = this.cPlayer.items.test(21, 1); //stone
                console.log(item);

                if (item) {
                    item.sub();
                    this.cPlayer.work_rout("thrower", "dexterity", 0, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p

                    this.create_bullet(1, 21);
                }
            }

            if (this.cut_type === "throw") {
                console.log(this.mSword.bullet_frame);
                this.create_bullet(this.mSword.bullet_frame, this.mSword.equip_frame);

                let item = this.cPlayer.items.test(this.mSword.equip_frame, 1);

                if (!item) item = this.cPlayer.unequip();
                item.sub();

                this.cPlayer.work_rout("thrower", "dexterity", 0, 1, 1, 3); // stress, stand_exp, skill_exp, abil_p
            }
        }

        if (this.cPlayer.chest.opened) {
            const chest = this.cPlayer.chest.opened;
            this.cut_chest(chest, frame);
        }


        console.log(this.cut_type, frame, index, btest);

        return [this.cut_type, frame, index, btest];
    }

    reequip(ef) {
        this.mSword.reequip(ef);
    }

    cut_wood () {
        this.cPlayer.items.add(30, 1); // wood

        this.cPlayer.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p

        const rnd_test = Math.floor(Math.random() * 20);
        if (rnd_test < 2) {
            this.cPlayer.items.add(33, 1); // trnka
        }
    }

    cut_stone() {
        this.cPlayer.items.add(21, 1); // stone
        this.cPlayer.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p

        this.rnd_take(21, "stonebreaker");
    }

    cut_grass(tool_frame) {
        const item_spawner = Mst.itemSpawner;
        if ((tool_frame === 23 || tool_frame === 22) && item_spawner) {
            this.cPlayer.work_rout("farmer", "dexterity", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p

            //const new_field = item_spawner.new_item(227, {x: (x * 16 + 8), y: (y * 16 + 8)}, 1);
            const new_field = item_spawner.pool.create_new_chest(227);
            console.log("Grass new item", new_field);
            if (new_field) new_field.is_takeable = false;
        }
    }

    cut_chest(chest, tool_frame) {
        if (tool_frame == 2) tool_frame = 1;
        if (tool_frame == 11) tool_frame = 10;
        if (tool_frame == 14) tool_frame = 13;
        if (tool_frame == 19) tool_frame = 18;
        if (tool_frame == 21) tool_frame = 20;
        if (tool_frame == 23) tool_frame = 22;

        console.log("player.opened_chest: " + this.cPlayer.chest.opened.name + " CN: " + chest.name + " MW: " + Mst.hud.middle_window.visible + " op: " + chest.mChest.is_opened);

        if (this.cPlayer.chest.opened && !Mst.hud.middle_window.visible && chest.mChest.is_opened) {
            if (this.cPlayer.chest.opened.name === chest.name) {
                console.log("Chest frame: " + chest.mChest.closed_frame);
                console.log("Tool frame: " + tool_frame);

                var uuse = { t: tool_frame, on: chest.mChest.closed_frame };
                this.cPlayer.quests.update("use", uuse);

                const success = this.blade_work(chest, tool_frame);

                if (!success) {
                    switch (tool_frame) {
                        case 1: //sekera
                            switch (chest.mChest.closed_frame) {
                                case 7: { //dřevo
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 20: { //krovi
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p

                                    chest.cChest.rnd_take(20, "forager");
                                break;
                                }
                                case 22: { //parez
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 30: {//kmen
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.change_frame(31);

                                        chest.cChest.items.add(31, 1); //špalek
                                        this.cPlayer.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    }  else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                                case 31: { //špalek
                                    const item = chest.cChest.items.test(30, 1); //kmen
                                    console.log(item);
                                    if (item) {
                                        item.sub();
                                        chest.cChest.items.add(31, 2); //špalek
                                        chest.updated(31);
                                        this.cPlayer.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        const item = chest.cChest.items.test(31, 1);
                                        console.log(item);
                                        if (item) {
                                            item.sub();
                                            chest.cChest.items.add(32,2); //prkno
                                            chest.updated(31);
                                            this.cPlayer.quests.update("make", 32);
                                            this.cPlayer.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                        } else {
                                            const item = chest.cChest.items.test(32, 1);
                                            console.log(item);
                                            if (item) {
                                                item.sub();
                                                chest.cChest.items.add(24, 2); // hůl
                                                chest.updated(31);
                                                this.cPlayer.work_rout("woodcutter", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                            }
                                        }
                                    }
                                break;
                                }
                                case 43: { //větev
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);

                                    this.cPlayer.work_rout("woodcutter", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 91: { //hrib
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                default:
                                break;
                            }
                        break;
                        case 3: //krumpáč
                            switch (chest.mChest.closed_frame) {
                                case 20: { //krovi
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p

                                    chest.cChest.rnd_take(20, "forager");
                                break;
                                }
                                case 21: { //kámen
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.change_frame(58); //op. kamen
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    }  else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.mChest.is_takeable = true;
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }

                                    chest.cChest.rnd_take(21, "stonebreaker");
                                break;
                                }
                                case 22: { //parez
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 58: { //op. kámen
                                    const item = chest.cChest.items.test(21, 1); //kámen
                                    console.log(item);
                                    if (item) {
                                        item.sub();
                                        chest.cChest.items.add(58, 2); //op. kámen
                                        chest.updated(58);
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        const item = chest.cChest.items.test(58, 1);
                                        console.log(item);
                                        if (item) {
                                            item.sub();
                                            chest.cChest.items.add(59,2); //kam. blok
                                            this.cPlayer.quests.update("make", 59);
                                            chest.updated(58);
                                            this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                        } else {
                                            const item = chest.cChest.items.test(59, 1);
                                            console.log(item);
                                            if (item) {
                                                item.sub();
                                                chest.cChest.items.add(111, 5); //brousek
                                                chest.updated(58);
                                                this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                            } else {
                                                const in_chest = chest.cChest.items.take_all();
                                                this.cPlayer.items.put_all(in_chest);
                                                chest.mChest.is_takeable = true;
                                                chest.cChest.get_chest(chest);
                                                this.cPlayer.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                                chest.cChest.rnd_take(21, "stonebreaker");
                                            }
                                        }
                                    }
                                break;
                                }
                                case 59: //kam. blok
                                    chest.change_frame(60); //kam. nádoba
                                    this.cPlayer.quests.update("make", 60);
                                    this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                case 91: { //hrib
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.mChest.is_takeable = true;
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                default:
                                break;
                            }
                        break;
                        case 4: //hul
                            switch (chest.mChest.closed_frame) {
                                case 21: { //kámen
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.cChest.get_chest(chest);
                                        let item = this.cPlayer.items.test(21, 1);
                                        item.sub();
                                        item = player.unequip();
                                        item.sub();
                                        item = this.cPlayer.items.add(44, 1); // sekeromlat
                                        player.equip(item);
                                        this.cPlayer.quests.update("make", 44);
                                        this.cPlayer.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                                case 31: { //špalek
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.cChest.get_chest(chest);
                                        let item = this.cPlayer.items.test(31, 1);
                                        item.sub();
                                        item = player.unequip();
                                        item.sub();
                                        item = this.cPlayer.items.add(38, 1); // palice
                                        player.equip(item);
                                        this.cPlayer.quests.update("make", 38);
                                        this.cPlayer.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                                case 98: { //zelezo
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.cChest.get_chest(chest);
                                        let item = this.cPlayer.items.test(98, 1);
                                        item.sub();
                                        item = player.unequip();
                                        item.sub();
                                        item = this.cPlayer.items.add(107, 1); // kladivo
                                        player.equip(item);
                                        this.cPlayer.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                            }
                        break;
                        case 8: //palice
                            switch (chest.mChest.closed_frame) {
                                case 4: { //truhla
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("forager", "exploration", 1, 1, 1, 1); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 29: { //prac. stůl
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length > 0) {
                                        const recipe = [{f: 59, q: 20}]; //20 kam. blok
                                        if (chest.cChest.items.compare(in_chest, recipe)) {
                                            const item = chest.cChest.items.test(59, 20);
                                            item.sub();
                                            chest.cChest.items.add(64, 1); // kam. pec
                                            chest.updated(29);
                                            this.cPlayer.work_rout("builder", "dexterity", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                        }
                                    }
                                break;
                                }
                                case 31: { //špalek
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length > 0) {
                                        const recipe = [{f: 24, q: 4}, {f: 32, q: 2}]; //4 hole, 2 prkna
                                        if (chest.cChest.items.compare(in_chest, recipe)) {
                                            let item = chest.cChest.items.test(24, 4);
                                            item.sub(4);
                                            item = chest.cChest.items.test(32, 2);
                                            item.sub(2);
                                            chest.cChest.items.add(29, 1); // prac. stůl
                                            this.cPlayer.quests.update("make", 29);
                                            chest.updated(31);
                                            this.cPlayer.work_rout("toolmaker", "exploration", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                        }
                                    }
                                break;
                                }
                            }
                        break;
                        case 9: //větev
                            switch (chest.mChest.closed_frame) {
                                case 21: { //kámen
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.cChest.get_chest(chest);
                                        let item = this.cPlayer.items.test(21, 1);
                                        item.sub();
                                        item = player.unequip();
                                        item.sub();
                                        item = this.cPlayer.items.add(44, 1); // sekeromlat
                                        player.equip(item);
                                        this.cPlayer.quests.update("make", 44);
                                        this.cPlayer.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                                case 31: { //špalek
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.cChest.get_chest(chest);
                                        let item = this.cPlayer.items.test(31, 1);
                                        item.sub();
                                        item = player.unequip();
                                        item.sub();
                                        item = this.cPlayer.items.add(38, 1); // palice
                                        player.equip(item);
                                        this.cPlayer.work_rout("toolmaker", "dexterity", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("forager", "exploration", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                            }
                        break;
                        case 10: //sekeromlat
                            switch (chest.mChest.closed_frame) {
                                case 21: { //kámen
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length < 1) {
                                        chest.change_frame(58); //op. kamen
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    }  else {
                                        chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.mChest.is_takeable = true;
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                    }

                                    chest.cChest.rnd_take(21, "stonebreaker");
                                break;
                                }
                                case 58: { //op. kámen
                                    const item = chest.cChest.items.test(21, 1); //kámen
                                    console.log(item);
                                    if (item) {
                                        item.sub();
                                        chest.cChest.items.add(58, 2); //op. kámen
                                        chest.updated(58);
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 3, 2, 3); // stress, stand_exp, skill_exp, abil_p
                                    } else {
                                        const in_chest = chest.cChest.items.take_all();
                                        this.cPlayer.items.put_all(in_chest);
                                        chest.mChest.is_takeable = true;
                                        chest.cChest.get_chest(chest);
                                        this.cPlayer.work_rout("stonebreaker", "strength", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                        chest.cChest.rnd_take(21, "stonebreaker");
                                    }
                                break;
                                }
                            }
                        break;
                        case 13: //kladivo
                            switch (chest.mChest.closed_frame) {
                                case 98: { //zelezo
                                    const item = chest.cChest.items.test(105, 1); //zhav. zelezo
                                    console.log(item);
                                    if (item) {
                                        item.sub();
                                        chest.change_frame(108); //kovadlina
                                        this.cPlayer.work_rout("smith", "strength", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                    }
                                break;
                                }
                                case 108: { //kovadlina
                                    const in_chest = chest.cChest.items.in_chest_ord();
                                    console.log(in_chest.length);

                                    if (in_chest.length > 0) {
                                        const recipe = [{f: 24, q: 1}, {f: 105, q: 1}, {f: 111, q: 1}]; //hul, zhav.zelezo, brousek
                                        if (chest.cChest.items.compare(in_chest, recipe)) {
                                            let item = chest.cChest.items.test(24, 1);
                                            item.sub();
                                            index = chest.cChest.items.test(105, 1);
                                            item.sub();
                                            chest.cChest.items.add(0, 1); // sekera
                                            chest.updated(108);
                                            this.cPlayer.work_rout("smith", "strength", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                        } else {
                                            const recipe = [{f: 24, q: 1}, {f: 109, q: 1}]; //hul, zhav.zel.tyc
                                            if (chest.cChest.items.compare(in_chest, recipe)) {
                                                let item = chest.cChest.items.test(24, 1);
                                                item.sub();
                                                index = chest.cChest.items.test(109, 1);
                                                item.sub();
                                                chest.cChest.items.add(2, 1); // krumpac
                                                chest.updated(108);
                                                this.cPlayer.work_rout("smith", "strength", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                            } else {
                                                const item = chest.cChest.items.test(105, 1); //zhav. zelezo
                                                console.log(item);
                                                if (item) {
                                                    item.sub();
                                                    chest.cChest.items.add(109, 2); // zhav.zel.tyc
                                                    this.cPlayer.work_rout("smith", "strength", 1, 4, 3, 3); // stress, stand_exp, skill_exp, abil_p
                                                }
                                            }
                                        }
                                    }
                                break;
                                }
                            }
                        break;
                        case 18: //kropicka
                            switch (chest.mChest.closed_frame) {
                                case 139: //kvetinac zem.
                                    chest.change_frame(158); //kvetinac zem. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 20, 15, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                case 140: { //kvetinac saz.
                                    chest.change_frame(159); //kvetinac saz. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                    this.cPlayer.work_rout("herbology", "intelligence", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 141: { //kvetinac rost.
                                    chest.change_frame(160); //kvetinac rost. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                    this.cPlayer.work_rout("herbology", "intelligence", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 227: { //pole
                                    chest.change_frame(229); //pole zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 20, 15, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 228: { //pole sem.
                                    chest.change_frame(230); //pole sem. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 231: { //pole saz.
                                    chest.change_frame(233); //pole saz. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 232: { //pole rost.
                                    chest.change_frame(234); //pole rost. zal.
                                    chest.save.properties.ctime = Mst.time;
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 50, 45, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                            }
                        break;
                        case 22: //motyka
                            switch (chest.mChest.closed_frame) {
                                case 227: { //pole
                                    chest.mChest.is_takeable = true;
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                                case 229: { //pole zal
                                    chest.mChest.is_takeable = true;
                                    const in_chest = chest.cChest.items.take_all();
                                    this.cPlayer.items.put_all(in_chest);
                                    chest.cChest.get_chest(chest);
                                    this.cPlayer.work_rout("farmer", "dexterity", 1, 2, 1, 3); // stress, stand_exp, skill_exp, abil_p
                                break;
                                }
                            }
                        break;


                    }
                }
            }
        }
    }

    blade_work(chest, tool_frame) {
        let success = false;
        const work = Mst.items[chest.mChest.closed_frame].properties.work;

        if (work) {
            console.log(work);
            const tw = work[tool_frame];
            console.log(tw);

            if (tw) {
                switch (tw.act) {
                    case "take": {
                        const in_chest = chest.cChest.items.take_all();
                        this.cPlayer.items.put_all(in_chest);
                        chest.mChest.is_takeable = true;
                        chest.cChest.get_chest(chest);
                        this.cPlayer.work_rout(tw.skill, tw.ability, tw.w[0], tw.w[1], tw.w[2], tw.w[3]);
                        chest.cChest.rnd_take(chest.mChest.closed_frame, tw.skill);
                        success = true;
                    break;
                    }
                    case "rtake":
                        this.cPlayer.work_rout(tw.skill, tw.ability, tw.w[0], tw.w[1], tw.w[2], tw.w[3]);
                        chest.cChest.rnd_take(chest.mChest.closed_frame, tw.skill);
                        success = true;
                    break;
                    case "change": {
                        const empty = (tw.empty === 'true');

                        if (empty) {
                            const in_chest = chest.cChest.items.in_chest_ord();

                            if (in_chest.length < 1) {
                                chest.change_frame(tw.i);
                                if (typeof(tw.padd) !== 'undefined') {
                                    this.cPlayer.items.add(tw.padd, 1);
                                }
                            }
                        } else {
                            chest.change_frame(tw.i);
                            if (typeof(tw.padd) !== 'undefined') {
                                this.cPlayer.items.add(tw.padd, 1);
                            }
                        }

                        this.cPlayer.work_rout(tw.skill, tw.ability, tw.w[0], tw.w[1], tw.w[2], tw.w[3]);
                        success = true;
                    break;
                    }
                    case "changeitem":
                        for (const item of tw.item) {
                            console.log(item);
                            const item2 = chest.cChest.items.test(item.i, 1);
                            console.log(item2);
                            if (item2) {
                                item2.sub();
                                if (typeof(item.q) !== 'undefined') {
                                        chest.cChest.items.add(item.add, item.q);
                                    } else {
                                        chest.cChest.items.add(item.add, 1);
                                    }
                                this.cPlayer.work_rout(item.skill, item.ability, item.w[0], item.w[1], item.w[2], item.w[3]);
                                success = true;
                                break;
                            }
                        }
                    break;
                    case "recipe": {
                        const in_chest = chest.cChest.items.in_chest_ord();
                        console.log(in_chest.length);

                        if (in_chest.length > 0) {
                            if (chest.cChest.items.compare(in_chest, tw.recipe)) {
                                for (const recipe of tw.recipe) {
                                    const item = chest.cChest.items.test(recipe.f, recipe.q);
                                    item.sub(recipe.q);
                                }
                                if (tw.pq) {
                                    chest.cChest.items.add(tw.padd, tw.pq);
                                } else {
                                    chest.cChest.items.add(tw.padd, 1);
                                }
                                this.cPlayer.quests.update("make", tw.padd);
                                this.cPlayer.work_rout(tw.skill, tw.ability, tw.w[0], tw.w[1], tw.w[2], tw.w[3]);
                                success = true;
                            }
                        }
                    break;
                    }
                    case "cond": {
                        const in_chest = chest.cChest.items.in_chest_ord();
                        console.log(in_chest.length);

                        if (in_chest.length < 1) {
                            const cond = tw.cond[0];
                            chest.change_frame(cond.i);
                            chest.cChest.items.add(cond.add, 1);
                            this.cPlayer.work_rout(cond.skill, cond.ability, cond.w[0], cond.w[1], cond.w[2], cond.w[3]);
                        }  else {
                            const cond = tw.cond[0];
                            chest.cChest.items.take_all();
                            this.cPlayer.items.put_all(in_chest);
                            chest.cChest.get_chest(chest);
                            this.cPlayer.work_rout(cond.skill, cond.ability, cond.w[0], cond.w[1], cond.w[2], cond.w[3]);
                        }
                        success = true;
                    break;
                    }
                }
            }
        }

        return success;
    }

    rnd_take(frame, skill) {
        const mrtake = Mst.items[frame].properties.rtake;
        const rtake = mrtake ? mrtake : [];
        const pSkills = this.cPlayer.mPlayer.stats.skills;

        let test_ok = false;

        for (const rt of rtake) {
            const rtake_sp = rt.split("_");
            const iframe = parseInt(rtake_sp[0]);
            const level = parseInt(rtake_sp[1]);

            const rnd_core = level > 0 ? Math.max(20, 45 - pSkills[skill]) : 20;

            const rnd_test = Math.floor(Math.random() * rnd_core);
            if (rnd_test < 2 && pSkills[skill] > level) {
                this.cPlayer.items.add(iframe, 1);
                console.log("RND take sword: " + iframe);
                Mst.hud.alerts.show("Nález! " + Mst.items[iframe].name + "!");
                const exp = (level + 1)*2;
                this.cPlayer.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
                test_ok = true;
                console.log("RND take test1: " + rnd_test);
                break;
            }
        }

        const rnd_test = Math.floor(Math.random() * 20);

        console.log("RND take test2: " + rnd_test);

        if (!test_ok && rnd_test < 6) {
            const rnd_test = Math.floor(Math.random() * rtake.length);
            const rtake_sp = rtake[rnd_test].split("_");
            const iframe = parseInt(rtake_sp[0]);
            const level = parseInt(rtake_sp[1]);

            if (pSkills[skill] > level) {
                this.cPlayer.items.add(iframe, 1);
                console.log("RND take sword next: " + iframe);
                Mst.hud.alerts.show("Nález! " + Mst.items[iframe].name + "!");
                const exp = (level + 1)*2;
                this.cPlayer.work_rout("forager", "exploration", 1, exp, exp*2, 3); // stress, stand_exp, skill_exp, abil_p
                test_ok = true;
            }

        }
        return test_ok;
    }

    create_bullet(bfr, ofr) {
        const object_position = {
            x: (this.cPlayer.vPlayer.x + (this.cPlayer.chest.direction.x * 10)),
            y: (this.cPlayer.vPlayer.y + (this.cPlayer.chest.direction.y * 10))
        };

        console.log(this.cut_type);

        const object_properties = {
            direction: this.cPlayer.chest.direction,
            texture: "arrow_spritesheet",
            ctype: this.cut_type,
            firstframe: bfr,
            oldframe: ofr,
            group: "playerbullets"
        };

        if (this.cut_type === "magic") {
            object_properties.texture = "magic1";
            object_properties.firstframe = 0;
            object_properties.oldframe = -1;
        }

        let object = this.b_pool.getFirstDead();

        if (!object) {
            const object_name = "bullet_" + this.b_pool.countLiving();
            object = new Mst.Bullet(object_name, object_position, object_properties);
        } else {
            object.reset(object_position, object_properties);
            object.loadTexture(object_properties.texture, bfr);
        }
        console.log(bfr);
        console.log(object);
    }
}
