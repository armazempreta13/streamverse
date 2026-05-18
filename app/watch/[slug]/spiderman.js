export function initSpiderman() {
    'use strict';
    if (typeof window === 'undefined') return function () {};

    var CFG = Object.assign({ scale: .7, speed: 1.2, color: '#1a1a1a', webColor: 'rgba(200,220,255,0.55)', maxSpiders: 5, avoidSelectors: ['header', 'nav', 'footer', 'main', 'section', 'article', 'aside', '.card', '.modal', '[class*="container"]', '[class*="wrapper"]', 'form', 'table', 'figure'] }, window.SPIDER_CONFIG || {});
    var SC = CFG.scale, SP = CFG.speed;
    
    // Canvas is position:absolute and z-index:50 to render INSIDE the page aquarium (behind navbars, sidebars, and overlays)
    var CV = document.createElement('canvas');
    CV.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:50;';
    document.body.appendChild(CV);
    var CX = CV.getContext('2d');
    
    var VW = 0, VH = 0;
    function rsz() { 
        VW = CV.width = Math.max(document.documentElement.scrollWidth, window.innerWidth); 
        VH = CV.height = Math.max(document.documentElement.scrollHeight, window.innerHeight); 
        CV.style.width = VW + 'px';
        CV.style.height = VH + 'px';
    }
    rsz(); 
    
    var rszListener = function () { rsz(); rebObs(); };
    window.addEventListener('resize', rszListener);

    var PI = Math.PI, TAU = PI * 2, abs = Math.abs, sin = Math.sin, cos = Math.cos, sqrt = Math.sqrt, atan2 = Math.atan2, min = Math.min, max = Math.max, floor = Math.floor, random = Math.random;
    function clamp(v, a, b) { return max(a, min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function dst(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return sqrt(dx * dx + dy * dy); }
    function lerpA(a, b, t) { var d = b - a; while (d > PI) d -= TAU; while (d < -PI) d += TAU; return a + d * t; }
    function rotV(px, py, a) { var c = cos(a), s = sin(a); return [px * c - py * s, px * s + py * c]; }
    
    function ik2(sx, sy, fx, fy, l1, l2, bend) {
        var dx = fx - sx, dy = fy - sy, d = sqrt(dx * dx + dy * dy);
        if (d < .001) return [sx + l1, sy];
        d = min(d, l1 + l2 - .01);
        var ca = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), ba = atan2(dy, dx), ea = ba + bend * Math.acos(ca);
        return [sx + cos(ea) * l1, sy + sin(ea) * l1];
    }
    
    var _np = (function () { var p = []; for (var i = 0; i < 256; i++)p[i] = i; for (var j = 255; j > 0; j--) { var k = floor(random() * (j + 1)), t = p[j]; p[j] = p[k]; p[k] = t; } return p.concat(p); })();
    function nfade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function ng1(h, x) { return (h & 1) ? -x : x; }
    function noise(x) { var xi = floor(x) & 255, xf = x - floor(x), u = nfade(xf); return lerp(ng1(_np[xi], xf), ng1(_np[xi + 1], xf - 1), u); }
    function noise2(x, y) { return noise(x + noise(y * 127.1) * 3.1) * .5 + noise(y + noise(x * 269.5) * 3.1) * .5; }
    
    var OBS = [];
    function rebObs() {
        OBS = [];
        var scrollX = window.scrollX;
        var scrollY = window.scrollY;
        var viewWidth = window.innerWidth;
        var viewHeight = window.innerHeight;
        CFG.avoidSelectors.forEach(function (sel) {
            try {
                document.querySelectorAll(sel).forEach(function (el) {
                    var r = el.getBoundingClientRect();
                    // Ignore layout containers that are too large (covers > 80% of screen)
                    if (r.width > 40 && r.height > 40 && r.width < viewWidth * 0.8 && r.height < viewHeight * 0.8) {
                        var left = r.left + scrollX;
                        var right = r.right + scrollX;
                        var top = r.top + scrollY;
                        var bottom = r.bottom + scrollY;
                        OBS.push({ l: left, t: top, r: right, b: bottom, cx: (left + right) / 2, cy: (top + bottom) / 2, w: r.width, h: r.height });
                    }
                });
            } catch (e) { }
        });
    }
    
    function rSDF(px, py, o) {
        var dx = max(o.l - px, 0, px - o.r), dy = max(o.t - py, 0, py - o.b);
        if (dx === 0 && dy === 0) return -min(px - o.l, o.r - px, py - o.t, o.b - py);
        return sqrt(dx * dx + dy * dy);
    }
    function inObs(px, py) { return OBS.some(function (o) { return px > o.l && px < o.r && py > o.t && py < o.b; }); }
    function oNorm(px, py, o) { var dL = px - o.l, dR = o.r - px, dT = py - o.t, dB = o.b - py, m = min(dL, dR, dT, dB); if (m === dL) return [-1, 0]; if (m === dR) return [1, 0]; if (m === dT) return [0, -1]; return [0, 1]; }
    
    var wNodes = [], wStrands = [];
    var MX = -9999, MY = -9999;
    
    // Map mouse position to document absolute coordinates
    var mouseMoveListener = function (e) { 
        MX = e.clientX + window.scrollX; 
        MY = e.clientY + window.scrollY; 
    };
    window.addEventListener('mousemove', mouseMoveListener, { passive: true });
    
    var touchMoveListener = function (e) { 
        MX = e.touches[0].clientX + window.scrollX; 
        MY = e.touches[0].clientY + window.scrollY; 
    };
    window.addEventListener('touchmove', touchMoveListener, { passive: true });

    function addNode(x, y, fixed, longLife) {
        for (var i = 0; i < wNodes.length; i++)if (dst(x, y, wNodes[i].x, wNodes[i].y) < 14) return wNodes[i];
        var n = { x: x, y: y, fixed: !!fixed, age: 0, maxAge: fixed ? 9e9 : (longLife ? 4000 + random() * 2000 : 2000 + random() * 1200) };
        wNodes.push(n); return n;
    }
    
    function addStrand(a, b, isSpiral) {
        for (var i = 0; i < wStrands.length; i++) { var s = wStrands[i]; if ((s.a === a && s.b === b) || (s.a === b && s.b === a)) return; }
        wStrands.push({ a: a, b: b, broken: false, breakT: 0, pts: [], isSpiral: !!isSpiral });
    }
    
    function brkStrand(st) {
        if (st.broken) return; st.broken = true; st.breakT = 0; st.pts = [];
        var mx = (st.a.x + st.b.x) / 2, my = (st.a.y + st.b.y) / 2;
        for (var i = 0; i < 7; i++) { var a = random() * TAU; st.pts.push({ x: mx, y: my, vx: cos(a) * (1 + random() * 2), vy: sin(a) * (1 + random() * 2) - 1, life: 1 }); }
    }
    
    function strandHitMouse(st) {
        var ax = st.a.x, ay = st.a.y, bx = st.b.x, by = st.b.y, dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
        if (len2 < .001) return dst(ax, ay, MX, MY) < 22;
        var t = clamp(((MX - ax) * dx + (MY - ay) * dy) / len2, 0, 1);
        return dst(ax + t * dx, ay + t * dy, MX, MY) < 22;
    }
    
    function updWeb() {
        for (var i = wNodes.length - 1; i >= 0; i--) {
            var n = wNodes[i]; if (!n.fixed) n.age++;
            if (n.age > n.maxAge) { var dead = n; wStrands = wStrands.filter(function (s) { return s.a !== dead && s.b !== dead; }); wNodes.splice(i, 1); }
        }
        for (var j = wStrands.length - 1; j >= 0; j--) {
            var st = wStrands[j];
            if (st.broken) {
                st.breakT += .055;
                st.pts.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .09; p.life -= .045; });
                if (st.breakT > 1) wStrands.splice(j, 1);
            } else if (strandHitMouse(st)) brkStrand(st);
        }
    }
    
    function buildCornerWeb(obs, corner) {
        // High density settings for fuller, richer webs!
        var PAD = min(obs.w, obs.h, 240) * SC * 0.95, RINGS = 9, RAYS = 14;
        if (PAD < 20 * SC) return;
        var cx, cy, sX, sY;
        if (corner === 0) { cx = obs.l; cy = obs.t; sX = 1; sY = 1; }
        else if (corner === 1) { cx = obs.r; cy = obs.t; sX = -1; sY = 1; }
        else if (corner === 2) { cx = obs.l; cy = obs.b; sX = 1; sY = -1; }
        else { cx = obs.r; cy = obs.b; sX = -1; sY = -1; }
        if (cx < 4 || cx > VW - 4 || cy < 4 || cy > VH - 4) return;
        
        var origin = addNode(cx, cy, true);
        var baseA = atan2(sY, sX) + PI, spread = PI / 2;
        var rayNodes = [];
        for (var r = 0; r < RAYS; r++) {
            var a = baseA - (spread / 2) + (spread * r / (RAYS - 1)), ray = [origin];
            for (var ring = 1; ring <= RINGS; ring++) {
                var rr = PAD * (ring / RINGS), nx = cx + cos(a) * rr, ny = cy + sin(a) * rr;
                if (nx < 4 || nx > VW - 4 || ny < 4 || ny > VH - 4) break;
                if (nx > obs.l - 2 && nx < obs.r + 2 && ny > obs.t - 2 && ny < obs.b + 2) break;
                var node = addNode(nx, ny, false, true);
                addStrand(ray[ray.length - 1], node, false); // Anchor ray lines
                ray.push(node);
            }
            rayNodes.push(ray);
        }
        for (var ring2 = 1; ring2 <= RINGS; ring2++) {
            for (var r2 = 0; r2 < RAYS - 1; r2++) {
                var rA = rayNodes[r2], rB = rayNodes[r2 + 1];
                if (ring2 < rA.length && ring2 < rB.length) {
                    addStrand(rA[ring2], rB[ring2], true); // Spiral ring lines
                }
            }
        }
    }
    
    function buildAllCornerWebs() {
        OBS.forEach(function (obs) {
            if (obs.w < 80 || obs.h < 80) return;
            [0, 1, 2, 3].forEach(function (c) { if (random() < .55) buildCornerWeb(obs, c); });
        });
    }
    
    var LDEFS = [
        { sh: [5 * SC, -8 * SC], rf: [24 * SC, -21 * SC], l: [9 * SC, 9 * SC, 7 * SC], bend: 1 },
        { sh: [7 * SC, -3 * SC], rf: [26 * SC, -5 * SC], l: [10 * SC, 9 * SC, 7 * SC], bend: 1 },
        { sh: [7 * SC, 2 * SC], rf: [25 * SC, 8 * SC], l: [10 * SC, 9 * SC, 7 * SC], bend: 1 },
        { sh: [5 * SC, 7 * SC], rf: [20 * SC, 20 * SC], l: [9 * SC, 8 * SC, 7 * SC], bend: 1 },
        { sh: [-5 * SC, -8 * SC], rf: [-24 * SC, -21 * SC], l: [9 * SC, 9 * SC, 7 * SC], bend: -1 },
        { sh: [-7 * SC, -3 * SC], rf: [-26 * SC, -5 * SC], l: [10 * SC, 9 * SC, 7 * SC], bend: -1 },
        { sh: [-7 * SC, 2 * SC], rf: [-25 * SC, 8 * SC], l: [10 * SC, 9 * SC, 7 * SC], bend: -1 },
        { sh: [-5 * SC, 7 * SC], rf: [-20 * SC, 20 * SC], l: [9 * SC, 8 * SC, 7 * SC], bend: -1 },
    ];
    var GA = [0, 3, 5, 6], GB = [1, 2, 4, 7];
    function mkLeg(d, bx, by) { var r = rotV(d.rf[0], d.rf[1], 0); return { def: d, fx: bx + r[0], fy: by + r[1], tx: 0, ty: 0, fromX: 0, fromY: 0, stepping: false, stepT: 0, lift: 0 }; }
    function hexRGB(h) { var n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    var _c = hexRGB(CFG.color), CR = _c[0], CG = _c[1], CB = _c[2];
    var cD = 'rgba(' + max(0, CR - 20) + ',' + max(0, CG - 20) + ',' + max(0, CB - 20) + ',1)';
    var cL = 'rgba(' + min(255, CR + 60) + ',' + min(255, CG + 60) + ',' + min(255, CB + 60) + ',.85)';
    function wAlpha(a) { return CFG.webColor.replace(/[\d.]+(?=\s*\))/, function (v) { return (parseFloat(v) * a).toFixed(3); }); }
    
    var ST = { EX: 0, EDGE: 1, IDLE: 2, GROOM: 3, HANG: 4, FLEE: 5, WEAVE: 6 };
    var BS = 1.3 * SP;
    
    function mkSpider(x, y) {
        var sp = {
            x: x, y: y, vx: 0, vy: 0, angle: PI / 2, aim: PI / 2, legs: LDEFS.map(function (d) { return mkLeg(d, x, y); }),
            state: ST.EX, timer: 0, wx: 0, wy: 0, edgeObs: null, edgeDir: 1, nearD: 9999, nearNx: 0, nearNy: 0,
            frame: 0, breath: random() * TAU, abdS: 1, palpPh: random() * TAU,
            palp: [{ a: -.38, l: 8 * SC, sl: 5 * SC }, { a: .38, l: 8 * SC, sl: 5 * SC }],
            gaitPh: 0, gaitT: 0, stuckT: 0, lastX: x, lastY: y, noiseT: random() * 100, silkT: 0,
            weaveStart: null, weaveNode: null, dragLine: null
        };
        return sp;
    }
    function pickFree(sp) { var tx, ty, t = 0; do { tx = 60 + random() * (VW - 120); ty = 60 + random() * (VH - 120); t++; } while (inObs(tx, ty) && t < 60); sp.wx = tx; sp.wy = ty; }
    
    function enterSt(sp, s) {
        sp.state = s; sp.timer = 0;
        if (s === ST.IDLE) sp.timer = 80 + floor(random() * 120);
        if (s === ST.GROOM) sp.timer = 60 + floor(random() * 80);
        if (s === ST.HANG) { sp.timer = 120 + floor(random() * 180); sp.dragLine = { x: sp.x, y: sp.y }; }
        if (s === ST.FLEE) sp.timer = 40 + floor(random() * 40);
        if (s === ST.EX) { sp.dragLine = null; pickFree(sp); }
        if (s === ST.EDGE) { sp.edgeDir = random() < .5 ? 1 : -1; sp.timer = 120 + floor(random() * 200); }
        if (s === ST.WEAVE) startWeave(sp);
    }
    
    function startWeave(sp) {
        var n1 = addNode(sp.x, sp.y, false, false);
        var cands = wNodes.filter(function (n) { return n !== n1 && dst(n.x, n.y, sp.x, sp.y) < 180; });
        var target = null;
        if (cands.length && random() < .6) target = cands[floor(random() * cands.length)];
        if (!target) {
            var a = random() * TAU, rr = 70 + random() * 110, tx = clamp(sp.x + cos(a) * rr, 40, VW - 40), ty = clamp(sp.y + sin(a) * rr, 40, VH - 40);
            if (!inObs(tx, ty)) target = addNode(tx, ty, false, false); else { enterSt(sp, ST.EX); return; }
        }
        sp.weaveStart = { x: sp.x, y: sp.y }; sp.weaveNode = target; sp.wx = target.x; sp.wy = target.y; sp.timer = 200 + floor(random() * 100);
    }
    
    function updSensors(sp) {
        var best = 9999, bx = 0, by = 0;
        OBS.forEach(function (o) { var d = rSDF(sp.x, sp.y, o); if (d < best) { best = d; var dx = sp.x - o.cx, dy = sp.y - o.cy, dd = sqrt(dx * dx + dy * dy) || 1; bx = dx / dd; by = dy / dd; } });
        sp.nearD = best; sp.nearNx = bx; sp.nearNy = by;
    }
    
    function avoidObs(sp) {
        var ax = 0, ay = 0, SN = 48 * SC;
        OBS.forEach(function (o) {
            var d = rSDF(sp.x, sp.y, o);
            if (d < SN) {
                var f = (SN - d) / SN, nx, ny, nd;
                if (d < 0) { var nm = oNorm(sp.x, sp.y, o); nx = nm[0]; ny = nm[1]; nd = 1; f = 3; }
                else { nx = sp.x - o.cx; ny = sp.y - o.cy; nd = sqrt(nx * nx + ny * ny) || 1; }
                var mult = sp.state === ST.EDGE ? .5 : sp.state === ST.FLEE ? 2.2 : 1.6;
                ax += (nx / nd) * f * mult; ay += (ny / nd) * f * mult;
            }
        });
        return [ax, ay];
    }
    
    function avoidMouse(sp) {
        var dx = sp.x - MX, dy = sp.y - MY, d = sqrt(dx * dx + dy * dy) || 1, R = 85;
        if (d < R) {
            var f = (R - d) / R;
            if (f > .65 && sp.state !== ST.FLEE && sp.state !== ST.HANG) { 
                pickFree(sp); 
                enterSt(sp, ST.FLEE); 
            }
            return [dx / d * f * 3.5, dy / d * f * 3.5]; // Faster mouse reaction
        }
        return [0, 0];
    }
    
    function mousePull(sp) {
        var dx = MX - sp.x, dy = MY - sp.y, d = sqrt(dx * dx + dy * dy) || 1;
        if (MX < 0 || MX > VW || d < 120 || d > 500) return [0, 0];
        var f = .015 * (1 - d / 500); return [dx / d * f, dy / d * f];
    }
    
    function steer(sp) {
        var ax = 0, ay = 0;
        switch (sp.state) {
            case ST.EX:
                var dx = sp.wx - sp.x, dy = sp.wy - sp.y, d = sqrt(dx * dx + dy * dy) || 1;
                if (d < 22) {
                    var roll = random();
                    if (roll < .14 && OBS.length) { sp.edgeObs = OBS[floor(random() * OBS.length)]; enterSt(sp, ST.EDGE); break; }
                    if (roll < .27) { enterSt(sp, ST.IDLE); break; }
                    if (roll < .37) { enterSt(sp, ST.GROOM); break; }
                    if (roll < .48) { enterSt(sp, ST.HANG); break; }
                    if (roll < .62) { enterSt(sp, ST.WEAVE); break; }
                    pickFree(sp);
                }
                sp.noiseT += .008;
                var wob = noise2(sp.noiseT, sp.noiseT * .7) * 1.2, spd2 = BS * (.8 + .3 * sin(sp.frame * .02));
                ax = dx / d * spd2 + cos(sp.aim + PI / 2) * wob; ay = dy / d * spd2 + sin(sp.aim + PI / 2) * wob; break;
            case ST.EDGE:
                sp.timer--; if (sp.timer <= 0 || !sp.edgeObs) { enterSt(sp, ST.EX); break; }
                var o = sp.edgeObs, PAD = 16 * SC, dL = abs(sp.x - o.l), dR = abs(sp.x - o.r), dT = abs(sp.y - o.t), dB = abs(sp.y - o.b), dM = min(dL, dR, dT, dB);
                if (dM === dT || dM === dB) { var tY = (dM === dT) ? o.t - PAD : o.b + PAD; ay += (tY - sp.y) * .28; ax = BS * sp.edgeDir; if (sp.x < o.l - PAD || sp.x > o.r + PAD) sp.edgeDir *= -1; }
                else { var tX = (dM === dL) ? o.l - PAD : o.r + PAD; ax += (tX - sp.x) * .28; ay = BS * sp.edgeDir; if (sp.y < o.t - PAD || sp.y > o.b + PAD) sp.edgeDir *= -1; }
                break;
            case ST.IDLE:
                sp.timer--; if (sp.timer <= 0) enterSt(sp, random() < .5 ? ST.GROOM : ST.EX);
                ax = noise2(sp.frame * .04, sp.frame * .03) * .08; ay = noise2(sp.frame * .03 + 10, sp.frame * .04 + 5) * .08; break;
            case ST.GROOM: sp.timer--; if (sp.timer <= 0) enterSt(sp, ST.EX); break;
            case ST.HANG: sp.timer--; if (sp.timer <= 0) { sp.dragLine = null; enterSt(sp, ST.EX); } ax = sin(sp.frame * .033) * .14; break;
            case ST.FLEE:
                sp.timer--; if (sp.timer <= 0) enterSt(sp, ST.EX);
                var dx2 = sp.wx - sp.x, dy2 = sp.wy - sp.y, d2 = sqrt(dx2 * dx2 + dy2 * dy2) || 1; ax = dx2 / d2 * BS * 3.5; ay = dy2 / d2 * BS * 3.5; break;
            case ST.WEAVE:
                sp.timer--;
                var dx3 = sp.wx - sp.x, dy3 = sp.wy - sp.y, d3 = sqrt(dx3 * dx3 + dy3 * dy3) || 1;
                if (sp.timer <= 0 || d3 < 15) { 
                    if (sp.weaveNode) { 
                        var n0 = addNode(sp.weaveStart.x, sp.weaveStart.y, false, false); 
                        addStrand(n0, sp.weaveNode, false); 
                        // Interconnect nearby nodes to build a beautiful, rich, connected organic web network!
                        wNodes.forEach(function (otherNode) {
                            if (otherNode !== n0 && otherNode !== sp.weaveNode && dst(n0.x, n0.y, otherNode.x, otherNode.y) < 130) {
                                addStrand(n0, otherNode, true);
                            }
                        });
                    } 
                    enterSt(sp, ST.EX); 
                    break; 
                }
                ax = dx3 / d3 * BS * .9; ay = dy3 / d3 * BS * .9; break;
        }
        return [ax, ay];
    }
    
    function updSpider(sp) {
        sp.frame++; sp.breath += .022;
        updSensors(sp);
        if (sp.frame % 60 === 0) {
            var moved = dst(sp.x, sp.y, sp.lastX, sp.lastY); sp.lastX = sp.x; sp.lastY = sp.y;
            if (moved < 3 && sp.state !== ST.IDLE && sp.state !== ST.GROOM && sp.state !== ST.HANG) {
                sp.stuckT++;
                if (sp.stuckT > 2) { 
                    sp.stuckT = 0; 
                    var t = 0, ex, ey; 
                    do { 
                        ex = 60 + random() * (VW - 120); 
                        ey = 60 + random() * (VH - 120); 
                        t++; 
                    } while (inObs(ex, ey) && t < 40); 
                    sp.x = ex; sp.y = ey; sp.vx = 0; sp.vy = 0; 
                    enterSt(sp, ST.EX); 
                    return; 
                }
            } else sp.stuckT = 0;
        }
        if (sp.nearD < 6 * SC && sp.state !== ST.FLEE && sp.state !== ST.EDGE && sp.state !== ST.HANG) { pickFree(sp); enterSt(sp, ST.FLEE); }
        var s = steer(sp), ob = avoidObs(sp), mf = avoidMouse(sp), mp = mousePull(sp);
        var ax = s[0] + ob[0] + mf[0] + mp[0], ay = s[1] + ob[1] + mf[1] + mp[1];
        var drag = sp.state === ST.IDLE ? .55 : sp.state === ST.GROOM ? .45 : sp.state === ST.HANG ? .9 : .78;
        sp.vx = sp.vx * drag + ax * (1 - drag); sp.vy = sp.vy * drag + ay * (1 - drag);
        var spd = sqrt(sp.vx * sp.vx + sp.vy * sp.vy), mxS = sp.state === ST.FLEE ? BS * 3.5 : BS * 1.6;
        if (spd > mxS) { sp.vx *= mxS / spd; sp.vy *= mxS / spd; }
        sp.x += sp.vx; sp.y += sp.vy;
        var mg = 14 * SC;
        if (sp.x < mg) { sp.x = mg; sp.vx = abs(sp.vx) * .6; } if (sp.x > VW - mg) { sp.x = VW - mg; sp.vx = -abs(sp.vx) * .6; }
        if (sp.y < mg) { sp.y = mg; sp.vy = abs(sp.vy) * .6; } if (sp.y > VH - mg) { sp.y = VH - mg; sp.vy = -abs(sp.vy) * .6; }
        if (spd > .1) { var ta = atan2(sp.vy, sp.vx) - PI / 2; sp.angle = lerpA(sp.angle, ta, .1); }
        sp.aim = lerpA(sp.aim, sp.angle, .16);
        sp.abdS = 1 + sin(sp.breath) * .045;
        sp.palpPh += sp.state === ST.GROOM ? .2 : sp.state === ST.IDLE ? .09 : .055;
        sp.palp[0].a = -.38 + sin(sp.palpPh) * .30; sp.palp[1].a = .38 + sin(sp.palpPh + .9) * .25;
        
        sp.silkT++; 
        if (sp.silkT > 200 + random() * 120 && sp.state !== ST.GROOM && sp.state !== ST.IDLE) { 
            addNode(sp.x, sp.y, false, false); 
            sp.silkT = 0; 
        }
        updLegs(sp);
    }
    
    function updLegs(sp) {
        var moving = sqrt(sp.vx * sp.vx + sp.vy * sp.vy) > .1;
        sp.gaitT++; if (sp.gaitT >= 9) { sp.gaitT = 0; sp.gaitPh ^= 1; }
        var pair = sp.gaitPh === 0 ? GA : GB;
        sp.legs.forEach(function (leg, i) {
            var rf = leg.def.rf, rfW = rotV(rf[0], rf[1], sp.aim + PI / 2);
            var restX = sp.x + rfW[0] + sp.vx * 3.2, restY = sp.y + rfW[1] + sp.vy * 3.2;
            if (!leg.stepping && dst(leg.fx, leg.fy, restX, restY) > 13 * SC && moving && pair.indexOf(i) >= 0) {
                leg.stepping = true; leg.stepT = 0; leg.fromX = leg.fx; leg.fromY = leg.fy; leg.tx = restX; leg.ty = restY;
            }
            if (leg.stepping) {
                leg.stepT += .15; if (leg.stepT >= 1) { leg.stepT = 1; leg.stepping = false; }
                var t = leg.stepT < .5 ? 2 * leg.stepT * leg.stepT : -1 + (4 - 2 * leg.stepT) * leg.stepT;
                leg.fx = lerp(leg.fromX, leg.tx, t); leg.fy = lerp(leg.fromY, leg.ty, t);
                leg.lift = sin(leg.stepT * PI) * 7 * SC;
            } else leg.lift = 0;
        });
    }
    
    function drawWeb() {
        CX.save(); 
        CX.lineCap = 'round';
        
        // Gorgeous 3D drop shadow effect on web strands!
        CX.shadowColor = 'rgba(0, 0, 0, 0.55)';
        CX.shadowBlur = 5;
        CX.shadowOffsetX = 2;
        CX.shadowOffsetY = 3;

        wStrands.forEach(function (st) {
            if (st.broken) {
                st.pts.forEach(function (p) { if (p.life <= 0) return; CX.beginPath(); CX.arc(p.x, p.y, 1.2, 0, TAU); CX.fillStyle = wAlpha(p.life * .7); CX.fill(); });
                var ft = st.breakT, ax = st.a.x, ay = st.a.y, bx = st.b.x, by = st.b.y, sag = dst(ax, ay, bx, by) * .15 * (1 + ft * 2);
                CX.beginPath(); CX.moveTo(ax, ay + ft * 40); CX.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag + ft * 60, bx, by + ft * 40);
                CX.lineWidth = .6; CX.strokeStyle = wAlpha(max(0, .35 * (1 - ft))); CX.stroke();
            } else {
                var ax2 = st.a.x, ay2 = st.a.y, bx2 = st.b.x, by2 = st.b.y;
                // Spiral lines drop organically, anchor lines are straight and robust!
                var sag2 = dst(ax2, ay2, bx2, by2) * (st.isSpiral ? 0.22 : 0.02);
                CX.beginPath(); 
                CX.moveTo(ax2, ay2); 
                CX.quadraticCurveTo((ax2 + bx2) / 2, (ay2 + by2) / 2 + sag2, bx2, by2);
                
                CX.lineWidth = (st.isSpiral ? 0.45 : 1.0) * SC; 
                CX.strokeStyle = wAlpha(st.isSpiral ? 0.40 : 0.68); 
                CX.stroke();

                // Draw shiny dewdrops or sticky nodes along the spiral strands!
                if (st.isSpiral && (st.a.x + st.b.x) % 7 < 1) {
                    var mx = (ax2 + bx2) / 2;
                    var my = (ay2 + by2) / 2 + sag2 * 0.75;
                    CX.beginPath();
                    CX.arc(mx, my, 1.2 * SC, 0, TAU);
                    CX.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    CX.fill();
                }
            }
        });
        CX.restore();
    }
    
    function drawLeg(sp, leg) {
        var sh = leg.def.sh, shW = rotV(sh[0], sh[1], sp.aim + PI / 2), sx = sp.x + shW[0], sy = sp.y + shW[1];
        var up = rotV(0, -1, sp.aim + PI / 2), fx = leg.fx - up[0] * (leg.lift || 0), fy = leg.fy - up[1] * (leg.lift || 0);
        var L = leg.def.l, l1 = L[0] + L[1], l2 = L[2], elb = ik2(sx, sy, fx, fy, l1, l2, leg.def.bend), ex = elb[0], ey = elb[1];
        var r = L[0] / l1, kx = sx + (ex - sx) * r, ky = sy + (ey - sy) * r;
        CX.lineCap = 'round';
        CX.beginPath(); CX.moveTo(ex, ey); CX.lineTo(fx, fy); CX.lineWidth = .85 * SC; CX.strokeStyle = cL; CX.stroke();
        CX.beginPath(); CX.moveTo(kx, ky); CX.lineTo(ex, ey); CX.lineWidth = 1.25 * SC; CX.strokeStyle = cD; CX.stroke();
        CX.beginPath(); CX.moveTo(sx, sy); CX.lineTo(kx, ky); CX.lineWidth = 1.6 * SC; CX.strokeStyle = cD; CX.stroke();
        CX.beginPath(); CX.arc(kx, ky, 1.4 * SC, 0, TAU); CX.fillStyle = cD; CX.fill();
        CX.beginPath(); CX.arc(ex, ey, 1.1 * SC, 0, TAU); CX.fillStyle = cL; CX.fill();
        var ca = atan2(fy - ey, fx - ex);
        for (var c = -1; c <= 1; c += 2) { CX.beginPath(); CX.moveTo(fx, fy); CX.lineTo(fx + cos(ca + c * .32) * 3.2 * SC, fy + sin(ca + c * .32) * 3.2 * SC); CX.lineWidth = .6 * SC; CX.strokeStyle = cD; CX.stroke(); }
    }
    
    function drawPalps(sp) {
        sp.palp.forEach(function (p) {
            var up = sp.aim + PI / 2, hf = rotV(0, -12 * SC, up), bx = sp.x + hf[0], by = sp.y + hf[1];
            var pA = up - PI / 2 + p.a, s1x = bx + cos(pA) * p.l, s1y = by + sin(pA) * p.l;
            var pA2 = pA + sin(sp.palpPh * 1.4 + p.a) * .45, s2x = s1x + cos(pA2) * p.sl, s2y = s1y + sin(pA2) * p.sl;
            CX.beginPath(); CX.moveTo(bx, by); CX.lineTo(s1x, s1y); CX.lineWidth = .9 * SC; CX.strokeStyle = cD; CX.lineCap = 'round'; CX.stroke();
            CX.beginPath(); CX.moveTo(s1x, s1y); CX.lineTo(s2x, s2y); CX.lineWidth = .6 * SC; CX.strokeStyle = cL; CX.stroke();
        });
    }
    
    function drawBody(sp) {
        CX.save(); CX.translate(sp.x, sp.y); CX.rotate(sp.aim + PI / 2);
        var S = SC, aW = 8 * S, aH = 11 * S * sp.abdS, aY = 10 * S;
        CX.beginPath(); CX.ellipse(0, aY, aW, aH, 0, 0, TAU); CX.fillStyle = CFG.color; CX.fill();
        CX.beginPath(); CX.ellipse(-2 * S, aY - 3 * S, 3 * S, 4 * S, -.4, 0, TAU); CX.fillStyle = 'rgba(' + (min(255, CR + 80)) + ',' + (min(255, CG + 80)) + ',' + (min(255, CB + 80)) + ',.14)'; CX.fill();
        CX.beginPath(); CX.ellipse(0, aY, 1.6 * S, aH * .82, 0, 0, TAU); CX.fillStyle = 'rgba(' + (max(0, CR - 35)) + ',' + (max(0, CG - 35)) + ',' + (max(0, CB - 35)) + ',.3)'; CX.fill();
        CX.beginPath(); CX.ellipse(0, 2.2 * S, 2.2 * S, 1.8 * S, 0, 0, TAU); CX.fillStyle = 'rgba(' + (max(0, CR - 28)) + ',' + (max(0, CG - 28)) + ',' + (max(0, CB - 28)) + ',1)'; CX.fill();
        CX.beginPath(); CX.ellipse(0, -5 * S, 6.5 * S, 8.5 * S, 0, 0, TAU); CX.fillStyle = 'rgba(' + (min(255, CR + 10)) + ',' + (min(255, CG + 10)) + ',' + (min(255, CB + 10)) + ',1)'; CX.fill();
        CX.beginPath(); CX.moveTo(0, -8 * S); CX.lineTo(0, -2 * S); CX.lineWidth = .6 * S; CX.strokeStyle = 'rgba(' + (max(0, CR - 40)) + ',' + (max(0, CG - 40)) + ',' + (max(0, CB - 40)) + ',.4)'; CX.lineCap = 'round'; CX.stroke();
        CX.beginPath(); CX.ellipse(0, -13 * S, 4.5 * S, 5 * S, 0, 0, TAU); CX.fillStyle = 'rgba(' + (min(255, CR + 6)) + ',' + (min(255, CG + 6)) + ',' + (min(255, CB + 6)) + ',1)'; CX.fill();
        var eyes = [[-2.8 * S, -16.8 * S, 1.3 * S, 1], [2.8 * S, -16.8 * S, 1.3 * S, 1], [-1.2 * S, -18.2 * S, 1 * S, 1], [1.2 * S, -18.2 * S, 1 * S, 1], [-4.2 * S, -15.2 * S, .65 * S, 0], [4.2 * S, -15.2 * S, .65 * S, 0], [-3.2 * S, -14.2 * S, .55 * S, 0], [3.2 * S, -14.2 * S, .55 * S, 0]];
        eyes.forEach(function (e) {
            CX.beginPath(); CX.arc(e[0], e[1], e[2], 0, TAU); CX.fillStyle = e[3] ? '#e6e6e6' : '#aaa'; CX.fill();
            CX.beginPath(); CX.arc(e[0] + .2 * S, e[1] + .2 * S, e[2] * .55, 0, TAU); CX.fillStyle = '#0d0d0d'; CX.fill();
            if (e[3]) { CX.beginPath(); CX.arc(e[0] - e[2] * .3, e[1] - e[2] * .3, e[2] * .26, 0, TAU); CX.fillStyle = 'rgba(255,255,255,.82)'; CX.fill(); }
        });
        [[-2.2 * S, 1], [2.2 * S, -1]].forEach(function (ch) {
            CX.beginPath(); CX.ellipse(ch[0], -20 * S, 1.5 * S, 2 * S, 0, 0, TAU); CX.fillStyle = 'rgba(' + (max(0, CR - 18)) + ',' + (max(0, CG - 18)) + ',' + (max(0, CB - 18)) + ',1)'; CX.fill();
            CX.beginPath(); CX.arc(ch[0] + ch[1] * .7 * S, -20.5 * S, 1.4 * S, PI * .5, PI * 1.45, ch[1] < 0); CX.lineWidth = S; CX.strokeStyle = 'rgba(' + (max(0, CR - 10)) + ',' + (max(0, CG - 10)) + ',' + (max(0, CB - 10)) + ',.9)'; CX.stroke();
        });
        var tipY = aY + aH - .3 * S;
        CX.beginPath(); CX.arc(-1.4 * S, tipY, 1.1 * S, 0, TAU); CX.arc(1.4 * S, tipY, 1.1 * S, 0, TAU); CX.fillStyle = 'rgba(' + (max(0, CR - 32)) + ',' + (max(0, CG - 32)) + ',' + (max(0, CB - 32)) + ',1)'; CX.fill();
        CX.restore();
    }
    
    function drawSpider(sp) {
        if (sp.dragLine) { CX.beginPath(); CX.moveTo(sp.dragLine.x, sp.dragLine.y); CX.lineTo(sp.x, sp.y); CX.lineWidth = .6; CX.strokeStyle = wAlpha(.4); CX.stroke(); }
        if (sp.state === ST.WEAVE && sp.weaveStart) {
            var wx = sp.weaveStart.x, wy = sp.weaveStart.y, mx = (wx + sp.x) * .5, my = (wy + sp.y) * .5 + dst(wx, wy, sp.x, sp.y) * .1;
            CX.beginPath(); CX.moveTo(wx, wy); CX.quadraticCurveTo(mx, my, sp.x, sp.y);
            CX.lineWidth = .7; CX.strokeStyle = wAlpha(.5); CX.setLineDash([3, 3]); CX.stroke(); CX.setLineDash([]);
        }
        [2, 3, 6, 7].forEach(function (i) { drawLeg(sp, sp.legs[i]); });
        drawBody(sp);
        [0, 1, 4, 5].forEach(function (i) { drawLeg(sp, sp.legs[i]); });
        drawPalps(sp);
    }
    
    var SPIDERS = [], obsT = 0, animationFrameId;
    
    function loop() {
        if (++obsT > 100) { rebObs(); obsT = 0; }
        updWeb(); 
        SPIDERS.forEach(updSpider);
        CX.clearRect(0, 0, VW, VH); 
        drawWeb(); 
        SPIDERS.forEach(drawSpider);
        animationFrameId = requestAnimationFrame(loop);
    }
    
    function init() {
        rebObs();
        var scrollY = window.scrollY;
        var viewWidth = window.innerWidth;
        
        // Spawn first spider in the current scroll viewport view so it's immediately seen inside the aquarium
        var s = mkSpider(100 + random() * (viewWidth - 200), scrollY + 20); 
        s.vy = .8; 
        enterSt(s, ST.EX); 
        SPIDERS.push(s);
        
        setTimeout(function () {
            rebObs(); 
            buildAllCornerWebs();
            var n = min(CFG.maxSpiders - 1, 2);
            for (var i = 0; i < n; i++) {
                var obs = OBS[floor(random() * OBS.length)]; 
                if (!obs) break;
                var corners = [[obs.l, obs.t], [obs.r, obs.t], [obs.l, obs.b], [obs.r, obs.b]], co = corners[floor(random() * 4)];
                var bx = clamp(co[0] + (co[0] === obs.l ? -30 : 30), 10, VW - 10), by = clamp(co[1] + (co[1] === obs.t ? -30 : 30), 10, VH - 10);
                if (!inObs(bx, by)) { 
                    var sp2 = mkSpider(bx, by); 
                    enterSt(sp2, random() < .5 ? ST.IDLE : ST.GROOM); 
                    SPIDERS.push(sp2); 
                }
            }
        }, 600);
        animationFrameId = requestAnimationFrame(loop);
    }
    
    // Scroll listener updates absolute height in case the document grows and recalculates physical positions
    var scrollListener = function () { 
        var currentHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
        if (currentHeight > VH) {
            VH = CV.height = currentHeight;
            CV.style.height = VH + 'px';
        }
        rebObs(); 
    };
    window.addEventListener('scroll', scrollListener, { passive: true });
    
    setTimeout(init, 200);

    return function destroy() {
        window.removeEventListener('resize', rszListener);
        window.removeEventListener('scroll', scrollListener);
        window.removeEventListener('mousemove', mouseMoveListener);
        window.removeEventListener('touchmove', touchMoveListener);
        cancelAnimationFrame(animationFrameId);
        if (CV && CV.parentNode) CV.parentNode.removeChild(CV);
    };
}