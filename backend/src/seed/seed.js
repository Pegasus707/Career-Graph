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
