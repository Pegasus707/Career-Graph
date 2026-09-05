// Seed content for CareerGraph.
// Comprehensive Computer Science tracks: Full Stack Developer, DevOps Engineer, AI/ML Engineer, etc.
// Each skill and career has explicit identifiers (skillId, slug), streams, degrees, and learning phases.

const skillsData = [
  {
    skillId: 'skill-html',
    name: 'HTML',
    slug: 'html',
    category: 'Web Foundations',
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
    prerequisites: [],
    related: ['css', 'javascript'],
    topics: {
      Beginner: ['Document structure & tags', 'Elements, attributes & links'],
      Intermediate: ['Semantic HTML & accessibility', 'Forms & validation'],
      Advanced: ['SEO fundamentals', 'Integrating HTML with frameworks']
    }
  },
  {
    skillId: 'skill-css',
    name: 'CSS',
    slug: 'css',
    category: 'Web Foundations',
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
    prerequisites: ['html'],
    related: ['html', 'javascript'],
    topics: {
      Beginner: ['Selectors, box model & units', 'Colors, typography & spacing'],
      Intermediate: ['Flexbox layout', 'Grid layout & responsive design'],
      Advanced: ['CSS architecture & custom properties', 'Animations & transitions']
    }
  },
  {
    skillId: 'skill-javascript',
    name: 'JavaScript',
    slug: 'javascript',
    category: 'Programming',
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
    prerequisites: ['html', 'css'],
    related: ['git', 'vue', 'nodejs'],
    topics: {
      Beginner: ['Variables, types & operators', 'Functions, conditions & loops'],
      Intermediate: ['DOM & events', 'Promises & async/await'],
      Advanced: ['Closures & prototypes', 'Modules & design patterns']
    }
  },
  {
    skillId: 'skill-git',
    name: 'Git',
    slug: 'git',
    category: 'Tooling',
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
    prerequisites: [],
    related: ['javascript', 'rest-apis'],
    topics: {
      Beginner: ['Init, add, commit, status', 'Branching & merging'],
      Intermediate: ['Remotes, push & pull', 'Pull requests & code review'],
      Advanced: ['Rebasing & conflict resolution', 'Git workflows for teams']
    }
  },
  {
    skillId: 'skill-rest-apis',
    name: 'REST APIs',
    slug: 'rest-apis',
    category: 'Web Foundations',
    description: 'REST (Representational State Transfer) is an architectural style for designing networked APIs using standard HTTP methods.',
    whyItMatters: 'Frontend and backend systems communicate through REST APIs. Understanding requests, responses, and status codes is essential on both sides.',
    useCases: ['Frontend-backend communication', 'Third-party integrations', 'Microservices', 'Mobile app backends'],
    futureScope: 'REST remains the dominant API style across the industry, alongside newer approaches like GraphQL.',
    resources: [
      { type: 'documentation', title: 'HTTP - MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', provider: 'MDN' },
      { type: 'youtube', title: 'REST API Crash Course', url: 'https://www.youtube.com/results?search_query=rest+api+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'Public APIs to practice with', url: 'https://github.com/public-apis/public-apis', provider: 'GitHub' }
    ],
    prerequisites: ['javascript'],
    related: ['nodejs', 'express', 'vue'],
    topics: {
      Beginner: ['HTTP methods & status codes', 'Requests & responses (JSON)'],
      Intermediate: ['Consuming APIs with fetch/axios', 'Authentication headers & tokens'],
      Advanced: ['API design best practices', 'Error handling & pagination']
    }
  },
  {
    skillId: 'skill-vue',
    name: 'Vue',
    slug: 'vue',
    category: 'Frontend Framework',
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
    prerequisites: ['javascript', 'html', 'css'],
    related: ['javascript', 'rest-apis'],
    topics: {
      Beginner: ['Components & templates', 'Reactivity & the Composition API'],
      Intermediate: ['Vue Router & navigation', 'Pinia for state management'],
      Advanced: ['Calling REST APIs from Vue', 'Performance & production builds']
    }
  },
  {
    skillId: 'skill-nodejs',
    name: 'Node.js',
    slug: 'nodejs',
    category: 'Backend',
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
    prerequisites: ['javascript'],
    related: ['express', 'mongodb', 'rest-apis'],
    topics: {
      Beginner: ['Node runtime & modules', 'npm & package.json'],
      Intermediate: ['File system & async I/O', 'Building an HTTP server'],
      Advanced: ['Environment config & security', 'Structuring a production backend']
    }
  },
  {
    skillId: 'skill-express',
    name: 'Express',
    slug: 'express',
    category: 'Backend',
    description: 'Express is a minimal, flexible Node.js web framework used to build REST APIs and web servers.',
    whyItMatters: 'Express is the most widely used Node.js framework for building REST APIs, providing routing, middleware, and request handling.',
    useCases: ['REST API servers', 'Middleware pipelines', 'Authentication systems', 'Backend for frontend'],
    futureScope: 'Express remains the de facto standard for Node.js APIs and underpins many production backend architectures.',
    resources: [
      { type: 'documentation', title: 'Express.js Guide', url: 'https://expressjs.com/en/guide/routing.html', provider: 'Express' },
      { type: 'youtube', title: 'Express.js Crash Course', url: 'https://www.youtube.com/results?search_query=express+js+crash+course', provider: 'YouTube' },
      { type: 'project', title: 'Build a CRUD API with Express', url: 'https://expressjs.com/en/starter/hello-world.html', provider: 'Express' }
    ],
    prerequisites: ['nodejs', 'rest-apis'],
    related: ['nodejs', 'mongodb'],
    topics: {
      Beginner: ['Routing & request handling', 'Middleware basics'],
      Intermediate: ['Building REST endpoints (CRUD)', 'Validation & error handling'],
      Advanced: ['Authentication with JWT', 'Structuring controllers & services']
    }
  },
  {
    skillId: 'skill-mongodb',
    name: 'MongoDB',
    slug: 'mongodb',
    category: 'Database',
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
    prerequisites: [],
    related: ['nodejs', 'express'],
    topics: {
      Beginner: ['Documents & collections', 'CRUD operations'],
      Intermediate: ['Schema design with Mongoose', 'Querying & indexing'],
      Advanced: ['Relationships & population', 'Aggregation pipelines']
    }
  },
  {
    skillId: 'skill-sql',
    name: 'SQL',
    slug: 'sql',
    category: 'Database',
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
    prerequisites: [],
    related: ['mongodb', 'python'],
    topics: {
      Beginner: ['SELECT, WHERE & ORDER BY', 'INSERT, UPDATE & DELETE'],
      Intermediate: ['JOINs across tables', 'Aggregation & GROUP BY'],
      Advanced: ['Indexes & query performance', 'Transactions & normalization']
    }
  },
  {
    skillId: 'skill-python',
    name: 'Python',
    slug: 'python',
    category: 'Programming',
    description: 'Python is a general-purpose programming language known for readable syntax, widely used in data science, AI, automation, and backend development.',
    whyItMatters: 'Python is the dominant language for data analysis, machine learning, and automation scripts, with massive community adoption.',
    useCases: ['Data analysis', 'Machine learning', 'Automation scripts', 'Backend APIs', 'Scientific computing'],
    futureScope: 'Python remains the undisputed leader in data science and modern AI/ML development.',
    resources: [
      { type: 'documentation', title: 'Python Official Docs', url: 'https://docs.python.org/3/', provider: 'Python.org' },
      { type: 'course', title: 'Python Tutorial', url: 'https://www.w3schools.com/python/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Python Full Course for Beginners', url: 'https://www.youtube.com/results?search_query=python+full+course+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'Python Exercises', url: 'https://www.hackerrank.com/domains/python', provider: 'HackerRank' }
    ],
    prerequisites: [],
    related: ['data-analysis', 'sql'],
    topics: {
      Beginner: ['Variables, types & operators', 'Control flow & functions'],
      Intermediate: ['Lists, dicts & file handling', 'Working with modules & pip'],
      Advanced: ['Object-oriented Python', 'Working with pandas & NumPy']
    }
  },
  {
    skillId: 'skill-data-analysis',
    name: 'Data Analysis',
    slug: 'data-analysis',
    category: 'Data',
    description: 'Data analysis is the practice of inspecting, cleaning, transforming, and modeling data to discover useful information.',
    whyItMatters: 'Turning raw data into insight is essential for business reporting and the bedrock of any AI/ML workflow.',
    useCases: ['Business reporting', 'Dashboards', 'A/B testing', 'Trend analysis', 'Data cleaning'],
    futureScope: 'Data analysis skills remain in exceptionally high demand as organizations rely on data-driven decision making.',
    resources: [
      { type: 'documentation', title: 'pandas Documentation', url: 'https://pandas.pydata.org/docs/', provider: 'pandas' },
      { type: 'youtube', title: 'Data Analysis with Python', url: 'https://www.youtube.com/results?search_query=data+analysis+with+python+full+course', provider: 'YouTube' },
      { type: 'practice', title: 'Kaggle Datasets & Notebooks', url: 'https://www.kaggle.com/', provider: 'Kaggle' }
    ],
    prerequisites: ['python', 'sql'],
    related: ['python', 'sql'],
    topics: {
      Beginner: ['Data cleaning basics', 'Descriptive statistics'],
      Intermediate: ['pandas for data wrangling', 'Data visualization with Matplotlib & Seaborn'],
      Advanced: ['Exploratory data analysis (EDA)', 'Building analytical reports & dashboards']
    }
  },
  {
    skillId: 'skill-linux',
    name: 'Linux',
    slug: 'linux',
    category: 'DevOps',
    description: 'Linux is the open-source operating system that powers the vast majority of cloud infrastructure, containers, and web servers.',
    whyItMatters: 'Almost all production servers run Linux. Familiarity with bash, file permissions, and system processes is indispensable for DevOps and backend engineers.',
    useCases: ['Server administration', 'Shell scripting', 'CI/CD pipelines', 'Cloud infrastructure management'],
    futureScope: 'Linux is the permanent foundation of server, cloud-native, and container technologies.',
    resources: [
      { type: 'documentation', title: 'Linux Command Line Basics', url: 'https://ubuntu.com/tutorials/command-line-for-beginners', provider: 'Ubuntu' },
      { type: 'course', title: 'Linux Tutorial', url: 'https://www.w3schools.com/linux/', provider: 'W3Schools' },
      { type: 'youtube', title: 'Linux Command Line for Beginners', url: 'https://www.youtube.com/results?search_query=linux+command+line+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: [],
    related: ['docker', 'cloud-aws'],
    topics: {
      Beginner: ['Navigating the filesystem', 'File permissions & basic commands'],
      Intermediate: ['Shell scripting basics', 'Process management & systemd'],
      Advanced: ['System services & networking', 'Automating tasks with cron']
    }
  },
  {
    skillId: 'skill-docker',
    name: 'Docker',
    slug: 'docker',
    category: 'DevOps',
    description: 'Docker is a containerization platform for packaging applications and their dependencies into portable, isolated containers.',
    whyItMatters: 'Docker eliminates environment drift between development and production, ensuring reliable software delivery across platforms.',
    useCases: ['Containerizing applications', 'Consistent dev environments', 'Microservices deployment', 'CI/CD pipeline test stages'],
    futureScope: 'Docker is foundational to modern cloud infrastructure, Kubernetes workloads, and serverless containers.',
    resources: [
      { type: 'documentation', title: 'Docker Documentation', url: 'https://docs.docker.com/', provider: 'Docker' },
      { type: 'youtube', title: 'Docker Crash Course', url: 'https://www.youtube.com/results?search_query=docker+crash+course', provider: 'YouTube' },
      { type: 'practice', title: 'Play with Docker', url: 'https://labs.play-with-docker.com/', provider: 'Docker' }
    ],
    prerequisites: ['linux'],
    related: ['linux', 'cloud-aws', 'kubernetes'],
    topics: {
      Beginner: ['Images & containers', 'Dockerfile basics'],
      Intermediate: ['Volumes & networking', 'Docker Compose for multi-container apps'],
      Advanced: ['Multi-stage builds & image optimization', 'Production container security']
    }
  },
  {
    skillId: 'skill-cloud-aws',
    name: 'Cloud (AWS)',
    slug: 'cloud-aws',
    category: 'DevOps',
    description: 'Amazon Web Services (AWS) is the world\'s leading cloud provider, offering scalable compute, storage, database, and infrastructure services.',
    whyItMatters: 'Most enterprise software runs on cloud infrastructure. Understanding core AWS services is required for scalable architecture and deployment.',
    useCases: ['Application hosting', 'Scalable object storage', 'Managed relational and NoSQL databases', 'Serverless execution'],
    futureScope: 'Cloud engineering continues to be in peak demand as companies migrate workloads away from on-premise servers.',
    resources: [
      { type: 'documentation', title: 'AWS Documentation', url: 'https://docs.aws.amazon.com/', provider: 'AWS' },
      { type: 'course', title: 'AWS Cloud Tutorial', url: 'https://www.w3schools.com/aws/', provider: 'W3Schools' },
      { type: 'youtube', title: 'AWS Fundamentals for Beginners', url: 'https://www.youtube.com/results?search_query=aws+fundamentals+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: ['linux'],
    related: ['docker', 'linux', 'kubernetes'],
    topics: {
      Beginner: ['Core services overview (EC2, S3, IAM)', 'Account setup & security essentials'],
      Intermediate: ['Deploying an application on EC2', 'VPC, subnets & security groups'],
      Advanced: ['Auto-scaling & Elastic Load Balancing', 'Cost optimization & CloudWatch monitoring']
    }
  },
  {
    skillId: 'skill-networking-fundamentals',
    name: 'Networking Fundamentals',
    slug: 'networking-fundamentals',
    category: 'DevOps',
    description: 'Core concepts of computer networking including IP addressing, DNS, TCP/UDP, HTTP/HTTPS, and routing.',
    whyItMatters: 'DevOps and backend engineers need network literacy to configure load balancers, troubleshoot connection drops, and manage secure cloud VPCs.',
    useCases: ['VPC subnet design', 'Troubleshooting connectivity', 'Configuring DNS and SSL/TLS', 'Firewall and security group rules'],
    futureScope: 'Cloud networking, service meshes (Istio), and edge CDNs all require solid networking fundamentals.',
    resources: [
      { type: 'documentation', title: 'Computer Networking - MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanisms/How_does_the_Internet_work', provider: 'MDN' },
      { type: 'course', title: 'Cloudflare Learning Center', url: 'https://www.cloudflare.com/learning/', provider: 'Cloudflare' },
      { type: 'youtube', title: 'Computer Networking Full Course', url: 'https://www.youtube.com/results?search_query=computer+networking+full+course', provider: 'YouTube' }
    ],
    prerequisites: [],
    related: ['linux', 'cloud-aws'],
    topics: {
      Beginner: ['IP addressing, IPv4 vs IPv6 & Subnetting', 'DNS resolution workflow'],
      Intermediate: ['TCP vs UDP, ports & sockets', 'HTTP/HTTPS, TLS handshake & certificates'],
      Advanced: ['VPC routing tables & NAT Gateways', 'Reverse proxies & load balancer algorithms']
    }
  },
  {
    skillId: 'skill-cicd-pipelines',
    name: 'CI/CD Pipelines',
    slug: 'cicd-pipelines',
    category: 'DevOps',
    description: 'Continuous Integration and Continuous Deployment automation to build, test, package, and release software reliably.',
    whyItMatters: 'Automated delivery pipelines speed up deployment frequency, catch bugs early through automated testing, and eliminate error-prone manual releases.',
    useCases: ['Pull request test automation', 'Automated container build and registry push', 'Zero-downtime production deployment', 'Automated semantic versioning'],
    futureScope: 'GitOps practices and automated progressive delivery are the gold standard for software deployment.',
    resources: [
      { type: 'documentation', title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', provider: 'GitHub' },
      { type: 'youtube', title: 'CI/CD Pipeline with GitHub Actions Crash Course', url: 'https://www.youtube.com/results?search_query=github+actions+cicd+crash+course', provider: 'YouTube' }
    ],
    prerequisites: ['git', 'docker'],
    related: ['docker', 'kubernetes', 'cloud-aws'],
    topics: {
      Beginner: ['CI/CD fundamentals & pipeline triggers', 'GitHub Actions workflow syntax & jobs'],
      Intermediate: ['Running unit/integration tests in CI', 'Building and publishing Docker images to GHCR/DockerHub'],
      Advanced: ['Multi-environment promotion (staging to prod)', 'Handling secrets, rollback strategies & canary releases']
    }
  },
  {
    skillId: 'skill-kubernetes',
    name: 'Kubernetes',
    slug: 'kubernetes',
    category: 'DevOps',
    description: 'Production-grade container orchestration system for automating application deployment, scaling, and operational management.',
    whyItMatters: 'Kubernetes is the industry standard for managing containerized microservices across cloud and on-premise clusters.',
    useCases: ['Multi-container orchestration', 'Horizontal pod auto-scaling', 'Zero-downtime rolling updates', 'Self-healing workloads'],
    futureScope: 'Kubernetes is the bedrock of modern platform engineering and cloud-native application architectures.',
    resources: [
      { type: 'documentation', title: 'Kubernetes Official Documentation', url: 'https://kubernetes.io/docs/home/', provider: 'Kubernetes' },
      { type: 'youtube', title: 'Kubernetes Course for Beginners', url: 'https://www.youtube.com/results?search_query=kubernetes+course+for+beginners', provider: 'YouTube' },
      { type: 'practice', title: 'Killercoda Interactive K8s Scenarios', url: 'https://killercoda.com/', provider: 'Killercoda' }
    ],
    prerequisites: ['docker', 'linux', 'networking-fundamentals'],
    related: ['docker', 'cloud-aws', 'terraform'],
    topics: {
      Beginner: ['Kubernetes architecture, Pods & Namespaces', 'Deployments & ReplicaSets'],
      Intermediate: ['Services (ClusterIP, NodePort, LoadBalancer)', 'ConfigMaps, Secrets & Persistent Volumes'],
      Advanced: ['Ingress Controllers, Horizontal Pod Autoscaler', 'Helm package manager & GitOps with ArgoCD']
    }
  },
  {
    skillId: 'skill-terraform',
    name: 'Terraform',
    slug: 'terraform',
    category: 'DevOps',
    description: 'Infrastructure as Code (IaC) tool that allows developers and DevOps teams to define, provision, and version cloud resources safely.',
    whyItMatters: 'Terraform prevents configuration drift and allows cloud environments to be spun up, updated, and destroyed deterministically using code.',
    useCases: ['Automated cloud resource provisioning', 'Multi-cloud environment setup', 'Disaster recovery environment recreation'],
    futureScope: 'Declarative Infrastructure as Code is an industry-wide prerequisite for cloud and site reliability engineering.',
    resources: [
      { type: 'documentation', title: 'HashiCorp Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', provider: 'HashiCorp' },
      { type: 'youtube', title: 'Terraform Course - Automate Your AWS Cloud Infrastructure', url: 'https://www.youtube.com/results?search_query=terraform+course+automate+aws', provider: 'YouTube' }
    ],
    prerequisites: ['cloud-aws'],
    related: ['cloud-aws', 'kubernetes'],
    topics: {
      Beginner: ['IaC fundamentals & HCL syntax', 'Terraform CLI workflow: init, plan, apply, destroy'],
      Intermediate: ['Variables, outputs & resource dependencies', 'Remote state management with AWS S3 & DynamoDB'],
      Advanced: ['Writing reusable Terraform modules', 'Workspaces, state locking & policy enforcement']
    }
  },
  {
    skillId: 'skill-monitoring-observability',
    name: 'Monitoring & Observability',
    slug: 'monitoring-observability',
    category: 'DevOps',
    description: 'Systematic collection and analysis of metrics, structured logs, and distributed traces to maintain reliability and performance.',
    whyItMatters: 'Modern distributed architectures require real-time visibility to identify bottlenecks, maintain uptime SLAs, and rapidly debug outages.',
    useCases: ['System metrics monitoring (CPU, RAM, network)', 'Application log aggregation', 'Alerting on error spikes and latencies', 'Distributed trace diagnosis'],
    futureScope: 'OpenTelemetry adoption and AI-assisted anomaly detection are shaping modern observability.',
    resources: [
      { type: 'documentation', title: 'Prometheus Overview', url: 'https://prometheus.io/docs/introduction/overview/', provider: 'Prometheus' },
      { type: 'documentation', title: 'Grafana Tutorials', url: 'https://grafana.com/tutorials/', provider: 'Grafana' },
      { type: 'youtube', title: 'Monitoring with Prometheus and Grafana', url: 'https://www.youtube.com/results?search_query=prometheus+grafana+monitoring+crash+course', provider: 'YouTube' }
    ],
    prerequisites: ['linux', 'docker'],
    related: ['linux', 'docker', 'kubernetes'],
    topics: {
      Beginner: ['The 3 pillars of observability: Metrics, Logs, Traces', 'Basic health checking & uptime alerts'],
      Intermediate: ['Prometheus metrics collection & PromQL queries', 'Building production dashboards in Grafana'],
      Advanced: ['Distributed tracing with OpenTelemetry', 'SLI/SLO definition & incident alert management']
    }
  },
  {
    skillId: 'skill-linear-algebra-stats',
    name: 'Math & Statistics for ML',
    slug: 'linear-algebra-stats',
    category: 'Data & AI',
    description: 'Mathematical foundations of artificial intelligence, including linear algebra, matrix decomposition, calculus, and probability theory.',
    whyItMatters: 'Machine learning models rely on matrix transformations, vector embeddings, gradient descent optimization, and probabilistic inferences.',
    useCases: ['Understanding loss function optimization', 'Vector similarity & embeddings calculation', 'Dimensionality reduction (PCA)', 'Hypothesis testing'],
    futureScope: 'Deep mathematical intuition is required for training, fine-tuning, and architecting advanced AI models.',
    resources: [
      { type: 'youtube', title: 'Essence of Linear Algebra - 3Blue1Brown', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', provider: '3Blue1Brown' },
      { type: 'course', title: 'Khan Academy Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', provider: 'Khan Academy' }
    ],
    prerequisites: [],
    related: ['python', 'data-analysis'],
    topics: {
      Beginner: ['Vectors, matrices & basic linear operations', 'Measures of central tendency & standard deviation'],
      Intermediate: ['Matrix multiplication, dot product & cosine similarity', 'Probability distributions & Bayes Theorem'],
      Advanced: ['Eigenvalues, eigenvectors & Singular Value Decomposition', 'Gradient descent, partial derivatives & chain rule']
    }
  },
  {
    skillId: 'skill-machine-learning',
    name: 'Machine Learning',
    slug: 'machine-learning',
    category: 'Artificial Intelligence',
    description: 'Supervised and unsupervised statistical learning algorithms for pattern recognition and predictive modeling on structured data.',
    whyItMatters: 'Machine learning is at the core of data-driven products: classification, recommendation systems, regression, and clustering.',
    useCases: ['Predictive customer analytics', 'Fraud detection', 'Product recommendations', 'Anomaly detection'],
    futureScope: 'Classical machine learning remains the dominant choice for tabular data, fraud modeling, and low-latency production applications.',
    resources: [
      { type: 'documentation', title: 'Scikit-learn Getting Started', url: 'https://scikit-learn.org/stable/getting_started.html', provider: 'Scikit-Learn' },
      { type: 'youtube', title: 'Machine Learning Course for Beginners', url: 'https://www.youtube.com/results?search_query=machine+learning+course+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: ['python', 'linear-algebra-stats'],
    related: ['python', 'data-analysis', 'deep-learning'],
    topics: {
      Beginner: ['Supervised vs unsupervised learning paradigms', 'Linear Regression & Logistic Regression'],
      Intermediate: ['Decision Trees, Random Forests & Gradient Boosting (XGBoost)', 'Model validation metrics: ROC-AUC, F1-Score, RMSE'],
      Advanced: ['Feature engineering, cross-validation & imputation', 'Hyperparameter tuning & Scikit-learn pipelines']
    }
  },
  {
    skillId: 'skill-deep-learning',
    name: 'Deep Learning',
    slug: 'deep-learning',
    category: 'Artificial Intelligence',
    description: 'Multi-layer neural network architectures, backpropagation, convolutional networks, and transformers for complex unstructured data.',
    whyItMatters: 'Deep learning powers human-level perception in computer vision, speech recognition, and natural language understanding.',
    useCases: ['Image recognition & object detection', 'Natural language processing (NLP)', 'Audio transcription', 'Embedding generation'],
    futureScope: 'Foundation models, multimodal architectures, and generative transformers dominate current cutting-edge software.',
    resources: [
      { type: 'documentation', title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', provider: 'PyTorch' },
      { type: 'youtube', title: 'Deep Learning with PyTorch for Beginners', url: 'https://www.youtube.com/results?search_query=deep+learning+pytorch+full+course', provider: 'YouTube' }
    ],
    prerequisites: ['python', 'linear-algebra-stats', 'machine-learning'],
    related: ['machine-learning', 'genai-llms'],
    topics: {
      Beginner: ['Artificial Neurons, Perceptrons & Activation Functions', 'Forward propagation and loss functions'],
      Intermediate: ['Backpropagation & building models with PyTorch', 'Convolutional Neural Networks (CNNs) for images'],
      Advanced: ['Recurrent Neural Networks (RNNs) & Attention mechanism', 'Transfer learning using pre-trained model weights']
    }
  },
  {
    skillId: 'skill-genai-llms',
    name: 'Generative AI & LLMs',
    slug: 'genai-llms',
    category: 'Artificial Intelligence',
    description: 'Large Language Models, prompt engineering, Retrieval-Augmented Generation (RAG), vector databases, and autonomous AI agents.',
    whyItMatters: 'Generative AI has become the defining technology shift of this decade, enabling automated reasoning, semantic synthesis, and autonomous workflows.',
    useCases: ['Enterprise RAG document search', 'Context-aware chatbots & assistants', 'Autonomous agent tooling', 'Synthetic content generation'],
    futureScope: 'GenAI integration, agentic frameworks, and on-device small language models are shaping the future of software applications.',
    resources: [
      { type: 'documentation', title: 'Hugging Face NLP Course', url: 'https://huggingface.co/learn/nlp-course', provider: 'Hugging Face' },
      { type: 'youtube', title: 'Complete Generative AI Course', url: 'https://www.youtube.com/results?search_query=generative+ai+course+full+rag+llm', provider: 'YouTube' }
    ],
    prerequisites: ['python', 'deep-learning'],
    related: ['deep-learning', 'mlops'],
    topics: {
      Beginner: ['Prompt engineering, temperature & token limits', 'Interacting with LLM APIs (OpenAI, Anthropic, Gemini)'],
      Intermediate: ['Vector embeddings & Vector databases (Chroma, Pinecone)', 'Building a complete Retrieval-Augmented Generation (RAG) system'],
      Advanced: ['Fine-tuning models with PEFT/LoRA', 'Building autonomous agents with tool-calling capabilities']
    }
  },
  {
    skillId: 'skill-mlops',
    name: 'MLOps',
    slug: 'mlops',
    category: 'Artificial Intelligence',
    description: 'Engineering practices for building, deploying, versioning, monitoring, and operating machine learning models reliably in production.',
    whyItMatters: 'An AI model is only valuable if it can be deployed with high reliability, monitored against data drift, and retrained automatically.',
    useCases: ['Serving ML models as scalable APIs', 'Experiment tracking and model registries', 'Automated retraining on new data', 'Data drift detection'],
    futureScope: 'Productionizing AI/ML and LLM applications (LLMOps) is one of the highest-demand technical competencies in software.',
    resources: [
      { type: 'documentation', title: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html', provider: 'MLflow' },
      { type: 'youtube', title: 'MLOps Full Course', url: 'https://www.youtube.com/results?search_query=mlops+full+course+for+beginners', provider: 'YouTube' }
    ],
    prerequisites: ['machine-learning', 'docker', 'python'],
    related: ['docker', 'kubernetes', 'cloud-aws'],
    topics: {
      Beginner: ['Model packaging & serving with FastAPI', 'Containerizing models with Docker'],
      Intermediate: ['Experiment tracking & model registries with MLflow', 'Data versioning with DVC'],
      Advanced: ['Automated model retraining pipelines', 'Monitoring model latency, throughput & data drift']
    }
  }
];

const csStreams = ['Computer Science'];
const devopsStreams = ['DevOps & Cloud Engineering'];
const aiStreams = ['AI & Data Science'];
const csDegrees = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'Other'];

const careersData = [
  {
    name: 'Full Stack Developer',
    slug: 'full-stack-developer',
    category: 'Software Development',
    description: 'Full stack developers build end-to-end web applications, mastering user interfaces, backend APIs, and database architectures.',
    streams: csStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'html', level: 3, phase: 'foundations' },
      { slug: 'css', level: 3, phase: 'foundations' },
      { slug: 'javascript', level: 3, phase: 'foundations' },
      { slug: 'git', level: 2, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'rest-apis', level: 3, phase: 'core' },
      { slug: 'vue', level: 3, phase: 'core' },
      { slug: 'nodejs', level: 3, phase: 'core' },
      { slug: 'express', level: 3, phase: 'core' },
      { slug: 'mongodb', level: 2, phase: 'core' },
      { slug: 'sql', level: 2, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'docker', level: 2, phase: 'advanced' },
      { slug: 'cloud-aws', level: 2, phase: 'advanced' }
    ]
  },
  {
    name: 'DevOps Engineer',
    slug: 'devops-engineer',
    category: 'DevOps & Cloud',
    description: 'DevOps engineers automate software deployment pipelines, manage containerized clusters, and ensure high availability cloud infrastructure.',
    streams: devopsStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'linux', level: 3, phase: 'foundations' },
      { slug: 'git', level: 2, phase: 'foundations' },
      { slug: 'networking-fundamentals', level: 2, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'docker', level: 3, phase: 'core' },
      { slug: 'cloud-aws', level: 3, phase: 'core' },
      { slug: 'cicd-pipelines', level: 3, phase: 'core' },
      { slug: 'python', level: 2, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'kubernetes', level: 3, phase: 'advanced' },
      { slug: 'terraform', level: 2, phase: 'advanced' },
      { slug: 'monitoring-observability', level: 2, phase: 'advanced' }
    ]
  },
  {
    name: 'AI/ML Engineer',
    slug: 'ai-ml-engineer',
    category: 'Artificial Intelligence',
    description: 'AI/ML engineers design, train, and operationalize statistical models, deep neural networks, and generative AI systems.',
    streams: aiStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'python', level: 3, phase: 'foundations' },
      { slug: 'linear-algebra-stats', level: 3, phase: 'foundations' },
      { slug: 'git', level: 2, phase: 'foundations' },
      { slug: 'sql', level: 2, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'data-analysis', level: 3, phase: 'core' },
      { slug: 'machine-learning', level: 3, phase: 'core' },
      { slug: 'deep-learning', level: 3, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'genai-llms', level: 3, phase: 'advanced' },
      { slug: 'mlops', level: 2, phase: 'advanced' },
      { slug: 'docker', level: 2, phase: 'advanced' }
    ]
  },
  {
    name: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'Software Development',
    description: 'Frontend developers build the user-facing part of web applications: responsive layout, interactivity, and communication with backend APIs.',
    streams: csStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'html', level: 3, phase: 'foundations' },
      { slug: 'css', level: 3, phase: 'foundations' },
      { slug: 'javascript', level: 3, phase: 'foundations' },
      { slug: 'git', level: 2, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'rest-apis', level: 2, phase: 'core' },
      { slug: 'vue', level: 3, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'docker', level: 1, phase: 'advanced' }
    ]
  },
  {
    name: 'Backend Developer',
    slug: 'backend-developer',
    category: 'Software Development',
    description: 'Backend developers build server-side architectures, robust REST APIs, and database schemas that power web applications.',
    streams: csStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'javascript', level: 3, phase: 'foundations' },
      { slug: 'git', level: 2, phase: 'foundations' },
      { slug: 'linux', level: 2, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'rest-apis', level: 3, phase: 'core' },
      { slug: 'nodejs', level: 3, phase: 'core' },
      { slug: 'express', level: 3, phase: 'core' },
      { slug: 'mongodb', level: 3, phase: 'core' },
      { slug: 'sql', level: 2, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'docker', level: 2, phase: 'advanced' },
      { slug: 'cloud-aws', level: 2, phase: 'advanced' }
    ]
  },
  {
    name: 'Data Analyst',
    slug: 'data-analyst',
    category: 'Data',
    description: 'Data analysts collect, clean, and interpret data to extract business insights and generate actionable dashboards.',
    streams: aiStreams,
    degrees: csDegrees,
    requiredSkills: [
      // Phase 1: Foundations
      { slug: 'python', level: 3, phase: 'foundations' },
      { slug: 'sql', level: 3, phase: 'foundations' },
      { slug: 'git', level: 1, phase: 'foundations' },
      // Phase 2: Core Stack
      { slug: 'data-analysis', level: 3, phase: 'core' },
      { slug: 'linear-algebra-stats', level: 2, phase: 'core' },
      // Phase 3: Advanced & Ecosystem
      { slug: 'machine-learning', level: 1, phase: 'advanced' }
    ]
  }
];

module.exports = { skillsData, careersData };
