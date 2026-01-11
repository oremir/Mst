Mst.Model.WorkItems = class {
    constructor() {

    }

    get_gframe_img(pframe, frame) {
        const frame_int = parseInt(frame);
        switch (pframe) {
            case 7: // drevo
                switch (frame_int) {
                    case 32: // prkno
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 56: // zel. kotlik hori
                switch (frame_int) {
                    case 92: // ohen
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 64: // vyhen
                switch (frame_int) {
                    case 103: // tav. zelezo
                        return "frame_item_fial";
                    case 183: // zhav. med
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 65: // vyhen hori
                switch (frame_int) {
                    case 92: // ohen
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 69: // dzban plny
                switch (frame_int) {
                    case 81: // voda
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 71: // zel. kotlik plny
                switch (frame_int) {
                    case 81: // voda
                        return "frame_item_fial";
                    case 147: // Destil. voda
                        return "frame_item_fial";
                    case 149: // Tinktura
                        return "frame_item_fial";
                    case 152: // Inkoust
                        return "frame_item_fial";
                    case 173: // Cistici l.
                        return "frame_item_fial";
                    case 188: // Antilevitacni l.
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 74: // zel. kotlik plny hori
                switch (frame_int) {
                    case 81: // voda
                        return "frame_item_fial";
                    case 92: // ohen
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 77: // zel. kotlik na drevu
                switch (frame_int) {
                    case 32: // prkno
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 79: // zel. kotlik na drevu plny
                switch (frame_int) {
                    case 32: // prkno
                        return "frame_item_fial";
                    case 81: // voda
                        return "frame_item_fial";
                    case 147: // Destil. voda
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 83: // ohen
                switch (frame_int) {
                    case 92: // ohen
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            case 104: // kam. nadoba s tav.
                switch (frame_int) {
                    case 105: // zhav. zelezo
                        return "frame_item_fial";
                    default:
                        return "frame_item";
                }
            break;
            default:
                return "frame_item";
        }
    }

    put_down_item_new_chest(sCaller, frame, q) {
        switch (frame) {
            case 7: //dřevo
                q = sCaller.subtract_all() + q;
                return [frame, q];
            case 21: //kámen
                q = sCaller.subtract_all() + q;
                return [frame, q];
            case 30: //kmen
                q = sCaller.subtract_all() + q;
                return [frame, q];
            case 41: //batoh
                sCaller.chest.stats.items = Mst.player.stats.bag;
                Mst.hud.chestitems.show_initial_stats();
                Mst.player.stats.bag = "";
                Mst.mPlayer.save.properties.bag = "";
                return [frame, 0];
            case 69: //dzban s vodou
                return [81, 1]; //cista voda
            case 71: //zel. kotlik s vodou
                return [81, 1]; //cista voda
            case 104: //kam. nadoba s tav.
                return [105, 1]; //zhav. zelezo
            default: //3: věci - obecně
                return [frame, q];
        }
    }

    put_down_item(sCaller, cframe, frame, q) {
        const cPlayer = Mst.cPlayer;
        const pSkills = Mst.mPlayer.stats.skills;
        switch (cframe) {
            case 7: //Drevo
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 53: //Zel. kotlik
                        if (q > 1) {
                            q -= 1;
                            sCaller.add(q);
                        }
                        sCaller.chest.change_frame(77); //na drevu
                        return [32, 1]; //prkno
                    case 71: //Zel. kotlik s vodou
                        if (q > 1) {
                            q -= 1;
                            sCaller.add(q);
                        }
                        sCaller.chest.cChest.loop.frame = 79;
                        sCaller.chest.change_frame(79); //na drevu

                        sCaller.chest.cChest.items.add(32, 1); //prkno
                        return [81, 1]; //cista voda
                    default:
                        return [frame, q];
                }
            break;
            case 41: //batoh
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 112: { //kopřiva
                        console.log(cPlayer.ren.opened);
                        const item = cPlayer.items.test(192,1); //dóza
                        if (cPlayer.ren.opened === 'cmelotrysk_ren' && item) {
                            item.sub();
                            cPlayer.items.add(197, 1); // Med čmelotryska l.
                            pSkills.standard.add(50);
                            pSkills.magcrecare.add(45);
                            console.log("Med");
                            Mst.hud.alerts.show("Dar: med!");
                            return [0, 0];
                        }
                        return [frame, q];
                    }
                    case 195: //Trnkový kompot l.
                        console.log(cPlayer.ren.opened);
                        if (cPlayer.ren.opened === 'kerik_ren') {
                            cPlayer.items.add(200, 1); // svetlokvet
                            cPlayer.items.add(192, 1); //dóza
                            pSkills.standard.add(50);
                            pSkills.magcrecare.add(45);
                            console.log("světlokvět");
                            Mst.hud.alerts.show("Dar: světlokvět!");
                            return [0, 0];
                        }
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 60: //kam. nadoba
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 105: //zhav. zelezo
                        if (q > 1) {
                            q -= 1;
                            sCaller.add(q);
                        }
                        sCaller.chest.cChest.loop.frame = 104;
                        sCaller.chest.change_frame(104); //s tav.
                        return [frame, 1];
                    default:
                        return [frame, q];
                }
            break;
            case 83: //Ohen
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 53: //Zel. kotlik
                        if (q > 1) {
                            q -= 1;
                            sCaller.add(q);
                        }
                        sCaller.chest.cChest.loop.frame = 56;
                        sCaller.chest.change_frame(56); //hori
                        return [0, 0];
                    case 71: //Zel. kotlik s vodou
                        if (q > 1) {
                            q -= 1;
                            sCaller.add(q);
                        }
                        sCaller.chest.cChest.loop.frame = 74;
                        sCaller.chest.change_frame(74); //hori

                        return [81, 1]; //cista voda
                    default:
                        return [frame, q];
                }
            break;
            case 138: //kvetinac prazd.
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 137: //zemina
                        sCaller.chest.change_frame(139); //kvetinac zem.
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 139: //kvetinac zem.
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 143: //safran cibulka
                        sCaller.chest.change_frame(140); //kvetinac saz.
                        return [frame, q];
                    case 163: //medunka saz.
                        sCaller.chest.change_frame(140); //kvetinac saz.
                        return [frame, q];
                    case 178: //kotvičník saz.
                        sCaller.chest.change_frame(140); //kvetinac saz.
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 158: //kvetinac zem. zal
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 143: //safran cibulka
                        sCaller.chest.change_frame(159); //kvetinac saz. zal.
                        return [frame, q];
                    case 163: //medunka saz.
                        sCaller.chest.change_frame(159); //kvetinac saz. zal.
                        return [frame, q];
                    case 178: //kotvičník saz.
                        sCaller.chest.change_frame(159); //kvetinac saz.zal.
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 213: //bariera II
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 43: //vetev
                        sCaller.chest.change_frame(214); //hranice
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 227: //pole zem.
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 235: //salat sem.
                        sCaller.chest.change_frame(228); //pole sem.
                        return [frame, q];
                    case 236: //salat saz.
                        sCaller.chest.change_frame(231); //pole saz.
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            case 229: //pole zem. zal.
                switch (frame) {
                    case 41: //batoh
                        sCaller.add(q);

                        console.log("Sem to nejde polozit");
                        Mst.hud.alerts.show("Sem to nejde položit");
                        return [0, 0];
                    case 235: //salat sem.
                        sCaller.chest.change_frame(230); //pole sem. zal.
                        return [frame, q];
                    case 236: //salat saz.
                        sCaller.chest.change_frame(233); //pole saz. zal.
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
            default:
                console.log(frame);
                switch (frame) {
                    case 41: //batoh
                        if (cPlayer.player.stats.bag !== "") {
                            sCaller.add(q);
                            console.log("Batoh není prázdný");
                            Mst.hud.alerts.show("Batoh není prázdný");
                            return [0, 0];
                        }
                        return [frame, q];
                    case 112: //kopřiva
                        console.log(cPlayer.ren.opened);
                        const item = cPlayer.items.test(192,1); //dóza
                        if (cPlayer.ren.opened === 'cmelotrysk_ren' && item) {
                            item.sub();
                            cPlayer.items.add(197, 1); // Med čmelotryska l.
                            pSkills.standard.add(50);
                            pSkills.magcrecare.add(45);
                            console.log("Med");
                            Mst.hud.alerts.show("Dar: med!");
                            return [0, 0];
                        }
                        return [frame, q];
                    case 135: //stinka
                        console.log(cPlayer.ren.opened);
                        if (cPlayer.ren.opened === 'kurolez_ren') {
                            cPlayer.items.add(136, 1);
                            pSkills.standard.add(50);
                            pSkills.magcrecare.add(45);
                            console.log("Dubenka");
                            Mst.hud.alerts.show("Dar: duběnky!");
                            return [0, 0];
                        }
                        return [frame, q];
                    default:
                        return [frame, q];
                }
            break;
        }
    }

    put_down_chestitem(sCaller, cframe, frame, q) {
        const cPlayer = Mst.cPlayer;
        const is_fluid = (Mst.items[frame].properties.fluid === 'true');
        let takeit = true;
        let tquant = 1;
        const sub_water = Mst.items[cframe].properties.sub_water;
        const citems = sCaller.chest.cChest.items;

        if (is_fluid) {
            switch (frame) {
                case 81: { //voda
                    const item = cPlayer.items.test(6, 1); //Dzban
                    if (item) {
                        item.sub();
                        frame = 69; //Dzban s vodou

                        sCaller.chest.change_frame(sub_water);
                        if (cframe == 56) sCaller.chest.animations.play("ficauldron");
                    } else {
                        const item = cPlayer.items.test(53, 1); //Zel. kotlik
                        if (item) {
                            item.sub();
                            frame = 71; //Zel. kotlik s vodou

                            sCaller.chest.change_frame(sub_water);
                            if (cframe == 56) sCaller.chest.animations.play("ficauldron");
                        } else {
                            takeit = false;
                        }
                    }
                break;
                }
                case 93: { //Hrib. polevka
                    const item = cPlayer.items.test(94, 1); //Miska
                    if (item) {
                        item.sub();
                        frame = 95; //Miska s polevkou

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        const item = cPlayer.items.test(220, 1); //drev. miska
                        if (item) {
                            item.sub();
                            frame = 221; //drev. miska s polevkou

                            sCaller.chest.change_frame(sub_water);
                        } else {
                            takeit = false;
                        }
                        }
                break;
                }
                case 103: { //tav. zelezo
                    const item = cPlayer.items.test(60, 1); //kam. nadoba
                    console.log(index + " " + q);
                    if (item && q > 3) {
                        item.sub();
                        frame = 104; //kam. nadoba s tav
                        tquant = 4;
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 105: { //zhav. zelezo
                    const equip = parseInt(Msr.player.stats.equip);
                    if (equip === 106) { //kleste
                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 109: { //zhav.zel.tyc
                    const equip = parseInt(Mst.player.stats.equip);
                    if (equip === 106) { //kleste
                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 147: { //Destil. voda
                    const item = cPlayer.items.test(154, 1); //Lahvicka
                    if (item && citems.length == 1) {
                        item.sub();
                        frame = 146; //Destil. voda l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 149: { //Tinktura
                    const item = cPlayer.items.test(154, 1); //Lahvicka
                    if (item && citems.length == 1) {
                        item.sub();
                        frame = 148; //Tinktura l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 152: { //Inkoust
                    const item = cPlayer.items.test(154, 1); //Lahvicka
                    if (item && citems.length == 1) {
                        item.sub();
                        frame = 151; //Inkoust l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 173: { //Cistici lek.
                    const item = cPlayer.items.test(154, 1); //Lahvicka
                    if (item && citems.length == 1) {
                        item.sub();
                        frame = 174; //Cistici lek. l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 183: //zhav. med
                    const equip = parseInt(Mst.player.stats.equip);
                    if (equip === 106) { //kleste
                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                case 188: { //Antilevitacni lek.
                    const item = cPlayer.items.test(154, 1); //Lahvicka
                    if (item && citems.length == 1) {
                        cPlayer.items.subtract(index, 1);
                        frame = 189; //Antilevitacni lek. l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 194: { //Trnkový kompot
                    const item = cPlayer.items.test(192, 1); //Doza
                    if (item && citems.length == 1) {
                        cPlayer.items.subtract(index, 1);
                        frame = 195; //Trnkový kompot l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                case 196: { //Med čmelotryska
                    const item = cPlayer.items.test(192, 1); //Doza
                    if (item && citems.length == 1) {
                        item.sub();
                        frame = 197; //Med čmelotryska l.

                        sCaller.chest.change_frame(sub_water);
                    } else {
                        takeit = false;
                    }
                break;
                }
                default:
                    takeit = false;
                break;
            }
        }

        switch (cframe) {
            case 77: // zel. kotlik na drevu
                switch (frame) {
                    case 32: // prkno
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(53); //zel. kotlik
                        }
                    break;
                }
            break;
            case 79: // zel. kotlik na drevu s vodou
                switch (frame) {
                    case 32: // prkno
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(71); //zel. kotlik v vodou
                        }
                    break;
                }
            break;
            case 139: // kvetinac zem.
                switch (frame) {
                    case 137: // zemina
                        if (sCaller.chest.s1type === '') {
                            if (q < 2) { // kdyz seberu vsechny
                                sCaller.chest.change_frame(138); //kvetinac prazd.
                            }
                        } else {
                            takeit = false;
                        }
                    break;
                    case 142: // safran
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                    case 164: // medunka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                    case 179: // kotvičník
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                }
            break;
            case 140: // kvetinac saz.
                switch (frame) {
                    case 137: // zemina
                        takeit = false;
                    break;
                    case 143: // safran cibulka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(139); //kvetinac zem.
                            console.log(takeit);
                        }
                    break;
                    case 163: // medunka saz.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(139); //kvetinac zem.
                            console.log(takeit);
                        }
                    break;
                    case 178: // kotvičník saz.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(139); //kvetinac zem.
                            console.log(takeit);
                        }
                    break;
                }
            break;
            case 141: // kvetinac rost.
                switch (frame) {
                    case 137: // zemina
                        takeit = false;
                    break;
                    case 143: // safran cibulka
                        takeit = false;
                    break;
                    case 163: // meduňka cibulka
                        takeit = false;
                    break;
                    case 178: // kotvičník cibulka
                        takeit = false;
                    break;
                }
            break;
            case 158: // kvetinac zem. zal.
                switch (frame) {
                    case 137: // zemina
                        if (sCaller.chest.s1type === '') {
                            if (q < 2) { // kdyz seberu vsechny
                                sCaller.chest.change_frame(138); //kvetinac prazd.
                            }
                        } else {
                            takeit = false;
                        }
                    break;
                    case 142: // safran
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                    case 164: // meduňka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                    case 179: // kotvičník
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) sCaller.chest.plant.kill();
                        }
                    break;
                }
            break;
            case 159: // kvetinac saz. zal.
                switch (frame) {
                    case 137: // zemina
                        takeit = false;
                    break;
                    case 143: // safran cibulka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(158); //kvetinac zem. zal.
                        }
                    break;
                    case 163: // meduňka cibulka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(158); //kvetinac zem. zal.
                        }
                    break;
                    case 178: // kotvičník cibulka
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(158); //kvetinac zem. zal.
                        }
                    break;
                }
            break;
            case 160: // kvetinac rost. zal.
                switch (frame) {
                    case 137: // zemina
                        takeit = false;
                    break;
                    case 143: // safran cibulka
                        takeit = false;
                    break;
                    case 163: // meduňka cibulka
                        takeit = false;
                    break;
                    case 178: // kotvičník cibulka
                        takeit = false;
                    break;
                }
            break;
            case 214: // hranice
                switch (frame) {
                    case 43: // vetev
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(213); //bariera II
                        }
                    break;
                }
            break;
            case 227: // pole zem.
                switch (frame) {
                    case 237: // salat
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (typeof(sCaller.chest.plant) !== 'undefined')  {
                                sCaller.chest.plant.kill();
                                const rnd_test = Math.ceil(Math.random() * 3);
                                cPlayer.items.add(235, rnd_test); //sem. salat
                            }
                        }
                    break;
                }
            break;
            case 228: // pole sem.
                switch (frame) {
                    case 235: // salat sem.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(227); //pole zem.
                            console.log(takeit);
                        }
                    break;
                }
            break;
            case 229: // pole zem. zal.
                switch (frame) {
                    case 237: // salat
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.s1type = "";
                            sCaller.chest.s2type = "";
                            sCaller.chest.save.properties.s1type = "";
                            sCaller.chest.save.properties.s2type = "";
                            if (sCaller.chest.plant) {
                                sCaller.chest.plant.kill();
                                const rnd_test = Math.ceil(Math.random() * 3);
                                cPlayer.items.add(235, rnd_test); //sem. salat
                            }
                        }
                    break;
                }
            break;
            case 230: // pole sem. zal.
                switch (frame) {
                    case 235: // salat sem.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(229); //pole zem. zal.
                            console.log(takeit);
                        }
                    break;
                }
            break;
            case 231: // pole saz.
                switch (frame) {
                    case 236: // salat saz.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(227); //pole zem.
                            console.log(takeit);
                        }
                    break;
                }
            break;
            case 232: // pole rost.
                switch (frame) {
                    case 236: // salat saz.
                        takeit = false;
                    break;
                }
            break;
            case 233: // pole saz. zal.
                switch (frame) {
                    case 236: // salat saz.
                        if (q < 2) { // kdyz seberu vsechny
                            sCaller.chest.change_frame(229); //pole zem. zal.
                            console.log(takeit);
                        }
                    break;
                }
            break;
            case 234: // pole rost. zal.
                switch (frame) {
                    case 236: // salat saz.
                        takeit = false;
                    break;
                }
            break;
            }

        if (takeit) return [frame, tquant];
        return [0, 0];
    }

    use(item_frame) {
        const use_sub = (Mst.items[item_frame].properties.use_sub === 'true');
        const player = Mst.player;
        const cPlayer = Mst.cPlayer;
        const mPlayer = Mst.mPlayer;
        const pitems = Mst.mPlayer.items;
        const opened_chest = Mst.cPlayer.chest.opened;
        const chest_frame = opened_chest ? opened_chest.mChest.closed_frame : null;
        const citems = opened_chest ? opened_chest.mChest.items : null;

        console.log(Mst.items[item_frame]);

        if (opened_chest) {
            const uuse = { t: item_frame, on: opened_chest.mChest.closed_frame };
            player.cPlayer.quests.update("use", uuse);
        }

        switch (item_frame) {
            case 6: //Džbán
                if (opened_chest && chest_frame === 80) {
                    pitems.add(69, 1);
                    if (use_sub) return 1;
                }
                return 0;
            case 21: //Kamen
                if (opened_chest) {
                    const item = citems.get(96); //Pazourek
                    if (item) {
                        const qc = item.sub_all();
                        citems.add(186, qc); //Pazourkove ostri

                        cPlayer.quests.update("make", 186);
                        cPlayer.work_rout("survival", "exploration", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        if (use_sub) return 1;
                    }
                }
                return 0;
            case 33: //Trnka
                mPlayer.add_health(5);
                mPlayer.subtract_stress(8);
                return 1;
            case 36: //Maso
                mPlayer.add_health(10);
                mPlayer.subtract_stress(15);
                return 1;
            case 37: //Pec. maso
                mPlayer.add_health(20);
                mPlayer.subtract_stress(30);
                return 1;
            case 40: //Lišejník
                mPlayer.add_health(3);
                mPlayer.subtract_stress(7);
                return 1;
            case 41: //Batoh
                if (!opened_chest) {
                    var position = { x: player.x, y: player.y };
                    var properties = {
                        group: "shadows",
                        pool: "shadows",
                        stype: "shadow",
                        items: player.stats.bag,
                        closed_frame: 41,
                        opened_frame: 41,
                        texture: "blank_image"
                    };

                    player.shadow = new Mst.Chest("bag", position, properties);
                    cPlayer.chest.open(player.shadow);
                }
                return 0;
            case 45: //Křesadlo
                if (opened_chest) {
                    const chest = opened_chest;
                    switch (chest_frame) {
                        case 7: //Drevo
                            chest.cChest.loop.frame = 83; //Ohen
                            chest.change_frame(83);
                            citems.add(92, 2); //Ohen
                        break;
                        case 64: //Výheň
                            item = citems.get(49); //Uhli
                            if (item) {
                                const qc = item.sub_all();
                                citems.add(92, qc*4); //Ohen

                                chest.cChest.loop.frame = 65; //hori
                                chest.change_frame(65);
                                return 0;
                            } else {
                                Mst.hud.alerts.show("Chce to uhlí!");
                            }
                        break;
                        case 77: //Zel. kotlik na drevu
                            chest.cChest.loop.frame = 56; //hori
                            chest.change_frame(56);
                            item = citems.get(32); //Prkno
                            if (item) {
                                const qc = item.sub_all();
                                citems.add(92, qc*2); //Ohen
                            }
                        break;
                        case 79: //Zel. kotlik s vodou na drevu
                            chest.cChest.loop.frame = 74; //hori
                            chest.change_frame(74);
                            item = citems.get(32); //Prkno
                            if (item) {
                                const qc = item.sub_all();
                                citems.add(92, qc*2); //Ohen
                            }
                        break;
                        case 214: //hranice
                            item = citems.get(43); //vetev
                            if (item) {
                                const qc = item.sub_all();
                                citems.add(92, qc + 1); //Ohen

                                chest.cChest.loop.frame = 83; //hori
                                chest.change_frame(83);
                            }
                        break;
                        default:

                        break;
                    }
                }
                return 0;
            case 46: //Hmoždíř
                if (opened_chest) {
                    const item = citems.get(136); //Dubenky
                    if (item) {
                        const qc = item.sub_all();
                        citems.add(144, qc); //Dubenky drc.
                    }
                }
                return 0;
            case 53: //Žel. kotlík
                if (opened_chest && chest_frame === 80) {
                    pitems.add(71, 1);
                    if (use_sub) return 1;
                }
                return 0;
            case 62: //Konev
                if (opened_chest && chest_frame === 80) {
                    pitems.add(63, 1); //konev pln.
                    if (use_sub) return 1;
                }
                return 0;
            case 95: //Hrib. polevka
                mPlayer.add_health(30);
                mPlayer.subtract_stress(42);
                pitems.add(94, 1); // miska
                return 1;
            case 117: //Nůž
                if (opened_chest) {
                    let recipe = [{f: 39, q: 1}, {f: 185, q: 1}]; //Kůže, reminek
                    let in_chest = citems.in_chest_ord();
                    if (citems.compare(in_chest, recipe)) {
                        citems.take_all();
                        citems.add(201, 1); //Prak
                        cPlayer.quests.update("make", 201);
                    }

                    item = citems.get(39); //Kůže
                    if (item) {
                        item.sub();
                        citems.add(185, 10); //Řemínek

                        cPlayer.quests.update("make", 185);
                        cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(142); //Safran
                    if (item) {
                        item.sub();
                        citems.add(155, 1); //Šafrán. čnělka
                        citems.add(157, 1); //Bioodpad

                        const rnd_test = Math.ceil(Math.random() * 4);

                        citems.add(161, rnd_test); //Šafrán. seminko

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(164); //Medunka
                    if (item) {
                        item.sub();
                        citems.add(165, 1); //Medunka list
                        citems.add(157, 1); //Bioodpad

                        const rnd_test = Math.ceil(Math.random() * 4);

                        citems.add(162, rnd_test); //Medunka seminko

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(179); //Kotvičník
                    if (item) {
                        item.sub();
                        citems.add(157, 1); //Bioodpad

                        let rnd_test = Math.ceil(Math.random() * 5);
                        const test_q = player.cPlayer.quests.quest[36].is_ass();
                        console.log("Test quest 36 knife: " + test_q + "RT " + rnd_test);

                        if (test_q && rnd_test < 2) rnd_test = 2;

                        citems.add(177, rnd_test); //Kotvičník plod

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(169); //Šváb
                    if (item) {
                        item.sub();
                        citems.add(170, 2); //Oko svaba
                        citems.add(172, 1); //Bioodpad 2

                        cPlayer.work_rout("alchemy", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    recipe = [{f: 21, q: 1}, {f: 43, q: 3}, {f: 185, q: 1}]; //kamen, 3 klacky, reminek
                    in_chest = citems.in_chest_ord();
                    if (citems.compare(in_chest, recipe)) {
                        citems.take_all();
                        citems.add(217, 1); //Ohnova souprava
                        cPlayer.quests.update("make", 217);
                    }

                }
                return 0;
            case 146: //Destil. voda l.
                if (opened_chest) {
                    if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                        opened_chest.change_frame(71); //Zel. kotlik s vodou
                        citems.add(147, 1); //Destil. voda
                        this.add_item(154, 1); //Lahvicka
                        return 1;
                    }
                    if (chest_frame == 77 || chest_frame == 79) { //Žel. kotlík na drevu
                        opened_chest.change_frame(79); //Zel. kotlik s vodou na drevu
                        citems.add(147, 1); //Destil. voda
                        this.add_item(154, 1); //Lahvicka
                        return 1;
                    }
                }
                return 0;
            case 148: //Tintura l.
                if (opened_chest) {
                    if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                        opened_chest.change_frame(71); //Zel. kotlik s vodou
                        citems.add(149, 1); //Tinktura
                        this.add_item(154, 1); //Lahvicka
                        return 1;
                    }
                }
                return 0;
            case 154: //Lahvička
                return 0;
            case 174: //Cistici lektvar l.
                if (cPlayer.signpost.opened) {
                    const sign = player.cPlayer.signpost.opened;

                    if (sign.exposed) {
                        sign.loadTexture('blank_image');
                        this.add_item(176, 1); //Serpentin
                        cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
                        Mst.hud.alerts.show("Nález: serpentin!");

                        this.add_item(154, 1); //Lahvicka
                        return 1;
                    }
                } else {
                    if (cPlayer.overlap.opened) {
                        const web = player.cPlayer.overlap.opened;

                        this.add_item(181, 1); //Terra sigillata
                        cPlayer.work_rout("seeker", "exploration", 5, 10, 10, 3); // stress, stand_exp, skill_exp, abil_p
                        Mst.hud.alerts.show("Nález: terra sigillata!");

                        this.add_item(154, 1); //Lahvicka
                        return 1;
                    }
                }
                return 0;
            case 185: //reminek
                if (opened_chest) {
                    let item = citems.get(43); //Vetev
                    if (item) {
                        if (item.quantity > 3) {
                            item.sub(4);
                            citems.add(114, 1); //Ram

                            cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                            return 1;
                        }
                    }

                    item = citems.get(116); //Hrot
                    if (item) {
                        item.sub();
                        citems.add(117, 1); //Nuz

                        cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        return 1;
                    }

                    item = citems.get(186); //Paz. hrot
                    if (item) {
                        item.sub();
                        citems.add(187, 1); //Paz. nuz

                        cPlayer.quests.update("make", 187);
                        cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        return 1;
                    }
                }
                return 0;
            case 186: //Paz. hrot
                if (opened_chest) {
                    item = citems.get(39); //Kůže
                    if (item) {
                        item.sub();
                        citems.add(185, 5); //Řemínek

                        cPlayer.quests.update("make", 185);
                        cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }
                }
                return 0;
            case 187: //Paz. nůž
                if (opened_chest) {
                    const chest = opened_chest;
                    const chest_frame = chest.mChest.closed_frame;

                    let recipe = [{f: 39, q: 1}, {f: 185, q: 1}]; //Kůže, reminek
                    let in_chest = citems.in_chest_ord();
                    if (citems.compare(in_chest, recipe)) {
                        citems.take_all();
                        citems.add(201, 1); //Prak
                        cPlayer.quests.update("make", 201);
                    }

                    let item = citems.get(39); //Kůže
                    if (item) {
                        item.sub();
                        citems.add(185, 10); //Řemínek

                        cPlayer.quests.update("make", 185);
                        cPlayer.work_rout("toolmaker", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(142); //Safran
                    if (item) {
                        item.sub();
                        citems.add(155, 1); //Šafrán. čnělka
                        citems.add(157, 1); //Bioodpad

                        const rnd_test = Math.ceil(Math.random() * 4);

                        citems.add(161, rnd_test); //Šafrán. seminko

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(164); //Medunka
                    if (item) {
                        item.sub();
                        citems.add(165, 1); //Medunka list
                        citems.add(157, 1); //Bioodpad

                        const rnd_test = Math.ceil(Math.random() * 4);

                        citems.add(162, rnd_test); //Medunka seminko

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(179); //Kotvičník
                    if (item) {
                        item.sub();
                        citems.add(157, 1); //Bioodpad

                        let rnd_test = Math.ceil(Math.random() * 5);
                        const test_q = player.cPlayer.quests.quest[36].is_ass();
                        console.log("Test quest 36 knife: " + test_q + "RT " + rnd_test);

                        if (test_q && rnd_test < 2) {
                            rnd_test = 2;
                        }

                        citems.add(177, rnd_test); //Kotvičník plod

                        cPlayer.work_rout("farmer", "dexterity", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                        cPlayer.work_rout("herbology", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    item = citems.get(169); //Šváb
                    if (item) {
                        item.sub();
                        citems.add(170, 2); //Oko svaba
                        citems.add(172, 1); //Bioodpad 2

                        cPlayer.work_rout("alchemy", "intelligence", 1, 20, 45, 3); // stress, stand_exp, skill_exp, abil_p
                    }

                    recipe = [{f: 21, q: 1}, {f: 43, q: 3}, {f: 185, q: 1}]; //kamen, 3 klacky, reminek
                    in_chest = citems.in_chest_ord();
                    if (citems.compare(in_chest, recipe)) {
                        citems.take_all();
                        citems.add(217, 1); //Ohnova souprava
                        cPlayer.quests.update("make", 217);
                    }

                }
                return 0;
            case 189: //Antilevitační lekt. l.
                cPlayer.buffs.add(1, 60); // antilevitace 10 min
                pitems.add(154, 1); //Lahvicka
                break;
            case 192: //Doza
                return 0;
            case 193: //cukr
                mPlayer.add_health(22);
                mPlayer.subtract_stress(32);
                return 1;
            case 195: //Trnkový kompot l.
                mPlayer.add_health(40);
                mPlayer.subtract_stress(58);
                pitems.add(192, 1); //Doza
                return 1;
            case 197: //Med čmelotryska l.
                if (opened_chest) {
                    if (chest_frame == 53 || chest_frame == 71) { //Žel. kotlík
                        opened_chest.change_frame(71); //Zel. kotlik s vodou
                        citems.add(196, 1); //Med čmelotryska
                        pitems.add(192, 1); //Doza
                        return 1;
                    }
                    if (chest_frame == 77 || chest_frame == 79) { //Žel. kotlík na drevu
                        opened_chest.change_frame(79); //Zel. kotlik s vodou na drevu
                        citems.add(196, 1); //Med čmelotryska
                        pitems.add(192, 1); //Doza
                        return 1;
                    }
                    return 0;
                }
                player.mPlayer.add_health(18);
                player.mPlayer.subtract_stress(25);
                return 1;
            case 198: //denik
                Mst.hud.book.show();
                return 0;
            case 217: //Ohn. souprava
                if (opened_chest) {
                    const chest = opened_chest;
                    switch (chest_frame) {
                        case 7: //Drevo
                            chest.cChest.loop.frame = 83; //Ohen
                            chest.change_frame(83);
                            citems.add(92, 2); //Ohen
                        break;
                        case 77: { //Zel. kotlik na drevu
                            chest.cChest.loop.frame = 56; //hori
                            chest.change_frame(56);
                            item = citems.get(32); //Prkno
                            const qc = item.sub_all();
                            citems.add(92, qc*2); //Ohen
                        break;
                        }
                        case 79: { //Zel. kotlik s vodou na drevu
                            chest.cChest.loop.frame = 74; //hori
                            chest.change_frame(74);
                            item = citems.get(32); //Prkno
                            const qc = item.sub_all();
                            citems.add(92, qc*2); //Ohen
                        break;
                        }
                        case 214: //hranice
                            item = citems.get(43); //vetev
                            if (item) {
                                const qc = item.sub_all();
                                citems.add(92, qc + 1); //Ohen

                                chest.cChest.loop.frame = 83; //hori
                                chest.change_frame(83);
                            }
                        break;
                        default:

                        break;
                    }
                }
                return 0;
            case 225: //noviny
                Mst.hud.newsppr.show();
                return 0;
        }
    }

    new_chest_frame(frame, tname) {
        if (tname === "drop" || tname === "item") return {
            closed_frame: frame,
            opened_frame: frame
        };
        let closed_frame = 3;
        let opened_frame = 3;
        switch (frame) {
            case 4:
                closed_frame = 4;
                opened_frame = 5;
                break;
            case 6:
                closed_frame = 6;
                opened_frame = 6;
                break;
            case 7:
                closed_frame = 7;
                opened_frame = 7;
                break;
            case 21:
                closed_frame = 21;
                opened_frame = 21;
                break;
            case 24:
                closed_frame = 19;
                opened_frame = 19;
                break;
            case 29:
                closed_frame = 29;
                opened_frame = 29;
                break;
            case 30:
                closed_frame = 30;
                opened_frame = 30;
                break;
            case 31:
                closed_frame = 31;
                opened_frame = 31;
                break;
            case 32:
                closed_frame = 7;
                opened_frame = 7;
                break;
            case 41:
                closed_frame = 41;
                opened_frame = 41;
                break;
            case 43:
                closed_frame = 213;
                opened_frame = 213;
                break;
            case 52:
                closed_frame = 52;
                opened_frame = 52;
                break;
            case 53:
                closed_frame = 53;
                opened_frame = 53;
                break;
            case 58:
                closed_frame = 58;
                opened_frame = 58;
                break;
            case 59:
                closed_frame = 59;
                opened_frame = 59;
                break;
            case 60:
                closed_frame = 60;
                opened_frame = 60;
                break;
            case 64:
                closed_frame = 64;
                opened_frame = 64;
                break;
            case 71:
                closed_frame = 71;
                opened_frame = 71;
                break;
            case 98:
                closed_frame = 98;
                opened_frame = 98;
                break;
            case 104:
                closed_frame = 104;
                opened_frame = 104;
                break;
            case 108:
                closed_frame = 108;
                opened_frame = 108;
                break;
            case 114:
                closed_frame = 114;
                opened_frame = 114;
                break;
            case 126:
                closed_frame = 126;
                opened_frame = 126;
                break;
            case 138:
                closed_frame = 138;
                opened_frame = 138;
                break;
            case 166:
                closed_frame = 166;
                opened_frame = 166;
                break;
            case 237:
                closed_frame = 237;
                opened_frame = 237;
                break;
            default:
                closed_frame = 3;
                opened_frame = 3;
                break;
        }

        return {
            closed_frame: closed_frame,
            opened_frame: opened_frame
        };
    }
};
