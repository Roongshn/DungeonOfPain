import Inventory from '../inventory/inventory.js';
import { getActionDuration, getRandomInt } from '../../helpers/helpers.js';

class Charaster {
    // TODO: сделать получение статов методами, а не из data
    constructor(id, data, map) {
        this.id = id;
        this.map = map;

        this.stats = {
            strength: 1,
            agility: 1,
            speed: data.speed,
            health: data.max_hp,

            visionRange: data.vision_range,
        };
        this._health = data.max_hp;
        this.position = data.position;
        this.duration = 0;
        this.status = 'alive';

        this.inventory = new Inventory(10);
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
    attack() {
        this.duration += getActionDuration('attack', this.stats.speed);
        const weapon = this.inventory.getWeapon();
        return getRandomInt(weapon.data.minDamage, weapon.data.maxDamage) * this.stats.strength;
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

export default Charaster;
