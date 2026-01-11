Mst.ShowStatWithSprite = class extends Mst.ShowStat {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.visible = false;
        this.stats = [];
        this.stats_spacing = properties.stats_spacing;
        this.stats_group = properties.stats_group;
        // it is necessary to save the initial position because we need it to create the stat sprites
        this.initial_position = new Mst.Position(this);

        this.prefab = Mst.prefabs[this.prefab_name];

        this.window_opened = false;
        this.texts = [];
        this.stat_type = "";

        const text_style = {"font": "11px Arial", "fill": "#FFFFFF"};
        switch (name) {
            case "health":
                let text = Mst.player.stats.health + "/" + Mst.player.stats.health_max;
                text += " S:" + Mst.player.stats.stress;
                this.text_health = Mst.game.add.text(this.x + 3, this.y + 13, text, text_style);
                this.text_health.fixedToCamera = true;

                this.right_arrow = this.group.create(460, 67, 'arrow_right');
                this.right_arrow.fixedToCamera = true;
                this.right_arrow.inputEnabled = true;
                this.right_arrow.input.useHandCursor = true;
                this.right_arrow.events.onInputDown.add(this.change_stat, this);
                this.right_arrow.visible = false;
                break;
            case "moon": {
                const text = Mst.player.stats.moon + "/" + Mst.player.stats.moon_max;

                this.text_moon = Mst.game.add.text(this.x + 3, this.y + 19, text, text_style);
                this.text_moon.fixedToCamera = true;
                break;
            }
        }
    }
};

Mst.ShowStatWithSprite.prototype.show_initial_stats = function () {
    "use strict";
    // show initial stats
    //if (!this.prefab) this.prefab = Mst.prefabs[this.prefab_name];
    console.log(this);
    const initial_stat = this.prefab ? this.prefab.stats[this.stat_name] : [1];
    for (let stat_index = 0; stat_index < initial_stat; stat_index += 1) {
        // create new sprite to show stat
        const stat = this.create_new_stat_sprite();
        this.stats.push(stat);
    }
    this.stat = initial_stat;
};

Mst.ShowStatWithSprite.prototype.reset = function (position_x, position_y) {
    "use strict";
    console.log("Reset " + this.name);
    Phaser.Sprite.prototype.reset.call(this, position_x, position_y);
    // it is necessary to save the initial position because we need it to create the stat sprites
    this.initial_position = new Mst.Position(this);
    this.show_initial_stats();
    this.visible = false;
    
    switch (this.name) {
        case "health": 
            this.text_health.fixedToCamera = false;
            this.text_health.x = position_x + 3;
            this.text_health.y = position_y + 13;
            this.text_health.fixedToCamera = true;
            break;
        case "moon": 
            this.text_moon.fixedToCamera = false;
            this.text_moon.x = position_x + 3;
            this.text_moon.y = position_y + 19;
            this.text_moon.fixedToCamera = true;
            break;
    }
};

Mst.ShowStatWithSprite.prototype.update_stat = function (new_stat) {
    "use strict";
    const stat_difference = Math.abs(new_stat - this.stat);
    if (new_stat > this.stat) {
        // if the new stat is greater, we must create new stat sprites
        for (let stat_index = 0; stat_index < stat_difference; stat_index += 1) {
            const stat = this.create_new_stat_sprite();
            this.stats.push(stat);
        }
    } else {
        // if the new stat is lower, we must kill extra stat sprites
        for (let stat_index = 0; stat_index < stat_difference; stat_index += 1) {
            const stat = this.stats.pop();
            if (stat) stat.kill();
        }
    }
    Mst.ShowStat.prototype.update_stat.call(this, new_stat);
};

Mst.ShowStatWithSprite.prototype.create_new_stat_sprite = function () {
    "use strict";
    // calculate the next stat position
    const stat_position = new Mst.Position(this.initial_position.x + (this.stats.length * this.stats_spacing.x),
                                           this.initial_position.y + (this.stats.length * this.stats_spacing.y));
    // get the first dead sprite in the stats group
    let stat = this.group.getFirstDead();
    if (stat) {
        // if there is a dead stat, just reset it
        stat.reset(stat_position.x, stat_position.y);
    } else {
        // if there are no dead stats, create a new one
        // stat sprite uses the same texture as the ShowStatWithSprite prefab
        stat = this.group.create(stat_position.x, stat_position.y, this.texture);
    }
    // stat scale and anchor are the same as the prefab
    stat.scale.setTo(this.scale.x, this.scale.y);
    stat.anchor.setTo(this.anchor.x, this.anchor.y);
    
    stat.inputEnabled = true;
    stat.input.useHandCursor = true;
    stat.events.onInputDown.add(this.action_onclick, this);
    
    stat.fixedToCamera = true;
    return stat;
};

Mst.ShowStatWithSprite.prototype.action_onclick = function (stat) {
    "use strict";
    if (this.window_opened) {
        this.hide_window_onclick();
    } else {
        switch (this.name) {
            case "health":
                this.show_window("Abilities", "skills", "Dovednosti:");
            break;
            case "moon":

            break;
            case "settings":
                this.logout();
            break;
        }        
    }
};

Mst.ShowStatWithSprite.prototype.show_window = function (type, stat_type, stat_trans) {
    "use strict";
    switch (type) {
        case "Abilities":
            Mst.hud.close.state.push("Abilities");
            Mst.hud.close.context.push(this.name);

            this.window_opened = true;
            Mst.hud.right_window.show("");

            let text_style = {"font": "13px Arial", "fill": "#FFFFFF", tabs: 40 };

            const text = Mst.game.add.text(293, 65, stat_trans, text_style);
            text.fixedToCamera = true;
            this.texts.push(text);
            this.stat_type = stat_type;

            this.right_arrow.visible = true;

            text_style = {"font": "12px Arial", "fill": "#FFFFFF", tabs: 40 };
            let index = 0;

            switch (stat_type) {
                case "skills":
                    const skills = Mst.player.stats.skills;
                    for (let key in skills.save()) {
                        const skill = skills[key];
                        const text_value = key + "\t exp:" + skill.exp + "\t lvl:" + skill.level;
                        const stext = Mst.game.add.text(293, 95 + 14 * index, text_value, text_style);
                        stext.fixedToCamera = true;
                        this.texts.push(stext);
                        index ++;
                    }
                    break;
                case "abilities":
                    for (let key in Mst.player.stats.abilities) {
                        const text_value = key + ":\t" + Mst.player.stats.abilities[key];
                        const stext = Mst.game.add.text(293, 95 + 14 * index, text_value, text_style);
                        stext.fixedToCamera = true;
                        this.texts.push(stext);
                        index ++;
                    }
                    
                    const text_value = "sin:\t" + Mst.player.stats.sin;
                    const stext = Mst.game.add.text(293, 95 + 14 * (index + 1), text_value, text_style);
                    stext.fixedToCamera = true;
                    this.texts.push(stext);
                    index ++;
                    break;
                case "quests":
                    for (let key in Mst.player.stats.quests) {
                        const text_value = key + "\t" + Mst.player.stats.quests[key].quest_text;
                        const stext = Mst.game.add.text(293, 95 + 14 * index, text_value, text_style);
                        stext.fixedToCamera = true;
                        this.texts.push(stext);
                        index ++;
                    }
                    break;
                default:
                    for (let key in Mst.player.stats) {
                        const text_value = key + "\t" + Mst.player.stats[key];
                        console.log(key + ":" + typeof(Mst.player.stats[key]));
                        console.log(Mst.player.stats[key]);
                        if (typeof(Mst.player.stats[key]) !== 'object') {
                            const stext = Mst.game.add.text(293, 95 + 14 * index, text_value, text_style);
                            stext.fixedToCamera = true;
                            this.texts.push(stext);
                            index ++;
                        }
                    }
                    break;
            }
            break;
    }
};

Mst.ShowStatWithSprite.prototype.change_stat = function () {
    "use strict";
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    
    switch (this.stat_type) {
        case "skills":
            this.show_window("Abilities", "abilities", "Vlastnosti:");
            break;
        case "abilities":
            this.show_window("Abilities", "", "Vše");
            break;
        default:
            this.show_window("Abilities", "skills", "Dovednosti:");
            break;
    }
};

Mst.ShowStatWithSprite.prototype.hide_window_onclick = function () {
    "use strict";
    Mst.hud.close.pop();
    this.hide_window();
};

Mst.ShowStatWithSprite.prototype.hide_window = function () {
    "use strict";
    this.window_opened = false;
    this.texts.forEach(function (text) {
        text.destroy();
    });
    this.texts = [];
    this.right_arrow.visible = false;
    Mst.hud.right_window.hide();
};

Mst.ShowStatWithSprite.prototype.logout = function () {
    "use strict";
    this.position = {
        x: Mst.player.x - 8,
        y: Mst.player.y + 8
    };

    Mst.cPlayer.set_logoff();
    Mst.mGame.save_data(this.position, Mst.map_int, "logout");
};
