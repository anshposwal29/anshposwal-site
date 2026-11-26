// =============================================================================
// main.js
// =============================================================================
window.userResponses = {};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 0 — INTRO
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById("play-btn").addEventListener("click", () => {
    const intro = document.getElementById("intro-screen");
    intro.style.transition = "opacity 0.7s ease";
    intro.style.opacity = "0";
    setTimeout(() => {
        intro.style.display = "none";
        // Body becomes cream from here — dark sections are explicit ink backgrounds
        document.body.style.background = "var(--cream)";
        const game = document.getElementById("game-screen");
        game.style.display = "flex";
        game.style.opacity = "0";
        game.style.transition = "opacity 0.5s ease";
        requestAnimationFrame(() => requestAnimationFrame(() => {
            game.style.opacity = "1";
            loadQuestion(0);
        }));
    }, 700);
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — GAME ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const questions = [
    { q: "Would you rather have...",
      left: "A guaranteed $500",       right: "50% chance to win $1,000",   tag: "q1_gain"     },
    { q: "Now... would you rather...",
      left: "A guaranteed $500 loss",  right: "50% chance to lose $1,000",  tag: "q2_loss"     },
    { q: "You bought a $100 concert ticket but feel terribly sick. Do you:",
      left: "Go and suffer",           right: "Stay in bed ($0 back)",       tag: "q3_sunkcost" },
    { q: "Would you rather have...",
      left: "$100 right now",          right: "$150 in exactly one year",    tag: "q4_time"     },
    { q: "Which gamble do you prefer?",
      left: "100% chance to get $40",  right: "20% chance to get $300",     tag: "q5_ev"       }
];

let currentIndex = 0, timerInterval, timeLeft;
const TOTAL_TIME = 8000;
let questionAnswered = false;  // flag to prevent double-recording or timeout race

const qText       = document.getElementById("question-text");
const leftText    = document.getElementById("left-text");
const rightText   = document.getElementById("right-text");
const timerFill   = document.getElementById("timer-fill");
const counterText = document.getElementById("question-counter-text");

function loadQuestion(index) {
    if (index >= questions.length) { endGame(); return; }
    questionAnswered = false;
    const q = questions[index];
    qText.style.opacity = "0";
    setTimeout(() => {
        qText.innerText = q.q;
        leftText.innerText = q.left;
        rightText.innerText = q.right;
        counterText.innerText = `Question ${index + 1} of ${questions.length}`;
        qText.style.transition = "opacity 0.25s";
        qText.style.opacity = "1";
    }, 180);
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TOTAL_TIME;
    timerFill.style.width = "100%";
    timerFill.style.background = "linear-gradient(90deg, var(--blue, #005BBB), var(--gold, #FFD700))";
    timerInterval = setInterval(() => {
        timeLeft -= 50;
        const pct = (timeLeft / TOTAL_TIME) * 100;
        timerFill.style.width = `${pct}%`;
        if (pct < 30) timerFill.style.background = "linear-gradient(90deg, var(--red, #E63946), var(--gold, #FFD700))";
        else if (pct < 60) timerFill.style.background = "linear-gradient(90deg, var(--gold, #FFD700), var(--blue, #005BBB))";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!questionAnswered) triggerTimeout();
        }
    }, 50);
}

function triggerTimeout() {
    document.getElementById("split-container").style.pointerEvents = "none";
    document.getElementById("split-container").style.opacity = "0.25";
    document.getElementById("timeout-overlay").style.display = "flex";
}

function recordAnswer(side) {
    if (questionAnswered) return;  // flag-based guard — immune to timer race
    questionAnswered = true;
    clearInterval(timerInterval);
    window.userResponses[questions[currentIndex].tag] = side;
    const el = document.getElementById(side === "left" ? "left-choice" : "right-choice");
    el.style.filter = "brightness(1.35)";
    setTimeout(() => { el.style.filter = ""; }, 160);
    currentIndex++;
    loadQuestion(currentIndex);
}

document.getElementById("left-choice").addEventListener("click",  () => recordAnswer("left"));
document.getElementById("right-choice").addEventListener("click", () => recordAnswer("right"));
document.getElementById("reset-btn").addEventListener("click", () => location.reload());

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 — REVEAL
// ─────────────────────────────────────────────────────────────────────────────
function endGame() {
    clearInterval(timerInterval);
    document.getElementById("game-screen").style.backgroundColor = "#F2EFE7";

    const r = window.userResponses;
    const isConsistent = r.q1_gain === r.q2_loss;
    const consistencyScore = isConsistent ? 100 : 0;

    let rationalPts = 0;
    if (r.q3_sunkcost === "right") rationalPts++;
    if (r.q4_time     === "right") rationalPts++;
    if (r.q5_ev       === "right") rationalPts++;
    const rationalityScore = Math.round((rationalPts / 3) * 100);

    let typicalPts = 0;
    if (r.q1_gain     === "left")  typicalPts++;
    if (r.q2_loss     === "right") typicalPts++;
    if (r.q3_sunkcost === "left")  typicalPts++;
    if (r.q4_time     === "left")  typicalPts++;
    if (r.q5_ev       === "left")  typicalPts++;
    const alikeScore = Math.round((typicalPts / 5) * 100);

    window.userScores = { consistencyScore, rationalityScore, alikeScore };

    // Melt
    ["timer-bar","question-counter-bar","question-text","split-container"]
        .forEach(id => document.getElementById(id).classList.add("melt-away"));

    // Build content
    buildArcMeters(consistencyScore, rationalityScore, alikeScore);
    buildBiasTags();
    buildPopBars();
    buildSummaryLine(isConsistent, rationalityScore, alikeScore);

    // Stagger in
    setTimeout(() => {
        document.getElementById("reveal-screen").classList.add("show-reveal");
        const delays = [600, 1500, 2800, 4000, 5200, 6200];
        document.querySelectorAll(".reveal-text").forEach((el, i) => {
            setTimeout(() => el.classList.add("fade-in-up"), delays[i] ?? 6200);
        });
    }, 900);

    setTimeout(animatePopBars, 4500);

    document.getElementById("start-scrolly-btn").addEventListener("click", () => {
        const game = document.getElementById("game-screen");
        game.style.transition = "opacity 0.9s ease";
        game.style.opacity = "0";
        setTimeout(() => {
            game.style.display = "none";
            const mc = document.getElementById("main-content");
            mc.style.display  = "block";
            mc.style.opacity  = "0";
            mc.style.transition = "opacity 0.6s ease";
            // Wait a full frame for layout to compute, THEN fade in + init scrollama
            requestAnimationFrame(() => requestAnimationFrame(() => {
                mc.style.opacity = "1";
                // Give the browser one more tick to paint layout before Scrollama measures
                setTimeout(initScrollytelling, 120);
            }));
        }, 900);
    });
}

// Arc meters
function buildArcMeters(consistency, rationality, alike) {
    const meters = [
        { label: "Consistent",    value: consistency,  color: "#005BBB" },
        { label: "Rational",      value: rationality,  color: "#E63946" },
        { label: "Like Everyone", value: alike,        color: "#DAA520" }
    ];
    const MW = 140, MH = 140, R = 54, SW = 11;
    const cont = d3.select("#arc-meters");

    meters.forEach(m => {
        const wrap = cont.append("div")
            .style("text-align","center")
            .style("display","flex")
            .style("flex-direction","column")
            .style("align-items","center");

        const svg = wrap.append("svg")
            .attr("width", MW).attr("height", MH)
            .style("overflow","visible");

        const g = svg.append("g").attr("transform",`translate(${MW/2},${MH/2})`);

        const bgArc = d3.arc()
            .innerRadius(R-SW).outerRadius(R)
            .startAngle(-Math.PI*0.75).endAngle(Math.PI*0.75);
        g.append("path").attr("d", bgArc()).attr("fill","rgba(0,0,0,0.07)");

        // Only render foreground arc if value > 0 — zero produces a corner artefact
        if (m.value > 0) {
            const fgArc = d3.arc()
                .innerRadius(R-SW).outerRadius(R)
                .startAngle(-Math.PI*0.75)
                .endAngle(-Math.PI*0.75)
                .cornerRadius(SW/2);

            const path = g.append("path").attr("d", fgArc()).attr("fill", m.color);
            const target = -Math.PI*0.75 + (m.value/100)*Math.PI*1.5;

            path.transition().duration(1500).delay(300).ease(d3.easeCubicOut)
                .attrTween("d", () => {
                    const interp = d3.interpolate(-Math.PI*0.75, target);
                    return t => { fgArc.endAngle(interp(t)); return fgArc(); };
                });
        }

        const valText = g.append("text")
            .attr("text-anchor","middle").attr("dy","0.38em")
            .style("font-family","'Roboto Mono', monospace")
            .style("font-size","1.6rem").style("font-weight","700")
            .style("fill", m.color).text("0%");

        valText.transition().duration(1500).delay(300).ease(d3.easeCubicOut)
            .tween("text", () => {
                const i = d3.interpolateRound(0, m.value);
                return t => { valText.text(`${i(t)}%`); };
            });

        wrap.append("div")
            .style("font-family","'Roboto Mono', monospace")
            .style("font-size","0.67rem")
            .style("letter-spacing","3px")
            .style("text-transform","uppercase")
            .style("color","#888")
            .style("margin-top","0.6rem")
            .text(m.label);
    });
}

// Bias tags
function buildBiasTags() {
    const r = window.userResponses;
    const biases = [
        { label: "Loss Aversion",     detected: r.q1_gain !== r.q2_loss,   note: "You flipped risk preference when the frame switched to losses" },
        { label: "Sunk Cost Fallacy", detected: r.q3_sunkcost === "left",  note: "You let an unrecoverable cost influence a forward decision"    },
        { label: "Present Bias",      detected: r.q4_time === "left",      note: "You chose $100 now over a guaranteed 50% return in a year"     },
        { label: "Risk Aversion",     detected: r.q5_ev === "left",        note: "You chose $40 certain over a $60 expected-value gamble"        }
    ];
    const cont = document.getElementById("bias-tags");
    biases.forEach(b => {
        const wrap = document.createElement("div");
        wrap.className = `bias-tag ${b.detected ? "detected" : "clear"}`;
        wrap.title = b.note;

        const labelEl = document.createElement("div");
        labelEl.className = "bias-tag-label";
        labelEl.textContent = b.label;

        const verdict = document.createElement("div");
        verdict.className = "bias-tag-verdict";
        verdict.textContent = b.detected ? "✗" : "✓";

        wrap.appendChild(labelEl);
        wrap.appendChild(verdict);
        cont.appendChild(wrap);
    });
}

// Population bars
const popData = [
    { label: "Chose sure $500 gain",  pct: 80, match: () => window.userResponses.q1_gain     === "left"  },
    { label: "Gambled to avoid loss", pct: 70, match: () => window.userResponses.q2_loss     === "right" },
    { label: "Fell for sunk cost",    pct: 65, match: () => window.userResponses.q3_sunkcost === "left"  },
    { label: "Took $100 now",         pct: 72, match: () => window.userResponses.q4_time     === "left"  },
    { label: "Chose $40 certain",     pct: 68, match: () => window.userResponses.q5_ev       === "left"  }
];

function buildPopBars() {
    const cont = document.getElementById("pop-bars-inner");
    popData.forEach(d => {
        const row   = document.createElement("div"); row.className = "pop-bar-row";
        const label = document.createElement("div"); label.className = "pop-bar-label"; label.textContent = d.label;
        const track = document.createElement("div"); track.className = "pop-bar-track";
        const fill  = document.createElement("div");
        fill.className = `pop-bar-fill ${d.match() ? "match" : "no-match"}`;
        fill.dataset.target = d.pct; fill.style.width = "0%";
        track.appendChild(fill);
        const pct = document.createElement("div"); pct.className = "pop-bar-pct"; pct.textContent = `${d.pct}%`;
        row.append(label, track, pct);
        cont.appendChild(row);
    });
}
function animatePopBars() {
    document.querySelectorAll(".pop-bar-fill").forEach(f => { f.style.width = `${f.dataset.target}%`; });
}

// Summary
function buildSummaryLine(isConsistent, rationalityScore, alikeScore) {
    let text;
    if (rationalityScore === 100)            text = "You think like an economist. Unsettlingly so.";
    else if (!isConsistent && alikeScore>=60) text = "You flipped on losses. Prospect Theory predicted you before you played.";
    else if (alikeScore >= 80)               text = "Every bias fired, right on schedule.";
    else if (alikeScore <= 20)               text = "You defied the crowd. The data is surprised.";
    else if (rationalityScore >= 67)         text = "Mostly rational — but the human slipped through.";
    else                                     text = "Beautifully, predictably human.";
    document.getElementById("reveal-summary").textContent = text;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 — SCROLLAMA
// Called AFTER main-content is visible and layout is painted
// ─────────────────────────────────────────────────────────────────────────────
function initScrollytelling() {
    const scroller = scrollama();
    scroller
        .setup({
            step:   "#scrolly .step",
            offset: 0.55,
            debug:  false,
        })
        .onStepEnter(response => {
            document.querySelectorAll(".step").forEach(s => s.classList.remove("is-active"));
            response.element.classList.add("is-active");
            if (typeof window.enterScene === "function") {
                window.enterScene(response.index + 1, response.direction);
            }
        })
        .onStepExit(response => {
            if (typeof window.exitScene === "function") {
                window.exitScene(response.index + 1, response.direction);
            }
            if (response.direction === "up") {
                response.element.classList.remove("is-active");
            }
        });

    window.addEventListener("resize", () => scroller.resize());
    // Wire the phase 2 button now that main-content is visible
    window.wirePhase2Button();
}

// Phase 2 bridge button — wired after game ends so phase2-content exists
window.wirePhase2Button = function() {
    const btn = document.getElementById("enter-phase2-btn");
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener("click", () => {
        const bridge = document.getElementById("phase2-bridge");
        if (bridge) {
            bridge.style.transition = "opacity 0.5s ease";
            bridge.style.opacity = "0";
            setTimeout(() => { bridge.style.display = "none"; }, 500);
        }
        if (typeof window.initPhase2 === "function") {
            setTimeout(() => window.initPhase2(), 300);
        }
    });
};

// wirePhase3Button is a no-op — phase3 entry handled by #enter-phase3-btn
// bibliography handled by tryWireBiblio below
window.wirePhase3Button = function() {};

// Wire phase 2 → phase 3 transition via the last step of phase 2
document.addEventListener("DOMContentLoaded", () => {
    // The phase2 end section has a button already handled by wirePhase2Button
    // We need the phase2 scrolly last step to show a "Continue to Real World" button
    // For now, add a simple trigger via the phase2-bridge end section
    // Note: enter-biblio-btn is in phase3-content which is always in DOM
    // Don't early-return here — let the observer run

    // Watch for phase2-content to become visible, then wire phase3
    const obs = new MutationObserver(() => {
        const p2 = document.getElementById("phase2-content");
        if (p2 && p2.style.display !== "none") {
            setTimeout(() => {
                // Add phase 3 trigger button to end of phase 2
                const p2end = document.getElementById("phase3-end");
                if (p2end && !p2end._wired) {
                    p2end._wired = true;
                    p2end.querySelector("button")?.addEventListener("click", () => {
                        if (typeof window.initPhase3 === "function") window.initPhase3();
                    });
                }
            }, 500);
            obs.disconnect();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
});

// Wire phase3 entry button — always present in DOM once phase2 is shown
document.addEventListener("DOMContentLoaded", () => {
    // Poll for the button since phase2 reveals it dynamically
    function tryWirePhase3() {
        const btn = document.getElementById("enter-phase3-btn");
        if (btn && !btn._wired) {
            btn._wired = true;
            btn.addEventListener("click", () => {
                btn.style.opacity = "0.4";
                btn.disabled = true;
                const bridge = document.getElementById("enter-phase3-bridge");
                if (bridge) { bridge.style.transition = "opacity 0.5s"; bridge.style.opacity = "0"; }
                if (typeof window.initPhase3 === "function") {
                    setTimeout(() => window.initPhase3(), 400);
                }
            });
        } else if (!btn) {
            setTimeout(tryWirePhase3, 500);
        }
    }
    tryWirePhase3();
});


// Wire bibliography button
document.addEventListener("DOMContentLoaded", () => {
    function tryWireBiblio() {
        const btn = document.getElementById("enter-biblio-btn");
        if (btn && !btn._biblioWired) {
            btn._biblioWired = true;
            btn.addEventListener("click", () => {
                btn.style.opacity = "0.4";
                btn.disabled = true;
                const bib = document.getElementById("bibliography-content");
                if (!bib) return;
                bib.style.display = "block";
                bib.style.opacity = "0";
                bib.style.transition = "opacity 0.7s ease";
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    bib.style.opacity = "1";
                    setTimeout(() => bib.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }));
            });
        } else if (!btn) {
            setTimeout(tryWireBiblio, 600);
        }
    }
    tryWireBiblio();
});

