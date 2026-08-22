#!/bin/bash
set -e
echo "Applying CareerGraph backend update..."

mkdir -p src/models src/controllers src/routes src/services src/seed

cat > 'src/models/User.js' << 'FILEEOF'
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  targetCareer: { type: mongoose.Schema.Types.ObjectId, ref: 'Career' },
  onboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
FILEEOF
echo 'wrote src/models/User.js'

cat > 'src/models/UserProfile.js' << 'FILEEOF'
const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  level: { type: Number, min: 0, max: 4, default: 0 } // 0 none, 1 beginner, 2 intermediate, 3 advanced, 4 expert
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  education: {
    degree: String,
    field: String,
    gradYear: Number,
    stillStudying: Boolean
  },
  status: { type: String, enum: ['student', 'fresher', 'employed'] },
  jobTitle: String,
  skills: [userSkillSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
FILEEOF
echo 'wrote src/models/UserProfile.js'

cat > 'src/models/Course.js' << 'FILEEOF'
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  description: String
});

module.exports = mongoose.model('Course', courseSchema);
FILEEOF
echo 'wrote src/models/Course.js'

cat > 'src/models/Level.js' << 'FILEEOF'
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  codeExample: String
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const levelSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  name: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  order: { type: Number, default: 0 },
  modules: [moduleSchema]
});

module.exports = mongoose.model('Level', levelSchema);
FILEEOF
echo 'wrote src/models/Level.js'

cat > 'src/models/CourseProgress.js' << 'FILEEOF'
const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  percent: { type: Number, default: 0 },
  completedLessonCount: { type: Number, default: 0 },
  totalLessonCount: { type: Number, default: 0 }
}, { timestamps: true });

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
FILEEOF
echo 'wrote src/models/CourseProgress.js'

cat > 'src/models/LessonProgress.js' << 'FILEEOF'
const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdocument id inside Level.modules.lessons
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
FILEEOF
echo 'wrote src/models/LessonProgress.js'

cat > 'src/services/skillGapService.js' << 'FILEEOF'
const Career = require('../models/Career');
const Course = require('../models/Course');
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const UserProfile = require('../models/UserProfile');

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Counts total lessons across all Level documents belonging to a course.
async function countCourseLessons(courseId) {
  const levels = await Level.find({ course: courseId });
  let total = 0;
  levels.forEach((level) => {
    level.modules.forEach((mod) => { total += mod.lessons.length; });
  });
  return total;
}

async function buildRoadmap(userId, careerId) {
  const career = await Career.findById(careerId).populate('requiredSkills.skill');
  if (!career) {
    const err = new Error('Career not found');
    err.statusCode = 404;
    throw err;
  }

  const profile = await UserProfile.findOne({ user: userId });
  const declaredSkills = profile ? profile.skills : [];

  const skillIds = career.requiredSkills.map((r) => r.skill._id);
  const courses = await Course.find({ skill: { $in: skillIds } });
  const courseProgressDocs = await CourseProgress.find({
    user: userId,
    course: { $in: courses.map((c) => c._id) }
  });

  const nodes = career.requiredSkills.map((req) => {
    const skill = req.skill;
    const userSkill = declaredSkills.find((s) => s.skill.toString() === skill._id.toString());
    const declaredLevel = userSkill ? userSkill.level : 0;

    const course = courses.find((c) => c.skill.toString() === skill._id.toString());
    const progressDoc = course
      ? courseProgressDocs.find((p) => p.course.toString() === course._id.toString())
      : null;
    const courseProgress = progressDoc ? progressDoc.percent : 0;

    const effectiveLevel = courseProgress === 100 ? Math.max(declaredLevel, req.requiredLevel) : declaredLevel;

    let status = 'not_started';
    if (effectiveLevel >= req.requiredLevel) status = 'completed';
    else if (courseProgress > 0 || declaredLevel > 0) status = 'in_progress';

    const percent = status === 'completed' ? 100 : courseProgress;

    return {
      skillId: skill._id,
      name: skill.name,
      slug: skill.slug,
      requiredLevel: req.requiredLevel,
      requiredLevelLabel: LEVEL_LABELS[req.requiredLevel],
      userLevel: declaredLevel,
      userLevelLabel: LEVEL_LABELS[declaredLevel],
      status,
      percent,
      courseId: course ? course._id : null
    };
  });

  const overallProgress = nodes.length
    ? Math.round(nodes.reduce((sum, n) => sum + n.percent, 0) / nodes.length)
    : 0;

  const recommended = nodes.find((n) => n.status !== 'completed') || null;

  return {
    career: { id: career._id, name: career.name, slug: career.slug, description: career.description },
    nodes,
    overallProgress,
    recommended
  };
}

module.exports = { buildRoadmap, countCourseLessons, LEVEL_LABELS };
FILEEOF
echo 'wrote src/services/skillGapService.js'

cat > 'src/controllers/userController.js' << 'FILEEOF'
const Career = require('../models/Career');
const UserProfile = require('../models/UserProfile');

exports.updateOnboarding = async (req, res, next) => {
  try {
    const { step, data } = req.body;
    const user = req.user;

    let profile = await UserProfile.findOne({ user: user._id });
    if (!profile) profile = new UserProfile({ user: user._id });

    if (step === 1) {
      profile.education = {
        degree: data.degree,
        field: data.field,
        gradYear: data.gradYear,
        stillStudying: !!data.stillStudying
      };
      await profile.save();
    } else if (step === 2) {
      profile.status = data.status;
      profile.jobTitle = data.jobTitle || '';
      await profile.save();
    } else if (step === 3) {
      profile.skills = (data.skills || []).map((s) => ({ skill: s.skill, level: s.level }));
      await profile.save();
    } else if (step === 4) {
      const career = await Career.findById(data.careerId);
      if (!career) return res.status(404).json({ message: 'Career not found' });
      user.targetCareer = career._id;
      user.onboardingComplete = true;
      await user.save();
    } else {
      return res.status(400).json({ message: 'Invalid onboarding step' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id }).populate('skills.skill', 'name slug');
    const career = req.user.targetCareer ? await Career.findById(req.user.targetCareer).select('name slug') : null;

    res.json({
      profile: profile
        ? { education: profile.education, status: profile.status, jobTitle: profile.jobTitle }
        : { education: {}, status: null, jobTitle: '' },
      skills: profile
        ? profile.skills.map((s) => ({ skill: s.skill, level: s.level }))
        : [],
      targetCareer: career,
      onboardingComplete: req.user.onboardingComplete
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, education, status, jobTitle } = req.body;
    if (name) {
      req.user.name = name;
      await req.user.save();
    }
    if (education || status || jobTitle) {
      let profile = await UserProfile.findOne({ user: req.user._id });
      if (!profile) profile = new UserProfile({ user: req.user._id });
      if (education) profile.education = { ...profile.education, ...education };
      if (status) profile.status = status;
      if (jobTitle !== undefined) profile.jobTitle = jobTitle;
      await profile.save();
    }
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
FILEEOF
echo 'wrote src/controllers/userController.js'

cat > 'src/controllers/skillController.js' << 'FILEEOF'
const Skill = require('../models/Skill');
const Course = require('../models/Course');
const Level = require('../models/Level');
const Career = require('../models/Career');
const UserProfile = require('../models/UserProfile');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');

exports.listSkills = async (req, res, next) => {
  try {
    const q = req.query.q;
    const filter = q ? { name: new RegExp(q, 'i') } : {};
    const skills = await Skill.find(filter).select('name slug category');
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

exports.getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug })
      .populate('prerequisites', 'name slug')
      .populate('relatedSkills', 'name slug');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const course = await Course.findOne({ skill: skill._id });
    const levels = course ? await Level.find({ course: course._id }).sort('order') : [];

    if (req.user) {
      const profile = await UserProfile.findOne({ user: req.user._id });
      const userSkill = profile ? profile.skills.find((s) => s.skill.toString() === skill._id.toString()) : null;
      const userLevel = userSkill ? userSkill.level : 0;

      let requiredLevel = null;
      let careerName = null;
      if (req.user.targetCareer) {
        const career = await Career.findById(req.user.targetCareer);
        const match = career && career.requiredSkills.find((r) => r.skill.toString() === skill._id.toString());
        if (match) {
          requiredLevel = match.requiredLevel;
          careerName = career.name;
        }
      }

      let courseProgress = 0;
      let completedLessonIds = [];
      if (course) {
        const progressDoc = await CourseProgress.findOne({ user: req.user._id, course: course._id });
        courseProgress = progressDoc ? progressDoc.percent : 0;
        const lessonProgressDocs = await LessonProgress.find({ user: req.user._id, course: course._id });
        completedLessonIds = lessonProgressDocs.map((lp) => lp.lesson.toString());
      }

      return res.json({
        skill,
        course,
        levels,
        courseProgress,
        personalization: { userLevel, requiredLevel, careerName },
        completedLessonIds
      });
    }

    res.json({ skill, course, levels, courseProgress: 0, personalization: null, completedLessonIds: [] });
  } catch (err) {
    next(err);
  }
};
FILEEOF
echo 'wrote src/controllers/skillController.js'

cat > 'src/controllers/roadmapController.js' << 'FILEEOF'
const { buildRoadmap } = require('../services/skillGapService');

exports.getRoadmap = async (req, res, next) => {
  try {
    const careerId = req.params.careerId || req.user.targetCareer;
    if (!careerId) return res.status(400).json({ message: 'No target career set. Complete onboarding first.' });
    const roadmap = await buildRoadmap(req.user._id, careerId);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};
FILEEOF
echo 'wrote src/controllers/roadmapController.js'

cat > 'src/controllers/progressController.js' << 'FILEEOF'
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const { buildRoadmap } = require('../services/skillGapService');

// Recomputes and stores CourseProgress for a given user + course after a lesson toggle.
async function recalculateCourseProgress(userId, courseId) {
  const levels = await Level.find({ course: courseId });
  let total = 0;
  const allLessonIds = [];
  levels.forEach((level) => {
    level.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        total += 1;
        allLessonIds.push(lesson._id.toString());
      });
    });
  });

  const completed = await LessonProgress.find({ user: userId, course: courseId });
  const completedCount = completed.filter((c) => allLessonIds.includes(c.lesson.toString())).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  await CourseProgress.findOneAndUpdate(
    { user: userId, course: courseId },
    { percent, completedLessonCount: completedCount, totalLessonCount: total },
    { upsert: true }
  );

  return percent;
}

exports.completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { levelId, courseId } = req.body;
    if (!levelId || !courseId) {
      return res.status(400).json({ message: 'levelId and courseId are required' });
    }

    await LessonProgress.findOneAndUpdate(
      { user: req.user._id, lesson: lessonId },
      { level: levelId, course: courseId, completedAt: new Date() },
      { upsert: true }
    );

    const percent = await recalculateCourseProgress(req.user._id, courseId);
    res.json({ completed: true, courseProgress: percent });
  } catch (err) {
    next(err);
  }
};

exports.uncompleteLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    await LessonProgress.deleteOne({ user: req.user._id, lesson: lessonId });
    const percent = await recalculateCourseProgress(req.user._id, courseId);
    res.json({ completed: false, courseProgress: percent });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardProgress = async (req, res, next) => {
  try {
    if (!req.user.targetCareer) return res.json({ overallProgress: 0, nodes: [], career: null, recommended: null });
    const roadmap = await buildRoadmap(req.user._id, req.user.targetCareer);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};
FILEEOF
echo 'wrote src/controllers/progressController.js'

cat > 'src/routes/userRoutes.js' << 'FILEEOF'
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { updateOnboarding, updateProfile, getProfile } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);

module.exports = router;
FILEEOF
echo 'wrote src/routes/userRoutes.js'

cat > 'src/seed/seedData.js' << 'FILEEOF'
// Seed content for CareerGraph.
// To add a new skill: add an entry to skillsData.
// To add a new career: add an entry to careersData, referencing skill slugs.
// No frontend changes are required for either.

const skillsData = [
  {
    name: 'HTML', slug: 'html', category: 'Web Foundations',
    description: 'HTML (HyperText Markup Language) is the standard markup language used to structure content on the web.',
    whyItMatters: 'Every webpage starts with HTML. It defines the structure and meaning of content that CSS styles and JavaScript makes interactive.',
    useCases: ['Websites', 'Web applications', 'Landing pages', 'Email templates', 'Web accessibility'],
    futureScope: 'HTML remains the foundation of the web and is required for every modern frontend framework, including Vue, React and Angular.',
    resources: [
      { type: 'documentation', title: 'HTML - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', provider: 'MDN' },
      { type: 'course', title: 'HTML Tutorial', url: 'https://www.w3schools.com/html/', provider: 'W3Schools' },
      { type: 'youtube', title: 'HTML Full Course for Beginners', url: 'https://www.youtube.com/results?search_query=html+full+course+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'Responsive Web Design Certification', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', provider: 'freeCodeCamp' }
    ],
    prerequisites: [], related: ['css', 'javascript'],
    topics: {
      Beginner: ['Document structure & tags', 'Elements, attributes & links'],
      Intermediate: ['Semantic HTML & accessibility', 'Forms & validation'],
      Advanced: ['SEO fundamentals', 'Integrating HTML with frameworks']
    }
  },
  {
    name: 'CSS', slug: 'css', category: 'Web Foundations',
    description: 'CSS (Cascading Style Sheets) controls the visual presentation, layout and responsiveness of web pages.',
    whyItMatters: 'CSS turns raw HTML structure into a usable, attractive interface. Layout systems like Flexbox and Grid are core to any frontend role.',
    useCases: ['Responsive layouts', 'Design systems', 'Animations', 'Component styling', 'Theming'],
    futureScope: 'CSS keeps evolving (container queries, Grid, custom properties) and pairs directly with every JS framework\'s component styling.',
    resources: [
      { type: 'documentation', title: 'CSS - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', provider: 'MDN' },
      { type: 'course', title: 'CSS Tutorial', url: 'https://www.w3schools.com/css/', provider: 'W3Schools' },
      { type: 'youtube', title: 'CSS Flexbox and Grid Crash Course', url: 'https://www.youtube.com/results?search_query=css+flexbox+and+grid+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', provider: 'Flexbox Froggy' }
    ],
    prerequisites: ['html'], related: ['html', 'javascript'],
    topics: {
      Beginner: ['Selectors, box model & units', 'Colors, typography & spacing'],
      Intermediate: ['Flexbox layout', 'Grid layout & responsive design'],
      Advanced: ['CSS architecture & custom properties', 'Animations & transitions']
    }
  },
  {
    name: 'JavaScript', slug: 'javascript', category: 'Programming',
    description: 'JavaScript is the programming language of the web, used to build interactive frontend behavior and, via Node.js, backend servers.',
    whyItMatters: 'JavaScript powers interactivity in the browser and is the shared language across the entire modern web stack, frontend and backend.',
    useCases: ['Interactive UIs', 'API communication', 'Backend servers (Node.js)', 'Automation scripts', 'Mobile apps'],
    futureScope: 'JavaScript is a foundational, durable skill across frontend, backend, and full-stack roles, and underpins frameworks like Vue, React, and Node.js.',
    resources: [
      { type: 'documentation', title: 'JavaScript - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', provider: 'MDN' },
      { type: 'course', title: 'JavaScript Tutorial', url: 'https://www.w3schools.com/js/', provider: 'W3Schools' },
      { type: 'youtube', title: 'JavaScript Full Course', url: 'https://www.youtube.com/results?search_query=javascript+full+course', provider: 'YouTube' },
      { type: 'practice', title: 'JavaScript Algorithms and Data Structures', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', provider: 'freeCodeCamp' }
    ],
    prerequisites: ['html', 'css'], related: ['git', 'vue', 'nodejs'],
    topics: {
      Beginner: ['Variables, types & operators', 'Functions, conditions & loops'],
      Intermediate: ['DOM & events', 'Promises & async/await'],
      Advanced: ['Closures & prototypes', 'Modules & design patterns']
    }
  },
  {
    name: 'Git', slug: 'git', category: 'Tooling',
    description: 'Git is a distributed version control system used to track code changes and collaborate with other developers.',
    whyItMatters: 'Nearly every professional software team uses Git and platforms like GitHub for collaboration, code review, and deployment.',
    useCases: ['Version control', 'Team collaboration', 'Code review', 'Open source contribution', 'CI/CD pipelines'],
    futureScope: 'Git is a permanent fixture of professional software development regardless of language or framework.',
    resources: [
      { type: 'documentation', title: 'Git Documentation', url: 'https://git-scm.com/doc', provider: 'Git' },
      { type: 'course', title: 'Git Tutorial', url: 'https://www.w3schools.com/git/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Git and GitHub for Beginners', url: 'https://www.youtube.com/results?search_query=git+and+github+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'Learn Git Branching', url: 'https://learngitbranching.js.org/', provider: 'Learn Git Branching' }
    ],
    prerequisites: [], related: ['javascript', 'rest-apis'],
    topics: {
      Beginner: ['Init, add, commit, status', 'Branching & merging'],
      Intermediate: ['Remotes, push & pull', 'Pull requests & code review'],
      Advanced: ['Rebasing & conflict resolution', 'Git workflows for teams']
    }
  },
  {
    name: 'REST APIs', slug: 'rest-apis', category: 'Web Foundations',
    description: 'REST (Representational State Transfer) is an architectural style for designing networked APIs using standard HTTP methods.',
    whyItMatters: 'Frontend and backend systems communicate through REST APIs. Understanding requests, responses, and status codes is essential on both sides.',
    useCases: ['Frontend-backend communication', 'Third-party integrations', 'Microservices', 'Mobile app backends'],
    futureScope: 'REST remains the dominant API style across the industry, alongside newer approaches like GraphQL.',
    resources: [
      { type: 'documentation', title: 'HTTP - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', provider: 'MDN' },
      { type: 'youtube', title: 'REST API Crash Course', url: 'https://www.youtube.com/results?search_query=rest+api+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'Public APIs to practice with', url: 'https://github.com/public-apis/public-apis', provider: 'GitHub' }
    ],
    prerequisites: ['javascript'], related: ['nodejs', 'express', 'vue'],
    topics: {
      Beginner: ['HTTP methods & status codes', 'Requests & responses (JSON)'],
      Intermediate: ['Consuming APIs with fetch/axios', 'Authentication headers & tokens'],
      Advanced: ['API design best practices', 'Error handling & pagination']
    }
  },
  {
    name: 'Vue', slug: 'vue', category: 'Frontend Framework',
    description: 'Vue is a progressive JavaScript framework for building interactive user interfaces and single-page applications.',
    whyItMatters: 'Vue (alongside React and Angular) is one of the main frameworks used to build modern, component-based frontend applications.',
    useCases: ['Single-page applications', 'Interactive dashboards', 'Component libraries', 'Progressive web apps'],
    futureScope: 'Vue has a strong, active ecosystem (Vue Router, Pinia, Vite) and remains a widely-used choice for production frontend applications.',
    resources: [
      { type: 'documentation', title: 'Vue.js Guide', url: 'https://vuejs.org/guide/introduction.html', provider: 'Vue.js' },
      { type: 'course', title: 'Vue Tutorial', url: 'https://www.w3schools.com/vue/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Vue 3 Full Course', url: 'https://www.youtube.com/results?search_query=vue+3+full+course', provider: 'YouTube' },
      { type: 'project', title: 'Build a Todo App in Vue', url: 'https://vuejs.org/tutorial/', provider: 'Vue.js' }
    ],
    prerequisites: ['javascript', 'html', 'css'], related: ['javascript', 'rest-apis'],
    topics: {
      Beginner: ['Components & templates', 'Reactivity & the Composition API'],
      Intermediate: ['Vue Router & navigation', 'Pinia for state management'],
      Advanced: ['Calling REST APIs from Vue', 'Performance & production builds']
    }
  },
  {
    name: 'Node.js', slug: 'nodejs', category: 'Backend',
    description: 'Node.js is a JavaScript runtime that lets developers run JavaScript on the server, outside the browser.',
    whyItMatters: 'Node.js lets full-stack teams use one language (JavaScript) across the frontend and backend, and powers a huge share of modern backend services.',
    useCases: ['REST API servers', 'Real-time applications', 'Command-line tools', 'Microservices'],
    futureScope: 'Node.js is a mature, widely-adopted runtime with a massive package ecosystem (npm) and strong industry demand.',
    resources: [
      { type: 'documentation', title: 'Node.js Documentation', url: 'https://nodejs.org/en/docs', provider: 'Node.js' },
      { type: 'course', title: 'Node.js Tutorial', url: 'https://www.w3schools.com/nodejs/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Node.js Full Course', url: 'https://www.youtube.com/results?search_query=nodejs+full+course', provider: 'YouTube' },
      { type: 'project', title: 'Build a REST API with Node', url: 'https://www.freecodecamp.org/news/tag/nodejs/', provider: 'freeCodeCamp' }
    ],
    prerequisites: ['javascript'], related: ['express', 'mongodb', 'rest-apis'],
    topics: {
      Beginner: ['Node runtime & modules', 'npm & package.json'],
      Intermediate: ['File system & async I/O', 'Building an HTTP server'],
      Advanced: ['Environment config & security', 'Structuring a production backend']
    }
  },
  {
    name: 'Express', slug: 'express', category: 'Backend',
    description: 'Express is a minimal, flexible Node.js web framework used to build REST APIs and web servers.',
    whyItMatters: 'Express is the most widely used Node.js framework for building REST APIs, providing routing, middleware, and request handling.',
    useCases: ['REST API servers', 'Middleware pipelines', 'Authentication systems', 'Backend for frontend'],
    futureScope: 'Express remains the de facto standard for Node.js APIs and underpins many production backend architectures.',
    resources: [
      { type: 'documentation', title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', provider: 'Express' },
      { type: 'youtube', title: 'Express.js Crash Course', url: 'https://www.youtube.com/results?search_query=express+js+crash+course', provider: 'YouTube' },
      { type: 'project', title: 'Build a CRUD API with Express', url: 'https://expressjs.com/en/starter/hello-world.html', provider: 'Express' }
    ],
    prerequisites: ['nodejs', 'rest-apis'], related: ['nodejs', 'mongodb'],
    topics: {
      Beginner: ['Routing & request handling', 'Middleware basics'],
      Intermediate: ['Building REST endpoints (CRUD)', 'Validation & error handling'],
      Advanced: ['Authentication with JWT', 'Structuring controllers & services']
    }
  },
  {
    name: 'MongoDB', slug: 'mongodb', category: 'Database',
    description: 'MongoDB is a document-oriented NoSQL database that stores data as flexible, JSON-like documents.',
    whyItMatters: 'MongoDB pairs naturally with JavaScript/Node.js backends and is widely used for applications with flexible, evolving data models.',
    useCases: ['Backend data storage', 'Content management systems', 'Real-time applications', 'Analytics'],
    futureScope: 'MongoDB remains one of the most popular NoSQL databases, especially within JavaScript-based (MERN/MEVN) stacks.',
    resources: [
      { type: 'documentation', title: 'MongoDB Manual', url: 'https://www.mongodb.com/docs/manual/', provider: 'MongoDB' },
      { type: 'course', title: 'MongoDB Tutorial', url: 'https://www.w3schools.com/mongodb/', provider: 'W3Schools' },
      { type: 'youtube', title: 'MongoDB Crash Course', url: 'https://www.youtube.com/results?search_query=mongodb+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'MongoDB University', url: 'https://learn.mongodb.com/', provider: 'MongoDB' }
    ],
    prerequisites: [], related: ['nodejs', 'express'],
    topics: {
      Beginner: ['Documents & collections', 'CRUD operations'],
      Intermediate: ['Schema design with Mongoose', 'Querying & indexing'],
      Advanced: ['Relationships & population', 'Aggregation pipelines']
    }
  },
  {
    name: 'SQL', slug: 'sql', category: 'Database',
    description: 'SQL (Structured Query Language) is the standard language for querying and managing relational databases.',
    whyItMatters: 'Most backend and data roles require SQL for reading, writing, and modeling relational data, even in NoSQL-heavy stacks.',
    useCases: ['Relational data storage', 'Reporting & analytics', 'Transactional systems', 'Data warehousing'],
    futureScope: 'SQL is a durable, foundational skill across backend engineering, data analytics, and data engineering roles.',
    resources: [
      { type: 'documentation', title: 'SQL - PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', provider: 'PostgreSQL Tutorial' },
      { type: 'course', title: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/', provider: 'W3Schools' },
      { type: 'youtube', title: 'SQL Full Course for Beginners', url: 'https://www.youtube.com/results?search_query=sql+full+course+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'SQL Practice Problems', url: 'https://www.sql-practice.com/', provider: 'SQL Practice' }
    ],
    prerequisites: [], related: ['mongodb', 'python'],
    topics: {
      Beginner: ['SELECT, WHERE & ORDER BY', 'INSERT, UPDATE & DELETE'],
      Intermediate: ['JOINs across tables', 'Aggregation & GROUP BY'],
      Advanced: ['Indexes & query performance', 'Transactions & normalization']
    }
  },
  {
    name: 'Python', slug: 'python', category: 'Programming',
    description: 'Python is a general-purpose programming language known for readable syntax, widely used in data analysis, automation, and backend development.',
    whyItMatters: 'Python is the dominant language for data roles (analysis, ML, automation) and is also a popular, beginner-friendly general-purpose language.',
    useCases: ['Data analysis', 'Automation scripts', 'Backend APIs', 'Machine learning', 'Scientific computing'],
    futureScope: 'Python remains the leading language in data science and AI/ML, with a vast ecosystem (pandas, NumPy, scikit-learn).',
    resources: [
      { type: 'documentation', title: 'Python Official Docs', url: 'https://docs.python.org/3/', provider: 'Python.org' },
      { type: 'course', title: 'Python Tutorial', url: 'https://www.w3schools.com/python/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Python Full Course for Beginners', url: 'https://www.youtube.com/results?search_query=python+full+course+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'Python Exercises', url: 'https://www.hackerrank.com/domains/python', provider: 'HackerRank' }
    ],
    prerequisites: [], related: ['data-analysis', 'sql'],
    topics: {
      Beginner: ['Variables, types & operators', 'Control flow & functions'],
      Intermediate: ['Lists, dicts & file handling', 'Working with modules & pip'],
      Advanced: ['Object-oriented Python', 'Working with pandas & NumPy']
    }
  },
  {
    name: 'Data Analysis', slug: 'data-analysis', category: 'Data',
    description: 'Data analysis is the practice of inspecting, cleaning, and modeling data to extract useful insights and support decisions.',
    whyItMatters: 'Turning raw data into insight is the core job of a data analyst, using tools like Python (pandas), SQL, and visualization libraries.',
    useCases: ['Business reporting', 'Dashboards', 'A/B testing', 'Trend analysis', 'Data cleaning'],
    futureScope: 'Data analysis skills remain in high demand across every industry as companies increasingly rely on data-driven decisions.',
    resources: [
      { type: 'documentation', title: 'pandas Documentation', url: 'https://pandas.pydata.org/docs/', provider: 'pandas' },
      { type: 'youtube', title: 'Data Analysis with Python', url: 'https://www.youtube.com/results?search_query=data+analysis+with+python+full+course', provider: 'YouTube' },
      { type: 'practice', title: 'Kaggle Datasets & Notebooks', url: 'https://www.kaggle.com/', provider: 'Kaggle' }
    ],
    prerequisites: ['python', 'sql'], related: ['python', 'sql'],
    topics: {
      Beginner: ['Data cleaning basics', 'Descriptive statistics'],
      Intermediate: ['pandas for data wrangling', 'Data visualization basics'],
      Advanced: ['Exploratory data analysis', 'Building dashboards & reports']
    }
  },
  {
    name: 'Linux', slug: 'linux', category: 'DevOps',
    description: 'Linux is the open-source operating system that powers the majority of servers and cloud infrastructure.',
    whyItMatters: 'Almost all production servers run Linux. Comfort with the command line, file permissions, and processes is essential for DevOps roles.',
    useCases: ['Server administration', 'Shell scripting', 'CI/CD pipelines', 'Cloud infrastructure'],
    futureScope: 'Linux remains the standard operating system for servers, containers, and cloud infrastructure industry-wide.',
    resources: [
      { type: 'documentation', title: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners', provider: 'Ubuntu' },
      { type: 'course', title: 'Linux Tutorial', url: 'https://www.w3schools.com/linux/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Linux Command Line for Beginners', url: 'https://www.youtube.com/results?search_query=linux+command+line+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: [], related: ['docker', 'cloud-aws'],
    topics: {
      Beginner: ['Navigating the filesystem', 'File permissions & basic commands'],
      Intermediate: ['Shell scripting basics', 'Process management'],
      Advanced: ['System services & networking', 'Automating tasks with cron']
    }
  },
  {
    name: 'Docker', slug: 'docker', category: 'DevOps',
    description: 'Docker is a platform for packaging applications and their dependencies into portable, consistent containers.',
    whyItMatters: 'Docker standardizes how applications are packaged and deployed, making "it works on my machine" problems far less common.',
    useCases: ['Containerizing applications', 'Consistent dev environments', 'Microservices deployment', 'CI/CD pipelines'],
    futureScope: 'Docker and containerization remain foundational to modern DevOps, cloud-native development, and Kubernetes-based deployments.',
    resources: [
      { type: 'documentation', title: 'Docker Documentation', url: 'https://docs.docker.com/', provider: 'Docker' },
      { type: 'youtube', title: 'Docker Crash Course', url: 'https://www.youtube.com/results?search_query=docker+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', provider: 'Docker' }
    ],
    prerequisites: ['linux'], related: ['linux', 'cloud-aws'],
    topics: {
      Beginner: ['Images & containers', 'Dockerfile basics'],
      Intermediate: ['Volumes & networking', 'Docker Compose'],
      Advanced: ['Multi-stage builds', 'Production container practices']
    }
  },
  {
    name: 'Cloud (AWS)', slug: 'cloud-aws', category: 'DevOps',
    description: 'AWS (Amazon Web Services) is the leading cloud platform, providing on-demand computing, storage, and infrastructure services.',
    whyItMatters: 'Cloud platforms like AWS are how most modern applications are deployed and scaled, making cloud fundamentals essential for DevOps and backend roles.',
    useCases: ['Hosting applications', 'Scalable storage', 'Managed databases', 'Serverless functions'],
    futureScope: 'Cloud computing continues to grow as the default deployment model, with AWS as the dominant provider alongside Azure and GCP.',
    resources: [
      { type: 'documentation', title: 'AWS Documentation', url: 'https://docs.aws.amazon.com/', provider: 'AWS' },
      { type: 'course', title: 'AWS Cloud Tutorial', url: 'https://www.w3schools.com/aws/', provider: 'W3Schools' },
      { type: 'youtube', title: 'AWS Fundamentals for Beginners', url: 'https://www.youtube.com/results?search_query=aws+fundamentals+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: ['linux'], related: ['docker', 'linux'],
    topics: {
      Beginner: ['Core services overview (EC2, S3, IAM)', 'Setting up a free-tier account'],
      Intermediate: ['Deploying an application on EC2', 'Managing storage with S3'],
      Advanced: ['Scaling & load balancing', 'Cost management & security basics']
    }
  }
];

const careersData = [
  {
    name: 'Frontend Developer', slug: 'frontend-developer', category: 'Software Development',
    description: 'Frontend developers build the user-facing part of web applications: layout, interactivity, and communication with backend APIs.',
    requiredSkills: [
      { slug: 'html', level: 3 },
      { slug: 'css', level: 3 },
      { slug: 'javascript', level: 3 },
      { slug: 'git', level: 2 },
      { slug: 'rest-apis', level: 2 },
      { slug: 'vue', level: 3 }
    ]
  },
  {
    name: 'Backend Developer', slug: 'backend-developer', category: 'Software Development',
    description: 'Backend developers build the server-side logic, APIs, and databases that power applications.',
    requiredSkills: [
      { slug: 'javascript', level: 2 },
      { slug: 'git', level: 2 },
      { slug: 'rest-apis', level: 3 },
      { slug: 'nodejs', level: 3 },
      { slug: 'express', level: 3 },
      { slug: 'mongodb', level: 2 },
      { slug: 'sql', level: 2 }
    ]
  },
  {
    name: 'Full Stack Developer', slug: 'full-stack-developer', category: 'Software Development',
    description: 'Full stack developers work across both the frontend and backend, building complete web applications end to end.',
    requiredSkills: [
      { slug: 'html', level: 2 },
      { slug: 'css', level: 2 },
      { slug: 'javascript', level: 3 },
      { slug: 'git', level: 2 },
      { slug: 'vue', level: 2 },
      { slug: 'rest-apis', level: 3 },
      { slug: 'nodejs', level: 3 },
      { slug: 'express', level: 2 },
      { slug: 'mongodb', level: 2 }
    ]
  },
  {
    name: 'Data Analyst', slug: 'data-analyst', category: 'Data',
    description: 'Data analysts collect, clean, and interpret data to help organizations make informed decisions.',
    requiredSkills: [
      { slug: 'python', level: 3 },
      { slug: 'sql', level: 3 },
      { slug: 'data-analysis', level: 3 },
      { slug: 'git', level: 1 }
    ]
  },
  {
    name: 'DevOps Engineer', slug: 'devops-engineer', category: 'DevOps',
    description: 'DevOps engineers manage infrastructure, deployment pipelines, and the systems that keep applications running reliably.',
    requiredSkills: [
      { slug: 'git', level: 2 },
      { slug: 'linux', level: 3 },
      { slug: 'docker', level: 3 },
      { slug: 'cloud-aws', level: 2 },
      { slug: 'rest-apis', level: 2 }
    ]
  }
];

module.exports = { skillsData, careersData };
FILEEOF
echo 'wrote src/seed/seedData.js'

cat > 'src/seed/seed.js' << 'FILEEOF'
require('dotenv').config();
const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const Career = require('../models/Career');
const Course = require('../models/Course');
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const UserProfile = require('../models/UserProfile');
const { skillsData, careersData } = require('./seedData');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Clearing existing content...');
  await Promise.all([
    Skill.deleteMany({}),
    Career.deleteMany({}),
    Course.deleteMany({}),
    Level.deleteMany({}),
    CourseProgress.deleteMany({}),
    LessonProgress.deleteMany({}),
    UserProfile.deleteMany({}) // profiles reference skill ids that are about to be recreated
  ]);

  const skillMap = {};
  for (const s of skillsData) {
    const skill = await Skill.create({
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      whyItMatters: s.whyItMatters,
      useCases: s.useCases,
      futureScope: s.futureScope,
      resources: s.resources
    });
    skillMap[s.slug] = skill;
  }
  console.log(`Created ${skillsData.length} skills.`);

  const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  for (const s of skillsData) {
    const skill = skillMap[s.slug];
    skill.prerequisites = (s.prerequisites || []).map((slug) => skillMap[slug]._id);
    skill.relatedSkills = (s.related || []).map((slug) => skillMap[slug]._id);
    await skill.save();

    const course = await Course.create({
      title: `${s.name} Mastery`,
      skill: skill._id,
      description: `A complete path to learning ${s.name}, from fundamentals to advanced topics.`
    });

    for (const levelName of ['Beginner', 'Intermediate', 'Advanced']) {
      await Level.create({
        course: course._id,
        name: levelName,
        order: levelOrder[levelName],
        modules: [
          {
            title: `${s.name} — ${levelName}`,
            lessons: s.topics[levelName].map((topic) => ({
              title: topic,
              content:
                `In this lesson you'll learn about "${topic}" in ${s.name}. Work through the explanation, ` +
                `try it out yourself, and use the resources on this skill's page for more depth. ` +
                `Mark this lesson complete once you feel comfortable with the concept.`,
              codeExample: ''
            }))
          }
        ]
      });
    }
  }
  console.log('Created courses and levels with curriculum for every skill.');

  for (const c of careersData) {
    await Career.create({
      name: c.name,
      slug: c.slug,
      category: c.category,
      description: c.description,
      requiredSkills: c.requiredSkills.map((r) => ({ skill: skillMap[r.slug]._id, requiredLevel: r.level }))
    });
  }
  console.log(`Created ${careersData.length} careers.`);

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
FILEEOF
echo 'wrote src/seed/seed.js'

echo "All backend files updated."
echo "Now run: npm run seed"