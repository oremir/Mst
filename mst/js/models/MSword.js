class MSword {
    constructor(cSword) {
        this.cSword = cSword;
        this.cGame = cSword.cGame;
        this.mGame = cSword.mGame;
        this.vGame = cSword.vGame;

        this.equip_frame = -1;
        this.fr_left = 0;
        this.fr_right = 0;
        this.cut_type = "";
        this.bullet_frame = 0;
    }

    set_equip_frame(ef) {
        this.equip_frame = parseInt(ef);
        return this.equip_frame;
    }

    reequip(ef) {
        const efi = this.set_equip_frame(ef);
        if (efi !== -1) {
            this.fr_left = parseInt(this.mGame.gdata.core.items[efi].properties.tool_fr_left);
            this.fr_right = parseInt(this.mGame.gdata.core.items[efi].properties.tool_fr_right);
            this.cut_type = this.mGame.gdata.core.items[efi].properties.cut_type;
            if (this.cut_type === "throw") {
                this.bullet_frame = this.mGame.gdata.core.items[efi].properties.tfr;
            }       
        } else {
            this.fr_left = 0;
            this.fr_right = 0;
            this.cut_type = "";
        }
        
        this.cSword.set_cut_type(this.cut_type, this.fr_left, this.fr_left);
        
        console.log("Frames sword: " + this.fr_left + " " + this.fr_right + " Cut type: " + this.cut_type);
    }
}