// Shared Candidate CV Data — single source of truth
// Used by: Profile Page, ResumePreviewModal, AiAgentDrawer context injection

export interface CandidateCV {
  role: string
  summary: string
  experience: { role: string; company: string; period: string; details: string }[]
  education: string
  skills: string[]
  verification: string
  phone?: string
  location?: string
  applications?: { job: string; employer: string; status: string; matchScore: number }[]
  interviews?: { job: string; employer: string; date: string; time: string; mode: string; interviewer: string; status: string }[]
}

export const CANDIDATE_CVS: Record<string, CandidateCV> = {
  'Kasun Perera': {
    role: 'Senior React / Next.js Developer',
    summary: 'Architectural engineer with 6+ years building enterprise SaaS platforms using React 19, Next.js 15, Node.js, and PostgreSQL.',
    phone: '+94 77 123 4567',
    location: 'Colombo 03, Sri Lanka',
    experience: [
      { role: 'Senior Software Engineer', company: 'WSO2 Lanka', period: '2022 – Present', details: 'Led Next.js migration for IAM console, reduced page latency by 45%.' },
      { role: 'Full Stack Developer', company: 'Virtusa', period: '2018 – 2022', details: 'Built microservices in Node.js & React for global banking clients.' },
    ],
    education: 'BSc (Hons) Software Engineering — University of Moratuwa',
    skills: ['React 19', 'Next.js 15', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'REST APIs'],
    verification: 'NIC (941234567V) Verified · NVQ Level 6 Software Engineering · Clear Police Report',
    applications: [
      { job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', status: 'Screening', matchScore: 92 },
      { job: 'Full Stack Engineer', employer: 'Zone24x7', status: 'Interview', matchScore: 88 },
    ],
    interviews: [
      { job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', date: '26 Jul 2026', time: '02:00 PM – 03:00 PM', mode: 'WhatsApp Call', interviewer: 'Kavinda Fernando', status: 'awaiting' },
      { job: 'Full Stack Engineer', employer: 'Zone24x7', date: '30 Jul 2026', time: '10:30 AM – 11:30 AM', mode: 'Google Meet', interviewer: 'Chamara Wickramasinghe', status: 'confirmed' },
    ],
  },
  'Janith Alwis': {
    role: 'Senior React / Next.js Developer',
    summary: 'Frontend engineer with 5+ years specializing in React 19, Next.js 15, Redux Toolkit, and GraphQL design systems.',
    phone: '+94 71 222 3344',
    location: 'Colombo, Sri Lanka',
    experience: [
      { role: 'Senior Frontend Developer', company: 'Sysco LABS', period: '2022 – Present', details: 'Architected React frontend design system powering order fulfillment apps.' },
      { role: 'Software Engineer', company: 'Virtusa', period: '2019 – 2022', details: 'Developed high-frequency React component libraries.' },
    ],
    education: 'BSc (Hons) Computer Science — University of Moratuwa',
    skills: ['React 19', 'Next.js 15', 'Redux Toolkit', 'TailwindCSS', 'GraphQL', 'Jest', 'Cypress'],
    verification: 'NIC (952345678V) Verified · Police Report Clear',
    applications: [
      { job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', status: 'Interview', matchScore: 89 },
    ],
    interviews: [
      { job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', date: '25 Jul 2026', time: '10:00 AM – 11:00 AM', mode: 'Google Meet', interviewer: 'Kavinda Fernando', status: 'confirmed' },
    ],
  },
  'Ruwan Wickramasinghe': {
    role: 'Senior React / Next.js Developer',
    summary: 'Frontend Developer with 4 years hands-on experience building responsive web interfaces with React, Next.js, and Vite.',
    phone: '+94 71 987 1122',
    location: 'Kandy, Sri Lanka',
    experience: [
      { role: 'Frontend Developer', company: 'Zone24x7', period: '2022 – Present', details: 'Developed single page React applications and custom dashboard UI components.' },
      { role: 'Associate Developer', company: '99x', period: '2020 – 2022', details: 'Built client web portals using React and REST APIs.' },
    ],
    education: 'BSc Information Technology — SLIIT',
    skills: ['React', 'Next.js', 'JavaScript (ES6+)', 'Vite', 'HTML5/CSS3', 'REST APIs'],
    verification: 'NIC (963456789V) Verified · NVQ Level 5 Verified',
    applications: [
      { job: 'Senior React / Next.js Developer', employer: 'WSO2 Lanka', status: 'Applied', matchScore: 85 },
    ],
  },
  'Sanduni Jayawardena': {
    role: 'Lead UI/UX Product Designer',
    summary: 'Product designer specializing in Figma component design systems, accessibility guidelines, and user research workflows.',
    phone: '+94 71 987 6543',
    location: 'Colombo, Sri Lanka',
    experience: [
      { role: 'Lead UX Designer', company: 'Sysco LABS', period: '2023 – Present', details: 'Established company-wide design system used across 14 product squads.' },
      { role: 'UI/UX Designer', company: 'Zone24x7', period: '2020 – 2023', details: 'Designed e-commerce dashboard interfaces for US enterprise clients.' },
    ],
    education: 'BA (Hons) Design & Interactive Media — SLIIT',
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping', 'TailwindCSS'],
    verification: 'NIC Verified · NVQ Level 5 UX Certification · Verified Portfolio',
    applications: [
      { job: 'Lead UI/UX Designer', employer: 'WSO2 Lanka', status: 'Interview', matchScore: 88 },
    ],
    interviews: [
      { job: 'Lead UI/UX Designer', employer: 'WSO2 Lanka', date: '27 Jul 2026', time: '11:00 AM – 12:00 PM', mode: 'Google Meet', interviewer: 'Nalaka Bandara', status: 'confirmed' },
    ],
  },
  'Priyanka Jayasuriya': {
    role: 'DevOps & Cloud Architect',
    summary: 'DevOps & Cloud Architect with 8+ years leading enterprise Kubernetes clusters, Terraform IaC, and CI/CD pipelines.',
    phone: '+94 75 456 7890',
    location: 'Colombo 05, Sri Lanka',
    experience: [
      { role: 'DevOps Architect', company: 'Dialog Axiata', period: '2021 – Present', details: 'Managed 50+ Kubernetes clusters, automated zero-downtime deployments.' },
      { role: 'Infrastructure Engineer', company: 'Sysco LABS', period: '2016 – 2021', details: 'Built AWS Terraform IaC modules and Prometheus observability stack.' },
    ],
    education: 'BSc (Hons) Computer Science — UCSC',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Python', 'Prometheus'],
    verification: 'NIC Verified · AWS Certified Solutions Architect · CKA Kubernetes · Clear Police Report',
    applications: [
      { job: 'DevOps & Cloud Architect', employer: 'WSO2 Lanka', status: 'Offer', matchScore: 95 },
    ],
  },
  'Dilshan Fernando': {
    role: 'Data Analyst Specialist',
    summary: 'Data Analyst & ML Specialist experienced in SQL data warehousing, Python analytics, and interactive PowerBI dashboards.',
    phone: '+94 76 111 2233',
    location: 'Gampaha, Sri Lanka',
    experience: [
      { role: 'Data Analyst', company: 'MAS Holdings', period: '2023 – Present', details: 'Built supply chain predictive models reducing inventory overhead by 18%.' },
      { role: 'Junior Analyst', company: 'Dialog Axiata', period: '2021 – 2023', details: 'Created customer churn analysis dashboards using SQL and Python.' },
    ],
    education: 'BSc Statistics & Data Science — University of Sri Jayewardenepura',
    skills: ['Python', 'SQL', 'PowerBI', 'Pandas', 'NumPy', 'Machine Learning', 'Tableau'],
    verification: 'NIC Verified · Certified Data Analyst · Valid Driving License',
    applications: [
      { job: 'Data Analyst Specialist', employer: 'WSO2 Lanka', status: 'Applied', matchScore: 84 },
    ],
  },
  'Nirosha Silva': {
    role: 'QA Automation Lead',
    summary: 'QA Lead specializing in Playwright, Selenium, and API test automation frameworks integrated into CI/CD pipelines.',
    phone: '+94 77 334 5566',
    location: 'Nugegoda, Sri Lanka',
    experience: [
      { role: 'QA Lead', company: 'Brandix Tech', period: '2022 – Present', details: 'Architected automated Playwright test suite with 95% regression coverage.' },
      { role: 'QA Engineer', company: 'WSO2', period: '2019 – 2022', details: 'Automated REST API test suites using Postman and Newman CLI.' },
    ],
    education: 'BSc Information Technology — SLIIT',
    skills: ['Playwright', 'Selenium', 'Cypress', 'Postman API', 'TypeScript', 'Jest', 'CI/CD'],
    verification: 'NIC Verified · ISTQB Certified Test Manager · Clear Police Report',
    applications: [
      { job: 'QA Automation Lead', employer: 'WSO2 Lanka', status: 'Rejected', matchScore: 81 },
    ],
  },
}

/** Build a plain-text CV summary string suitable for injection into AI prompts */
export function buildCvContextString(name: string): string {
  const cv = CANDIDATE_CVS[name]
  if (!cv) return ''

  const apps = cv.applications
    ?.map((a) => `    - ${a.job} @ ${a.employer} | Status: ${a.status} | AI Match: ${a.matchScore}%`)
    .join('\n') ?? '    - No active applications'

  const ivs = cv.interviews
    ?.map((i) => `    - ${i.job} @ ${i.employer} | ${i.date} ${i.time} | ${i.mode} | Interviewer: ${i.interviewer} | Status: ${i.status}`)
    .join('\n') ?? '    - No interviews scheduled'

  return (
    `[LOGGED-IN CANDIDATE PROFILE]\n` +
    `Name: ${name}\n` +
    `Current Role / Title: ${cv.role}\n` +
    `Summary: ${cv.summary}\n` +
    `Experience: ${cv.experience.map((e) => `${e.role} at ${e.company} (${e.period})`).join('; ')}\n` +
    `Key Skills: ${cv.skills.join(', ')}\n` +
    `Education: ${cv.education}\n` +
    `Verified Documents: ${cv.verification}\n` +
    `Active Applications:\n${apps}\n` +
    `Scheduled Interviews:\n${ivs}\n`
  )
}
