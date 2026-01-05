Mst.Bed = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);

        Mst.game.physics.arcade.enable(this);
        this.body.immovable = true;
        this.anchor.setTo(0.5);

        this.owner = properties.owner;

        this.is_takeable = properties.is_takeable;
        if (typeof(this.is_takeable) === 'string') {
            this.is_takeable = (properties.is_takeable === 'true');
        } else {
            if (typeof(properties.is_takeable) !== 'undefined') this.is_takeable = false;
        }

        this.mw_context = "bed";
        this.hited = false;
    }

    open_collision(player) {
        console.log("Open collision: Bed");
        if (!this.hited) {
            const succ = Mst.hud.middle_window.open("Chcete se vyspat?", this, ["yes", "no"]);
            if (succ) this.hited = true;
        }
    }
    
    option_yes() {
        console.log("Option YES");
        Mst.mPlayer.sleep();
    }

    option_no() {
        console.log("Option NO");
        this.hited = false;
    }
    
    option_ok() {
        console.log("Option OK");
        this.hited = false;
    }
};
