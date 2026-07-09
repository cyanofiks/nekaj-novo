export class Boss {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 82;
    this.maxHealth = 60;
    this.health = 60;
    this.phase = 0;
    this.attackTimer = 0;
    this.spawnTimer = 0;
    this.flash = 0;
    this.color = '#ff4d6d';
  }

  spawn() {
    this.active = true;
    this.x = this.game.width * 0.5;
    this.y = 120;
    this.vx = 60;
    this.vy = 22;
    this.health = this.maxHealth;
    this.phase = 0;
    this.attackTimer = 0;
    this.spawnTimer = 0;
    this.flash = 0;
    this.color = '#ff4d6d';
    this.game.audio.boss();
    this.game.particles.addText('BOSS!', this.game.width * 0.5, 60, '#ff5f7e');
  }

  update(dt) {
    if (!this.active) return;
    this.flash = Math.max(0, this.flash - dt * 3);
    this.attackTimer += dt;
    this.spawnTimer += dt;
    this.x += this.vx * dt * this.game.timeScale;
    this.y += this.vy * dt * this.game.timeScale;

    if (this.x < this.radius || this.x > this.game.width - this.radius) this.vx *= -1;
    if (this.y < this.radius + 40 || this.y > this.game.height * 0.4) this.vy *= -1;

    if (this.attackTimer > 1.25) {
      this.attackTimer = 0;
      this.shootProjectiles();
    }

    if (this.spawnTimer > 2.4) {
      this.spawnTimer = 0;
      this.game.viruses.spawn('purple');
      this.game.viruses.spawn('red');
    }

    if (this.health < this.maxHealth * 0.7 && this.phase < 1) {
      this.phase = 1;
      this.color = '#ff8c42';
      this.vx *= 1.2;
      this.vy *= 1.2;
    }
    if (this.health < this.maxHealth * 0.35 && this.phase < 2) {
      this.phase = 2;
      this.color = '#b22cff';
      this.vx *= 1.2;
      this.vy *= 1.2;
    }
  }

  shootProjectiles() {
    for (let i = 0; i < 3; i += 1) {
      this.game.projectiles.push({
        x: this.x,
        y: this.y,
        vx: (Math.random() - 0.5) * 130,
        vy: 120 + Math.random() * 80,
        life: 2.2,
        radius: 8
      });
    }
  }

  damage(amount) {
    this.health -= amount;
    this.flash = 1;
    if (this.health <= 0) {
      this.active = false;
      this.game.particles.burst(this.x, this.y, '#fff', 60);
      this.game.score += 600;
      this.game.coins += 20;
      this.game.addMissionProgress('boss', 1);
      this.game.achievements.bossKiller = true;
      this.game.ui.showToast('Boss Defeated');
      this.game.audio.boss();
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.flash > 0) {
      ctx.shadowBlur = 28;
      ctx.shadowColor = '#fff';
    }
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(-18, -12, 10, 0, Math.PI * 2);
    ctx.arc(18, -12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-18, 10, 36, 8);
    ctx.restore();
  }
}
