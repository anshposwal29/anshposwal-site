// =============================================================================
// visualisations.js — Prospect Theory Curve + Population Scatter
// =============================================================================

const container = d3.select("#vis-container");
const W = 760, H = 560;

const svg = container.append("svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "100%")
    .style("background", "transparent");

const defs = svg.append("defs");

// Arrow markers — one per colour
defs.append("marker").attr("id","arrowRed")
    .attr("viewBox","0 -4 8 8").attr("refX",7).attr("refY",0)
    .attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto")
    .append("path").attr("d","M0,-4L8,0L0,4").attr("fill","#E63946");

defs.append("marker").attr("id","arrowBlue")
    .attr("viewBox","0 -4 8 8").attr("refX",7).attr("refY",0)
    .attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto")
    .append("path").attr("d","M0,-4L8,0L0,4").attr("fill","#005BBB");

// =============================================================================
// ACT I — PROSPECT THEORY S-CURVE
// =============================================================================
const cx = W * 0.5, cy = H * 0.48;
const scaleX = 115, scaleY = 100;
const alpha = 0.88, beta = 0.88, lambda = 2.25;

function V(x) {
    return x >= 0
        ? Math.pow(x, alpha)          // logarithmic — gains: fast then flattens
        : -lambda * Math.pow(-x, beta); // steeper — losses: keeps dropping
}

const lineGen = d3.line().x(d => d.px).y(d => d.py).curve(d3.curveCatmullRom);

// ── Two separate curve datasets, split at reference point ────────────────────
// Gains: x = 0 → 3.5  (blue, logarithmic shape)
const gainsData = d3.range(0, 3.51, 0.04)
    .map(x => ({ px: cx + x * scaleX, py: cy - V(x) * scaleY }))
    .filter(d => d.px <= W - 20 && d.py >= 20);

// Losses: reversed so path STARTS at reference point (x=0) and goes left
// This means stroke-dashoffset animation reveals from reference point outward
const lossData = d3.range(0, -3.51, -0.04)
    .map(x => ({ px: cx + x * scaleX, py: cy - V(x) * scaleY }))
    .filter(d => d.px >= 20 && d.py <= H - 20);

// Layer groups
const axisGroup  = svg.append("g").attr("opacity", 0);
const curveGroup = svg.append("g");
const annotGroup = svg.append("g");
const pointGroup = svg.append("g");
const popGroup   = svg.append("g").attr("opacity", 0);
const labelGroup = svg.append("g").attr("opacity", 0);

// ── Axes ──────────────────────────────────────────────────────────────────────
axisGroup.append("line")
    .attr("x1", 30).attr("y1", cy)
    .attr("x2", W - 30).attr("y2", cy)
    .attr("stroke", "#ccc").attr("stroke-width", 1);

axisGroup.append("line")
    .attr("x1", cx).attr("y1", 20)
    .attr("x2", cx).attr("y2", H - 20)
    .attr("stroke", "#ccc").attr("stroke-width", 1);

// Axis labels — coloured to match their curve side
const monoStyle = (el, color) => el
    .attr("fill", color || "#aaa")
    .style("font-family", "'Roboto Mono', monospace")
    .style("font-size", "11px")
    .style("font-weight", "600");

monoStyle(axisGroup.append("text").attr("x", 52).attr("y", cy - 12).attr("text-anchor","middle"), "#E63946").text("Losses");
monoStyle(axisGroup.append("text").attr("x", W - 52).attr("y", cy - 12).attr("text-anchor","middle"), "#005BBB").text("Gains");
monoStyle(axisGroup.append("text").attr("x", cx + 10).attr("y", 34).attr("text-anchor","start"), "#aaa").text("Value ↑");

// Reference point dot + label
axisGroup.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 4)
    .attr("fill", "#aaa").attr("opacity", 0.6);
monoStyle(axisGroup.append("text").attr("x", cx + 8).attr("y", cy + 16).attr("text-anchor","start"), "#aaa")
    .text("Reference point");

// ── Two coloured curve paths ──────────────────────────────────────────────────
// Gains — blue
const gainPath = curveGroup.append("path")
    .datum(gainsData)
    .attr("d", lineGen)
    .attr("fill", "none")
    .attr("stroke", "#005BBB")
    .attr("stroke-width", 2.8)
    .attr("opacity", 0);

// Losses — red
const lossPath = curveGroup.append("path")
    .datum(lossData)
    .attr("d", lineGen)
    .attr("fill", "none")
    .attr("stroke", "#E63946")
    .attr("stroke-width", 2.8)
    .attr("opacity", 0);

// Animate both paths from reference point outward simultaneously
function animateCurve(cb) {
    const gainLen = gainPath.node().getTotalLength();
    const lossLen = lossPath.node().getTotalLength();

    // Gains draws left→right from reference point
    gainPath
        .attr("stroke-dasharray", `${gainLen} ${gainLen}`)
        .attr("stroke-dashoffset", gainLen)
        .attr("opacity", 1)
        .transition().duration(1800).ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0);

    // Loss path now starts at reference point and draws outward left
    // Same dashoffset pattern as gains: lossLen → 0 reveals from start of path
    lossPath
        .attr("stroke-dasharray", `${lossLen} ${lossLen}`)
        .attr("stroke-dashoffset", lossLen)
        .attr("opacity", 1)
        .transition().duration(1800).ease(d3.easeCubicInOut)
        .attr("stroke-dashoffset", 0)
        .on("end", cb || (() => {}));
}

// ── Annotations ───────────────────────────────────────────────────────────────
const lossAnnot = annotGroup.append("g").attr("opacity", 0);

const annotX = cx - scaleX * 2.0, annotY = cy + scaleY * 1.55;
lossAnnot.append("text")
    .attr("x", annotX).attr("y", annotY)
    .attr("text-anchor", "middle")
    .attr("fill", "#E63946")
    .style("font-family", "'Roboto Mono', monospace")
    .style("font-size", "11px")
    .text("losses feel ~2× more painful");

lossAnnot.append("line")
    .attr("x1", annotX + 30).attr("y1", annotY - 14)
    .attr("x2", cx - scaleX * 0.7).attr("y2", cy + scaleY * 0.75)
    .attr("stroke", "#E63946").attr("stroke-width", 1)
    .attr("marker-end", "url(#arrowRed)");

// Gains annotation
const gainAnnot = annotGroup.append("g").attr("opacity", 0);
const gannotX = cx + scaleX * 2.2, gannotY = cy - scaleY * 1.3;
gainAnnot.append("text")
    .attr("x", gannotX).attr("y", gannotY)
    .attr("text-anchor", "middle")
    .attr("fill", "#005BBB")
    .style("font-family", "'Roboto Mono', monospace")
    .style("font-size", "11px")
    .text("gains flatten over time");

gainAnnot.append("line")
    .attr("x1", gannotX - 30).attr("y1", gannotY + 14)
    .attr("x2", cx + scaleX * 0.9).attr("y2", cy - scaleY * 0.55)
    .attr("stroke", "#005BBB").attr("stroke-width", 1)
    .attr("marker-end", "url(#arrowBlue)");

// =============================================================================
// USER ANSWER POINTS
// =============================================================================
function drawUserPoints() {
    const r = window.userResponses;

    // Clamp vx so dots always stay on the visible curve portion
    // Gains: keep within 0.5–2.8, Losses: keep within -0.5 to -2.8
    const q1x = r.q1_gain === "left" ? 0.85 : 2.2;
    const q2x = r.q2_loss === "left" ? -0.85 : -2.2;

    // Colours: blue for gains (matches blue curve), amber for losses
    // Amber (#C8820A) sits clearly apart from red (#E63946) loss curve
    const pts = [
        { vx: q1x, label: r.q1_gain === "left" ? "Sure gain (Q1)" : "Gamble (Q1)", color: "#005BBB" },
        { vx: q2x, label: r.q2_loss === "left" ? "Sure loss (Q2)" : "Gamble (Q2)", color: "#E63946" }
    ];

    pts.forEach((p, i) => {
        const px = cx + p.vx * scaleX;
        // Clamp py to SVG bounds with padding
        const rawPy = cy - V(p.vx) * scaleY;
        const py = Math.max(30, Math.min(H - 30, rawPy));

        const g = pointGroup.append("g").attr("opacity", 0);

        // Drop line from axis to point
        g.append("line")
            .attr("x1", px).attr("y1", cy)
            .attr("x2", px).attr("y2", py)
            .attr("stroke", p.color).attr("stroke-width", 1.5)
            .attr("stroke-dasharray","3,3").attr("opacity", 0.6);

        // Dot — larger, clearly visible
        g.append("circle")
            .attr("cx", px).attr("cy", py).attr("r", 9)
            .attr("fill", p.color)
            .attr("stroke","#fff").attr("stroke-width", 2.5);

        // Label — above dot for gains, below for losses
        const lx = p.vx > 0 ? px + 14 : px - 14;
        const anchor = p.vx > 0 ? "start" : "end";
        const ly = p.vx > 0 ? py - 16 : py + 20;
        g.append("text")
            .attr("x", lx).attr("y", ly)
            .attr("text-anchor", anchor)
            .attr("fill", p.color)
            .style("font-family","'Roboto Mono', monospace")
            .style("font-size","10px").style("font-weight","600")
            .text(p.label);

        // Appear immediately — no big delay
        g.transition().delay(i * 200).duration(400).attr("opacity", 1);
    });

    // Loss aversion arc if they flipped
    if (r.q1_gain !== r.q2_loss) {
        const x1 = cx + q1x * scaleX, y1 = cy - V(q1x) * scaleY;
        const x2 = cx + q2x * scaleX, y2 = cy - V(q2x) * scaleY;
        const midY = Math.min(y1, y2) - scaleY * 1.4;

        pointGroup.append("path")
            .attr("d", `M${x1},${y1} Q${cx},${midY} ${x2},${y2}`)
            .attr("fill","none")
            .attr("stroke","#DAA520").attr("stroke-width",2)
            .attr("stroke-dasharray","5,4")
            .attr("opacity", 0)
            .transition().delay(1200).duration(800).attr("opacity", 0.9);

        pointGroup.append("text")
            .attr("x", cx).attr("y", midY - 10)
            .attr("text-anchor","middle")
            .attr("fill","#DAA520")
            .style("font-family","'Roboto Mono', monospace")
            .style("font-size","10px")
            .text("Loss Aversion — you flipped sides")
            .attr("opacity", 0)
            .transition().delay(1900).duration(600).attr("opacity", 1);
    }
}

// =============================================================================
// ACT II — POPULATION SCATTER
// Real research distributions:
//   q1 left  (safe gain)   : 80%
//   q2 right (gamble loss) : 70%
//   q3 left  (sunk cost)   : 65%
//   q4 left  (impatient)   : 72%
//   q5 left  (risk averse) : 68%
// =============================================================================
const N = 900;
const CLUSTERS = {
    rational:  { x: W*0.76, y: H*0.28, color:"#B8860B",  label:"Rational Actors (~15%)"  }, // gold
    lossAverse:{ x: W*0.48, y: H*0.68, color:"#E63946",  label:"Loss Averse (~55%)"       }, // red
    biased:    { x: W*0.22, y: H*0.38, color:"#005BBB",  label:"Fully Biased (~30%)"      }  // blue — third intro colour
};

function classify(p) {
    const lossAverse = p.q1 !== p.q2;
    const rational   = !lossAverse && p.q3==="right" && p.q4==="right" && p.q5==="right";
    if (rational)   return "rational";
    if (lossAverse) return "lossAverse";
    return "biased";
}

let population = [];
let popBuilt   = false;

function buildPopulation() {
    if (popBuilt) return;
    popBuilt = true;

    population = Array.from({ length: N }, () => {
        const p = {
            q1: Math.random() < 0.80 ? "left"  : "right",
            q2: Math.random() < 0.70 ? "right" : "left",
            q3: Math.random() < 0.65 ? "left"  : "right",
            q4: Math.random() < 0.72 ? "left"  : "right",
            q5: Math.random() < 0.68 ? "left"  : "right",
        };
        p.cluster = classify(p);
        // Start within SVG bounds — a central band
        p.x = W * 0.2 + Math.random() * W * 0.6;
        p.y = H * 0.2 + Math.random() * H * 0.6;
        return p;
    });

    // User dot
    const u = {
        q1: window.userResponses.q1_gain,
        q2: window.userResponses.q2_loss,
        q3: window.userResponses.q3_sunkcost,
        q4: window.userResponses.q4_time,
        q5: window.userResponses.q5_ev,
        isUser: true
    };
    u.cluster = classify(u);
    u.x = W * 0.5 + (Math.random()-0.5)*60;
    u.y = H * 0.5 + (Math.random()-0.5)*60;
    population.push(u);

    // Draw all dots
    popGroup.selectAll(".pop-dot")
        .data(population.filter(d => !d.isUser))
        .enter().append("circle")
        .attr("class","pop-dot")
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("r", 3.5)
        .attr("fill", d => CLUSTERS[d.cluster].color)
        .attr("opacity", 0);

    // User dot
    popGroup.append("circle")
        .attr("class","user-dot")
        .attr("cx", u.x).attr("cy", u.y)
        .attr("r", 8)
        .attr("fill","#FFD700")
        .attr("stroke","#fff").attr("stroke-width", 2.5)
        .attr("opacity", 0);
}

function scatterIn() {
    popGroup.transition().duration(400).attr("opacity", 1);
    popGroup.selectAll(".pop-dot")
        .transition().delay((d,i) => i * 0.5).duration(500)
        .attr("opacity", 0.38);
    popGroup.select(".user-dot")
        .transition().delay(500).duration(500).attr("opacity", 1);
}

function sortIntoClusters() {
    // Sort population dots
    popGroup.selectAll(".pop-dot")
        .transition()
        .delay((d, i) => i * 0.7)
        .duration(1100)
        .ease(d3.easeCubicInOut)
        .attr("cx", d => CLUSTERS[d.cluster].x + (Math.random()-0.5)*110)
        .attr("cy", d => CLUSTERS[d.cluster].y + (Math.random()-0.5)*80)
        .attr("opacity", 0.5);

    // User dot to its cluster
    const u = population[population.length - 1];
    const c = CLUSTERS[u.cluster];
    popGroup.select(".user-dot")
        .transition().delay(500).duration(1200).ease(d3.easeCubicInOut)
        .attr("cx", c.x + 20).attr("cy", c.y - 20);
}

function showClusterLabels() {
    Object.entries(CLUSTERS).forEach(([key, c]) => {
        labelGroup.append("text")
            .attr("x", c.x).attr("y", c.y - 58)
            .attr("text-anchor","middle")
            .attr("fill", c.color)
            .style("font-family","'Roboto Mono', monospace")
            .style("font-size","11px").style("font-weight","700")
            .text(c.label);

        labelGroup.append("line")
            .attr("x1", c.x).attr("y1", c.y - 52)
            .attr("x2", c.x).attr("y2", c.y - 38)
            .attr("stroke", c.color).attr("stroke-width",1).attr("opacity",0.4);
    });

    // "You" label
    const u = population[population.length - 1];
    const c = CLUSTERS[u.cluster];
    labelGroup.append("text")
        .attr("x", c.x + 32).attr("y", c.y - 28)
        .attr("fill","#FFD700")
        .style("font-family","'Roboto Mono', monospace")
        .style("font-size","10px")
        .text("← you");

    labelGroup.transition().duration(800).attr("opacity", 1);
}

// =============================================================================
// SCENE DIRECTOR — fully bidirectional
// Scrollama calls enterScene(index) on scroll down, exitScene(index) on scroll up
// =============================================================================

// Build population once and reuse
let popBuiltOnce = false;
function ensurePopulation() {
    if (!popBuiltOnce) { popBuiltOnce = true; buildPopulation(); }
}

// ── Helpers: show/hide Act I layers ──────────────────────────────────────────
function showCurve(instant) {
    const d = instant ? 0 : 700;
    axisGroup.transition().duration(d).attr("opacity", 1);
    curveGroup.transition().duration(d).attr("opacity", 1);
    annotGroup.transition().duration(d).attr("opacity", 1);
}
function hideCurve(instant) {
    const d = instant ? 0 : 700;
    axisGroup.transition().duration(d).attr("opacity", 0);
    curveGroup.transition().duration(d).attr("opacity", 0);
    annotGroup.transition().duration(d).attr("opacity", 0);
}
function showPoints(instant) {
    pointGroup.transition().duration(instant ? 0 : 600).attr("opacity", 1);
}
function hidePoints(instant) {
    pointGroup.transition().duration(instant ? 0 : 500).attr("opacity", 0);
}

// ── Helpers: show/hide Act II layers ─────────────────────────────────────────
function showPopulation(instant) {
    ensurePopulation();
    popGroup.transition().duration(instant ? 0 : 500).attr("opacity", 1);
    popGroup.selectAll(".pop-dot").transition().duration(instant ? 0 : 500).attr("opacity", 0.38);
    popGroup.select(".user-dot").transition().duration(instant ? 0 : 500).attr("opacity", 1);
}
function hidePopulation(instant) {
    popGroup.transition().duration(instant ? 0 : 600).attr("opacity", 0);
}

// Unsort — move dots back to their scatter positions
function unsortClusters() {
    const u = population[population.length - 1];
    popGroup.selectAll(".pop-dot")
        .transition().duration(900).ease(d3.easeCubicInOut)
        .attr("cx", d => d.x).attr("cy", d => d.y)
        .attr("opacity", 0.38);
    popGroup.select(".user-dot")
        .transition().duration(900).ease(d3.easeCubicInOut)
        .attr("cx", u.x).attr("cy", u.y);
    labelGroup.transition().duration(400).attr("opacity", 0);
}

// Track whether curve has been drawn yet (only animate once)
let curveAnimated  = false;
let pointsDrawn    = false;
let clusterSorted  = false;

// ── ENTER: scrolling down into a step ────────────────────────────────────────
window.enterScene = function(stepIndex, direction) {

    if (stepIndex === 1) {
        hidePopulation(false);
        showCurve(curveAnimated);
        // Only hide points when scrolling DOWN into step 1
        // (scrolling UP into step 1 from step 2 — exitScene(2,up) already hid them)
        if (direction === "down") hidePoints(true);

        if (!curveAnimated) {
            curveAnimated = true;
            axisGroup.attr("opacity", 0);
            curveGroup.attr("opacity", 0);
            annotGroup.attr("opacity", 0);
            axisGroup.transition().duration(600).attr("opacity", 1);
            setTimeout(() => animateCurve(() => {
                lossAnnot.transition().delay(200).duration(600).attr("opacity", 1);
                gainAnnot.transition().delay(400).duration(600).attr("opacity", 1);
            }), 400);
        }
    }

    if (stepIndex === 2) {
        hidePopulation(false);
        showCurve(true);
        if (!pointsDrawn) {
            // First time — only draw when going DOWN (entering, not passing through)
            if (direction === "down" || direction === undefined) {
                pointsDrawn = true;
                drawUserPoints();
            }
        } else {
            // Already drawn — show whenever we enter step 2, any direction
            showPoints(false);
        }
    }

    if (stepIndex === 3) {
        hideCurve(false);
        hidePoints(false);
        ensurePopulation();
        setTimeout(() => {
            showPopulation(false);
            // If coming back from step 4, unsort first
            if (clusterSorted) { clusterSorted = false; unsortClusters(); }
        }, 500);
    }

    if (stepIndex === 4) {
        hideCurve(true);
        hidePoints(true);
        ensurePopulation();
        showPopulation(true);
        if (!clusterSorted) {
            clusterSorted = true;
            setTimeout(() => {
                sortIntoClusters();
                setTimeout(showClusterLabels, 1500);
            }, 200);
        } else {
            // Already sorted — just show labels
            labelGroup.transition().duration(400).attr("opacity", 1);
        }
    }
};

// ── EXIT: scrolling back up out of a step ─────────────────────────────────────
window.exitScene = function(stepIndex, direction) {
    if (direction !== "up") return;  // only react to upward exits

    if (stepIndex === 2) {
        // Scrolled back above step 2 → hide user points, keep curve
        hidePoints(false);
    }

    if (stepIndex === 3) {
        // Scrolled back above step 3 → hide population, restore curve + points
        hidePopulation(false);
        showCurve(false);
        if (pointsDrawn) showPoints(false);
    }

    if (stepIndex === 4) {
        // Scrolled back above step 4 → unsort clusters, hide labels
        if (clusterSorted) { clusterSorted = false; unsortClusters(); }
    }
};

