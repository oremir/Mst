class CPerson extends CPrefab {
    constructor(vPrefab, name, position, properties) {
        super(vPrefab, name, position, properties);

    }

    _model() {
        return new MPerson(this, this.name, this.position, this.properties);
    }
}
