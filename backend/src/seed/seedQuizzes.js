// Curated 3-Question Micro-Quizzes for CareerGraph Skills
// Used for "Proof of Skill" verification to earn the Verified badge.

const quizzesData = {
  html: [
    {
      question: 'Which HTML5 semantic element is most appropriate for independent, self-contained syndicate content like a blog post or news article?',
      options: ['<section>', '<article>', '<aside>', '<div>'],
      correctIndex: 1,
      explanation: '<article> represents a self-contained composition intended to be independently distributable or reusable, such as a blog post or news item.'
    },
    {
      question: 'What is the purpose of the alt attribute on an <img> element?',
      options: ['Specifies the hover tooltip text', 'Provides alternative text for screen readers and when images fail to load', 'Sets the image alignment on the page', 'Caches the image in the browser'],
      correctIndex: 1,
      explanation: 'The alt attribute provides alternative text for accessibility (screen readers) and displays if the image file cannot be rendered.'
    },
    {
      question: 'Which input type should be used for sensitive user credentials to ensure characters are masked as dots or asterisks?',
      options: ['type="hidden"', 'type="text"', 'type="password"', 'type="secure"'],
      correctIndex: 2,
      explanation: 'input type="password" securely obscures the entered characters on the screen.'
    }
  ],
  css: [
    {
      question: 'In the CSS Box Model, which layer is positioned directly between the padding and the margin?',
      options: ['Content', 'Border', 'Outline', 'Background'],
      correctIndex: 1,
      explanation: 'The box model order from inside out is: Content → Padding → Border → Margin.'
    },
    {
      question: 'Which CSS Flexbox property aligns flex items along the main axis?',
      options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
      correctIndex: 1,
      explanation: 'justify-content defines the alignment along the main axis, while align-items aligns along the cross axis.'
    },
    {
      question: 'What does the CSS rule "box-sizing: border-box;" do?',
      options: [
        'Adds a 1px border around every container',
        'Includes padding and border within the element\'s specified width and height',
        'Prevents elements from overflowing the viewport',
        'Forces the element to display as an inline block'
      ],
      correctIndex: 1,
      explanation: 'border-box causes width and height to include the content, padding, and borders, preventing layout overflow surprises.'
    }
  ],
  javascript: [
    {
      question: 'What is the key difference between "let" and "var" declarations in JavaScript?',
      options: [
        '"let" is function-scoped while "var" is block-scoped',
        '"let" is block-scoped while "var" is function-scoped',
        '"let" cannot be reassigned after initialization',
        '"var" variables are never hoisted'
      ],
      correctIndex: 1,
      explanation: '"let" creates block-scoped variables, whereas "var" is scoped to the nearest enclosing function.'
    },
    {
      question: 'What will "typeof null" return in JavaScript due to a historical language bug?',
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctIndex: 2,
      explanation: 'In JavaScript, typeof null returns "object", which is a recognized legacy behavior in the ECMAScript specification.'
    },
    {
      question: 'What is the purpose of Promise.all()?',
      options: [
        'Executes promises in sequential order, pausing between each',
        'Runs multiple promises concurrently and resolves when all resolve, or rejects when any rejects',
        'Catches uncaught exceptions in synchronous functions',
        'Cancels all pending HTTP network requests'
      ],
      correctIndex: 1,
      explanation: 'Promise.all() takes an iterable of promises and fulfills only when all succeed, or rejects immediately on the first error.'
    }
  ],
  git: [
    {
      question: 'Which Git command creates a new branch named "feature-login" and immediately switches to it?',
      options: [
        'git branch -c feature-login',
        'git checkout -b feature-login',
        'git switch --create-only feature-login',
        'git commit -b feature-login'
      ],
      correctIndex: 1,
      explanation: 'git checkout -b <branch> (or git switch -c <branch>) creates a new branch and checks it out in a single step.'
    },
    {
      question: 'What is the primary difference between "git merge" and "git rebase"?',
      options: [
        '"merge" creates a merge commit preserving history, while "rebase" rewrites commits onto a new base for a linear history',
        '"rebase" deletes remote branches while "merge" preserves them',
        '"merge" only works on the main branch',
        '"rebase" does not resolve merge conflicts'
      ],
      correctIndex: 0,
      explanation: 'Merge creates a 2-parent merge commit preserving true history; rebase replays your commits atop the target branch creating a linear history.'
    },
    {
      question: 'How do you temporarily stash uncommitted working directory changes so you can pull latest changes cleanly?',
      options: ['git stash', 'git save --temp', 'git freeze', 'git backup'],
      correctIndex: 0,
      explanation: 'git stash temporarily shelves changes in your working directory and restores your workspace to the clean HEAD state.'
    }
  ],
  'rest-apis': [
    {
      question: 'Which HTTP method should be used to partially update an existing resource rather than replacing it completely?',
      options: ['POST', 'PUT', 'PATCH', 'OPTIONS'],
      correctIndex: 2,
      explanation: 'PATCH applies partial modifications to a resource, while PUT traditionally replaces the complete entity.'
    },
    {
      question: 'What does an HTTP 401 Unauthorized status code signify?',
      options: [
        'The server crashed internally',
        'The request lacked valid authentication credentials',
        'The requested URL was permanently deleted',
        'The server understood credentials but refused authorization'
      ],
      correctIndex: 1,
      explanation: '401 Unauthorized indicates that the request has not been applied because it lacks valid authentication credentials.'
    },
    {
      question: 'What property makes an HTTP method "idempotent"?',
      options: [
        'Making multiple identical requests has the same side effect as making a single request',
        'The method executes in less than 100 milliseconds',
        'The response must always be cached by the browser',
        'The request body must be serialized as XML'
      ],
      correctIndex: 0,
      explanation: 'An HTTP method is idempotent if the side effect of making N > 0 identical requests is identical to making a single request (e.g. GET, PUT, DELETE).'
    }
  ],
  vue: [
    {
      question: 'In Vue 3 Composition API, what is the key difference between ref() and reactive()?',
      options: [
        'ref() only works with strings, while reactive() works with numbers',
        'ref() accepts primitives and wraps them in an object with a .value property, while reactive() only accepts objects',
        'reactive() is synchronous while ref() is asynchronous',
        'ref() cannot be used inside <script setup>'
      ],
      correctIndex: 1,
      explanation: 'ref() takes an inner value (primitive or object) and returns a reactive ref object accessed via .value; reactive() takes only objects.'
    },
    {
      question: 'What is the purpose of computed() properties in Vue?',
      options: [
        'To perform manual DOM querying',
        'To compute reactive derived state that automatically caches until its dependencies change',
        'To send background HTTP requests to a backend server',
        'To trigger browser navigation routes'
      ],
      correctIndex: 1,
      explanation: 'computed() creates cached reactive properties that only recalculate when their tracked reactive dependencies change.'
    },
    {
      question: 'Which directive is used in Vue to create two-way data binding on form input elements?',
      options: ['v-bind', 'v-model', 'v-sync', 'v-on'],
      correctIndex: 1,
      explanation: 'v-model provides two-way binding by automatically syncing the form element value with component state.'
    }
  ],
  nodejs: [
    {
      question: 'How does Node.js handle high concurrency despite executing JavaScript on a single thread?',
      options: [
        'By spawning a new operating system process for each incoming request',
        'Through an event-driven, non-blocking I/O model coordinated by the libuv event loop',
        'By utilizing multi-threaded CPU cache pipelining',
        'By running multiple V8 engine instances concurrently'
      ],
      correctIndex: 1,
      explanation: 'Node.js achieves high concurrency using an event loop and non-blocking asynchronous I/O offloaded to libuv.'
    },
    {
      question: 'Which built-in Node.js module is used to interact with the local filesystem (reading and writing files)?',
      options: ['http', 'path', 'fs', 'os'],
      correctIndex: 2,
      explanation: 'The "fs" (File System) module provides both synchronous and asynchronous APIs to interact with the file system.'
    },
    {
      question: 'What is the role of the package.json file in a Node.js project?',
      options: [
        'Compiles JavaScript into machine code binary',
        'Contains project metadata, scripts, and lists declared third-party dependencies',
        'Stores database credentials securely',
        'Configures network firewall rules'
      ],
      correctIndex: 1,
      explanation: 'package.json manages project configuration, npm scripts, and tracks installed dependency versions.'
    }
  ],
  express: [
    {
      question: 'In Express.js middleware functions, what is the role of the "next()" function parameter?',
      options: [
        'Sends the final JSON response to the client',
        'Passes control to the next middleware function in the request-response cycle',
        'Restarts the HTTP server',
        'Terminates the current socket connection'
      ],
      correctIndex: 1,
      explanation: 'Invoking next() hands off execution to the subsequent middleware function in the Express pipeline.'
    },
    {
      question: 'How do you extract URL path parameters like ":id" in an Express route handler defined as app.get("/users/:id")?',
      options: ['req.body.id', 'req.query.id', 'req.params.id', 'req.headers.id'],
      correctIndex: 2,
      explanation: 'Named route path parameters are populated in the req.params object.'
    },
    {
      question: 'Which built-in Express middleware is used to parse incoming requests with JSON payloads?',
      options: ['express.urlencoded()', 'express.json()', 'express.static()', 'express.router()'],
      correctIndex: 1,
      explanation: 'express.json() parses incoming HTTP requests with Content-Type: application/json.'
    }
  ],
  mongodb: [
    {
      question: 'What data format does MongoDB use internally to store and transmit documents?',
      options: ['XML', 'YAML', 'BSON (Binary JSON)', 'CSV'],
      correctIndex: 2,
      explanation: 'MongoDB stores documents internally in BSON, a binary representation of JSON that supports richer data types like Date and ObjectId.'
    },
    {
      question: 'What is the primary benefit of creating compound indexes in MongoDB (e.g. { user: 1, course: 1 })?',
      options: [
        'Compresses database storage on disk',
        'Allows queries filtering or sorting on both fields together to execute with fast index lookups and enforce uniqueness',
        'Automatically duplicates records across clusters',
        'Encrypts fields with AES-256'
      ],
      correctIndex: 1,
      explanation: 'Compound indexes support queries that match on multiple fields and can enforce compound unique constraints.'
    },
    {
      question: 'In Mongoose, which method is used to replace an ObjectId reference with the actual referenced document from another collection?',
      options: ['aggregate()', 'join()', 'populate()', 'lookup()'],
      correctIndex: 2,
      explanation: 'populate() automatically replaces specified paths in the document with documents from other collections.'
    }
  ],
  sql: [
    {
      question: 'Which SQL clause is used to filter aggregated group results produced by the GROUP BY statement?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
      correctIndex: 1,
      explanation: 'WHERE filters individual rows before aggregation; HAVING filters groups after aggregation.'
    },
    {
      question: 'What is the difference between an INNER JOIN and a LEFT OUTER JOIN?',
      options: [
        'INNER JOIN returns matching records from both tables; LEFT JOIN returns all rows from the left table and matched rows from the right',
        'INNER JOIN modifies the database table directly',
        'LEFT JOIN only works with primary keys',
        'INNER JOIN is always slower than FULL OUTER JOIN'
      ],
      correctIndex: 0,
      explanation: 'An INNER JOIN requires matching keys in both tables; a LEFT JOIN retains all records from the primary (left) table even if right table has NULLs.'
    },
    {
      question: 'What does the "A" in the ACID properties of relational database transactions represent?',
      options: ['Asynchronous', 'Atomicity', 'Authentication', 'Authorization'],
      correctIndex: 1,
      explanation: 'Atomicity ensures that all statements in a transaction succeed together or the entire transaction rolls back cleanly ("all or nothing").'
    }
  ],
  python: [
    {
      question: 'Which data structure in Python is immutable (cannot be modified after creation)?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctIndex: 3,
      explanation: 'Tuples are immutable sequences in Python. Lists, dictionaries, and sets are mutable.'
    },
    {
      question: 'What is the output of the Python list comprehension [x**2 for x in range(4)]?',
      options: ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 2, 4, 6]', '[1, 2, 3, 4]'],
      correctIndex: 0,
      explanation: 'range(4) produces 0, 1, 2, 3. Squaring each yields [0, 1, 4, 9].'
    },
    {
      question: 'In Python, what is the purpose of a "virtual environment" (venv)?',
      options: [
        'To run Python inside an isolated Linux container',
        'To isolate project-specific dependencies and packages from the global system installation',
        'To speed up CPU processing using multi-threading',
        'To compile Python code to WebAssembly'
      ],
      correctIndex: 1,
      explanation: 'Virtual environments isolate package versions for individual projects, preventing dependency conflicts across your machine.'
    }
  ],
  'data-analysis': [
    {
      question: 'In Python\'s Pandas library, which data structure represents a two-dimensional, size-mutable tabular dataset with labeled axes?',
      options: ['Series', 'DataFrame', 'ndarray', 'Tensor'],
      correctIndex: 1,
      explanation: 'A DataFrame is a 2-dimensional labeled data structure with columns of potentially different types, like a spreadsheet.'
    },
    {
      question: 'Which Pandas method is commonly used to remove or drop rows containing missing (NaN) values?',
      options: ['df.fillna()', 'df.dropna()', 'df.clean()', 'df.remove_nulls()'],
      correctIndex: 1,
      explanation: 'df.dropna() filters and drops labels with missing data along a specified axis.'
    },
    {
      question: 'Which statistical metric measures the spread of data points around their arithmetic mean?',
      options: ['Median', 'Mode', 'Standard Deviation', 'Interquartile Range'],
      correctIndex: 2,
      explanation: 'Standard deviation quantifies the amount of dispersion or variation of a set of values relative to their mean.'
    }
  ],
  linux: [
    {
      question: 'Which Linux command changes file permissions for user, group, and others?',
      options: ['chown', 'chmod', 'chgrp', 'lsattr'],
      correctIndex: 1,
      explanation: 'chmod (change mode) changes file access permissions (read, write, execute).'
    },
    {
      question: 'In a Linux command line, what does the pipe symbol "|" do?',
      options: [
        'Runs two commands in parallel in the background',
        'Redirects the standard output (stdout) of the first command as the standard input (stdin) of the second',
        'Appends text directly to a file on disk',
        'Terminates the shell process immediately'
      ],
      correctIndex: 1,
      explanation: 'The pipe operator takes the standard output of the left command and streams it as standard input to the right command.'
    },
    {
      question: 'Which command allows you to view real-time CPU and memory utilization of active processes?',
      options: ['df', 'top', 'uname', 'cat'],
      correctIndex: 1,
      explanation: 'top (or htop) displays a dynamic real-time view of running system processes, CPU, and RAM metrics.'
    }
  ],
  docker: [
    {
      question: 'What is the key architectural difference between a Docker container and a Virtual Machine (VM)?',
      options: [
        'Containers include their own complete guest operating system kernel; VMs do not',
        'Containers share the host operating system kernel and isolate at the process level, making them lightweight and fast',
        'Containers can only run on Linux hosts, while VMs only run on Windows',
        'Containers cannot communicate over network interfaces'
      ],
      correctIndex: 1,
      explanation: 'Containers share the host OS kernel and isolate user spaces, avoiding the hypervisor and full guest OS overhead of VMs.'
    },
    {
      question: 'Which instruction in a Dockerfile sets the default command and parameters to execute when a container starts?',
      options: ['RUN', 'FROM', 'CMD', 'WORKDIR'],
      correctIndex: 2,
      explanation: 'CMD specifies default commands to run inside the container when it starts, whereas RUN executes commands during image build.'
    },
    {
      question: 'What is the purpose of Docker Compose?',
      options: [
        'A tool to define and run multi-container Docker applications using a single YAML configuration file',
        'A compiler that converts Dockerfiles into C++ binaries',
        'A cloud hosting service owned by Microsoft',
        'An encryption key manager for container images'
      ],
      correctIndex: 0,
      explanation: 'Docker Compose defines multi-container environments, networking, and volumes via docker-compose.yml.'
    }
  ],
  'cloud-aws': [
    {
      question: 'Which AWS service provides resizable, on-demand compute capacity (virtual cloud servers)?',
      options: ['Amazon S3', 'Amazon EC2', 'Amazon DynamoDB', 'Amazon CloudFront'],
      correctIndex: 1,
      explanation: 'Amazon EC2 (Elastic Compute Cloud) provides scalable virtual servers in the cloud.'
    },
    {
      question: 'What is Amazon S3 primarily designed for?',
      options: [
        'Hosting relational SQL transactional databases',
        'Scalable, durable object storage for static files, media, and backups',
        'Running real-time streaming machine learning models',
        'DNS domain registration'
      ],
      correctIndex: 1,
      explanation: 'Amazon S3 (Simple Storage Service) is an industry-standard object storage service offering high durability and availability.'
    },
    {
      question: 'What is the principle of "Least Privilege" in AWS IAM (Identity and Access Management)?',
      options: [
        'Granting root administrator privileges to all developers for speed',
        'Granting users and services only the minimum permissions necessary to perform their assigned tasks',
        'Deleting idle user accounts after 30 days',
        'Restricting AWS access to a single physical IP address'
      ],
      correctIndex: 1,
      explanation: 'Least Privilege mandates granting only the minimum permissions required to perform a specific job, minimizing security risks.'
    }
  ],
  'networking-fundamentals': [
    {
      question: 'Which transport layer protocol provides reliable, connection-oriented data delivery with error checking and retransmission?',
      options: ['UDP', 'TCP', 'IP', 'ICMP'],
      correctIndex: 1,
      explanation: 'TCP (Transmission Control Protocol) is connection-oriented and guarantees ordered, error-checked packet delivery.'
    },
    {
      question: 'What is the primary function of the Domain Name System (DNS)?',
      options: [
        'Encrypts HTTP payloads with TLS certificates',
        'Translates human-readable domain names (e.g. google.com) into machine-readable IP addresses (e.g. 142.250.190.46)',
        'Blocks unauthorized ports on local routers',
        'Assigns MAC addresses to physical network cards'
      ],
      correctIndex: 1,
      explanation: 'DNS acts as the phonebook of the internet, mapping human-friendly domain names to numerical IP addresses.'
    },
    {
      question: 'What is the default port number used by secure HTTPS communication?',
      options: ['80', '22', '443', '8080'],
      correctIndex: 2,
      explanation: 'HTTPS operates by default over port 443; unencrypted HTTP operates over port 80.'
    }
  ],
  'cicd-pipelines': [
    {
      question: 'What is the core principle of Continuous Integration (CI)?',
      options: [
        'Deploying code directly to production without testing',
        'Regularly merging code changes into a shared repository, verified by automated builds and automated tests',
        'Backing up database snapshots every hour',
        'Replacing software engineers with automated code generators'
      ],
      correctIndex: 1,
      explanation: 'CI emphasizes merging developer code into main frequently, followed by automated test verification to detect errors early.'
    },
    {
      question: 'In GitHub Actions, what file format and directory location is used to configure workflow pipelines?',
      options: [
        'JSON files in /config/pipelines/',
        'YAML (.yml/.yaml) files in .github/workflows/',
        'Shell (.sh) scripts in the root directory',
        'XML files in .git/hooks/'
      ],
      correctIndex: 1,
      explanation: 'GitHub Actions workflows are defined in YAML files inside the .github/workflows/ folder.'
    },
    {
      question: 'What is the purpose of a "Staging" environment in a deployment pipeline?',
      options: [
        'A sandbox for users to store personal backups',
        'A production replica environment where release candidates are tested under production-like conditions prior to live deployment',
        'A local machine environment running nodemon',
        'A read-only archive of deleted code branches'
      ],
      correctIndex: 1,
      explanation: 'Staging mirrors production as closely as possible to catch deployment or integration bugs before reaching end users.'
    }
  ],
  kubernetes: [
    {
      question: 'What is the smallest deployable computing unit that can be created and managed in Kubernetes?',
      options: ['Node', 'Pod', 'Cluster', 'Deployment'],
      correctIndex: 1,
      explanation: 'A Pod represents a single instance of a running process and is the smallest deployable unit in Kubernetes.'
    },
    {
      question: 'Which Kubernetes component acts as the brains and primary management entry point for the cluster control plane?',
      options: ['kube-proxy', 'kube-apiserver', 'kubelet', 'container runtime'],
      correctIndex: 1,
      explanation: 'kube-apiserver exposes the Kubernetes API and serves as the front end for the cluster control plane.'
    },
    {
      question: 'What is the purpose of a Kubernetes "Service"?',
      options: [
        'Defines a persistent abstract way to expose an application running on a set of Pods with a stable IP and DNS name',
        'Compiles container source code into Docker images',
        'Deletes idle nodes in AWS',
        'Provides storage volumes for local laptops'
      ],
      correctIndex: 0,
      explanation: 'A Kubernetes Service gives a set of dynamic Pods a persistent single IP address and DNS name for reliable networking.'
    }
  ],
  terraform: [
    {
      question: 'What methodology does Terraform employ to manage cloud infrastructure?',
      options: [
        'Imperative shell scripting',
        'Infrastructure as Code (IaC) using declarative configuration files',
        'Manual point-and-click cloud console management',
        'Binary firmware flashing'
      ],
      correctIndex: 1,
      explanation: 'Terraform is an open-source Infrastructure as Code (IaC) tool that uses declarative HashiCorp Configuration Language (HCL).'
    },
    {
      question: 'What is the purpose of the "terraform plan" command?',
      options: [
        'Instantly creates cloud resources in production',
        'Creates an execution plan showing what actions Terraform will perform to reach the desired state without actually applying them',
        'Destroys all provisioned cloud infrastructure',
        'Validates user credit card billing limits'
      ],
      correctIndex: 1,
      explanation: 'terraform plan performs a dry-run previewing the proposed additions, changes, or deletions before committing.'
    },
    {
      question: 'What does the Terraform "state file" (terraform.tfstate) do?',
      options: [
        'Records user passwords for SSH access',
        'Maps declared configuration resources to real-world cloud resources and tracks metadata',
        'Stores Docker container image layers',
        'Configures local network DNS servers'
      ],
      correctIndex: 1,
      explanation: 'The state file tracks the current state of infrastructure so Terraform can calculate deltas during plans.'
    }
  ],
  'monitoring-observability': [
    {
      question: 'What are the "Three Pillars of Observability" in modern distributed software systems?',
      options: [
        'Speed, Security, Scalability',
        'Metrics, Logs, Traces',
        'CPU, RAM, Hard Disk',
        'Frontend, Backend, Database'
      ],
      correctIndex: 1,
      explanation: 'Observability relies on Metrics (numeric aggregates), Logs (timestamped events), and Traces (request path tracking across microservices).'
    },
    {
      question: 'Which open-source tool is widely used in the cloud-native ecosystem to scrape and store time-series metric data?',
      options: ['Prometheus', 'Redis', 'Nginx', 'PostgreSQL'],
      correctIndex: 0,
      explanation: 'Prometheus is the de-facto standard for scraping and storing dimensional time-series operational metrics.'
    },
    {
      question: 'What does distributed tracing provide that traditional centralized logging cannot?',
      options: [
        'Shows end-to-end latency and causal execution flow of a single user request as it traverses across multiple microservices',
        'Compiles source code faster',
        'Eliminates the need for SSL certificates',
        'Backs up database tables automatically'
      ],
      correctIndex: 0,
      explanation: 'Distributed tracing correlates requests across service boundaries using trace and span IDs to pinpoint latency bottlenecks.'
    }
  ],
  'linear-algebra-stats': [
    {
      question: 'In Linear Algebra, what is the result of multiplying an m × k matrix by a k × n matrix?',
      options: ['An m × n matrix', 'A k × k matrix', 'A scalar value', 'An n × m matrix'],
      correctIndex: 0,
      explanation: 'Matrix multiplication of (m × k) and (k × n) produces a matrix of dimensions (m × n).'
    },
    {
      question: 'In Machine Learning optimization, what does the gradient of a loss function represent?',
      options: [
        'The maximum value of the dataset',
        'The vector of partial derivatives pointing in the direction of greatest rate of increase of the loss function',
        'The accuracy score of the validation set',
        'The total number of training samples'
      ],
      correctIndex: 1,
      explanation: 'The gradient vector points in the direction of steepest ascent; gradient descent moves in the opposite direction to minimize loss.'
    },
    {
      question: 'What does Bayes\' Theorem calculate?',
      options: [
        'The posterior probability of an event based on prior knowledge and evidence',
        'The matrix determinant of an orthogonal vector',
        'The maximum eigenvalue of a diagonal matrix',
        'The standard error of a random forest'
      ],
      correctIndex: 0,
      explanation: 'Bayes\' Theorem describes the probability of an event, based on prior conditions that might be related to the event: P(A|B) = P(B|A)*P(A)/P(B).'
    }
  ],
  'machine-learning': [
    {
      question: 'What is "Overfitting" in machine learning model training?',
      options: [
        'The model performs poorly on both training and test data',
        'The model learns the training data and noise so closely that it fails to generalize to new, unseen test data',
        'The dataset has too few features to train on',
        'The training loss does not decrease after 100 epochs'
      ],
      correctIndex: 1,
      explanation: 'Overfitting occurs when a model memorizes the training data, achieving near-perfect training accuracy but poor generalization.'
    },
    {
      question: 'Which algorithm is a Supervised Learning technique used for classification and regression tasks?',
      options: ['K-Means Clustering', 'Random Forest', 'Principal Component Analysis (PCA)', 'Autoencoders'],
      correctIndex: 1,
      explanation: 'Random Forest is an ensemble supervised algorithm; K-Means and PCA are unsupervised techniques.'
    },
    {
      question: 'Why do data scientists split datasets into Training, Validation, and Test sets?',
      options: [
        'To reduce RAM memory consumption during execution',
        'To train parameters on Training, tune hyperparameters on Validation, and evaluate unbiased performance on Test',
        'Because Python libraries require exactly three datasets by law',
        'To compress CSV files into Parquet format'
      ],
      correctIndex: 1,
      explanation: 'Separate splits prevent data leakage and provide an unbiased evaluation of true model performance on unseen data.'
    }
  ],
  'deep-learning': [
    {
      question: 'What is the purpose of an Activation Function (like ReLU) in an Artificial Neural Network?',
      options: [
        'To introduce non-linearity, allowing the network to learn complex non-linear patterns',
        'To speed up CPU clock speed',
        'To normalize database column headers',
        'To prevent GPU overheating during backpropagation'
      ],
      correctIndex: 0,
      explanation: 'Without non-linear activation functions, a multi-layer neural network would behave merely as a single linear transformation.'
    },
    {
      question: 'Which neural network architecture is primarily utilized for computer vision and image processing tasks?',
      options: ['Recurrent Neural Networks (RNN)', 'Convolutional Neural Networks (CNN)', 'Long Short-Term Memory (LSTM)', 'Markov Chains'],
      correctIndex: 1,
      explanation: 'CNNs use convolutional filter kernels with weight sharing to effectively extract spatial features from images.'
    },
    {
      question: 'What algorithm is universally used to compute gradients and update neural network weights via the chain rule?',
      options: ['K-Nearest Neighbors', 'Backpropagation', 'Dijkstra\'s Algorithm', 'Binary Search'],
      correctIndex: 1,
      explanation: 'Backpropagation computes the gradient of the loss function with respect to each weight by the chain rule, iterating backward from output to input.'
    }
  ],
  'genai-llms': [
    {
      question: 'What core architectural mechanism, introduced in "Attention Is All You Need", powers modern Large Language Models?',
      options: ['Self-Attention mechanism in the Transformer architecture', 'Convolutional feature maps', 'Recurrent hidden states', 'Genetic mutations'],
      correctIndex: 0,
      explanation: 'The Transformer architecture with multi-head self-attention allows models to process entire sequences in parallel and capture long-range dependencies.'
    },
    {
      question: 'What is "Retrieval-Augmented Generation" (RAG)?',
      options: [
        'Re-training an LLM from scratch every week',
        'Augmenting an LLM prompt with relevant external context fetched from a vector database or search index to ground responses in factual data',
        'Compressing token embeddings to 8-bit integers',
        'Converting text prompts into audio speech'
      ],
      correctIndex: 1,
      explanation: 'RAG retrieves relevant private or up-to-date documents from a vector database and inserts them into the prompt to prevent hallucinations.'
    },
    {
      question: 'In the context of generative AI, what is a "Hallucination"?',
      options: [
        'When an LLM responds in less than 50 milliseconds',
        'When an LLM generates factually incorrect, nonsensical, or ungrounded statements with high grammatical confidence',
        'When the API server runs out of memory',
        'When a user submits an encrypted prompt'
      ],
      correctIndex: 1,
      explanation: 'Hallucination refers to plausible-sounding but factually incorrect assertions generated by generative language models.'
    }
  ],
  mlops: [
    {
      question: 'What is the primary objective of MLOps (Machine Learning Operations)?',
      options: [
        'Writing Python algorithms solely in Jupyter notebooks',
        'Standardizing and automating the end-to-end ML lifecycle: data collection, training, testing, continuous deployment, and monitoring in production',
        'Buying physical GPU hardware for on-premise data centers',
        'Manual spreadsheet tracking of model parameters'
      ],
      correctIndex: 1,
      explanation: 'MLOps applies DevOps principles to machine learning to ensure reproducible training, CI/CD deployment, and drift monitoring in production.'
    },
    {
      question: 'What is "Data Drift" (or Concept Drift) in a deployed machine learning model?',
      options: [
        'When a hard drive gets disconnected from the server',
        'When the statistical distribution and properties of real-world production input data change over time, degrading model accuracy',
        'When the model architecture is converted from PyTorch to TensorFlow',
        'When training loss oscillates randomly'
      ],
      correctIndex: 1,
      explanation: 'Data drift occurs when real-world input distributions shift compared to the training data, necessitating model retraining.'
    },
    {
      question: 'What does a Model Registry (like MLflow or Weights & Biases) do?',
      options: [
        'Centralizes model versioning, artifacts, hyperparameter tracking, and deployment stage transitions (staging, production, archived)',
        'Automatically writes unit tests for frontend code',
        'Acts as a DNS server for API endpoints',
        'Encrypts SQL database queries'
      ],
      correctIndex: 0,
      explanation: 'A Model Registry stores trained model weights, lineage, metrics, and manages stage lifecycle transitions.'
    }
  ]
};

module.exports = { quizzesData };
