import Map from './map.js';
import Player from '../charasters/player.js';
import Monsters from '../charasters/monsters/monsters.js';

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
                data: this.player,
            },
            monsters: {
                data: this.monsters.data,
            },
        };
    }
}
export default Level;
