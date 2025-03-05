class MPlayer {
    constructor(cPlayer, vPlayer, name, position, properties) {
        this.vPlayer = vPlayer;
        this.cPlayer = cPlayer;
        this.mGame = vPlayer.game_state.mGame;
        this.vGame = vPlayer.game_state;
        this.hud = this.cPlayer.hud;
        this.interface = new MPInterface(name, position, properties);

        this.name = name;

        this.region = parseInt(this.vGame.gdata.map.map.region);
        this.map = this.vGame.gdata.root.map_int;
        this.p_name = this.interface.p_name;
        this.usr_id = this.interface.usr_id;

        this.walking_speed = this.interface.walking_speed;
        this.jumping_speed = this.interface.jumping_speed;
        this.bouncing = this.interface.bouncing;
        this.killed = this.interface.killed;
        this.ren_texture = this.interface.ren_texture;
        this.gender = this.interface.gender;
        this.health = this.interface.health;
        this.newsppr = this.interface.newsppr;

        this.stats = this.interface.stats;
        this.save = this.interface.save;

        console.log(this.save);

        this.followers = {};

        this.cases = new MPCases(this, this.interface.cases);
        this.quests = new MPQuests(this, this.stats.quests);

        this.gtime = new MPGTime(this.interface.gtimems, this.stats, this.save);
        this.stats.gtime = this.gtime.to_stats();
        this.stats.gtimeweek = this.gtime.week();
        this.stats.gtimeday = this.gtime.day();

        this.moon = new MPMoon(this.mGame, this, this.interface.moon, this.stats, this.save);

        //---------------------------------------------------------------------------------------------------------

        this.update_place();
        //this.quest_bubble();

        this.infight = false;

        this.broadcast = new MPBroadcast(this.vGame, this, this.interface.broadcast, this.save);

        this.shadow = {};

        console.log("Badge: ");
        console.log(this.stats.badges);

        this.stream = new MPStream(this.vGame, this.vPlayer, this.usr_id, this.gtime, this.stats);
        
        console.log("Stream fin");
        console.log(this.stream);
        
        this.mPlayer = this.mGame.init_mPlayer(this);

        //    const pusher = new Pusher('6e9750ce5661bfd14c35', {
        //      cluster: 'eu'
        //    });
        //
        //    const channel = pusher.subscribe('my-channel');
        //    channel.bind('my-event', function(data) {
        //      console.log("Pusher: " + JSON.stringify(data));
        //    });
    }
    
    init_hud(hud) {
        this.hud = hud;
    }

    add_health(quantity) {
        "use strict";

        this.health += quantity;
        this.stats.health = this.health;

        if (this.health > this.stats.health_max) this.health = this.stats.health_max;
        this.vGame.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
    }

    subtract_health(quantity) {
        "use strict";

        this.health -= quantity;
        this.stats.health = this.health;

        this.add_exp("standard", 1);
        this.cPlayer.add_ability("constitution", 3, 0);
        this.stats.stress += 1;

        this.vGame.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;

        if (this.health < 1) this.dead();
    }
    
    reset_health() {
        "use strict";
        this.health = this.stats.health_max;
        this.stats.health = this.stats.health_max;
    }
    
    dead() {
        "use strict";
        this.save.properties.killed = true;
        this.stats.stress = 0;
        this.reset_health();

        this.moon.subtract_moon();
        this.gtime.new_day(this.cPlayer);

        console.log("Region: " + this.region);

        switch (this.region) {
            case 2:
                this.mGame.save_data({ x: 178, y: 495 }, 20, "dead");
                break;
            case 3:
                this.mGame.save_data({ x: 242, y: 194 }, 41, "dead");
                break;
            default:
                this.mGame.save_data({ x: 432, y: 272 }, 4, "dead"); // "assets/maps/map4.json"
                break;
        }
    }
    
    sleep() {
        "use strict";
        let constitution = Math.ceil(parseInt(this.stats.abilities.constitution) / 2 + 50);
        let health = Math.ceil(parseInt(this.stats.health_max) * 0.8);
        let stress = Math.ceil(parseInt(this.stats.stress) * 0.8);
        if (constitution < 100) constitution = 100;
        if (constitution > health) health = constitution;
        if (constitution > stress) stress = constitution;

        this.add_health(health);
        this.subtract_stress(stress);
        this.gtime.new_day(this.cPlayer);
        this.moon.subtract_moon();
        this.mGame.save_data({ "x": this.vPlayer.x - 8, "y": this.vGame.y + 8 }, this.map, "lodging");
    }

    add_stress(quantity) {
        "use strict";

        this.cPlayer.add_ability("constitution", 2, 0);
        this.stats.stress += quantity;

        if (this.stats.stress > 50 + this.stats.abilities.constitution) this.subtract_health(1);

        this.vGame.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
    }

    subtract_stress(quantity) {
        "use strict";

        this.stats.stress -= quantity;

        if (this.stats.stress < 0) this.stats.stress = 0;

        this.vGame.prefabs.health.text_health.text = this.health + "/" + this.stats.health_max + " S:" + this.stats.stress;
    }

    add_sin(quantity) {
        "use strict";
        this.stats.sin += quantity;
    }

    add_exp(skill, quantity) {
        "use strict";

        function level_add(skill, exp, level) {
            let pom_exp;

            quantity = Math.floor(quantity);
            if (quantity < 1) {
                quantity = 1;
            }

            switch (skill) {
                case "fighter":
                    pom_exp = Math.pow(1.5, level) * 400;
                    break;
                case "woodcutter":
                    pom_exp = Math.pow(1.4, level) * 350;
                    break;
                case "stonebreaker":
                    pom_exp = Math.pow(1.4, level) * 350;
                    break;
                case "forager":
                    pom_exp = Math.pow(1.4, level) * 340;
                    break;
                case "magic":
                    pom_exp = Math.pow(1.4, level) * 380;
                    break;
                default:
                    pom_exp = Math.pow(1.6, level) * 500;
                    break;
            }

            if (exp > pom_exp) {
                return 1;
            } else {
                return 0;
            }
        }

        if (typeof this.stats.skills[skill] === "undefined") {
            this.stats.skills[skill] = { exp: 1, level: 1 };
        }

        this.stats.skills[skill].exp = parseInt(this.stats.skills[skill].exp);
        this.stats.skills[skill].level = parseInt(this.stats.skills[skill].level);

        this.stats.skills[skill].exp += quantity;
        this.stats.skills[skill].level += level_add(
            skill,
            this.stats.skills[skill].exp,
            this.stats.skills[skill].level
        );

        this.save.properties.skills[skill].exp = this.stats.skills[skill].exp;
        this.save.properties.skills[skill].level = this.stats.skills[skill].level;

        if (skill === "standard") {
            this.stats.exp = this.stats.skills[skill].exp;
            this.stats.level = this.stats.skills[skill].level;
        }

        this.cPlayer.expAlert.exp(skill, quantity);
    }

    level(skill) {
        "use strict";
        let level = 0;
        if (this.stats.skills[skill]) level = parseInt(this.stats.skills[skill].level);
        return level;
    }

    save_player(go_position, go_map_int) {
        "use strict";

        this.vPlayer.body.immovable = true;

        if (this.cPlayer.chest.opened) this.cPlayer.chest.opened.mChest.close_chest();

        this.cPlayer.cases.ftprints.make(1);

        this.save.x = go_position.x;
        this.save.y = go_position.y;

        this.save.properties.stats.health = this.health;
        this.save.properties.stats.health_max = this.stats.health_max;
        this.save.properties.stats.stress = this.stats.stress;
        this.save.properties.stats.sin = this.stats.sin;
        this.save.properties.items = this.stats.items;
        this.save.properties.equip = this.stats.equip;
        this.save.properties.expequip = this.stats.expequip;

        const dt = new Date();
        this.save.properties.time = dt.getTime();
        this.save.properties.moon = this.stats.moon;
        console.log("moon: " + this.stats.moon);

        this.save.properties.gtimems = this.gtime.ms;

        this.save.map.old_int = this.map;
        this.save.map.new_int = go_map_int;

        this.mGame.save.player = this.save;

        localStorage.setItem("player", JSON.stringify(this.save));

        this.cPlayer.followers.save(go_position, go_map_int);
    }

    update_place() {
        "use strict";
        console.log("Update place");

        let place_selected = null;

        for (let key in this.stats.places) {
            if (this.stats.places[key].map_int === this.map && this.stats.places[key].region === this.region) {
                place_selected = this.stats.places[key];
            }
        }

        //console.log(place_selected);

        if (!place_selected) {
            place_selected = {
                map_int: this.map,
                region: this.region,
                visit: 1
            };
            this.stats.places.push(place_selected);
            //console.log(place_selected);
        } else {
            place_selected.visit++;
            //console.log(place_selected);
        }
        this.save.properties.places = this.stats.places;
        console.log(this.stats.places);
    }
}

class MPInterface {
    constructor(name, position, properties) {
        console.log(properties);
        this.p_name = properties.p_name;
        this.usr_id = properties.usr_id;

        this.walking_speed = parseInt(properties.walking_speed);
        this.jumping_speed = parseInt(properties.jumping_speed);
        this.bouncing = parseInt(properties.bouncing);

        this.killed = properties.killed;
        if (typeof this.killed === "string") this.killed = properties.killed === "true";

        if (!properties.ren_texture) properties.ren_texture = "";
        this.ren_texture = properties.ren_texture;

        if (!properties.gender) properties.gender = "";
        this.gender = properties.gender;

        this.health = parseInt(properties.stats.health) || 100;

        if (!properties.newsppr) properties.newsppr = [];
        this.newsppr = properties.newsppr;

        this.cases = {};
        if (properties.culprit) {
            this.cases.culprit = properties.culprit;
        } else {
            this.cases.culprit = [];
        }

        if (properties.cases) {
            this.cases.cases = properties.cases;
        } else {
            this.cases.cases = [];
        }

        this.gtimems = parseInt(properties.gtimems);

        if (!properties.broadcast) properties.broadcast = [];
        this.broadcast = properties.broadcast;

        if (!properties.skills) {
            properties.skills = {
                standard: { exp: 1, level: 1 },
                fighter: { exp: 1, level: 1 },
                woodcutter: { exp: 1, level: 1 },
                stonebreaker: { exp: 1, level: 1 }
            };
        }

        if (!properties.stats) {
            properties.stats = {
                health: 100,
                health_max: 100,
                stress: 0
            };
        }

        if (!properties.stats.sin) properties.stats.sin = 0;

        if (!properties.abilities) {
            properties.abilities = {
                strength: 8,
                constitution: 8,
                intelligence: 8
            };
        }

        if (!properties.relations) properties.relations = [];
        if (!properties.places) properties.places = [];

        if (!properties.quests) {
            properties.quests = {
                ass: {},
                fin: []
            };
        }

        if (!properties.keys) properties.keys = [];
        if (!properties.bag) properties.bag = "";
        if (!properties.badges) properties.badges = {};
        if (!properties.rumours) properties.rumours = [];
        if (!properties.buffs) properties.buffs = [];
        if (!properties.gtimems) properties.gtimems = 0;
        if (!properties.gtimealpha) properties.gtimealpha = 0;
        if (!properties.followers) properties.followers = [];
        if (!properties.expequip) properties.expequip = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        console.log("Equip: " + properties.equip + " " + typeof properties.equip);

        this.stats = {
            health_hearts: 5,
            health: +properties.stats.health,
            health_max: +properties.stats.health_max || 100,
            stress: parseInt(properties.stats.stress),
            sin: parseInt(properties.stats.sin),
            moon_moon: 5,
            moon: parseInt(properties.moon) || 5,
            moon_max: 5,
            moon_loop: +properties.moon_loop || 0,
            time: +properties.time || 0,
            gtime: "0",
            exp: +properties.skills.standard.exp || +properties.exp || 1,
            level: +properties.skills.standard.level || 1,
            skills: properties.skills,
            abilities: properties.abilities,
            relations: properties.relations,
            places: properties.places,
            badges: properties.badges,
            rumours: properties.rumours,
            quests: properties.quests,
            buffs: properties.buffs,
            equip: properties.equip,
            expequip: properties.expequip,
            items: properties.items,
            bag: properties.bag,
            keys: properties.keys
        };

        this.moon = {
            loop: +properties.moon_loop || 0,
            moon: +properties.moon || 5,
            max: 5,
            time: +properties.time || 0
        };

        this.save = {
            type: "player",
            name: name,
            usr_id: this.usr_id,
            x: position.x,
            y: position.y,
            properties: properties,
            map: {},
            logged: true
        };
    }
}

class MPGTime {
    constructor(gtimems, stats, save) {
        this.ms = gtimems;
        this.obj = new Date(this.ms);
        this.stats = stats;
        this.save = save;

        //const dt = new Date();
        //const tt = dt.getTime();
        //console.log("Time: " + properties.time + " " + tt + " " + (tt - properties.time) + " " + Math.floor(this.gtime.ms/86400000));
    }

    to_stats() {
        const p1_time = this.obj.toLocaleTimeString();
        console.log("Date:");
        console.log(this.obj);
        const gtimepom = p1_time.split(":");

        return " " + gtimepom[0] + ":" + gtimepom[1];
    }

    get_week(time, param) {
        "use strict";

        const date = new Date(time);
        const date0 = new Date(0);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        let week1 = new Date(date0.getFullYear(), 0, 4);
        if (param > 0) week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }

    week() {
        return this.get_week(this.ms, 0);
    }

    day() {
        return this.get_week(this.ms, 1) + " " + String(this.obj).substr(0, 11);
    }

    set_time(time) {
        "use strict";

        this.ms = time;
        this.obj = new Date(this.ms);

        this.stats.gtime = this.to_stats();
        this.save.properties.gtimems = this.ms;
    }

    new_day(cPlayer) {
        "use strict";

        const cwait = { type: "sleep" };
        cPlayer.quests.update("wait", cwait);

        if (this.obj.getHours() < 7) {
            this.obj.setHours(7, 0);
        } else {
            this.obj.setDate(this.obj.getDate() + 1);
            this.obj.setHours(7, 0);
        }

        this.ms = this.obj.getTime();
        this.set_time(this.ms);
        this.save.properties.gtimealpha = 0;
    }

    add_minutes(mins, vGame) {
        "use strict";

        console.log("Hodina: " + this.obj.getHours());
        if (this.obj.getHours() < 7 || this.obj.getHours() > 20) {
            mins = 1;
            if (this.obj.getHours() < 7) {
                if (this.obj.getHours() > 2) {
                    mins = 0.25;
                }
                if (this.obj.getHours() > 4) {
                    mins = 0.01;
                }
                if (this.obj.getHours() > 5) {
                    mins = 0;
                }
            }

            this.save.properties.gtimealpha = vGame.night.add_night();
        }

        this.ms += mins * 60000;
        this.set_time(this.ms);
    }
}

class MPMoon {
    constructor(mGame, mPlayer, moon, stats, save) {
        this.mGame = mGame;
        this.mPlayer = mPlayer;
        this.stats = stats;
        this.save = save;
        this.loop = moon.loop;
        this.moon = moon.moon;
        this.max = moon.max;
        this.time = moon.time;
            
        this.timer_first = {};
        this.timer = this.mGame.vGame.game.time.create(false);  

        const dt = new Date();
        const tt = dt.getTime();

        this.loop -= tt - this.time;
        if (this.loop < 1) {
            const p_loop = -this.loop;
            let new_moon = Math.floor(p_loop / 180000);
            new_moon += this.moon;
            if (new_moon < this.max) {
                this.moon = new_moon;
                this.loop = 180000 - (p_loop % 180000);
            } else {
                this.moon = this.max;
                this.loop = 0;
            }
        }

        console.log("parse int moon");
        console.log(this.moon + " loop:" + this.loop);
        
        this.stats.moon_loop = this.loop;
        this.stats.moon = this.moon;
    }
    
    update() {
        "use strict";
        this.stats.moon_moon = Math.ceil(this.moon / Math.ceil(this.max / 5));
        if (this.moon < this.max) {        
            let time_str = this.timer.duration.toFixed(0);
            if (this.loop > 0) {
                if (!this.timer_first.time) {
                    console.log("moon und");
                    this.timer_first = this.mGame.vGame.game.time.events.add(this.loop, this.update_timer, this);
                }
                time_str = this.timer_first.timer.duration.toFixed(0);
            }
            this.mGame.prefabs.moon.text_moon.text = this.moon + "/" + this.max + " > " + Math.floor(((time_str / 1000) / 60) % 60) + ":" + Math.floor((time_str / 1000) % 60);
            this.save.properties.moon_loop = time_str;
        } else {
            this.mGame.prefabs.moon.text_moon.text = this.moon + "/" + this.max;
            this.save.properties.moon_loop = 0;
        }
    }
    
    update_timer() {
        "use strict";
        if (this.moon < this.max) {
            this.moon++;
            if (this.moon < this.max) {
                if (this.loop > 0) {
                    console.log("Moon start");
                    this.timer.loop(180000, this.update_timer, this);
                    this.timer.start();
                }
            } else {
                this.timer.stop();
            }
        } else {
            this.timer.stop();
        }
        this.loop = 0;
        
        this.stats.moon = this.moon;
        this.stats.moon_loop = this.loop;
    }
    
    subtract_moon() {
        "use strict";
        this.moon--;

        if (this.moon < 1) this.moon = 0;

        if (!this.timer.running && this.loop < 1) {
            console.log("Moon start init");
            this.timer.loop(180000, this.update_timer, this);
            this.timer.start();
            this.loop = 180000;
        } else {
            this.loop = this.timer.duration.toFixed(0);
        }
        
        this.stats.moon = this.moon;
        this.stats.moon_loop = this.loop;
    }
}

class MPBroadcast {
    constructor(vGame, mPlayer, broadcast, save) {
        this.vGame = vGame;
        this.mPlayer = mPlayer;
        this.core = broadcast;
        this.save = save;
        this.snt = null;

        this.load();
    }

    load() {
        "use strict";

        const p = this;
        const d = new Date();
        const n = d.getTime();
        
        console.log({ snt: this.mPlayer.usr_id, n: n });

        let b_snt = $.get("broadcast.php", { snt: this.mPlayer.usr_id, n: n }).done(function (data) {
            console.log("Data Loaded: " + data);
            b_snt = JSON.parse(data);
            console.log(b_snt);
            p.set(b_snt);
        });
    }

    set(snt) {
        "use strict";
        this.snt = snt;
        this.next();
    }

    next() {
        "use strict";

        if (this.snt) {
            let b_nxt = this.snt.shift();

            console.log("Broadcast SNT: " + b_nxt);

            if (b_nxt) {
                const b_nexta = b_nxt.split("|");

                console.log(b_nexta);

                const person = this.mGame.get_person(b_nexta[1], "player");
                if (person) {
                    person.ren_sprite.show_dialogue(b_nexta[4]);
                } else {
                    this.save.properties.broadcast.push(b_nxt);
                    console.log("PUSH broadcast.core " + JSON.stringify(this.core));
                    console.log("PUSH save.properties.broadcast " + JSON.stringify(this.save.properties.broadcast));
                    this.next();
                }
            } else {
                console.log("broadcast.core " + JSON.stringify(this.core));
                console.log("save.properties.broadcast " + JSON.stringify(this.save.properties.broadcast));
                b_nxt = this.core.shift();
                const b_nxtt = this.save.properties.broadcast[0];

                if (b_nxt !== b_nxtt) console.log("!!!!!!!!!!!!");

                console.log("Broadcast Player: " + b_nxt + " Save: " + b_nxtt);

                if (b_nxt) {
                    const b_nexta = b_nxt.split("|");

                    console.log(b_nexta);

                    const person = this.mGame.get_person(b_nexta[1], "player");
                    if (person) {
                        person.ren_sprite.show_dialogue(b_nexta[4]);
                    } else {
                        this.save.properties.broadcast.push(b_nxt);
                        this.next();
                    }
                }
            }
        }
    }
}

class MPQuests {
    constructor(mPlayer, statQuests) {
        this.mGame = mPlayer.mGame;
        this.vGame = mPlayer.vGame;
        this.mPlayer = mPlayer;
        this.quest = [];
        this.ass_quest = {};
        this.core = statQuests;
        this.new_quest = {};
        this.gdata_quests = mPlayer.mGame.gdata.quest.quests;

        if (!this.core.ass) this.core.ass = {};
        this.init();
    }

    init() {
        for (const q of this.gdata_quests) {
            const nq = new MPQQuest(this, q);
            this.quest.push(nq);
            if (nq.state !== "fin") this.new_quest[nq.qid] = nq;
            if (this.core.ass[nq.name]) this.ass_quest[nq.name] = nq.set_ass(this.core.ass[nq.name]);
        }
    }

    to_core(quest) {
        "use strict";

        const new_quest = {
            name: quest.name,
            qid: quest.qid,
            owner: quest.properties.owner,
            ot: quest.properties.owner_type,
            target: quest.properties.target,
            tt: quest.properties.target_type,
            endc: quest.properties.ending_conditions,
            acc: {
                is: false,
                q: 0
            }
        };

        if (new_quest.endc.type === "wait") {
            new_quest.acc.tm = this.mPlayer.stats.time;
            new_quest.acc.lgo = 0;
            new_quest.acc.slp = 0;
        }

        return new_quest;
    }

    assign(quest) {
        "use strict";
        if (!this.ass_quest[quest.name]) {
            quest.state = "ass";

            const new_quest = this.to_core(quest);
            console.log(new_quest);

            this.core.ass[quest.name] = new_quest;
            this.ass_quest[quest.name] = quest.set_ass(new_quest);

            this.mPlayer.save.properties.quests = this.core;
        }
    }

    finish(quest) {
        "use strict";

        console.log("\x1b[106mFinish quest: " + quest.name);

        const quest_name = quest.name;
        const qid = quest.qid;

        quest.new = null;
        quest.ass = null;

        delete this.new_quest[qid];
        delete this.core.ass[quest_name];
        delete this.ass_quest[quest_name];

        if (this.core.fin) {
            const key = this.core.fin.indexOf(qid);
            if (key < 0) this.core.fin.push(qid);
        } else {
            this.core.fin = [];
            this.core.fin.push(qid);
        }

        console.log(this.core);
        this.mPlayer.save.properties.quests = this.core;
    }
}

class MPQQuest {
    constructor(mQuests, quest) {
        this.mQuests = mQuests;
        
        const q = JSON.parse(JSON.stringify(quest));
        this.name = q.name;
        this.qid = q.qid;
        this.owner = parseInt(q.properties.owner);
        this.owner_type = q.properties.owner_type;
        this.target = parseInt(q.properties.target);
        this.target_type = q.properties.target_type;
        this.ending_conditions = q.properties.ending_conditions;
        this.qconditions = q.properties.qconditions;
        this.nextq = parseInt(q.properties.nextq);
        this.ptype = q.properties.ptype;
        this.quest_text = q.properties.quest_text;
        this.ptexts = q.properties.ptexts;
        this.state = this.init_state();
        this.ass = null;
        this.core_ass = null;
    }

    init_state() {
        if (this.is_fin()) return "fin";
        if (this.is_ass()) return "ass";
        if (this.is_acc()) return "acc";
        return "pre";
    }
    
    is_not_ass() {
        "use strict";
        if (this.mQuests.core.ass[this.name]) return false;
        return true;
    }

    is_ass() {
        "use strict";
        if (this.state) return this.state === "ass";
        if (this.mQuests.core.ass[this.name]) return this.mQuests.core.ass[this.name].acc.is !== "true";
        return false;
    }

    is_acc() {
        "use strict";
        if (this.state) return this.state === "acc";
        if (this.mQuests.core.ass[this.name]) return this.mQuests.core.ass[this.name].acc.is === "true";
        return false;
    }

    is_fin() {
        "use strict";
        if (this.state) return this.state === "fin";
        const qid = String(this.qid);
        
        if (this.mQuests.core.fin) return this.mQuests.core.fin.indexOf(qid) > -1;
        return false;
    }
    
    is_prev_fin() {
        "use strict";
        if (this.qconditions) {
            for (const co of this.qconditions) {
                const condi = co.split("_");
                switch (condi[0]) {
                    case "pq":
                        const pqid = parseInt(condi[1]);
                        return this.mQuests.quest[pqid] === "fin";
                    case "badge":
                        break;
                }
            }
            return false;
        }
        return true;
    }

    set_ass(ass) {
        const nass = JSON.parse(JSON.stringify(ass));
        this.ass.name = nass.name;
        this.ass.qid = parseInt(nass.qid);
        this.ass.owner = nass.owner;
        this.ass.otype = nass.ot;
        this.ass.target = nass.properties.target;
        this.ass.ttype = nass.tt;
        this.ass.endc = nass.endc;
        this.ass.acc = nass.acc;
        this.ass.acc.is = nass.acc.is === "true";
        this.ass.state = this.state;
        this.core_ass = ass;

        return this.ass;
    }

    assign() {
        this.mQuests.assign(this);
    }

    finish() {
        this.mQuests.finish(this);
    }

    get_text(n) {
        return this.ptype !== "multi" ? this.quest_text : this.get_quest_ptext(n);
    }

    get_quest_ptext(n) {
        "use strict";
        if (!n) {
            this.i_point = 0;
            this.i_point_m = this.ptexts.length;
            return this.ptexts[0].t;
        } else {
            this.i_point++;
            if (this.i_point < this.i_point_m) {
                return this.ptexts[this.i_point].t;
            } else {
                return "finish";
            }
        }
    }

    is_last() {
        return this.i_point === this.i_point_m - 1;
    }

    next() {
        this.finish();

        console.log(this.mQuests.quest);
        const quests = this.mQuests.quest;
        const ind = this.nextq;
        const new_quest = quests[ind];
        console.log("Next quest: " + ind);
        console.log("Owner: " + new_quest.owner);

        const new_ren_player = this.mQuests.mGame.get_person(new_quest.owner, "player");
        const ren = new_ren_player.ren_sprite;

        ren.set_quest(new_quest);

        const text = new_quest.get_text();
        if (new_quest.ptype !== "multi") new_quest.assign();

        if (new_quest.target) {
            new_ren_player.hide_bubble();

            const nnew_ren_player = this.mGame.get_person(new_quest.target, "player");
            if (nnew_ren_player) {
                nnew_ren_player.ren_sprite.set_quest(new_quest);
                nnew_ren_player.show_bubble(4); // ! exclamation mark - quest assigned
            }
        } else {
            new_ren_player.test_bubble();
        }
        return [new_quest, ren, text];
    }
    
    update(etype, condition) {
        const endc = this.ending_conditions;
        
        if (endc.type === etype) {
            const item_frame = parseInt(endc.what);
            switch (etype) {
                case "have":
                    const item = this.mQuests.mGame.cPlayer.items.index_by_frame(item_frame);
                    const quant = parseInt(endc.have);

                    if (quant < item.quantity) {
                        this.set_acc_q(quant);
                        return false;
                    }
                    this.set_acc_q(item.quantity);
                    this.accomplish();
                    return true;
                case "put":
                    console.log("Quest PUT");
                    if (item_frame === condition.f) {
                        const cwhere = parseInt(endc.where);
                        if (condition.wr === cwhere) {
                            this.accomplish();
                            return true;
                        }
                    }
                    return false;
                case "use":
                    console.log("Quest USE");
                    if (item_frame === condition.t) {
                        const con = parseInt(endc.on);
                        if (condition.on === con) {
                            this.accomplish();
                            return true;
                        }
                    }
                    return false;
                case "make":
                    console.log("Quest MAKE");
                    if (item_frame === condition) {
                        this.accomplish();
                        return true;
                    }
                    return false;
                case "wait":
                    console.log("Quest WAIT");
                    let lgo = parseInt(this.ass.acc.lgo);
                    let slp = parseInt(this.ass.acc.slp);

                    switch (condition.type) {
                        case "logout":
                            lgo++;
                            this.set_acc_lgo(lgo);
                        break;
                        case "sleep":
                            slp++;
                            this.set_acc_slp(slp);
                        break;
                    }

                    const atime = parseInt(quest.acc.tm) + (3600 * 24 * 6 * 1000);
                    console.log("Lgo: " + lgo + " Slp: " + slp + " Td: " + (atime - condition.tm));
                    if ((lgo > 2) && (slp > 2) && (condition.tm > atime)) {
                        this.accomplish();
                        return true;
                    }
                    return false;
                case "textpow":
                    this.assign();
                    this.accomplish();
                    return true;
                case "text":
                    this.accomplish();
                    return true;
                case "findps":                
                    if (this.target_type === condition.type && this.target === condition.uid) {
                        this.accomplish();
                        return true;
                    }
                    return false;
                case "deliver":
                    if (this.target_type === condition.type && this.target === condition.uid) {
                        const item = parseInt(endc.what);
                        const index = this.mQuests.mGame.cPlayer.items.test(item, 1);
                        if (index > -1) {
                            this.mQuests.mGame.cPlayer.items.subtract(index, 1);
                            this.accomplish();
                            return true;
                        }
                    }
                    return false;
            }
        }
        return false;
    }

    accomplish() {
        this.state = "acc";
        this.new.state = "acc";
        this.ass.state = "acc";
        this.ass.acc.is = true;
        this.core_ass.acc.is = true;
        this.mQuests.mPlayer.hud.alerts.show("Úkol byl splněn!");
    }

    set_acc_q(qt) {
        this.ass.acc.q = qt;
        this.core_ass.acc.q = qt;
    }

    set_acc_lgo(lgo) {
        this.ass.acc.lgo = lgo;
        this.core_ass.acc.lgo = lgo;
    }

    set_acc_slp(slp) {
        this.acc.slp = slp;
        this.core_ass.acc.slp = slp;
    }
}

class MPCases {
    constructor(mPlayer, cases) {
        this.core = cases.cases;
        this.culprit = cases.culprit;
        this.mPlayer = mPlayer;
        this.loaded = null;
        this.ftprints = null;
        this.case = this.make_cases(this.core);
    }
    
    init_loaded(loaded, ftprints) {
        this.loaded = loaded;
        this.ftprints = ftprints;
    }
    
    for_each(f) {
        const c = this.case.map(f);
    }

    make_cases(cases) {
        const cc = [];
        for (const ncase of cases) {
            const nc = new MPCCase(this, this.loaded, this.core, ncase);
            cc.push(nc);
        }
        return cc;
    }

    add_case(ccase) {
        const pcid = this.case.length;
        const new_case = {
            PCID: pcid,
            CID: ccase.CID,
            ID: ccase.ID,
            M: ccase.M,
            type: ccase.type,
            questions: "",
            witness: {},
            evidences: []
        };

        const ncase = new MPCCase(this, this.loaded, this.core, new_case);
        this.case.push(ncase);
        this.core.push(new_case);
        this.mPlayer.save.properties.cases = this.core;
        this.loaded.add_case(ccase, pcid);
        console.log(this.loaded);
        return pcid;
    }
    
    get_badge_val(b_id, b_key, uid, type, context) {
        "use strict";
        const ubadge = this.unpack_badge(b_id, uid, type, context);
        return ubadge ? ubadge[b_key] : null;
    }

    unpack_badge(b_id, uid, type, context) {
        "use strict";
        const full_person = this.loaded.get_full_person(uid, type, context);
        if (full_person) return full_person.unpack_badge(b_id);
        return null;
    }

    init_witness(pcid, uid, type) {
        "use strict";
        if (pcid < 0) {
            for (const ncase of this.case) {
                ncase.init_witnes(uid, type);
            }
        } else {
            return this.case[pcid].init_witnes(uid, type);
        }
        return null;
    }
    
    make_book_investigate(uid, a_type) {
        this.loaded.load_person(uid,  "player");

        console.log(a_type);
        
        const nid_id = a_type.length - 2;
        const id_id = a_type.length - 1;
        
        const bt = a_type[1];
        const bt2 = a_type[2];
        const id = parseInt(a_type[id_id]);
        const nid = parseInt(a_type[nid_id]);

        if (bt !== 'P1' && bt !== 'Book') {
            this.case[id].evidence_add(a_type, uid, id);
            
            return { pcid: id, c_type: "evidence" };
        } else {
            if (bt === 'Book') {
                const firstid = parseInt(bt2);
                return {
                    pcid: id,
                    nid: nid,
                    firstid: firstid,
                    c_type: "evidence",
                    c_type1: "show"
                };
            }
        }
    }
}

class MPCCase {
    constructor(mCases, core, ncase) {
        this.mCases = mCases;
        this.core = core;
        this.pcid = parseInt(ncase.PCID);
        this.chest = {
            cid: parseInt(ncase.CID),
            id: parseInt(ncase.ID)
        };
        this.map = parseInt(ncase.M);
        this.type = ncase.type;
        this.questions = ncase.questions;
        this.witness = ncase.witness;
        this.evidences = ncase.evidences;
        this.loaded = mCases.loaded;
    }

    add_evidence(evi) {
        const core = this.core;
        const pcid = this.pcid;
        if (!core[pcid].evidences) core[pcid].evidences = [];
        if (!this.evidences) this.evidences = [];

        const id = core[pcid].evidences.indexOf(evi);
        if (id === -1) {
            core[pcid].evidences.push(evi);
            this.evidences.push(evi);
            return core[pcid].evidences - 1;
        }
        return id;
    }

    update_evidence(nid, evi) {
        const core = this.core;
        const pcid = this.pcid;
        if (core[pcid].evidences[nid]) {
            core[pcid].evidences[nid] = evi;
            this.evidences[nid] = evi;
            return nid;
        }
        return this.add_evidence(evi);
    }

    evidence_add(a_type, uid, nid) {
        const nlen = a_type.length - 2;
        const bt3_id = a_type.length - 3;
        const type = a_type[0];
        const bt = a_type[1];
        const bt2 = a_type[2];
        const bt3 = a_type[bt3_id];

        if (a_type.length < 6) {
            const ub_val2 = this.mCases.get_badge_val("14", bt2, uid, type, "");
            if (ub_val2) {
                const new_evidence = bt + "|" + bt2 + "|" + ub_val2;
                this.add_evidence(new_evidence);
            }
        } else {
            const ub_val3 = this.mCases.get_badge_val("14", bt3, uid, type, "");
            if (ub_val3) {
                let new_evidence = "";
                for (let i = 1; i < nlen; i++) {
                    new_evidence += a_type[i];
                    if (i < bt3_id) {
                        new_evidence += "|";
                    } else {
                        new_evidence += ub_val3;
                    }
                }

                this.update_evidence(nid, new_evidence);
            }
        }
    }

    evidence_unpacked(id, evi) {
        const a = evi.split("|");
        return a[id];
    }
    
    unpack_witness(evi) {
        "use strict";

        const a_wit = evi.str.split("|");

        evi.type = a_wit[0];
        evi.uid = parseInt(a_wit[1]);
        evi.name = this.mCases.mPlayer.cPlayer.relations.get_name(evi.uid, evi.type);

        for (let i = 2; i < a_wit.length; i++) {
            let key = a_wit[i].substr(0, 1);
            let val = "";
            if (key !== "1") {
                val = a_wit[i].substr(1, a_wit[i].length);
            } else {
                key = a_wit[i].substr(0, 3);
                val = a_wit[i].substr(3, a_wit[i].length);
            }

            evi[key] = val;
        }

        return evi;
    }

    update_witness(uid, type, uevi, context) {
        const uids = String(uid);
        if (this.evidence_unpacked(0, context) === type) {
            if (this.evidence_unpacked(1, context) === uids) {
                if (uevi.id < 0) {
                    uevi.str = context;
                    uevi.id = this.add_evidence(context);
                } else {
                    uevi.str = context;
                    this.update_evidence(uevi.id, context);
                }
            }
        }
        if (this.evidence_unpacked(0, context) === '14') {
            this.add_evidence(context);
            if (this.evidence_unpacked(1, context) === "W") uevi.week = parseInt(this.evidence_unpacked(2, context));
        }
        return uevi;
    }
    
    get_witnessNID(nid, context) {
        const evi = { 
            str: this.evidences(nid),
            id: nid
        };
        
        const evi2 = this.unpack_witness(evi);
        
        if (context && (evi2.type === 'NPC' || evi2.type === 'player')) {
            const character = this.get_full_person(evi2.uid, evi2.type, context);
            console.log(character);
            
            evi2.character = character;
            evi2.name = character.name;
            evi2.gender = character.gender;
            
            evi2.f_texture = "female_f";
            if (character.gender === "male") evi2.f_texture = "male_f";
            if (character.ren_texture !== "") {
                evi2.f_texture = character.ren_texture.substring(0, character.ren_texture.length - 3) + "f";
            }
            
            evi2.stopy = character.badges['14'];
            evi2.vzhled = character.badges['15'];
            console.log(evi2.stopy);
            console.log(evi2.vzhled);
            
            if (evi2.stopy) {
                const stopy_a = evi2.stopy.split("|");
                
                evi2.vyskavaha = stopy_a[0].substr(1,stopy_a[0].length) + " cm, ";
                evi2.vyskavaha += stopy_a[1].substr(1,stopy_a[1].length) + " kg ";
                evi2.bota = "Bota: " + stopy_a[2].substr(1,stopy_a[2].length);
            }
            
            if (evi2.vzhled) {
                const vzhled_a = evi2.vzhled.split("|");

                const ind = parseInt(vzhled_a[0].substr(1,vzhled_a[0].length));
                evi2.rasa = this.mCases.mPlayer.mGame.gdata.core.rasa[ind];
                
                evi2.vek = "cca " + vzhled_a[1].substr(1,vzhled_a[1].length) + " let";
                
                const ind2 = parseInt(vzhled_a[3].substr(1,vzhled_a[3].length));
                evi2.vlasy = this.mCases.mPlayer.mGame.gdata.core.barva[ind2];
                
                
                const ind3 = parseInt(vzhled_a[4].substr(1,vzhled_a[4].length));
                evi2.vlasyl = this.mCases.mPlayer.mGame.gdata.core.delkavlasu[ind3];
                
                const ind4 = parseInt(vzhled_a[2].substr(1,vzhled_a[2].length));
                evi2.postava = "Postava: " + this.mCases.mPlayer.mGame.gdata.core.postava[ind];
            }
            evi2.culprit = null;
            if (evi2.P === '1' && evi2.R) {
                evi2.culprit = {};
                evi2.culprit.mz = evi2.G === 'M' ? "muž" : "žena";
                
                const ind = parseInt(evi2.R);
                evi2.culprit.rasa = this.mCases.mPlayer.mGame.gdata.core.rasa[ind];
                evi2.culprit.vyska = evi2["14H"];
                evi2.culprit.vek = evi2.A;
                const ind2 = parseInt(evi2.F);
                evi2.culprit.postava = this.mCases.mPlayer.mGame.gdata.core.postava[ind2];
            }
        }
        return evi2;
    }

    get_witnessUID(uid, type, context) {
        const evidences = this.evidences;
        const uids = String(uid);
        const revi = {};
        revi.str = "";
        revi.id = -1;
        revi.week = -1;
        for (let id in evidences) {
            const evi = evidences[id];
            const a_evi = evi.split("|");

            if (a_evi[0] === type) {
                if (a_evi[1] === uids) {
                    revi.str = evi;
                    revi.id = id;
                }
            }
        }
        if (context && context !== "") {
            const uevi = this.update_witness(uid, type, revi, context);
            revi.id = uevi.id;
            revi.str = uevi.str;
        }
        return this.unpack_witness(revi);
    }

    get_full(context) {
        this.loaded.get_full_case(this.pcid, context);
    }
    
    init_witnes(uid, type) {
        return this.loaded.witness.winit(this, uid, type);
    }
    
    is_ftp_near(nid) {
        return this.ftprints.near(this.evidences[nid]);
    }
    
    is_ftp_test(nid) {
        return this.ftprints.test(nid, this.evidences);
    }
    
    ftp_book_investigate(nid) {
        const new_evidence = this.ftprints.investigate(this, nid);
        console.log(new_evidence);
        if (new_evidence !== '') {
            const a_ne = new_evidence.split("|");
            const ane_nid = parseInt(a_ne.pop());
            const new_ftp = a_ne.join("|");

            if (a_ne.length < 4) {
                this.add_evidence(new_ftp);
            } else {
                this.update_evidence(ane_nid, new_ftp);
            }
        }
    }

    save() {
        return {
            PCID: this.pcid,
            CID: this.chest.cid,
            ID: this.chest.id,
            M: this.map,
            type: this.type,
            questions: this.questions,
            witness: this.witness,
            evidences: this.evidences
        };
    }
}

class MPStream {
    constructor(vGame, vPlayer, usr_id, gtime, stats) {
        console.log("Stream start");
        this.vGame = vGame;
        this.vPlayer = vPlayer;
        this.usr_id = usr_id;
        this.gtime = gtime;
        this.stats = stats;
        this.core = {
            type: "stream",
            name: "stream",
            obj_id: 1,
            x: 0,
            y: 0,
            properties: {
                group: "stream",
                items: "",
                texture: "blank",
                time: ""
            },
            action: "STREAM",
            string: "",
            map_int: 0
        };
        this.sent = false;
        
        const dt = new Date();
        const tt = dt.getTime();
        
        this.new = this.usr_id + "|F" + tt + "|" + this.gtime.ms + "|" + this.vPlayer.x + ";" + this.vPlayer.y;
        console.log("Stream: " + this.new);
        this.put();
    }

    put() {
        "use strict";

        if (!this.sent) {
            const d = new Date();
            const n = d.getTime();
            this.core.properties.time = n;

            const usr_id = this.usr_id;
            const stream = this;

            this.sent = true;
            this.core.string = this.new;

            console.log("Stream sent: " + this.new);
            console.log(this.core);
            console.log(JSON.stringify(this.core));

            $.post("object.php?time=" + n + "&uid=" + usr_id, this.core)
                .done(function (data) {
                    console.log("Stream save success");
                    console.log(data);
                    const resp = JSON.parse(data);
                    stream.load(resp);

                    console.log("Stream is saved");
                })
                .fail(function (data) {
                    console.log("Stream save error");
                    console.log(data);
                });
        }
    }

    load(stream) {
        "use strict";

        const gtime = stream.obj.gtime * 1000;
        console.log(gtime);
        console.log(this.gtime.ms);
        console.log(this.gtime.obj);

        const datex = new Date(gtime);
        let day = datex.getDay();
        if (day < 1) day = 7;
        const date1 = new Date(gtime - (day - 1) * 86400000);
        date1.setHours(7, 0);

        console.log(this.gtime.get_week(gtime, 0));
        console.log(datex);
        console.log(date1);
        console.log(datex.getDay());

        if (date1 > this.gtime.obj) {
            console.log("New week from other player");

            const date1t = date1.getTime();
            this.gtime.set_time(date1t);

            this.stats.gtimeweek = gtime.week();
            this.stats.gtimeday = gtime.day();
            console.log(this.vGame.prefabs);
            this.vGame.prefabs.time.text1.text = " " + this.stats.gtimeday;
        }
    }
}
