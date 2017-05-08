class Map {
    constructor(data) {
        this.data = data;
        this.isVisible = this.isVisible.bind(this);
    }
    isTransparent(point) {
        const pointType = this.data[point.x][point.y].type;
        if(pointType === 'WL' || pointType === 'D') {
            return false;
        }
        return true;
    }
    isVisible(viever, point) { //существует ли между точками прямая видимость
        let line = getLine(point, viever);
        let isVisible = true;
        for (let i = line.length-1; i>0;  i--) {
            if (!this.isTransparent({x: line[i].x, y: line[i].y})) {
                return false;
            }
        }
        return true;
    }
    isMovable(point) {
        const pointType = this.data[point.x][point.y].type;
        if(pointType === 'WL' || pointType === '') {
            return false;
        }
        return true;
    }

}

class Player {
    constructor(data) {
        this.data = data;
    }
    move(x, y) {
        this.data.position.x += x;
        this.data.position.y += y;
    }
}

class Level {
    constructor(data) {
        this.map = new Map(data.map);
        this.player = new Player(data.player);
    }
    getLayer(layer) {
        return this.data[layer];
    }
    getData() {
        return {
            map: {
                data: this.map.data,
                isVisible: this.map.isVisible,
            },
            player: {
                data: this.player.data,
            }
        }
    }
}
