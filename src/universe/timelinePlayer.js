/**
 * NetSentry — Temporal Syndicate Expansion Timeline Player
 * Problem Statement 26189 | Ministry of Home Affairs / NCRB
 * 
 * Simulates temporal network emergence across law enforcement FIR dates (2022 - 2026).
 * Animates chronological syndicate expansion outwards from the central Kingpin.
 */

export class TimelinePlayer {
  constructor(containerElement, onTimeChange) {
    this.container = containerElement;
    this.onTimeChange = onTimeChange;

    this.isPlaying = false;
    this.currentYear = 2026;
    this.timer = null;

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div id="timeline-controls-bar" style="
        position: absolute;
        bottom: 58px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 30;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid #E2E8F0;
        border-radius: 9999px;
        padding: 6px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
      ">
        <button id="btn-timeline-play" style="
          background: #0EA5E9;
          border: none;
          color: #FFFFFF;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        ">▶</button>
        <span style="font-size: 11px; font-weight: 700; color: #0F172A; min-width: 48px;" id="timeline-year-display">2026</span>
        <input type="range" id="timeline-slider" min="2022" max="2026" value="2026" step="1" style="
          width: 140px;
          cursor: pointer;
          accent-color: #0EA5E9;
        " />
        <span style="font-size: 10px; color: #64748B; font-weight: 600;">TEMPORAL PLAYBACK</span>
      </div>
    `;

    const btnPlay = document.getElementById('btn-timeline-play');
    const slider = document.getElementById('timeline-slider');
    const display = document.getElementById('timeline-year-display');

    slider?.addEventListener('input', (e) => {
      this.currentYear = parseInt(e.target.value);
      if (display) display.textContent = this.currentYear;
      if (this.onTimeChange) this.onTimeChange(this.currentYear);
    });

    btnPlay?.addEventListener('click', () => {
      this.togglePlay();
    });
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const btnPlay = document.getElementById('btn-timeline-play');
    const slider = document.getElementById('timeline-slider');
    const display = document.getElementById('timeline-year-display');

    if (this.isPlaying) {
      if (btnPlay) btnPlay.textContent = '⏸';
      this.timer = setInterval(() => {
        if (this.currentYear >= 2026) this.currentYear = 2022;
        else this.currentYear += 1;

        if (slider) slider.value = this.currentYear;
        if (display) display.textContent = this.currentYear;
        if (this.onTimeChange) this.onTimeChange(this.currentYear);
      }, 1200);
    } else {
      if (btnPlay) btnPlay.textContent = '▶';
      clearInterval(this.timer);
    }
  }
}
