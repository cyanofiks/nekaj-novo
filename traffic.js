export class TrafficObstacle {
  constructor() {
    this.active = false;
    this.type = 'car';
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.speed = 0;
    this.lane = 0;
    this.damage = 1;
    this.rotation = 0;
    this.color = '#ff5d5d';
    this.variant = 0;
  }

  reset() {
    this.active = false;
  }
}

export class TrafficSystem {
  constructor(game) {
    this.game = game;
    this.pool = [];
    this.active = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.8;
  }

  reset() {
    this.active.forEach((obstacle) => obstacle.reset());
    this.active = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.8;
  }

  getFreeObstacle() {
    if (this.pool.length) {
      const obstacle = this.pool.pop();
      obstacle.reset();
      return obstacle;
    }
    return new TrafficObstacle();
  }

  releaseObstacle(obstacle) {
    obstacle.active = false;
    this.pool.push(obstacle);
  }

  spawnObstacle() {
    const lane = Math.floor(Math.random() * Math.max(1, this.game.lanePositions.length));
    const eventBoost = this.game.activeEvent?.name === 'Traffic Jam' ? 1.28 : this.game.activeEvent?.name === 'Police Chase' ? 1.16 : 1;
    const eventType = this.game.activeEvent?.name === 'Road Construction' ? (Math.random() < 0.4 ? 'hole' : Math.random() < 0.6 ? 'cone' : null) : null;

    const obstacle = this.getFreeObstacle();
    obstacle.active = true;
    obstacle.lane = lane;
    obstacle.x = this.game.lanePositions[lane];
    obstacle.y = -140 - Math.random() * 120;
    obstacle.rotation = (Math.random() - 0.5) * 0.03;
    obstacle.variant = Math.floor(Math.random() * 4);
    obstacle.color = this.getColorForType(obstacle.type, obstacle.variant);

    const preset = eventType
      ? this.getPreset(eventType)
      : this.getPreset(this.pickType());

    obstacle.type = preset.type;
    obstacle.width = preset.width;
    obstacle.height = preset.height;
    obstacle.speed = preset.speed * eventBoost + this.game.level * 8 + Math.random() * 18;
    obstacle.damage = preset.damage;

    this.active.push(obstacle);
  }

  pickType() {
    const roll = Math.random();
    if (this.game.level >= 3 && roll < 0.12) return 'truck';
    if (this.game.level >= 2 && roll < 0.24) return 'bus';
    if (this.game.level >= 2 && roll < 0.38) return 'motorcycle';
    if (this.game.level >= 4 && roll < 0.5) return 'cone';
    if (this.game.level >= 5 && roll < 0.6) return 'hole';
    return 'car';
  }

  getColorForType(type, variant) {
    const palettes = {
      car: ['#ff5d5d', '#4cc9f0', '#ffb347', '#7dff6b', '#f72585', '#2ec4b6'],
      truck: ['#2f5cff', '#0f4c81', '#355c7d', '#ff7f50'],
      bus: ['#f5c542', '#ff6b6b', '#34a0a4', '#6c5ce7'],
      motorcycle: ['#7b2cbf', '#ff006e', '#3a86ff', '#06d6a0'],
      cone: ['#ff9f1c', '#ff6b35', '#f7b267'],
      hole: ['#0b0b0b', '#2b2b2b', '#333333']
    };
    const palette = palettes[type] || palettes.car;
    return palette[variant % palette.length];
  }

  getPreset(type) {
    const presets = {
      car: { type: 'car', width: 38, height: 72, speed: 250, damage: 1 },
      truck: { type: 'truck', width: 54, height: 98, speed: 195, damage: 1.35 },
      bus: { type: 'bus', width: 58, height: 112, speed: 180, damage: 1.25 },
      motorcycle: { type: 'motorcycle', width: 30, height: 62, speed: 310, damage: 0.9 },
      cone: { type: 'cone', width: 26, height: 32, speed: 250, damage: 0.7 },
      hole: { type: 'hole', width: 38, height: 38, speed: 258, damage: 1.1 }
    };
    return presets[type] || presets.car;
  }

  update(dt) {
    const baseInterval = Math.max(0.28, 0.84 - (this.game.level - 1) * 0.06 - this.game.difficulty * 0.03);
    this.spawnInterval = baseInterval;
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle();
    }

    for (let i = this.active.length - 1; i >= 0; i -= 1) {
      const obstacle = this.active[i];
      obstacle.y += obstacle.speed * dt * (this.game.activeEvent?.name === 'Heavy Rain' ? 1.14 : 1);
      if (obstacle.y > this.game.height + 150) {
        this.active.splice(i, 1);
        this.releaseObstacle(obstacle);
      }
    }
  }

  draw(ctx) {
    this.active.forEach((obstacle) => {
      ctx.save();
      const x = obstacle.x;
      const y = obstacle.y;
      ctx.translate(x, y);
      ctx.rotate(obstacle.rotation);

      if (obstacle.type === 'car') {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(-obstacle.width * 0.5, -obstacle.height * 0.5, obstacle.width, obstacle.height);
        ctx.fillStyle = obstacle.variant % 2 === 0 ? '#e9f6ff' : '#d8ecff';
        ctx.fillRect(-obstacle.width * 0.28, -obstacle.height * 0.22, obstacle.width * 0.56, obstacle.height * 0.24);
        ctx.fillStyle = '#111';
        ctx.fillRect(-obstacle.width * 0.25, -obstacle.height * 0.4, obstacle.width * 0.18, obstacle.height * 0.12);
        ctx.fillRect(obstacle.width * 0.07, -obstacle.height * 0.4, obstacle.width * 0.18, obstacle.height * 0.12);
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.strokeRect(-obstacle.width * 0.5 + 1, -obstacle.height * 0.5 + 1, obstacle.width - 2, obstacle.height - 2);
      } else if (obstacle.type === 'truck') {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(-obstacle.width * 0.5, -obstacle.height * 0.5, obstacle.width, obstacle.height * 0.76);
        ctx.fillStyle = '#f4f7ff';
        ctx.fillRect(-obstacle.width * 0.2, -obstacle.height * 0.22, obstacle.width * 0.4, obstacle.height * 0.16);
        ctx.fillStyle = '#111';
        ctx.fillRect(-obstacle.width * 0.27, -obstacle.height * 0.33, obstacle.width * 0.16, obstacle.height * 0.08);
        ctx.fillRect(obstacle.width * 0.11, -obstacle.height * 0.33, obstacle.width * 0.16, obstacle.height * 0.08);
        ctx.fillRect(-obstacle.width * 0.24, obstacle.height * 0.08, obstacle.width * 0.48, obstacle.height * 0.06);
      } else if (obstacle.type === 'bus') {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(-obstacle.width * 0.5, -obstacle.height * 0.55, obstacle.width, obstacle.height * 0.8);
        ctx.fillStyle = '#fdfdfd';
        ctx.fillRect(-obstacle.width * 0.3, -obstacle.height * 0.18, obstacle.width * 0.6, obstacle.height * 0.16);
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(-obstacle.width * 0.2, -obstacle.height * 0.02, obstacle.width * 0.4, obstacle.height * 0.05);
      } else if (obstacle.type === 'motorcycle') {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(-obstacle.width * 0.4, -obstacle.height * 0.22, obstacle.width * 0.8, obstacle.height * 0.4);
        ctx.fillRect(-obstacle.width * 0.2, -obstacle.height * 0.02, obstacle.width * 0.4, obstacle.height * 0.08);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(-10, 10, 6, 0, Math.PI * 2);
        ctx.arc(10, 10, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (obstacle.type === 'cone') {
        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath();
        ctx.moveTo(0, -obstacle.height * 0.5);
        ctx.lineTo(obstacle.width * 0.5, obstacle.height * 0.5);
        ctx.lineTo(-obstacle.width * 0.5, obstacle.height * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(-5, -6, 10, 10);
      } else if (obstacle.type === 'hole') {
        ctx.fillStyle = '#0b0b0b';
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.width * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    });
  }
}
