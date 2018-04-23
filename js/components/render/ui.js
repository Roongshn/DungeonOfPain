import { getValueInPercents } from '../../helpers/helpers.js';

class UI {
    constructor(player) {
        this.player = player.data;

        console.log(player);

        this.healthBar = document.getElementById('health-bar');
        this.modalWrapper = document.getElementById('modal-wrapper');
    }

    openModal(modalId) {
        this.modalWrapper.classList.remove('b-modal-wrapper--hidden');
        document.getElementById(modalId).classList.add('b-modal--opened');
    }

    update() {
        const health = getValueInPercents(this.player.health, this.player.stats.health);

        this.healthBar.style.width = `${health}%`;
        if (health === 0) {
            this.openModal('modal-gameover');
        }
    }
}

export default UI;
