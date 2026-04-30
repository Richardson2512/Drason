/* global React, Stage, Sprite, useTime, useSprite, Easing, interpolate, animate */

// =============================================================================
// Superkabe product intro — 38s, 1920x1080
// 0.0 – 4.0   Brand mark reveal
// 4.0 – 8.5   AI prompt → sequence drafted
// 8.5 – 13.5  Email validation pipeline
// 13.5 – 18.0 Mailbox health board
// 18.0 – 22.5 Bounce → auto-pause
// 22.5 – 28.0 5-phase healing
// 28.0 – 33.0 Native integrations
// 33.0 – 38.0 Closing lockup
// =============================================================================

const C = {
  cream50: '#FFFBF4', cream100: '#FCEFD8', cream300: '#EFD09A',
  orange500: '#F5A742', orange600: '#E68B1F', orange700: '#B36710', orange50: '#FFF3E0',
  ink1000: '#0A0A0B', ink800: '#232329', ink500: '#6E6E78', ink300: '#B6B6BE', ink200: '#D9D9DD', ink100: '#ECECEE', ink50: '#F6F6F7',
  green500: '#1B9D4A', green700: '#0F6A30', green50: '#E6F6EA',
  yellow500: '#E0A60E', yellow700: '#8A640A', yellow50: '#FFF6D6',
  red500: '#DA3A22', red700: '#9A2412', red50: '#FCE7E4',
};
const FONT = 'Inter, system-ui, -apple-system, sans-serif';
const MONO = 'JetBrains Mono, ui-monospace, Menlo, monospace';

// ── Correct Superkabe mark: orange asterisk fills only the negative space between four dots
function Mark({ size = 200, asterisk = true, blackDot = true, dotScales = [1,1,1,1], maskId = 'sk-mark-mask' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {asterisk && (
        <>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100" height="100" fill="#fff"/>
              <circle cx="26" cy="26" r="27" fill="#000"/>
              <circle cx="74" cy="26" r="27" fill="#000"/>
              <circle cx="26" cy="74" r="27" fill="#000"/>
              <circle cx="74" cy="74" r="27" fill="#000"/>
            </mask>
          </defs>
          <rect x="20" y="20" width="60" height="60" fill={C.orange500} mask={`url(#${maskId})`}/>
        </>
      )}
      <circle cx="26" cy="26" r={23 * dotScales[0]} fill={C.cream100}/>
      <circle cx="74" cy="26" r={23 * dotScales[1]} fill={C.cream100}/>
      <circle cx="26" cy="74" r={23 * dotScales[2]} fill={C.cream100}/>
      {blackDot && <circle cx="74" cy="74" r={25 * dotScales[3]} fill={C.ink1000}/>}
    </svg>
  );
}

function Pill({ tone = 'ok', children, style }) {
  const p = {
    ok:      { bg: C.green50,  fg: C.green700,  d: C.green500 },
    warn:    { bg: C.yellow50, fg: C.yellow700, d: C.yellow500 },
    bad:     { bg: C.red50,    fg: C.red700,    d: C.red500 },
    protect: { bg: C.orange50, fg: C.orange700, d: C.orange500 },
    neutral: { bg: C.ink50,    fg: C.ink800,    d: C.ink500 },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 999,
      fontSize: 16, fontWeight: 700, fontFamily: MONO, color: p.fg, background: p.bg,
      ...style,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: p.d }} />
      {children}
    </span>
  );
}

function Eyebrow({ children, style }) {
  return <div style={{ fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: C.ink500, marginBottom: 18, ...style }}>{children}</div>;
}

// ============================================================================
// SCENE 1 — Brand mark reveal (0 – 4.0s)
// ============================================================================
function Scene1() {
  return (
    <Sprite start={0} end={4.0}>
      {({ localTime }) => {
        const t = localTime;
        const dotTL = animate({ from: 0, to: 1, start: 0.1, end: 1.0, ease: Easing.easeOutBack })(t);
        const dotTR = animate({ from: 0, to: 1, start: 0.22, end: 1.12, ease: Easing.easeOutBack })(t);
        const dotBL = animate({ from: 0, to: 1, start: 0.34, end: 1.24, ease: Easing.easeOutBack })(t);
        const dotBR = animate({ from: 0, to: 1, start: 1.05, end: 1.5, ease: Easing.easeOutBack })(t);
        const orange = animate({ from: 0, to: 1, start: 1.4, end: 2.0, ease: Easing.easeOutCubic })(t);
        const settleX = animate({ from: 0, to: -340, start: 2.4, end: 3.1, ease: Easing.easeInOutCubic })(t);
        const wmOp = animate({ from: 0, to: 1, start: 2.7, end: 3.2, ease: Easing.easeOutCubic })(t);
        const wmX = animate({ from: 24, to: 0, start: 2.7, end: 3.2, ease: Easing.easeOutCubic })(t);
        const exitOp = animate({ from: 1, to: 0, start: 3.7, end: 4.0, ease: Easing.easeInCubic })(t);

        return (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: exitOp }}>
            <div style={{ position: 'relative', transform: `translateX(${settleX}px)` }}>
              <svg viewBox="0 0 100 100" width="380" height="380" style={{ display: 'block' }}>
                <defs>
                  <mask id="s1-mask" maskUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="100" height="100" fill="#fff"/>
                    <circle cx="26" cy="26" r={27 * dotTL} fill="#000"/>
                    <circle cx="74" cy="26" r={27 * dotTR} fill="#000"/>
                    <circle cx="26" cy="74" r={27 * dotBL} fill="#000"/>
                    <circle cx="74" cy="74" r={27 * dotBR} fill="#000"/>
                  </mask>
                </defs>
                <rect x="20" y="20" width="60" height="60" fill={C.orange500} opacity={orange} mask="url(#s1-mask)"/>
                <circle cx="26" cy="26" r={23 * dotTL} fill={C.cream100}/>
                <circle cx="74" cy="26" r={23 * dotTR} fill={C.cream100}/>
                <circle cx="26" cy="74" r={23 * dotBL} fill={C.cream100}/>
                <circle cx="74" cy="74" r={25 * dotBR} fill={C.ink1000}/>
              </svg>
            </div>
            <div style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: `translate(${-100 + wmX}px, -50%)`,
              opacity: wmOp,
              fontFamily: FONT, fontSize: 110, fontWeight: 600, letterSpacing: '-0.04em', color: C.ink1000,
            }}>Superkabe</div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 2 — AI prompt (4.0 – 8.5s)
// ============================================================================
const PROMPT = 'Founder reaching out to Series A B2B SaaS — friendly, 90 words.';
function Scene2() {
  return (
    <Sprite start={4.0} end={8.5}>
      {({ localTime }) => {
        const op = interpolate([0, 0.4, 3.9, 4.5], [0, 1, 1, 0], Easing.easeOutCubic);
        const charsRevealed = Math.min(PROMPT.length, Math.floor(interpolate([0.3, 1.9], [0, PROMPT.length], Easing.linear)(localTime)));
        const draftFade = animate({ from: 0, to: 1, start: 2.2, end: 2.8, ease: Easing.easeOutCubic })(localTime);
        const sparkle = animate({ from: 0, to: 1, start: 1.9, end: 2.3, ease: Easing.easeOutCubic })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <Eyebrow>One prompt · drafted by AI</Eyebrow>
            <div style={{
              background: '#fff', border: `1px solid ${C.ink200}`, borderRadius: 14, padding: '28px 36px',
              fontFamily: FONT, fontSize: 36, color: C.ink1000, fontWeight: 500,
              boxShadow: '0 1px 2px rgba(10,10,11,0.06)',
              display: 'flex', alignItems: 'center', gap: 18,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: C.orange500, flexShrink: 0, display: 'grid', placeItems: 'center', color: C.ink1000, fontSize: 16, fontWeight: 700 }}>✦</div>
              <span>{PROMPT.slice(0, charsRevealed)}<span style={{ opacity: localTime % 0.6 < 0.3 && localTime < 2.0 ? 1 : 0, color: C.orange500 }}>▍</span></span>
            </div>

            <div style={{
              marginTop: 32, opacity: draftFade, transform: `translateY(${(1 - draftFade) * 12}px)`,
              background: C.cream50, border: `1px solid ${C.cream300}`, borderRadius: 14, padding: '32px 36px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <Pill tone="protect" style={{ fontSize: 14, padding: '4px 12px' }}>AI · CLAUDE</Pill>
                <span style={{ fontSize: 16, color: C.ink500, opacity: sparkle }}>3-step sequence drafted in 0.8s</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 600, color: C.ink1000, letterSpacing: '-0.01em', marginBottom: 8 }}>Quick question, {'{{first_name}}'}</div>
              <div style={{ fontSize: 20, lineHeight: 1.55, color: C.ink800 }}>
                Saw {'{{company}}'} just hired three SDRs — fast-moving team. We help groups your size keep their cold-email infrastructure healthy when volume jumps from warmup to live…
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 3 — Email validation pipeline (8.5 – 13.5s)
// ============================================================================
const VAL_STAGES = [
  { n: 1, label: 'Syntax' },
  { n: 2, label: 'MX record' },
  { n: 3, label: 'Disposable' },
  { n: 4, label: 'Catch-all' },
  { n: 5, label: 'MillionVerifier' },
];
const VAL_LEADS = [
  { email: 'alex@acme.com',         result: 'VALID',    tone: 'ok',   stage: 4 },
  { email: 'priya@temp-mail.io',    result: 'BLOCKED',  tone: 'bad',  stage: 3 },
  { email: 'sam@catchall.dev',      result: 'VERIFIED', tone: 'ok',   stage: 5 },
  { email: 'jordan@xyz.',           result: 'BLOCKED',  tone: 'bad',  stage: 1 },
];
function Scene3() {
  return (
    <Sprite start={8.5} end={13.5}>
      {({ localTime }) => {
        const op = interpolate([0, 0.5, 4.4, 5.0], [0, 1, 1, 0], Easing.easeOutCubic);
        const stagesProg = animate({ from: 0, to: 5, start: 0.4, end: 2.4, ease: Easing.easeInOutCubic })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <Eyebrow>Pre-send · email validation</Eyebrow>
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 40 }}>Five-stage pipeline. Bad leads never reach a sender.</div>

            {/* Stage rail */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 60 }}>
              <div style={{ position: 'absolute', top: 30, left: '10%', right: '10%', height: 3, background: C.ink200, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 30, left: '10%', width: `${Math.min(1, stagesProg / 5) * 80}%`, height: 3, background: C.orange500, borderRadius: 2 }} />
              {VAL_STAGES.map((s, i) => {
                const done = stagesProg >= i + 1;
                const active = stagesProg >= i && stagesProg < i + 1;
                return (
                  <div key={s.n} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 999, margin: '0 auto 14px',
                      display: 'grid', placeItems: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 22,
                      background: done ? C.orange500 : '#fff',
                      border: `3px solid ${done ? C.orange500 : active ? C.orange500 : C.ink200}`,
                      color: done ? C.ink1000 : active ? C.orange700 : C.ink500,
                      boxShadow: active ? `0 0 0 8px rgba(245,167,66,0.18)` : 'none',
                    }}>{done ? '✓' : s.n}</div>
                    <div style={{ fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, color: done || active ? C.ink1000 : C.ink500 }}>{s.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Lead results */}
            <div style={{ background: '#fff', border: `1px solid ${C.ink200}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(10,10,11,0.06)' }}>
              {VAL_LEADS.map((l, i) => {
                const rowIn = animate({ from: 0, to: 1, start: 2.4 + i * 0.18, end: 2.7 + i * 0.18, ease: Easing.easeOutCubic })(localTime);
                return (
                  <div key={l.email} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.6fr 1fr',
                    padding: '18px 24px',
                    borderBottom: i < VAL_LEADS.length - 1 ? `1px solid ${C.ink100}` : 'none',
                    fontSize: 20, opacity: rowIn, transform: `translateX(${(1 - rowIn) * -16}px)`,
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 18 }}>{l.email}</div>
                    <div style={{ fontFamily: MONO, fontSize: 16, color: C.ink500 }}>
                      {l.stage === 1 ? 'Stage 1 · Syntax fail' : l.stage === 3 ? 'Stage 3 · Disposable' : l.stage === 4 ? 'Stage 4 · Syntax + MX' : 'Stage 5 · MillionVerifier'}
                    </div>
                    <div><Pill tone={l.tone}>{l.result}</Pill></div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, fontSize: 18, color: C.ink500, fontFamily: MONO }}>
              <span style={{ color: C.green700, fontWeight: 700 }}>2 valid</span> · <span style={{ color: C.red700, fontWeight: 700 }}>2 blocked</span> · hard bounces prevented
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 4 — Mailbox health board (13.5 – 18.0s)
// ============================================================================
const ROWS = [
  { mb: 'rob@send.superkabe.com',   esp: 'gmail',   bounce: '0.4%', tone: 'ok',   state: 'GREEN' },
  { mb: 'jess@send.superkabe.com',  esp: 'outlook', bounce: '0.7%', tone: 'ok',   state: 'GREEN' },
  { mb: 'amir@out.superkabe.com',   esp: 'gmail',   bounce: '0.9%', tone: 'ok',   state: 'GREEN' },
  { mb: 'devon@send.superkabe.com', esp: 'gmail',   bounce: '0.3%', tone: 'ok',   state: 'GREEN' },
  { mb: 'priya@out.superkabe.com',  esp: 'outlook', bounce: '1.1%', tone: 'ok',   state: 'GREEN' },
];
function Scene4() {
  return (
    <Sprite start={13.5} end={18.0}>
      {({ localTime }) => {
        const op = interpolate([0, 0.5, 3.9, 4.5], [0, 1, 1, 0], Easing.easeOutCubic);
        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <Eyebrow style={{ marginBottom: 8 }}>Sending · live</Eyebrow>
                <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em' }}>Every mailbox watched</div>
              </div>
              <div style={{ display: 'flex', gap: 28 }}>
                {[
                  { label: 'GREEN', value: Math.floor(animate({ from: 0, to: 18, start: 0.5, end: 1.4, ease: Easing.easeOutCubic })(localTime)), tone: C.green700 },
                  { label: 'YELLOW', value: Math.floor(animate({ from: 0, to: 4, start: 0.7, end: 1.5, ease: Easing.easeOutCubic })(localTime)), tone: C.yellow700 },
                  { label: 'RED', value: Math.floor(animate({ from: 0, to: 2, start: 0.9, end: 1.7, ease: Easing.easeOutCubic })(localTime)), tone: C.red700 },
                ].map(k => (
                  <div key={k.label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, letterSpacing: '0.08em', fontWeight: 600, color: C.ink500 }}>{k.label}</div>
                    <div style={{ fontSize: 48, fontWeight: 600, color: k.tone, fontFamily: MONO, lineHeight: 1 }}>{k.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${C.ink200}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(10,10,11,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 24px', background: C.ink50, fontSize: 14, letterSpacing: '0.06em', fontWeight: 700, color: C.ink500, textTransform: 'uppercase', borderBottom: `1px solid ${C.ink200}` }}>
                <div>Mailbox</div><div>ESP</div><div>Bounce</div><div>Health</div>
              </div>
              {ROWS.map((r, i) => {
                const rowIn = animate({ from: 0, to: 1, start: 0.6 + i * 0.09, end: 1.0 + i * 0.09, ease: Easing.easeOutCubic })(localTime);
                return (
                  <div key={r.mb} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '18px 24px', borderBottom: i < ROWS.length - 1 ? `1px solid ${C.ink100}` : 'none',
                    fontSize: 20, opacity: rowIn, transform: `translateX(${(1 - rowIn) * -20}px)`,
                  }}>
                    <div style={{ fontFamily: MONO, fontSize: 18 }}>{r.mb}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18, color: C.ink500 }}>{r.esp}</div>
                    <div style={{ fontFamily: MONO, fontSize: 18 }}>{r.bounce}</div>
                    <div><Pill tone={r.tone}>{r.state}</Pill></div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 5 — Bounce → auto-pause (18.0 – 22.5s)
// ============================================================================
function Scene5() {
  return (
    <Sprite start={18.0} end={22.5}>
      {({ localTime }) => {
        const op = interpolate([0, 0.4, 3.9, 4.5], [0, 1, 1, 0], Easing.easeOutCubic);
        const bouncePct = animate({ from: 0.4, to: 4.2, start: 0.4, end: 1.8, ease: Easing.easeOutCubic })(localTime);
        const tone = bouncePct < 1.5 ? 'ok' : bouncePct < 2.5 ? 'warn' : 'bad';
        const state = tone === 'ok' ? 'GREEN' : tone === 'warn' ? 'YELLOW' : 'RED';
        const stampScale = animate({ from: 0.7, to: 1.0, start: 2.2, end: 2.5, ease: Easing.easeOutBack })(localTime);
        const stampOp = animate({ from: 0, to: 1, start: 2.2, end: 2.45, ease: Easing.easeOutCubic })(localTime);
        const capOp = animate({ from: 0, to: 1, start: 2.8, end: 3.3, ease: Easing.easeOutCubic })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <Eyebrow>Bounce threshold crossed</Eyebrow>
            <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 40 }}>Protection takes over.</div>

            <div style={{
              background: '#fff', border: `1px solid ${C.ink200}`, borderRadius: 14, padding: '32px 40px',
              display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr', alignItems: 'center', gap: 24,
              boxShadow: '0 4px 12px rgba(10,10,11,0.08)', position: 'relative',
            }}>
              <div>
                <div style={{ fontSize: 14, letterSpacing: '0.06em', fontWeight: 700, color: C.ink500, textTransform: 'uppercase' }}>Mailbox</div>
                <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6 }}>amir@out.superkabe.com</div>
              </div>
              <div>
                <div style={{ fontSize: 14, letterSpacing: '0.06em', fontWeight: 700, color: C.ink500, textTransform: 'uppercase' }}>Bounce rate</div>
                <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 600, marginTop: 4, color: tone === 'bad' ? C.red700 : tone === 'warn' ? C.yellow700 : C.ink1000 }}>{bouncePct.toFixed(1)}%</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pill tone={tone} style={{ fontSize: 18, padding: '8px 18px' }}>{state}</Pill>
              </div>

              <div style={{
                position: 'absolute', top: -22, right: 32,
                transform: `scale(${stampScale}) rotate(-3deg)`, opacity: stampOp,
                background: C.ink1000, color: '#fff', fontFamily: MONO, fontSize: 20, fontWeight: 700,
                padding: '10px 18px', borderRadius: 8,
                boxShadow: '0 12px 32px rgba(10,10,11,0.18)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: C.orange500, animation: 'sk-blink 1s steps(2) infinite' }} />
                AUTO-PAUSED
              </div>
            </div>

            <div style={{ marginTop: 28, fontSize: 22, color: C.ink800, opacity: capOp, fontFamily: FONT }}>
              <span style={{ fontWeight: 600 }}>Auto-pause</span> stops the mailbox before damage spreads to the domain.
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 6 — 5-phase healing pipeline (22.5 – 28.0s)
// ============================================================================
const PHASES = ['Pause', 'Quarantine', 'Restricted', 'Warm Recovery', 'Healthy'];
function Scene6() {
  return (
    <Sprite start={22.5} end={28.0}>
      {({ localTime }) => {
        const op = interpolate([0, 0.4, 4.9, 5.5], [0, 1, 1, 0], Easing.easeOutCubic);
        const progress = animate({ from: 0, to: 1, start: 0.4, end: 4.0, ease: Easing.easeInOutCubic })(localTime);
        const activeIdx = Math.min(4, Math.floor(progress * 5));

        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <Eyebrow>5-phase recovery pipeline</Eyebrow>
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 60 }}>Heal degraded senders, automatically.</div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'flex-start' }}>
              <div style={{ position: 'absolute', top: 35, left: '10%', right: '10%', height: 3, background: C.ink200, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 35, left: '10%', width: `${progress * 80}%`, height: 3, background: C.orange500, borderRadius: 2 }} />
              {PHASES.map((p, i) => {
                const done = progress >= (i + 1) / 5;
                const active = !done && i === activeIdx;
                const enter = animate({ from: 0, to: 1, start: 0.4 + i * 0.7, end: 0.7 + i * 0.7, ease: Easing.easeOutBack })(localTime);
                return (
                  <div key={p} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: 70, height: 70, borderRadius: 999, margin: '0 auto 18px',
                      display: 'grid', placeItems: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26,
                      background: done ? C.orange500 : '#fff',
                      border: `3px solid ${done ? C.orange500 : active ? C.orange500 : C.ink200}`,
                      color: done ? C.ink1000 : active ? C.orange700 : C.ink500,
                      transform: `scale(${active ? 1 + 0.05 * Math.sin(localTime * 6) : 1})`,
                      boxShadow: active ? `0 0 0 8px rgba(245,167,66,0.18), 0 0 0 18px rgba(245,167,66,0.08)` : 'none',
                    }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{
                      fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700,
                      color: active || done ? C.ink1000 : C.ink500,
                      opacity: enter, transform: `translateY(${(1 - enter) * 8}px)`,
                    }}>{p}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 70, display: 'flex', justifyContent: 'center', gap: 56, fontFamily: MONO, alignItems: 'baseline' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, letterSpacing: '0.08em', color: C.ink500, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Bounce</div>
                <div style={{ fontSize: 44, fontWeight: 600, color: progress > 0.6 ? C.green700 : C.red700 }}>{(4.2 - progress * 3.3).toFixed(1)}%</div>
              </div>
              <div style={{ fontSize: 28, color: C.ink300, alignSelf: 'center' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, letterSpacing: '0.08em', color: C.ink500, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Inbox placement</div>
                <div style={{ fontSize: 44, fontWeight: 600, color: progress > 0.4 ? C.green700 : C.ink800 }}>{(71 + progress * 23.2).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 7 — Native integrations (28.0 – 33.0s)
// ============================================================================
const INTEGRATIONS = [
  { name: 'Gmail',         cat: 'Mailbox provider',    status: 'Live', logo: 'assets/integrations/gmail.svg' },
  { name: 'Microsoft 365', cat: 'Mailbox provider',    status: 'Live', logo: 'assets/integrations/microsoft.svg' },
  { name: 'Google Workspace', cat: 'Mailbox provider', status: 'Live', logo: 'assets/integrations/google.svg' },
  { name: 'Clay',          cat: 'Lead enrichment',     status: 'Live', logo: 'assets/integrations/clay.png' },
  { name: 'Slack',         cat: 'Alerts',              status: 'Live', logo: 'assets/integrations/slack.svg' },
  { name: 'Webhooks',      cat: 'Developer',           status: 'Live', logo: 'assets/integrations/webhooks.svg' },
  { name: 'Apollo',        cat: 'Lead enrichment',     status: 'Soon', logo: 'assets/integrations/apollo.svg' },
  { name: 'HubSpot',       cat: 'CRM sync',            status: 'Soon', logo: 'assets/integrations/hubspot.svg' },
  { name: 'Salesforce',    cat: 'CRM sync',            status: 'Soon', logo: 'assets/integrations/salesforce.svg' },
  { name: 'ZoomInfo',      cat: 'Lead enrichment',     status: 'Soon', logo: 'assets/integrations/zoominfo.svg' },
  { name: 'Outreach',      cat: 'Sales engagement',    status: 'Soon', logo: 'assets/integrations/outreach.png' },
  { name: 'Zapmail',       cat: 'Mailbox import',      status: 'Soon', logo: 'assets/integrations/zapmail.png' },
];
function Scene7() {
  return (
    <Sprite start={28.0} end={33.0}>
      {({ localTime }) => {
        const op = interpolate([0, 0.5, 4.4, 5.0], [0, 1, 1, 0], Easing.easeOutCubic);

        return (
          <div style={{ position: 'absolute', inset: 0, padding: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: op(localTime) }}>
            <Eyebrow>Native integrations</Eyebrow>
            <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12 }}>Plugs into your stack — no middleman.</div>
            <div style={{ fontSize: 22, color: C.ink800, marginBottom: 40, maxWidth: 1300 }}>
              Pull leads from Clay, Apollo, ZoomInfo. Send through Gmail, Microsoft 365, SMTP. Sync to HubSpot, Salesforce, Slack — live in minutes.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
              {INTEGRATIONS.map((it, i) => {
                const enter = animate({ from: 0, to: 1, start: 0.4 + i * 0.06, end: 0.7 + i * 0.06, ease: Easing.easeOutCubic })(localTime);
                const live = it.status === 'Live';
                return (
                  <div key={it.name} style={{
                    background: '#fff', border: `1px solid ${C.ink200}`, borderRadius: 12,
                    padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
                    opacity: enter, transform: `translateY(${(1 - enter) * 14}px)`,
                    boxShadow: '0 1px 2px rgba(10,10,11,0.04)',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, background: '#fff',
                      border: `1px solid ${C.ink100}`,
                      display: 'grid', placeItems: 'center', flexShrink: 0, overflow: 'hidden',
                    }}>
                      <img src={it.logo} alt={it.name} style={{ width: 30, height: 30, objectFit: 'contain' }}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: C.ink1000, letterSpacing: '-0.01em' }}>{it.name}</div>
                      <div style={{ fontSize: 13, color: C.ink500, marginTop: 2 }}>{it.cat}</div>
                    </div>
                    <span style={{
                      fontSize: 12, fontFamily: MONO, fontWeight: 700, letterSpacing: '0.06em',
                      padding: '4px 8px', borderRadius: 6,
                      background: live ? C.green50 : C.ink50,
                      color: live ? C.green700 : C.ink500,
                    }}>{it.status.toUpperCase()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
// SCENE 8 — Closing lockup (33.0 – 38.0s)
// ============================================================================
function Scene8() {
  return (
    <Sprite start={33.0} end={38.0}>
      {({ localTime }) => {
        const op = interpolate([0, 0.5, 4.6, 5.0], [0, 1, 1, 0], Easing.easeOutCubic);
        const headlineY = animate({ from: 16, to: 0, start: 0.3, end: 1.0, ease: Easing.easeOutCubic })(localTime);
        const headlineOp = animate({ from: 0, to: 1, start: 0.3, end: 0.9, ease: Easing.easeOutCubic })(localTime);
        const subOp = animate({ from: 0, to: 1, start: 0.9, end: 1.5, ease: Easing.easeOutCubic })(localTime);
        const taglineOp = animate({ from: 0, to: 1, start: 1.5, end: 2.1, ease: Easing.easeOutCubic })(localTime);
        const ctaOp = animate({ from: 0, to: 1, start: 2.4, end: 3.0, ease: Easing.easeOutCubic })(localTime);

        return (
          <div style={{ position: 'absolute', inset: 0, background: C.ink1000, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: op(localTime), padding: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: headlineOp, transform: `translateY(${headlineY}px)` }}>
              <Mark size={140} maskId="closing-mask" />
              <div style={{ fontSize: 110, fontWeight: 600, letterSpacing: '-0.04em' }}>Superkabe</div>
            </div>
            <div style={{ marginTop: 36, fontSize: 30, color: 'rgba(255,255,255,0.7)', opacity: subOp, fontWeight: 400, textAlign: 'center', maxWidth: 1300 }}>
              AI sequences · email validation · multi-mailbox sending · auto-healing — one platform.
            </div>
            <div style={{ marginTop: 56, opacity: taglineOp }}>
              <span style={{ fontFamily: FONT, fontSize: 56, fontWeight: 600, letterSpacing: '-0.02em', color: C.orange500 }}>
                Keep your infra alive.
              </span>
            </div>
            <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 16, opacity: ctaOp }}>
              <div style={{
                background: C.orange500, color: C.ink1000, fontFamily: FONT, fontSize: 22, fontWeight: 600,
                padding: '16px 28px', borderRadius: 8,
              }}>Start free trial →</div>
              <div style={{ fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>superkabe.com</div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

// ============================================================================
function Video() {
  return (
    <Stage width={1920} height={1080} duration={38} background={C.cream50}>
      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <Scene5 />
      <Scene6 />
      <Scene7 />
      <Scene8 />
    </Stage>
  );
}

Object.assign(window, { Video });
