Mst.Signpost = class extends Mst.Prefab {
    constructor(name, position, properties) {
        super(name, position, properties);

        Mst.game.physics.arcade.enable(this);

        this.owner = properties.owner;
        this.signpost_text = properties.text;
        this.signpost_alt = properties.alt;
        this.stype = properties.stype;

        this.is_takeable = properties.is_takeable;
        if (typeof(this.is_takeable) === 'string') {
            this.is_takeable = (properties.is_takeable === 'true');
        } else {
            if (typeof(properties.is_takeable) !== 'undefined') {
                this.is_takeable = false;
            }
        }

        this.exposed = false;

        this.anchor.setTo(0.5);
        this.body.immovable = true;
    }

    update() {
        if (Mst.game.physics.arcade.distanceBetween(this, Mst.player) > 22 && Mst.cPlayer.signpost.opened) {
            if (Mst.cPlayer.signpost.opened.name === this.name) {
                console.log(Mst.game.physics.arcade.distanceBetween(this, Mst.player));
                console.log("Signpost is too far!");
                console.log("Signpost closed");
                Mst.cPlayer.signpost.close();
            }
        }
    }
};


