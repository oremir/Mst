class MPersonStats extends MStats {
    constructor(properties) {
        super(properties);
        properties = this.properties;

        this.skills = new MPSkills(this, properties.skills);
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
                standard: { exp: 1, level: 1 }
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

class MPSkill {
    constructor(skills, name, value){
        this.skills = skills;
        this.name = name;
        if (value) {
            this._exp = parseInt(value.exp);
            this._level = parseInt(value.level);
        }
    }
    
    get exp() {
        if (this._exp) return this._exp;
        return 0;
    }
    
    get level() {
        if (this._level) return this._level;
        return 0;
    }
    
    add(exp) {
        if (!this._exp) this._exp = 0;
        this._exp += exp;
        this._level_add(exp);
        
        if (this.name === "standard") {
            this.skills.stats.exp = this.exp;
            this.skills.stats.level = this.level;
        }
        
        Mst.hud.alerts.expAlert.exp(this.name, exp);
    }
    
    _level_add(exp) {
        if (!this._level) this._level = 0;
        let test_exp = 0;

        switch (this.name) {
            case "fighter":
                test_exp = Math.pow(1.5, this.level) * 400;
                break;
            case "woodcutter":
                test_exp = Math.pow(1.4, this.level) * 350;
                break;
            case "stonebreaker":
                test_exp = Math.pow(1.4, this.level) * 350;
                break;
            case "forager":
                test_exp = Math.pow(1.4, this.level) * 340;
                break;
            case "magic":
                test_exp = Math.pow(1.4, this.level) * 380;
                break;
            default:
                test_exp = Math.pow(1.6, this.level) * 500;
                break;
        }

        if (exp > test_exp) ++this._level;
        if (this.name === "standard") this.skills.stats.level = this.level;
    }
    
    save() {
        if (this._exp) return {
            exp: this.exp,
            level: this.level
        };
        return null;
    }
}

class MPSkills {
    constructor(stats, core) {
        this.stats = stats;
        this.core = core;
        this._skills = ["standard", "fighter", "woodcutter", "stonebreaker", "magic", "forager", "archer", "miner", "magcrecare", "seeker", "survival", "toolmaker", "farmer"];
        
        this._init(core);
    }
    
    _model(name, value) {
        return new MPSkill(this, name, value);
    }
    
    _init(core) {
        for (const sk of this._skills) {
            this[sk] = core[sk] ? this._model(sk, core[sk]) : this._model(sk);
        }
    }
    
    save() {
        const save = {};
        for (const sk of this._skills) {
            const ss = this[sk].save();
            if (ss) save[sk] = ss;
        }
        return save;
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
