class Map {
    constructor(data) {
        this.data = data;
        this.monsters = null;
        this.isVisible = this.isVisible.bind(this);
    }
    addCharasters(monsters) {
        this.monsters = monsters;
    }
    isTransparent(point) {
        const pointType = this.data[point.x][point.y].type;
        if (pointType !== 'F') {
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

        if (cell.type === 'WL' || cell.type === 'L' || cell.type === '') {
            return false;
        }

        if (typeof cell.charaster === 'number' && cell.charaster === 999) {
            return false;
        }

        if (typeof cell.charaster === 'number' && this.monsters[cell.charaster].status !== 'dead') {
            return false;
        }

        return true;
    }
    getNearest(point1, point2) { // наблюдатель, объект
        // возвращает ближайшую к второй точке точку из окрестности первой
        // TODO: Проверять, не является ли текущая уже ближайшей, а то мобы скачут немного
        let result = [];
        let minDist = getDist(point1, point2);
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
            health: data.max_hp,
        };
        this._health = data.max_hp;
        this.position = data.position;
        this.duration = 0;
        this.status = 'alive';
    }
    get health() {
        return this._health;
    }
    set health(value) {
        this._health = value > 0 ? value : 0;
        if (this._health === 0) {
            this.status = 'dead';
        }
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
        this.status = 'sleep';
        this.memory = {};
    }
    remember(key, data) {
        this.memory[key] = Object.assign({}, data);
    }
    forget(key) {
        this.memory[key] = undefined;
    }
    decide(player) { // принимает персонажа таким, какой он есть. со всеми достоинствами и недостатками.
        if (this.health === 0) {
            return;
        }
        while (this.duration < player.duration) {
            const canSeePlayer = this.map.isVisible(player.position, this.position);
            // каждый раз, когда моб видит игрока - он запечатляется в его памяти
            if (canSeePlayer) {
                this.remember('player', player.position);
            }
            if (this.status === 'sleep') {
                if (canSeePlayer) {
                    this.status = 'awaken';
                }
                else {
                    this.duration = player.duration;
                }
            }
            if (this.status === 'awaken') {
                if (canSeePlayer) { // если видит игрока - идёт к нему
                    this.move(this.map.getNearest(this.position, player.position));
                }
                else if (this.position.x !== this.memory.player.x || this.position.y !== this.memory.player.y) { // если не видит, но ещё не пришёл туда, где видел последний раз - идёт туда
                    this.move(this.map.getNearest(this.position, this.memory.player));
                }
                else { // если пришел, но всё ещё не видит - засыпает
                    this.status = 'sleep';
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
        map.monsters = this.data; // Я родился!(с) Сева
    }
}

class Level {
    constructor(data) {
        this.map = new Map(data.map);
        this.player = new Player(999, data.player, this.map);
        this.monsters = new Monsters(data.monsters, this.map);

        // this.map.addCharasters(this.monsters.data); // стремноватый костыль, но подругому не придумал
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
                    health: this.player.health,
                    position: this.player.position,
                    stats: this.player.stats,
                    // status: this.player.status,
                },
            },
            monsters: {
                data: this.monsters.data,
            },
        };
    }
}

class Inventory {
    // нужна библиотека предметов
    constructor(rows, cols) {

    }
}

class Item {
    // фабрика, которая порождает объекты
    constructor(type, { params }) {
        switch (type) {
        case 'weapon':

            break;
        case 'potion':

            break;

        }
    }
    initItem(data) {
        this.data = data;
    }
}

class Container {
    constructor() {

    }
}
