// =============================================================================
// phase2-visualisations.js  — v2
// Section A: EV deviation chart (cream bg, correct sizing)
// Section B: Optimisation surface (marble steps properly sequenced)
// Section C: Stag Hunt payoff matrix + Hawk-Dove ESS bee swarm
// =============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — PROBABILITY TREE  (clean, well-spaced)
// ─────────────────────────────────────────────────────────────────────────────
let probTreeBuilt = false;

function buildProbTree() {
    const el = document.getElementById("vis-rational");
    if (!el || probTreeBuilt) return;
    probTreeBuilt = true;

    el.style.background   = "#F2EFE7";
    el.style.borderRadius = "12px";
    el.style.padding      = "1rem";

    // Tall canvas so nothing crowds
    const W = 460, H = 420;
    const svg = d3.select("#vis-rational").append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width","100%").style("height","auto");

    const m  = (el, sz, col) => el.style("font-family","'Roboto Mono', monospace")
                                    .style("font-size", sz||"11px").attr("fill", col||"#555");
    const ser = (el, sz, col) => el.style("font-family","'Lora', serif")
                                    .style("font-size", sz||"14px").attr("fill", col||"#1e1e1e");

    // Title
    m(svg.append("text").attr("x",W/2).attr("y",22).attr("text-anchor","middle"), "9px", "#aaa")
        .text("Expected Value — Q1");

    // Layout constants — generous spacing
    const rootX = W/2, rootY = 60;
    const aX = W*0.24, bX = W*0.76;
    const nodeY = 150;
    const aOutY = 270, bWinY = 250, bLoseY = 340;

    // ── Root ──
    svg.append("circle").attr("cx",rootX).attr("cy",rootY).attr("r",8)
        .attr("fill","#888").attr("stroke","#fff").attr("stroke-width",2);
    m(svg.append("text").attr("x",rootX).attr("y",rootY-14).attr("text-anchor","middle"), "9px")
        .text("Decision point");

    const line = (x1,y1,x2,y2,col,delay) =>
        svg.append("line").attr("x1",x1).attr("y1",y1).attr("x2",x2).attr("y2",y2)
           .attr("stroke",col).attr("stroke-width",1.8).attr("opacity",0)
           .transition().delay(delay||0).duration(500).attr("opacity",0.9);

    // Branch lines
    line(rootX, rootY+8, aX, nodeY-10, "#E63946", 200);
    line(rootX, rootY+8, bX, nodeY-10, "#005BBB", 200);

    // ── Option A: Sure $500 ──
    svg.append("circle").attr("cx",aX).attr("cy",nodeY).attr("r",10)
        .attr("fill","#E63946").attr("stroke","#fff").attr("stroke-width",2).attr("opacity",0)
        .transition().delay(350).duration(400).attr("opacity",1);
    m(svg.append("text").attr("x",aX).attr("y",nodeY-18).attr("text-anchor","middle"), "10px", "#E63946")
        .attr("opacity",0).transition().delay(350).duration(400).attr("opacity",1)
        .text("Option A");
    ser(svg.append("text").attr("x",aX).attr("y",nodeY+22).attr("text-anchor","middle"), "12px", "#E63946")
        .attr("opacity",0).transition().delay(350).duration(400).attr("opacity",1)
        .text("Sure $500");

    // A leaf line
    line(aX, nodeY+30, aX, aOutY-14, "#E63946", 550);
    // Outcome box A
    svg.append("rect").attr("x",aX-48).attr("y",aOutY-14).attr("width",96).attr("height",48)
        .attr("rx",8).attr("fill","rgba(243, 79, 79, 0.1)").attr("stroke","#E63946").attr("stroke-width",1.2)
        .attr("opacity",0).transition().delay(700).duration(400).attr("opacity",1);
    ser(svg.append("text").attr("x",aX).attr("y",aOutY+10).attr("text-anchor","middle"), "18px", "#E63946")
        .attr("opacity",0).transition().delay(700).duration(400).attr("opacity",1).text("$500");
    m(svg.append("text").attr("x",aX).attr("y",aOutY+26).attr("text-anchor","middle"), "9px", "#df7979ff")
        .attr("opacity",0).transition().delay(700).duration(400).attr("opacity",1).text("100% · EV = $500");

    // ── Option B: Gamble ──
    svg.append("circle").attr("cx",bX).attr("cy",nodeY).attr("r",10)
        .attr("fill","#005BBB").attr("stroke","#fff").attr("stroke-width",2).attr("opacity",0)
        .transition().delay(350).duration(400).attr("opacity",1);
    m(svg.append("text").attr("x",bX).attr("y",nodeY-18).attr("text-anchor","middle"), "10px", "#005BBB")
        .attr("opacity",0).transition().delay(350).duration(400).attr("opacity",1).text("Option B");
    ser(svg.append("text").attr("x",bX).attr("y",nodeY+22).attr("text-anchor","middle"), "12px", "#005BBB")
        .attr("opacity",0).transition().delay(350).duration(400).attr("opacity",1).text("Gamble");

    // B sub-branches
    line(bX, nodeY+30, bX-38, bWinY-14, "#005BBB", 550);
    line(bX, nodeY+30, bX+38, bLoseY-14, "#aaa",    550);

    // Win box
    svg.append("rect").attr("x",bX-86).attr("y",bWinY-14).attr("width",96).attr("height",48)
        .attr("rx",8).attr("fill","rgba(0,91,187,0.1)").attr("stroke","#005BBB").attr("stroke-width",1.2)
        .attr("opacity",0).transition().delay(750).duration(400).attr("opacity",1);
    ser(svg.append("text").attr("x",bX-38).attr("y",bWinY+10).attr("text-anchor","middle"), "18px", "#005BBB")
        .attr("opacity",0).transition().delay(750).duration(400).attr("opacity",1).text("$1,000");
    m(svg.append("text").attr("x",bX-38).attr("y",bWinY+26).attr("text-anchor","middle"), "9px", "#aaa")
        .attr("opacity",0).transition().delay(750).duration(400).attr("opacity",1).text("50% chance");

    // Lose box
    svg.append("rect").attr("x",bX-10).attr("y",bLoseY-14).attr("width",96).attr("height",48)
        .attr("rx",8).attr("fill","rgba(0,0,0,0.04)").attr("stroke","#bbb").attr("stroke-width",1.2)
        .attr("opacity",0).transition().delay(850).duration(400).attr("opacity",1);
    ser(svg.append("text").attr("x",bX+38).attr("y",bLoseY+10).attr("text-anchor","middle"), "18px", "#888")
        .attr("opacity",0).transition().delay(850).duration(400).attr("opacity",1).text("$0");
    m(svg.append("text").attr("x",bX+38).attr("y",bLoseY+26).attr("text-anchor","middle"), "9px", "#aaa")
        .attr("opacity",0).transition().delay(850).duration(400).attr("opacity",1).text("50% chance");

    // EV label for B — centred below both leaves
    m(svg.append("text").attr("x",bX).attr("y",H-18).attr("text-anchor","middle"), "10px", "#005BBB")
        .attr("opacity",0).transition().delay(1100).duration(500).attr("opacity",1)
        .text("EV = 0.5 × $1,000 + 0.5 × $0 = $500");

    // Equality bridge — drawn at midpoint between A outcome box and B-win box
    // Both outcome boxes bottom at ~aOutY+34, so draw bridge at aOutY+50 (clear below)
    const bridgeY = aOutY + 52;
    svg.append("line")
        .attr("x1", aX).attr("y1", bridgeY)
        .attr("x2", bX-38).attr("y2", bridgeY)
        .attr("stroke","#DAA520").attr("stroke-width",1.5).attr("stroke-dasharray","4,3")
        .attr("opacity",0).transition().delay(1300).duration(500).attr("opacity",0.7);
    m(svg.append("text").attr("x",(aX + bX-38)/2).attr("y", bridgeY - 6).attr("text-anchor","middle"), "9px", "#DAA520")
        .attr("opacity",0).transition().delay(1400).duration(500).attr("opacity",1)
        .text("← same EV = $500 →");
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — DEVIATION LOLLIPOP CHART
// Each row: rational anchor at centre, your choice as a dot pulled left/right
// ─────────────────────────────────────────────────────────────────────────────
let evBuilt = false;

function buildEVChart() {
    const el = document.getElementById("vis-rational");
    if (!el || evBuilt) return;
    evBuilt = true;

    el.innerHTML = "";
    el.style.background   = "#F2EFE7";
    el.style.borderRadius = "12px";
    el.style.padding      = "1.2rem 0.8rem";

    const r = window.userResponses;

    // Each row: deviation from -1 (irrational left) to 0 (rational) to +1 (irrational right)
    // We map deviation direction: left = biased left, right = biased right, 0 = rational
    const rows = [
        { q: "Q1 — Gain",
          deviation:  r.q1_gain === "left" ? -0.15 : 0.15,  // both EV=$500, slight nudge to show choice
          match: true,  // Q1 is always considered "fine" since EVs are equal
          yourLabel:  r.q1_gain === "left" ? "Sure $500" : "Gamble $1k",
          rLabel:     "EV = $500 either way" },
        { q: "Q2 — Loss",
          deviation:  (r.q2_loss !== r.q1_gain) ? (r.q2_loss === "right" ? 0.7 : -0.7) : 0,
          match:      r.q2_loss === r.q1_gain,
          yourLabel:  r.q2_loss === "left" ? "Sure −$500" : "Gamble −$1k",
          rLabel:     "Consistent with Q1" },
        { q: "Q3 — Sunk Cost",
          deviation:  r.q3_sunkcost === "right" ? 0 : -0.8,
          match:      r.q3_sunkcost === "right",
          yourLabel:  r.q3_sunkcost === "right" ? "Stay Home ✓" : "Go (suffer) ✗",
          rLabel:     "Stay Home" },
        { q: "Q4 — Time",
          deviation:  r.q4_time === "right" ? 0 : -0.85,
          match:      r.q4_time === "right",
          yourLabel:  r.q4_time === "right" ? "$150/year ✓" : "$100 now ✗",
          rLabel:     "$150 in a year" },
        { q: "Q5 — EV",
          deviation:  r.q5_ev === "right" ? 0 : -0.75,
          match:      r.q5_ev === "right",
          yourLabel:  r.q5_ev === "right" ? "Gamble $60 EV ✓" : "Sure $40 ✗",
          rLabel:     "Gamble ($60 EV)" }
    ];

    const W = 420, H = 310;
    const m  = { top: 36, right: 20, bottom: 28, left: 100 };
    const iW = W - m.left - m.right;
    const iH = H - m.top  - m.bottom;

    const svg = d3.select("#vis-rational").append("svg")
        .attr("viewBox", `0 0 ${W} ${H}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width","100%").style("height","auto");

    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // Title
    svg.append("text").attr("x", W/2).attr("y", 18).attr("text-anchor","middle")
        .attr("fill","#aaa").style("font-family","'Roboto Mono',monospace").style("font-size","9px")
        .style("letter-spacing","2px").style("text-transform","uppercase")
        .text("Your deviation from the rational baseline");

    // Band scale for rows
    const y = d3.scaleBand().domain(rows.map(d=>d.q)).range([0, iH]).padding(0.38);
    // X: -1 = far irrational left, 0 = rational centre, +1 = far irrational right
    const x = d3.scaleLinear().domain([-1, 1]).range([0, iW]);

    // Centre line (rational baseline)
    g.append("line")
        .attr("x1", x(0)).attr("y1", 0)
        .attr("x2", x(0)).attr("y2", iH)
        .attr("stroke","#DAA520").attr("stroke-width",1.5)
        .attr("stroke-dasharray","4,3").attr("opacity",0.5);

    // Baseline label
    g.append("text").attr("x", x(0)).attr("y", iH + 18)
        .attr("text-anchor","middle").attr("fill","#DAA520")
        .style("font-family","'Roboto Mono',monospace").style("font-size","8px")
        .text("Rational");

    // Row backgrounds
    g.selectAll(".lp-bg").data(rows).enter().append("rect")
        .attr("x", 0).attr("y", d => y(d.q))
        .attr("width", iW).attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", d => d.match ? "rgba(255,215,0,0.04)" : "rgba(230,57,70,0.05)");

    // Q labels
    g.selectAll(".lp-label").data(rows).enter().append("text")
        .attr("class","lp-label")
        .attr("x", -8).attr("y", d => y(d.q) + y.bandwidth()/2)
        .attr("text-anchor","end").attr("dominant-baseline","middle")
        .attr("fill","#666").style("font-family","'Roboto Mono',monospace").style("font-size","9px")
        .text(d => d.q);

    // Stem (horizontal line from anchor to dot)
    const stems = g.selectAll(".lp-stem").data(rows).enter().append("line")
        .attr("class","lp-stem")
        .attr("x1", x(0)).attr("y1", d => y(d.q) + y.bandwidth()/2)
        .attr("x2", x(0)).attr("y2", d => y(d.q) + y.bandwidth()/2)
        .attr("stroke", d => d.match ? "#DAA520" : "#E63946")
        .attr("stroke-width", 2).attr("opacity", 0.7);

    stems.transition().duration(700).delay((d,i) => i*100 + 200)
        .attr("x2", d => x(d.deviation));

    // Rational anchor dot (teal, always at centre)
    g.selectAll(".lp-anchor").data(rows).enter().append("circle")
        .attr("class","lp-anchor")
        .attr("cx", x(0)).attr("cy", d => y(d.q) + y.bandwidth()/2)
        .attr("r", 5).attr("fill","#DAA520").attr("opacity",0.6)
        .attr("stroke","#fff").attr("stroke-width",1.5);

    // Your choice dot (animated)
    const dots = g.selectAll(".lp-dot").data(rows).enter().append("circle")
        .attr("class","lp-dot")
        .attr("cx", x(0)).attr("cy", d => y(d.q) + y.bandwidth()/2)
        .attr("r", 0)
        .attr("fill", d => d.match ? "#DAA520" : "#E63946")
        .attr("stroke","#fff").attr("stroke-width",2);

    dots.transition().duration(500).delay((d,i) => i*100 + 150)
        .attr("r", 8)
        .transition().duration(600).delay((d,i) => i*100 + 300).ease(d3.easeCubicOut)
        .attr("cx", d => x(d.deviation));

    // Your choice label (appears at dot position)
    g.selectAll(".lp-your-label").data(rows).enter().append("text")
        .attr("class","lp-your-label")
        .attr("x", d => x(d.deviation) + (d.deviation >= 0 ? 12 : -12))
        .attr("y", d => y(d.q) + y.bandwidth()/2 - 12)
        .attr("text-anchor", d => d.deviation >= 0 ? "start" : "end")
        .attr("fill", d => d.match ? "#DAA520" : "#E63946")
        .style("font-family","'Roboto Mono',monospace").style("font-size","8px").style("font-weight","700")
        .attr("opacity",0).text(d => d.yourLabel)
        .transition().delay((d,i) => i*100 + 800).duration(400).attr("opacity",1);
}

function hideEVChart() {
    const el = document.getElementById("vis-rational");
    if (el) el.style.opacity = "0";
}
function showEVChart() {
    const el = document.getElementById("vis-rational");
    if (el) { el.style.opacity = "1"; el.style.transition = "opacity 0.5s"; }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — OPTIMISATION SURFACE + MARBLE
// ─────────────────────────────────────────────────────────────────────────────
let surfaceBuilt    = false;
let marbleInterval  = null;
let secondAdded     = false;

function buildSurface() {
    const el = document.getElementById("vis-surface");
    if (!el || surfaceBuilt) return;
    surfaceBuilt = true;

    el.style.background   = "#F2EFE7";
    el.style.borderRadius = "12px";
    el.style.overflow     = "hidden";

    const W = 440, H = 380;
    const svg = d3.select("#vis-surface").append("svg")
        .attr("viewBox",`0 0 ${W} ${H}`)
        .attr("preserveAspectRatio","xMidYMid meet")
        .style("width","100%").style("height","auto");

    const GRID = 60;
    const values = [];
    for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
            const nx = i/GRID, ny = j/GRID;
            const g1 = -2.4 * Math.exp(-((nx-0.28)**2 + (ny-0.38)**2)/0.022);
            const g2 = -1.5 * Math.exp(-((nx-0.70)**2 + (ny-0.64)**2)/0.018);
            const noise = 0.25 * Math.sin(nx*14) * Math.cos(ny*11);
            values.push(g1 + g2 + noise + 2.5);
        }
    }

    const contourData = d3.contours()
        .size([GRID, GRID])
        .thresholds(d3.range(0, 3.8, 0.15))(values);

    const proj = d3.geoIdentity().scale(W/GRID).translate([0,0]);
    const cScale = d3.scaleSequential().domain([3.8, 0]).interpolator(d3.interpolateRgb("#F2EFE7", "#005f5f"));

    const contourGroup = svg.append("g");
    contourGroup.selectAll("path")
        .data(contourData)
        .enter().append("path")
        .attr("d", d3.geoPath(proj))
        .attr("fill", d => cScale(d.value))
        .attr("stroke","rgba(255,255,255,0.2)")
        .attr("stroke-width",0.4)
        .attr("opacity",0)
        .transition().duration(1000).delay((d,i) => i*14)
        .attr("opacity",0.92);

    // Labels
    const lbl = (t,x,y) => svg.append("text")
        .attr("x",x).attr("y",y).attr("text-anchor","middle")
        .attr("fill","rgba(0,0,0,0.5)")
        .style("font-family","'Roboto Mono', monospace")
        .style("font-size","9px").text(t);
    lbl("global min ★", W*0.27, H*0.44);
    lbl("local min",    W*0.70, H*0.60);

    // Marble — warm coral, distinct from the teal surface, fun and visible
    const marble = svg.append("circle").attr("r",8)
        .attr("fill","#E63946").attr("stroke","#fff").attr("stroke-width",2.5)
        .attr("opacity",0);

    // Gradient descent
    function gd(sx, sy, lr, steps) {
        const path = [{x:sx, y:sy}];
        let x=sx, y=sy;
        const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
        const idx=(px,py)=>clamp(Math.floor(py),0,GRID-1)*GRID+clamp(Math.floor(px),0,GRID-1);
        for (let s=0; s<steps; s++) {
            const ix=Math.floor(x*GRID), iy=Math.floor(y*GRID);
            const dx=(values[idx(ix+1,iy)]-values[idx(ix-1,iy)])/2;
            const dy=(values[idx(ix,iy+1)]-values[idx(ix,iy-1)])/2;
            x=clamp(x-lr*dx,0.02,0.98);
            y=clamp(y-lr*dy,0.02,0.98);
            path.push({x,y});
            if (dx*dx+dy*dy<0.00005) break;
        }
        return path;
    }

    window._runMarble = function(sx, sy) {
        svg.selectAll(".marble-trail").remove();
        const path = gd(sx, sy, 0.08, 140);
        const line = d3.line().x(d=>d.x*W).y(d=>d.y*H).curve(d3.curveCatmullRom);

        const trail = svg.append("path").attr("class","marble-trail")
            .datum(path).attr("d",line)
            .attr("fill","none").attr("stroke","rgba(230,57,70,0.45)")
            .attr("stroke-width",1.5)
            .attr("stroke-dasharray", function(){ const l=this.getTotalLength(); return `${l} ${l}`; })
            .attr("stroke-dashoffset", function(){ return this.getTotalLength(); });

        marble.attr("cx",sx*W).attr("cy",sy*H - 28).attr("r",13).attr("opacity",1)
            .transition().duration(450).ease(d3.easeBounceOut)
            .attr("cy",sy*H).attr("r",8);

        let i=0;
        clearInterval(marbleInterval);
        marbleInterval = setInterval(()=>{
            if(i>=path.length){ clearInterval(marbleInterval); return; }
            marble.attr("cx",path[i].x*W).attr("cy",path[i].y*H);
            i++;
        },28);

        trail.transition().duration(path.length*28).ease(d3.easeLinear).attr("stroke-dashoffset",0);
    };

    // Step 11 — second agent + dramatic surface shift
    // No guard — can be called repeatedly on scroll back/forward
    let marble2 = null;
    let int2     = null;

    window._addSecondMarble = function() {
        // Clean up previous run
        if (marble2) marble2.remove();
        svg.selectAll(".agent2-trail").remove();
        svg.selectAll(".shift-label").remove();
        if (int2) clearInterval(int2);

        // Reveal a dramatically shifted landscape by overlaying new contours
        // Build shifted values — global min jumps to opposite corner
        const shiftedValues = [];
        for (let jj = 0; jj < GRID; jj++) {
            for (let ii = 0; ii < GRID; ii++) {
                const nx = ii/GRID, ny = jj/GRID;
                // Shift: new global min at (0.72, 0.28), old one shrinks
                const g1new = -2.6 * Math.exp(-((nx-0.72)**2 + (ny-0.28)**2)/0.022);
                const g2new = -0.9 * Math.exp(-((nx-0.28)**2 + (ny-0.38)**2)/0.018);
                const noise = 0.25 * Math.sin(nx*14) * Math.cos(ny*11);
                shiftedValues.push(g1new + g2new + noise + 2.5);
            }
        }

        const shiftedContours = d3.contours().size([GRID,GRID])
            .thresholds(d3.range(0,3.8,0.15))(shiftedValues);

        // Fade in shifted overlay
        const shiftGroup = svg.append("g").attr("class","shift-label").attr("opacity",0);
        shiftGroup.selectAll("path")
            .data(shiftedContours).enter().append("path")
            .attr("d", d3.geoPath(proj))
            .attr("fill", d => cScale(d.value))
            .attr("stroke","rgba(255,255,255,0.15)")
            .attr("stroke-width",0.4);

        // Fade: original fades out, shifted fades in
        contourGroup.transition().duration(900).attr("opacity",0.15);
        shiftGroup.transition().duration(900).attr("opacity",0.92);

        // Update labels
        svg.selectAll(".lbl-global").text("new global min ★");
        shiftGroup.append("text")
            .attr("x",W*0.72).attr("y",H*0.32).attr("text-anchor","middle")
            .attr("fill","rgba(0,0,0,0.5)")
            .style("font-family","'Roboto Mono', monospace").style("font-size","9px")
            .text("new global min ★");
        shiftGroup.append("text")
            .attr("x",W*0.28).attr("y",H*0.44).attr("text-anchor","middle")
            .attr("fill","rgba(0,0,0,0.35)")
            .style("font-family","'Roboto Mono', monospace").style("font-size","9px")
            .text("old min (now shallow)");

        // Annotation
        const ann = svg.append("text").attr("class","shift-label")
            .attr("x",W/2).attr("y",18).attr("text-anchor","middle")
            .attr("fill","#b03a2e")
            .style("font-family","'Roboto Mono', monospace").style("font-size","10px")
            .attr("opacity",0).text("Agent 2 appears — landscape shifts dramatically");
        ann.transition().delay(500).duration(600).attr("opacity",1);

        // Blue marble enters and rolls to new minimum
        marble2 = svg.append("circle").attr("r",8)
            .attr("fill","#005BBB").attr("stroke","#fff").attr("stroke-width",2.5)
            .attr("cx",W*0.82).attr("cy",H*0.82).attr("opacity",0);
        marble2.transition().delay(300).duration(500).attr("opacity",1);

        // gradient descent on shifted surface
        function gdShifted(sx,sy,lr,steps) {
            const path = [{x:sx,y:sy}];
            let x=sx, y=sy;
            const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
            const idx=(px,py)=>clamp(Math.floor(py),0,GRID-1)*GRID+clamp(Math.floor(px),0,GRID-1);
            for (let s=0; s<steps; s++) {
                const ix=Math.floor(x*GRID), iy=Math.floor(y*GRID);
                const dx=(shiftedValues[idx(ix+1,iy)]-shiftedValues[idx(ix-1,iy)])/2;
                const dy=(shiftedValues[idx(ix,iy+1)]-shiftedValues[idx(ix,iy-1)])/2;
                x=clamp(x-lr*dx,0.02,0.98);
                y=clamp(y-lr*dy,0.02,0.98);
                path.push({x,y});
                if (dx*dx+dy*dy<0.00005) break;
            }
            return path;
        }

        setTimeout(() => {
            const path2pts = gdShifted(0.82,0.82,0.07,130);
            const line2 = d3.line().x(d=>d.x*W).y(d=>d.y*H).curve(d3.curveCatmullRom);
            svg.append("path").attr("class","agent2-trail")
                .datum(path2pts).attr("d",line2)
                .attr("fill","none").attr("stroke","rgba(0,91,187,0.4)").attr("stroke-width",1.5)
                .attr("stroke-dasharray",function(){const l=this.getTotalLength();return `${l} ${l}`;})
                .attr("stroke-dashoffset",function(){return this.getTotalLength();})
                .transition().duration(path2pts.length*30).ease(d3.easeLinear).attr("stroke-dashoffset",0);

            let j2=0;
            int2 = setInterval(()=>{
                if(j2>=path2pts.length){clearInterval(int2);return;}
                marble2.attr("cx",path2pts[j2].x*W).attr("cy",path2pts[j2].y*H);
                j2++;
            },30);
        }, 600);
    };

    // Auto-start: wait for contour animation, then drop marble into local min
    setTimeout(()=> window._runMarble(0.70, 0.64), 1600);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C — HAWK-DOVE ESS + STAG HUNT PAYOFF MATRIX
// ─────────────────────────────────────────────────────────────────────────────
// Hawk-Dove ESS parameters
// V = resource value, C = cost of fighting
// ESS frequency of Hawks = V/C
// With V=2, C=4: ESS = 0.5 (50% Hawks at stable equilibrium)
// Payoffs: [Hawk vs Hawk]=((V-C)/2)=-1, [Hawk vs Dove]=V=2,
//          [Dove vs Hawk]=0,              [Dove vs Dove]=V/2=1

const HD = {
    V: 2, C: 4,
    payoff(mine, theirs) {
        if (mine==="hawk"  && theirs==="hawk")  return (this.V - this.C)/2;  // -1
        if (mine==="hawk"  && theirs==="dove")  return this.V;               //  2
        if (mine==="dove"  && theirs==="hawk")  return 0;                    //  0
        if (mine==="dove"  && theirs==="dove")  return this.V/2;             //  1
    },
    get ess() { return this.V / this.C; } // 0.5
};

const HAWK_COLOR = "#E63946";
const DOVE_COLOR = "#005BBB";
const N_HD = 200;

let hdBuilt    = false;
let hdRunning  = false;
let hdInterval = null;
let hdAgents   = [];
let hdRound    = 0;
let hdSvg, hdSim;

function buildHawkDove() {
    const el = document.getElementById("vis-stag");
    if (!el || hdBuilt) return;
    hdBuilt = true;

    el.style.background   = "#F2EFE7";
    el.style.borderRadius = "12px";
    el.style.overflow     = "hidden";

    const ESS_PCT = Math.round(HD.ess * 100);

    el.innerHTML = `
    <div id="hd-matrix-intro" style="
        display:flex;flex-direction:column;justify-content:center;
        padding:2rem 1.8rem;background:#F2EFE7;border-radius:12px;
        width:100%;height:100%;box-sizing:border-box;gap:1.4rem;
    ">
        <div style="font-family:'Roboto Mono',monospace;font-size:0.62rem;letter-spacing:4px;text-transform:uppercase;color:#888;text-align:center;">
            Hawk-Dove Payoff Matrix
        </div>

        <div style="display:grid;grid-template-columns:90px 1fr 1fr;grid-template-rows:44px 1fr 1fr;gap:8px;flex:1;">
            <!-- top-left corner -->
            <div></div>
            <!-- column headers -->
            <div style="display:flex;align-items:center;justify-content:center;background:#F2EFE7;border-radius:8px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#E63946;letter-spacing:1px;">They: Hawk</div>
            <div style="display:flex;align-items:center;justify-content:center;background:#F2EFE7;border-radius:8px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#005BBB;letter-spacing:1px;">They: Dove</div>
            <!-- row 1 header -->
            <div style="display:flex;align-items:center;justify-content:flex-end;padding-right:10px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#E63946;">You: Hawk</div>
            <!-- cell HH -->
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(230,57,70,0.08);border:2px solid #E63946;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#E63946;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">−1, −1</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">Both fight — costly</div>
            </div>
            <!-- cell HD -->
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(0,91,187,0.06);border:2px solid #005BBB;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#005BBB;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">+2, 0</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">Hawk wins resource</div>
            </div>
            <!-- row 2 header -->
            <div style="display:flex;align-items:center;justify-content:flex-end;padding-right:10px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#005BBB;">You: Dove</div>
            <!-- cell DH -->
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(0,91,187,0.06);border:2px solid #005BBB;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#005BBB;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">0, +2</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">Dove yields</div>
            </div>
            <!-- cell DD -->
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,215,0,0.06);border:2px solid #DAA520;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#DAA520;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">+1, +1</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">Share resource</div>
            </div>
        </div>

        <div style="padding:0.7rem 1rem;background:rgba(176,58,46,0.06);border-left:3px solid #b03a2e;font-family:'Roboto Mono',monospace;font-size:0.7rem;color:#b03a2e;line-height:1.6;">
            ESS = V/C = 50% Hawks — neither pure strategy dominates
        </div>
    </div>

    <div id="hd-simulation" style="display:none;flex-direction:column;gap:0.8rem;">
    <div id="stag-controls">
        <div class="stag-control-row">
            <span class="stag-label">Starting Hawks %</span>
            <input type="range" class="stag-slider" id="coop-slider" min="0" max="100" value="50">
            <span class="stag-value" id="coop-val">50%</span>
        </div>
        <div class="stag-control-row">
            <span class="stag-label">Speed</span>
            <input type="range" class="stag-slider" id="speed-slider" min="1" max="6" value="2">
            <span class="stag-value" id="speed-val">2×</span>
        </div>
        <div id="stag-btn-row">
            <button class="stag-btn teal" id="stag-play">▶ Play</button>
            <button class="stag-btn" id="stag-pause">⏸ Pause</button>
            <button class="stag-btn" id="stag-reset">↺ Reset</button>
        </div>
    </div>

    <div id="stag-stats">
        <div class="stag-stat">
            <div class="stag-stat-val" style="color:#E63946" id="stat-hawk">0</div>
            <div class="stag-stat-label">Hawks</div>
        </div>
        <div class="stag-stat">
            <div class="stag-stat-val" style="color:#005BBB" id="stat-dove">0</div>
            <div class="stag-stat-label">Doves</div>
        </div>
        <div class="stag-stat">
            <div class="stag-stat-val round-col" id="stat-round">0</div>
            <div class="stag-stat-label">Round</div>
        </div>
        <div class="stag-stat">
            <div class="stag-stat-val" style="color:#888;font-size:0.9rem" id="stat-ess">ESS: ${ESS_PCT}%</div>
            <div class="stag-stat-label">Target</div>
        </div>
    </div>

    <div id="stag-svg-wrap"></div>

    <div id="payoff-matrix" class="visible">
        <div class="matrix-title">Hawk-Dove Payoffs &nbsp;·&nbsp; ESS = V/C = ${HD.V}/${HD.C} = ${ESS_PCT}% Hawks</div>
        <div class="matrix-grid">
            <div></div>
            <div class="matrix-header" style="color:#E63946">They: Hawk</div>
            <div class="matrix-header" style="color:#005BBB">They: Dove</div>
            <div class="matrix-header" style="color:#E63946">You: Hawk</div>
            <div class="matrix-cell" id="cell-hh"><strong>${(HD.V-HD.C)/2}, ${(HD.V-HD.C)/2}</strong>Both fight — costly</div>
            <div class="matrix-cell" id="cell-hd"><strong>${HD.V}, 0</strong>Hawk wins resource</div>
            <div class="matrix-header" style="color:#005BBB">You: Dove</div>
            <div class="matrix-cell" id="cell-dh"><strong>0, ${HD.V}</strong>Dove yields</div>
            <div class="matrix-cell" id="cell-dd"><strong>${HD.V/2}, ${HD.V/2}</strong>Share resource</div>
        </div>
    </div>
    </div><!-- end hd-simulation -->
    `;

    const wrap = document.getElementById("stag-svg-wrap");
    const W = 420, H = 180;

    hdSvg = d3.select("#stag-svg-wrap").append("svg")
        .attr("viewBox",`0 0 ${W} ${H}`)
        .attr("preserveAspectRatio","xMidYMid meet")
        .style("width","100%");

    // ESS target line
    hdSvg.append("line")
        .attr("x1", W*HD.ess).attr("y1", 0)
        .attr("x2", W*HD.ess).attr("y2", H)
        .attr("stroke","#888").attr("stroke-width",1)
        .attr("stroke-dasharray","3,3");

    hdSvg.append("text")
        .attr("x", W*HD.ess + 4).attr("y", 14)
        .attr("fill","#888")
        .style("font-family","'Roboto Mono', monospace")
        .style("font-size","9px")
        .text(`ESS ${ESS_PCT}%`);

    // Side labels
    hdSvg.append("text").attr("x",W*0.22).attr("y",H-4)
        .attr("text-anchor","middle").attr("fill",HAWK_COLOR)
        .style("font-family","'Roboto Mono', monospace").style("font-size","9px").style("font-weight","700")
        .text("← HAWKS");
    hdSvg.append("text").attr("x",W*0.78).attr("y",H-4)
        .attr("text-anchor","middle").attr("fill",DOVE_COLOR)
        .style("font-family","'Roboto Mono', monospace").style("font-size","9px").style("font-weight","700")
        .text("DOVES →");

    function initAgents(hawkPct) {
        const nHawks = Math.round(N_HD * hawkPct/100);
        hdAgents = Array.from({length: N_HD}, (_,i) => {
            const isHawk = i < nHawks;
            return {
                id: i,
                strategy: isHawk ? "hawk" : "dove",
                // Start clearly separated — hawks left quarter, doves right quarter
                x: isHawk ? 20 + Math.random() * (W*0.4) : W*0.6 + Math.random() * (W*0.38),
                y: 16 + Math.random() * (H - 32),
                vx: 0, vy: 0,
                fitness: 0
            };
        });
        hdRound = 0;
    }

    function renderAgents() {
        const dots = hdSvg.selectAll(".hd-agent").data(hdAgents, d=>d.id);
        dots.enter().append("circle").attr("class","hd-agent")
            .attr("r",5).attr("cx",d=>d.x).attr("cy",d=>d.y)
            .attr("fill", d => d.strategy==="hawk" ? HAWK_COLOR : DOVE_COLOR)
            .attr("opacity",0.85)
            .merge(dots)
            // Colour change is instant and dramatic — you see the switch happen
            .attr("fill", d => d.strategy==="hawk" ? HAWK_COLOR : DOVE_COLOR)
            .attr("r",5).attr("opacity",0.85);
        dots.exit().remove();

        const nH = hdAgents.filter(a=>a.strategy==="hawk").length;
        const nD = N_HD - nH;
        document.getElementById("stat-hawk").textContent  = nH;
        document.getElementById("stat-dove").textContent  = nD;
        document.getElementById("stat-round").textContent = hdRound;

        // Highlight dominant cell
        const pctH = nH/N_HD;
        ["cell-hh","cell-hd","cell-dh","cell-dd"].forEach(id =>
            document.getElementById(id).className = "matrix-cell");
        if (pctH > 0.65)       document.getElementById("cell-hh").className = "matrix-cell nash";
        else if (pctH < 0.35)  document.getElementById("cell-dd").className = "matrix-cell nash-optimal";
        else                   {
            document.getElementById("cell-hd").className = "matrix-cell nash-optimal";
            document.getElementById("cell-dh").className = "matrix-cell nash";
        }
    }

    function evolveRound() {
        // Each agent plays against random opponent, gets fitness
        hdAgents.forEach(a => {
            const opp = hdAgents[Math.floor(Math.random()*N_HD)];
            a.fitness = HD.payoff(a.strategy, opp.strategy);
        });

        const nHawks = hdAgents.filter(a=>a.strategy==="hawk").length;
        const nDoves = N_HD - nHawks;

        // Replication: imitate fitter neighbours — NO random mutation
        // If 0 hawks or 0 doves, population is absorbing — stays there (correct ESS behaviour)
        const next = hdAgents.map(a => {
            const nb = hdAgents[Math.floor(Math.random()*N_HD)];
            if (nb.strategy === a.strategy) return a.strategy; // same type, no switch
            const diff = nb.fitness - a.fitness;
            const maxDiff = HD.C; // max payoff spread
            // Switch only if neighbour is doing better, proportional to difference
            if (diff > 0 && Math.random() < diff / maxDiff) return nb.strategy;
            return a.strategy;
        });
        hdAgents.forEach((a,i) => { a.strategy = next[i]; });
        hdRound++;
        renderAgents();
        updateHDForce();
    }

    function updateHDForce() {
        if (!hdSim) return;
        // Strong x pull: dots that switched strategy fly across the screen
        hdSim.force("x", d3.forceX(d => d.strategy==="hawk" ? W*0.25 : W*0.75).strength(0.09))
            .alpha(0.7).restart();
    }

    // Controls
    const coopSlider  = document.getElementById("coop-slider");
    const speedSlider = document.getElementById("speed-slider");
    coopSlider.addEventListener("input",  () => document.getElementById("coop-val").textContent = `${coopSlider.value}%`);
    speedSlider.addEventListener("input", () => {
        document.getElementById("speed-val").textContent = `${speedSlider.value}×`;
        if (hdRunning) { stopHD(); startHD(); }
    });

    function startHD() {
        if (hdRunning) return;
        hdRunning = true;
        const delay = Math.round(380 / parseInt(speedSlider.value));
        hdInterval = setInterval(evolveRound, delay);
        document.getElementById("stag-play").classList.add("active");
    }
    function stopHD() {
        hdRunning = false;
        clearInterval(hdInterval);
        document.getElementById("stag-play").classList.remove("active");
    }
    function resetHD() {
        stopHD();
        initAgents(parseInt(coopSlider.value));
        renderAgents();
        // Critical: restart sim with new agent array — old sim still refs old objects
        if (hdSim) {
            hdSim.nodes(hdAgents)
                .force("x", d3.forceX(d => d.strategy==="hawk" ? W*0.28 : W*0.72).strength(0.08))
                .alpha(0.8).restart();
        }
    }

    document.getElementById("stag-play").addEventListener("click",  startHD);
    document.getElementById("stag-pause").addEventListener("click", stopHD);
    document.getElementById("stag-reset").addEventListener("click", resetHD);

    initAgents(50);
    renderAgents();

    hdSim = d3.forceSimulation(hdAgents)
        .force("charge", d3.forceManyBody().strength(-10))
        .force("collide", d3.forceCollide(10).strength(1).iterations(3))
        .force("x", d3.forceX(d => d.strategy==="hawk" ? W*0.25 : W*0.75).strength(0.09))
        .force("y", d3.forceY(H/2).strength(0.015))
        .alphaDecay(0)        // NEVER decay — perpetual motion
        .alphaMin(0)
        .alpha(0.6)
        .on("tick", () => {
            // Inject random velocity nudges to keep things lively
            hdAgents.forEach(a => {
                a.vx = (a.vx || 0) + (Math.random() - 0.5) * 0.4;
                a.vy = (a.vy || 0) + (Math.random() - 0.5) * 0.4;
                // Damp velocity slightly so it doesn't go crazy
                a.vx *= 0.92;
                a.vy *= 0.92;
            });
            hdSvg.selectAll(".hd-agent")
                .attr("cx", d => Math.max(6, Math.min(W-6, d.x)))
                .attr("cy", d => Math.max(6, Math.min(H-6, d.y)));
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 INIT
// ─────────────────────────────────────────────────────────────────────────────
window.initPhase2 = function() {
    const p2 = document.getElementById("phase2-content");
    if (!p2) return;
    p2.style.display    = "block";
    p2.style.opacity    = "0";
    p2.style.transition = "opacity 0.7s ease";
    requestAnimationFrame(() => requestAnimationFrame(() => {
        p2.style.opacity = "1";
        setTimeout(() => {
            p2.scrollIntoView({ behavior: "smooth", block: "start" });
            setTimeout(() => {
                initPhase2Scrollama();
                if (window._wireP3OnceVisible) window._wireP3OnceVisible();
            }, 250);
        }, 100);
    }));
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLLAMA — PHASE 2 (bidirectional)
// ─────────────────────────────────────────────────────────────────────────────
function initPhase2Scrollama() {

    // ── Section A: Rational ───────────────────────────────────────────────────
    const s1 = scrollama();
    s1.setup({ step: "#scrolly-rational .step", offset: 0.5 })
        .onStepEnter(({ element, index }) => {
            document.querySelectorAll("#scrolly-rational .step").forEach(s => s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);
            showVis("vis-rational");

            if (step === 5) {
                // Show prob tree — rebuild if needed (clear EV chart first)
                const el = document.getElementById("vis-rational");
                if (evBuilt || probTreeBuilt) {
                    // If EV chart was shown, swap back to tree
                    el.innerHTML = "";
                    probTreeBuilt = false;
                    evBuilt = false;
                }
                buildProbTree();
            }
            if (step === 6) {
                buildEVChart();
            }
        })
        .onStepExit(({ element, direction }) => {
            if (direction === "up") {
                element.classList.remove("is-active");
                const step = parseInt(element.dataset.step);
                // Scrolling back from step 6 → rebuild tree on step 5
                if (step === 6) {
                    evBuilt = false;
                    const el = document.getElementById("vis-rational");
                    if (el) { el.innerHTML = ""; probTreeBuilt = false; }
                }
            }
        });

    // ── Section B: Surface ────────────────────────────────────────────────────
    const s2 = scrollama();
    s2.setup({ step: "#scrolly-surface .step", offset: 0.5 })
        .onStepEnter(({ element, index }) => {
            document.querySelectorAll("#scrolly-surface .step").forEach(s => s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);

            showVis("vis-surface");

            if (step === 9) {
                buildSurface();                                          // build once
                setTimeout(() => window._runMarble(0.70, 0.64), 600);   // trapped in local min
            }
            if (step === 10 && window._runMarble) {
                window._runMarble(0.12, 0.12);                           // escapes to global
            }
            if (step === 11 && window._addSecondMarble) {
                window._addSecondMarble();
            }
        })
        .onStepExit(({ element, direction }) => {
            if (direction === "up") element.classList.remove("is-active");
        });

    // ── Section C: Hawk-Dove ─────────────────────────────────────────────────
    const s3 = scrollama();
    s3.setup({ step: "#scrolly-stag .step", offset: 0.5 })
        .onStepEnter(({ element, index }) => {
            document.querySelectorAll("#scrolly-stag .step").forEach(s => s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);
            showVis("vis-stag");
            if (step === 12) buildHawkDove();
            if (step >= 13) {
                buildHawkDove();
                const sim = document.getElementById("hd-simulation");
                if (sim) sim.style.display = "flex";
                const mtx = document.getElementById("hd-matrix-intro");
                if (mtx) mtx.style.display = "none";
                // Also hide the bottom payoff matrix inside the swarm vis
                const pm = document.getElementById("payoff-matrix");
                if (pm) pm.style.display = "none";
            }
        })
        .onStepExit(({ element, direction }) => {
            if (direction === "up") {
                element.classList.remove("is-active");
                const step = parseInt(element.dataset.step);
                if (step === 13) {
                    const sim = document.getElementById("hd-simulation");
                    const mtx = document.getElementById("hd-matrix-intro");
                    if (sim) sim.style.display = "none";
                    if (mtx) mtx.style.display = "block";
                }
            }
        });

    window.addEventListener("resize", () => { s1.resize(); s2.resize(); s3.resize(); });
}

// Helper: show a vis container, hide siblings in same section
function showVis(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.transition = "opacity 0.4s";
    el.style.opacity    = "1";
    el.style.display    = "block";
}

// Phase 3 entry is wired via #enter-phase3-btn in main.js — nothing to do here
window._wireP3OnceVisible = function() { /* no-op */ };

