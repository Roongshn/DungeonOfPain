class Level {
    constructor(data) {
            this.data = data;
    }

    getLayer(layer) {
        return this.data[layer];
    }
    getData() {
        return {
            map: this.getLayer('map'),
            player: this.getLayer('player'),
        }
    }
}
