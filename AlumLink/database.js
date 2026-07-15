// --- Database Version tag ---
const DATA_VERSION = 'v6-2026-07-13';

// --- Default College Database ---
const DEFAULT_COLLEGE_DATA = {
    ksrct: {
        students: [
            {
                id: "STU_KSRCT_01",
                name: "Naveen S",
                email: "naveen.s@ksrct.edu",
                password: "password123",
                image: "student_naveen.png",
                department: "Information Technology",
                graduationYear: 2027,
                cgpa: 9.23,
                resume: "",
                following: ["ALU_KSRCT_01"],
                status: "approved"
            },
            {
                id: "STU_KSRCT_02",
                name: "Ananya Krishnan",
                email: "ananya.krishnan@ksrct.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 8.40,
                resume: "",
                following: ["ALU_KSRCT_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_KSRCT_01",
                name: "Jane Smith",
                email: "jane.smith@yahoo.com",
                password: "password123",
                department: "ECE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/janesmith",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_KSRCT_02",
                name: "Ravi Shankar",
                email: "ravi.shankar@infosys.com",
                password: "password123",
                department: "CSE",
                passedOutYear: 2021,
                linkedin: "https://linkedin.com/in/ravishankar",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@ksrct.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_KSRCT_1",
                type: "hackathon",
                title: "Clean Energy Challenge",
                host: "K.S. Rangasamy College of Technology",
                deadline: "Sept 1-3, 2026",
                location: "Hybrid",
                tags: ["Tech", "Design"],
                description: "Collaborate in cross-functional teams to solve energy storage and distribution problems. Mentorship from green energy founders.",
                postedBy: "ADMIN"
            }
        ],
        applications: [],
        settings: {
            themeColor: "blue",
            minCgpa: 6.5,
            welcomeMsg: "Verifying Academic Excellence since 1994"
        },
        posts: [
            {
                id: "POST_1717000000001",
                authorId: "ALU_KSRCT_01",
                authorName: "Jane Smith",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "ksrct",
                description: "Happy to connect with my juniors at KSRCT! We have open positions in our software development team at TechCorp. Feel free to reach out for referrals!",
                image: "",
                likes: ["STU_KSRCT_01"],
                comments: [
                    {
                        id: "COMM_1717000000002",
                        authorName: "Naveen S",
                        authorRole: "student",
                        text: "Thank you ma'am! I have sent my resume. Really appreciate the opportunity!",
                        createdAt: "10:45 AM"
                    }
                ],
                createdAt: "July 11, 2026, 10:00:00 AM"
            }
        ]
    },
    psg: {
        students: [
            {
                id: "STU_PSG_01",
                name: "Sarah Connor",
                email: "sarah.connor@psg.edu",
                password: "password123",
                image: "",
                department: "CSE",
                graduationYear: 2026,
                cgpa: 9.20,
                resume: "",
                following: ["ALU_PSG_01"],
                status: "approved"
            },
            {
                id: "STU_PSG_02",
                name: "Karthik Subramanian",
                email: "karthik.s@psg.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 8.75,
                resume: "",
                following: ["ALU_PSG_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_PSG_01",
                name: "John Doe",
                email: "john.doe@gmail.com",
                password: "password123",
                department: "CSE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/johndoe",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_PSG_02",
                name: "Priya Narayanan",
                email: "priya.n@tcs.com",
                password: "password123",
                department: "ECE",
                passedOutYear: 2021,
                linkedin: "https://linkedin.com/in/priyanarayanan",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@psg.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_PSG_1",
                type: "internship",
                title: "Full-Stack Developer Intern",
                host: "TechCorp (PSG Tech Alumni Referral)",
                deadline: "July 20, 2026",
                location: "Remote",
                tags: ["React", "AWS"],
                description: "Work on cloud-native applications. Receive direct technical mentorship and guidance from a senior PSG tech alumnus.",
                postedBy: "ALU_PSG_01"
            }
        ],
        applications: [],
        settings: {
            themeColor: "purple",
            minCgpa: 7.5,
            welcomeMsg: "PSG Tech Global Alumni Portal Gateway"
        },
        posts: [
            {
                id: "POST_1717000000003",
                authorId: "ALU_PSG_01",
                authorName: "John Doe",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "psg",
                description: "Excited to mentor students from PSG Tech on cloud architecture and full-stack engineering next week. Feel free to join our discussion thread!",
                image: "",
                likes: ["STU_PSG_01"],
                comments: [],
                createdAt: "July 11, 2026, 11:30:00 AM"
            }
        ]
    },
    kct: {
        students: [
            {
                id: "STU_KCT_01",
                name: "Alex Mercer",
                email: "alex.mercer@kct.edu",
                password: "password123",
                image: "",
                department: "CSE",
                graduationYear: 2026,
                cgpa: 8.90,
                resume: "",
                following: ["ALU_KCT_01"],
                status: "approved"
            },
            {
                id: "STU_KCT_02",
                name: "Divya Lakshmi",
                email: "divya.l@kct.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 8.30,
                resume: "",
                following: ["ALU_KCT_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_KCT_01",
                name: "Robert Evans",
                email: "robert.evans@outlook.com",
                password: "password123",
                department: "CSE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/robertevans",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_KCT_02",
                name: "Meena Suresh",
                email: "meena.s@wipro.com",
                password: "password123",
                department: "ECE",
                passedOutYear: 2023,
                linkedin: "https://linkedin.com/in/meenasuresh",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@kct.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_KCT_1",
                type: "hackathon",
                title: "FinTech Hackathon 2026",
                host: "Kumaraguru College of Technology",
                deadline: "August 14-16, 2026",
                location: "In-Person",
                tags: ["DeFi", "Web3"],
                description: "Build next-gen decentralized finance tools. Exceptional projects will be fast-tracked to the campus incubation cell.",
                postedBy: "ADMIN"
            }
        ],
        applications: [],
        settings: {
            themeColor: "pink",
            minCgpa: 7.0,
            welcomeMsg: "Kumaraguru College of Technology Portal"
        },
        posts: [
            {
                id: "POST_1717000000004",
                authorId: "ALU_KCT_01",
                authorName: "Robert Evans",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "kct",
                description: "Great seeing Kumaraguru College of Technology organize the upcoming FinTech Hackathon. Looking forward to acting as one of the judges!",
                image: "",
                likes: ["STU_KCT_01"],
                comments: [],
                createdAt: "July 11, 2026, 09:15:00 AM"
            }
        ]
    },
    vcet: {
        students: [
            {
                id: "STU_VCET_01",
                name: "Rachel Green",
                email: "rachel.green@vcet.edu",
                password: "password123",
                image: "",
                department: "CSE",
                graduationYear: 2026,
                cgpa: 8.45,
                resume: "",
                following: ["ALU_VCET_01"],
                status: "approved"
            },
            {
                id: "STU_VCET_02",
                name: "Mithun Raj",
                email: "mithun.raj@vcet.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 7.90,
                resume: "",
                following: ["ALU_VCET_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_VCET_01",
                name: "Ross Geller",
                email: "ross.geller@vcet.edu",
                password: "password123",
                department: "ECE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/rossgeller",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_VCET_02",
                name: "Shalini Murugan",
                email: "shalini.m@hcl.com",
                password: "password123",
                department: "CSE",
                passedOutYear: 2023,
                linkedin: "https://linkedin.com/in/shalinimurugan",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@vcet.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_VCET_1",
                type: "workshop",
                title: "Executive Leadership & Presence",
                host: "Vellalar College of Engineering & Technology",
                deadline: "August 05, 2026",
                location: "Virtual",
                tags: ["Soft Skills"],
                description: "Learn key communication models, structural frameworks, and negotiation strategies utilized by corporate leadership teams.",
                postedBy: "ALU_VCET_01"
            }
        ],
        applications: [],
        settings: {
            themeColor: "teal",
            minCgpa: 6.0,
            welcomeMsg: "Empowering Professional Engineering Careers"
        },
        posts: [
            {
                id: "POST_1717000000005",
                authorId: "ALU_VCET_01",
                authorName: "Ross Geller",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "vcet",
                description: "Our leadership workshop is scheduled for next week. Hope to see many students joining and learning communication framework models!",
                image: "",
                likes: ["STU_VCET_01"],
                comments: [],
                createdAt: "July 11, 2026, 02:20:00 PM"
            }
        ]
    },
    srm: {
        students: [
            {
                id: "STU_SRM_01",
                name: "Chandler Bing",
                email: "chandler.bing@srm.edu",
                password: "password123",
                image: "",
                department: "CSE",
                graduationYear: 2026,
                cgpa: 7.90,
                resume: "",
                following: ["ALU_SRM_01"],
                status: "approved"
            },
            {
                id: "STU_SRM_02",
                name: "Sneha Pillai",
                email: "sneha.pillai@srm.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 8.60,
                resume: "",
                following: ["ALU_SRM_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_SRM_01",
                name: "Monica Geller",
                email: "monica.geller@srm.edu",
                password: "password123",
                department: "CSE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/monicageller",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_SRM_02",
                name: "Arjun Nair",
                email: "arjun.nair@amazon.com",
                password: "password123",
                department: "ECE",
                passedOutYear: 2021,
                linkedin: "https://linkedin.com/in/arjunnair",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@srm.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_SRM_1",
                type: "internship",
                title: "Data Analytics Intern",
                host: "FinanceFlow (SRM Alum Referral)",
                deadline: "July 28, 2026",
                location: "Hybrid (Chennai)",
                tags: ["Python", "SQL"],
                description: "Clean financial datasets, build predictive dashboards, and compile business insight reports alongside senior data analysts.",
                postedBy: "ALU_SRM_01"
            }
        ],
        applications: [],
        settings: {
            themeColor: "blue",
            minCgpa: 6.0,
            welcomeMsg: "SRM Global Professional Alumni Directory"
        },
        posts: [
            {
                id: "POST_1717000000006",
                authorId: "ALU_SRM_01",
                authorName: "Monica Geller",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "srm",
                description: "Hiring interns for data analytics roles. Reach out if you have strong Python and SQL skills! We are looking for passionate final-year students.",
                image: "",
                likes: ["STU_SRM_01"],
                comments: [],
                createdAt: "July 11, 2026, 12:45:00 PM"
            }
        ]
    },
    vit: {
        students: [
            {
                id: "STU_VIT_01",
                name: "Joey Tribbiani",
                email: "joey.tribbiani@vit.edu",
                password: "password123",
                image: "",
                department: "CSE",
                graduationYear: 2026,
                cgpa: 6.80,
                resume: "",
                following: ["ALU_VIT_01"],
                status: "approved"
            },
            {
                id: "STU_VIT_02",
                name: "Lavanya Iyer",
                email: "lavanya.iyer@vit.edu",
                password: "password123",
                image: "",
                department: "ECE",
                graduationYear: 2026,
                cgpa: 8.10,
                resume: "",
                following: ["ALU_VIT_02"],
                status: "approved"
            }
        ],
        alumni: [
            {
                id: "ALU_VIT_01",
                name: "Phoebe Buffay",
                email: "phoebe.buffay@vit.edu",
                password: "password123",
                department: "CSE",
                passedOutYear: 2022,
                linkedin: "https://linkedin.com/in/phoebebuffay",
                image: "",
                status: "approved"
            },
            {
                id: "ALU_VIT_02",
                name: "Vikram Bose",
                email: "vikram.bose@microsoft.com",
                password: "password123",
                department: "ECE",
                passedOutYear: 2023,
                linkedin: "https://linkedin.com/in/vikrambose",
                image: "",
                status: "approved"
            }
        ],
        admin: {
            username: "admin@vit.edu",
            password: "password123"
        },
        opportunities: [
            {
                id: "OPP_VIT_1",
                type: "workshop",
                title: "Generative AI in Production",
                host: "VIT Vellore",
                deadline: "July 25, 2026",
                location: "Virtual (Zoom)",
                tags: ["LangChain", "Hugging Face"],
                description: "Master prompt engineering, LLM fine-tuning, and deployment strategies using LangChain and Hugging Face pipelines.",
                postedBy: "ADMIN"
            }
        ],
        applications: [],
        settings: {
            themeColor: "purple",
            minCgpa: 6.5,
            welcomeMsg: "VIT Vellore Alumni & Mentorship Gateway"
        },
        posts: [
            {
                id: "POST_1717000000007",
                authorId: "ALU_VIT_01",
                authorName: "Phoebe Buffay",
                authorRole: "alumni",
                authorImg: "",
                collegeId: "vit",
                description: "Hosting a virtual session on Generative AI pipelines next week. Join if you are interested in LangChain implementations and LLM deployment!",
                image: "",
                likes: ["STU_VIT_01"],
                comments: [],
                createdAt: "July 11, 2026, 03:10:00 PM"
            }
        ]
    }
};

const COLLEGE_BRANDING = {
    ksrct: {
        name: "K.S. Rangasamy College of Technology",
        logo: "KSRCT_LOGO_2.png"
    },
    vcet: {
        name: "Vellalar College of Engineering & Technology",
        logo: "velalar_college_of_engineering_and_technology_logo.jpeg"
    },
    psg: {
        name: "PSG College of Technology",
        logo: "PSG_College_of_Technology_logo.png"
    },
    kct: {
        name: "Kumaraguru College of Technology",
        logo: "Kumaraguru_College_of_Technology_logo.png"
    },
    srm: {
        name: "SRM Institute of Science & Technology",
        logo: "d77541e44be753901dc2a9ce403e7f52.jpg"
    },
    vit: {
        name: "VIT Vellore",
        logo: "a7e2da54368b7a0a0f53fd40065053c0.jpg"
    }
};

const COLLEGE_NAMES = {
    ksrct: "K.S. Rangasamy College of Technology",
    vcet: "Vellalar College of Engineering & Technology",
    psg: "PSG College of Technology",
    kct: "Kumaraguru College of Technology",
    srm: "SRM Institute of Science & Technology",
    vit: "VIT Vellore"
};

// Standard self-contained offline SVG user profile placeholder
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

// Load state (with version-based force reset)
function initDatabase() {
    let collegeData;
    const storedVersion = localStorage.getItem('alumlink_data_version');
    if (storedVersion !== DATA_VERSION) {
        // Data is stale — wipe and reload defaults
        collegeData = JSON.parse(JSON.stringify(DEFAULT_COLLEGE_DATA));
        localStorage.setItem('alumlink_data_version', DATA_VERSION);
        localStorage.setItem('alumlink_college_data', JSON.stringify(collegeData));
    } else {
        try {
            collegeData = JSON.parse(localStorage.getItem('alumlink_college_data'));
        } catch (e) {
            collegeData = null;
        }
        if (!collegeData) {
            collegeData = JSON.parse(JSON.stringify(DEFAULT_COLLEGE_DATA));
            localStorage.setItem('alumlink_college_data', JSON.stringify(collegeData));
        }
    }

    // Always ensure all colleges exist with correct fields
    Object.keys(DEFAULT_COLLEGE_DATA).forEach(id => {
        if (!collegeData[id]) {
            collegeData[id] = DEFAULT_COLLEGE_DATA[id];
        }
        collegeData[id].name = DEFAULT_COLLEGE_DATA[id].name;
        collegeData[id].logo = DEFAULT_COLLEGE_DATA[id].logo;
        if (!collegeData[id].students) collegeData[id].students = DEFAULT_COLLEGE_DATA[id].students || [];
        if (!collegeData[id].alumni) collegeData[id].alumni = DEFAULT_COLLEGE_DATA[id].alumni || [];
        if (!collegeData[id].admin) collegeData[id].admin = DEFAULT_COLLEGE_DATA[id].admin;
        if (!collegeData[id].opportunities) collegeData[id].opportunities = DEFAULT_COLLEGE_DATA[id].opportunities || [];
        if (!collegeData[id].applications) collegeData[id].applications = [];
        if (!collegeData[id].settings) collegeData[id].settings = DEFAULT_COLLEGE_DATA[id].settings;
        if (!collegeData[id].posts) collegeData[id].posts = DEFAULT_COLLEGE_DATA[id].posts || [];

        // Ensure default posts are globally visible
        collegeData[id].posts.forEach(p => {
            if (p.isPublic === undefined) p.isPublic = true;
        });

        // Ensure students have status field
        collegeData[id].students.forEach(s => {
            if (!s.status) s.status = "approved";
        });

        // Ensure alumni have status field
        collegeData[id].alumni.forEach(a => {
            if (!a.status) a.status = "approved";
        });

        // Inject missing demo accounts
        DEFAULT_COLLEGE_DATA[id].students.forEach(defStu => {
            if (!collegeData[id].students.some(s => s.id === defStu.id)) {
                collegeData[id].students.push(defStu);
            }
        });
        DEFAULT_COLLEGE_DATA[id].alumni.forEach(defAlu => {
            if (!collegeData[id].alumni.some(a => a.id === defAlu.id)) {
                collegeData[id].alumni.push(defAlu);
            }
        });

        // Standardize departments and years
        const mapDeptName = (dept) => {
            if (!dept) return "CSE";
            const d = dept.trim().toLowerCase();
            if (d.includes("computer") || d.includes("cse")) return "CSE";
            if (d.includes("electronic") || d.includes("ece") || d.includes("electric")) return "ECE";
            if (d.includes("information") || d.includes("it")) return "Information Technology";
            if (d.includes("vlsi")) return "VLSI";
            if (d.includes("mechatronic") || d.includes("mechanical") || d.includes("mct")) return "MCT";
            if (d.includes("food") || d.includes("biotech") || d.includes("bio")) return "Food Tech";
            if (d.includes("textile")) return "Textile";
            return "CSE"; // default fallback
        };

        collegeData[id].students.forEach(s => {
            if (s.image && s.image.includes('unsplash.com')) {
                s.image = "";
            }
            s.department = mapDeptName(s.department);
            let year = parseInt(s.graduationYear) || 2025;
            if (year < 2020) year = 2020;
            if (year > 2030) year = 2030;
            s.graduationYear = year;
        });

        collegeData[id].alumni.forEach(a => {
            if (a.image && a.image.includes('unsplash.com')) {
                a.image = "";
            }
            a.department = mapDeptName(a.department);
            let year = parseInt(a.passedOutYear) || 2022;
            if (year < 2020) year = 2020;
            if (year > 2030) year = 2030;
            a.passedOutYear = year;
        });
    });

    localStorage.setItem('alumlink_college_data', JSON.stringify(collegeData));
    return collegeData;
}

// Helpers
const getBatch = (year, duration = 4) => {
    if (!year) return null;
    const y = parseInt(year);
    return `${y - duration}–${y}`;
};

// Dynamic theme helper
const applyTheme = (themeColor) => {
    const colors = {
        blue: { primary: '#3b82f6', dark: '#1d4ed8', light: '#eff6ff' },
        teal: { primary: '#0f766e', dark: '#0d9488', light: '#f0fdfa' },
        purple: { primary: '#7c3aed', dark: '#6d28d9', light: '#f5f3ff' },
        pink: { primary: '#db2777', dark: '#be185d', light: '#fdf2f8' }
    };
    const selectedColor = colors[themeColor || 'blue'];
    document.documentElement.style.setProperty('--color-primary', selectedColor.primary);
    document.documentElement.style.setProperty('--color-primary-dark', selectedColor.dark);
    document.documentElement.style.setProperty('--color-primary-light', selectedColor.light);
};
