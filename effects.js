export class EffectSystem {
  constructor(game) {
    this.game = game;
    this.particles = [];
    this.texts = [];
    this.shake = 0;
  }

  spawnExplosion(x, y) {
    for (let i = 0; i < 18; i += 1) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 180, vy: (Math.random() - 0.5) * 220, life: 0.7 + Math.random() * 0.4, color: ['#ffb347', '#ff4d4d', '#7a7a7a'][Math.floor(Math.random() * 3)]
      });
    }
    this.shake = 0.18;
  }

  spawnSparkle(x, y) {
    for (let i = 0; i < 10; i += 1) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 140, vy: (Math.random() - 0.5) * 170, life: 0.45 + Math.random() * 0.25, color: '#ffe27a'
      });
    }
  }

  spawnDust(x, y) {
    for (let i = 0; i < 8; i += 1) {
      this.particles.push({
        x, y, vx: (Math.random() - 0.5) * 70, vy: Math.random() * 70, life: 0.45 + Math.random() * 0.2, color: '#9a7b52' 
      });
    }
  }

  addText(text, x, y, color = '#fff') {
    this.texts.push({ text, x, y, color, life: 1.2, velY: -40 });
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 1.2);
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.texts.length - 1; i >= 0; i -= 1) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.velY * dt;
      t.velY *= 0.94;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  draw(ctx) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 0.8);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.restore();
    });

    this.texts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / 1.2);
      ctx.font = 'bold 18px Segoe UI';
      ctx.fillStyle = t.color;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
  }
}
