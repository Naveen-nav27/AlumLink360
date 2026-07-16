package com.alumini.alumini.connect.config;

import com.alumini.alumini.connect.entity.*;
import com.alumini.alumini.connect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * DataSeeder — seeds all dummy data from the original database.js into MySQL on first boot.
 * Runs only when the colleges table is empty to avoid duplicating data on restarts.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private CollegeRepository collegeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private PostCommentRepository postCommentRepository;
    @Autowired private ConnectionRequestRepository connectionRequestRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if the database is empty
        if (collegeRepository.count() > 0) {
            System.out.println("[DataSeeder] Database already seeded — skipping.");
            userRepository.findByEmail("naveen.s@ksrct.edu").ifPresent(u -> {
                if (u.getPhotoUrl() == null || u.getPhotoUrl().isEmpty() || "null".equals(u.getPhotoUrl())) {
                    u.setPhotoUrl("student_naveen.png");
                    userRepository.save(u);
                    System.out.println("[DataSeeder] Updated Naveen's profile photo to student_naveen.png");
                }
            });
            return;
        }

        System.out.println("[DataSeeder] Seeding database with dummy data...");

        String encodedPassword = passwordEncoder.encode("password123");
        LocalDateTime seedTime = LocalDateTime.of(2026, 7, 11, 10, 0, 0);

        // ===================================================
        // 1. COLLEGES
        // ===================================================
        College ksrct = saveCollege("ksrct", "K.S. Rangasamy College of Technology",
                "KSRCT_LOGO_2.png", "blue", 6.5, "Verifying Academic Excellence since 1994");
        College psg = saveCollege("psg", "PSG College of Technology",
                "PSG_College_of_Technology_logo.png", "purple", 7.5, "PSG Tech Global Alumni Portal Gateway");
        College kct = saveCollege("kct", "Kumaraguru College of Technology",
                "Kumaraguru_College_of_Technology_logo.png", "pink", 7.0, "Kumaraguru College of Technology Portal");
        College vcet = saveCollege("vcet", "Vellalar College of Engineering & Technology",
                "velalar_college_of_engineering_and_technology_logo.jpeg", "teal", 6.0, "Empowering Professional Engineering Careers");
        College srm = saveCollege("srm", "SRM Institute of Science & Technology",
                "d77541e44be753901dc2a9ce403e7f52.jpg", "blue", 6.0, "SRM Global Professional Alumni Directory");
        College vit = saveCollege("vit", "VIT Vellore",
                "a7e2da54368b7a0a0f53fd40065053c0.jpg", "purple", 6.5, "VIT Vellore Alumni & Mentorship Gateway");

        // ===================================================
        // 2. ADMIN USERS (one per college)
        // ===================================================
        User adminKsrct = saveUser(ksrct, "KSRCT Admin", "admin@ksrct.edu", encodedPassword,
                Role.ADMIN, "ADMIN_KSRCT_01", "Administration", null, null, null, null, null, seedTime);
        User adminPsg = saveUser(psg, "PSG Admin", "admin@psg.edu", encodedPassword,
                Role.ADMIN, "ADMIN_PSG_01", "Administration", null, null, null, null, null, seedTime);
        User adminKct = saveUser(kct, "KCT Admin", "admin@kct.edu", encodedPassword,
                Role.ADMIN, "ADMIN_KCT_01", "Administration", null, null, null, null, null, seedTime);
        User adminVcet = saveUser(vcet, "VCET Admin", "admin@vcet.edu", encodedPassword,
                Role.ADMIN, "ADMIN_VCET_01", "Administration", null, null, null, null, null, seedTime);
        User adminSrm = saveUser(srm, "SRM Admin", "admin@srm.edu", encodedPassword,
                Role.ADMIN, "ADMIN_SRM_01", "Administration", null, null, null, null, null, seedTime);
        User adminVit = saveUser(vit, "VIT Admin", "admin@vit.edu", encodedPassword,
                Role.ADMIN, "ADMIN_VIT_01", "Administration", null, null, null, null, null, seedTime);

        // ===================================================
        // 3. STUDENTS
        // ===================================================
        User stuNaveen = saveUser(ksrct, "Naveen S", "naveen.s@ksrct.edu", encodedPassword,
                Role.STUDENT, "STU_KSRCT_01", "Information Technology", 2027, null, 9.23, null, "student_naveen.png", seedTime);
        User stuAnanya = saveUser(ksrct, "Ananya Krishnan", "ananya.krishnan@ksrct.edu", encodedPassword,
                Role.STUDENT, "STU_KSRCT_02", "ECE", 2026, null, 8.40, null, null, seedTime);

        User stuSarah = saveUser(psg, "Sarah Connor", "sarah.connor@psg.edu", encodedPassword,
                Role.STUDENT, "STU_PSG_01", "CSE", 2026, null, 9.20, null, null, seedTime);
        User stuKarthik = saveUser(psg, "Karthik Subramanian", "karthik.s@psg.edu", encodedPassword,
                Role.STUDENT, "STU_PSG_02", "ECE", 2026, null, 8.75, null, null, seedTime);

        User stuAlex = saveUser(kct, "Alex Mercer", "alex.mercer@kct.edu", encodedPassword,
                Role.STUDENT, "STU_KCT_01", "CSE", 2026, null, 8.90, null, null, seedTime);
        User stuDivya = saveUser(kct, "Divya Lakshmi", "divya.l@kct.edu", encodedPassword,
                Role.STUDENT, "STU_KCT_02", "ECE", 2026, null, 8.30, null, null, seedTime);

        User stuRachel = saveUser(vcet, "Rachel Green", "rachel.green@vcet.edu", encodedPassword,
                Role.STUDENT, "STU_VCET_01", "CSE", 2026, null, 8.45, null, null, seedTime);
        User stuMithun = saveUser(vcet, "Mithun Raj", "mithun.raj@vcet.edu", encodedPassword,
                Role.STUDENT, "STU_VCET_02", "ECE", 2026, null, 7.90, null, null, seedTime);

        User stuChandler = saveUser(srm, "Chandler Bing", "chandler.bing@srm.edu", encodedPassword,
                Role.STUDENT, "STU_SRM_01", "CSE", 2026, null, 7.90, null, null, seedTime);
        User stuSneha = saveUser(srm, "Sneha Pillai", "sneha.pillai@srm.edu", encodedPassword,
                Role.STUDENT, "STU_SRM_02", "ECE", 2026, null, 8.60, null, null, seedTime);

        User stuJoey = saveUser(vit, "Joey Tribbiani", "joey.tribbiani@vit.edu", encodedPassword,
                Role.STUDENT, "STU_VIT_01", "CSE", 2026, null, 6.80, null, null, seedTime);
        User stuLavanya = saveUser(vit, "Lavanya Iyer", "lavanya.iyer@vit.edu", encodedPassword,
                Role.STUDENT, "STU_VIT_02", "ECE", 2026, null, 8.10, null, null, seedTime);

        // ===================================================
        // 4. ALUMNI
        // ===================================================
        User aluJane = saveUser(ksrct, "Jane Smith", "jane.smith@yahoo.com", encodedPassword,
                Role.ALUMNI, "ALU_KSRCT_01", "ECE", null, 2022, null,
                "https://linkedin.com/in/janesmith", null, seedTime);
        User aluRavi = saveUser(ksrct, "Ravi Shankar", "ravi.shankar@infosys.com", encodedPassword,
                Role.ALUMNI, "ALU_KSRCT_02", "CSE", null, 2021, null,
                "https://linkedin.com/in/ravishankar", null, seedTime);

        User aluJohn = saveUser(psg, "John Doe", "john.doe@gmail.com", encodedPassword,
                Role.ALUMNI, "ALU_PSG_01", "CSE", null, 2022, null,
                "https://linkedin.com/in/johndoe", null, seedTime);
        User aluPriya = saveUser(psg, "Priya Narayanan", "priya.n@tcs.com", encodedPassword,
                Role.ALUMNI, "ALU_PSG_02", "ECE", null, 2021, null,
                "https://linkedin.com/in/priyanarayanan", null, seedTime);

        User aluRobert = saveUser(kct, "Robert Evans", "robert.evans@outlook.com", encodedPassword,
                Role.ALUMNI, "ALU_KCT_01", "CSE", null, 2022, null,
                "https://linkedin.com/in/robertevans", null, seedTime);
        User aluMeena = saveUser(kct, "Meena Suresh", "meena.s@wipro.com", encodedPassword,
                Role.ALUMNI, "ALU_KCT_02", "ECE", null, 2023, null,
                "https://linkedin.com/in/meenasuresh", null, seedTime);

        User aluRoss = saveUser(vcet, "Ross Geller", "ross.geller@vcet.edu", encodedPassword,
                Role.ALUMNI, "ALU_VCET_01", "ECE", null, 2022, null,
                "https://linkedin.com/in/rossgeller", null, seedTime);
        User aluShalini = saveUser(vcet, "Shalini Murugan", "shalini.m@hcl.com", encodedPassword,
                Role.ALUMNI, "ALU_VCET_02", "CSE", null, 2023, null,
                "https://linkedin.com/in/shalinimurugan", null, seedTime);

        User aluMonica = saveUser(srm, "Monica Geller", "monica.geller@srm.edu", encodedPassword,
                Role.ALUMNI, "ALU_SRM_01", "CSE", null, 2022, null,
                "https://linkedin.com/in/monicageller", null, seedTime);
        User aluArjun = saveUser(srm, "Arjun Nair", "arjun.nair@amazon.com", encodedPassword,
                Role.ALUMNI, "ALU_SRM_02", "ECE", null, 2021, null,
                "https://linkedin.com/in/arjunnair", null, seedTime);

        User aluPhoebe = saveUser(vit, "Phoebe Buffay", "phoebe.buffay@vit.edu", encodedPassword,
                Role.ALUMNI, "ALU_VIT_01", "CSE", null, 2022, null,
                "https://linkedin.com/in/phoebebuffay", null, seedTime);
        User aluVikram = saveUser(vit, "Vikram Bose", "vikram.bose@microsoft.com", encodedPassword,
                Role.ALUMNI, "ALU_VIT_02", "ECE", null, 2023, null,
                "https://linkedin.com/in/vikrambose", null, seedTime);

        // ===================================================
        // 5. JOBS
        // ===================================================
        saveJob(psg, aluJohn, "Full-Stack Developer Intern", "TechCorp (PSG Tech Alumni Referral)",
                "Remote", "React,AWS",
                "Work on cloud-native applications. Receive direct technical mentorship and guidance from a senior PSG tech alumnus.",
                "July 20, 2026", true, seedTime.plusHours(1));

        saveJob(srm, aluMonica, "Data Analytics Intern", "FinanceFlow (SRM Alum Referral)",
                "Hybrid (Chennai)", "Python,SQL",
                "Clean financial datasets, build predictive dashboards, and compile business insight reports alongside senior data analysts.",
                "July 28, 2026", true, seedTime.plusHours(2));

        saveJob(ksrct, aluJane, "Software Developer", "TechCorp",
                "Hybrid", "Java,Spring Boot",
                "Open positions in our software development team at TechCorp. Internship with full-time conversion opportunity after 6 months.",
                "August 15, 2026", true, seedTime.plusHours(3));

        saveJob(kct, adminKct, "Campus Placement Drive — Infosys", "Infosys Limited",
                "In-Person (Coimbatore)", "Java,Communication,Aptitude",
                "Infosys is conducting a placement drive exclusively for Kumaraguru College of Technology students. Package: 4.5 LPA.",
                "August 10, 2026", true, seedTime.plusHours(4));

        saveJob(vit, aluVikram, "Cloud Engineer Intern", "Microsoft (VIT Referral)",
                "Remote", "Azure,DevOps,Python",
                "Join Microsoft's cloud engineering team for a 6-month internship program. Work on real Azure infrastructure projects.",
                "August 5, 2026", true, seedTime.plusHours(5));

        // ===================================================
        // 6. EVENTS
        // ===================================================
        saveEvent(ksrct, adminKsrct, "Clean Energy Challenge", "hackathon",
                "K.S. Rangasamy College of Technology", "Hybrid", "Tech,Design",
                "Collaborate in cross-functional teams to solve energy storage and distribution problems. Mentorship from green energy founders.",
                "Sept 1-3, 2026", true, seedTime.plusMinutes(30));

        saveEvent(kct, adminKct, "FinTech Hackathon 2026", "hackathon",
                "Kumaraguru College of Technology", "In-Person", "DeFi,Web3",
                "Build next-gen decentralized finance tools. Exceptional projects will be fast-tracked to the campus incubation cell.",
                "August 14-16, 2026", true, seedTime.plusMinutes(45));

        saveEvent(vcet, aluRoss, "Executive Leadership & Presence", "workshop",
                "Vellalar College of Engineering & Technology", "Virtual", "Soft Skills",
                "Learn key communication models, structural frameworks, and negotiation strategies utilized by corporate leadership teams.",
                "August 05, 2026", true, seedTime.plusMinutes(60));

        saveEvent(vit, adminVit, "Generative AI in Production", "workshop",
                "VIT Vellore", "Virtual (Zoom)", "LangChain,Hugging Face",
                "Master prompt engineering, LLM fine-tuning, and deployment strategies using LangChain and Hugging Face pipelines.",
                "July 25, 2026", true, seedTime.plusMinutes(75));

        saveEvent(psg, aluPriya, "Industry Mentorship Day", "seminar",
                "PSG College of Technology", "In-Person (Coimbatore)", "Mentorship,Career",
                "One-on-one mentorship sessions with senior alumni from TCS, Wipro, and Infosys. Pre-registration required.",
                "August 20, 2026", true, seedTime.plusMinutes(90));

        saveEvent(srm, aluArjun, "Amazon Leadership Principles Talk", "seminar",
                "SRM Institute", "Virtual (Zoom)", "Leadership,Amazon",
                "Deep dive into Amazon's 16 leadership principles and how to apply them in tech interviews and workplace scenarios.",
                "July 30, 2026", true, seedTime.plusMinutes(105));

        // ===================================================
        // 7. POSTS
        // ===================================================
        Post postKsrct = savePost(ksrct, aluJane, "ALUMNI",
                "Happy to connect with my juniors at KSRCT! We have open positions in our software development team at TechCorp. Feel free to reach out for referrals!",
                null, true, seedTime);

        Post postPsg = savePost(psg, aluJohn, "ALUMNI",
                "Excited to mentor students from PSG Tech on cloud architecture and full-stack engineering next week. Feel free to join our discussion thread!",
                null, true, seedTime.plusHours(1).plusMinutes(30));

        Post postKct = savePost(kct, aluRobert, "ALUMNI",
                "Great seeing Kumaraguru College of Technology organize the upcoming FinTech Hackathon. Looking forward to acting as one of the judges!",
                null, true, seedTime.minusMinutes(45));

        Post postVcet = savePost(vcet, aluRoss, "ALUMNI",
                "Our leadership workshop is scheduled for next week. Hope to see many students joining and learning communication framework models!",
                null, true, seedTime.plusHours(4).plusMinutes(20));

        Post postSrm = savePost(srm, aluMonica, "ALUMNI",
                "Hiring interns for data analytics roles. Reach out if you have strong Python and SQL skills! We are looking for passionate final-year students.",
                null, true, seedTime.plusHours(2).plusMinutes(45));

        Post postVit = savePost(vit, aluPhoebe, "ALUMNI",
                "Hosting a virtual session on Generative AI pipelines next week. Join if you are interested in LangChain implementations and LLM deployment!",
                null, true, seedTime.plusHours(5).plusMinutes(10));

        Post postStuNaveen = savePost(ksrct, stuNaveen, "STUDENT",
                "Just submitted my application for the TechCorp internship. Fingers crossed! Thanks to Jane Smith for the referral opportunity. KSRCT rocks!",
                null, true, seedTime.plusHours(1));

        Post postStuSarah = savePost(psg, stuSarah, "STUDENT",
                "Finished our cloud architecture assignment using AWS EC2 and S3. Really grateful for the mentor session guidance from alumni!",
                null, true, seedTime.plusHours(2));

        Post postAluRavi = savePost(ksrct, aluRavi, "ALUMNI",
                "Infosys is expanding its campus hiring program. KSRCT students — prepare your resumes and practice your aptitude skills. Big batch this year!",
                null, true, seedTime.plusHours(6));

        Post postAluArjun = savePost(srm, aluArjun, "ALUMNI",
                "Amazon is looking for exceptional backend engineers. SRM students with strong DSA and system design skills — message me directly for a referral!",
                null, true, seedTime.plusHours(3));

        // ===================================================
        // 8. POST LIKES
        // ===================================================
        savePostLike(postKsrct, stuNaveen, seedTime.plusMinutes(10));
        savePostLike(postKsrct, stuAnanya, seedTime.plusMinutes(20));
        savePostLike(postPsg, stuSarah, seedTime.plusHours(1).plusMinutes(45));
        savePostLike(postPsg, stuKarthik, seedTime.plusHours(2));
        savePostLike(postKct, stuAlex, seedTime.minusMinutes(30));
        savePostLike(postKct, stuDivya, seedTime.minusMinutes(15));
        savePostLike(postVcet, stuRachel, seedTime.plusHours(4).plusMinutes(30));
        savePostLike(postSrm, stuChandler, seedTime.plusHours(3));
        savePostLike(postSrm, stuSneha, seedTime.plusHours(3).plusMinutes(15));
        savePostLike(postVit, stuJoey, seedTime.plusHours(5).plusMinutes(25));
        savePostLike(postStuNaveen, aluJane, seedTime.plusHours(1).plusMinutes(30));
        savePostLike(postAluRavi, stuNaveen, seedTime.plusHours(6).plusMinutes(10));
        savePostLike(postAluArjun, stuChandler, seedTime.plusHours(3).plusMinutes(20));

        // ===================================================
        // 9. POST COMMENTS
        // ===================================================
        savePostComment(postKsrct, stuNaveen, "STUDENT",
                "Thank you ma'am! I have sent my resume. Really appreciate the opportunity!", seedTime.plusMinutes(45));
        savePostComment(postKsrct, stuAnanya, "STUDENT",
                "This is amazing! Could you please share the job description link as well?", seedTime.plusMinutes(60));
        savePostComment(postPsg, stuSarah, "STUDENT",
                "Really looking forward to the mentorship session! Signed up already.", seedTime.plusHours(2));
        savePostComment(postKct, stuAlex, "STUDENT",
                "Amazing news! Our team has been preparing for weeks. Can't wait for the hackathon!", seedTime);
        savePostComment(postVcet, stuRachel, "STUDENT",
                "Registered for the leadership workshop! Really excited to learn negotiation strategies.", seedTime.plusHours(4).plusMinutes(45));
        savePostComment(postSrm, stuChandler, "STUDENT",
                "Applied! I have experience with Python and pandas from my academic projects.", seedTime.plusHours(3).plusMinutes(30));
        savePostComment(postVit, stuJoey, "STUDENT",
                "Will this cover RAG pipelines too? Really want to understand how to build production-grade LLM apps.", seedTime.plusHours(5).plusMinutes(40));
        savePostComment(postAluRavi, aluJane, "ALUMNI",
                "Great initiative Ravi! Students from KSRCT have always been top picks at Infosys.", seedTime.plusHours(6).plusMinutes(30));
        savePostComment(postAluArjun, stuSneha, "STUDENT",
                "This is incredible! I have been practicing LeetCode daily. Would love a referral!", seedTime.plusHours(3).plusMinutes(45));

        // ===================================================
        // 10. CONNECTION REQUESTS
        // ===================================================
        ConnectionRequest conn1 = saveConnection(stuNaveen, ksrct, aluJane, ksrct, "accepted",
                "Hi Jane! I'm a 3rd year IT student at KSRCT. Would love to connect and learn from your experience at TechCorp.",
                seedTime.minusDays(3));
        ConnectionRequest conn2 = saveConnection(stuAnanya, ksrct, aluRavi, ksrct, "accepted",
                "Hello Ravi sir! I'm an ECE student interested in switching to software. Could you guide me?",
                seedTime.minusDays(2));
        ConnectionRequest conn3 = saveConnection(stuSarah, psg, aluJohn, psg, "accepted",
                "Hi John! Your work on cloud-native applications really inspires me. Would appreciate a mentorship chat.",
                seedTime.minusDays(5));
        ConnectionRequest conn4 = saveConnection(stuAlex, kct, aluRobert, kct, "accepted",
                "Hello Robert! Excited about the FinTech Hackathon. Could you share some tips on DeFi development?",
                seedTime.minusDays(4));
        ConnectionRequest conn5 = saveConnection(stuRachel, vcet, aluRoss, vcet, "accepted",
                "Hi Ross! Your leadership workshop topic is fascinating. Looking forward to the session!",
                seedTime.minusDays(6));
        ConnectionRequest conn6 = saveConnection(stuChandler, srm, aluMonica, srm, "pending",
                "Hi Monica! I'm passionate about data analytics and would love your guidance on breaking into the field.",
                seedTime.minusDays(1));
        ConnectionRequest conn7 = saveConnection(stuJoey, vit, aluPhoebe, vit, "pending",
                "Hi Phoebe! I saw your post about the GenAI session. Would love to connect and learn more!",
                seedTime.minusHours(12));
        ConnectionRequest conn8 = saveConnection(stuNaveen, ksrct, aluJohn, psg, "accepted",
                "Hi John! I'm from KSRCT and interested in full-stack development. Would love your guidance!",
                seedTime.minusDays(7));

        // ===================================================
        // 11. MESSAGES
        // ===================================================
        // Naveen <-> Jane
        saveMessage(conn1, aluJane, "Hi Naveen! Great to connect. What year are you in?", seedTime.minusDays(3).plusMinutes(30));
        saveMessage(conn1, stuNaveen, "I'm in my 3rd year, ma'am! Currently working on my final year project on distributed systems.", seedTime.minusDays(3).plusHours(1));
        saveMessage(conn1, aluJane, "That sounds excellent! Our team at TechCorp is hiring for exactly that profile. Please send your resume to careers@techcorp.com", seedTime.minusDays(3).plusHours(2));
        saveMessage(conn1, stuNaveen, "Thank you so much! I will send it right away. Really appreciate the opportunity!", seedTime.minusDays(3).plusHours(2).plusMinutes(15));
        saveMessage(conn1, aluJane, "Good luck! I'll put in a word with the hiring manager.", seedTime.minusDays(3).plusHours(3));

        // Ananya <-> Ravi
        saveMessage(conn2, aluRavi, "Hello Ananya! Sure, I'd be happy to guide you on transitioning from ECE to software.", seedTime.minusDays(2).plusHours(1));
        saveMessage(conn2, stuAnanya, "Thank you sir! Which programming language should I focus on first?", seedTime.minusDays(2).plusHours(2));
        saveMessage(conn2, aluRavi, "I'd recommend Python for its versatility. Start with DSA, then move to web frameworks. Infosys values problem-solving skills.", seedTime.minusDays(2).plusHours(3));
        saveMessage(conn2, stuAnanya, "That's very helpful! I'll start with Python today itself. Any resources you recommend?", seedTime.minusDays(2).plusHours(4));

        // Sarah <-> John
        saveMessage(conn3, aluJohn, "Hi Sarah! Happy to mentor you. What specific area of cloud are you interested in?", seedTime.minusDays(5).plusHours(2));
        saveMessage(conn3, stuSarah, "I'm really interested in cloud architecture and microservices! I've been learning AWS basics.", seedTime.minusDays(5).plusHours(3));
        saveMessage(conn3, aluJohn, "Perfect! Start with the AWS Solutions Architect certification path. I can review your study plan.", seedTime.minusDays(5).plusHours(4));
        saveMessage(conn3, stuSarah, "Wow, that's amazing guidance! I've enrolled in an AWS course already!", seedTime.minusDays(5).plusHours(5));

        // Alex <-> Robert
        saveMessage(conn4, aluRobert, "Hey Alex! DeFi is a fascinating space. Are you comfortable with Solidity and smart contracts?", seedTime.minusDays(4).plusHours(1));
        saveMessage(conn4, stuAlex, "I've been learning Solidity basics and built a simple token contract. Excited about the hackathon!", seedTime.minusDays(4).plusHours(2));
        saveMessage(conn4, aluRobert, "That's a great start! Focus on security vulnerabilities — reentrancy attacks are common.", seedTime.minusDays(4).plusHours(3));

        // Rachel <-> Ross
        saveMessage(conn5, aluRoss, "Hi Rachel! The workshop will cover STAR communication method and executive presence techniques.", seedTime.minusDays(6).plusHours(2));
        saveMessage(conn5, stuRachel, "That sounds incredible! I've always struggled with presenting in front of senior management.", seedTime.minusDays(6).plusHours(3));
        saveMessage(conn5, aluRoss, "Don't worry — we'll do live practice sessions. Just come with an open mind!", seedTime.minusDays(6).plusHours(4));

        // Naveen <-> John (cross-college)
        saveMessage(conn8, aluJohn, "Hi Naveen! Nice to connect across colleges. What tech stack are you currently learning?", seedTime.minusDays(7).plusHours(3));
        saveMessage(conn8, stuNaveen, "Hi John sir! I'm learning React for frontend and Spring Boot for backend.", seedTime.minusDays(7).plusHours(4));
        saveMessage(conn8, aluJohn, "Great choices! At TechCorp we use exactly React + Java Spring. Keep practicing!", seedTime.minusDays(7).plusHours(5));
        saveMessage(conn8, stuNaveen, "Thank you sir! Really motivating to hear that from someone working at TechCorp!", seedTime.minusDays(7).plusHours(6));

        System.out.println("[DataSeeder] Database seeded successfully!");
        System.out.println("[DataSeeder]    6 Colleges | 6 Admins | 12 Students | 12 Alumni");
        System.out.println("[DataSeeder]    5 Jobs | 6 Events | 10 Posts | 13 Likes | 9 Comments");
        System.out.println("[DataSeeder]    8 Connection Requests | 22 Messages");
    }

    // ===================================================
    // HELPER METHODS
    // ===================================================

    private College saveCollege(String code, String name, String logoUrl,
                                 String themeColor, double minCgpa, String welcomeMsg) {
        College c = new College();
        c.setCode(code);
        c.setName(name);
        c.setLogoUrl(logoUrl);
        c.setThemeColor(themeColor);
        c.setMinCgpa(minCgpa);
        c.setWelcomeMsg(welcomeMsg);
        c.setCreatedAt(LocalDateTime.of(2026, 1, 1, 0, 0, 0));
        return collegeRepository.save(c);
    }

    private User saveUser(College college, String fullName, String email, String password,
                           Role role, String rollNumber, String department,
                           Integer graduationYear, Integer passedOutYear, Double cgpa,
                           String linkedinUrl, String photoUrl, LocalDateTime createdAt) {
        User u = new User();
        u.setCollege(college);
        u.setFullName(fullName);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        u.setRollNumber(rollNumber);
        u.setDepartment(department);
        u.setGraduationYear(graduationYear);
        u.setPassedOutYear(passedOutYear);
        u.setCgpa(cgpa);
        u.setLinkedinUrl(linkedinUrl);
        u.setPhotoUrl(photoUrl);
        u.setStatus("approved");
        u.setCreatedAt(createdAt);
        return userRepository.save(u);
    }

    private void saveJob(College college, User postedBy, String title, String hostCompany,
                          String location, String tags, String description,
                          String deadline, boolean isPublic, LocalDateTime createdAt) {
        Job j = new Job();
        j.setCollege(college);
        j.setPostedBy(postedBy);
        j.setTitle(title);
        j.setHostCompany(hostCompany);
        j.setLocation(location);
        j.setTags(tags);
        j.setDescription(description);
        j.setDeadline(deadline);
        j.setIsPublic(isPublic);
        j.setCreatedAt(createdAt);
        jobRepository.save(j);
    }

    private void saveEvent(College college, User postedBy, String title, String eventType,
                            String host, String location, String tags, String description,
                            String eventDate, boolean isPublic, LocalDateTime createdAt) {
        Event e = new Event();
        e.setCollege(college);
        e.setPostedBy(postedBy);
        e.setTitle(title);
        e.setEventType(eventType);
        e.setHost(host);
        e.setLocation(location);
        e.setTags(tags);
        e.setDescription(description);
        e.setEventDate(eventDate);
        e.setIsPublic(isPublic);
        e.setCreatedAt(createdAt);
        eventRepository.save(e);
    }

    private Post savePost(College college, User author, String authorRole,
                           String content, String imageUrl, boolean isPublic,
                           LocalDateTime createdAt) {
        Post p = new Post();
        p.setCollege(college);
        p.setAuthor(author);
        p.setAuthorRole(authorRole);
        p.setContent(content);
        p.setImageUrl(imageUrl);
        p.setIsPublic(isPublic);
        p.setCreatedAt(createdAt);
        return postRepository.save(p);
    }

    private void savePostLike(Post post, User user, LocalDateTime likedAt) {
        PostLike like = new PostLike();
        like.setPost(post);
        like.setUser(user);
        like.setLikedAt(likedAt);
        postLikeRepository.save(like);
    }

    private void savePostComment(Post post, User author, String authorRole,
                                  String content, LocalDateTime commentedAt) {
        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setAuthorRole(authorRole);
        comment.setContent(content);
        comment.setCommentedAt(commentedAt);
        postCommentRepository.save(comment);
    }

    private ConnectionRequest saveConnection(User fromUser, College fromCollege,
                                              User toUser, College toCollege,
                                              String status, String message,
                                              LocalDateTime sentAt) {
        ConnectionRequest cr = new ConnectionRequest();
        cr.setFromUser(fromUser);
        cr.setFromCollege(fromCollege);
        cr.setToUser(toUser);
        cr.setToCollege(toCollege);
        cr.setStatus(status);
        cr.setMessage(message);
        cr.setSentAt(sentAt);
        return connectionRequestRepository.save(cr);
    }

    private void saveMessage(ConnectionRequest connectionRequest, User sender,
                              String content, LocalDateTime sentAt) {
        Message m = new Message();
        m.setConnectionRequest(connectionRequest);
        m.setSender(sender);
        m.setContent(content);
        m.setSentAt(sentAt);
        m.setIsRead(true);
        messageRepository.save(m);
    }
}
