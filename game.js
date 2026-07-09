import { VirusSystem } from './virus.js';
import { Boss } from './boss.js';
import { ParticleSystem } from './particles.js';
import { PowerupSystem } from './powerups.js';
import { Player } from './player.js';
import { AudioSystem } from './audio.js';
import { UIManager } from './ui.js';
import { SaveSystem } from './save.js';

class BubbleHealer2 {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.time = 0;
    this.lastTime = 0;
    this.running = false;
    this.paused = false;
    this.started = false;
    this.score = 0;
    this.coins = 0;
    this.bestScore = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.level = 1;
    this.timeScale = 1;
    this.freezeTimer = 0;
    this.slowTimer = 0;
    this.shieldTimer = 0;
    this.coinBoost = 1;
    this.coinBoostTimer = 0;
    this.bossTimer = 0;
    this.missionTimer = 0;
    this.projectiles = [];
    this.cells = [];
    this.backgroundOffset = 0;
    this.audio = new AudioSystem();
    this.save = new SaveSystem();
    this.ui = new UIManager(this);
    this.player = new Player(this);
    this.viruses = new VirusSystem(this);
    this.boss = new Boss(this);
    this.particles = new ParticleSystem(this);
    this.powerups = new PowerupSystem(this);
    this.bestScore = this.save.data.bestScore;
    this.coins = this.save.data.coins;
    this.applySavedUpgrades();
    this.bindEvents();
    this.resize();
    this.setupBackground();
    this.ui.updateStats();
    this.ui.showScreen('menuScreen');
    this.ui.setPaused(false);
    this.ui.setMuted(!this.audio.enabled);
    this.loop();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointerdown', (event) => {
      if (!this.started || this.paused) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (this.width / rect.width);
      const y = (event.clientY - rect.top) * (this.height / rect.height);
      this.handleTap(x, y);
    });

    document.getElementById('playBtn').addEventListener('click', () => this.startGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('soundBtn').addEventListener('click', () => this.toggleAudio());
    document.getElementById('upgradeBtn').addEventListener('click', () => this.openUpgrades());
    document.getElementById('closeUpgradeBtn').addEventListener('click', () => this.closeUpgrades());
    this.ui.upgradeList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-key]');
      if (!button) return;
      this.buyUpgrade(button.dataset.key, Number(button.dataset.cost));
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.player?.reset();
    this.setupBackground();
  }

  setupBackground() {
    this.cells = Array.from({ length: 18 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: 4 + Math.random() * 10,
      speed: 0.2 + Math.random() * 0.6,
      alpha: 0.24 + Math.random() * 0.4
    }));
  }

  startGame() {
    this.started = true;
    this.running = true;
    this.paused = false;
    this.score = 0;
    this.coins = this.save.data.coins;
    this.combo = 1;
    this.comboTimer = 0;
    this.level = 1;
    this.timeScale = 1;
    this.freezeTimer = 0;
    this.slowTimer = 0;
    this.shieldTimer = 0;
    this.coinBoost = 1;
    this.coinBoostTimer = 0;
    this.bossTimer = 0;
    this.missionTimer = 0;
    this.projectiles = [];
    this.viruses.reset();
    this.powerups.reset();
    this.boss.active = false;
    this.particles = new ParticleSystem(this);
    this.player.reset();
    this.ui.hideScreen();
    this.ui.setPaused(false);
    this.ui.updateStats();
    this.ui.showBanner('HEAL THE BODY');
    this.audio.tap();
  }

  togglePause() {
    if (!this.started) return;
    this.paused = !this.paused;
    this.ui.setPaused(this.paused);
  }

  toggleAudio() {
    this.audio.setEnabled(!this.audio.enabled);
    this.ui.setMuted(!this.audio.enabled);
  }

  openUpgrades() {
    if (!this.started) {
      this.ui.showScreen('upgradeScreen');
    } else {
      this.paused = true;
      this.ui.setPaused(true);
      this.ui.showScreen('upgradeScreen');
    }
    this.ui.renderUpgrades();
  }

  closeUpgrades() {
    this.paused = false;
    this.ui.setPaused(false);
    this.ui.showScreen(this.started ? '' : 'menuScreen');
  }

  buyUpgrade(key, cost) {
    if (this.coins < cost) return;
    this.coins -= cost;
    const current = this.save.getUpgrade(key);
    this.save.setUpgrade(key, current + 1);
    this.applySavedUpgrades();
    this.ui.renderUpgrades();
    this.ui.updateStats();
    this.audio.upgrade();
  }

  applySavedUpgrades() {
    this.player.upgrades.tapDamage = this.save.getUpgrade('tapDamage');
    this.player.upgrades.criticalChance = Math.min(0.5, this.save.getUpgrade('criticalChance') * 0.1);
    this.player.upgrades.bombRadius = this.save.getUpgrade('bombRadius');
    this.player.upgrades.laserPower = this.save.getUpgrade('laserPower');
    this.player.upgrades.spawnReduction = this.save.getUpgrade('spawnReduction');
    this.player.upgrades.comboDuration = this.save.getUpgrade('comboDuration');
    this.player.upgrades.maxHealth = this.save.getUpgrade('maxHealth');
    this.player.reset();
  }

  handleTap(x, y) {
    if (!this.started || this.paused) return;
    const hit = this.player.applyTap(x, y);
    if (!hit) {
      this.particles.burst(x, y, '#7de8ff', 8);
    }
    this.comboTimer = Math.max(this.comboTimer, 0.8 + this.player.upgrades.comboDuration * 0.15);
  }

  addMissionProgress(key, value) {
    this.save.data.missions[key] += value;
    this.save.save();
    if (key === 'viruses' && this.save.data.missions.viruses >= 100) this.unlockAchievement('virusHunter');
    if (key === 'combo' && this.combo >= 20) this.unlockAchievement('comboMaster');
    if (key === 'boss' && this.save.data.missions.boss >= 1) this.unlockAchievement('bossKiller');
    if (key === 'coins' && this.save.data.missions.coins >= 500) this.unlockAchievement('doctor');
  }

  unlockAchievement(name) {
    this.save.unlockAchievement(name);
    this.ui.showToast(name.replace(/([A-Z])/g, ' $1'));
  }

  checkAchievements() {
    if (this.score > 1200) this.unlockAchievement('immuneSystem');
  }

  gameOver() {
    this.running = false;
    this.started = false;
    this.paused = false;
    this.audio.gameOver();
    if (this.score > this.bestScore) {
      this.bestScore = Math.floor(this.score);
      this.save.setBestScore(this.bestScore);
    }
    this.save.addCoins(Math.floor(this.coins / 3));
    this.ui.updateStats();
    this.ui.showScreen('gameOverScreen');
    this.ui.showBanner('INFECTION OVERLOAD');
  }

  loop(timestamp = 0) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.032);
    this.lastTime = timestamp;
    this.time += dt;

    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (!this.started || this.paused) {
      this.updateBackground(dt, true);
      return;
    }

    this.updateBackground(dt, false);
    this.player.update(dt);
    this.viruses.update(dt);
    this.powerups.update(dt);
    this.boss.update(dt);
    this.particles.update(dt);
    this.updateTimers(dt);
    this.updateProjectiles(dt);
    this.updateCombo(dt);
    this.updateBossTimer(dt);
    this.ui.updateStats();

    if (this.viruses.active.length > 28 || this.player.health <= 0) {
      this.gameOver();
    }
  }

  updateBackground(dt, paused) {
    this.backgroundOffset += (paused ? 0 : 0.6) * dt;
    this.cells.forEach((cell) => {
      cell.y += cell.speed * dt * 30;
      if (cell.y > this.height + 20) {
        cell.y = -20;
        cell.x = Math.random() * this.width;
      }
    });
  }

  updateTimers(dt) {
    if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    if (this.slowTimer > 0) {
      this.slowTimer = Math.max(0, this.slowTimer - dt);
      if (this.slowTimer <= 0) this.timeScale = 1;
    }
    if (this.shieldTimer > 0) this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    if (this.coinBoostTimer > 0) {
      this.coinBoostTimer = Math.max(0, this.coinBoostTimer - dt);
      if (this.coinBoostTimer <= 0) this.coinBoost = 1;
    }
  }

  updateCombo(dt) {
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer <= 0) this.combo = Math.max(1, this.combo - 1);
  }

  updateBossTimer(dt) {
    this.bossTimer += dt;
    if (this.bossTimer >= 60 && !this.boss.active) {
      this.bossTimer = 0;
      this.boss.spawn();
    }
  }

  updateProjectiles(dt) {
    this.projectiles.forEach((proj) => {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;
      if (proj.life <= 0) proj.dead = true;
      if (Math.hypot(proj.x - this.player.x, proj.y - this.player.y) < 20) {
        this.player.health -= 1;
        proj.dead = true;
      }
    });
    this.projectiles = this.projectiles.filter((p) => !p.dead);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawBackground();
    this.powerups.draw(this.ctx);
    this.viruses.draw(this.ctx);
    this.boss.draw(this.ctx);
    this.drawProjectiles();
    this.player.draw(this.ctx);
    this.particles.draw(this.ctx);
    this.drawHUDBars();
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a1328');
    gradient.addColorStop(0.5, '#142745');
    gradient.addColorStop(1, '#0e1620');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.cells.forEach((cell, index) => {
      const y = cell.y + Math.sin(this.time * 0.4 + index) * 4;
      this.ctx.save();
      this.ctx.globalAlpha = cell.alpha;
      this.ctx.fillStyle = index % 2 === 0 ? '#5ef7ff' : '#ff6fb0';
      this.ctx.beginPath();
      this.ctx.arc(cell.x, y, cell.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      const y = (i * 120 + this.backgroundOffset * 14) % (this.height + 140) - 70;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.quadraticCurveTo(this.width * 0.25, y - 18, this.width * 0.5, y + 8);
      this.ctx.quadraticCurveTo(this.width * 0.75, y + 34, this.width, y + 14);
      this.ctx.stroke();
    }
  }

  drawProjectiles() {
    this.projectiles.forEach((proj) => {
      this.ctx.save();
      this.ctx.fillStyle = '#8cff8e';
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  drawHUDBars() {
    const barWidth = Math.min(this.width * 0.28, 180);
    const barHeight = 10;
    const x = 12;
    const y = this.height - 28;
    this.ctx.fillStyle = 'rgba(255,255,255,0.16)';
    this.ctx.fillRect(x, y, barWidth, barHeight);
    this.ctx.fillStyle = '#ff4f8f';
    this.ctx.fillRect(x, y, (this.player.health / this.player.maxHealth) * barWidth, barHeight);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px Segoe UI';
    this.ctx.fillText('Healing', x, y - 6);

    if (this.boss.active) {
      const bossX = (this.width - barWidth) * 0.5;
      this.ctx.fillStyle = 'rgba(255,255,255,0.16)';
      this.ctx.fillRect(bossX, 16, barWidth, 10);
      this.ctx.fillStyle = '#ff4d6d';
      this.ctx.fillRect(bossX, 16, (this.boss.health / this.boss.maxHealth) * barWidth, 10);
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText('Boss', bossX, 10);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new BubbleHealer2());
