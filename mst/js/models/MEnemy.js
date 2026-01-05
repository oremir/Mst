class MEStats extends MStats {
    constructor(properties) {
        super(properties);
    }
}

class MEInterface extends MPrefabInterface {
    constructor(mEnemy, properties) {
        super(mEnemy, properties, true);
        this.stats = new MEStats(properties);
        this.health = new MProperty(this.stats.health, this.stats.health_max);
    }
}

class MEnemy extends MPrefab {
    constructor(cEnemy, name, position, properties) {
        super(cEnemy, name, position, properties);
        this.cEnemy = cEnemy;
        this.vEnemy = this.view;

        this.health.max = 40;
        this.en_attack = 2;
        this.anchor_value = 0.5;
        switch (properties.texture) {
            case "slime_spritesheet":
                this.monster_type = "slime";
                this.monster_loot = Mst.creatures.slime.loot;
            break;
            case "rabite_spritesheet":
                this.health.max = 100;
                this.en_attack = 10;
                this.anchor_value = 0.7;
                this.monster_type = "rabite";
                this.monster_loot = Mst.creatures.rabite.loot;
            break;
            case "boar_spritesheet":
                this.health.max = 180;
                this.en_attack = 20;
                this.monster_type = "boar";
                this.monster_loot = Mst.creatures.boar.loot;
            break;
            case "wasp_spritesheet":
                this.health.max = 150;
                this.en_attack = 15;

                this.timer_sting = Mst.game.time.create(false);
                this.timer_sting.loop(Phaser.Timer.SECOND * 0.6, this.create_bullet, this);
                this.timer_sting.start();

                this.monster_type = "wasp";
                this.monster_loot = Mst.creatures.wasp.loot;
            break;
            case "spider_spritesheet":
                this.health.max = 200;
                this.en_attack = 20;

                this.timer_web = Mst.game.time.create(false);
                this.timer_web.loop(Phaser.Timer.SECOND * 0.6, this.create_web, this);
                this.timer_web.start();

                this.monster_type = "spider";
                this.monster_loot = Mst.creatures.spider.loot;
            break;
            case "angostura_spritesheet":
                this.health.max = 100000;
                this.en_attack = 2;

                this.timer_vyh = Mst.game.time.create(false);
                this.timer_vyh.loop(Phaser.Timer.SECOND * 1, this.create_vyh, this);
                this.timer_vyh.start();

                this.cEnemy.stand_still = true;
                this.monster_type = "angostura";
                this.monster_loot = Mst.creatures.angostura.loot;
            break;
            case "angostura-v_spritesheet":
                this.cEnemy.stand_still = true;
                this.monster_type = "angostura_v";
                this.monster_loot = Mst.creatures.angostura_v.loot;
            break;
            case "rotulice_spritesheet":
                this.health.max = 150;
                this.en_attack = 3;
                this.monster_type = "rotulice";
                this.monster_loot = Mst.creatures.rotulice.loot;
            break;
            case "cmelotrysk_spritesheet":
                this.health.max = 150;
                this.en_attack = 0;
                this.monster_type = "cmelotrysk";
                this.monster_loot = Mst.creatures.cmelotrysk.loot;
            break;
        }
    }

    _interface() {
        return new MEInterface(this, this.properties);
    }

    get attack() {
        switch (this.monster_type) {
            case "rotulice":
                if (Mst.cPlayer.buffs.index(1) < 0) return Mst.player.stats.health_max + 1;
                return this.en_attack;
            case "cmelotrysk":
                console.log("čmelotrysk");
                const item = Mst.cPlayer.items.test(112, 1); //kopřiva
                if (item) {
                    Mst.game.time.events.add(Phaser.Timer.SECOND * 0.3, this.cmelo_stop, this);
                    return 0;
                }
                return 20;
            default:
                return this.en_attack;
        }
    }

    cmelo_stop() {
        this.cEnemy.cmelo_stop();
    }
}

Mst.FactoryEnemy = class extends Mst.Factory {
    constructor(group, name) {
        super(group, name);

        this.set_tname("enemy");

        this._spawner = null;
        this._type = "slime";
        this._properties = {
            group: "enemies",
            pool: "enemies",
            texture: "slime_spritesheet",
        };
        this._level = 5;
        this.wave = {
            time: 0,
            count: 0,
            num: 0,
            max: 3,
            mmax: 6,
            _group: null,
            st: {},
            init_st: function(st, group) {
                this.st = st;
                this._group = group;
            },
            add() {
                let time = 0;
                this.time += this.count*3;
                this.num++;
                if (this.num >= this.max) {
                    this.num = 0;
                    this.count++;
                    if (this.max < this.mmax) this.max++;

                    time = this.time*2 + this.count*5 + Mst.rnd(this.st.min, this.st.max)*3;
                    console.log("New enemy wave: " + this.count + " Time: " + time);
                }
                time += Mst.rnd(this.st.min, this.st.max);
                return time;
            },
            get check() {
                return this._group.countLiving() < this.max;
            },
        }
    }

    _template() {
        if (this._type === "slime") return new Mst.Slime(this.names.new, this.position, this._properties);
        return new Mst.Enemy(this.names.new, this.position, this._properties);
    }

    get spawner() {
        return this._spawner;
    }

    set spawner(spawner) {
        this._spawner = spawner;
    }

    get level() {
        return this._level;
    }

    set level(max) {
        const m = Mst.parseIntNull(max);
        if (m) {
            if (m < this._level) this._level = m;
        }
    }

    get spawn_position() {
        const p = Mst.map.getNormRnd(this.spawner.position, this.spawner.dif);
        this.position = p;
        return p;
    }

    get new_type() {
        if (this.spawner.spec !== '') return this.spawner.spec;
        switch (Mst.rnd(1, this.max_level)) {
            case 1:
                return "slime";
            case 2:
                return "rabite";
            case 3:
                return "boar";
            case 4:
                return "wasp";
            case 5:
                return "spider";
            default:
                return "slime";
        }
    }
};

Mst.GroupEnemy = class extends Mst.Group {
    constructor(name) {
        super(name);
    }

    _template_factory() {
        return new Mst.FactoryEnemy(this, this.name);
    }

    get spawner() {
        return this.factory.spawner;
    }

    set spawner(spawner) {
        this.factory.spawner = spawner;
    }

    get spawn_position() {
        return this.factory.spawn_position;
    }

    get new_type() {
        return this.factory.new_type;
    }

    get etype() {
        return this.factory._type;
    }

    set etype(type) {
        this.factory._type = type;
        this.factory._properties.texture = type + "_spritesheet";
    }

    new_enemy() {
        this.etype = this.new_type;
        const np = this.spawn_position;
        const b = Mst.map.checkCollision(np);
        console.log("Chest colision", b);

        if (!b) {
            console.log("Spawn new enemy ", this.etype, "properties", this.factory._properties);
            return this.getNext();
        }
        return null;
    }

    init_spawn(time, level) {
        this.factory.wave.init_st(time, this);
        this.factory.level = level;
    }   

    get spawn_check() {
        return this.factory.wave.check;
    }

    get spawn_level() {
        return this.factory.level;
    }

    get wave_log() {
        return "Wave max: " + this.factory.wave.max + " N: " + this.factory.wave.num;
    }

    spawn_add() {
        return this.factory.wave.add();
    }
};

