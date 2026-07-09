export class ParticleSystem {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.texts = [];
    this.shake = 0;
  }

  burst(x, y, color, count = 18) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 220,
        vy: (Math.random() - 0.5) * 220,
        life: 0.6 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        color
      });
    }
    this.shake = Math.min(0.24, this.shake + 0.04);
  }

  addText(text, x, y, color = '#fff') {
    this.texts.push({ text, x, y, color, life: 1, vy: -40 });
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 1.1);

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.texts.length - 1; i >= 0; i -= 1) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 0.9;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  draw(ctx) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 1.1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });

    this.texts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / 1);
      ctx.font = 'bold 18px Segoe UI';
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}
