export class Player {
  constructor(game) {
    this.game = game;
    this.x = 0;
    this.y = 0;
    this.radius = 22;
    this.health = 10;
    this.maxHealth = 10;
    this.upgrades = {
      tapDamage: 1,
      criticalChance: 0,
      bombRadius: 1,
      laserPower: 1,
      spawnReduction: 0,
      comboDuration: 1,
      maxHealth: 1
    };
    this.pulse = 0;
  }

  reset() {
    this.x = this.game.width * 0.5;
    this.y = this.game.height * 0.5;
    this.maxHealth = 10 + this.upgrades.maxHealth * 2;
    this.health = this.maxHealth;
    this.radius = 22 + this.upgrades.maxHealth * 1.4;
  }

  applyTap(x, y) {
    const damage = this.upgrades.tapDamage + (Math.random() < this.upgrades.criticalChance ? 2 : 0);
    const hit = this.game.viruses.active.find((v) => Math.hypot(v.x - x, v.y - y) <= v.radius + 6);
    if (hit) {
      this.game.viruses.hitVirus(hit, damage);
      this.game.particles.burst(x, y, '#ffffff', 10);
      this.game.audio.tap();
      return true;
    }
    return false;
  }

  update(dt) {
    this.pulse += dt * 4;
    this.health = Math.min(this.maxHealth, this.health + dt * 0.02);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const glow = 1 + Math.sin(this.pulse) * 0.08;
    ctx.scale(glow, glow);
    const gradient = ctx.createRadialGradient(0, 0, 6, 0, 0, 32);
    gradient.addColorStop(0, '#d8fffb');
    gradient.addColorStop(1, '#1f7dff');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}
