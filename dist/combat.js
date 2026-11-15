export const ROSTER = [
  { id: 'savior', name: 'SAVIOR', title: 'Bo‘ron najotkori', element: 'CHAQMOQ', color: '#68dcff', accent: '#d6b777', speed: 285, power: 1, reach: 1, moveReach: {light:225,heavy:265}, style: 'Muvozanat', lore: 'Zulmat qoplagan olamda so‘nggi chaqmoq hali so‘nmagan.', special: 'Chaqmoq nayzasi', ultimate: 'Bo‘ron hukmi' },
  { id: 'ignis', name: 'IGNIS', title: 'Olov valkiriyasi', element: 'OLOV', color: '#ff8b44', accent: '#e95e39', speed: 320, power: .94, reach: .94, style: 'Tezkor hujum', lore: 'Kul ichidan qaytgan jangchi har bir zarbada alangalanadi.', special: 'Do‘zax alangasi', ultimate: 'Olov girdobi' },
  { id: 'glacia', name: 'GLACIA', title: 'Muzlik malikasi', element: 'MUZ', color: '#9defff', accent: '#70bbd2', speed: 275, power: 1, reach: 1.12, style: 'Masofa nazorati', lore: 'Uning sukuti ortida butun bir olamni muzlatadigan kuch bor.', special: 'Muz nayzasi', ultimate: 'Abadiy qahraton' },
  { id: 'aether_x', name: 'AETHER-X', title: 'Uyg‘ongan sun’iy ong', element: 'PLAZMA', color: '#5ff2d6', accent: '#60bcb0', speed: 305, power: .98, reach: 1.04, style: 'Havodagi ustunlik', lore: 'Buyruqlardan ozod ong o‘z taqdirini o‘zi tanlaydi.', special: 'Plazma impulsi', ultimate: 'Yadro protokoli' },
  { id: 'malakor', name: 'MALAKOR', title: 'Obsidian hukmdori', element: 'ZULMAT', color: '#b978ff', accent: '#9e68ce', speed: 235, power: 1.17, reach: 1.15, style: 'Og‘ir zarbalar', lore: 'Qadimiy zanjirlar uzildi. Bo‘shliq o‘z hukmdorini qaytardi.', special: 'Obsidian to‘lqini', ultimate: 'Bo‘shliq g‘azabi' }
];
// Geometry is measured in the same world units as the normalized 340px-tall
// standing bodies. A move's reach is its front edge, not center-to-center range.
export const MOVES = {
  light: { duration: .33, start: .09, end: .21, range: 165, bottom: 108, top: 282, damage: 57, stun: .25, push: 31, meter: 7 },
  heavy: { duration: .57, start: .20, end: .37, range: 218, bottom: 73, top: 315, damage: 96, stun: .43, push: 68, meter: 11 },
  sweep: { duration: .53, start: .16, end: .33, range: 195, bottom: 0, top: 104, damage: 78, stun: .60, push: 46, meter: 9, low: true },
  air: { duration: .48, start: .10, end: .33, range: 185, bottom: -78, top: 240, damage: 84, stun: .34, push: 54, meter: 9, airborne: true },
  special: { duration: .70, start: .24, end: .34, range: 900, bottom: 125, top: 215, damage: 112, stun: .41, push: 60, cost: 22, projectile: true,
    projectileWidth: 90, projectileHeight: 90, projectileSpeed: 770, projectileY: 170, projectileOffset: 78, projectileLife: 1.7 },
  ultimate: { duration: 90 / 90, start: 28 / 90, end: 40 / 90, range: 1200, bottom: 95, top: 245, damage: 220, stun: .63, push: 95, cost: 100, meter: 0, projectile: true, beam: true, groundOnly: true,
    projectileWidth: 240, projectileHeight: 150, projectileSpeed: 1150, projectileY: 170, projectileOffset: 90, projectileLife: 1.5 },
  grab: { duration: .73, start: .17, end: .32, range: 112, bottom: 35, top: 285, damage: 122, stun: .76, push: 115, meter: 12, throw: true }
};
const BODY = {
  savior: { half: 54, height: 310 }, ignis: { half: 49, height: 310 },
  glacia: { half: 51, height: 314 }, aether_x: { half: 52, height: 310, hover: 20 },
  malakor: { half: 71, height: 326 }
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ACTION_BUFFER = .24;
const RECOVERY_BUFFER = .38;
const VALID_ACTIONS = new Set(['jump', 'xray', ...Object.keys(MOVES)]);
const MOVE_KIND = new Map(Object.entries(MOVES).map(([kind,move])=>[move,kind]));
const frontReach = (f,move,kind=MOVE_KIND.get(move)) => (f.moveReach?.[kind] ?? move.range) * f.reach;
export function character(id) { return ROSTER.find(x => x.id === id) || ROSTER[0]; }
export function createFighter(id, side) {
  return { ...character(id), side, x: side ? 1000 : 440, y: 0, vy: 0, hp: 1000, meter: 35, wins: 0,
    facing: side ? -1 : 1, state: 'idle', stateTime: 0, action: null, stun: 0, recovery: 0,
    guard: false, crouch: false, grounded: true, reaction: null, knockedDown: false, combo: 0, comboClock: 0, lastDamage: 0, aiClock: 0, aiInput: {} };
}
export function getHurtbox(f) {
  const body = BODY[f.id] || BODY.savior;
  const low = f.crouch || f.action?.kind === 'sweep' || f.state === 'getup';
  const down = f.state === 'knockdown' || f.state === 'ko';
  const bottom = f.y + (!low && !down ? body.hover || 0 : 0);
  const height = down ? 105 : low ? 184 : body.height;
  return { left: f.x - body.half, right: f.x + body.half, bottom, top: bottom + height };
}
export function getAttackBox(f, moveOrKind = f.action?.move) {
  const move = typeof moveOrKind === 'string' ? MOVES[moveOrKind] : moveOrKind;
  if (!move || move.projectile) return null;
  const hover = !move.low ? BODY[f.id]?.hover || 0 : 0;
  const front = frontReach(f,move,typeof moveOrKind==='string'?moveOrKind:undefined), back = -28;
  const a = f.x + back * f.facing, b = f.x + front * f.facing;
  return { left: Math.min(a, b), right: Math.max(a, b), bottom: f.y + hover + move.bottom, top: f.y + hover + move.top };
}
export function boxesOverlap(a, b) {
  return !!a && !!b && a.left <= b.right && a.right >= b.left && a.bottom <= b.top && a.top >= b.bottom;
}
export function getProjectileBox(p, swept = false) {
  const previous = swept ? p.previousX ?? p.x : p.x;
  return { left: Math.min(previous, p.x) - p.width / 2, right: Math.max(previous, p.x) + p.width / 2,
    bottom: p.y - p.height / 2, top: p.y + p.height / 2 };
}
const activeInStep = action => action.time >= action.move.start && action.previousTime <= action.move.end;
const horizontalReach = (f, target, move) => frontReach(f,move) + (BODY[target.id]?.half || 54);
function xrayInRange(f, target) {
  const facing = target.x >= f.x ? 1 : -1;
  const box = getAttackBox({ ...f, facing }, { range: 205, bottom: 20, top: 315 });
  return boxesOverlap(box, getHurtbox(target)) && f.grounded && target.grounded;
}
export class Fight {
  constructor({ p1 = 'savior', p2 = 'ignis', mode = 'versus', difficulty = 'normal', random = Math.random, trainingGuard = false } = {}) {
    this.fighters = [createFighter(p1, 0), createFighter(p2, 1)];
    this.mode = mode; this.difficulty = difficulty; this.random = random; this.trainingGuard = trainingGuard;
    this.round = 1; this.timer = 99; this.phase = 'intro'; this.phaseTime = 0; this.elapsed = 0;
    this.events = []; this.projectiles = []; this.freeze = 0; this.winner = null; this.roundWinner = null;
    this.cinematic = null; this.pending = [[], []]; this.paused = false; this.damageTotal = [0, 0];
  }
  emit(type, payload = {}) { this.events.push({ type, ...payload }); }
  drainEvents() { const result = this.events; this.events = []; return result; }
  request(side, action) {
    if (![0, 1].includes(side) || !VALID_ACTIONS.has(action)) return;
    const f = this.fighters[side], remaining = f.action ? Math.max(0, f.action.move.duration - f.action.time)
      : f.stun + f.recovery + (f.stun > 0 && f.knockedDown ? .24 : 0);
    // Retain a reversal/next attack through the current final recovery. Keep the
    // latest intent, rather than a long backlog of attacks from repeated presses.
    const ttl = ACTION_BUFFER + (remaining <= RECOVERY_BUFFER ? remaining : 0);
    const previous = this.pending[side].find(x => x.action === action);
    if (previous) { previous.ttl = ttl; return; }
    this.pending[side] = [...this.pending[side].filter(x => (x.action === 'jump') !== (action === 'jump')), { action, ttl }].slice(-2);
  }
  setPhase(phase) { this.phase = phase; this.phaseTime = 0; this.pending = [[], []]; this.emit('phase', { phase }); }
  skipIntro() { if (this.phase === 'intro') this.setPhase('announce'); }
  resetTraining() {
    this.fighters.forEach((f, i) => Object.assign(f, createFighter(f.id, i), { meter: 100 }));
    this.projectiles = []; this.timer = 99; this.cinematic = null; this.freeze = 0; this.setPhase('fight');
  }
  startRound() {
    this.fighters.forEach((f, i) => { const wins = f.wins, meter = Math.max(25, f.meter * .55); Object.assign(f, createFighter(f.id, i), { wins, meter }); });
    this.timer = 99; this.projectiles = []; this.freeze = 0; this.roundWinner = null; this.setPhase('announce');
  }
  ai(f, enemy, dt) {
    if (this.mode === 'training') return { guard: this.trainingGuard };
    f.aiClock -= dt;
    if (f.aiClock > 0) return f.aiInput;
    const hard = this.difficulty === 'hard', easy = this.difficulty === 'easy';
    f.aiClock = (easy ? .25 : hard ? .09 : .17) + this.random() * .15;
    const d = Math.abs(f.x - enemy.x), r = this.random(), toward = enemy.x > f.x ? 1 : -1;
    const lightReach = horizontalReach(f, enemy, MOVES.light), heavyReach = horizontalReach(f, enemy, MOVES.heavy);
    const incoming = enemy.action && enemy.action.time < enemy.action.move.end + .1;
    let input = {};
    if (d > lightReach * .83) input.move = toward;
    else if (d < 100 && r < .20) input.move = -toward;
    if (incoming && this.random() < (hard ? .77 : easy ? .24 : .47)) {
      input = { guard: true, crouch: !!enemy.action.move.low }; f.aiInput = input; return input;
    }
    if (!f.action && f.stun <= 0) {
      if (f.meter >= 100 && xrayInRange(f, enemy) && r < .45) this.request(1, 'xray');
      else if (f.meter >= 100 && f.grounded && d > heavyReach && r < .62) this.request(1, 'ultimate');
      else if (d < horizontalReach(f, enemy, MOVES.grab) - 10 && r < .14) this.request(1, 'grab');
      else if (d <= lightReach - 8) this.request(1, r < .48 ? 'light' : r < .76 ? 'heavy' : 'sweep');
      else if (d <= heavyReach - 10 && r < .5) this.request(1, 'heavy');
      else if (d > 240 && f.meter >= 22 && r < .42) this.request(1, 'special');
      if (d > 170 && d < 380 && r > .89) this.request(1, 'jump');
    }
    f.aiInput = input; return input;
  }
  tick(dt, controls = [{}, {}]) {
    if (this.paused || dt <= 0) return;
    dt = Math.min(dt, .04); this.elapsed += dt; this.phaseTime += dt;
    if (this.mode === 'training') this.fighters.forEach(f => { f.meter = 100; });
    const [a, b] = this.fighters;
    if (this.phase === 'intro') { if (this.phaseTime >= 432 / 90) this.setPhase('announce'); return; }
    if (this.phase === 'announce') { if (this.phaseTime >= 1.8) { this.setPhase('fight'); this.emit('fight'); } return; }
    if (this.phase === 'roundEnd') { if (this.phaseTime > 2.7) { this.round++; this.startRound(); } return; }
    if (this.phase === 'victory') return;
    if (this.phase === 'finish') {
      if (this.mode !== 'local' && this.winner === 1 && this.phaseTime > 1.5) this.finish(1);
      else if (this.phaseTime >= 6) this.setPhase('victory');
      return;
    }
    if (this.phase === 'cinematic') {
      const c = this.cinematic; c.time += dt;
      if (!c.hit && c.time >= c.impact) {
        c.hit = true;
        const target = this.fighters[1 - c.side];
        if (c.kind === 'xray') { const damage = Math.min(target.hp, 258); target.hp -= damage; this.damageTotal[c.side] += damage; }
        this.emit('cinematicImpact', { side: c.side, kind: c.kind, color: this.fighters[c.side].color });
      }
      if (c.time >= c.duration) {
        const kind = c.kind; this.cinematic = null;
        if (kind === 'fatality') this.setPhase('victory');
        else { this.setPhase('fight'); this.fighters[1 - c.side].stun = .35; this.checkKO(); }
      }
      return;
    }
    if (this.freeze > 0) { this.freeze = Math.max(0, this.freeze - dt); return; }
    if (this.mode !== 'training') this.timer = Math.max(0, this.timer - dt);
    const inputs = [controls[0] || {}, this.mode === 'local' ? controls[1] || {} : this.ai(b, a, dt)];
    for (let i = 0; i < 2; i++) {
      this.updateFighter(this.fighters[i], this.fighters[1 - i], inputs[i], dt);
      if (this.phase !== 'fight') return;
    }
    if (a.grounded && b.grounded) {
      const minDistance = ((BODY[a.id]?.half || 54) + (BODY[b.id]?.half || 54)) * .82;
      if (Math.abs(a.x - b.x) < minDistance) {
        const dir = a.x <= b.x ? 1 : -1, overlap = (minDistance - Math.abs(a.x - b.x)) / 2;
        a.x = clamp(a.x - dir * overlap, 105, 1335); b.x = clamp(b.x + dir * overlap, 105, 1335);
      }
    }
    // Capture both active attacks before applying either hit. Simultaneous
    // attacks trade fairly; player 0 no longer cancels player 1's active hit.
    const hits = [];
    for (let i = 0; i < 2; i++) {
      const f = this.fighters[i], target = this.fighters[1 - i], action = f.action;
      if (!action || action.didHit || !activeInStep(action)) continue;
      if (action.move.projectile) {
        action.didHit = true;
        const move = action.move, x = f.x + f.facing * (move.projectileOffset ?? 78);
        this.projectiles.push({ owner: i, kind: action.kind, beam: !!move.beam, x, previousX: x,
          y: (move.projectileY ?? 170) + f.y + (BODY[f.id]?.hover || 0), dir: f.facing, life: move.projectileLife ?? 1.7,
          width: move.projectileWidth ?? 90, height: move.projectileHeight ?? 90, speed: move.projectileSpeed ?? 770, move });
        this.emit('projectile', { side: i, kind: action.kind, beam: !!move.beam, color: f.color });
      } else if ((!action.move.throw || (f.grounded && target.grounded)) && boxesOverlap(getAttackBox(f), getHurtbox(target))) {
        action.didHit = true; hits.push({ f, target, move: action.move, direction: f.facing });
      }
    }
    for (const p of this.projectiles) {
      p.previousX = p.x; p.x += p.dir * p.speed * dt; p.life -= dt;
      const target = this.fighters[1 - p.owner];
      if (p.life > 0 && boxesOverlap(getProjectileBox(p, true), getHurtbox(target))) {
        p.life = 0; hits.push({ f: this.fighters[p.owner], target, move: p.move, direction: p.dir });
      }
      if (p.x < -100 || p.x > 1540) p.life = 0;
    }
    for (const hit of hits) this.hit(hit.f, hit.target, hit.move, hit.direction);
    this.projectiles = this.projectiles.filter(p => p.life > 0);
    this.checkKO();
    if (this.phase === 'fight' && this.timer <= 0) {
      if (a.hp === b.hp) { this.roundWinner = null; this.emit('draw'); this.setPhase('roundEnd'); }
      else this.awardRound(a.hp > b.hp ? 0 : 1, true);
    }
  }
  updateFighter(f, enemy, input, dt) {
    f.stateTime += dt; f.comboClock = Math.max(0, f.comboClock - dt); if (f.comboClock === 0) f.combo = 0;
    const wasStunned = f.stun > 0;
    f.stun = Math.max(0, f.stun - dt); f.recovery = Math.max(0, f.recovery - dt);
    if (wasStunned && f.stun === 0) {
      if (f.knockedDown && (f.y > 0 || f.vy > 0)) f.stun = .05;
      else {
        if (f.knockedDown) { f.recovery = .24; f.stateTime = 0; }
        f.reaction = null; f.knockedDown = false;
      }
    }
    this.pending[f.side] = this.pending[f.side].map(x => ({ ...x, ttl: x.ttl - dt })).filter(x => x.ttl > 0);
    if (!f.action && f.stun <= 0) f.facing = enemy.x >= f.x ? 1 : -1;
    if (f.y > 0 || f.vy > 0) {
      f.y += f.vy * dt; f.vy -= 1900 * dt;
      if (f.y <= 0) { f.y = 0; f.vy = 0; this.emit('land', { side: f.side }); }
    }
    f.grounded = f.y <= 0 && f.vy <= 0;
    if (f.action) {
      f.action.previousTime = f.action.time; f.action.time += dt;
      if (f.action.time >= f.action.move.duration) f.action = null;
    }
    f.guard = !!input.guard && f.grounded && !f.action && f.stun <= 0 && f.recovery <= 0;
    f.crouch = f.action?.kind === 'sweep' || (!!input.crouch && f.grounded && !f.action && f.stun <= 0 && f.recovery <= 0);
    if (f.stun > 0) {
      const state = f.knockedDown ? f.y > 0 ? f.vy >= 0 ? 'launched' : 'fall' : 'knockdown' : f.reaction || 'hit';
      if (f.state !== state) f.stateTime = 0;
      f.state = state; return;
    }
    if (f.recovery > 0) { f.state = 'getup'; return; }
    if (!f.action) {
      const requested = this.pending[f.side][0];
      if (requested) {
        const action = requested.action;
        if (action === 'jump') {
          if (f.grounded && !f.guard) { f.vy = 790; f.grounded = false; this.emit('jump', { side: f.side }); }
          this.pending[f.side].shift();
        } else if (action === 'xray') {
          this.pending[f.side].shift();
          if (f.meter >= 100 && xrayInRange(f, enemy)) { this.startXray(f.side); return; }
          this.emit('unavailable', { side: f.side, reason: f.meter < 100 ? 'meter' : 'distance' });
        } else if (MOVES[action]) {
          let kind = action;
          if (!f.grounded && ['light', 'heavy'].includes(kind)) kind = 'air';
          if (f.crouch && kind === 'heavy') kind = 'sweep';
          const move = MOVES[kind]; this.pending[f.side].shift();
          if (((move.throw || move.low || move.groundOnly) && !f.grounded) || (move.airborne && f.grounded)) {
            this.emit('unavailable', { side: f.side, reason: 'airborne' });
          } else if (f.meter >= (move.cost || 0)) {
            f.guard = false; f.crouch = !!move.low;
            if (this.mode !== 'training') f.meter = clamp(f.meter - (move.cost || 0), 0, 100);
            f.action = { kind, move, time: 0, previousTime: 0, didHit: false }; f.stateTime = 0;
            this.emit('swing', { side: f.side, kind });
          } else this.emit('unavailable', { side: f.side, reason: 'meter' });
        }
      }
    }
    if (!f.action && !f.guard && !f.crouch) f.x = clamp(f.x + clamp(input.move || 0, -1, 1) * f.speed * (f.grounded ? 1 : .80) * dt, 105, 1335);
    f.state = f.action ? f.action.kind : !f.grounded ? 'air' : f.guard ? 'block' : f.crouch ? 'crouch' : input.move ? 'walk' : 'idle';
  }
  hit(attacker, target, move, direction = attacker.facing) {
    // Projectile guard and knockback follow the projectile's travel direction,
    // even when its owner has crossed behind the target since it was launched.
    const blocked = target.guard && target.grounded && !move.throw && (!move.low || target.crouch)
      && (!move.airborne || !target.crouch) && target.facing === -direction;
    const rawDamage = Math.round(move.damage * attacker.power * (blocked ? .12 : 1));
    const damage = Math.min(target.hp, rawDamage);
    target.hp -= damage; target.lastDamage = damage; this.damageTotal[attacker.side] += damage;
    target.meter = clamp(target.meter + (blocked ? 3 : 8), 0, 100);
    attacker.meter = clamp(attacker.meter + (move.meter ?? 5) * (blocked ? .4 : 1), 0, 100);
    if (!blocked) {
      target.guard = false; target.crouch = false;
      const launch = move.throw || (!target.grounded && !move.low && move.damage > 75);
      target.action = null; target.stun = move.stun; target.recovery = 0; target.knockedDown = !!(launch || move.low);
      target.reaction = launch ? 'launched' : move.low ? 'knockdown' : move.damage >= 90 ? 'heavyHit' : 'hit';
      target.state = target.reaction; target.stateTime = 0;
      target.x = clamp(target.x + direction * move.push, 105, 1335);
      attacker.combo = attacker.comboClock > 0 ? attacker.combo + 1 : 1; attacker.comboClock = 1.05;
      if (launch) { target.vy = Math.max(target.vy, 520); target.y = Math.max(target.y, 20); target.grounded = false; }
    }
    this.freeze = Math.max(this.freeze, blocked ? .025 : move.damage > 90 ? .075 : .045);
    this.emit(blocked ? 'block' : 'hit', { side: attacker.side, target: target.side, damage, combo: attacker.combo, x: target.x,
      y: target.y + (move.low ? 65 : 170), color: attacker.color, heavy: move.damage > 90 });
  }
  checkKO() {
    if (this.phase !== 'fight') return;
    const [a, b] = this.fighters;
    if (this.mode === 'training') { if (a.hp <= 0 || b.hp <= 0) { this.emit('trainingReset'); this.resetTraining(); } return; }
    if (a.hp <= 0 && b.hp <= 0) { this.roundWinner = null; this.emit('draw'); this.setPhase('roundEnd'); }
    else if (a.hp <= 0 || b.hp <= 0) this.awardRound(a.hp > 0 ? 0 : 1);
  }
  awardRound(side, timeUp = false) {
    if (this.phase !== 'fight') return;
    this.roundWinner = side; this.fighters[side].wins++; this.projectiles = [];
    this.fighters.forEach(f => { f.action = null; f.guard = false; f.y = 0; f.vy = 0; });
    this.emit('roundWin', { side, timeUp });
    if (this.fighters[side].wins >= 2) { this.winner = side; this.setPhase(timeUp ? 'victory' : 'finish'); }
    else this.setPhase('roundEnd');
  }
  finish(side) {
    if (this.phase !== 'finish' || this.winner !== side) return false;
    this.cinematic = { kind: 'fatality', side, time: 0, duration: 4.4, impact: 1.65, hit: false };
    this.setPhase('cinematic'); this.emit('cinematicStart', { kind: 'fatality', side }); return true;
  }
  startXray(side) {
    if (this.mode !== 'training') this.fighters[side].meter -= 100;
    this.fighters.forEach(f => { f.action = null; f.y = 0; f.vy = 0; f.guard = false; f.grounded = true; });
    this.projectiles = []; this.cinematic = { kind: 'xray', side, time: 0, duration: 284 / 90, impact: 1.1, hit: false };
    this.setPhase('cinematic'); this.emit('cinematicStart', { kind: 'xray', side });
  }
}
