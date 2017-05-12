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
        const line = getLine(point, viever);
        let isVisible = true;
        for (let i = line.length-1; i>0;  i--) {
            if (!this.isTransparent({x: line[i].x, y: line[i].y})) {
                return false;
            }
        }
        return true;
    }
    isMovable(point) {
        const cell = this.data[point.x][point.y];
        if(cell.type === 'WL' || cell.type === '' || cell.charaster) {
            return false;
        }
        return true;
    }
    getNearest(point1, point2) { //наблюдатель, объект
        //возвращает ближайшую к второй точке точку из окрестности первой
        let result = new Array();
        let min_dist = getDist(point1, point2);
        result = point1;

        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++){
                const newPoint = {
                    x: i+point1.x,
                    y: j+point1.y,
                }
                let dist = getDist(newPoint, point2);
                if (
                    dist<=min_dist &&
                    this.isMovable(newPoint) &&
                    !(newPoint.x === point2.x && newPoint.y === point2.y) //это не конечная точка
                ) {
                    min_dist = dist;
                    result = newPoint;
                }
            }
        }
        return result;
    }
}

class Player {
    // TODO: сделать получение статов методами, а не из data
    constructor(data) {
        this.data = data;
    }
    move(x, y) {
        this.data.position.x += x;
        this.data.position.y += y;
    }
}

class Monsters {
    constructor(data) {
        this.data = data;
    }
    moveMonster(id, point) {
        this.data[id].position.x = point.x;
        this.data[id].position.y = point.y;
    }
}

class Level {
    constructor(data) {
        this.map = new Map(data.map);
        this.player = new Player(data.player);
        this.monsters = new Monsters(data.monsters);
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
            },
            monsters: {
                data: this.monsters.data,
            }
        }
    }
}
