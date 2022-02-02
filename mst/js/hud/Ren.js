var Mst = Mst || {};

Mst.Ren = function (game_state, name, position, properties) {
    "use strict";
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.fixedToCamera = true;
    
    console.log("Ren: " + this.x + " " + this.y);
    
    this.p_name = properties.p_name;
    this.o_name = properties.o_name;
    this.o_type = properties.o_type;
    this.gender = properties.gender;
    this.dialogue_name = properties.dialogue_name;
    this.ren_player = this.game_state.prefabs[this.dialogue_name];
    this.p_id = properties.p_id;
    this.options = [];
    this.quest = {};
    this.all_quests = {};
    this.b_speak = false;
    
    this.new_answer_text = "";
    this.answer_context = "";
    
};

Mst.Ren.prototype = Object.create(Mst.Prefab.prototype);
Mst.Ren.prototype.constructor = Mst.Ren;

Mst.Ren.prototype.update = function () {
    "use strict";
    
    if (typeof(this.inp_speak) !== 'undefined') {
        if (this.inp_speak.value !== "") {
            //console.log(player.speak_b);
            if (!this.inp_speak.focus && this.speak_b) {
                console.log("FocusOut");
                this.option_speak_enter();
            }
//            if (this.inp_speak.value !== this.inp_speak_value) {
//                this.inp_speak_value = this.inp_speak.value;
//                console.log(this.inp_speak_value);
//            }
        }
    }
    
};

Mst.Ren.prototype.show_dialogue = function (text, options, type, heart) {
    "use strict";
    
    var okay = false;
    var player = this.game_state.prefabs.player;
    
    console.log(player.infight);
    
    if (!this.visible && player.opened_ren === "" && !player.infight) {
        player.set_opened_ren(this.name);
        this.show();

        this.game_state.hud.dialogue.show_dialogue(this.dialogue_name, this.p_name, text, type, heart);

        //this.quest.showed = true;

        if (typeof(options) !== 'undefined') {
            this.show_options(options);
        }
        
        okay = true;
    } 
    
    return okay;
};

Mst.Ren.prototype.show_question = function (text) {
    "use strict";
    
    this.game_state.hud.question.show_question(this, text);
};

Mst.Ren.prototype.next_question = function (answer_text, context) {
    "use strict";
    var wit2, wit_un, evi, a_evi, b_evi, uids, cuid, ctype, evi_str, evi_a, evi_id, evi14, week, num_week, full_case, full_person, n_evidence, cid, cmap, wmap, cont2, cgender, ub14, ub15, fsuff, ind, txt, mztxt;
    
    console.log("Next question");
    console.log(answer_text + "/" + this.new_answer_text + "/" + context);
    console.log(this);
    
    if (answer_text === '' && context === '') {
        answer_text = "Čím mohu pomoci?";
    }
    
    var question_text = "";
    
    var map = this.game_state.root_data.map_int;    
    var player = this.game_state.prefabs.player;
    uids = String(this.p_id);
    
    var act_pcid = this.game_state.hud.book.act_case;
    if (act_pcid === -1) {
        act_pcid = 0;
        this.game_state.hud.book.act_case = 0;
    }
    console.log("Act. case: " + act_pcid);
    
    if (typeof (player.cases[act_pcid].evidences) === 'undefined') {
        player.cases[act_pcid].evidences = [];
    }
    
    cid = player.cases[act_pcid].CID;
    full_case = player.get_full_case(act_pcid, "Questions|" + cid + "|" + this.dialogue_name);
            
    if (typeof (full_case.pcl) !== 'undefined') {
        cuid = parseInt(full_case.pcl.Culprit);
        ctype = "player";
        var wit = player.test_witness(-1, this.p_id, this.o_type);
        console.log(wit);
        
        if (typeof (wit) !== 'undefined') {
            wit2 = wit[act_pcid];
            wmap = parseInt(wit2.map);
        }

        cmap = parseInt(player.cases[act_pcid].M);

        if (context !== '') {
            b_evi = context.split("|");
            if (b_evi[0] === '14') {
                player.cases[act_pcid].evidences.push(context);
            }
        }

        var evidences = player.cases[act_pcid].evidences;
        console.log(evidences);

        evi_str = "";
        evi_a = [];
        week = -1;
        for (var id in evidences) {
            evi = evidences[id];
            a_evi = evi.split("|");

            if (a_evi[0] === this.o_type) {
                if (a_evi[1] === uids) {
                    evi_str = evi;
                    evi_a = a_evi;
                    evi_id = id;
                }
            }

            if (a_evi[0] === '14') {
                evi14 = evi;
                uids = String(this.p_id);
                if (a_evi[1] === 'W') {
                    week = parseInt(a_evi[2]);
                }
            }
        }

        console.log("Evi str: " + evi_str);
        console.log("week: " + week);

        if (context !== '') {
            if (b_evi[0] === this.o_type) {
                if (b_evi[1] === uids) {
                    if (evi_str === '') {
                        evi_str = context;
                        evi_a = b_evi;
                        evi_id = player.cases[act_pcid].evidences.length; 

                        player.cases[act_pcid].evidences.push(context);
                    } else {
                        evi_str = context;
                        
                        player.cases[act_pcid].evidences[evi_id] = context;
                    }
                }
            }
        }
        
        console.log("Evi str: " + evi_str);

        if (evi_str === '') { // - not witness string
            if (week < 0) { // - not time
                week = parseInt(full_case.pcl.gweek);
                num_week = player.stats.gtimeweek - week;

                if (typeof (wit2) !== 'undefined') { // - not witness string, not time, is witness
                    console.log("M: " + map + " C: " + cmap + " W: " + wmap);
                    console.log("not witness string, not time, is witness");
                    if (map === cmap || map == wmap) { // - this map = case map || = witness map
                        question_text = "Stalo se tu něco podezřelého?";                        
                    } else { // - not witness string, not time, is witness, not (this map = case map || = witness map)
                        if (this.gender === 'female') {
                            question_text = "Všimla jste si něčeho podezřelého?";
                        } else {
                            question_text = "Všiml jste si něčeho podezřelého?";
                        }
                    }                    
                    this.answer_context = "14|W|" + week;
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
                    if (typeof (wit2) !== 'undefined') {  // - not witness string, is time, is player, is witness
                        if (this.ren_player.gweek > week) {
                            if (map === cmap && map == wmap) {
                                this.new_answer_text = "Tady.";
                                this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                            } else {
                                if (wmap === cmap) {
                                    this.new_answer_text = "Tam.";
                                    this.answer_context = this.o_type + "|" + this.p_id + "|M" + wmap;
                                } else {
                                    this.new_answer_text = "Poblíž toho místa (M:" + wmap + ")";
                                    this.answer_context = this.o_type + "|" + this.p_id + "|M" + wmap;
                                }
                            }                            
                        } else {
                            this.new_answer_text = "Tady.";
                            this.answer_context = this.o_type + "|" + this.p_id + "|M" + map;
                        }
                    } else { // - not witness string, is time, is player, not witness
                        if (this.ren_player.gweek > week) {
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
            wit_un = player.unpack_witness(evi_str);
            console.log(wit_un);
            
            if (typeof (wit_un.o.K) === 'undefined') { // not know anything in string
                if (typeof (wit_un.o.M) !== 'undefined') { // has map in string
                    if (typeof (wit_un.o.F) === 'undefined') { // not know decription in string
                        if (typeof (wit_un.o.P) === 'undefined') { // not know culprit in string
                            if (this.gender === 'female') {
                                question_text = "Všimla jste si něčeho podezřelého?";
                            } else {
                                question_text = "Všiml jste si něčeho podezřelého?";
                            }

                            if (typeof (wit2) !== 'undefined') {  // is witness
                                if (map === cmap && map == wmap) {                  
                                    this.answer_context = evi_str + "|P1";
                                    if (this.gender === 'female') {
                                        this.new_answer_text = "Viděla jsem pachatele."
                                    } else {
                                        this.new_answer_text = "Viděl jsem pachatele."
                                    }
                                } else {
                                    this.answer_context = evi_str + "|P0";
                                    if (this.gender === 'female') {
                                        this.new_answer_text = "Nejsem si jistá."
                                    } else {
                                        this.new_answer_text = "Nejsem si jistý."
                                    }
                                }
                            } else { // has witness str, not K, is map, not culprit, not witness
                                this.answer_context = evi_str + "|K0";
                                this.new_answer_text = "O ničem nevím.";
                            }
                        } else { // has witness str, not K, has M map, has P culprit
                            if (wit_un.o.P === "1") {
                                question_text = "Můžete ho popsat?";
                                cont2 = evi_str + "|P1|" + evi_id;
                                full_person = player.get_full_person(cuid, ctype, cont2);
                                
                                this.answer_context = evi_str + "|K0";
                                ub14 = player.unpack_badge("14", cuid, ctype, cont2);
                                ub15 = player.unpack_badge("15", cuid, ctype, cont2);
                                if (typeof (ub15) !== 'undefined') {
                                    cgender = full_person.gender;
                                    if (cgender === 'male') {
                                        fsuff = "";
                                        mztxt = "muž";
                                        this.answer_context = evi_str + "|R" + ub15.R + "|GM";
                                    } else {
                                        fsuff = "a";
                                        mztxt = "žena";
                                        this.answer_context = evi_str + "|R" + ub15.R + "|GF";
                                    }
                                    ind = parseInt(ub15.R);
                                    txt = this.game_state.core_data.rasa[ind];
                                    this.new_answer_text = "Byl to " + txt + ", " + mztxt + ".";

                                    if (typeof (ub14) !== 'undefined') {
                                        this.answer_context += "|14H" + ub14.H;
                                        this.new_answer_text += " Výška " + ub14.H + " cm.";
                                    }

                                    this.answer_context += "|A" + ub15.A;
                                    this.new_answer_text += " Věk asi " + ub15.A + " let.";

                                    ind = parseInt(ub15.F);
                                    txt = this.game_state.core_data.postava[ind];
                                    this.answer_context += "|F" + ub15.F;
                                    this.new_answer_text += " Postava " + txt + ".";
                                }
                            } else {                            
                                if (this.gender === 'female') {
                                    question_text = "Neviděla jste tohoto podezřelého?";
                                    this.new_answer_text = "Viděla."
                                } else {
                                    question_text = "Neviděl jste tohoto podezřelého?";
                                    this.new_answer_text = "Viděl."
                                }
                                this.answer_context = evi_str.substr(0, evi_str.length - 3) + "|P1";
                            }
                        }
                    }
                }
            }
        }
        console.log(answer_text + "/" + question_text + "/" + this.new_answer_text  + "/" + this.answer_context);

        this.game_state.hud.dialogue.hide_dialogue_onclick(1);
        this.show_dialogue(answer_text);
        if (question_text !== "") {
            this.game_state.game.time.events.add(Phaser.Timer.SECOND * 0.7, this.show_question, this, question_text);
        }
    }
};

Mst.Ren.prototype.new_quest = function (quest) {
    "use strict";
    this.quest = quest;
    this.quest.ow_name = this.o_name;
};

Mst.Ren.prototype.get_quest_ptext = function (ind) {
    "use strict";
    var text;
    
    if (ind === 0) {
        text = this.quest.properties.ptexts[0].t;
        this.quest.i_point = 0;
        this.quest.i_point_m = this.quest.properties.ptexts.length;
    } else {
        this.quest.i_point++;
        if (this.quest.i_point < this.quest.i_point_m) {
            text = this.quest.properties.ptexts[this.quest.i_point].t;
        } else {
            text = "finish";
        }
    }
    
    return text;
};

Mst.Ren.prototype.show_options = function (options) {
    "use strict";
    var key, x, y, text, text_style;
    
    x = this.game_state.hud.dialogue.x + 8;
    y = this.game_state.hud.dialogue.y + 80;
    
    text_style = {"font": "12px Arial", "fill": "#BF9F00"};
    for (key in options) {
        text = this.game_state.game.add.text(x + (60 * key), y, "", text_style);
        text.fixedToCamera = true;
        text.inputEnabled = true;
        text.input.useHandCursor = true;        
        
        switch (options[key]) {
            case "buy_sell":
                text.text = "[prodat]";
                text.events.onInputDown.add(this.buy_sell, this);
                break;
            case "mer_admin":
                text.text = "[správa]";
                text.events.onInputDown.add(this.mer_admin, this);
                break;
            case "quest":
                text.text = "[úkol]";
                text.events.onInputDown.add(this.option_quest, this);
                break;
            case "assign":
                text.text = "[přijmout]";
                text.events.onInputDown.add(this.option_assign, this);
                break;
            case "repeat":
                text.text = "[zopakovat]";
                text.events.onInputDown.add(this.option_repeat, this);
                break;
            case "speak":
                text.text = "[mluvit]";
                text.events.onInputDown.add(this.option_speak, this);
                break;
            case "rumour":
                text.text = "[fáma]";
                text.events.onInputDown.add(this.option_rumour, this);
                break;
            case "investigate":
                text.text = "[vyšetřit]";
                text.events.onInputDown.add(this.option_investigate, this);
                break;
            case "lodging":
                text.text = "[přespat]";
                text.events.onInputDown.add(this.option_lodging, this);
                break;
            case "newsppr":
                text.text = "[koupit]";
                text.events.onInputDown.add(this.option_newsppr, this);
                break;
            case "give":
                text.text = "[dát]";
                text.events.onInputDown.add(this.option_give, this);
                break;
        }
        
        this.options.push(text);
    }
};

Mst.Ren.prototype.hide_options = function () {
    "use strict";
    this.options.forEach(function (option) {
        option.destroy();
    });
};

Mst.Ren.prototype.buy_sell = function (option) {
    "use strict";
    if (this.game_state.prefabs.businessitems.type_buy) {
        this.game_state.prefabs.businessitems.set_put_type("sell");
        this.game_state.prefabs.items.set_put_type("sell");
        option.text = "[koupit]";
    } else {
        this.game_state.prefabs.businessitems.set_put_type("buy");
        this.game_state.prefabs.items.set_put_type("buy");
        option.text = "[prodat]";
    }
};

Mst.Ren.prototype.mer_admin = function (option) {
    "use strict";

        this.game_state.prefabs.businessitems.set_put_type("mer_admin");
        this.game_state.prefabs.items.set_put_type("mer_admin");
        option.text = "[správa]";
};

Mst.Ren.prototype.option_quest = function (option) {
    "use strict";
    var key, text;
    console.log(this.game_state.prefabs.player.opened_ren);
    console.log(this.quest);
    if (this.game_state.prefabs.player.opened_ren !== '') {
        this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    }
    
//    this.game_state.groups.quests.forEach(function(quest) {
//        console.log(quest);
//        console.log(this.dialogue_name);
//        if (quest.owner === this.p_id) {
//            console.log("Quest owner: " + quest.owner);
//            this.quest = quest;
//        }
//    }, this);
    
    if (typeof (this.quest.state) !== 'undefined') {
        if (this.quest.state === "pre") {
            this.quest.showed = true;
            
            if (this.quest.properties.ptype === 'multi') {
                text = this.get_quest_ptext(0);
            } else {
                this.quest.properties.ptype = "";
                text = this.quest.properties.quest_text;
            }
            console.log("\x1b[102mQuest Pre dialogue: " + this.quest.name);
            if (this.quest.properties.ending_conditions.type === 'text' || this.quest.properties.ptype === 'multi') {
                this.show_dialogue(text);
            } else {
                this.show_dialogue(text, ["assign"]);
            }            
            this.ren_player.show_bubble(3); // ! exclamation mark - quest ready
        } else {
            if (this.quest.state === "ass") {
                this.show_dialogue("Tento  úkol není dosud dokončen!", ["repeat"]);
                if (typeof(this.quest.properties.target) === 'undefined') {
                    this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
                }
            } else {
                if (this.quest.state === "acc") {
                    this.show_dialogue("Výborně! Tady máte odměnu!", [], "item");
                    console.log("\x1b[102mQuest Fin dialogue: Výborně! Tady máte odměnu! " + this.quest.name);
                    this.quest.state = "fin";
                    this.game_state.prefabs.player.finish_quest(this.quest);
                    this.ren_player.hide_bubble(0);
                    if (typeof(this.quest.properties.nextq) === 'undefined') {
                        this.quest = {};
                        console.log("Ren - Test Quest");
                        this.ren_player.test_quest();
                    }
                }
            }
        }

    } else {
        this.show_dialogue("Žádný úkol nemám!");
    } 
};

Mst.Ren.prototype.option_assign = function (option) {
    "use strict";
    //var update_quest;
//    this.quest.assigned.push({name: this.game_state.prefabs.player.name,
//                              region: this.game_state.prefabs.player.region
//                             });
//    this.quest.save.properties.assigned = this.quest.assigned;
    
    this.game_state.prefabs.player.assign_quest(this.quest);
    
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    console.log(this.quest);
    //if (typeof(this.quest.properties.target) === 'undefined') {
      this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
    //}
    
    var key = this.game_state.playerOfUsrID(this.quest.properties.target);
    if (key !== "") {
        var new_ren_player = this.game_state.prefabs[key];
        new_ren_player.ren_sprite.new_quest(this.quest);
        new_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
    }
    
    
//    update_quest = this.game_state.prefabs.player.update_quest("by_quest_name",this.quest.name);
//    if (update_quest.accomplished) {
//        this.game_state.hud.alert.show_alert("Podmínky úkolu jsou splněny!");
//    }
};

Mst.Ren.prototype.option_repeat = function (option) {
    "use strict";
    var text;
    
    console.log("Repeat quest");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    if (this.quest.state === "ass") {
        if (this.quest.properties.ptype === 'multi') {
            text = this.get_quest_ptext(0);
        } else {
            text = this.quest.properties.quest_text;
        }
        
        this.show_dialogue(text);
        if (typeof(this.quest.properties.target) === 'undefined') {
            this.ren_player.show_bubble(4); // ! exclamation mark - quest assigned
        }
    }
};

Mst.Ren.prototype.option_rumour = function (option) {
    "use strict";
    console.log("Rumour");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    var rumour = this.ren_player.rumour;
    
    if (typeof(rumour.text) !== 'undefined') {
        this.show_dialogue(rumour.text);
        this.game_state.prefabs.player.add_rumour(rumour.tid);
    }
};

Mst.Ren.prototype.option_investigate = function (option) {
    "use strict";
    console.log("Investigate");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    this.new_answer_text = "";
    this.answer_context = "";
    this.next_question("", "");
    
    //this.show_question("Stalo se tu něco podezřelého?");
};

Mst.Ren.prototype.option_speak = function () {
    "use strict";
    
    console.log("Speak");
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    var player = this.game_state.prefabs.player;
    
    var game = this.game_state.game;
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
    
    this.speak_b = true;
    player.speak_ren = this;
    this.inp_speak.startFocus();
    
    //this.inp_speak.keys = this.game_state.game.input.keyboard.addKeys({
    //    'enter': Phaser.Keyboard.ENTER
    //});
    
    //this.inp_speak.keys.enter.onDown.add(this.option_speak_enter, this);
    

    //this.inp_speak.events.onInputDown.add(this.option_speak_enter, this);
    console.log(player.speak_ren);
};

Mst.Ren.prototype.option_speak_enter = function () {
    "use strict";
    var pins;
    var player = this.game_state.prefabs.player;    
    console.log("Input down");
    
    if (this.inp_speak.value !== "" && this.speak_b) {
        this.speak_b = false;
        
        pins = this.p_id + "|" + player.usr_id + "|0|1|" + this.inp_speak.value;
        console.log(pins);

        $.get( "broadcast.php", { ins: pins} )
            .done(function( data ) {
                console.log( "Data Loaded: " + data );
        });

        this.img_speak.kill();
        this.inp_speak.kill();
        player.speak_ren = {};
    }


};

Mst.Ren.prototype.option_speak_close = function () {
    "use strict";
    console.log("Input close");
    
    if (this.inp_speak.value === "" && this.speak_b) {


        this.img_speak.kill();
        this.inp_speak.kill();
    }


};

Mst.Ren.prototype.option_lodging = function () {
    "use strict";
    var index_gold, cost, constitution, player, stress, health;
    
    cost = 10;
    player = this.game_state.prefabs.player;
    constitution = Math.ceil(parseInt(player.stats.abilities.constitution)/2 + 50);
    health = Math.ceil(parseInt(player.stats.health_max)*0.8);
    stress = Math.ceil(parseInt(player.stats.stress)*0.8);
    if (constitution < 100) {constitution = 100;}
    if (constitution > health) {health = constitution;}
    if (constitution > stress) {stress = constitution;}
    
    // ------------------------------------- test player gold --------------------------------------

    index_gold = this.game_state.prefabs.items.test_player_gold(cost);

    console.log("Index gold:" + index_gold);

    if (index_gold != -1 && player.stats.moon > 0) {

        // ------------------------------------- Player - gold ---------------------------------------

        player.subtract_item(index_gold, cost);
        
        player.add_health(health);
        player.subtract_stress(stress);
        player.new_day();
        this.game_state.prefabs.moon.subtract_moon();
        this.game_state.save_data({ "x": 503, "y": 512 }, 12, "lodging");

    } else {
        // Na to nemas
        this.game_state.hud.alert.show_alert("Na to nemáš!");
    }
};

Mst.Ren.prototype.option_newsppr = function () {
    "use strict";
    var index_gold, cost, player, ret;
    
    this.game_state.hud.dialogue.hide_dialogue_onclick(1);
    
    cost = 5;
    player = this.game_state.prefabs.player;
    
    // ------------------------------------- test player gold --------------------------------------

    index_gold = this.game_state.prefabs.items.test_player_gold(cost);

    console.log("Index gold:" + index_gold);

    if (index_gold != -1) {

        // ------------------------------------- Player - gold ---------------------------------------
        
        ret = player.add_newsppr(16); 
        
        if (ret) {
            player.subtract_item(index_gold, cost);
        } else {
            this.game_state.hud.alert.show_alert("Tyhle už máš!");
        }
    } else {
        // Na to nemas
        this.game_state.hud.alert.show_alert("Na to nemáš!");
    }
};

Mst.Ren.prototype.option_give = function () {
    "use strict";
    
    var player = this.game_state.prefabs.player;
    
    if (player.opened_chest === "") {
        var position = { x: player.x, y: player.y };
        var properties = {
            group: "shadows",
            pool: "shadows",
            stype: "shadow",
            items: "",
            closed_frame: 41,
            opened_frame: 41,        
            texture: "blank_image"
        };

        player.shadow = new Mst.Chest(this.game_state, "cpgive", position, properties);
        player.opened_chest = "cpgive";
        player.shadow.open_chest(player, player.shadow);
    }
};

Mst.Ren.prototype.show = function () {
    "use strict";
    this.visible = true;  
};

Mst.Ren.prototype.hide = function () {
    "use strict";
    this.visible = false;    
    this.game_state.prefabs.player.set_opened_ren("");
    this.hide_options();
};