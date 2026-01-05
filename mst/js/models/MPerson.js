class MPersonStats extends MStats {
    constructor(properties) {
        super(properties);
        properties = this.properties;

        this.skills = properties.skills;
        this.abilities = properties.abilities;
        this.badges = properties.badges;
        this.equip = properties.equip;
        this.expequip = properties.expequip;
        this.rumours = properties.rumours;
        this.buffs = properties.buffs;
    }
}

class MPersonInterface extends MPrefabInterface {
    constructor(model, name, position, properties, sup) {
        super(model, properties, true);
        properties = this.properties;

        if (!properties.ren_texture) properties.ren_texture = "";
        this.ren_texture = properties.ren_texture;

        if (!properties.gender) properties.gender = "";
        this.gender = properties.gender;

        this.stress = parseInt(properties.stats.stress);

        if (!properties.skills) {
            properties.skills = {
                standard: { exp: 1, level: 1 },
                fighter: { exp: 1, level: 1 },
                woodcutter: { exp: 1, level: 1 },
                stonebreaker: { exp: 1, level: 1 }
            };
        }

        if (!properties.abilities) {
            properties.abilities = {
                strength: 8,
                constitution: 8,
                intelligence: 8
            };
        }

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

        if (!properties.followers) properties.followers = [];

        if (!properties.badges) properties.badges = {};
        if (!properties.expequip) properties.expequip = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (!properties.rumours) properties.rumours = [];
        if (!properties.buffs) properties.buffs = [];

        this.properties = properties;

        if (!sup) {
            this.stats = new MPersonStats(properties);
            this.health = this.stats.health;
        }
    }
}

class MPerson extends MPrefab {
    constructor(cPerson, name, position, properties) {
        super(cPerson, name, position, properties);

        this.ren_texture = this.interface.ren_texture;
        this.gender = this.interface.gender;
    }

    _interface() {
        return new MPersonInterface(this, this.name, this.position, this.properties);
    }
}
