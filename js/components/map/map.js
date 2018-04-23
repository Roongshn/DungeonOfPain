import { getDist, getLine } from '../../helpers/helpers.js';

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

export default Map;
