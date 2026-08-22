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
