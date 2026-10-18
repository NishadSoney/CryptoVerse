const { escapeHtml, renderHeader } = require('./header');

function padZero(num, size = 2) {
  let s = String(num);
  while (s.length < size) s = "0" + s;
  return s;
}

function renderLearn({
  user,
  allLessons = []
}) {
  const name = user.name || 'Alex';
  const xp = user.xp_total || 0;
  const current_level = user.current_level || 1;
  const streak = user.streak_days || 1;
  const cash = user.virtual_cash || 100000;

  const totalLessons = allLessons.length;
  let completedCount = 0;
  let runningCompletedCount = 0;
  let currentLesson = null;

  for (const l of allLessons) {
    if (l.is_completed) {
      completedCount++;
      runningCompletedCount++;
      l.state = 'complete';
    } else {
      const isUnlocked = (l.order_num === 1) || (runningCompletedCount >= (l.order_num - 1));
      if (isUnlocked) {
        if (!currentLesson) {
          l.state = 'current';
          currentLesson = l;
        } else {
          l.state = 'available';
        }
      } else {
        l.state = 'locked';
      }
    }
  }

  if (!currentLesson && totalLessons > 0) {
    currentLesson = allLessons[totalLessons - 1];
    currentLesson.state = 'complete';
  }

  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) : 0;
  const dashArray = 2 * Math.PI * 28;
  const dashOffset = dashArray * (1 - progressPercent);

  const headerHtml = renderHeader({
    active_page: 'learn',
    name,
    xp,
    current_level,
    streak,
    cash,
    title: 'Learn'
  });

  return `${headerHtml}

    <div class="lessons-content">
      <a href="/dashboard" class="back-link"><i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i> Back to overview</a>
      
      <section class="lessons-hero">
        <div>
          <div class="section-kicker"><span class="live-dot"></span> YOUR LEARNING PATH</div>
          <h1>Learn the language<br /><em>of the new economy.</em></h1>
          <p>Short, focused lessons that turn crypto complexity into clear, useful understanding.</p>
        </div>
        <div class="learning-progress">
          <div class="progress-orbit">
            <svg width="58" height="58" style="position: absolute; inset: 0; transform: rotate(-90deg);">
              <circle cx="29" cy="29" r="28" stroke="rgba(141,122,255,.2)" stroke-width="1" fill="none" />
              <circle cx="29" cy="29" r="28" stroke="#5de3ca" stroke-width="1.5" fill="none" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" />
            </svg>
            <div style="position: relative; display: flex; align-items: baseline; padding-top: 4px;">
              <strong>${completedCount}</strong><span>/${totalLessons}</span>
            </div>
          </div>
          <div>
            <span class="section-kicker">LESSONS COMPLETE</span>
            <strong>Keep your momentum</strong>
            <small>${xp} XP earned so far</small>
          </div>
        </div>
      </section>
      
      <section class="lesson-controls">
        <div style="display: flex; align-items: center; width: 100%; overflow-x: auto; padding: 0.5rem 0; margin: 0 -0.5rem; padding-left: 0.5rem; padding-right: 0.5rem; scrollbar-width: none;" class="lesson-indicators">
          ${allLessons.map((l, idx) => {
            let bg = 'rgba(255,255,255,0.1)';
            let color = '#94A3B8';
            let shadow = 'none';
            if (l.state === 'complete') {
              bg = 'rgba(93,227,202,0.2)';
              color = '#5de3ca';
            } else if (l.state === 'current') {
              bg = '#5de3ca';
              color = '#111';
              shadow = '0 0 10px rgba(93,227,202,0.5)';
            }
            const href = l.state !== 'locked' ? `/lesson?id=${l.id}` : '#';
            const cursor = l.state !== 'locked' ? 'pointer' : 'default';
            const lineBg = l.state === 'complete' ? '#5de3ca' : 'rgba(255,255,255,0.1)';
            const hasNext = idx < allLessons.length - 1;

            return `
              <a href="${href}" title="${escapeHtml(l.title)}" style="text-decoration: none; width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${bg}; color: ${color}; font-size: 0.7875rem; font-weight: 700; transition: all 0.3s; box-shadow: ${shadow}; cursor: ${cursor}; z-index: 2; position: relative;">
                ${idx + 1}
              </a>
              ${hasNext ? `<div style="flex-grow: 1; min-width: 1.5rem; height: 2px; background: ${lineBg}; transition: all 0.3s; z-index: 1;"></div>` : ''}
            `;
          }).join('')}
        </div>
      </section>

      ${currentLesson ? `
      <section class="featured-lesson">
        <div class="featured-art">
          <div class="art-orbit orbit-a"></div>
          <div class="art-orbit orbit-b"></div>
          <div class="art-core"><i data-lucide="book-open" style="width: 32px; height: 32px;"></i></div>
          <span class="art-label">${padZero(currentLesson.order_num)}</span>
        </div>
        <div class="featured-copy">
          <div class="card-topline">
            <span class="lesson-tag">${escapeHtml(currentLesson.category_title).toUpperCase()} &middot; LESSON ${padZero(currentLesson.order_num)}</span>
            <span class="current-pill"><span></span> CURRENT LESSON</span>
          </div>
          <h2>${escapeHtml(currentLesson.title)}</h2>
          <p>${escapeHtml(currentLesson.summary)}</p>
          <div class="lesson-meta">
            <span><i data-lucide="clock-3" style="width: 14px; height: 14px;"></i> ${currentLesson.estimated_minutes} minutes</span>
            <span><i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> ${currentLesson.xp_reward} XP</span>
          </div>
          <a href="/lesson?id=${currentLesson.id}" class="button" style="text-decoration: none; display: inline-flex;">
            Continue lesson <i data-lucide="arrow-right" style="width: 15px; height: 15px; margin-left: 6px;"></i>
          </a>
        </div>
        <div class="featured-index">
          ${padZero(currentLesson.order_num)}<span>/${padZero(totalLessons)}</span>
        </div>
      </section>
      ` : ''}
      
      <div class="lesson-section-heading">
        <div>
          <div class="section-kicker">THE CURRICULUM</div>
          <h2>Build your foundation</h2>
        </div>
        <span>Progress unlocks as you learn</span>
      </div>
      
      <section class="lesson-grid">
        ${allLessons.map(l => {
          if (currentLesson && l.state === 'current' && l.id === currentLesson.id) return '';
          const href = l.state !== 'locked' ? `/lesson?id=${l.id}` : '#';
          let stateIcon = '<i data-lucide="book-open" style="width: 15px; height: 15px;"></i>';
          let footerStatus = '';
          if (l.state === 'complete') {
            stateIcon = '<i data-lucide="check" style="width: 16px; height: 16px;"></i>';
            footerStatus = '<span class="complete-label">COMPLETE</span>';
          } else if (l.state === 'locked') {
            stateIcon = '<i data-lucide="lock" style="width: 14px; height: 14px;"></i>';
            footerStatus = '<i data-lucide="lock" style="width: 14px; height: 14px; margin-left: auto; color: #777489;"></i>';
          } else if (l.state === 'current') {
            stateIcon = '<i data-lucide="play" style="width: 15px; height: 15px; fill: currentColor;"></i>';
          } else if (l.state === 'available') {
            footerStatus = '<i data-lucide="arrow-right" style="width: 14px; height: 14px; margin-left: auto; color: #777489;"></i>';
          }

          return `
            <article class="lesson-card ${l.state}">
              <a href="${href}" style="text-decoration: none; color: inherit; display: block; height: 100%;">
                <div class="lesson-card-top">
                  <span class="lesson-state ${l.state}">
                    ${stateIcon}
                  </span>
                  <span class="lesson-number">${padZero(l.order_num)}</span>
                </div>
                <div class="section-kicker">${escapeHtml(l.category_title).toUpperCase()}</div>
                <h3>${escapeHtml(l.title)}</h3>
                <p>${escapeHtml(l.summary)}</p>
                <div class="lesson-card-footer">
                  <span><i data-lucide="clock-3" style="width: 13px; height: 13px;"></i> ${l.estimated_minutes} min</span>
                  <span>${l.xp_reward} XP</span>
                  ${footerStatus}
                </div>
              </a>
            </article>
          `;
        }).join('')}
      </section>

      <div class="dashboard-safety">
        <span>CryptoVerse is an educational simulation. No real money, wallets, or trades are involved.</span>
      </div>
    </div>
  </main>

  <script>
    if (typeof lucide !== 'undefined') lucide.createIcons();
  </script>
</body>
</html>`;
}

module.exports = {
  renderLearn
};
