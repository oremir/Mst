Mst.Ren = class extends Mst.Prefab {
    constructor(name, position, properties, rp) {
        super(name, position, properties);
        this.fixedToCamera = true;

        console.log("Ren: " + this.x + " " + this.y);

        this.p_name = properties.p_name;
        this.o_name = properties.o_name;
        this.o_type = properties.o_type;
        this.d_type = properties.d_type;
        this.gender = properties.gender;
        this.dialogue_name = properties.dialogue_name;
        const heart = Mst.cPlayer.relations.get_exp(rp);
        console.log(heart);
        this.dialogue = Mst.hud.create_dialogue(this.p_name, "", heart, this);
        this.dialogue_short = Mst.hud.create_dialogue(this.p_name, "item", heart, this);
        this.ren_player = rp;
        this.p_id = properties.p_id;
        this.quest = null;
        this.all_quests = {};
        this.b_speak = false;

        this.new_answer_text = "";
        this.answer_context = "";
    }

    update() {
        if (this.inp_speak) {
            if (this.inp_speak.value !== "") {
                if (!this.inp_speak.focus && this.b_speak) {
                    console.log("FocusOut");
                    this.option_speak_enter();
                }
    //            if (this.inp_speak.value !== this.inp_speak_value) {
    //                this.inp_speak_value = this.inp_speak.value;
    //                console.log(this.inp_speak_value);
    //            }
            }
        }
    }
    
    show_dialogue(text, options, heart, short) {
        console.log(Mst.cPlayer.fight.opened);
        
        if (this.visible || Mst.cPlayer.ren.opened || Mst.cPlayer.fight.opened) return false;
        Mst.cPlayer.ren.open(this.name);
        this.show();

        if (short || this.d_type === "item") {
            this.dialogue_short.show(text, options, heart);
        } else {
            Mst.cPlayer.items.hide();
            this.dialogue.show(text, options, heart);
        }
        return true;
    }
    
    show_question(text) {
        Mst.hud.question.show(this, text);
    }
    
    next_question(answer_text, context) {
        console.log("Next question");
        console.log(answer_text + "/" + this.new_answer_text + "/" + context);
        console.log(this);
        
        if (answer_text === '' && context === '') answer_text = "Čím mohu pomoci?";

        let question_text = "";

        const map = Mst.map_int;
        const player = Mst.player;
        const cases = player.cPlayer.cases;

        const act_pcid = cases.get_act_pcid();
        console.log("Act. case: " + act_pcid);

        const acase = cases.get_act_case();

        const cid = acase.chest.cid;
        const ccase = cases.get_act_full_case("Questions|" + cid + "|" + this.dialogue_name);

        if (ccase) {
            const cwit = acase.init_witness(this.p_id, this.o_type);
            console.log(cwit);

            const amap = acase.map;

            const awit = acase.get_witnessUID(this.p_id, this.o_type, context);
            console.log(awit);
            console.log("Evi str: " + awit.str);
            console.log("week: " + awit.week);

            if (awit.str === '') { // - not witness string
                if (awit.week < 0) { // - not time
                    const num_week = Mst.gtimeweek - ccase.gweek;

                    if (cwit) { // - not witness string, not time, is witness
                        console.log("M: " + map + " C: " + amap + " W: " + cwit.map);
                        console.log("not witness string, not time, is witness");
                        if (map === amap || map == cwit.map) { // - this map = case map || = witness map
                            question_text = "Stalo se tu něco podezřelého?";
                        } else { // - not witness string, not time, is witness, not (this map = case map || = witness map)
                            if (this.gender === 'female') {
                                question_text = "Všimla jste si něčeho podezřelého?";
                            } else {
                                question_text = "Všiml jste si něčeho podezřelého?";
                            }
                        }
                        this.answer_context = "14|W|" + ccase.gweek;
                        if (num_week > 1) {
                            this.new_answer_text = "Ano, před " + num_week + " týdny.";
                        } else {
                            if (num_week > 0) {
                                this.new_answer_text = "Ano, před týdnem.";
                            } else {
                                this.new_answer_text = "Ano, tenhle týden.";
                            }
                        }
                    } else { // - not witness string, not time, not witness
                        console.log("not witness string, not time, not witness");
                        if (this.gender === 'female') {
                            question_text = "Všimla jste si něčeho podezřelého?";
                        } else {
                            question_text = "Všiml jste si něčeho podezřelého?";
                        }
                        this.answer_context = this.o_type + "|" + this.p_id + "|K0";
                        this.new_answer_text = "O ničem nevím.";
                    }
                } else { // - not witness string, is time
                    console.log("not witness string, is time");
                    if (this.gender === 'female') {
                        question_text = "Kde jste byla v době činu?";
                    } else {
                        question_text = "Kde jste byl v době činu?";
                    }

                    if (this.o_type === 'NPC') { // - not witness string, is time, is NPC
                        this.new_answer_text = "Tady.";
                        this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                    } else { // - not witness string, is time, is player
                        if (cwit) {  // - not witness string, is time, is player, is witness
                            if (this.ren_player.gweek > awit.week) {
                                if (map === amap && map == cwit.map) {
                                    this.new_answer_text = "Tady.";
                                    this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                                } else {
                                    if (cwit.map === amap) {
                                        this.new_answer_text = "Tam.";
                                        this.answer_context = this.o_type + "|" + this.p_id + "|M" + cwit.map;
                                    } else {
                                        this.new_answer_text = "Poblíž toho místa (M:" + cwit.map + ")";
                                        this.answer_context = this.o_type + "|" + this.p_id + "|M" + cwit.map;
                                    }
                                }
                            } else {
                                this.new_answer_text = "Tady.";
                                this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                            }
                        } else { // - not witness string, is time, is player, not witness
                            if (this.ren_player.gweek > awit.week) {
                                if (this.gender === 'female') {
                                    question_text = "Všimla jste si něčeho podezřelého?";
                                } else {
                                    question_text = "Všiml jste si něčeho podezřelého?";
                                }
                                this.answer_context = this.o_type + "|" + this.p_id + "|K0";
                                this.new_answer_text = "Nevzpomínám si";
                            } else {
                                this.new_answer_text = "Tady.";
                                this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                            }
                        }
                    }
                }
            } else { // - has witness string
                if (!awit.K) { // not know anything in string
                    if (awit.M) { // has map in string
                        if (!awit.F) { // not know description in string
                            if (!awit.P) { // not know culprit in string
                                if (this.gender === 'female') {
                                    question_text = "Všimla jste si něčeho podezřelého?";
                                } else {
                                    question_text = "Všiml jste si něčeho podezřelého?";
                                }

                                if (cwit) {  // is witness
                                    if (map === amap && map == cwit.map) {
                                        this.answer_context = awit.str + "|P1";
                                        if (this.gender === 'female') {
                                            this.new_answer_text = "Viděla jsem pachatele.";
                                        } else {
                                            this.new_answer_text = "Viděl jsem pachatele.";
                                        }
                                    } else {
                                        this.answer_context = awit.str + "|P0";
                                        if (this.gender === 'female') {
                                            this.new_answer_text = "Nejsem si jistá.";
                                        } else {
                                            this.new_answer_text = "Nejsem si jistý.";
                                        }
                                    }
                                } else { // has witness str, not K, is map, not culprit, not witness
                                    this.answer_context = awit.str + "|K0";
                                    this.new_answer_text = "O ničem nevím.";
                                }
                            } else { // has witness str, not K, has M map, has P culprit
                                if (awit.P === "1") {
                                    question_text = "Můžete ho popsat?";
                                    const cont2 = awit.str + "|P1|" + awit.id;
                                    const culprit = ccase.get_culprit(cont2);
                                    this.answer_context = awit.str + "|K0";
                                    if (culprit.ub15) {
                                        let fsuff = "a";
                                        let mztxt = "žena";
                                        this.answer_context = awit.str + "|R" + culprit.R + "|GF";
                                        const cgender = culprit.gender;
                                        if (cgender === 'male') {
                                            fsuff = "";
                                            mztxt = "muž";
                                            this.answer_context = awit.str + "|R" + culprit.R + "|GM";
                                        }
                                        this.new_answer_text = "Byl to " + culprit.rasa + ", " + mztxt + ".";

                                        if (culprit.ub14) {
                                            this.answer_context += "|14H" + culprit.H;
                                            this.new_answer_text += " Výška " + culprit.H + " cm.";
                                        }

                                        this.answer_context += "|A" + culprit.A;
                                        this.new_answer_text += " Věk asi " + culprit.A + " let.";

                                        this.answer_context += "|F" + culprit.F;
                                        this.new_answer_text += " Postava " + culprit.postava + ".";
                                    }
                                } else {
                                    if (this.gender === 'female') {
                                        question_text = "Neviděla jste tohoto podezřelého?";
                                        this.new_answer_text = "Viděla.";
                                    } else {
                                        question_text = "Neviděl jste tohoto podezřelého?";
                                        this.new_answer_text = "Viděl.";
                                    }
                                    this.answer_context = awit.str.substr(0, awit.str.length - 3) + "|P1";
                                }
                            }
                        }
                    }
                }
            }
            console.log(answer_text + "/" + question_text + "/" + this.new_answer_text  + "/" + this.answer_context);

            this.dialogue.hide_onclick(1);
            this.show_dialogue(answer_text);
            if (question_text !== "") {
                Mst.game.time.events.add(Phaser.Timer.SECOND * 0.7, this.show_question, this, question_text);
            }
        }
    }

    set_quest(quest) {
        this.quest = quest;
        this.quest.ow_name = this.o_name;
    }

    buy_sell(option) {
        if (Mst.hud.businessitems.type_buy) {
            Mst.hud.businessitems.set_put_type("sell");
            Mst.hud.items.set_put_type("sell");
            option.value = "[koupit]";
        } else {
            Mst.hud.businessitems.set_put_type("buy");
            Mst.hud.items.set_put_type("buy");
            option.value = "[prodat]";
        }
    }
    
    mer_admin(option) {
            Mst.hud.businessitems.set_put_type("mer_admin");
            Mst.hud.items.set_put_type("mer_admin");
            option.value = "[správa]";
    }

    option_quest(option) {
        console.log("Option quest Ren");
        console.log(Mst.cPlayer.ren.opened);
        console.log(this.quest);
        if (Mst.cPlayer.ren.opened) {
            this.dialogue.hide_onclick(1);
            this.dialogue_short.hide_onclick(1);
        }

        if (this.quest.state) {
            switch (this.quest.state) {
                case "pre":
                    this.quest.showed = true;

                    let text = this.quest.get_text();
                    if (this.quest.ptype !== 'multi') this.quest.ptype = "";
                    console.log("\x1b[102mQuest Pre dialogue: " + this.quest.name);
                    if (this.quest.ending_conditions.type === 'text' || this.quest.ptype === 'multi') {
                        this.show_dialogue(text);
                    } else {
                        this.show_dialogue(text, ["assign"]);
                    }
                    this.ren_player.show_bubble(3); // ! exclamation mark - quest ready
                break;
                case "ass":
                    this.show_dialogue("Tento úkol není dosud dokončen!", ["repeat"]);
                    if (!this.quest.target) this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
                break;
                case "acc":
                    this.show_dialogue("Výborně! Tady máte odměnu!", [], null, "item");
                    console.log("\x1b[102mQuest Fin dialogue: Výborně! Tady máte odměnu! " + this.quest.name);
                    this.quest.finish();
                    this.ren_player.hide_bubble();
                    if (!this.quest.nextq) {
                        this.quest = null;
                        console.log("Ren - Test Quest");
                        this.ren_player.init_quest();
                    }
                break;
            }
        } else {
            this.show_dialogue("Žádný úkol nemám!");
        }
    }

    option_assign(option) {
        this.quest.assign();

        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        console.log(this.quest);
        //if (typeof(this.quest.target) === 'undefined') {
          this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
        //}

        var new_ren_player = Mst.mGame.get_person(this.quest.target, "player");
        if (new_ren_player) {
            new_ren_player.ren_sprite.set_quest(this.quest);
            new_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
        }
    }
    
    option_repeat(option) {
        console.log("Repeat quest");

        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        if (this.quest.state === "ass") {
            const text = quest.get_text();
            
            this.show_dialogue(text);
            if (!this.quest.target) {
                this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
            }
        }
    }
    
    option_rumour(option) {
        console.log("Rumour");

        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        const rumour = this.ren_player.rumour;
        
        if (rumour.text) {
            this.show_dialogue(rumour.text);
            Mst.cPlayer.add_rumour(rumour.tid);
        }
    }
    
    option_investigate(option) {
        console.log("Investigate");

        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        this.new_answer_text = "";
        this.answer_context = "";
        this.next_question("", "");

        //this.show_question("Stalo se tu něco podezřelého?");
    }
    
    option_speak() {
        console.log("Speak");

        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        const game = Mst.game;
        Phaser.Device.whenReady(function () {
            game.plugins.add(PhaserInput.Plugin);
        });

        this.img_speak = game.add.sprite(20, 310, 'alt_500_20');
        this.img_speak.fixedToCamera = true;

        this.inp_speak = game.add.inputField(22, 304, {
                font: '12px Verdana',
                fill: '#FFFFFF',
                fillAlpha: 0,
                fontWeight: 'bold',
                width: 450,
                max: 80,
                padding: 8,
                borderWidth: 1,
                borderColor: '#000',
                borderRadius: 6,
                placeHolder: 'Speak',
                textAlign: 'left',
                zoom: true
        });

        this.inp_speak.fixedToCamera = true;
        //this.inp_speak.focusOutOnEnter = false;

        this.inp_speak_value = "";

        //this.inp_speak.blockInput = false;

        this.b_speak = true;
        Mst.cPlayer.ren.speak.open(this);
        this.inp_speak.startFocus();

        //this.inp_speak.keys = Mst.game.input.keyboard.addKeys({
        //    'enter': Phaser.Keyboard.ENTER
        //});

        //this.inp_speak.keys.enter.onDown.add(this.option_speak_enter, this);

    
        //this.inp_speak.events.onInputDown.add(this.option_speak_enter, this);
        console.log(Mst.cPlayer.ren.speak.opened);
    }
    
    option_speak_enter() {
        console.log("Input down");

        if (this.inp_speak.value !== "" && this.b_speak) {
            this.b_speak = false;
            Mst.mPlayer.broadcast.send(this.p_id, this.inp_speak.value);
            this.img_speak.kill();
            this.inp_speak.kill();
            Mst.cPlayer.ren.speak.close();
        }
    }

    option_speak_close() {
        console.log("Input close");

        if (this.inp_speak.value === "" && this.b_speak) {
            this.img_speak.kill();
            this.inp_speak.kill();
        }
    }

    option_lodging() {
        const cost = 10;

        // ------------------------------------- test player gold --------------------------------------
    
        const gold = Mst.cPlayer.items.test_gold(cost);
    
        console.log("Gold", gold);
    
        if (gold && Mst.player.stats.moon > 0) {

            // ------------------------------------- Player - gold ---------------------------------------

            gold.sub(cost);
            Mst.mPlayer.sleep();
        } else {
            // Na to nemas
            Mst.hud.alerts.show("Na to nemáš!");
        }
    }

    option_newsppr() {
        this.dialogue.hide_onclick(1);
        this.dialogue_short.hide_onclick(1);

        const cost = 5;

        // ------------------------------------- test player gold --------------------------------------

        const gold = Mst.cPlayer.items.test_gold(cost);

        console.log("Gold", gold);

        if (gold) {

            // ------------------------------------- Player - gold ---------------------------------------

            const ret = Mst.cPlayer.add_newsppr(16);

            if (ret) {
                gold.sub(cost);
            } else {
                Mst.hud.alerts.show("Tyhle už máš!");
            }
        } else {
            // Na to nemas
            Mst.hud.alerts.show("Na to nemáš!");
        }
    }

    option_give() {
        const player = Mst.player;

        if (!player.cPlayer.chest.opened) {
            const position = { x: player.x, y: player.y };
            const properties = {
                group: "shadows",
                pool: "shadows",
                stype: "shadow",
                items: "",
                closed_frame: 41,
                opened_frame: 41,
                texture: "blank_image"
            };

            player.shadow = new Mst.Chest("cpgive", position, properties);
            player.cPlayer.chest.open(player.shadow);
            player.shadow.mChest.open_chest(player, player.shadow);
        }
    }
    
    show() {
        this.visible = true;
    }
    
    hide_dialogue() {
        const ren_player = this.ren_player;
        const quest = ren_player.ren_sprite.quest;
        console.log(quest);

        if (quest) {
            console.log("Hide dialogue continue / Quest name: " + quest.name);
            Mst.cPlayer.quests.hide_dialogue(ren_player);
        } else {
            Mst.mPlayer.broadcast.next();
        }
    }

    hide() {
        this.visible = false;
        Mst.cPlayer.ren.close();
        Mst.cPlayer.items.show();
    }
};