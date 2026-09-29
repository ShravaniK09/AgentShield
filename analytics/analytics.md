# AgentShield // THREAT_ANALYTICS — Analytics Findings

Source of truth: `graphs.html` (546 lines, ~46KB, self-contained, no build step).
Open it directly in a browser. Every graph is a portable `<section class="tpanel">` drop-in for the 1-page agent dashboard (`index.html`).

## 1. What this module is

High-density analytical layer for the `ai-sec-tracker` pipeline:

```
arxiv + nvd + github + rss → dedupe → score (MIN_SCORE ≥ 3) → llm_filter (Groq) → discord → state.json
```

- Chart.js 4.4.1 via CDN (`chart.umd.min.js`), vanilla JS, zero backend required.
- All time-series are simulated with seeded spikes; swap points marked `// ← WIRE:` for `fetch('ai-sec-tracker/state.json')` / Actions summary feed.
- Neon-safe on pure black, JetBrains Mono + Inter, per-chart PNG export.

## 2. Global shell (applies to every graph)

- Top bar: `AGENTSHIELD / THREAT_ANALYTICS // v2.6`, prompt `root@agentshield:~/intel$ ./render_graphs --live --neon`, `SYSTEM ACTIVE` chip, live UTC clock, `PAUSE LIVE` + `EXPORT ALL` buttons.
- Hero: kicker `LIVE THREAT INTELLIGENCE · 4 SOURCES · LLM-FILTERED`, title `threat_analytics.render()`, range switcher 7D / 14D (default) / 30D that re-seeds time-series, hint that live mode appends intel every 2.4s.
- Ambient hacker layer: matrix-rain canvas (`#matrix`, 66ms tick, green/cyan/magenta glyphs), 44px grid, scanlines overlay, vignette, 3 glow blobs (green/cyan/magenta).
- Panel chrome: mac dots + `$` command bar, badge (`NEON AREA ×4`, `CVSS`, `SPIDER ×8`, etc.), `PNG` export button, footer legend strip, blinking `█` cursor on every `h3`.

## 3. KPI strip (4 cards)

| # | Metric | Value | Sub / delta |
|---|--------|-------|-------------|
| 1 | INTERCEPTED | 1284 | findings scored ≥ threshold (14d); +12.4%, ▲ +86 vs prior window |
| 2 | CRITICAL VECTORS | 37 / 515 fetched | CVEs + prompt-injection chains; 9 ACTIVE, 3 CRITICAL need triage |
| 3 | MTTD · PIPELINE | 43 min | fetch → discord delivery; −18%, faster after LLM rewrite |
| 4 | FILTER PRECISION | 94.2% | false-positive kill rate (Groq LLM); 61 coincidental drops / run |

Animated count-up on load (~1600ms ease-out cubic).

## 4. Graph catalog (9 panels)

### [01] THREAT PULSE // VOLUME STREAM — `p-pulse`, `span8`, canvas `pulseChart`
- Stacked neon area ×4, tension 0.42, ranges 7/14/30D.
- Series per day: arXiv `#00e5ff` (4–22/day), NVD `#ff3131` (6–30/day), GitHub `#a855f7` (3–14/day), RSS `#00ff41` (8–32/day); scripted spikes at `n-4` (×1.9) and `n-9` (×1.6) = exploit drops / framework releases.
- Footer: live per-source totals (`lgArxiv`, `lgNvd`, `lgGh`, `lgRss`) + peak-day readout (`peakDay`).
- Command: `tail -f threat_pulse --stack-by-source --range=14D`.

### [02] SEVERITY MATRIX — `p-sev`, `span4`, canvas `sevChart`
- Doughnut, cutout 62%: CRITICAL 8 (`#ff3131`), HIGH 21 (`#ffb000`), MEDIUM 34 (`#facc15`), LOW 12 (`#00ff41`).
- Encodes CVE floor-boost rule: Crit 10 / High 7 / Med 4 auto-pass threshold ≥ 3 (tooltip shows floor per slice).
- Footer: per-severity counts + pass-rate 94.7%.
- Command: `cvss_matrix --floor-boost`.

### [03] ATTACK-VECTOR RADAR — `p-radar`, `span4`, canvas `radarChart`
- 8 axes: prompt injection, jailbreak, tool poison, RCE, data-exfil, sandbox escape, SSRF, priv-esc.
- THIS RUN `#ff2bd6`: [92, 74, 81, 58, 47, 63, 39, 44] vs 30D BASELINE `#00e5ff` dashed: [70, 62, 59, 55, 50, 48, 42, 40].
- Finding: top vector prompt-injection; Δ +22% tool-poisoning vs baseline = emerging TTP.
- Command: `radar --vectors=8`.

### [04] SOURCE THROUGHPUT — `p-through`, `span4`, canvas `thruChart`
- Grouped 7D bars MON–SUN; per-source colors matching pulse.
- Data: arXiv [22,18,31,14,26,9,12]; NVD [28,34,19,41,25,12,16]; GitHub [12,9,14,11,16,5,8]; RSS [30,26,33,29,35,18,22].
- Caps from sub-text: arXiv 40 · NVD 200 · GH 75 · RSS 200 max/run. Footer: health 4/4 OK, slowest nvd 41s.
- Command: `throughput --per-source --7d`.

### [05] KILL-CHAIN FUNNEL — `p-funnel`, `span4`, div `funnel` (no canvas)
- 5 animated gradient bars: FETCH 515 (100%, cyan→purple) → DEDUPE 216 unique (42%) → SCORE ≥3 63 (12.2%) → LLM FILTER 41 survive Groq (8%) → POST 18 digests (3.5%, green→cyan).
- Attrition callouts: dedupe −58%, keyword gate −71%, LLM −34%; end-to-end yield 3.5%, 18 posted.
- Command: `pipeline --funnel main.py`.

### [06] KEYWORD SIGNAL HEATMAP — `p-heat`, `span12`, div `heat`
- All 32 `config.py` signals with (keyword, weight 1–6, category, 7d hits). Glow = `(w/6)×0.45 + (hits/91)×0.55`.
- Categories: AI-SEC green (`#00ff41`), FRAMEWORK cyan (`#00e5ff`), ATTACK magenta (`#ff2bd6`); weight shown as `▮/▯` strip.
- Notable cells: `llm` w2 ×91 hits, `mcp` w4 ×88 (noisiest), `prompt injection` w5 ×64, `tool poisoning` w6 ×41 (hottest high-signal), `alignment` w1 ×20, `gpt-4` w1 ×27.
- Full list: tool poisoning 6/41, indirect prompt injection 6/33, agent security 6/29, model context protocol 6/22, prompt injection 5/64, llm security 5/38, rag poisoning 5/19, jailbreak 4/47, mcp 4/88, langchain 4/52, llamaindex 4/21, autogen 4/18, crewai 4/16, semantic kernel 4/12, sandbox escape 4/15, ai agent 3/57, data exfiltration 3/26, guardrail 3/24, agentic 3/31, autonomous agent 3/17, rce 3/35, remote code execution 3/28, adversarial 2/44, llm 2/91, red team 2/23, openai 2/48, anthropic 2/36, claude 2/33, ssrf 2/14, privilege escalation 2/16, alignment 1/20, gpt-4 1/27.
- Gate note: `MIN_SCORE = 3`. Command: `heatmap --keywords=32 --weights=config.py`.

### [07] REPO RISK LEADERBOARD — `p-repos`, `span7`, div `leaders`
- Risk = `0.5·advisories + 0.3·releases + 0.2·keyword hits`; top-3 highlighted; click-through to GitHub search.
- Ranking: langchain 87 (12 adv · 8 rel, purple), transformers 81 (9 adv · 11 rel, cyan), openai-python 76 (4 adv · 14 rel, green), vllm 69 (amber), servers (modelcontextprotocol) 66 (magenta), ollama 58 (blue), crewAI 54 (purple), semantic-kernel 49 (cyan), rebuff 47 (red), autogen 43 (yellow).
- Header claims 15 repos / sub-text says 14 tracked + ATLAS feed (10 rows rendered).
- Command: `rank --repos=15 --by=risk_score`.

### [08] MITRE ATLAS TACTICS + LLM FILTER — `p-atlas`, `span5`, div `atlas` + canvas `llmChart`
- ATLAS bars (5): Reconnaissance AML.T0000 papers 74 (cyan), Initial Access AML.T0001 prompt-inject 88 (magenta), ML Attack Staging AML.T0010 jailbreak 69 (purple), Exfiltration AML.T0024 RCE/tools 52 (red), Impact AML.T0034 sandbox 41 (amber).
- LLM efficacy horizontal bars: fetched 216 → keyword pass 63 → LLM kept 41 → posted 18; title `LLM FILTER EFFICACY ▸ 34% cut, 94.2% precision`.
- Footer: precision 94.2%, 112 one-liner rewrites, model `groq / llama-3.3-70b`.
- Command: `atlas_map + llm_audit`.

### [09] LIVE INTEL STREAM // SYSLOAD — `p-live`, `span12`, div `feed` + gauges
- Simulated `main.py` tail: 14 seed lines then 1 line / 2.4s (capped at 60 rows, auto-scroll), CLEAR button, pause via top bar.
- Rotating sources (`arxiv_source.py`, `nvd_source.py`, `github_source.py`, `rss_source.py`) and messages: fetched N, scored N ≥ 3, dedupe new/unique, LLM kept/rewrote, discord chunk → 200 OK, state.json persisted, CVE-YYYY-N floor boost, release vX.Y.Z detected.
- Gauges: FETCH LOAD 23% (green→cyan), STATE 2000/2000 100% (amber→red, full), DISCORD PIPE 891 kb/s 64% (cyan→purple); CPU/NET jitter live.
- Command: `watch -n 2 ./pipeline --stream --sysload`.

## 5. Design system (from `:root` + classes)

- Palette: `--grn #00ff41`, `--cyn #00e5ff`, `--pur #a855f7`, `--mag #ff2bd6`, `--red #ff3131`, `--amb #ffb000`, `--ylw #facc15`, `--blu #3b82f6`; bg `#030309`, panels `rgba(10-14,12-17,22-30,.86-.92)`, lines green 14% / white 7%.
- Type: JetBrains Mono (charts + UI), Inter (headings fallback); Chart defaults font Mono, tick color `rgba(139,147,167,.9)` size 9.5, grid `rgba(255,255,255,.055)`.
- Variant hover glows: default green, `.tpanel--cy/.mag/.pur/.red/.amb` recolor border + shadow.
- Grid: 12-col, `span8/span7/span5/span4/span12`; chart heights 300px (pulse 340, small 250, LLM 170, feed 300 max); responsive collapse ≤1080px single column, KPIs 4→2→1.
- Badges: `tb-grn/tb-cyn/tb-mag/tb-red/tb-amb/tb-pur`; feed color classes `f-t/f-ok/f-cy/f-mg/f-rd/f-am/f-pu`.

## 6. Interactions & functions (script inventory)

- `pulseData(n)` + `drawPulse()` + `#rangeSeg` handler (7/14/30D reseed, totals + peak recompute).
- `dl(id,name)` single PNG export; `exportAll()` exports 5 Chart.js canvases staggered 350ms.
- `toggleLive(btn)` pauses/resumes feed + gauge jitter; `clearFeed()` empties terminal.
- Counters via `[data-count]` + requestAnimationFrame; UTC clock 1s tick; `footMeta` stamps seed + range + ISO time.
- Matrix rain IIFE; funnel/ATLAS bars animate width on load (300–400ms delay).

## 7. Integration into `index.html`

1. Copy any `<section class="tpanel" id="p-*">…</section>` verbatim.
2. Copy its matching JS block (marked `[01]`–`[09]`) + keep the Chart.js 4.4.1 CDN script tag.
3. Copy needed CSS: base `.tpanel/.tbar/.tbody/.tfoot` + per-panel `.cwrap/.funnel/.heat/.lb/.atlas/.feed/.sys/.gauge` + `:root` tokens.
4. Wire data: replace `pulseData`, `KW`, `REPOS`, `ATLAS`, `FUN`, severity array, radar arrays with `fetch()` results; hooks already flagged `// ← WIRE:`.
5. Keep IDs unique (`pulseChart`, `sevChart`, `radarChart`, `thruChart`, `llmChart`, `funnel`, `heat`, `leaders`, `atlas`, `feed`, `matrix`, `rangeSeg`, `clock`).

## 8. Key analytical takeaways

- Pipeline is dedupe-dominated: 515 → 216 (−58%), then keyword gate is the sharpest cut (216 → 63, −71%); LLM removes another third; final yield 3.5%.
- Highest-signal keywords (w6: tool poisoning, indirect prompt injection, agent security, model context protocol) are rarer than noisy ones (`llm` ×91, `mcp` ×88) — the LLM layer is load-bearing, not cosmetic.
- Radar bulge (+22% tool-poisoning) + ATLAS Initial Access 88 + langchain risk 87 converge on one story: agent-framework tool abuse is the current spike.
- State is at capacity (2000/2000) — persistence/eviction behavior deserves a real gauge wired to `state.json`, not a static 100%.
- NVD is the slowest fetcher (41s) and highest-volume CVE source; RSS has the steadiest baseline throughput.
