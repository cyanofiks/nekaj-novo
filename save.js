export class SaveSystem {
  constructor() {
    this.key = 'bubble-healer-2-save';
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : this.defaults();
    } catch {
      return this.defaults();
    }
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  defaults() {
    return {
      bestScore: 0,
      coins: 0,
      upgrades: {
        tapDamage: 1,
        criticalChance: 0,
        bombRadius: 1,
        laserPower: 1,
        spawnReduction: 0,
        comboDuration: 1,
        maxHealth: 1
      },
      achievements: {
        virusHunter: false,
        doctor: false,
        immuneSystem: false,
        comboMaster: false,
        bossKiller: false
      },
      missions: {
        viruses: 0,
        combo: 0,
        boss: 0,
        coins: 0,
        daily: 0
      }
    };
  }

  getUpgrade(name) { return this.data.upgrades[name] || 1; }

  setUpgrade(name, value) { this.data.upgrades[name] = value; this.save(); }

  addCoins(amount) { this.data.coins += amount; this.save(); }

  setBestScore(value) { this.data.bestScore = value; this.save(); }

  setMissionProgress(key, value) { this.data.missions[key] = value; this.save(); }

  unlockAchievement(name) {
    if (!this.data.achievements[name]) {
      this.data.achievements[name] = true;
      this.save();
    }
  }
}
