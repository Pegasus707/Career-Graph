<template>
  <main>
    <section class="hero container">
      <div class="hero-text">
        <span class="eyebrow">Personalized IT career roadmaps</span>
        <h1>Tell CareerGraph where you are.<br />It shows you exactly what to learn next.</h1>
        <p class="lead">
          Pick a target career. CareerGraph compares it against the skills you already have,
          then builds a step-by-step roadmap — no generic course lists, no guesswork.
        </p>
        <div class="hero-actions">
          <router-link to="/signup" class="btn btn-primary">Build my career roadmap</router-link>
          <router-link to="/login" class="btn btn-secondary">Log in</router-link>
        </div>
      </div>
      <div class="hero-graph card">
        <div class="graph-node graph-root">Frontend Developer</div>
        <div class="graph-branch">
          <div class="graph-node graph-done">HTML — 100%</div>
          <div class="graph-node graph-progress">CSS — 60%</div>
          <div class="graph-node graph-todo">JavaScript — 0%</div>
          <div class="graph-node graph-todo">Vue — 0%</div>
        </div>
      </div>
    </section>

    <section class="container how">
      <h2>How it works</h2>
      <div class="steps">
        <div class="step card">
          <span class="step-num">01</span>
          <h3>Tell us your starting point</h3>
          <p>Education, current status, and the skills you already know — with proficiency, not just a checkbox.</p>
        </div>
        <div class="step card">
          <span class="step-num">02</span>
          <h3>Pick a target career</h3>
          <p>Frontend, Backend, and more careers are added over time without changing how the app works.</p>
        </div>
        <div class="step card">
          <span class="step-num">03</span>
          <h3>Get your gap-based roadmap</h3>
          <p>Skills you already have are marked complete. Everything else becomes a clear, ordered path.</p>
        </div>
        <div class="step card">
          <span class="step-num">04</span>
          <h3>Learn, track, and progress</h3>
          <p>Work through lessons, mark them complete, and watch your roadmap and dashboard update live.</p>
        </div>
      </div>
    </section>

    <footer class="container footer">
      <p>CareerGraph — a personalized IT career roadmap and learning platform.</p>
    </footer>
  </main>
</template>

<style scoped>
main { padding-bottom: 4rem; }
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
  padding-top: 4rem;
  padding-bottom: 4rem;
}
.eyebrow {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
h1 { font-size: 2.6rem; line-height: 1.15; margin: 0.75rem 0 1rem; }
.lead { font-size: 1.05rem; max-width: 46ch; }
.hero-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }

.hero-graph { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
.graph-node {
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border);
}
.graph-root { background: var(--accent); color: #ffffff; font-family: var(--font-display); box-shadow: var(--shadow-md); border: none; }
.graph-branch { display: flex; flex-direction: column; gap: 0.6rem; width: 100%; }
.graph-done { background: var(--done-soft); color: var(--done); border-color: #bbf0ce; }
.graph-progress { background: var(--progress-soft); color: var(--progress); border-color: #fde3a3; }
.graph-todo { background: var(--surface-2); color: var(--text-dim); }

.how { padding: 3rem 0; }
.how h2 { text-align: center; margin-bottom: 2rem; }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
.step-num { display: block; font-family: var(--font-display); color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem; }
.step h3 { font-size: 1.05rem; }
.step p { font-size: 0.9rem; }

.footer { border-top: 1px solid var(--border); padding-top: 2rem; margin-top: 2rem; }
.footer p { font-size: 0.85rem; }

@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; padding-top: 2rem; }
  h1 { font-size: 2rem; }
  .steps { grid-template-columns: 1fr 1fr; }
}
</style>
