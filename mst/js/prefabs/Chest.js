Mst.Chest = function (game_state, name, position, properties) {
    "use strict";
    
    Mst.Prefab.call(this, game_state, name, position, properties);
    
    this.cChest = new CChest(this, name, position, properties);
    this.mChest = this.cChest.mChest;
    this.hud = this.game_state.cGame.hud;
    this.stats = this.mChest.stats;
    
    this.game_state.game.physics.arcade.enable(this);
    
    this.tilex = this.game_state.layers.background.getTileX(this.x);
    this.tiley = this.game_state.layers.background.getTileY(this.y);
    console.log(this.tilex + "|" + this.tiley);
    this.game_state.setGridXY(this.tilex, this.tiley, 1);
    
    console.log(this.game_state.grid);    
    
    this.body.immovable = true;
    console.log(this.mChest.closed_frame);
    this.close_frame();
    this.anchor.setTo(0.5);
    
    this.animations.add('ficauldron', [56, 57], 10, true);
    this.animations.add('fifurnace', [65, 66], 10, true);
    this.animations.add('fiwcauldron', [74, 75], 10, true);    
    this.animations.add('fire', [83, 84, 85, 86, 87, 88], 10, true);
    
    const [anim, plant] = this.cChest.loop.set_anim(this.mChest.closed_frame);
    if (anim === "stop") this.animations.stop();
    if (anim !== "stop" && anim !== "null") this.animations.play(anim);
    this.plant = plant;
    
    this.bubble = this.game_state.mGame.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
    this.bubble.anchor.setTo(0.5);
    this.bubble.inputEnabled = true;
    this.bubble.events.onInputDown.add(this.hide_bubble, this);
    this.bubble.visible = false;
    this.bubble_showed = false;
    
    this.inputEnabled = true;
    this.events.onInputDown.add(this.get_chest, this);
    
    this.mChest.init();
};

Mst.Chest.prototype = Object.create(Mst.Prefab.prototype);
Mst.Chest.prototype.constructor = Mst.Chest;

Mst.Chest.prototype.update = function () {
    "use strict";
    //if (this.alive) {
    if (this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player) > 22) {
        if (this.game_state.prefabs.player.cPlayer.chest.opened) {
            if (this.game_state.prefabs.player.cPlayer.chest.opened.name === this.name) {
                console.log(this.game_state.game.physics.arcade.distanceBetween(this, this.game_state.prefabs.player));
                console.log("Chest is too far!");
                if (this.game_state.mGame.hud.middle_window.visible) this.game_state.mGame.hud.middle_window.option_ok();
                this.mChest.close_chest();
            }
        }
    }
};

Mst.Chest.prototype.updated = function(frame) {
    "use strict";
    if (this.stats.items === "") {
        if (this.mChest.is_takeable) {
            this.input.useHandCursor = true;

            if (this.mChest.closed_frame === 3) this.get_chest();
        } else {
            this.input.useHandCursor = false;
        }
    } else {
        this.input.useHandCursor = false;
    }

    if (this.bubble_showed) {
        this.bubble.x = this.x;
        this.bubble.y = this.y - 16;
    }

    const anim = this.cChest.updated(frame);
    if (anim === "stop") this.animations.stop();
    if (anim !== "stop" && anim !== "null") this.animations.play(anim);
};

Mst.Chest.prototype.reset = function (position) {
    "use strict";    
    Phaser.Sprite.prototype.reset.call(this, position.x, position.y);
};

Mst.Chest.prototype.set_frame = function (frame) {
    "use strict";
    this.frame = frame;
};

Mst.Chest.prototype.open_frame = function () {
    "use strict";
    this.frame = this.mChest.opened_frame;
};

Mst.Chest.prototype.close_frame = function () {
    "use strict";
    this.frame = this.mChest.closed_frame;
};

Mst.Chest.prototype.change_frame = function (frame) {
    "use strict";
    console.log(this);
    if (frame) {
        this.frame = frame;
        this.mChest.closed_frame = frame;
        this.mChest.opened_frame = frame;
        this.updated(frame);
    }
};

Mst.Chest.prototype.show_bubble = function (type) {
    "use strict";
    this.bubble_showed = true;
    console.log("Bubble show " + this.obj_id);
    
    this.bubble.loadTexture('bubble_spritesheet', type);
    this.bubble.visible = true;
};

Mst.Chest.prototype.hide_bubble = function () {
    "use strict";
    
    console.log("Bubble hide " + this.obj_id);
    this.bubble_showed = false;
    this.bubble.visible = false;
};

Mst.Chest.prototype.get_chest = function () {
    "use strict";
    this.cChest.get_chest(this);
};

Mst.Chest.prototype.option_ok = function () {
    "use strict";
    console.log("Chest option ok - close: ok");
    this.game_state.prefabs.player.cPlayer.chest.close();
};

Mst.Chest.prototype.option_no = function () {
    "use strict";
    
    console.log("Chest option no");
    
    if (this.mChest.mw_context === 'investigate') this.cChest.cases.set_investigate();
};

Mst.Chest.prototype.option_investigate = function () {
    "use strict";
    
    console.log("Chest option investigate");
    this.game_state.prefabs.player.cPlayer.cases.add_chest(this);
};

Mst.Chest.prototype.option_steal = function () {
    "use strict";
    
    console.log("Chest option steal");
    console.log("Owner: " + this.mChest.owner);
    
    this.game_state.prefabs.player.mPlayer.add_sin(8);
    console.log("Player sin: " + this.game_state.prefabs.player.stats.sin);
    
    const owner = this.game_state.mGame.get_person(this.mChest.owner, "player");
    console.log(owner);
    if (owner) {
        owner.ren_sprite.show_dialogue("To je moje!");
        this.game_state.prefabs.player.cPlayer.chest.close();
    } else {
        if (this.game_state.prefabs.player.stats.sin > 200) {
            this.game_state.prefabs.player.cPlayer.chest.open(this);
            this.cChest.cases.steal();
        } else {
            this.hud.alerts.show("To se nedělá!");
            this.game_state.prefabs.player.cPlayer.chest.close();
        }
    }
};

Mst.Chest.prototype.collide_test = function () {
    "use strict";
    this.collide_t = false;
    
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.collision, this.collide_tile(), null, this);
    console.log(this.collide_t);
    return this.collide_t;
    
};

Mst.Chest.prototype.collide_tile = function () {
    "use strict";
    this.collide_t = true;
};
