/* ═══════════════════════════════════════════════════════════
   AGENTSHIELD — Dashboard Logic & Interactivity
   ═══════════════════════════════════════════════════════════ */

// ── Data from codebase analysis ──

const KEYWORDS = {
  // AI Security Terms
  "indirect prompt injection": { weight: 6, category: "ai-security" },
  "agent security": { weight: 6, category: "ai-security" },
  "tool poisoning": { weight: 6, category: "ai-security" },
  "model context protocol": { weight: 6, category: "ai-security" },
  "prompt injection": { weight: 5, category: "ai-security" },
  "llm security": { weight: 5, category: "ai-security" },
  "rag poisoning": { weight: 5, category: "ai-security" },
  "jailbreak": { weight: 4, category: "ai-security" },
  "mcp": { weight: 4, category: "ai-security" },
  "ai agent": { weight: 3, category: "ai-security" },
  "data exfiltration": { weight: 3, category: "ai-security" },
  "guardrail": { weight: 3, category: "ai-security" },
  "agentic": { weight: 3, category: "ai-security" },
  "autonomous agent": { weight: 3, category: "ai-security" },
  "adversarial": { weight: 2, category: "ai-security" },
  "llm": { weight: 2, category: "ai-security" },
  "red team": { weight: 2, category: "ai-security" },
  "alignment": { weight: 1, category: "ai-security" },
  // Frameworks
  "langchain": { weight: 4, category: "framework" },
  "llamaindex": { weight: 4, category: "framework" },
  "autogen": { weight: 4, category: "framework" },
  "crewai": { weight: 4, category: "framework" },
  "semantic kernel": { weight: 4, category: "framework" },
  "sandbox escape": { weight: 4, category: "attack" },
  "openai": { weight: 2, category: "framework" },
  "anthropic": { weight: 2, category: "framework" },
  "claude": { weight: 2, category: "framework" },
  "gpt-4": { weight: 1, category: "framework" },
  // Attack Classes
  "rce": { weight: 3, category: "attack" },
  "remote code execution": { weight: 3, category: "attack" },
  "ssrf": { weight: 2, category: "attack" },
  "privilege escalation": { weight: 2, category: "attack" },
};

const TRACKED_REPOS = [
  { name: "langchain-ai/langchain", tag: "framework", icon: "🦜" },
  { name: "langchain-ai/langgraph", tag: "framework", icon: "🕸️" },
  { name: "run-llama/llama_index", tag: "framework", icon: "🦙" },
  { name: "microsoft/autogen", tag: "framework", icon: "🤖" },
  { name: "crewAIInc/crewAI", tag: "framework", icon: "👥" },
  { name: "microsoft/semantic-kernel", tag: "framework", icon: "🧠" },
  { name: "modelcontextprotocol/servers", tag: "protocol", icon: "🔌" },
  { name: "anthropics/anthropic-sdk-python", tag: "provider", icon: "🅰️" },
  { name: "openai/openai-python", tag: "provider", icon: "🟢" },
  { name: "vllm-project/vllm", tag: "infra", icon: "⚡" },
  { name: "ollama/ollama", tag: "infra", icon: "🐫" },
  { name: "huggingface/transformers", tag: "infra", icon: "🤗" },
  { name: "protectai/rebuff", tag: "security", icon: "🛡️" },
  { name: "NVIDIA/NeMo-Guardrails", tag: "security", icon: "🟩" },
  { name: "mitre-atlas/atlas-data", tag: "security", icon: "📊" },
];

const RSS_FEEDS = [
  { name: "Embrace The Red", url: "embracethered.com" },
  { name: "Simon Willison", url: "simonwillison.net" },
  { name: "HiddenLayer", url: "hiddenlayer.com" },
  { name: "Protect AI", url: "protectai.com" },
  { name: "NCC Group Research", url: "research.nccgroup.com" },
  { name: "Trail of Bits", url: "blog.trailofbits.com" },
  { name: "Google Project Zero", url: "googleprojectzero.blogspot.com" },
  { name: "PortSwigger Research", url: "portswigger.net/research" },
  { name: "Hugging Face Blog", url: "huggingface.co/blog" },
  { name: "Adversa AI", url: "adversa.ai" },
];

const MODULES = [
  { icon: "⚙️", name: "config.py", desc: "Keywords, repos, feeds", color: "var(--color-amber)" },
  { icon: "🧩", name: "core.py", desc: "Finding type & scorer", color: "var(--color-cyan)" },
  { icon: "🚀", name: "main.py", desc: "Pipeline orchestrator", color: "var(--color-purple)" },
  { icon: "🤖", name: "llm_filter.py", desc: "Groq LLM filter", color: "var(--color-pink)" },
  { icon: "💬", name: "discord_notifier.py", desc: "Discord delivery", color: "var(--color-green)" },
  { icon: "📄", name: "arxiv_source.py", desc: "arXiv paper fetcher", color: "var(--color-cyan)" },
  { icon: "🚨", name: "nvd_source.py", desc: "NVD CVE fetcher", color: "var(--color-red)" },
  { icon: "🐙", name: "github_source.py", desc: "GitHub advisory/release", color: "var(--color-purple)" },
  { icon: "📡", name: "rss_source.py", desc: "RSS blog fetcher", color: "var(--color-amber)" },
];

const LAST_RUN = "2026-09-12T08:03:26Z";
const STATE_CAP = 2000;
const SEEN_IDS = 2000;

// ── Initialization ──

document.addEventListener("DOMContentLoaded", () => {
  initFadeObserver();
  initNavbar();
  initCounters();
  initLastRun();
  initPipelineAnimation();
  initSourcesChart();
  initKeywordsChart();
  initReposGrid();
  initFeedsGrid();
  initStateGauge();
  initArchDiagram();
});

// ── Fade-in Observer ──

function initFadeObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

// ── Navbar scroll effect ──

function initNavbar() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("navbar--scrolled", window.scrollY > 40);
  });
}

// ── Animated Counters ──

function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll("[data-counter]").forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.counter, 10);
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ── Last Run ──

function initLastRun() {
  const display = document.getElementById("last-run-display");
  const relative = document.getElementById("last-run-relative");
  if (!display) return;

  const date = new Date(LAST_RUN);
  display.textContent = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Relative time
  const diffMs = Date.now() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHrs > 24) {
    relative.textContent = `${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h ago`;
  } else if (diffHrs > 0) {
    relative.textContent = `${diffHrs}h ${diffMins}m ago`;
  } else {
    relative.textContent = `${diffMins}m ago`;
  }
}

// ── Pipeline Animation ──

function initPipelineAnimation() {
  const steps = document.querySelectorAll(".pipeline-step");
  steps.forEach((step, i) => {
    step.style.setProperty("--step-index", i);
  });

  // Auto-animate pipeline steps
  let activeIndex = 0;
  function highlightStep() {
    steps.forEach((s) => s.classList.remove("active"));
    steps[activeIndex].classList.add("active");
    activeIndex = (activeIndex + 1) % steps.length;
  }

  // Start after a short delay
  setTimeout(() => {
    highlightStep();
    setInterval(highlightStep, 2500);
  }, 1500);
}

// ── Sources Donut Chart ──

function initSourcesChart() {
  const ctx = document.getElementById("sources-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["arXiv Papers", "NVD CVEs", "GitHub Advisories & Releases", "RSS Blogs"],
      datasets: [
        {
          data: [40, 200, 75, 200],
          backgroundColor: [
            "rgba(0, 212, 255, 0.8)",
            "rgba(239, 68, 68, 0.8)",
            "rgba(124, 58, 237, 0.8)",
            "rgba(16, 185, 129, 0.8)",
          ],
          borderColor: [
            "rgba(0, 212, 255, 0.2)",
            "rgba(239, 68, 68, 0.2)",
            "rgba(124, 58, 237, 0.2)",
            "rgba(16, 185, 129, 0.2)",
          ],
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(255,255,255,0.7)",
            font: { family: "'Inter'", size: 11, weight: 500 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          backgroundColor: "rgba(6,6,15,0.95)",
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.8)",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: "'Inter'", weight: 600 },
          bodyFont: { family: "'Inter'" },
          callbacks: {
            label: (ctx) => ` ${ctx.label}: up to ${ctx.raw} items/run`,
          },
        },
      },
      animation: {
        animateRotate: true,
        duration: 1500,
      },
    },
  });
}

// ── Keywords Bar Chart ──

function initKeywordsChart() {
  const ctx = document.getElementById("keywords-chart");
  if (!ctx) return;

  const sorted = Object.entries(KEYWORDS).sort((a, b) => b[1].weight - a[1].weight);
  const labels = sorted.map(([k]) => k);
  const data = sorted.map(([, v]) => v.weight);
  const colors = sorted.map(([, v]) => {
    switch (v.category) {
      case "ai-security": return "rgba(0, 212, 255, 0.75)";
      case "framework":   return "rgba(124, 58, 237, 0.75)";
      case "attack":      return "rgba(244, 114, 182, 0.75)";
      default:            return "rgba(255,255,255,0.3)";
    }
  });
  const borderColors = sorted.map(([, v]) => {
    switch (v.category) {
      case "ai-security": return "rgba(0, 212, 255, 0.3)";
      case "framework":   return "rgba(124, 58, 237, 0.3)";
      case "attack":      return "rgba(244, 114, 182, 0.3)";
      default:            return "rgba(255,255,255,0.1)";
    }
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.75,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(6,6,15,0.95)",
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.8)",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { family: "'Inter'", weight: 600 },
          bodyFont: { family: "'Inter'" },
          callbacks: {
            label: (ctx) => {
              const kw = sorted[ctx.dataIndex];
              const cat = kw[1].category.replace("-", " ");
              return ` Weight: ${ctx.raw} · Category: ${cat}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "rgba(255,255,255,0.4)",
            font: { family: "'Inter'", size: 11 },
            stepSize: 1,
          },
          title: {
            display: true,
            text: "Weight",
            color: "rgba(255,255,255,0.4)",
            font: { family: "'Inter'", size: 11, weight: 500 },
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "rgba(255,255,255,0.6)",
            font: { family: "'JetBrains Mono'", size: 10.5 },
            padding: 8,
          },
        },
      },
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
      },
    },
  });
}

// ── Repos Grid ──

function initReposGrid() {
  const grid = document.getElementById("repos-grid");
  if (!grid) return;

  const tagLabels = {
    framework: "AI Framework",
    provider: "LLM Provider",
    security: "Security Tool",
    infra: "Infrastructure",
    protocol: "Protocol",
  };

  TRACKED_REPOS.forEach((repo, i) => {
    const [org, name] = repo.name.split("/");
    const card = document.createElement("div");
    card.className = "repo-card glass-card";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="repo-card__header">
        <div class="repo-card__avatar">${repo.icon}</div>
        <div>
          <div class="repo-card__name">${name}</div>
          <div class="repo-card__org">${org}</div>
        </div>
      </div>
      <span class="repo-card__tag repo-card__tag--${repo.tag}">${tagLabels[repo.tag] || repo.tag}</span>
    `;
    card.addEventListener("click", () => {
      window.open(`https://github.com/${repo.name}`, "_blank");
    });
    card.style.cursor = "pointer";
    grid.appendChild(card);
  });
}

// ── Feeds Grid ──

function initFeedsGrid() {
  const grid = document.getElementById("feeds-grid");
  if (!grid) return;

  RSS_FEEDS.forEach((feed, i) => {
    const card = document.createElement("div");
    card.className = "feed-card glass-card";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="feed-card__dot"></div>
      <div class="feed-card__info">
        <div class="feed-card__name">${feed.name}</div>
        <div class="feed-card__url">${feed.url}</div>
      </div>
      <span class="feed-card__type">Active</span>
    `;
    grid.appendChild(card);
  });
}

// ── State Gauge ──

function initStateGauge() {
  const ctx = document.getElementById("state-gauge");
  if (!ctx) return;

  const pct = (SEEN_IDS / STATE_CAP) * 100;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [pct, 100 - pct],
          backgroundColor: [
            createGradient(ctx, "rgba(245,158,11,0.8)", "rgba(239,68,68,0.8)"),
            "rgba(255,255,255,0.03)",
          ],
          borderColor: ["transparent", "transparent"],
          borderWidth: 0,
          borderRadius: pct < 100 ? 6 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "78%",
      rotation: -90,
      circumference: 360,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      animation: {
        animateRotate: true,
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
}

function createGradient(ctx, color1, color2) {
  const canvas = ctx.getContext ? ctx : ctx.canvas;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height || 240);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// ── Architecture Diagram ──

function initArchDiagram() {
  const diagram = document.getElementById("arch-diagram");
  if (!diagram) return;

  MODULES.forEach((mod) => {
    const el = document.createElement("div");
    el.className = "arch-module";
    el.style.setProperty("--module-color", mod.color);
    el.innerHTML = `
      <span class="arch-module__icon">${mod.icon}</span>
      <div class="arch-module__name">${mod.name}</div>
      <div class="arch-module__desc">${mod.desc}</div>
    `;
    diagram.appendChild(el);
  });
}
