import { writeFileSync } from 'fs'

const W = 3400, H = 2300
const BG = '#111111', GRID = '#1c1c1c'
const WHITE = '#ffffff', CYAN = '#00C8FF', AMBER = '#F59E0B', PURPLE = '#9333ea'
const ENTITY_FILL = '#1a1a1a'

// ── helpers ──────────────────────────────────────────────────────────────────
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

function rect(cx, cy, w, h, label, stroke = WHITE, double = false) {
  const x = cx - w/2, y = cy - h/2
  let r = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ENTITY_FILL}" stroke="${stroke}" stroke-width="2.5"/>
<text x="${cx}" y="${cy+5}" text-anchor="middle" font-family="'Courier New',monospace" font-size="15" font-weight="bold" fill="${stroke}">${esc(label)}</text>`
  if (double) r += `<rect x="${x+4}" y="${y+4}" width="${w-8}" height="${h-8}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`
  return r
}

function oval(cx, cy, label, stroke = WHITE, pk = false) {
  const rx = Math.max(label.length * 4.5, 42), ry = 20
  const decoration = pk ? 'text-decoration="underline"' : ''
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${ENTITY_FILL}" stroke="${stroke}" stroke-width="1.5"/>
<text x="${cx}" y="${cy+5}" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${stroke}" ${decoration}>${esc(label)}</text>`
}

function diamond(cx, cy, label, stroke = CYAN) {
  const dx = 58, dy = 32
  const pts = `${cx},${cy-dy} ${cx+dx},${cy} ${cx},${cy+dy} ${cx-dx},${cy}`
  const lines = label.split('\\n')
  const textY = lines.length > 1 ? cy - 5 : cy + 4
  let texts = lines.map((l,i) => `<text x="${cx}" y="${textY + i*14}" text-anchor="middle" font-family="'Courier New',monospace" font-size="10" font-weight="bold" fill="${stroke}">${esc(l)}</text>`).join('')
  return `<polygon points="${pts}" fill="${ENTITY_FILL}" stroke="${stroke}" stroke-width="2"/>
${texts}`
}

function line(x1,y1,x2,y2,stroke=WHITE,dash='') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`
}

function card(x, y, label, color = WHITE) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Courier New',monospace" font-size="13" font-weight="bold" fill="${color}">${esc(label)}</text>`
}

function attrLine(ex, ey, ax, ay, stroke = WHITE) {
  return line(ex, ey, ax, ay, stroke)
}

// ── entity centers ────────────────────────────────────────────────────────────
const E = {
  auth:   { x: 380,  y: 320  },
  User:   { x: 820,  y: 950  },
  Course: { x: 1550, y: 420  },
  Module: { x: 2150, y: 420  },
  Quiz:   { x: 2450, y: 900  },
  Badge:  { x: 500,  y: 1750 },
  UBadge: { x: 1300, y: 1750 },
  LLM:    { x: 2700, y: 280  },
  SMTP:   { x: 2900, y: 750  },
  Admin:  { x: 200,  y: 950  },
}

// ── relationship diamond centers ──────────────────────────────────────────────
const R = {
  SYNCS:      { x: 600,  y: 635  },
  CREATES:    { x: 1185, y: 685  },
  CONTAINS:   { x: 1850, y: 420  },
  SUBMITS:    { x: 1635, y: 925  },
  EVALUATES:  { x: 2300, y: 660  },
  EARNS:      { x: 1060, y: 1350 },
  AWARDED_TO: { x: 900,  y: 1750 },
  GENERATES:  { x: 2125, y: 350  },
  MANAGES:    { x: 510,  y: 950  },
  SENDS_VIA:  { x: 2750, y: 550  },
}

let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="${BG}"/>
<defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse">
<path d="M60 0L0 0 0 60" fill="none" stroke="${GRID}" stroke-width="0.6"/></pattern></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>

<!-- TITLE -->
<text x="${W/2}" y="58" text-anchor="middle" font-family="'Courier New',monospace" font-size="32" font-weight="bold" fill="${WHITE}">EASTDAWN — Entity Relationship Diagram</text>
<text x="${W/2}" y="88" text-anchor="middle" font-family="'Courier New',monospace" font-size="14" fill="${CYAN}">schema.prisma · Prisma ORM + Supabase PostgreSQL · Chen Notation</text>
`

// ── CONNECTION LINES (drawn first, behind everything) ─────────────────────────
const lines = [
  // auth.users ↔ SYNCS ↔ User
  [E.auth.x, E.auth.y, R.SYNCS.x, R.SYNCS.y, WHITE, ''],
  [R.SYNCS.x, R.SYNCS.y, E.User.x, E.User.y, WHITE, ''],
  // User ↔ CREATES ↔ Course
  [E.User.x, E.User.y, R.CREATES.x, R.CREATES.y, WHITE, ''],
  [R.CREATES.x, R.CREATES.y, E.Course.x, E.Course.y, WHITE, ''],
  // Course ↔ CONTAINS ↔ Module
  [E.Course.x, E.Course.y, R.CONTAINS.x, R.CONTAINS.y, WHITE, ''],
  [R.CONTAINS.x, R.CONTAINS.y, E.Module.x, E.Module.y, WHITE, ''],
  // User ↔ SUBMITS ↔ QuizAttempt
  [E.User.x, E.User.y, R.SUBMITS.x, R.SUBMITS.y, WHITE, ''],
  [R.SUBMITS.x, R.SUBMITS.y, E.Quiz.x, E.Quiz.y, WHITE, ''],
  // Module ↔ EVALUATES ↔ QuizAttempt
  [E.Module.x, E.Module.y, R.EVALUATES.x, R.EVALUATES.y, WHITE, ''],
  [R.EVALUATES.x, R.EVALUATES.y, E.Quiz.x, E.Quiz.y, WHITE, ''],
  // User ↔ EARNS ↔ UserBadge
  [E.User.x, E.User.y, R.EARNS.x, R.EARNS.y, WHITE, ''],
  [R.EARNS.x, R.EARNS.y, E.UBadge.x, E.UBadge.y, WHITE, ''],
  // Badge ↔ AWARDED_TO ↔ UserBadge
  [E.Badge.x, E.Badge.y, R.AWARDED_TO.x, R.AWARDED_TO.y, WHITE, ''],
  [R.AWARDED_TO.x, R.AWARDED_TO.y, E.UBadge.x, E.UBadge.y, WHITE, ''],
  // LLM ↔ GENERATES ↔ Course
  [E.LLM.x, E.LLM.y, R.GENERATES.x, R.GENERATES.y, PURPLE, ''],
  [R.GENERATES.x, R.GENERATES.y, E.Course.x, E.Course.y, PURPLE, ''],
  // Admin ↔ MANAGES ↔ User
  [E.Admin.x, E.Admin.y, R.MANAGES.x, R.MANAGES.y, AMBER, ''],
  [R.MANAGES.x, R.MANAGES.y, E.User.x, E.User.y, AMBER, ''],
  // auth ↔ SENDS_VIA ↔ SMTP
  [E.auth.x, E.auth.y, R.SENDS_VIA.x, R.SENDS_VIA.y, PURPLE, '5,4'],
  [R.SENDS_VIA.x, R.SENDS_VIA.y, E.SMTP.x, E.SMTP.y, PURPLE, '5,4'],
]
svg += lines.map(([x1,y1,x2,y2,s,d]) => line(x1,y1,x2,y2,s,d)).join('\n')

// ── CARDINALITY LABELS ────────────────────────────────────────────────────────
svg += [
  // SYNCS 1:1
  card(490, 555, '1'), card(680, 700, '1'),
  // CREATES 1:N
  card(1000, 800, '1'), card(1280, 560, 'N'),
  // CONTAINS 1:N
  card(1720, 410, '1'), card(1980, 410, 'N'),
  // SUBMITS 1:N
  card(1220, 870, '1'), card(1720, 940, 'N'),
  // EVALUATES 1:N
  card(2200, 500, '1'), card(2360, 760, 'N'),
  // EARNS 1:N
  card(940, 1150, '1'), card(1160, 1540, 'N'),
  // AWARDED_TO 1:N
  card(640, 1720, '1'), card(1050, 1750, 'N'),
  // GENERATES 1:N
  card(2550, 270, '1'), card(1960, 350, 'N'),
  // MANAGES 1:N
  card(340, 940, '1'), card(670, 950, 'N'),
].join('\n')

// ── RELATIONSHIP DIAMONDS ─────────────────────────────────────────────────────
svg += diamond(R.SYNCS.x,      R.SYNCS.y,      'SYNCS',       CYAN)
svg += diamond(R.CREATES.x,    R.CREATES.y,    'CREATES',     CYAN)
svg += diamond(R.CONTAINS.x,   R.CONTAINS.y,   'CONTAINS',    CYAN)
svg += diamond(R.SUBMITS.x,    R.SUBMITS.y,    'SUBMITS',     CYAN)
svg += diamond(R.EVALUATES.x,  R.EVALUATES.y,  'EVALUATES',   CYAN)
svg += diamond(R.EARNS.x,      R.EARNS.y,      'EARNS',       CYAN)
svg += diamond(R.AWARDED_TO.x, R.AWARDED_TO.y, 'AWARDED_TO',  CYAN)
svg += diamond(R.GENERATES.x,  R.GENERATES.y,  'GENERATES',   PURPLE)
svg += diamond(R.MANAGES.x,    R.MANAGES.y,    'MANAGES',     AMBER)
svg += diamond(R.SENDS_VIA.x,  R.SENDS_VIA.y,  'SENDS_VIA',   PURPLE)

// ── ENTITIES ──────────────────────────────────────────────────────────────────
svg += rect(E.auth.x,   E.auth.y,   220, 44, 'auth.users',   PURPLE)
svg += rect(E.User.x,   E.User.y,   200, 44, 'User',         WHITE)
svg += rect(E.Course.x, E.Course.y, 200, 44, 'Course',       WHITE)
svg += rect(E.Module.x, E.Module.y, 200, 44, 'Module',       WHITE)
svg += rect(E.Quiz.x,   E.Quiz.y,   220, 44, 'QuizAttempt',  WHITE)
svg += rect(E.Badge.x,  E.Badge.y,  200, 44, 'Badge',        WHITE)
svg += rect(E.UBadge.x, E.UBadge.y, 200, 44, 'UserBadge',   WHITE, true)
svg += rect(E.LLM.x,    E.LLM.y,   200, 44, 'LOCAL_LLM',    PURPLE)
svg += rect(E.SMTP.x,   E.SMTP.y,   200, 44, 'SMTP_RELAY',   PURPLE)
svg += rect(E.Admin.x,  E.Admin.y,  200, 44, 'ADMIN',        AMBER)

// ── ATTRIBUTES ────────────────────────────────────────────────────────────────
// helper: draw attr oval + line from entity center
function attr(ex, ey, ax, ay, label, stroke, pk=false) {
  return attrLine(ex, ey, ax, ay, stroke) + oval(ax, ay, label, stroke, pk)
}

// auth.users attrs
svg += attr(E.auth.x, E.auth.y, 200,  210, 'id (PK)',             PURPLE, true)
svg += attr(E.auth.x, E.auth.y, 380,  200, 'email',               PURPLE)
svg += attr(E.auth.x, E.auth.y, 555,  225, 'encrypted_password',  PURPLE)
svg += attr(E.auth.x, E.auth.y, 575,  340, 'email_confirmed_at',  PURPLE)
svg += attr(E.auth.x, E.auth.y, 480,  430, 'meta.security_q',     PURPLE)
svg += attr(E.auth.x, E.auth.y, 290,  440, 'meta.security_a',     PURPLE)
svg += attr(E.auth.x, E.auth.y, 165,  390, 'created_at',          PURPLE)

// User attrs
svg += attr(E.User.x, E.User.y,  820,  810, 'id (PK)',              WHITE, true)
svg += attr(E.User.x, E.User.y,  665,  820, 'name',                 WHITE)
svg += attr(E.User.x, E.User.y,  975,  820, 'email (UK)',            WHITE)
svg += attr(E.User.x, E.User.y,  605,  875, 'role',                 WHITE)
svg += attr(E.User.x, E.User.y,  575,  945, 'currentStreak',        WHITE)
svg += attr(E.User.x, E.User.y,  575, 1015, 'longestStreak',        WHITE)
svg += attr(E.User.x, E.User.y,  605, 1080, 'lastActive',           WHITE)
svg += attr(E.User.x, E.User.y, 1035,  875, 'totalXp',              WHITE)
svg += attr(E.User.x, E.User.y, 1065,  945, 'totalStudyMinutes',    WHITE)
svg += attr(E.User.x, E.User.y, 1055, 1015, 'avatarUrl',            WHITE)
svg += attr(E.User.x, E.User.y, 1020, 1080, 'onboardingComplete',   WHITE)
svg += attr(E.User.x, E.User.y,  680, 1120, 'securityQuestion',     WHITE)
svg += attr(E.User.x, E.User.y,  960, 1120, 'securityAnswer',       WHITE)
svg += attr(E.User.x, E.User.y,  820, 1140, 'createdAt / updatedAt',WHITE)

// Course attrs
svg += attr(E.Course.x, E.Course.y, 1550, 300, 'id (PK)',    WHITE, true)
svg += attr(E.Course.x, E.Course.y, 1390, 308, 'title',      WHITE)
svg += attr(E.Course.x, E.Course.y, 1710, 308, 'summary',    WHITE)
svg += attr(E.Course.x, E.Course.y, 1350, 500, 'domain',     WHITE)
svg += attr(E.Course.x, E.Course.y, 1550, 520, 'level',      WHITE)
svg += attr(E.Course.x, E.Course.y, 1750, 500, 'isPublic',   WHITE)
svg += attr(E.Course.x, E.Course.y, 1400, 540, 'userId (FK)',WHITE)
svg += attr(E.Course.x, E.Course.y, 1700, 540, 'promptUsed', WHITE)

// Module attrs
svg += attr(E.Module.x, E.Module.y, 2150, 300, 'id (PK)',       WHITE, true)
svg += attr(E.Module.x, E.Module.y, 1990, 308, 'title',         WHITE)
svg += attr(E.Module.x, E.Module.y, 2310, 308, 'type (ENUM)',   WHITE)
svg += attr(E.Module.x, E.Module.y, 1960, 500, 'orderIndex',    WHITE)
svg += attr(E.Module.x, E.Module.y, 2150, 520, 'quizData(JSON)',WHITE)
svg += attr(E.Module.x, E.Module.y, 2340, 500, 'courseId (FK)', WHITE)
svg += attr(E.Module.x, E.Module.y, 2080, 540, 'isCompleted',   WHITE)

// QuizAttempt attrs
svg += attr(E.Quiz.x, E.Quiz.y, 2450, 790, 'id (PK)',       WHITE, true)
svg += attr(E.Quiz.x, E.Quiz.y, 2300, 800, 'score',         WHITE)
svg += attr(E.Quiz.x, E.Quiz.y, 2600, 800, 'domain',        WHITE)
svg += attr(E.Quiz.x, E.Quiz.y, 2260, 895, 'userId (FK)',   WHITE)
svg += attr(E.Quiz.x, E.Quiz.y, 2640, 895, 'moduleId (FK)', WHITE)
svg += attr(E.Quiz.x, E.Quiz.y, 2450, 1010,'createdAt',     WHITE)

// Badge attrs
svg += attr(E.Badge.x, E.Badge.y,  500, 1638, 'id (PK)',     WHITE, true)
svg += attr(E.Badge.x, E.Badge.y,  348, 1660, 'name (UK)',   WHITE)
svg += attr(E.Badge.x, E.Badge.y,  652, 1660, 'description', WHITE)
svg += attr(E.Badge.x, E.Badge.y,  365, 1820, 'tier',        WHITE)
svg += attr(E.Badge.x, E.Badge.y,  635, 1820, 'imageUrl',    WHITE)

// UserBadge attrs
svg += attr(E.UBadge.x, E.UBadge.y, 1300, 1638, 'id (PK)',       WHITE, true)
svg += attr(E.UBadge.x, E.UBadge.y, 1120, 1660, 'userId (FK)',   WHITE)
svg += attr(E.UBadge.x, E.UBadge.y, 1480, 1660, 'badgeId (FK)',  WHITE)
svg += attr(E.UBadge.x, E.UBadge.y, 1300, 1845, 'awardedAt',     WHITE)

// LOCAL_LLM attrs
svg += attr(E.LLM.x, E.LLM.y, 2700, 185, 'model (Llama 3.3)',  PURPLE)
svg += attr(E.LLM.x, E.LLM.y, 2540, 220, 'engine: Ollama',     PURPLE)
svg += attr(E.LLM.x, E.LLM.y, 2860, 220, 'provider: Groq',     PURPLE)
svg += attr(E.LLM.x, E.LLM.y, 2700, 375, 'purpose: Gen Course',PURPLE)

// SMTP attrs
svg += attr(E.SMTP.x, E.SMTP.y, 2900, 650, 'provider: Brevo',   PURPLE)
svg += attr(E.SMTP.x, E.SMTP.y, 2750, 700, 'port: 587',         PURPLE)
svg += attr(E.SMTP.x, E.SMTP.y, 3050, 750, 'protocol: SMTP',    PURPLE)

// Admin attrs
svg += attr(E.Admin.x, E.Admin.y, 200, 855, 'id (PK)',       AMBER, true)
svg += attr(E.Admin.x, E.Admin.y,  90, 910, 'name',          AMBER)
svg += attr(E.Admin.x, E.Admin.y,  85, 985, 'email',         AMBER)
svg += attr(E.Admin.x, E.Admin.y, 200,1060, 'role = ADMIN',  AMBER)

// ── ENUMS ─────────────────────────────────────────────────────────────────────
svg += `
<!-- ENUM: Role -->
<rect x="75" y="1150" width="240" height="90" fill="#1a1a1a" stroke="${AMBER}" stroke-width="1.5" rx="6"/>
<text x="195" y="1172" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${AMBER}">ENUM Role</text>
<text x="195" y="1192" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">LEARNER</text>
<text x="195" y="1208" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">ADMIN</text>
<text x="195" y="1224" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">ENTERPRISE</text>

<!-- ENUM: ModuleType -->
<rect x="2080" y="560" width="220" height="88" fill="#1a1a1a" stroke="${CYAN}" stroke-width="1.5" rx="6"/>
<text x="2190" y="582" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" font-weight="bold" fill="${CYAN}">ENUM ModuleType</text>
<text x="2190" y="600" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">READING</text>
<text x="2190" y="618" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">LAB</text>
<text x="2190" y="636" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">QUIZ</text>
`

// ── LEGEND ─────────────────────────────────────────────────────────────────────
svg += `
<rect x="2950" y="1950" width="420" height="310" fill="#1a1a1a" stroke="#444" stroke-width="1" rx="8"/>
<text x="3160" y="1975" text-anchor="middle" font-family="'Courier New',monospace" font-size="13" font-weight="bold" fill="${WHITE}">LEGEND</text>
<rect x="2970" y="1985" width="90" height="24" fill="${ENTITY_FILL}" stroke="${WHITE}" stroke-width="1.5"/>
<text x="3075" y="2002" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}"> = Entity (Table)</text>
<ellipse cx="2995" cy="2030" rx="25" ry="13" fill="${ENTITY_FILL}" stroke="${WHITE}" stroke-width="1.2"/>
<text x="3075" y="2034" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}"> = Attribute (Column)</text>
<text x="2985" y="2060" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}" text-decoration="underline">underline</text>
<text x="3075" y="2060" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}"> = Primary Key</text>
<polygon points="2995,2072 3020,2085 2995,2098 2970,2085" fill="${ENTITY_FILL}" stroke="${CYAN}" stroke-width="1.8"/>
<text x="3075" y="2090" font-family="'Courier New',monospace" font-size="11" fill="${CYAN}"> = App Relationship</text>
<polygon points="2995,2108 3020,2121 2995,2134 2970,2121" fill="${ENTITY_FILL}" stroke="${AMBER}" stroke-width="1.8"/>
<text x="3075" y="2126" font-family="'Courier New',monospace" font-size="11" fill="${AMBER}"> = Admin Relationship</text>
<polygon points="2995,2144 3020,2157 2995,2170 2970,2157" fill="${ENTITY_FILL}" stroke="${PURPLE}" stroke-width="1.8"/>
<text x="3075" y="2162" font-family="'Courier New',monospace" font-size="11" fill="${PURPLE}"> = External System</text>
<text x="2970" y="2195" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}">1, N, M  = Cardinality</text>
<line x1="2970" y1="2215" x2="3010" y2="2215" stroke="${WHITE}" stroke-width="1.2" stroke-dasharray="5,3"/>
<text x="3075" y="2219" font-family="'Courier New',monospace" font-size="11" fill="${WHITE}"> = External/Auth link</text>
<text x="2970" y="2245" font-family="'Courier New',monospace" font-size="10" fill="#555">UserBadge double border = weak entity</text>
`

svg += `</svg>`

writeFileSync('eastdawn_er_diagram.svg', svg, 'utf8')
console.log('✅ SVG written to eastdawn_er_diagram.svg')
