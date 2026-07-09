export class Virus {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 18;
    this.maxHp = 1;
    this.hp = 1;
    this.type = 'green';
    this.score = 10;
    this.color = '#2dff8d';
    this.flash = 0;
    this.id = 0;
  }

  reset() {
    this.active = false;
  }
}

export class VirusSystem {
  constructor(game) {
    this.game = game;
    this.pool = [];
    this.active = [];
    this.spawnTimer = 0;
    this.reproduceTimer = 0;
    this.maxViruses = 28;
  }

  reset() {
    this.active.forEach((v) => v.reset());
    this.active = [];
    this.spawnTimer = 0;
    this.reproduceTimer = 0;
  }

  spawn(type = null) {
    if (this.active.length >= this.maxViruses) return null;
    const virus = this.pool.pop() || new Virus();
    virus.active = true;
    virus.type = type || this.pickType();
    virus.color = this.colorForType(virus.type);
    virus.radius = this.radiusForType(virus.type);
    virus.maxHp = this.hpForType(virus.type);
    virus.hp = virus.maxHp;
    virus.score = 10 + virus.maxHp * 14;
    virus.x = Math.random() * this.game.width;
    virus.y = Math.random() * this.game.height;
    virus.vx = (Math.random() - 0.5) * (this.speedForType(virus.type) + 12);
    virus.vy = (Math.random() - 0.5) * (this.speedForType(virus.type) + 12);
    virus.id = Math.random();
    virus.flash = 0;
    this.active.push(virus);
    return virus;
  }

  pickType() {
    const roll = Math.random();
    if (roll < 0.08) return 'black';
    if (roll < 0.2) return 'purple';
    if (roll < 0.35) return 'red';
    if (roll < 0.5) return 'blue';
    if (roll < 0.65) return 'yellow';
    return 'green';
  }

  colorForType(type) {
    const colors = {
      green: '#35ff7d',
      purple: '#ce7cff',
      red: '#ff5c72',
      blue: '#52b2ff',
      yellow: '#ffd84d',
      black: '#1f1f2e'
    };
    return colors[type] || colors.green;
  }

  radiusForType(type) {
    const sizes = { green: 18, purple: 24, red: 22, blue: 20, yellow: 19, black: 28 };
    return sizes[type] || 18;
  }

  hpForType(type) {
    const health = { green: 1, purple: 2, red: 2, blue: 2, yellow: 2, black: 4 };
    return health[type] || 1;
  }

  speedForType(type) {
    const speeds = { green: 38, purple: 28, red: 34, blue: 32, yellow: 36, black: 22 };
    return speeds[type] || 38;
  }

  update(dt) {
    if (this.game.freezeTimer > 0) return;
    this.spawnTimer += dt;
    this.reproduceTimer += dt;
    const spawnInterval = Math.max(0.65, 1.2 - this.game.level * 0.05 - this.game.player.upgrades.spawnReduction * 0.05);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    if (this.reproduceTimer >= 3.2) {
      this.reproduceTimer = 0;
      if (this.active.length > 0 && this.active.length < this.maxViruses) {
        const parent = this.active[Math.floor(Math.random() * this.active.length)];
        this.spawn(parent.type);
      }
    }

    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      const virus = this.active[i];
      virus.x += virus.vx * dt * this.game.timeScale;
      virus.y += virus.vy * dt * this.game.timeScale;
      virus.flash = Math.max(0, virus.flash - dt * 4);

      if (virus.x < virus.radius || virus.x > this.game.width - virus.radius) {
        virus.vx *= -1;
        virus.x = Math.max(virus.radius, Math.min(this.game.width - virus.radius, virus.x));
      }
      if (virus.y < virus.radius || virus.y > this.game.height - virus.radius) {
        virus.vy *= -1;
        virus.y = Math.max(virus.radius, Math.min(this.game.height - virus.radius, virus.y));
      }

      for (let j = i + 1; j < this.active.length; j += 1) {
        const other = this.active[j];
        const dx = other.x - virus.x;
        const dy = other.y - virus.y;
        const dist = Math.hypot(dx, dy);
        const minDist = virus.radius + other.radius;
        if (dist < minDist * 0.9 && dist > 0) {
          this.mergeViruses(virus, other);
          break;
        }
      }
    }
  }

  mergeViruses(a, b) {
    if (!a.active || !b.active) return;
    const mergeTarget = a.radius >= b.radius ? a : b;
    const mergeSource = a.radius >= b.radius ? b : a;
    if (!mergeTarget || !mergeSource) return;
    const newRadius = Math.min(46, mergeTarget.radius + mergeSource.radius * 0.5);
    mergeTarget.radius = newRadius;
    mergeTarget.maxHp = Math.min(8, mergeTarget.maxHp + mergeSource.maxHp);
    mergeTarget.hp = mergeTarget.maxHp;
    mergeTarget.score = 10 + mergeTarget.maxHp * 14;
    mergeTarget.color = this.colorForType(mergeTarget.type);
    mergeTarget.vx = (mergeTarget.vx + mergeSource.vx) * 0.5;
    mergeTarget.vy = (mergeTarget.vy + mergeSource.vy) * 0.5;
    this.removeVirus(mergeSource);
    this.game.particles.burst(mergeTarget.x, mergeTarget.y, mergeTarget.color, 14);
  }

  removeVirus(virus) {
    virus.active = false;
    const index = this.active.indexOf(virus);
    if (index >= 0) this.active.splice(index, 1);
    this.pool.push(virus);
  }

  hitVirus(virus, damage) {
    virus.hp -= damage;
    virus.flash = 1;
    if (virus.hp <= 0) {
      this.removeVirus(virus);
      this.game.particles.burst(virus.x, virus.y, virus.color, 24 + virus.maxHp * 3);
      this.game.score += virus.score;
      this.game.coins += 1 + Math.floor(virus.maxHp / 2);
      this.game.combo = Math.min(20, this.game.combo + 1);
      this.game.comboTimer = Math.max(this.game.comboTimer, 1.2);
      this.game.addMissionProgress('viruses', 1);
      this.game.addMissionProgress('coins', 1 + Math.floor(virus.maxHp / 2));
      this.game.particles.addText(`+${virus.score}`, virus.x, virus.y - 20, '#fff');
      this.game.audio.explode();
      this.game.checkAchievements();
    }
  }

  draw(ctx) {
    this.active.forEach((virus) => {
      ctx.save();
      ctx.translate(virus.x, virus.y);
      if (virus.flash > 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
      }
      ctx.globalAlpha = virus.type === 'black' ? 0.95 : 1;
      ctx.fillStyle = virus.color;
      ctx.beginPath();
      ctx.arc(0, 0, virus.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(-virus.radius * 0.2, -virus.radius * 0.2, virus.radius * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
