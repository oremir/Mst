Mst.Chest = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);

        this.cChest = this.controller;
        this.mChest = this.model;

        this.stats = this.mChest.stats;

        Mst.game.physics.arcade.enable(this);

        this.tile = Mst.map.setTile(position);
        //console.log(Mst.map._grid);

        this.body.immovable = true;
        console.log(this.mChest.closed_frame);
        this.close_frame();
        this.anchor.setTo(0.5);

        this.animations.add('ficauldron', [56, 57], 10, true);
        this.animations.add('fifurnace', [65, 66], 10, true);
        this.animations.add('fiwcauldron', [74, 75], 10, true);
        this.animations.add('fire', [83, 84, 85, 86, 87, 88], 10, true);

        this.bubble = Mst.groups.bubbles.create(this.x, this.y - 16, 'bubble_spritesheet', 0);
        this.bubble.anchor.setTo(0.5);
        this.bubble.inputEnabled = true;
        this.bubble.events.onInputDown.add(this.hide_bubble, this);
        this.bubble.visible = false;
        this.bubble_showed = false;

        this.inputEnabled = true;
        this.events.onInputDown.add(this.get_chest, this);

        this.mChest.init(name, position);
        this.init();
    }

    get id() {
        let id = this.mChest.obj_id;
        if (!id) id = ths.mChest.init_obj_id();
        this.mChest.obj_id = id;
        return id;
    }
    
    update() {
        if (Mst.game.physics.arcade.distanceBetween(this, Mst.player) > 22) {
            if (Mst.cPlayer.chest.opened) {
                if (Mst.cPlayer.chest.opened.name === this.name) {
                    console.log(Mst.game.physics.arcade.distanceBetween(this, Mst.player));
                    console.log("Chest is too far!");
                    if (Mst.hud.middle_window.visible) Mst.hud.middle_window.option_ok();
                    this.mChest.close_chest();
                }
            }
        }
    }

    
    _controller() {
        return new CChest(this, this.name, this._position, this.properties);
    }

    init() {
        console.log(this);
        const [anim, plant] = this.cChest.loop.set_anim(this.mChest.closed_frame);
        if (anim === "stop") this.animations.stop();
        if (anim !== "stop" && anim !== "null") this.animations.play(anim);
        this.plant = plant;
    }

    updated(frame) {
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
    }

    reset(name, position, properties) {
        super.reset(name, position, properties);

        this.stats = this.mChest.stats;
        this.close_frame();
        this.tile = Mst.map.setTile(position);
        this.init();
    }

    set_frame(frame) {
        this.frame = frame;
    }

    open_frame() {
        this.frame = this.mChest.opened_frame;
    }

    close_frame() {
        this.frame = this.mChest.closed_frame;
    }

    change_frame(frame) {
        console.log(this);
        if (frame) {
            this.frame = frame;
            this.mChest.closed_frame = frame;
            this.mChest.opened_frame = frame;
            this.updated(frame);
        }
    }

    show_bubble(type) {
        this.bubble_showed = true;
        console.log("Bubble show " + this.obj_id);

        this.bubble.loadTexture('bubble_spritesheet', type);
        this.bubble.visible = true;
    }

    hide_bubble() {
        console.log("Bubble hide " + this.obj_id);
        this.bubble_showed = false;
        this.bubble.visible = false;
    }

    get_chest() {
        this.cChest.get_chest(this);
    }

    option_ok() {
        console.log("Chest option ok - close: ok");
        Mst.cPlayer.chest.close();
    }

    option_no() {
        console.log("Chest option no");
        if (this.mChest.mw_context === 'investigate') this.cChest.cases.set_investigate();
    }

    option_investigate() {
        console.log("Chest option investigate");
        Mst.cPlayer.cases.add_chest(this);
    }

    option_steal() {
        console.log("Chest option steal");
        console.log("Owner: " + this.mChest.owner);

        Mst.mPlayer.add_sin(8);
        console.log("Player sin: " + Mst.player.stats.sin);

        const owner = Mst.mGame.get_person(this.mChest.owner, "player");
        console.log(owner);
        if (owner) {
            owner.ren_sprite.show_dialogue("To je moje!");
            Mst.cPlayer.chest.close();
        } else {
            if (Mst.player.stats.sin > 200) {
                Mst.cPlayer.chest.open(this);
                this.cChest.cases.steal();
            } else {
                Mst.hud.alerts.show("To se nedělá!");
                Mst.cPlayer.chest.close();
            }
        }
    }
    
    get isAliveItem() {
        if (this.alive) {
            console.log("Alive Item name:", this.mChest.name.substr(0, 4));
            return this.mChest.tname === "item" || this.mChest.name.substr(0, 4) === "item";
        }
        return false;
    }

    collide_test() {
        this.collide_t = false;

        Mst.game.physics.arcade.collide(this, Mst.layers.collision, this.collide_tile(), null, this);
        console.log(this.collide_t);
        return this.collide_t;
    }

    collide_tile() {
        this.collide_t = true;
    }
};
