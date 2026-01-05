Mst.Goout = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);

        this.next_map = +properties.next_map;
        this.go_position = {
            x: +properties.go_position_x,
            y: +properties.go_position_y
        };

        this.locked = false;
        this.key_permit = "";
        this.key_level = 0;
        this.key_obj_id = 0;
        this.permit_type = "";
        if (typeof (properties.locked) !== 'undefined') {
            this.locked = (properties.locked === 'true');
            this.key_permit = properties.key_permit;
            this.key_level = parseInt(properties.key_level);
            this.key_obj_id = parseInt(properties.key_obj_id);
            this.permit_type = properties.permit_type;
        }

        Mst.game.physics.arcade.enable(this);

        this.anchor.setTo(0.5);

        this.body.immovable = true;

        this.notupdated = true;
    }
    
    update() {
        Mst.game.physics.arcade.overlap(this, Mst.player, this.go_out, null, this);
    }
    
    go_out() {
        // start the next map
        const new_int = parseInt(this.next_map);

        if (this.notupdated) {
            this.notupdated = false;
            if (!this.locked) {
                Mst.mGame.save_data(this.go_position, new_int, "goout");
            } else {
                const item = Mst.cPlayer.items.test(82, 1); //klic
                if (item) {
                    if (this.permit_type === "player") {
                        const key_permit = parseInt(this.key_permit);
                        if (key_permit === Mst.usr_id) {
                            Mst.mGame.save_data(this.go_position, new_int, "goout");
                        } else {
                            Mst.hud.alerts.show("Zamčeno!");
                            Mst.game.time.events.add(Phaser.Timer.SECOND * 2, this.set_notupdated, this);
                        }
                    } else {
                        Mst.hud.alerts.show("Zamčeno!");
                        Mst.game.time.events.add(Phaser.Timer.SECOND * 2, this.set_notupdated, this);
                    }
                } else {
                    Mst.hud.alerts.show("Zamčeno!");
                    Mst.game.time.events.add(Phaser.Timer.SECOND * 2, this.set_notupdated, this);
                }
            }
        }
    }
    
    set_notupdated() {
        this.notupdated = true;
    }
};

