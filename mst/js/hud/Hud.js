class CHud extends MControllerObject {
    constructor(cGame, mHud) {
        super(cGame, mHud);
        this.mHud = mHud;
        this.close = new CHClose();

        this.alerts = mHud.alerts;

        this.right_window = mHud.right_window;
        this.middle_window = mHud.middle_window;
        this.question = mHud.question;
        this.book = mHud.book;
        this.newsppr = mHud.newsppr;
        this.cards = mHud.cards;
        this.alt = mHud.alt;

        this.mHud.init(this);
    }

    init() {
        console.log("CHud Init");
        this.right_window = this.mHud.right_window;
        this.middle_window = this.mHud.middle_window;
        this.question = this.mHud.question;
        this.book = this.mHud.book;
        this.newsppr = this.mHud.newsppr;
        this.cards = this.mHud.cards;
        this.alt = this.mHud.alt;

        Mst.init_hud(this);
    }

    init_groups(groups) {
        console.log("CHud Init Groups", groups);
        this.mHud.init_groups(groups);
    }

    create_dialogue(p_name, type, heart, ren) {
        return this.mHud.create_dialogue(p_name, type, heart, ren);
    }
}

Mst.FactoryHud = class extends Mst.Factory {
    constructor(group, name) {
        super(group, name);

        this._position_template = null;
        this._properties_template = null;
        this._spacing = null;
    }

    init(...prop) {
        this.names.template = prop[0];
        this._position_template = prop[1];
        this._properties_template = prop[2];
        this._spacing = prop[2].stats_spacing;
    }

    init_position(p) {
        this._position_template = p;
    }

    set_template_prop(...prop) {
        super.set_template_prop(...prop);
        this._position = prop[1] ? prop[1] : this.new_position;
    }

    get new_position() {
        return {
            x: this._position_template.x + (this.id * this._spacing.x),
            y: this._position_template.y + (this.id * this._spacing.y)
        };
    }

    set new_position(n) {
        throw new Error("Not possible set new position of group factory");
    }

    get nextTemplate() {
        this.set_template_prop(this.names.new, this.new_position, this._properties_template);
        return super.nextTemplate;
    }
};

Mst.GroupHud = class extends Mst.Group {
    constructor(name, arr) {
        super(name);
        this._arr = arr;
    }

    _template_factory() {
        return new Mst.FactoryHud(this, this.name);
    }

    get arr() {
        return this._arr;
    }

    set arr(arr) {
        this._arr = arr;
    }

    init_factory(...prop) {
        this.factory.init(...prop);
    }
};

class CHClose {
    constructor() {
        this.state = [];
        this.context = [];
    }

    add(state, context) {
        this.state.push(state);
        this.context.push(context);
    }

    pop() {
        const state = this.state.pop();
        const context = this.context.pop();
        return [state, context];
    }

    key() {
        const close_state = this.state.pop();
        const close_context = this.context.pop();
        console.log(close_state);
        switch (close_state) {
            case "Dialogue":
                Mst.hud.dialogue.hide();
            break;
            case "Abilities":
                Mst.prefabs[close_context].hide_window();
            break;
            case "MW":
                Mst.hud.middle_window.hide();
            break;
            case "Book":
                Mst.hud.book.hide_book();
            break;
            case "Newsppr":
                Mst.hud.newsppr.hide();
            break;
            case "Question":
                Mst.hud.question.hide();
            break;
        }
    }
}

class MHud {
    constructor() {
        this.cHud = null;
        this.groups = null;
        this.group = null;

        this.hud_classes = {
            "show_stat_with_sprite": Mst.ShowStatWithSprite,
            "show_stat_with_text": Mst.ShowStatWithText,
            "show_stat_with_bar": Mst.ShowStatWithBar,
            "show_equip": Mst.ShowEquip,
            "show_items": Mst.ShowItems,
            "show_business": Mst.ShowBusiness
        };

        this.right_window = new MHRightWindow("right_window");
        this.middle_window = new MHMiddleWindow("middle_window");
        this.question = new MHQuestion("question");
        this.book = new MHBook(this, "book");
        this.newsppr = new MHNewsppr(this, "newsppr");
        this.cards = new MHCards();
        this.alt = new MHAlt("alt");

        this.dialogues = [];
        this.alerts = new MHAlerts(this);
    }

    init(cHud) {
        console.log("MHud Init cHud");
        this.cHud = cHud;
    }

    init_groups(groups) {
        console.log("MHud Init Groups");
        this.groups = groups;
        this.group = groups.hud;
        console.log(this);

        this.right_window.init(this.groups.unhud, this.cHud);
        this.middle_window.init(this.group, this.cHud);
        this.question.init(this.group, this.cHud);
        this.book.init(this.group, this.cHud);
        this.newsppr.init(this.group, this.cHud);
        this.cards.init(this.groups.cards, this.cHud);
        this.alt.init(this.group, this.cHud, this);
        console.log(this);
    }

    init_hud_plug(stats) {
        this.plug = Mst.game.plugins.add(Mst.HUD, this, stats);
        console.log(this);
    }

    create_dialogue(p_name, type, heart, ren) {
        const dialogue = new MHDialogue(this.group, this.cHud, "dialogue", p_name, type, heart, ren);
        this.dialogues.push(dialogue);
        return dialogue;
    }

    create_hud(type, name, position, properties) {
        if (!this.hud_classes.hasOwnProperty(type)) return null;
        const ph = new this.hud_classes[type](name, position, properties);
        this[name] = ph;
        this.cHud[name] = ph;
        return ph;
    }
}

class MHTextPrototype {
    constructor(x, y, value, style) {
        if (!value) value = "";
        if (!style) style = {"font": "12px Arial", "fill": "#FFFFFF"};
        this.text = Mst.game.add.text(x, y, value, style);
        this.text.fixedToCamera = true;
    }

    get value() {
        return this.text.text;
    }

    set value(value) {
        //console.log(this);
        this.text.text = value;
        console.log(this.text.text);
    }

    setMaxWidth(width) {
        this.text.maxWidth = width;
    }

    clear() {
        this.text.text = "";
    }

    destroy() {
        this.text.destroy();
    }
}

class MHTextPrototypeInput extends MHTextPrototype {
    constructor(x, y, value, style, pressed) {
        super(x, y, value, style);
        this.text.inputEnabled = true;
        this.text.input.useHandCursor = true;
        if (pressed) this.text.events.onInputDown.add(pressed, this);
        this.obj = null;
        this.sCaller = null;
    }

    set_pressed(pressed) {
        this.text.events.onInputDown.add(pressed, this);
    }

    set_obj(obj, sc) {
        this.obj = obj;
        this.sCaller = sc;
    }

    destroy() {
        this.obj = null;
        super.destroy();
    }
}

class MHPrototype extends Phaser.Image {
    constructor(group, name, name_img, x, y, txa, tya, frame) {
        if (frame) {
            super(Mst.game, x, y, name_img, frame);
        } else {
            super(Mst.game, x, y, name_img);
        }
        this.name = name;
        if (group) this.init(group);

        this.visible = false;
        this.alpha = 0.7;
        this.fixedToCamera = true;


        if (!txa) txa = 0;
        if (!tya) tya = 0;
        this.text = new MHTextPrototype(x + txa, y + tya);
        this.text.setMaxWidth(150);
    }

    init(group) {
        this.group = group;
        this.group.add(this);
    }

    show(text) {
        this.visible = true;
        this.alpha = 0.7;
        console.log(this, this.text);
        this.text.value = text ? text : "";
    }

    hide() {
        this.visible = false;
        this.text.clear();
    }
}

class MHPrototypeInput extends MHPrototype {
    constructor(group, name, name_img, x, y, txa, tya, frame) {
        if (!txa) txa = 0;
        if (!tya) tya = 0;
        super(group, name, name_img, x, y, txa, tya, frame);
    }

    init(group, cHud) {
        super.init(group);
        this.cHud = cHud;

        this.inputEnabled = true;
        this.input.useHandCursor = true;
        this.events.onInputDown.add(this._pressed, this);
    }

    _pressed() {
        this.hide_onclick();
    }

    hide_onclick() {
        console.log(this);
        this.hide();
        this.cHud.close.pop();
    }
}

class MHFrameBot extends MHPrototypeInput {
    constructor(sCaller, position) {
        const name = "frame_bot";
        super(null, name, name, position.x - 4, position.y + 20, 5, 3);
        this.sCaller = sCaller;
        this.alpha = 0.5;
        this._put_type = null;
    }

    _pressed() {
        this.change_put_type();
    }

    get put_type() {
        return this._put_type;
    }

    set put_type(pt) {
        this._put_type = pt;
        this.sCaller.put_type = pt;
        this.text.value = this.translate_put_type(pt);
    }

    show(pt) {
        this.put_type = pt;
        const text = this.translate_put_type(pt);
        super.show(text);
        this.alpha = 0.5;
    }

    change_put_type() {
        switch(this.put_type) {
            case "put":
                this.put_type = "equip";
                break;
            case "equip":
                this.put_type = "use";
                break;
            case "use":
                this.put_type = "put";
                break;
            case "sell":
                this.put_type = "sell";
                break;
            case "buy":
                this.put_type = "buy";
                break;
            case "mer_admin":
                this.put_type = "mer_admin";
                break;
            default:
                this.put_type = "equip";
        }
        console.log(this.text.value);
    }

    translate_put_type(pt) {
        switch(pt) {
            case "put":
                return "Položit";
            case "equip":
                return "Uchopit";
            case "use":
                return "Použít";
            case "sell":
                return "Prodat";
            case "buy":
                return "Koupit";
            case "mer_admin":
                return "Správa";
            default:
                return "nic";
        }
    }

    reset(p) {
        super.reset(p.x - 4, p.y + 20);
    }
}

class MHItemSprite extends MHPrototype {
    constructor(group, position, texture, id) {
        super(group, "itemGFrame_" + id, texture, position.x - 4, position.y - 5);
        this.alpha = 0.5;
    }
}

class MHItemStat extends MHPrototypeInput {
    constructor(sSprite, position, frame, id) {
        super(sSprite.group, "itemStat_" + id, "items_spritesheet", position.x, position.y, 0, 0, frame);
        this.sSprite = sSprite;
        this.o_type = "items";

        this.events.onInputOver.add(this.show_alt, this);
        this.events.onInputOut.add(this.hide_alt, this);
    }

    _pressed() {
        this.sSprite.put_down_item(this);
    }

    show_alt(item) {
        Mst.hud.alt.show(item);
    }

    hide_alt() {
        Mst.hud.alt.hide();
    }
}

class MHArrayItemSprite extends MArrayItem {
    constructor(group, id, position, spr_texture, st_frame) {
        const sprite = new MHItemSprite(group, position, spr_texture, id);
        super(group._arr, id, sprite);

        this.group = group;
        this._view = null;
        this._x = position.x;
        this._y = position.y;
        this._text = null;
        this._stat = new MHItemStat(this, position, st_frame, id);
        this._dist_x = [ 1, 10 ];
        this._sprite = sprite;
        this._item = null;
        this._frame = st_frame;
        this._q = 0;
        this._pframe = 0;
        this.chest = null;
    }

    init(view, item, pframe) {
        this._view = view;
        this.p_item = item;
        this._pframe = pframe;

        this.show();
        return this;
    }

    get p_item() {
        return this._item;
    }

    set p_item(item) {
        item.view = this;
        this._item = item;
        this.quantity = item.quantity;
        this._frame = item.frame;
        console.log(item);
        const stexture = Mst.workItems.get_gframe_img(this.prefab_frame, item.frame);
        this._sprite.loadTexture(stexture);
        this._stat.loadTexture('items_spritesheet', item.frame);
        console.log(this._item);
    }

    get frame() {
        return this._frame;
    }

    get quantity() {
        return this._q;
    }

    set quantity(q) {
        this._q = q;
        const [cs, dx] = this._text_dist_x;
        if (cs !== this._dist_x[0]) {
            this._text_reset(dx);
        }
        this.text = this._q;
    }

    get text() {
        return this._text.value;
    }

    set text(t) {
        if (this._text) this._text.value = t;
    }

    get put_type() {
        return this._view.put_type;
    }

    get prefab_name() {
        return this._view.prefab_name;
    }

    put_down_item() {
        console.log("put down " + this.put_type + " IF: " + this.frame + " IQ: " + this.quantity, this);
        if (this.prefab_name !== "player") return this.put_down_chestitem();

        const player = Mst.player;
        this.chest = player.cPlayer.chest.opened;
        const frame = this.frame;

        switch (this.put_type) {
            case "put":
                if (!player.cPlayer.business.opened) {
                    let quant_put = 1;
                    if (player.keys.shift.isDown && this.chest) {
                        console.log("SHIFT");
                        quant_put = Math.ceil(this.quantity/2);
                    }

                    // ------------------------------------- - item -----------------------------------------

                    this.sub(quant_put);

                    // ------------------------------------- + item -----------------------------------------

                    this.chest_add(frame, quant_put);
                }
            break;
            case "sell":
            break;
            case "buy":
            break;
            case "mer_admin":
                console.log("admin put down items");
                this.sub(1);
                Mst.hud.businessitems.add_item_i(frame, 1);
            break;
            case "equip":
                player.equip(this.p_item);
                break;
            case "use":
                const q = Mst.workItems.use(this.frame);
                if (q > 0) this.sub(q);
            break;
        }
    }

    put_down_chestitem() {
        const player = Mst.player;
        this.chest = player.cPlayer.chest.opened;
        if (this.chest) {
            const cframe = this.chest.mChest.closed_frame;
            const [f, qt] = Mst.workItems.put_down_chestitem(this, cframe, this.frame, this.quantity);
            if (qt > 0) {
                let tquant = qt;
                let quant_put = 1;
                if (player.keys.shift.isDown && qt < 2) {
                    console.log("SHIFT");
                    quant_put = Math.ceil(this.quantity/2);
                    tquant = quant_put;
                }

                // ------------------------------------- - item -----------------------------------------

                this.sub(tquant);

                // ------------------------------------- + item -----------------------------------------

                this.player_add(f, quant_put);
            } else {
                console.log("To nejde vzit");
                Mst.hud.alerts.show("To nejde vzít");
            }
        }
    }

    chest_add(frame, q) {
        const player = Mst.player;

        console.log("Opened chest: " + this.chest);
        if (!this.chest) { // zadna bedna otevrena - delam novou
            // - create new chest
            this.chest = Mst.groups.chests.create_new_chest(frame);            
            if(!this.chest) {
                console.log("Sem to nejde polozit");
                Mst.hud.alerts.show("Sem to nejde položit");
                this.player_add(frame, q);
                return null;
            } else {
                const cframe = this.chest.mChest.closed_frame;
                this.chest.mChest.set_owner(player.mPlayer.usr_id);
                player.cPlayer.chest.open(this.chest);
                const [f, qt] = Mst.workItems.put_down_item_new_chest(this, cframe, q);
                const ret = this.chest.mChest.items.add(f, qt);
                if (ret) this.chest.cChest.items.show();
                this.chest = null;
                return ret;
            }
        }

        const cframe = this.chest.mChest.closed_frame;
        console.log("Put down: " + cframe + " item: " + frame);
        const uput = { f: frame, wr: cframe };
        player.cPlayer.quests.update("put", uput);

        const [f, qt] = Mst.workItems.put_down_item(this, cframe, frame, q);
        const ret = this.chest.mChest.items.add(f, qt);
        console.log(f, qt, ret);
        if (ret) this.chest.cChest.items.show();
        this.chest = null;
        return ret;
    }

    player_add(f, q) {
        Mst.mPlayer.items.add(f, q);
    }

    sub(q) {
        const ret = this.p_item.sub(q);
        this.text = this.p_item.quantity > 0 ? this.p_item.quantity : "";
        return ret;
    }

    get _text_dist_x() {
        const cs = Math.floor(Math.log(this._q) / Math.log(10));
        switch (cs) {
            case 0:
                return [0, 17];
            case 1:
                return [1, 10];
            case 2:
                return [2, 3];
            case 3:
                return [3, 0];
            default:
                return [3, 0];
        }
    }

    _text_reset(dx) {
        if (this._text) this._text.destroy();
        this._text = new MHTextPrototype(this._x + dx, this._y + 8, this._q);
    }

    show() {
        this._stat.show();
        this._sprite.show();
        console.log(this._stat.visible, this._sprite.visible);
        if (!this._text) {
            const [cs, dx] = this._text_dist_x;
            this._text_reset(dx);
        }
        this._text.value = this._q;
        console.log(this);
    }

    hide() {
        this._stat.hide();
        this._sprite.hide();
        this._text.clear();
    }

    destroy() {}
    preUpdate() {}
    update() {}
    updateTransform() {}
    postUpdate() {}
    _renderCanvas() {}
}

class MHRightWindow extends MHPrototypeInput {
    constructor(name) {
        super(null, name, name, 273, 47);
    }
}

class MHMiddleWindow extends MHPrototypeInput {
    constructor(name) {
        super(null, name, name, 150, 57, 12, 12);

        this.options = [];
        this.mw_object = null;
    }

    show_options(options, obj) {
        const text_style = {"font": "12px Arial", "fill": "#BF9F00"};
        for (let key in options) {
            const text = new MHTextPrototypeInput(163 + (60 * key), 212, "", text_style);            
            text.set_obj(obj, this);

            switch (options[key]) {
                case "yes":
                    text.value = "[ano]";
                    text.set_pressed(this.option_yes);
                    break;
                case "no":
                    text.value = "[ne]";
                    text.set_pressed(this.option_no);
                    break;
                case "ok":
                    text.value = "[ok]";
                    text.set_pressed(this.option_ok);
                    break;
                case "steal":
                    text.value = "[ukrást]";
                    text.set_pressed(this.option_steal);
                    break;
                case "investigate":
                    text.value = "[vyšetřit]";
                    text.set_pressed(this.option_investigate);
                    break;
            }

            this.options.push(text);
        }
    }

    hide_options() {
        this.options.forEach(function (option) {
            option.text.destroy();
        });
    }

    option_yes() {
        if (this.obj) this.obj.option_yes();
        this.sCaller.hide();
    }

    option_no() {
        if (this.obj) this.obj.option_no();
        this.sCaller.hide();
    }

    option_ok() {
        console.log(this);
        if (this.obj) this.obj.option_ok();
        if (this.sCaller) {
            this.sCaller.hide();
        } else {
            this.hide();
        }
    }

    option_steal() {
        if (this.obj) this.obj.option_steal();
        this.sCaller.hide();
    }

    option_investigate() {
        if (this.obj) this.obj.option_investigate();
        this.sCaller.hide();
    }

    open(text, object, options) {
        if (!this.visible) {
            this.cHud.close.add("MW", object.name);
            super.show(text);
            this.mw_object = object;
            this.mw_object.hited = true;

            if (options) this.show_options(options, object);
        }
    }

    hide() {
        this.hide_options();
        if (this.mw_object) this.mw_object.hited = false;
        this.mw_object = null;
        super.hide();
    }
}

class MHQuestion extends MHPrototypeInput {
    constructor(name) {
        super(null, name, name, 8, 240, 8, 2);
        this.question_obj = null;
        this.alpha = 0.6;
    }

    show(obj, text) {
        this.cHud.close.add("Question", "Question");
        super.show(text);
        this.question_obj = obj;
    }

    hide() {
        this.question_obj = null;
        super.hide();
    }

    hide_onclick() {
        const text = this.question_obj.new_answer_text;
        const context = this.question_obj.answer_context;
        this.question_obj.next_question(text, context);
        super.hide_onclick();
    }
}

class MHDialogue extends MHPrototypeInput {
    constructor(group, cHud, name, p_name, type, heart, ren) {
        console.log("Heart", heart);
        if (type === "item") {
            super(group, name, "dialogue_small", 8, 240);
            super.init(group, cHud);
            const text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_name = new MHTextPrototype(16, 244, "", text_style);
            this.text_dialogue = new MHTextPrototype(16, 270, "", text_style);
            this.options_pos = new Mst.Position(15, 325);
        } else {
            super(group, name, "dialogue", 8, 285);
            super.init(group, cHud);
            const text_style = {"font": "11px Arial", "fill": "#FFFFFF", wordWrap: true, wordWrapWidth: this.width - 25};
            this.text_name = new MHTextPrototype(16, 289, "", text_style);
            this.text_dialogue = new MHTextPrototype(16, 315, "", text_style);
            this.options_pos = new Mst.Position(15, 370);

            this.heart_sprite = this.group.create(this.x + 465, this.y + 6, 'hearts_spritesheet', 0);
            this.heart_sprite.visible = false;
            this.heart_sprite.fixedToCamera = true;
            this.text_heart = new MHTextPrototype(457, 290, "", text_style);

            this.atck_sprite = this.group.create(this.x + 485, this.y + 6, 'attack_spritesheet', 0);
            this.atck_sprite.visible = false;
            this.atck_sprite.fixedToCamera = true;
            this.atck_sprite.inputEnabled = true;
            this.atck_sprite.input.useHandCursor = true;
            this.atck_sprite.events.onInputDown.add(this.show_card, this, this);
        }
        this.ren = ren;
        this.dialogue_name = name;
        this.p_name = p_name;        
        this.options = [];
    }

    show(text, options, heart) {
        this.alpha = 0.85;
        this.cHud.close.add("Dialogue", this.name);
        this.text_name.value = this.p_name;
        this.text_dialogue.value = text;
        if (heart) this.text_heart.value = heart;
        if (this.heart_sprite) this.heart_sprite.visible = true;
        if (this.atck_sprite) this.atck_sprite.visible = true;
        if (options) this.show_options(options);
        super.show("");
    }

    hide() {
        this.text_name.clear();
        this.text_dialogue.clear();        
        this.hide_options();

        if (this.heart_sprite) {
            this.heart_sprite.visible = false;
            this.text_heart.clear();
        }

        if (this.atck_sprite) this.atck_sprite.visible = false;

        this.ren.ren_player.hide_ren();
        super.hide();
    }

    hide_onclick(next) {
        "use strict";

        console.log('\x1b[102mHide dialogue tiled');

        super.hide_onclick();

        if (next === 1) {
            console.log("Next dialogue");
        } else {
            this.ren.hide_dialogue();
        }
    }

    show_options(options) {
        console.log("Options:", options, this.options, this);
        const text_style = {"font": "12px Arial", "fill": "#BF9F00"};
        for (let key in options) {
            const x = this.options_pos.x + (60 * key);
            const y = this.options_pos.y;
            const text = new MHTextPrototypeInput(x, y, "", text_style);
            text.set_obj(this.ren, this);
            text.type = options[key];
            // const text = Mst.game.add.text(x + (60 * key), y, "", text_style);
            // text.fixedToCamera = true;
            // text.inputEnabled = true;
            // text.input.useHandCursor = true;

            switch (options[key]) {
                case "buy_sell":
                    text.value = "[prodat]";
                    text.set_pressed(this.buy_sell);
                    //text.events.onInputDown.add(this.buy_sell, this);
                    break;
                case "mer_admin":
                    text.value = "[správa]";
                    text.set_pressed(this.mer_admin);
                    //text.events.onInputDown.add(this.mer_admin, this);
                    break;
                case "quest":
                    text.value = "[úkol]";
                    text.set_pressed(this.option_quest);
                    //text.events.onInputDown.add(this.option_quest, this);
                    break;
                case "assign":
                    text.value = "[přijmout]";
                    text.set_pressed(this.option_assign);
                    //text.events.onInputDown.add(this.option_assign, this);
                    break;
                case "repeat":
                    text.value = "[zopakovat]";
                    text.set_pressed(this.option_repeat);
                    //text.events.onInputDown.add(this.option_repeat, this);
                    break;
                case "speak":
                    text.value = "[mluvit]";
                    text.set_pressed(this.option_speak);
                    //text.events.onInputDown.add(this.option_speak, this);
                    break;
                case "rumour":
                    text.value = "[fáma]";
                    text.set_pressed(this.option_rumour);
                    //text.events.onInputDown.add(this.option_rumour, this);
                    break;
                case "investigate":
                    text.value = "[vyšetřit]";
                    text.set_pressed(this.option_investigate);
                    //text.events.onInputDown.add(this.option_investigate, this);
                    break;
                case "lodging":
                    text.value = "[přespat]";
                    text.set_pressed(this.option_lodging);
                    //text.events.onInputDown.add(this.option_lodging, this);
                    break;
                case "newsppr":
                    text.value = "[koupit]";
                    text.set_pressed(this.option_newsppr);
                    //text.events.onInputDown.add(this.option_newsppr, this);
                    break;
                case "give":
                    text.value = "[dát]";
                    text.set_pressed(this.option_give);
                    //text.events.onInputDown.add(this.option_give, this);
                    break;
            }
            this.options.push(text);
        }
        console.log(this);
    }

    find_option(type) {
        for (const op of this.options) {
            if (type === op.type) return op;
        }
        return null;
    }

    buy_sell() {
        console.log("Buy Sell");
        const op = this.sCaller.find_option("buy_sell");
        if (this.obj) this.obj.buy_sell(op);
        //this.sCaller.hide();
    }
    
    mer_admin() {
        if (this.obj) this.obj.mer_admin();
        this.sCaller.hide();
    }
    
    option_quest() {
        console.log("Option quest HUD");
        if (this.obj) this.obj.option_quest();
        this.sCaller.hide();
    }
    
    option_assign() {
        if (this.obj) this.obj.option_assign();
        this.sCaller.hide();
    }
    
    option_repeat() {
        if (this.obj) this.obj.option_repeat();
        this.sCaller.hide();
    }

    option_speak() {
        if (this.obj) this.obj.option_speak();
        this.sCaller.hide();
    }
    
    option_rumour() {
        if (this.obj) this.obj.option_rumour();
        this.sCaller.hide();
    }
    
    option_investigate() {
        if (this.obj) this.obj.option_rumour();
        this.sCaller.hide();
    }
    
    option_lodging() {
        if (this.obj) this.obj.option_lodging();
        this.sCaller.hide();
    }
    
    option_newsppr() {
        if (this.obj) this.obj.option_newsppr();
        this.sCaller.hide();
    }
    
    option_give() {
        if (this.obj) this.obj.option_give();
        this.sCaller.hide();
    }

    hide_options() {
        this.options.forEach(function (option) {
            option.destroy();
        });
    }

    show_card() {
        this.hide_onclick();
        this.cHud.cards.show();
    }
}

class MHNewsppr extends MHPrototypeInput {
    constructor(hud, name) {
        super(null, name, "newspprf_back", 10, 49);
        this.hud = hud;

        this.texts = [];
        this.np_obj = [];
        this.o_text = "";
    }

    show() {
        this.hud.items.kill_stats();
        this.hud.equip.hide();
        super.show();
        this.show_np_content();
    }

    show_np_content(cont) {
        console.log("Show content newspaper");
        this.cHud.close.add("Newsppr", "Newsppr");

        this.np_i = 16;
        const np = Mst.quest.texts[16];
        console.log(np);

        console.log(cont);

        if (!cont) {
            const a_np_ass = [
                { n: "np_1h-poklad", o: "poklad", x: 35, y: 140},
                { n: "np_arti", o: "poklad", x: 30, y: 180},
                { n: "np_horline", x: 30, y: 310},
                { n: "np_vertlinei", x: 140, y: 130},
                { n: "np_1h-art-pelargon", o: "pelargon", x: 170, y: 130},
                { n: "np_vertlinei", x: 360, y: 130},
                { n: "np_1h-diplomat", o: "diplomat", x: 395, y: 140},
                { n: "np_artii", o: "diplomat", x: 390, y: 180},
                { n: "np_1h-mse", o: "mse", x: 35, y: 325},
                { n: "np_artwide", o: "mse", x: 30, y: 345},
                { n: "np_vertlineii", x: 260, y: 330},
                { n: "np_1h-kouty", o: "kouty", x: 285, y: 325},
                { n: "np_artwide", o: "kouty", x: 280, y: 345}
            ];

            for (const np_ass of a_np_ass) {
                let np_img = null;
                if (np_ass.o) {
                    np_img = new HMNewspprArticle(this.group, this, np_ass.n, np_ass.x, np_ass.y);
                    np_img.o_text = np_ass.o;
                } else {
                    np_img = new MHPrototype(this.group, np_ass.n, np_ass.n, np_ass.x, np_ass.y);
                }
                np_img.show();
                this.np_obj.push(np_img);
            }
        } else {
            this.hide_np_content();
            console.log(cont.o_text);

            this.cHud.close.state.push("Newsppr");
            this.cHud.close.context.push("Newsppr");
            this.o_text = cont.o_text;
            const article = np.content[cont.o_text];
            console.log(article);

            if (article.r) Mst.cPlayer.add_rumour(article.r);

            let text_style = {"font": "bold 16px Bookman Old Style", "fill": "#000000", tabs: 40 };
            const text_title = new MHTextPrototype(40, 135, article.title, text_style);
            this.texts.push(text_title);
            text_style = {"font": "10px Bookman Old Style", "fill": "#000000", wordWrap: true, wordWrapWidth: this.width - 55};
            const text = new MHTextPrototype(40, 160, article.c, text_style);
            this.texts.push(text);
        }
    }

    hide_np_content() {
        this.np_obj.forEach(function (np) {
            np.destroy();
        });
        this.np_obj = [];
    }

    hide() {
        this.texts.forEach(function (text) {
            text.destroy();
        });
        this.texts = [];
        if (this.o_text === "") {
            this.hide_np_content();
            super.hide();
            this.hud.items.show_initial_stats();
            this.hud.equip.show();
        } else {
            this.o_text = "";
            this.show_np_content();
        }
    }
}

class HMNewspprArticle extends MHPrototypeInput {
    constructor(group, mNp, name, x, y) {
        super(group, name, name, x, y);
        this.mNp = mNp;
    }

    hide_onclick() {
        this.mNp.show_np_content(this);
    }
}

class MHCards {
    constructor() {
        this.cards = [];
        this.cards_player_deck = [];
        this.cards_enemy_deck = [];
        this.cards_enemy_draw = [];
    }

    init(group, cHud) {
        this.group = group;
        this.cHud = cHud;
        this.create_card();
    }

    create_card() {
        const card = new MHPrototypeInput(this.group, "card", "card_spritesheet", 20, 220, 0, 0, 0);
        card.init(this.group, this.cHud);
        this.cards.push(card);
        return card;
    }

    show() {
        this.cards[0].show();
    }
}

class MHAlerts {
    constructor(mHud) {
        this.mHud = mHud;
        this.alerts = [];
        this.alert_sprites = [];
        this.i = -1;
    }

    show(text) {
        this.alerts.push(text);
        this.next();
    }

    next() {
        if (this.alerts.length > 0) {
            const [i, alert] = this.get_first_dead();
            if (i > -1) {
                const text = this.alerts.shift();
                this.i = i;
                this.show_alert(text, i, alert);
            }
        }
    }

    show_alert(text, i, alert) {
        if (alert) {
            alert.show(text);
        } else {
            this.create_new_alert(text, i);
        }
        this.next();
    }

    get_first_dead() {
        const as = this.alert_sprites;
        const j = this.i < 12 ? this.i + 1 : 0;
        if (as[j]) {
            if (!as[j].visible) return [j, as[j]];
        }
        for (let i in as) {
            if (!as[i].visible) return [i, as[i]];
        }
        if (as.length < 13) return [as.length, null];
        return [-1, null];
    }

    create_new_alert(text, i) {
        const alert = new MHAlert(this.mHud.group, this, i);
        alert.show(text);
        console.log(alert, text);
        this.alert_sprites.push(alert);
    }

    reset_i(i) {
        if (this.i === i) this.i = -1;
        this.next();
    }
}

class MHAlert extends MHPrototype {
    constructor(group, mAlerts, i) {
        const x = 8;
        const y = 50;
        super(group, "alert_" + i, "alt", x, y + 20 * i, 8, 2);
        this.mAlerts = mAlerts;
        this.timer = Mst.game.time.create(false);
        this.i = i;
    }

    show(text) {
        this.timer.add(Phaser.Timer.SECOND * 1.6, this.hide, this);
        this.timer.start();
        const texture = text.length > 12 ? "alt_160_20" : "alt";
        this.loadTexture(texture);
        super.show(text);
    }

    hide() {
        this.mAlerts.reset_i(this.i);
        super.hide();
    }
}

class MHAlt extends MHPrototype {
    constructor(name) {
        super(null, name, name, 8, 50, 6, 3);

        this.fixedToCamera = false;
    }

    init(group, cHud, mHud) {
        super.init(group);
        this.mHud = mHud;
        this.cHud = cHud;
        console.log(mHud);
        console.log(this);
    }

    show(obj) {
        const type = obj.o_type;
        const x = obj.x - 4;
        const y = obj.y - 30;
        let text = "";

        switch (type) {
            case "items":
                console.log(this, obj);
                text = Mst.items[obj.frame].name;
            break;
            case "chestitems":
                text = Mst.items[obj.frame].name;
                this.alpha = 0.85;
            break;
            case "otherPlayer":
                text = obj.name;
            break;
        }
        const texture = text.length > 12 ? "alt_160_20" : "alt";
        this.loadTexture(texture);
        this.reset(x, y);
        console.log(this, obj);
        const text_style = {"font": "12px Arial", "fill": "#FFFFFF"};
        this.alt_text = Mst.game.add.text(x + 6, y + 3, text, text_style);
        //this.alt_text.fixedToCamera = false;
        this.visible = true;
        this.alpha = 0.7;
    }

    hide() {
        this.visible = false;
        if (this.alt_text) this.alt_text.destroy();
    }
}

class MHBook extends MHPrototypeInput {
    constructor(hud, name) {
        super(null, name, name, 10, 42, 0, 0);
        this.hud = hud;
        this.texts = [];
        this.book_obj = [];
        this.bid = -1;
    }

    show() {
        console.log(this);
        this.cHud.close.add("Book", "Book");
        this.hud.items.kill_stats();
        this.hud.equip.hide();
        super.show();
        this.alpha = 1;
        this.book_main();
    }

    hide_book_content() {
        this.book_obj.forEach((obj) => obj.destroy());
        this.np_obj = [];

        this.texts.forEach((text) => text.destroy());
        this.texts = [];
    }

    hide() {
        this.hide_book_content();
        super.hide();

        this.hud.items.show_initial_stats();
        this.hud.equip.show();
    }

    book_main() {
        this.book_make_bookmark(0, 0, "main");
        this.book_make_bookmark(1, 1, "acquaintance");
        this.book_make_bookmark(2, 1, "investigate");

        const player = Mst.player;

        const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };
        const text_value = player.name;
        let text = new MHTextPrototype(60, 105, text_value, text_style);
        this.texts.push(text);

        let f_texture = "";
        if (player.mPlayer.ren_texture === "") {
            if (player.mPlayer.gender === "male") {
                f_texture = "male_f";
            } else {
                f_texture = "female_f";
            }
        } else {
            f_texture = player.mPlayer.ren_texture.substring(0, player.ren_texture.length - 3) + "f";
        }

        console.log(f_texture);

        const photo = this.group.create(60, 124, f_texture);
        photo.fixedToCamera = true;
        photo.visible = true;
        this.book_obj.push(photo);

        const stopy = player.stats.badges['14'];
        const vzhled = player.stats.badges['15'];
        console.log(stopy);
        console.log(vzhled);
        const stopy_a = stopy.split("|");
        const vzhled_a = vzhled.split("|");

        let ind = parseInt(vzhled_a[0].substr(1,vzhled_a[0].length));
        const rasa = Mst.core.rasa[ind];
        text = Mst.game.add.text(130, 125, rasa, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);

        let vyskavaha = stopy_a[0].substr(1,stopy_a[0].length) + " cm, ";
        vyskavaha += stopy_a[1].substr(1,stopy_a[1].length) + " kg ";
        text = Mst.game.add.text(130, 138, vyskavaha, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);

        const bota = "Bota: " + stopy_a[2].substr(1,stopy_a[2].length);
        text = Mst.game.add.text(130, 151, bota, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);

        const vek = "cca " + vzhled_a[1].substr(1,vzhled_a[1].length) + " let";
        text = Mst.game.add.text(130, 164, vek, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);

        text = Mst.game.add.text(130, 177, "Vlasy:", text_style);
        text.fixedToCamera = true;
        this.texts.push(text);
        ind = parseInt(vzhled_a[3].substr(1,vzhled_a[3].length));
        const vlasy = Mst.core.barva[ind];
        text = Mst.game.add.text(135, 190, vlasy, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);
        ind = parseInt(vzhled_a[4].substr(1,vzhled_a[4].length));
        const vlasyd = Mst.core.delkavlasu[ind];
        text = Mst.game.add.text(135, 203, vlasyd, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);

        ind = parseInt(vzhled_a[2].substr(1,vzhled_a[2].length));
        const postava = "Postava: " + Mst.core.postava[ind];
        text = Mst.game.add.text(60, 220, postava, text_style);
        text.fixedToCamera = true;
        this.texts.push(text);
    }

    book_acquaintance() {
        this.book_make_bookmark(0, 1, "main");
        this.book_make_bookmark(1, 0, "acquaintance");
        this.book_make_bookmark(2, 1, "investigate");

        const rel = Mst.player.stats.relations;
        rel.sort((a, b) => b.exp - a.exp);

        const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };
        let index = 0;
        let index2 = 0;

        for (let key in rel) {
            if (key < 18) {
                const text_value = rel[key].name + "\t " + rel[key].exp;
                const text = Mst.game.add.text(60, 105 + 13 * index, text_value, text_style);
                text.fixedToCamera = true;
                this.texts.push(text);
                index ++;
            }
            if (key > 17 && key < 35) {
                const text_value = rel[key].name + "\t " + rel[key].exp;
                const text = Mst.game.add.text(310, 105 + 14 * index2, text_value, text_style);
                text.fixedToCamera = true;
                this.texts.push(text);
                index2 ++;
            }
        }
    }

    book_investigate(t1) {
        console.log(t1);
        const bid = t1 ? t1.pcid : this.bid;

        this.hide_book_content();

        this.book_make_bookmark(0, 1, "main");
        this.book_make_bookmark(1, 1, "acquaintance");
        this.book_make_bookmark(2, 0, "investigate");

        const player = Mst.player;
        const cases = player.cPlayer.cases;

        const text_style = {"font": "11px Arial", "fill": "#000000", tabs: 40 };

        let index = 0;

        if (bid < 0) {
            const texts = this.texts;
            cases.for_each((ncase, pcid) => {
                let text_value = "#" + pcid + " ";
                switch (ncase.type) {
                    case "stolen":
                        text_value += "Krádež";
                    break;
                }
                text_value += " na M: " + ncase.map;
                const text = Mst.game.add.text(60, 105 + 13 * pcid, text_value, text_style);

                text.inputEnabled = true;
                text.input.useHandCursor = true;
                text.pcid = pcid;
                text.c_type = "evidence";
                text.events.onInputDown.add(this.book_investigate, this, text);
                text.fixedToCamera = true;
                texts.push(text);

                if (pcid === cases.act_pcid) console.log(pcid + ": active");
            });
            index += cases.length() - 1;
        } else {
            if (t1.c_type === 'evidence') {
                cases.set_act_pcid(bid);
                const acase = cases.get_act_case();
                const evidences = acase.evidences;

                let text_value = "#" + bid + " ";
                switch (acase.type) {
                    case "stolen":
                        text_value += "Krádež";
                    break;
                }
                text_value += " na M: " + acase.map;
                let text = Mst.game.add.text(60, 105, text_value, text_style);
                text.fixedToCamera = true;
                this.texts.push(text);

                index++;

                let firstid = 0;
                console.log(index + evidences.length);
                if ((index + evidences.length) > 18) {
                    if (t1.firstid) firstid = t1.firstid;

                    if (firstid + 18 < evidences.length) {
                        const tpage = this.group.create(475, 348, 'book_bm_spritesheet', 3);
                        tpage.inputEnabled = true;
                        tpage.input.useHandCursor = true;
                        tpage.pcid = bid;
                        tpage.firstid = firstid + 17;
                        tpage.c_type = "evidence";
                        tpage.events.onInputDown.add(this.book_investigate, this, tpage);
                        tpage.fixedToCamera = true;
                        tpage.visible = true;
                        this.book_obj.push(tpage);
                        console.log(tpage);
                    }

                    if (firstid > 0) {
                        const tpage1 = this.group.create(28, 348, 'book_bm_spritesheet', 2);
                        tpage1.inputEnabled = true;
                        tpage1.input.useHandCursor = true;
                        tpage1.pcid = bid;
                        tpage1.firstid = firstid - 17;
                        tpage1.c_type = "evidence";
                        tpage1.events.onInputDown.add(this.book_investigate, this, tpage1);
                        tpage1.fixedToCamera = true;
                        tpage1.visible = true;
                        this.book_obj.push(tpage1);
                    }
                }

                for (let id = firstid; id < evidences.length; id++) {
                    console.log("Index: " + index + " Id: " + id);
                    if (index < 18) {
                        const wit_un = acase.get_witnessNID(id);
                        if (wit_un.type === 'NPC' || wit_un.type === 'player') {
                            text_value = "- " + wit_un.name;
                            console.log(wit_un.name + " - evidence: " + evidences[id]);
                        } else {
                            text_value = "- " + evidences[id];
                        }
                        text = Mst.game.add.text(70, 105 + 13 * index, text_value, text_style);
                        text.fixedToCamera = true;
                        text.inputEnabled = true;
                        text.pcid = bid;
                        text.nid = id;
                        text.firstid = firstid;
                        text.c_type = "evidence";
                        text.c_type1 = "show";
                        text.input.useHandCursor = true;
                        text.events.onInputDown.add(this.book_investigate, this, text);
                        this.texts.push(text);

                        const near = acase.is_ftp_near(id);
                        console.log(near);
                        const near2 = acase.is_ftp_test(id);
                        console.log(near2);
                        if (near && near2.b) {
                            const lupa = this.group.create(57, 106 + 13 * index, 'lupa11', 0);
                            lupa.inputEnabled = true;
                            lupa.input.useHandCursor = true;
                            lupa.pcid = bid;
                            lupa.nid = id;
                            lupa.c_type = "ftp";
                            lupa.events.onInputDown.add(this.book_investigate, this, lupa);
                            lupa.fixedToCamera = true;
                            lupa.visible = true;
                            this.book_obj.push(lupa);
                        }
                    }

                    index++;
                }

                if (t1.c_type1 === 'show') {
                    console.log("Book investigate show");
                    console.log(evidences[t1.nid]);

                    const cont = "Book|" + "|" + firstid + "|" + t1.nid + "|" + bid;
                    const wit_un = acase.get_witnessNID(t1.nid, cont);
                    console.log(wit_un);

                    if (wit_un.type === 'NPC' || wit_un.type === 'player') {
                        if (wit_un.character) {
                            text_value = wit_un.name;
                            text = Mst.game.add.text(310, 105, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            let fsuff = "";
                            if (wit_un.gender !== "male") fsuff = "a";

                            console.log(wit_un.f_texture);

                            const photo = this.group.create(310, 124, wit_un.f_texture);
                            photo.fixedToCamera = true;
                            photo.visible = true;
                            this.book_obj.push(photo);

                            if (wit_un.stopy) {
                                text = Mst.game.add.text(130 + 250, 138, wit_un.vyskavaha, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(130 + 250, 151, wit_un.bota, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);
                            }

                            if (wit_un.vzhled) {
                                text = Mst.game.add.text(130 + 250, 125, wit_un.rasa, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(130 + 250, 164, wit_un.vek, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(130 + 250, 177, "Vlasy:", text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(135 + 250, 190, wit_un.vlasy, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(135 + 250, 203, wit_un.vlasyl, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text = Mst.game.add.text(60 + 250, 220, wit_un.postava, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);
                            }

                            if (wit_un.M) {
                                text_value = "Byl" + fsuff + " na mapě " + wit_un.M;
                            } else {
                                text_value = "Nepamatuje si, kde byl" + fsuff;
                            }

                            text = Mst.game.add.text(60 + 250, 246, text_value, text_style);
                            text.fixedToCamera = true;
                            this.texts.push(text);

                            if (wit_un.culprit) {
                                text_value = "Byl to " + wit_un.culprit.rasa + ", " + wit_un.culprit.mz + ".";
                                text_value += " Výška " + wit_un.culprit.vyska + " cm.";

                                text = Mst.game.add.text(60 + 250, 259, text_value, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);

                                text_value = "Věk asi " + wit_un.culprit.vek + " let.";
                                text_value += " Postava " + wit_un.culprit.postava + ".";

                                text = Mst.game.add.text(60 + 250, 272, text_value, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);
                            } else {
                                text_value = "Nikoho neviděl" + fsuff;
                                text = Mst.game.add.text(60 + 250, 259, text_value, text_style);
                                text.fixedToCamera = true;
                                this.texts.push(text);
                            }
                        }
                    } else {
                        text_value = evidences[t1.nid];
                        text = Mst.game.add.text(310, 105 + 13, text_value, text_style);
                        text.fixedToCamera = true;
                        this.texts.push(text);
                    }
                }
            } else {
                cases.case[bid].ftp_book_investigate(t1.nid);

                const t2 = {
                    pcid: bid,
                    c_type: "evidence"
                };

                this.book_investigate(t2);
            }
        }
    }

    book_make_bookmark(n, m, o_text) {
        const bk_mrk = this.group.create(502, 85 + 45 * n, 'book_bm_spritesheet', m);
        bk_mrk.inputEnabled = true;
        bk_mrk.input.useHandCursor = true;
        bk_mrk.events.onInputDown.add(this.book_bookmark, this);
        bk_mrk.fixedToCamera = true;
        bk_mrk.o_text = o_text;
        bk_mrk.visible = true;
        this.book_obj.push(bk_mrk);

        const bk_mrk1 = this.group.create(512, 92 + 45 * n, 'book_ico_spritesheet', n);
        bk_mrk1.fixedToCamera = true;
        bk_mrk1.visible = true;
        this.book_obj.push(bk_mrk1);
    }

    book_bookmark(bm) {
        this.hide_book_content();

        switch(bm.o_text) {
            case "main":
                console.log(bm.o_text);

                this.book_main();
            break;
            case "acquaintance":
                console.log(bm.o_text);

                this.book_acquaintance(0);
            break;

            case "investigate":
                console.log(bm.o_text);

                this.book_investigate();
            break;
        }
    }
}
