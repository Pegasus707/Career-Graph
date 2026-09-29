import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('docs', exist_ok=True)

# -------------------------------------------------------------
# 1. System Architecture Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis('off')

# Background
fig.patch.set_facecolor('#FFFFFF')
ax.set_facecolor('#FFFFFF')

def draw_box(x, y, w, h, title, items, header_bg='#1E293B', body_bg='#F8FAFC', border_color='#CBD5E1'):
    # Card outer
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.15",
                                  facecolor=body_bg, edgecolor=border_color, linewidth=1.5)
    ax.add_patch(rect)
    # Header banner
    header_h = 0.55
    header_rect = patches.FancyBboxPatch((x, y + h - header_h), w, header_h,
                                         boxstyle="round,pad=0.08,rounding_size=0.15",
                                         facecolor=header_bg, edgecolor='none')
    ax.add_patch(header_rect)
    # Header text
    ax.text(x + w/2, y + h - header_h/2, title, ha='center', va='center',
            color='#FFFFFF', fontsize=10.5, weight='bold', family='sans-serif')
    # Items
    start_y = y + h - header_h - 0.25
    for i, item in enumerate(items):
        ax.text(x + 0.2, start_y - (i * 0.26), item, ha='left', va='center',
                color='#334155', fontsize=8.5, family='sans-serif')

# Tier 1: Client Tier
draw_box(0.5, 3.8, 4.0, 1.8, "Client Tier (Frontend SPA)", [
    "• Vue 3 (Composition API, <script setup>)",
    "• Pinia Stores (auth, roadmap, user state)",
    "• SVG Bezier Curve Roadmap Canvas",
    "• Skill Drawer, Quiz Modal & Career Switcher",
    "• Vite 5.3 Bundler & Axios API Client"
], header_bg='#0F766E', body_bg='#F0FDFA', border_color='#99F6E4')

# Hosting Tier Frontend
draw_box(0.5, 1.4, 4.0, 1.6, "Hosting & CDN (Frontend)", [
    "• Hosted on Vercel Edge Network",
    "• Global CDN Caching & Auto Deployments",
    "• vercel.json SPA Route Rewrites (/ -> index.html)",
    "• Environment: VITE_API_BASE_URL"
], header_bg='#0369A1', body_bg='#F0F9FF', border_color='#BAE6FD')

# Tier 2: Application Tier
draw_box(5.5, 3.8, 4.0, 1.8, "Application Tier (Backend API)", [
    "• Node.js 18+ runtime & Express 4.19 Framework",
    "• Stateless JWT Authentication & Bcrypt Hashing",
    "• skillGapService: Topological Prerequisite Engine",
    "• quizController: Advanced Phase Proof of Skill",
    "• Atomic Progress Rollups (Course & Lesson)"
], header_bg='#1E3A8A', body_bg='#EFF6FF', border_color='#BFDBFE')

# Tier 3: Persistence Tier
draw_box(5.5, 1.4, 4.0, 1.6, "Persistence Tier (Database)", [
    "• MongoDB Atlas / Local Replica Set",
    "• 9 Normalized Mongoose Schemas",
    "• Compound Indexes ({ user: 1, course: 1 })",
    "• Universal Cross-Track skillId Mapping"
], header_bg='#334155', body_bg='#F8FAFC', border_color='#CBD5E1')

# Draw Arrows
# Client <-> API
ax.annotate('', xy=(5.5, 4.7), xytext=(4.5, 4.7),
            arrowprops=dict(arrowstyle='<->', color='#2563EB', lw=2, shrinkA=5, shrinkB=5))
ax.text(5.0, 4.9, 'REST / HTTPS (JWT)', ha='center', va='bottom', fontsize=8, color='#1E40AF', weight='bold')

# API <-> Database
ax.annotate('', xy=(7.5, 3.0), xytext=(7.5, 3.8),
            arrowprops=dict(arrowstyle='<->', color='#334155', lw=2, shrinkA=5, shrinkB=5))
ax.text(7.7, 3.4, 'Mongoose ODM', ha='left', va='center', fontsize=8, color='#334155', weight='bold')

# Client -> Hosting
ax.annotate('', xy=(2.5, 3.0), xytext=(2.5, 3.8),
            arrowprops=dict(arrowstyle='<->', color='#0284C7', lw=1.5, ls='--', shrinkA=5, shrinkB=5))
ax.text(2.6, 3.4, 'CI/CD Build', ha='left', va='center', fontsize=7.5, color='#0284C7')

plt.tight_layout()
plt.savefig('docs/system_architecture.png', dpi=300, bbox_inches='tight')
plt.close()
print("Saved docs/system_architecture.png")


# -------------------------------------------------------------
# 2. Entity Relationship Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
ax.set_xlim(0, 11)
ax.set_ylim(0, 7.5)
ax.axis('off')
fig.patch.set_facecolor('#FFFFFF')
ax.set_facecolor('#FFFFFF')

def draw_entity(x, y, w, h, name, fields, color='#1E293B'):
    rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.06,rounding_size=0.12",
                                  facecolor='#F8FAFC', edgecolor=color, linewidth=1.5)
    ax.add_patch(rect)
    hh = 0.45
    h_rect = patches.FancyBboxPatch((x, y + h - hh), w, hh, boxstyle="round,pad=0.06,rounding_size=0.12",
                                   facecolor=color, edgecolor='none')
    ax.add_patch(h_rect)
    ax.text(x + w/2, y + h - hh/2, name, ha='center', va='center', color='#FFFFFF', fontsize=9.5, weight='bold')
    
    sy = y + h - hh - 0.2
    for i, f in enumerate(fields):
        ax.text(x + 0.15, sy - (i * 0.22), f, ha='left', va='center', color='#1E293B', fontsize=7.5, family='monospace')

# Entities layout
# User
draw_entity(0.5, 5.0, 2.5, 2.1, "USER", [
    "_id : ObjectId (PK)",
    "name : String",
    "email : String (UK)",
    "password : String (hash)",
    "role : Enum('user','admin')",
    "targetCareer : FK -> Career",
    "onboardingComplete : Bool"
], color='#1E3A8A')

# UserProfile
draw_entity(0.5, 2.4, 2.5, 2.0, "USER_PROFILE", [
    "_id : ObjectId (PK)",
    "user : FK -> User (1:1)",
    "education : Object",
    "status : Enum(student,etc)",
    "skills : [ { skill, level,",
    "            verified } ]"
], color='#1E3A8A')

# Career
draw_entity(4.2, 5.2, 2.6, 1.9, "CAREER", [
    "_id : ObjectId (PK)",
    "name : String",
    "slug : String (UK)",
    "streams : [String]",
    "degrees : [String]",
    "requiredSkills : [Embedded]"
], color='#047857')

# Skill
draw_entity(4.2, 2.4, 2.6, 2.3, "SKILL", [
    "_id : ObjectId (PK)",
    "skillId : String (UK)",
    "name : String",
    "slug : String (UK)",
    "prerequisites : [FK->Skill]",
    "relatedSkills : [FK->Skill]",
    "resources : [Embedded]"
], color='#047857')

# SkillQuiz
draw_entity(4.2, 0.2, 2.6, 1.7, "SKILL_QUIZ", [
    "_id : ObjectId (PK)",
    "skill : FK -> Skill (1:1)",
    "skillId : String",
    "title : String",
    "questions : [Embedded x3]"
], color='#B45309')

# Course
draw_entity(8.0, 5.4, 2.5, 1.7, "COURSE", [
    "_id : ObjectId (PK)",
    "title : String",
    "skill : FK -> Skill (1:1)",
    "description : String"
], color='#4338CA')

# Level
draw_entity(8.0, 3.4, 2.5, 1.7, "LEVEL", [
    "_id : ObjectId (PK)",
    "course : FK -> Course",
    "name : Enum(Beg,Int,Adv)",
    "order : Number",
    "modules : [Embedded]"
], color='#4338CA')

# CourseProgress
draw_entity(8.0, 1.7, 2.5, 1.5, "COURSE_PROGRESS", [
    "_id : ObjectId (PK)",
    "user : FK -> User",
    "course : FK -> Course",
    "percent : Number (0..100)",
    "verified : Boolean"
], color='#6D28D9')

# LessonProgress
draw_entity(8.0, 0.1, 2.5, 1.4, "LESSON_PROGRESS", [
    "_id : ObjectId (PK)",
    "user : FK -> User",
    "lesson : ObjectId",
    "completedAt : Date"
], color='#6D28D9')

# Relationships Lines
# User -> UserProfile (1:1)
ax.annotate('', xy=(1.75, 4.4), xytext=(1.75, 5.0),
            arrowprops=dict(arrowstyle='-', color='#64748B', lw=1.5))
ax.text(1.85, 4.7, '1:1', fontsize=7.5, color='#475569', weight='bold')

# User -> Career (N:1)
ax.annotate('', xy=(4.2, 6.0), xytext=(3.0, 6.0),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))
ax.text(3.6, 6.1, 'targets (N:1)', fontsize=7, color='#475569', ha='center')

# Career -> Skill
ax.annotate('', xy=(5.5, 4.7), xytext=(5.5, 5.2),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))
ax.text(5.6, 4.95, 'requires (1:N)', fontsize=7, color='#475569')

# Skill -> SkillQuiz (1:1)
ax.annotate('', xy=(5.5, 1.9), xytext=(5.5, 2.4),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))
ax.text(5.6, 2.15, 'validated by (1:1)', fontsize=7, color='#475569')

# Skill -> Course (1:1)
ax.annotate('', xy=(8.0, 6.0), xytext=(6.8, 3.5),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))
ax.text(7.3, 4.7, 'taught via', fontsize=7, color='#475569', rotation=25)

# Course -> Level (1:N)
ax.annotate('', xy=(9.25, 5.1), xytext=(9.25, 5.4),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))
ax.text(9.35, 5.25, '1:N', fontsize=7, color='#475569')

# Level -> LessonProgress
ax.annotate('', xy=(9.25, 1.5), xytext=(9.25, 1.7),
            arrowprops=dict(arrowstyle='->', color='#64748B', lw=1.5))

plt.tight_layout()
plt.savefig('docs/er_diagram.png', dpi=300, bbox_inches='tight')
plt.close()
print("Saved docs/er_diagram.png")
