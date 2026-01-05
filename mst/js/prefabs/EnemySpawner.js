Mst.EnemySpawner = class extends Mst.Spawner {
    constructor(name, position, properties) {
        super(name, position, properties);
        this.frames = properties.frames;
        this.etype = "enemy";

        this.pool = Mst.groups.enemies;
        this.pool.spawner = this;
        this.pool_animal = Mst.groups.wildanimals;

        this.spawn_time = {
            min: +properties.spawn_time_min,
            max: +properties.spawn_time_max
        };

        console.log(this);
        this.pool.init_spawn(this.spawn_time, properties.level);

        this.spec = "";
        if (properties.spec) this.spec = properties.spec;
        console.log("Spec: " + this.spec);

        this.spawn_timer = Mst.game.time.create();
        this.spawn_timer_animal = Mst.game.time.create();
    }        
    
    activate() {
        this.spawn();

        console.log("Spawn level: " + this.pool.spawn_level);
        if (this.pool.spawn_level > 1 && this.spec === "") {
            this.spawn_animal();
        }
    }

    schedule_spawn(time) {
        this.spawn_timer.add(Phaser.Timer.SECOND * time, this.spawn, this);
        this.spawn_timer.start();
    }
    
    schedule_spawn_animal(time) {
        // add a new spawn event with random time between a range
        time += Mst.rnd(this.spawn_time.min, this.spawn_time.max);

        this.spawn_timer_animal.add(Phaser.Timer.SECOND * time, this.spawn_animal, this);
        this.spawn_timer_animal.start();
    }
    
    spawn() {
        let time = 100;
        console.log("Enemy count living:", this.pool.countLiving(), this.pool.wave_log);
        if (this.pool.spawn_check) {
            this.pool.new_enemy();
            time = this.pool.spawn_add();
        }
        this.schedule_spawn(time);
    }
    
    spawn_animal() {
        const properties = this.properties;
        properties.group = "wildanimals";
        properties.pool = "wildanimals";

        // get new random position and velocity
        const object_position = Mst.map.getNormRnd(this.position, this.dif);
        // get first dead object from the pool
        let object = this.pool_animal.getFirstDead();

        console.log("Wild Animal count living:" + this.pool_animal.countLiving());
        
        if (this.pool_animal.countLiving() < this.wave_mmax) {
            if (!object) {
                // if there is no dead object, create a new one

                const object_name = "animal_" + this.pool_animal.countLiving();
                object = this.create_animal(object_name, object_position, properties);

                console.log("New animal: " + object_name);
            
            } else {
                // if there is a dead object, reset it to the new position and velocity
                object.reset(object_position);

                console.log("Reset animal: " + object.name);
            }
        }

        // schedule next spawn
        this.schedule_spawn_animal(0);
    }
    
    create_animal(name, position, properties) {
        // return new Enemy with random frame

        switch (Mst.rnd(1, this.pool.spawn_level)) {
            case 1:
                properties.texture = "partridge_spritesheet";
            break;
            case 2:
                properties.texture = "doe_spritesheet";
            break;
            default:
                properties.texture = "doe_spritesheet";
            break;
        }

        return new Mst.WildAnimal(name, position, properties);
    }
};
