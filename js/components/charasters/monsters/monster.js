import Charaster from '../charaster.js';
import { getDist } from '../../../helpers/helpers.js';

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
    decide(player, actions) { // принимает персонажа таким, какой он есть. со всеми достоинствами и недостатками.
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
                    if (Math.round(getDist(this.position, player.position)) === 1) {
                        actions.melee(this, player);
                    }
                    else {
                        this.move(this.map.getNearest(this.position, player.position));
                    }
                }
                // если не видит, но ещё не пришёл туда, где видел последний раз - идёт туда
                else if (this.position.x !== this.memory.player.x || this.position.y !== this.memory.player.y) {
                    this.move(this.map.getNearest(this.position, this.memory.player));
                }
                else { // если пришел, но всё ещё не видит - засыпает
                    this.status = 'sleep';
                }
            }
        }
    }
}

export default Monster;
