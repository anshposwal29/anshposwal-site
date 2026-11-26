// =============================================================================
// phase3-visualisations.js
// Act I:   Ozone / Montreal Protocol — area chart timeline
// Act II:  Nuclear arms race — PD matrix → line chart transition
// Act III: Human-AI Prisoner's Dilemma — live API game
// =============================================================================

const P3_CREAM = "#F2EFE7";
const P3_TEAL  = "#005BBB"; 
const P3_RED   = "#E63946";
const P3_BLUE  = "#005BBB";
const P3_INK   = "#1e1e1e";
const MONO     = "'Roboto Mono', monospace";
const SERIF    = "'Lora', serif";

// ─────────────────────────────────────────────────────────────────────────────
// ACT I — OZONE / MONTREAL PROTOCOL
// ─────────────────────────────────────────────────────────────────────────────
let ozoneBuilt = false;
let ozoneStep  = 0;

// Real data (indexed/scaled from UNEP/WMO sources)
const CFC_DATA = [
    {y:1960,prod:100},{y:1965,prod:180},{y:1970,prod:380},{y:1975,prod:620},
    {y:1980,prod:900},{y:1985,prod:1050},{y:1987,prod:1100},{y:1990,prod:820},
    {y:1995,prod:380},{y:2000,prod:160},{y:2005,prod:80},{y:2010,prod:40},
    {y:2015,prod:20},{y:2020,prod:12}
];
const OZONE_HOLE = [
    {y:1980,sz:0},{y:1982,sz:1},{y:1985,sz:6},{y:1987,sz:10},{y:1990,sz:17},
    {y:1993,sz:22},{y:1996,sz:24},{y:2000,sz:29},{y:2006,sz:27},{y:2010,sz:22},
    {y:2015,sz:25},{y:2019,sz:16},{y:2022,sz:23}
];
const OZONE_EVENTS = [
    {y:1974, label:"Molina & Rowland\nwarning"},
    {y:1985, label:"Ozone hole\ndiscovered"},
    {y:1987, label:"Montreal\nProtocol"},
    {y:2010, label:"99% of CFCs\nphased out"}
];

function buildOzone() {
    const el = document.getElementById("vis-ozone");
    if (!el || ozoneBuilt) return;
    ozoneBuilt = true;

    el.style.background   = P3_CREAM;
    el.style.borderRadius = "12px";
    el.style.padding      = "1rem";

    const W = 460, H = 360;
    const m  = {top:44, right:50, bottom:50, left:52};
    const iW = W - m.left - m.right;
    const iH = H - m.top  - m.bottom;

    const svg = d3.select("#vis-ozone").append("svg")
        .attr("viewBox",`0 0 ${W} ${H}`)
        .attr("preserveAspectRatio","xMidYMid meet")
        .style("width","100%").style("height","100%").style("min-height","340px");

    const g = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);

    const x = d3.scaleLinear().domain([1960,2022]).range([0,iW]);
    const yCFC = d3.scaleLinear().domain([0,1200]).range([iH,0]);
    const yOzone = d3.scaleLinear().domain([0,32]).range([iH,0]);

    // Grid lines
    g.append("g").call(d3.axisLeft(yCFC).ticks(5).tickSize(-iW))
        .call(ax => ax.select(".domain").remove())
        .call(ax => ax.selectAll("line").attr("stroke","#e0dbd2").attr("stroke-dasharray","2,2"))
        .call(ax => ax.selectAll("text").style("font-family",MONO).style("font-size","8px").attr("fill","#aaa"));

    // X axis
    g.append("g").attr("transform",`translate(0,${iH})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8).tickSize(0))
        .call(ax => ax.select(".domain").attr("stroke","#ddd"))
        .call(ax => ax.selectAll("text").style("font-family",MONO).style("font-size","8px").attr("fill","#888"));

    // CFC area
    const areaFn = d3.area().x(d=>x(d.y)).y0(iH).y1(d=>yCFC(d.prod)).curve(d3.curveCatmullRom);
    const lineFn = d3.line().x(d=>x(d.y)).y(d=>yCFC(d.prod)).curve(d3.curveCatmullRom);

    g.append("path").datum(CFC_DATA).attr("d",areaFn)
        .attr("fill",P3_RED).attr("opacity",0.12);
    const cfcPath = g.append("path").datum(CFC_DATA).attr("d",lineFn)
        .attr("fill","none").attr("stroke",P3_RED).attr("stroke-width",2.5)
        .attr("stroke-dasharray", function(){ const l=this.getTotalLength(); return `${l} ${l}`; })
        .attr("stroke-dashoffset", function(){ return this.getTotalLength(); });

    // Ozone hole line (right y-axis scale)
    const ozoneFn = d3.line().x(d=>x(d.y)).y(d=>yOzone(d.sz)).curve(d3.curveCatmullRom);
    const ozonePath = g.append("path").datum(OZONE_HOLE).attr("d",ozoneFn)
        .attr("fill","none").attr("stroke",P3_TEAL).attr("stroke-width",2).attr("stroke-dasharray","5,3")
        .attr("opacity",0);

    // Labels
    const lbl = (t,x2,y2,col) => svg.append("text")
        .attr("x",x2).attr("y",y2).attr("fill",col)
        .style("font-family",MONO).style("font-size","9px").text(t);
    lbl("CFC Production (kt)", m.left, 16, P3_RED);
    lbl("Ozone Hole Size (M km²)", W-m.right, 16, P3_BLUE).attr("text-anchor","end");

    // Montreal Protocol line
    const mpX = x(1987) + m.left;
    svg.append("line").attr("x1",mpX).attr("y1",m.top).attr("x2",mpX).attr("y2",H-m.bottom)
        .attr("stroke","#888").attr("stroke-width",1).attr("stroke-dasharray","3,2").attr("opacity",0)
        .attr("class","ozone-annot");
    svg.append("text").attr("x",mpX+4).attr("y",m.top+10)
        .attr("fill","#888").style("font-family",MONO).style("font-size","8px")
        .attr("opacity",0).attr("class","ozone-annot")
        .text("Montreal Protocol 1987");

    window._ozoneStep = function(step) {
        if (step >= 1) {
            cfcPath.transition().duration(2000).ease(d3.easeLinear).attr("stroke-dashoffset",0);
        }
        if (step >= 2) {
            ozonePath.transition().delay(400).duration(1200).attr("opacity",0.8);
            svg.selectAll(".ozone-annot").transition().delay(600).duration(500).attr("opacity",1);
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACT II — NUCLEAR ARMS RACE
// ─────────────────────────────────────────────────────────────────────────────
let nuclearBuilt  = false;
let pdShown       = false;
let chartShown    = false;

const WARHEADS = [
    {y:1945,us:6,    ussr:0   },{y:1950,us:369,  ussr:5   },{y:1955,us:3057, ussr:200 },
    {y:1960,us:20434,ussr:1605},{y:1965,us:31982,ussr:6129},{y:1970,us:26662,ussr:11643},
    {y:1975,us:27826,ussr:19055},{y:1980,us:24304,ussr:30062},{y:1985,us:23368,ussr:39197},
    {y:1986,us:23317,ussr:40159},{y:1990,us:21004,ussr:37000},{y:1995,us:15318,ussr:27000},
    {y:2000,us:10577,ussr:21000},{y:2005,us:8360, ussr:17000},{y:2010,us:5113, ussr:12000},
    {y:2020,us:5800, ussr:6375}
];
const NUCLEAR_EVENTS = [
    {y:1957,label:"Sputnik"},{y:1962,label:"Cuba"},{y:1972,label:"SALT I"},
    {y:1979,label:"SALT II"},{y:1986,label:"Peak:\n70,000+"},{y:1991,label:"START I"}
];

function buildNuclear() {
    const el = document.getElementById("vis-nuclear");
    if (!el || nuclearBuilt) return;
    nuclearBuilt = true;

    el.style.background   = P3_CREAM;
    el.style.borderRadius = "12px";
    el.style.padding      = "1rem";

    const W = 460, H = 420;
    const svg = d3.select("#vis-nuclear").append("svg")
        .attr("viewBox",`0 0 ${W} ${H}`)
        .attr("preserveAspectRatio","xMidYMid meet")
        .style("width","100%").style("height","auto");

    // ── PD Matrix (shown first) ──────────────────────────────────────────────
    const pdG = svg.append("g").attr("class","pd-layer").attr("opacity",1);

    // Bigger cells — use more of the canvas
    const cX = [W*0.32, W*0.72], cY = [H*0.36, H*0.68];
    const cW = 160, cH = 88;

    const cells = [
        {col:0,row:0, payoff:"−10, −10", note:"Nash Equilibrium", highlight:true},
        {col:1,row:0, payoff:"+5, −15",  note:"You win, they lose"},
        {col:0,row:1, payoff:"−15, +5",  note:"You lose, they win"},
        {col:1,row:1, payoff:"+5, +5",   note:"Pareto Optimal",   best:true}
    ];

    // Use HTML overlay for the PD matrix — same style as Hawk-Dove matrix
    const pdEl = document.getElementById("vis-nuclear");
    const pdHTML = document.createElement("div");
    pdHTML.id = "nuclear-pd-html";
    pdHTML.style.cssText = `
        display:flex;flex-direction:column;justify-content:center;
        padding:1.8rem;background:#F2EFE7;border-radius:12px;
        width:100%;height:100%;box-sizing:border-box;gap:1.2rem;position:absolute;top:0;left:0;
    `;
    pdHTML.innerHTML = `
        <div style="font-family:'Roboto Mono',monospace;font-size:0.62rem;letter-spacing:4px;text-transform:uppercase;color:#888;text-align:center;">
            The Nuclear Prisoner's Dilemma
        </div>
        <div style="display:grid;grid-template-columns:100px 1fr 1fr;grid-template-rows:44px 1fr 1fr;gap:8px;flex:1;">
            <div></div>
            <div style="display:flex;align-items:center;justify-content:center;background:rgba(230,57,70,0.12);border-radius:8px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#E63946;letter-spacing:1px;">They: Arm</div>
            <div style="display:flex;align-items:center;justify-content:center;background:rgba(255,215,0,0.12);border-radius:8px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#DAA520;letter-spacing:1px;">They: Disarm</div>
            <div style="display:flex;align-items:center;justify-content:flex-end;padding-right:10px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#E63946;">You: Arm</div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(230,57,70,0.08);border:2px solid #E63946;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#E63946;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">−10, −10</div>
                <div style="font-size:0.7rem;color:#E63946;font-family:'Roboto Mono',monospace;font-weight:600;">Nash Equilibrium</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,0.8);border:1px solid #ddd;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#555;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">+5, −15</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">You win, they lose</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:flex-end;padding-right:10px;font-family:'Roboto Mono',monospace;font-size:0.78rem;font-weight:700;color:#DAA520;">You: Disarm</div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,255,255,0.8);border:1px solid #ddd;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#555;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">−15, +5</div>
                <div style="font-size:0.7rem;color:#aaa;font-family:'Roboto Mono',monospace;">You lose, they win</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(255,215,0,0.08);border:2px solid #DAA520;border-radius:10px;">
                <div style="font-size:1.8rem;font-weight:700;color:#DAA520;font-family:'Roboto Mono',monospace;letter-spacing:-1px;">+5, +5</div>
                <div style="font-size:0.7rem;color:#DAA520;font-family:'Roboto Mono',monospace;font-weight:600;">Pareto Optimal</div>
            </div>
        </div>
        <div style="padding:0.6rem 1rem;background:rgba(230,57,70,0.06);border-left:3px solid #E63946;font-family:'Roboto Mono',monospace;font-size:0.7rem;color:#E63946;font-weight:700;">
            ↑ both are trapped here — individually rational, collectively catastrophic
        </div>
    `;
    pdEl.style.position = "relative";
    pdEl.appendChild(pdHTML);

    // SVG PD layer stays empty — we use HTML overlay above
    pdG.attr("opacity", 0); // hide SVG layer, HTML handles it

    // ── DIVERGING MIRROR CHART (hidden, transitions in) ─────────────────────────
    // US fills upward (top half), USSR fills downward (bottom half)
    // Shared x-axis in the centre — they face each other like a population pyramid
    const chartG = svg.append("g").attr("class","chart-layer").attr("opacity",0);

    const WC = W, HC = H; // same canvas

    const m = {top:60, right:28, bottom:28, left:52};
    const iW = WC - m.left - m.right;
    const halfH = (HC - m.top - m.bottom) / 2; // height of each half
    const midY  = m.top + halfH;                // y of the shared centre axis

    const cg = chartG.append("g").attr("transform",`translate(${m.left},${m.top})`);

    const maxVal = 44000;
    const x = d3.scaleLinear().domain([1945, 2022]).range([0, iW]);
    // US scale: 0 at midY, grows upward (negative y = up in SVG)
    const yUS   = d3.scaleLinear().domain([0, maxVal]).range([0, -halfH]);
    // USSR scale: 0 at midY, grows downward
    const yUSSR = d3.scaleLinear().domain([0, maxVal]).range([0, halfH]);

    // ── Event bands — drawn first so they sit behind everything ──────────────
    const events = [
        {y:1957, label:"Sputnik",    col:"rgba(180,100,0,0.08)"},
        {y:1962, label:"Cuba Crisis",col:"rgba(230,57,70,0.08)"},
        {y:1972, label:"SALT I",     col:"rgba(255,215,0,0.08)"},
        {y:1979, label:"SALT II",    col:"rgba(255,215,0,0.08)"},
        {y:1986, label:"Peak 70,000+",col:"rgba(230,57,70,0.08)"},
        {y:1991, label:"START I",    col:"rgba(255,215,0,0.12)"}
    ];

    // Stagger label rows so close events don't collide
    // Row 0 = highest (y=14), Row 1 = middle (y=28), Row 2 = low (y=42)
    const evRows = [0, 1, 0, 1, 2, 0]; // Sputnik, Cuba, SALT I, SALT II, Peak, START
    events.forEach((ev, i) => {
        const ex = x(ev.y);
        const labelY = 14 + evRows[i] * 14;  // staggered above chart area
        // Subtle vertical line through both halves
        cg.append("line").attr("x1",ex).attr("y1",0).attr("x2",ex).attr("y2",halfH*2)
            .attr("stroke",ev.col.replace("0.08","0.35").replace("0.12","0.45"))
            .attr("stroke-width",1);
        // Small circle on the centre axis to anchor the label line
        cg.append("circle").attr("cx",ex).attr("cy",halfH).attr("r",2.5)
            .attr("fill",ev.col.replace("0.08","0.8").replace("0.12","1"));
        // Connecting tick from label to chart top
        chartG.append("line")
            .attr("x1", m.left + ex).attr("y1", m.top - 4)
            .attr("x2", m.left + ex).attr("y2", labelY + 6)
            .attr("stroke","#ccc").attr("stroke-width",0.8);
        // Label
        chartG.append("text")
            .attr("x", m.left + ex)
            .attr("y", labelY)
            .attr("text-anchor","middle")
            .attr("dominant-baseline","middle")
            .attr("fill","#888")
            .style("font-family",MONO).style("font-size","8.5px")
            .style("font-weight","600")
            .text(ev.label);
    });

    // ── Centre axis ───────────────────────────────────────────────────────────
    cg.append("line").attr("x1",0).attr("y1",halfH).attr("x2",iW).attr("y2",halfH)
        .attr("stroke","#bbb").attr("stroke-width",1.2);

    // ── Y-axis tick marks (left side, one set for both halves) ─────────────
    [10,20,30,40].forEach(k => {
        const yU = halfH + yUS(k*1000);   // upward from centre
        const yD = halfH + yUSSR(k*1000); // downward from centre
        // US side
        cg.append("line").attr("x1",-4).attr("y1",yU).attr("x2",0).attr("y2",yU).attr("stroke","#ccc");
        cg.append("text").attr("x",-7).attr("y",yU).attr("text-anchor","end").attr("dominant-baseline","middle")
            .attr("fill","#bbb").style("font-family",MONO).style("font-size","8px").text(k+"k");
        // USSR side
        cg.append("line").attr("x1",-4).attr("y1",yD).attr("x2",0).attr("y2",yD).attr("stroke","#ccc");
        cg.append("text").attr("x",-7).attr("y",yD).attr("text-anchor","end").attr("dominant-baseline","middle")
            .attr("fill","#bbb").style("font-family",MONO).style("font-size","8px").text(k+"k");
    });

    // ── X-axis labels ─────────────────────────────────────────────────────────
    [1950,1960,1970,1980,1990,2000,2010,2020].forEach(yr => {
        cg.append("text").attr("x",x(yr)).attr("y",halfH+14)
            .attr("text-anchor","middle").attr("fill","#999")
            .style("font-family",MONO).style("font-size","9px").text(yr);
    });

    // ── US area + line (upward) ───────────────────────────────────────────────
    const usAreaFn = d3.area()
        .x(d => x(d.y))
        .y0(halfH)
        .y1(d => halfH + yUS(d.us))
        .curve(d3.curveCatmullRom);

    cg.append("path").datum(WARHEADS).attr("d",usAreaFn)
        .attr("fill",P3_BLUE).attr("opacity",0.18);

    const usLineFn = d3.line()
        .x(d => x(d.y))
        .y(d => halfH + yUS(d.us))
        .curve(d3.curveCatmullRom);

    const usPath = cg.append("path").datum(WARHEADS).attr("d",usLineFn)
        .attr("fill","none").attr("stroke",P3_BLUE).attr("stroke-width",2.8)
        .attr("stroke-dasharray",function(){const l=this.getTotalLength();return`${l} ${l}`;})
        .attr("stroke-dashoffset",function(){return this.getTotalLength();});

    // ── USSR area + line (downward) ───────────────────────────────────────────
    const ussrAreaFn = d3.area()
        .x(d => x(d.y))
        .y0(halfH)
        .y1(d => halfH + yUSSR(d.ussr))
        .curve(d3.curveCatmullRom);

    cg.append("path").datum(WARHEADS).attr("d",ussrAreaFn)
        .attr("fill",P3_RED).attr("opacity",0.18);

    const ussrLineFn = d3.line()
        .x(d => x(d.y))
        .y(d => halfH + yUSSR(d.ussr))
        .curve(d3.curveCatmullRom);

    const ussrPath = cg.append("path").datum(WARHEADS).attr("d",ussrLineFn)
        .attr("fill","none").attr("stroke",P3_RED).attr("stroke-width",2.8)
        .attr("stroke-dasharray",function(){const l=this.getTotalLength();return`${l} ${l}`;})
        .attr("stroke-dashoffset",function(){return this.getTotalLength();});

    // ── Country labels pinned left ────────────────────────────────────────────
    const lblStyle = el => el.style("font-family",MONO).style("font-size","10px")
                              .style("font-weight","700").style("letter-spacing","2px");
    lblStyle(cg.append("text").attr("x",6).attr("y",halfH - halfH*0.82)
        .attr("fill",P3_BLUE)).text("US ▲");
    lblStyle(cg.append("text").attr("x",6).attr("y",halfH + halfH*0.82)
        .attr("fill",P3_RED)).text("USSR ▼");

    // Peak annotation — where they crossed
    const peakX = x(1986);
    cg.append("text").attr("x",peakX+4).attr("y",halfH - 24)
        .attr("fill","#888").style("font-family",MONO).style("font-size","8px")
        .style("font-style","italic").text("combined peak:");
    cg.append("text").attr("x",peakX+4).attr("y",halfH - 12)
        .attr("fill","#888").style("font-family",MONO).style("font-size","9px")
        .style("font-weight","700").text("~70,000 warheads");

    window._nuclearStep = function(step) {
        if (step === 1 && !pdShown) {
            pdShown = true;
            // Show HTML matrix
            const pdHtml = document.getElementById("nuclear-pd-html");
            if (pdHtml) { pdHtml.style.opacity = "1"; pdHtml.style.transition = "opacity 0.4s"; }
        }
        if (step >= 2 && !chartShown) {
            chartShown = true;
            // Fade out HTML matrix
            const pdHtml = document.getElementById("nuclear-pd-html");
            if (pdHtml) {
                pdHtml.style.transition = "opacity 0.7s";
                pdHtml.style.opacity = "0";
            }
            setTimeout(() => {
                if (pdHtml) pdHtml.style.display = "none";
                chartG.transition().duration(500).attr("opacity",1);
                usPath.transition().duration(2200).ease(d3.easeLinear).attr("stroke-dashoffset",0);
                ussrPath.transition().delay(300).duration(2200).ease(d3.easeLinear).attr("stroke-dashoffset",0);
            }, 700);
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACT III — HUMAN-AI PRISONER'S DILEMMA
// ─────────────────────────────────────────────────────────────────────────────
// Payoffs: (C,C)=(3,3)  (C,D)=(0,5)  (D,C)=(5,0)  (D,D)=(1,1)
// AI uses Tit-for-Tat + forgiveness, with Claude API for narrative flavour

let aiBuilt      = false;
let aiHistory    = [];   // [{you, ai, youScore, aiScore}]
let youTotal     = 0;
let aiTotal      = 0;
let aiWaiting    = false;

const PD_PAYOFFS = {
    CC:{you:3,ai:3}, CD:{you:0,ai:5},
    DC:{you:5,ai:0}, DD:{you:1,ai:1}
};

// AI personality prompts — rich, granular, LLM-powered
const AI_PERSONALITIES = [
    {
        id: "mirror",
        name: "The Mirror",
        tagline: "Adapts to your every move",
        color: "#FFD700",
        prompt: `You are playing an iterated Prisoner's Dilemma. Count the moves in the history. If the opponent cooperated on MORE than 60% of past rounds: Cooperate. If they cooperated on LESS than 40%: Defect. If between 40-60%: randomly pick (add some unpredictability — roughly 50/50). With no history: Cooperate. ONLY output one word. History: {history}.`
    },
    {
        id: "negotiator",
        name: "The Negotiator",
        tagline: "Demands a gesture before trusting again",
        color: "#005BBB",
        prompt: `You are playing an iterated Prisoner's Dilemma. Follow this EXACT rule set: (1) Start with Cooperate. (2) If the opponent just defected: Defect. (3) After a defection, only return to Cooperate once you see TWO consecutive Cooperates from them. (4) If they defected again after reconciliation: Defect and require THREE consecutive Cooperates this time. Your forgiveness threshold grows with each betrayal. History: {history}. Output one word only.`
    },
    {
        id: "opportunist",
        name: "The Opportunist",
        tagline: "Builds trust, then strikes",
        color: "#b03a2e",
        prompt: `You are playing an iterated Prisoner's Dilemma. Count total rounds from history. Rounds 1-4: always Cooperate (build trust). Round 5: Defect (exploit). Rounds 6-7: Cooperate (rebuild). Round 8: Defect. Rounds 9-11: Cooperate. Round 12: Defect. Continue this pattern — cooperate 2-3 rounds then defect 1 round, cyclically. If the opponent defected on the LAST round: 70% chance Defect, 30% Cooperate. History: {history}. Output one word only.`
    },
    {
        id: "peacemaker",
        name: "The Peacemaker",
        tagline: "Always seeks reconciliation",
        color: "#b03a2e",
        prompt: `You are playing an iterated Prisoner's Dilemma. You are an optimist who always tries to restore cooperation. Rules: (1) Default: Cooperate. (2) If opponent JUST defected: 40% chance Defect, 60% chance Cooperate anyway. (3) NEVER defect twice in a row — always offer cooperation after any defection. (4) If they cooperated last round: always Cooperate. You believe in giving second (and third) chances. History: {history}. Output one word only.`
    },
    {
        id: "strategist",
        name: "The Cold Strategist",
        tagline: "One strike and you're done",
        color: "#1e1e1e",
        prompt: `You are playing an iterated Prisoner's Dilemma. Apply GRIM TRIGGER: Cooperate on round 1. If the opponent has EVER defected in the entire history (even once, ever): Defect permanently for all remaining rounds. If they have never defected: Cooperate. No exceptions, no forgiveness, no second chances. Check the full history carefully. History: {history}. Output one word only.`
    }
];

let selectedPersonality = AI_PERSONALITIES[0];

function buildAIGame() {
    const el = document.getElementById("vis-ai");
    if (!el || aiBuilt) return;
    aiBuilt = true;

    // Phase 1: Personality selector
    el.style.background = "#F2EFE7";
    el.style.borderRadius = "12px";
    el.style.overflow = "hidden";

    el.innerHTML = `
    <div id="ai-selector" style="padding:1.4rem;display:flex;flex-direction:column;gap:1rem;height:100%;overflow-y:auto;">
        <div style="font-family:'Roboto Mono',monospace;font-size:0.62rem;letter-spacing:4px;text-transform:uppercase;color:#888;text-align:center;">
            Choose your AI opponent
        </div>
        <div id="personality-grid" style="display:flex;flex-direction:column;gap:0.6rem;"></div>
        <button id="start-game-btn" style="
            margin-top:0.4rem;padding:0.9rem;
            font-family:'Roboto Mono',monospace;font-size:0.75rem;font-weight:700;
            letter-spacing:3px;text-transform:uppercase;
            background:#1e1e1e;color:#F2EFE7;border:none;border-radius:6px;cursor:pointer;
            transition:opacity 0.2s;
        ">Begin →</button>
    </div>
    <div id="ai-game" style="display:none;flex-direction:column;gap:0.7rem;padding:1rem;height:100%;">
        <div id="ai-round-label" style="font-family:'Roboto Mono',monospace;font-size:0.6rem;letter-spacing:3px;text-transform:uppercase;color:#888;text-align:center;">Round <span id="ai-round-num">0</span></div>

        <div id="ai-payoff-display">
            <div class="ai-score-box">
                <div class="ai-score-val you-col" id="you-score">0</div>
                <div class="ai-score-label">Your Score</div>
            </div>
            <div class="ai-score-box">
                <div class="ai-score-val ai-col" id="ai-score">0</div>
                <div class="ai-score-label">AI Score</div>
            </div>
        </div>

        <div id="ai-history-chart"></div>

        <div id="ai-matrix-wrapper">
            <div style="display:grid;grid-template-columns:24px 1fr 1fr;gap:4px;margin-bottom:4px;font-family:'Roboto Mono',monospace;font-size:0.6rem;letter-spacing:1.5px;text-transform:uppercase;">
                <div></div>
                <div style="text-align:center;padding:4px;background:rgba(255,215,0,0.1);border-radius:4px;color:#FFD700;">AI Coop</div>
                <div style="text-align:center;padding:4px;background:rgba(230,57,70,0.1);border-radius:4px;color:#E63946;">AI Defect</div>
            </div>
            <div style="display:grid;grid-template-columns:24px 1fr 1fr;gap:4px;">
                <div style="display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-family:'Roboto Mono',monospace;font-size:0.55rem;letter-spacing:1px;color:#FFD700;text-transform:uppercase;transform:rotate(180deg);">You C</div>
                <div id="ai-matrix-row" style="display:contents;">
                    <div class="ai-matrix-cell cc-cell" id="cell-cc"><strong>+3, +3</strong><span>Both win</span></div>
                    <div class="ai-matrix-cell cd-cell" id="cell-cd"><strong>0, +5</strong><span>You lose out</span></div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:24px 1fr 1fr;gap:4px;margin-top:4px;">
                <div style="display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;font-family:'Roboto Mono',monospace;font-size:0.55rem;letter-spacing:1px;color:#E63946;text-transform:uppercase;transform:rotate(180deg);">You D</div>
                <div class="ai-matrix-cell dc-cell" id="cell-dc"><strong>+5, 0</strong><span>AI loses out</span></div>
                <div class="ai-matrix-cell dd-cell" id="cell-dd"><strong>+1, +1</strong><span>Both lose</span></div>
            </div>
        </div>

        <div id="ai-thinking"></div>

        <div id="ai-btn-row">
            <button class="ai-choice-btn cooperate" id="btn-cooperate">🤝 Cooperate</button>
            <button class="ai-choice-btn defect"    id="btn-defect">⚔️ Defect</button>
        </div>
        <button id="ai-reset-btn" style="
            background:transparent;border:1px solid #ccc;color:#aaa;
            font-family:'Roboto Mono',monospace;font-size:0.65rem;letter-spacing:2px;
            text-transform:uppercase;padding:0.5rem;border-radius:4px;cursor:pointer;
            transition:border-color 0.2s,color 0.2s;
        ">↺ Change Opponent</button>
    </div>
    `;

    // Wire personality selector
    const grid = document.getElementById("personality-grid");
    AI_PERSONALITIES.forEach(p => {
        const card = document.createElement("div");
        card.dataset.pid = p.id;
        card.style.cssText = `
            padding:0.8rem 1rem; border-radius:8px; cursor:pointer;
            border:2px solid ${p.id===selectedPersonality.id ? p.color : "#e0dbd2"};
            background:${p.id===selectedPersonality.id ? `rgba(0,0,0,0.04)` : "#fff"};
            transition:border-color 0.2s,background 0.2s;
            display:flex; align-items:center; gap:0.8rem;
        `;
        card.innerHTML = `
            <div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0;"></div>
            <div style="flex:1;">
                <div style="font-family:'Roboto Mono',monospace;font-size:0.82rem;font-weight:700;color:${p.color};">${p.name}</div>
                <div style="font-family:'Lora',serif;font-size:0.8rem;color:#666;font-style:italic;margin-top:3px;">${p.tagline}</div>
            </div>
        `;
        card.addEventListener("click", () => {
            selectedPersonality = p;
            document.querySelectorAll("#personality-grid > div").forEach(c => {
                const pid = c.dataset.pid;
                const pp = AI_PERSONALITIES.find(x=>x.id===pid);
                c.style.borderColor = pid===p.id ? pp.color : "#e0dbd2";
                c.style.background  = pid===p.id ? "rgba(0,0,0,0.04)" : "#fff";
            });
            // Update score box colour
            const aiScoreEl = document.getElementById("ai-score");
            if (aiScoreEl) aiScoreEl.style.color = p.color;
        });
        grid.appendChild(card);
    });

    document.getElementById("start-game-btn").addEventListener("click", () => {
        document.getElementById("ai-selector").style.display = "none";
        const gameEl = document.getElementById("ai-game");
        gameEl.style.display = "flex";
        document.getElementById("ai-score").style.color = selectedPersonality.color;
        document.getElementById("ai-round-label").innerHTML =
            `Playing vs <span style="color:${selectedPersonality.color};font-weight:700;">${selectedPersonality.name}</span> — Round <span id="ai-round-num">0</span>`;
    });

    // Reset button — go back to personality selector and clear history
    el.addEventListener("click", e => {
        if (e.target.id !== "ai-reset-btn") return;
        aiHistory = []; youTotal = 0; aiTotal = 0;
        document.getElementById("you-score").textContent = "0";
        document.getElementById("ai-score").textContent  = "0";
        document.getElementById("ai-round-num").textContent = "0";
        document.getElementById("ai-thinking").textContent = "";
        // Clear history chart
        d3.select("#ai-history-chart svg").selectAll(".h-bar").remove();
        document.getElementById("ai-game").style.display = "none";
        document.getElementById("ai-selector").style.display = "flex";
        ["cell-cc","cell-cd","cell-dc","cell-dd"].forEach(id =>
            document.getElementById(id).classList.remove("active-cell"));
    });

    // History sparkline SVG
    const hW = 400, hH = 80;
    const hSvg = d3.select("#ai-history-chart").append("svg")
        .attr("viewBox",`0 0 ${hW} ${hH}`)
        .style("width","100%").style("height","auto");

    hSvg.append("text").attr("x",4).attr("y",12)
        .attr("fill","#aaa").style("font-family",MONO).style("font-size","8px")
        .text("Round history");

    function updateHistoryChart() {
        hSvg.selectAll(".h-bar").remove();
        const barW = Math.min(24, (hW-8) / Math.max(aiHistory.length, 1));
        aiHistory.forEach((r, i) => {
            const bx = 4 + i * (barW + 2);
            // You
            hSvg.append("rect").attr("class","h-bar")
                .attr("x",bx).attr("y",r.you==="C"?24:44).attr("width",barW/2-1).attr("height",20)
                .attr("fill",r.you==="C"?P3_BLUE:P3_RED).attr("rx",2).attr("opacity",0.8);
            // AI
            hSvg.append("rect").attr("class","h-bar")
                .attr("x",bx+barW/2).attr("y",r.ai==="C"?24:44).attr("width",barW/2-1).attr("height",20)
                .attr("fill",r.ai==="C"?P3_TEAL:"#888").attr("rx",2).attr("opacity",0.8);
        });

        // Legend
        if (aiHistory.length === 1) {
            hSvg.append("text").attr("x",hW-4).attr("y",32)
                .attr("text-anchor","end").attr("fill",P3_BLUE)
                .style("font-family",MONO).style("font-size","7px").text("You");
            hSvg.append("text").attr("x",hW-4).attr("y",44)
                .attr("text-anchor","end").attr("fill",P3_TEAL)
                .style("font-family",MONO).style("font-size","7px").text("AI");
        }
    }

    function highlightCell(you, ai) {
        ["cell-cc","cell-cd","cell-dc","cell-dd"].forEach(id =>
            document.getElementById(id).classList.remove("active-cell"));
        const key = (you==="C"?"c":"d") + (ai==="C"?"c":"d");
        document.getElementById(`cell-${key}`).classList.add("active-cell");
    }

    // API call using selected personality prompt
    async function getAIMove(history) {
        const recent = history.slice(-8).map(r=>`You:${r.you} AI:${r.ai}`).join(", ");
        const prompt = selectedPersonality.prompt.replace("{history}", recent || "none yet");

        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 10,
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await res.json();
            const text = data.content?.[0]?.text?.trim().toLowerCase() || "";
            return text.startsWith("coop") ? "C" : "D";
        } catch {
            // Fallback based on personality
            if (selectedPersonality.id === "negotiator") {
                // Two consecutive cooperates needed to restore trust
                if (history.length < 2) return "C";
                const last2 = history.slice(-2);
                return last2.every(r=>r.you==="C") ? "C" : "D";
            }
            if (selectedPersonality.id === "strategist") {
                return history.some(r=>r.you==="D") ? "D" : "C";
            }
            if (history.length === 0) return "C";
            return history[history.length-1].you === "C" ? "C" : "D";
        }
    }

    async function playRound(youMove) {
        if (aiWaiting) return;
        aiWaiting = true;

        document.getElementById("btn-cooperate").disabled = true;
        document.getElementById("btn-defect").disabled    = true;
        document.getElementById("ai-thinking").textContent = "AI is thinking…";

        const aiMove = await getAIMove(aiHistory);

        const key = (youMove==="C"?"C":"D") + (aiMove==="C"?"C":"D");
        const payoff = PD_PAYOFFS[key] || {you:1,ai:1};
        youTotal += payoff.you;
        aiTotal  += payoff.ai;

        aiHistory.push({ you: youMove, ai: aiMove });

        document.getElementById("you-score").textContent = youTotal;
        document.getElementById("ai-score").textContent  = aiTotal;
        document.getElementById("ai-round-num").textContent = aiHistory.length;
        document.getElementById("ai-thinking").textContent =
            `Round ${aiHistory.length}: You ${youMove==="C"?"cooperated":"defected"}, AI ${aiMove==="C"?"cooperated":"defected"} → +${payoff.you} pts`;

        highlightCell(youMove, aiMove);
        updateHistoryChart();

        aiWaiting = false;
        document.getElementById("btn-cooperate").disabled = false;
        document.getElementById("btn-defect").disabled    = false;
    }

    document.getElementById("btn-cooperate").addEventListener("click", () => playRound("C"));
    document.getElementById("btn-defect").addEventListener("click",    () => playRound("D"));
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT PHASE 3
// ─────────────────────────────────────────────────────────────────────────────
window.initPhase3 = function() {
    const p3 = document.getElementById("phase3-content");
    if (!p3) return;
    p3.style.display    = "block";
    p3.style.opacity    = "0";
    p3.style.transition = "opacity 0.7s ease";
    requestAnimationFrame(() => requestAnimationFrame(() => {
        p3.style.opacity = "1";
        setTimeout(() => {
            p3.scrollIntoView({ behavior:"smooth", block:"start" });
            setTimeout(initPhase3Scrollama, 250);
        }, 100);
    }));
};

function initPhase3Scrollama() {

    // Ozone
    const s1 = scrollama();
    s1.setup({ step:"#scrolly-ozone .step", offset:0.5 })
        .onStepEnter(({element}) => {
            document.querySelectorAll("#scrolly-ozone .step").forEach(s=>s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);
            buildOzone();
            if (window._ozoneStep) window._ozoneStep(step);
        })
        .onStepExit(({element,direction}) => {
            if (direction==="up") element.classList.remove("is-active");
        });

    // Nuclear
    const s2 = scrollama();
    s2.setup({ step:"#scrolly-nuclear .step", offset:0.5 })
        .onStepEnter(({element}) => {
            document.querySelectorAll("#scrolly-nuclear .step").forEach(s=>s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);
            buildNuclear();
            if (window._nuclearStep) window._nuclearStep(step);
        })
        .onStepExit(({element,direction}) => {
            if (direction==="up") element.classList.remove("is-active");
        });

    // AI game
    const s3 = scrollama();
    s3.setup({ step:"#scrolly-ai .step", offset:0.5 })
        .onStepEnter(({element}) => {
            document.querySelectorAll("#scrolly-ai .step").forEach(s=>s.classList.remove("is-active"));
            element.classList.add("is-active");
            const step = parseInt(element.dataset.step);
            if (step >= 2) buildAIGame();
        })
        .onStepExit(({element,direction}) => {
            if (direction==="up") element.classList.remove("is-active");
        });

    window.addEventListener("resize", ()=>{ s1.resize(); s2.resize(); s3.resize(); });
}

