export class Powerup {
  constructor() {
    this.active = false;
    this.type = 'freeze';
    this.x = 0;
    this.y = 0;
    this.radius = 16;
    this.vy = 70;
    this.pulse = 0;
  }

  reset() { this.active = false; }
}

export class PowerupSystem {
  constructor(game) {
    this.game = game;
    this.pool = [];
    this.active = [];
    this.timer = 0;
  }

  reset() {
    this.active.forEach((item) => item.reset());
    this.active = [];
    this.timer = 0;
  }

  spawn() {
    if (Math.random() > 0.75) {
      const item = this.pool.pop() || new Powerup();
      item.active = true;
      item.type = ['freeze', 'bomb', 'laser', 'slow', 'pulse', 'shield', 'booster'][Math.floor(Math.random() * 7)];
      item.x = Math.random() * this.game.width;
      item.y = -24;
      item.radius = 16;
      item.vy = 70 + Math.random() * 35;
      item.pulse = Math.random() * Math.PI * 2;
      this.active.push(item);
    }
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > 5.5) {
      this.timer = 0;
      this.spawn();
    }

    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      const item = this.active[i];
      item.y += item.vy * dt;
      item.pulse += dt * 6;
      if (item.y > this.game.height + 40) {
        this.active.splice(i, 1);
        item.reset();
        this.pool.push(item);
      }
    }
  }

  apply(item) {
    this.game.audio.upgrade();
    this.game.particles.burst(item.x, item.y, '#ffffff', 18);
    if (item.type === 'freeze') {
      this.game.freezeTimer = 2.8;
      this.game.particles.addText('FREEZE', item.x, item.y - 16, '#84f5ff');
    } else if (item.type === 'bomb') {
      this.game.viruses.active.forEach((virus) => {
        if (Math.hypot(virus.x - item.x, virus.y - item.y) < 140) this.game.viruses.hitVirus(virus, 999);
      });
      this.game.particles.addText('BOMB', item.x, item.y - 16, '#ff8d47');
    } else if (item.type === 'laser') {
      const lineY = item.y;
      this.game.viruses.active.forEach((virus) => {
        if (Math.abs(virus.y - lineY) < 70) this.game.viruses.hitVirus(virus, 999);
      });
      this.game.particles.addText('LASER', item.x, item.y - 16, '#7dffbb');
    } else if (item.type === 'slow') {
      this.game.timeScale = 0.45;
      this.game.slowTimer = 2.5;
      this.game.particles.addText('SLOW', item.x, item.y - 16, '#7b9dff');
    } else if (item.type === 'pulse') {
      this.game.viruses.active.forEach((virus) => this.game.viruses.hitVirus(virus, 2));
      this.game.particles.addText('PULSE', item.x, item.y - 16, '#ff5edb');
    } else if (item.type === 'shield') {
      this.game.shieldTimer = 3.5;
      this.game.particles.addText('SHIELD', item.x, item.y - 16, '#4fe1ff');
    } else if (item.type === 'booster') {
      this.game.coinBoost = 2;
      this.game.coinBoostTimer = 6;
      this.game.particles.addText('BOOST', item.x, item.y - 16, '#ffd45f');
    }
  }

  draw(ctx) {
    this.active.forEach((item) => {
      const scale = 1 + Math.sin(item.pulse) * 0.12;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.scale(scale, scale);
      ctx.fillStyle = this.colorFor(item.type);
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(item.type[0].toUpperCase(), 0, 4);
      ctx.restore();
    });
  }

  colorFor(type) {
    const colors = {
      freeze: '#54d8ff',
      bomb: '#ff8d47',
      laser: '#80ffb3',
      slow: '#6e8cff',
      pulse: '#ff70d8',
      shield: '#4fe1ff',
      booster: '#ffd45f'
    };
    return colors[type] || '#fff';
  }
}
