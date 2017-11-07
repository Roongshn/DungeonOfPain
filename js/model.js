class Map {
    constructor(data) {
        this.data = data;
        this.isVisible = this.isVisible.bind(this);
    }
    isTransparent(point) {
        const pointType = this.data[point.x][point.y].type;
        if (pointType === 'WL' || pointType === 'D') {
            return false;
        }
        return true;
    }
    isVisible(viever, point) { // существует ли между точками прямая видимость
        const line = getLine(point, viever);
        for (let i = line.length - 1; i > 1; i--) {
            if (!this.isTransparent({ x: line[i].x, y: line[i].y })) {
                return false;
            }
        }
        return true;
    }
    isMovable(point) {
        const cell = this.data[point.x][point.y];
        if (cell.type === 'WL' || cell.type === '' || typeof cell.charaster === 'number') {
            return false;
        }
        return true;
    }
    getNearest(point1, point2) { // наблюдатель, объект
        // возвращает ближайшую к второй точке точку из окрестности первой
        // TODO: Проверять, не является ли текущая уже ближайшей, а то мобы скачут немного
        let result = [];
        const minDist = getDist(point1, point2);
        result = point1;

        const pointShihts = [
            {
                x: 0,
                y: -1,
            },
            {
                x: 0,
                y: 1,
            },
            {
                x: -1,
                y: 0,
            },
            {
                x: 1,
                y: 0,
            },
        ];
        for (const shift of pointShihts) {
            const newPoint = {
                x: shift.x + point1.x,
                y: shift.y + point1.y,
            };
            const dist = getDist(newPoint, point2);
            if (
                dist <= minDist
                && this.isMovable(newPoint)
            ) {
                minDist = dist;
                result = newPoint;
            }
        }

        return result;
    }
    moveCharaster(oldPosition, newPosition, id) {
        this.data[oldPosition.x][oldPosition.y].charaster = undefined;
        this.data[newPosition.x][newPosition.y].charaster = id;
    }
}

class Charaster {
    // TODO: сделать получение статов методами, а не из data
    constructor(id, data, map) {
        this.id = id;
        this.map = map;
        this.stats = {
            speed: data.speed,
            visionRange: data.vision_range,
        };
        this.position = data.position;
        this.prevPosition = Object.assign({}, data.position); // предыдущее положение. Для рендера. // наверное уже не актуально
        this.duration = 0;
    }
    move(point) {
        this.duration += getActionDuration('move', this.stats.speed);
        if (this.map.isMovable(point)) {
            const xDirection = point.x - this.position.x;
            const yDirection = point.y - this.position.y;

            this.map.moveCharaster(this.position, point, this.id);
            this.position.x = Number((this.position.x + (xDirection)).toFixed(1));
            this.position.y = Number((this.position.y + (yDirection)).toFixed(1));
            return point;
        }
        return false;
    }
}

class Player extends Charaster {
    constructor(id, data, map) {
        super(id, data, map);
    }
}

class Monster extends Charaster {
    constructor(id, data, map) {
        super(id, data, map);
        /*
            sleep ->
                если видит игрока awaken, запоминает где видел
            awaken ->
                если видит игрока - идёт к нему
                если не видит - идёт туда, где видел последний раз
                если он уже там, где видел - sleep
        */

        // богатый внутренний мир
        // Уже не такой богатый, всё переехало в конструктор родителя
        this.state = 'sleep';
        this.memory = {};
    }
    remember(key, data) {
        this.memory[key] = Object.assign({}, data);
    }
    forget(key) {
        this.memory[key] = undefined;
    }
    decide(player) { // принимает персонажа таким, какой он есть. со всеми достоинствами и недостатками.
        while (this.duration < player.duration) {
            const canSeePlayer = this.map.isVisible(player.position, this.position);
            // каждый раз, когда моб видит игрока - он запечатляется в его памяти
            if (canSeePlayer) {
                this.remember('player', player.position);
            }
            if (this.state === 'sleep') {
                if (canSeePlayer) {
                    this.state = 'awaken';
                }
                else {
                    this.duration = player.duration;
                }
            }
            if (this.state === 'awaken') {
                if (canSeePlayer) { // если видит игрока - идёт к нему
                    this.move(this.map.getNearest(this.position, player.position));
                }
                else if (this.position.x !== this.memory.player.x || this.position.y !== this.memory.player.y) { // если не видит, но ещё не пришёл туда, где видел последний раз - идёт туда
                    this.move(this.map.getNearest(this.position, this.memory.player));
                }
                else { // если пришел, но всё ещё не видит - засыпает
                    this.state = 'sleep';
                }
            }
        }
    }
}

class Monsters {
    constructor(data, map) {
        this.data = [];
        data.forEach((monster, i) => {
            this.data[i] = new Monster(i, monster, map);
        });
    }
}

class Level {
    constructor(data) {
        this.map = new Map(data.map);
        this.player = new Player(999, data.player, this.map);
        this.monsters = new Monsters(data.monsters, this.map);
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
                data: {
                    position: this.player.position,
                    prevPosition: this.player.prevPosition,
                    stats: this.player.stats,
                },
            },
            monsters: {
                data: this.monsters.data,
            },
        };
    }
}
