import Monster from './monster.js';

class Monsters {
    constructor(data, map) {
        this.data = [];
        data.forEach((monster, i) => {
            this.data[i] = new Monster(i, monster, map);
        });
        map.monsters = this.data; // Я родился!(с) Сева
    }
}

export default Monsters;
