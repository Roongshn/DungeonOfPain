class Item {
    // фабрика, которая порождает объекты
    constructor(type /* , { params }*/) {
        switch (type) {
        case 'weapon':
            this.data = {
                name: 'Short sword',
                type: 'weapon',
                sprite: 'short-sword',
                minDamage: 1,
                maxDamage: 3,
                equipable: true,
                equipSlot: 'rhand', // херня, сделать систему слотов
                durable: 100,
                equipped: false,
            };
            break;
        case 'potion':
            this.data = {
                name: 'Health potion',
                value: 10,
                sprite: 'red-potion',
                equipable: false,
            };
            break;

        }
    }
}

class Inventory {
    // нужна библиотека предметов
    constructor(size) {
        this.backpack = [];

        this.backpack.push(new Item('weapon'));
        this.backpack.push(new Item('potion'));
        this.backpack.push(new Item('potion'));

        this.backpack[0].data.equipped = true; // сделать методом
    }
    getWeapon() {
        const weapon = this.backpack.find((item)=>{
            return item.data.equipped && item.data.type === 'weapon';
        });
        return weapon;
    }
}

export default Inventory;
