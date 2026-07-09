export class UIManager {
  constructor(game) {
    this.game = game;
    this.overlay = document.getElementById('overlay');
    this.banner = document.getElementById('banner');
    this.toast = document.getElementById('toast');
    this.scoreValue = document.getElementById('scoreValue');
    this.coinValue = document.getElementById('coinValue');
    this.bestValue = document.getElementById('bestValue');
    this.comboValue = document.getElementById('comboValue');
    this.menuBest = document.getElementById('menuBest');
    this.menuCoins = document.getElementById('menuCoins');
    this.finalScore = document.getElementById('finalScore');
    this.finalCoins = document.getElementById('finalCoins');
    this.upgradeList = document.getElementById('upgradeList');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.soundBtn = document.getElementById('soundBtn');
    this.upgradeBtn = document.getElementById('upgradeBtn');
  }

  updateStats() {
    this.scoreValue.textContent = Math.floor(this.game.score).toString();
    this.coinValue.textContent = Math.floor(this.game.coins).toString();
    this.bestValue.textContent = Math.floor(this.game.bestScore).toString();
    this.comboValue.textContent = `x${this.game.combo}`;
    this.menuBest.textContent = Math.floor(this.game.bestScore).toString();
    this.menuCoins.textContent = Math.floor(this.game.coins).toString();
    this.finalScore.textContent = Math.floor(this.game.score).toString();
    this.finalCoins.textContent = Math.floor(this.game.coins).toString();
  }

  showScreen(id) {
    this.overlay.style.display = "flex";

    this.overlay.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('active');
    });

    document.getElementById(id)?.classList.add('active');
  }

  // NOVO
  hideScreen() {
    this.overlay.style.display = "none";

    this.overlay.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('active');
    });
  }

  showBanner(text) {
    this.banner.textContent = text;
    this.banner.classList.add('show');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => this.banner.classList.remove('show'), 900);
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.remove('show'), 900);
  }

  setPaused(paused) {
    this.pauseBtn.textContent = paused ? '▶' : '⏸';
  }

  setMuted(muted) {
    this.soundBtn.textContent = muted ? '🔈' : '🔊';
  }

  renderUpgrades() {
    const upgrades = [
      { key: 'tapDamage', label: 'Tap Damage', cost: 12, desc: '+1 damage' },
      { key: 'criticalChance', label: 'Critical Hit', cost: 20, desc: '+10% crit' },
      { key: 'bombRadius', label: 'Bomb Radius', cost: 18, desc: 'Bigger bombs' },
      { key: 'laserPower', label: 'Laser Power', cost: 22, desc: 'Stronger laser' },
      { key: 'spawnReduction', label: 'Spawn Reduction', cost: 24, desc: 'Fewer viruses' },
      { key: 'comboDuration', label: 'Combo Duration', cost: 16, desc: 'Longer combos' },
      { key: 'maxHealth', label: 'Max Health', cost: 18, desc: '+2 health' }
    ];

    this.upgradeList.innerHTML = '';

    upgrades.forEach((upgrade) => {
      const row = document.createElement('div');
      row.className = 'upgrade-item';

      const current = this.game.save.getUpgrade(upgrade.key);

      row.innerHTML = `
        <div>
          <strong>${upgrade.label}</strong><br>
          <small>${upgrade.desc}</small><br>
          <small>Lv ${current}</small>
        </div>

        <button
          class="upgrade-btn"
          data-key="${upgrade.key}"
          data-cost="${upgrade.cost}">
          Buy ${upgrade.cost}
        </button>
      `;

      this.upgradeList.appendChild(row);
    });
  }
}
