class MStats {
    constructor(properties) {
        properties = this.check(properties);
        this.health = parseInt(properties.stats.health);
        this.health_max = parseInt(properties.stats.health_max);
        this.items = properties.items;
        this.properties = properties;
    }

    check(properties) {
        console.log("Items: " + properties.items);
        if (!properties.items) properties.items = "";
        if (!properties.stats) {
            properties.stats = {
                health: 100,
                health_max: 100,
                stress: 0
            };
        }
        return properties;
    }

    reset(properties) {
        properties = this.check(properties);
        this.health = parseInt(properties.stats.health);
        this.health_max = parseInt(properties.stats.health_max);
        this.items = properties.items;
        this.properties = properties;
    }
}

class MPItem extends MArrayItem {
    constructor(arr, id, value) {
        super(arr, id, value);
        this._avalue = value.split("-");
        this.frame = parseInt(this._avalue[0]);
        this._q = new MProperty(this._avalue[1]);
        this._view = null;
    }

    get quantity() {
        return this._q.get();
    }

    set quantity(q) {
        this._q.set(q);
        this.setCore();
    }

    get view() {
        return this._view;
    }

    set view(v) {
        this._view = v;
    }

    setCore() {
        const nval = this.save();
        return this.set(nval);
    }

    add(q) {
        this._q.add(q);
        this.setCore();
        if (this.view) this.view.quantity = this.quantity;
        return this;
    }

    sub(q) {
        if (!q) q = 1;
        const ret = this._q.sub(q);
        console.log(ret);
        this.setCore();
        if (this.view) this.view.quantity = this.quantity;
        if (ret < 1) this.remove();
        return ret;
    }

    sub_all() {
        const q = this.quantity;
        this.sub(q);
        return q;
    }

    save() {
        return this.frame + "-" + this.quantity;
    }
}

class MPItems extends MArrayString {
    constructor(items) {
        super(items, "_");
        this._view = null;
    }

    init_view(view) {
        this._view = view;
    }

    get(f) {
        for (const item of this) {
            if (item.frame === f) return item;
        }
        return null;
    }

    add(f, q) {
        const item = this.get(f);
        if (item) return item.add(q);
        const ni = super.add(f + "-" + q);
        this.reset();
        return ni;
    }

    put_all(content) {
        if (content.length > 0) {
            for (const c of content) {
                this.add(c.f, c.q);
            }
        }
    }

    test(frame, quantity) {
        const item = this.get(frame);
        console.log(item);
        if (item) {
            if (item.quantity >= quantity) return item;
        }
        return null;
    }

    test_gold(q) {
        return this.test(1, q);
    }

    remove(id) {
        super.remove(id);
        this.reset();
    }

    reset(items) {
        if (items) {
            super.reset(items);
        } else {
            console.log(this._view);
            if (this._view) {
                if (this._view.showed) this.show();
            }
        }
    }

    show() {
        console.log(this, this._view);
        if (this._view) {
            this._view.kill_stats();
            this._view.show_initial_stats();
            if (this._view.prefab_name === 'player') Mst.hud.equip.show();
        }
    }

    hide() {
        if (this._view) {
            this._view.kill_stats();
            if (this._view.prefab_name === 'player') Mst.hud.equip.hide();
        }
    }

    _model(index, value) {
        return new MPItem(this, index, value);
    }
}

class MPrefabInterface {
    constructor(model, properties, sup) {
        this.model = model;
        this.properties = properties;

        this.group_name = properties.group || properties.pool;

        if (!sup) {
            this.stats = new MStats(properties);
            this.health = new MProperty(this.stats.health, this.stats.health_max);
        }

        this.walking_speed = Mst.parseInt(properties.walking_speed);
        this.jumping_speed = Mst.parseInt(properties.jumping_speed);
    }

    init(name, position) {
        this.name = name;
        this.position = position;
        const properties = JSON.parse(JSON.stringify(this.properties));

        this.save = {
            name: name,
            x: position.x,
            y: position.y,
            properties: properties
        };
    }

    reset(name, position, properties) {
        this.init(name, position);
        this.stats.reset(properties);
        this.health.reset(this.stats.health_max);

        this.walking_speed = Mst.parseInt(properties.walking_speed);
        this.jumping_speed = Mst.parseInt(properties.jumping_speed);
    }
}

class MPrefab extends MModel {
    constructor(cPrefab, name, position, properties) {
        super(cPrefab, properties);
        this.name = name;
        this.position = position;
        this.interface = this._interface();

        console.log(this);
        this.stats = this.interface.stats;
        this.health = this.interface.health;
        this.walking_speed = this.interface.walking_speed;
        this.jumping_speed = this.interface.jumping_speed;

        this.items = new MPItems(this.interface.stats.items);

        this.save = this.interface.save;

        this.group_name = this.interface.group_name;
    }

    _interface() {
        return new MPrefabInterface(this, this.properties);
    }

    init(name, position) {
        this.interface.init(name, position);
        this.save = this.interface.save;
        this.name = name;
        this.position = position;

        this.identity = new MPrefabIdentity(this, Mst.mGame.identities);

        console.log("Prefab Init", this);
        this.group = Mst.groups[this.group_name];
        this.group.add(this.view);
        Mst.mGame.prefabs[name] = this.view;
    }

    reset(name, position, properties) {
        this.name = name;
        this.position = position;

        this.interface.reset(name, position, properties);
        this.stats = this.interface.stats;
        this.health = this.interface.health;
        this.walking_speed = this.interface.walking_speed;
        this.jumping_speed = this.interface.jumping_speed;

        this.items.reset(this.stats.items);
        this.save = this.interface.save;
        Mst.mGame.prefabs[name] = this.view;
    }
}

class CPrefab extends MController {
    constructor(vPrefab, name, position, properties, sup) {
        super(vPrefab, properties);
        if (!sup) this.model.init(name, position);

        this.name = name;
        this.position = position;
    }

    _model() {
        return new MPrefab(this, this.name, this.position, this.properties);
    }

    reset(name, position, properties) {
        this.name = name;
        this.position = position;
        this.model.reset(name, position, properties);
    }
}

Mst.IDserv = class {
    constructor() {
        this._id_pointer = 0;
        this._IDs = {};
    }

    _nextId() {
        const id = this.id;
        this._id_pointer++;
        return id;
    }

    get id() {
        return this._id_pointer;
    }

    set id(id) {
        this._id_pointer = id;
    }

    makeId(child) {
        const id = this._nextId();
        child.groupId = id;
        this._IDs[id] = child;
        return child;
    }

    getId() {
        const id = this.id;
        const child = this._IDs[id];
        if (child) this._nextId();
        return child;
    }

    removeId(child) {
        const id = child.groupId;
        delete this._IDs[id];
    }

    reset() {
        this._id_pointer = 0;
    }
};

Mst.NameServ = class {
    constructor() {
        this._template = "";
        this.cNames = new Set();
    }

    add(name) {
        if (name) this.cNames.add(name);
    }

    has(name) {
        return this.cNames.has(name);
    }

    get length () {
        return this.cNames.size;
    }


    get template() {
        return this._template;
    }

    set template(nt) {
        this._template = nt;
    }

    get new() {
        let num = this.length;
        let nname = this._template + "_" + num;
        while (this.has(nname)) {
            num++;
            nname = this._template + "_" + num;
        }
        return nname;
    }

    set new(n) {
        throw new Error("Not possible set new name of group factory");
    }

    removeName(child) {
        const name = child ? child.name : null;
        if (name) this.cNames.delete(name);
    }
};

Mst.Factory = class {
    constructor(group, name) {
        this.group = group;
        this.name = name;
        this.ids = new Mst.IDserv();
        this.names = new Mst.NameServ();

        this._tname = null;
        this._position = null;
        this._properties = null;
    }

    _template() {
        return new Mst.Prefab(this._tname, this._position, this._properties);
    }

    set_template_prop(...prop) {
        this._tname = prop[0] ? prop[0] : this.names.new;
        this._position = prop[1];
        this._properties = prop[2];
    }

    set_tname(name) {
        this.names.template = name;
    }

    get template_prop() {
        return [this._tname, this._position, this._properties];
    }

    get position() {
        return this._position;
    }

    set position(p) {
        this._position = p;
    }
    
    get nextTemplate() {
        const temp = this._template();
        return this.ids.makeId(temp);
    }

    get id() {
        return this.ids.id;
    }

    get tname() {
        return this._tname;
    }

    set tname(name) {
        this._tname = name;
    }
    
    reset() {
        this.ids.reset();
    }
};

Mst.Group = class extends Phaser.Group {
    constructor(name) {
        super(Mst.game);
        this.name = name;
        this.factory = this._template_factory();
        this.ids = this.factory.ids;
        this.names = this.factory.names;
    }
    
    _template_factory() {
        return new Mst.Factory(this, this.name);
    }

    
    get tname() {
        return this.names.template;
    }

    set tname(name) {
        console.log(this.factory);
        this.factory.set_tname(name);
    }
    
    add(child) {
        super.add(child);
        this.names.add(child.name);
    }
    
    create(x, y, key, frame, name) {
        super.create(x, y, key, frame);
        this.names.add(name);
        const n = this.getTop();
        console.log(n);
        return n;
    }
    
    get firstDead() {
        const fd = this.getFirstDead();
        const name = this.factory.names.new;
        const position = this.factory.position;
        const properties = this.factory._properties;
        if (fd) fd.reset(name, position, properties);
        return fd;
    }

    _getByName(name, position) {
        if (this.names.has(name)) {
            const child = this.getByName(name);
            if (child) {
                if (child.alive) return child;
                const properties = this.factory._properties;
                if (position) return child.reset(name, position, properties);
                return child.revive();
            }
        }
        return null;
    }
    
    _getNew() {
        const child = this.factory.nextTemplate;
        this.add(child);
        return child;
    }

    _getNext(name, position, properties) {
        if (position) this.factory.set_template_prop(name, position, properties);
        const fd = this.firstDead;
        return fd ? fd : this._getNew();
    }

    getNext(position, properties) {
        return this.get(null, position, properties);
    }

    get(name, position, properties) {
        const child = name ? this._getByName(name, position) : null;
        return child ? child : this._getNext(name, position, properties);
    }

    get_next() {
        const child = this.ids.getId();
        return child ? child : this._getNew();
    }

    remove(child, dest) {
        this.ids.removeId(child);
        this.names.removeName(child);
        super.remove(child, dest);
    }
    
    reset() {
        this.forEach((c) => c.hide(), this);
        this.factory.reset();
    }
};

Mst.Prefab = class extends Phaser.Sprite {
    constructor(name, position, properties) {
        if (!properties.texture) properties.texture = "blank_image";

        super(Mst.game, position.x, position.y, properties.texture, properties.firstframe);
        this.name = name;
        this._position = position;
        this.properties = properties;

        console.log(this);
        this.controller = this._controller();
        this.model = this.controller.model;
        this.identity = this.model.identity;
    }

    _controller() {
        return new CPrefab(this, this.name, this._position, this.properties);
    }

    reset(name, position, properties) {
        this.name = name;
        this._position = position;
        this.properties = properties;

        this.controller.reset(name, position, properties);
        super.reset(position.x, position.y);
    }
};
