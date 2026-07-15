document.addEventListener('DOMContentLoaded', () => {
    // Ensure database is initialized
    const collegeData = initDatabase();

    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Scroll Fade-in-up Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // 3. Institution Search & Category Filter System
    const searchInput = document.getElementById('instSearch');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const instCards = document.querySelectorAll('.inst-card');

    let activeCategory = 'all';
    let activeSearchTerm = '';

    const filterInstitutions = () => {
        instCards.forEach(card => {
            const name = card.getAttribute('data-name') || '';
            const categoriesStr = card.getAttribute('data-category') || '';
            const categories = categoriesStr.split(' ');

            const matchesSearch = name.includes(activeSearchTerm);
            const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                card.classList.add('is-visible');
            } else {
                card.style.display = 'none';
            }
        });
    };

    // Category Tabs Event Listeners
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            activeCategory = button.getAttribute('data-category') || 'all';
            filterInstitutions();
        });
    });

    // Search Input Event Listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            activeSearchTerm = e.target.value.toLowerCase().trim();
            filterInstitutions();
        });
    }

    // 4. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 5. Active Opportunities Tab Filtering on Landing Page
    const oppTabs = document.querySelectorAll('.opp-tab-btn');
    const oppCards = document.querySelectorAll('.opp-card');

    oppTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            oppTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-opp-filter') || 'all';

            oppCards.forEach(card => {
                const cardType = card.getAttribute('data-opp-type') || '';
                if (filterValue === 'all' || cardType === filterValue) {
                    card.style.display = 'flex';
                    card.classList.add('is-visible');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- Dynamic College Unread Conversation Stats ---
    const updateCollegeStatsOnLanding = async () => {
        const instCards = document.querySelectorAll('.inst-card');
        instCards.forEach(async (card) => {
            const href = card.querySelector('a.inst-action-btn')?.getAttribute('href');
            if (!href) return;
            const match = href.match(/college=([a-z0-9]+)/);
            if (!match) return;
            const colId = match[1];

            try {
                const users = await API.users.listByCollege(colId).catch(() => []);
                const studentCount = users.filter(u => u.role === 'STUDENT').length;
                const alumniCount = users.filter(u => u.role === 'ALUMNI').length;

                // Insert stats row in card meta
                const meta = card.querySelector('.inst-meta');
                if (meta) {
                    const oldRow = meta.querySelector('.inst-stats-badge-row');
                    if (oldRow) oldRow.remove();

                    const statsRow = document.createElement('div');
                    statsRow.className = 'inst-stats-badge-row';
                    statsRow.style.display = 'flex';
                    statsRow.style.gap = '0.5rem';
                    statsRow.style.marginTop = '0.45rem';
                    
                    let statsHtml = `<span class="inst-badge" style="background-color: var(--bg-secondary); color: var(--text-light); font-weight: 750;">${studentCount} Students</span>`;
                    statsHtml += `<span class="inst-badge" style="background-color: var(--bg-secondary); color: var(--text-light); font-weight: 750;">${alumniCount} Alumni</span>`;
                    statsRow.innerHTML = statsHtml;
                    meta.appendChild(statsRow);
                }
            } catch (err) {
                console.error(err);
            }
        });
    };

    // --- Cross-College Opportunity Registration Modal Manager ---
    const landingOverlay = document.getElementById('landingApplyModalOverlay');
    const closeLandingModalBtn = document.getElementById('closeLandingOppModalBtn');
    const landingForm = document.getElementById('landingOppRegistrationForm');
    const submitLandingBtn = document.getElementById('submitLandingOppBtn');
    const errorMsg = document.getElementById('landingApplyErrorMsg');

    let currentOppId = '';
    let currentOppCollegeId = '';

    // Bind event listeners to all Apply/Register buttons
    document.querySelectorAll('.btn-landing-apply').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentOppId = btn.getAttribute('data-opp-id');
            currentOppCollegeId = btn.getAttribute('data-opp-college');
            
            const title = btn.getAttribute('data-opp-title');
            const host = btn.getAttribute('data-opp-host');
            const type = btn.getAttribute('data-opp-type');

            // Populate Modal Header Details
            document.getElementById('landingOppModalHeaderName').textContent = title;
            document.getElementById('landingOppModalHost').textContent = host;

            const badge = document.getElementById('landingOppModalBadge');
            badge.textContent = type;
            badge.className = 'opp-badge';
            if (type === 'internship') badge.className = 'opp-badge badge-internship';
            else if (type === 'hackathon') badge.className = 'opp-badge badge-hackathon';
            else if (type === 'workshop') badge.className = 'opp-badge badge-workshop';

            // Reset inputs and error messages
            landingForm.reset();
            errorMsg.style.display = 'none';
            submitLandingBtn.disabled = false;
            submitLandingBtn.textContent = 'Authenticate & Register';
            submitLandingBtn.style.backgroundColor = '';

            // Show modal
            landingOverlay.classList.add('open');
        });
    });

    // Close Modal
    const closeLandingModal = () => {
        landingOverlay.classList.remove('open');
    };

    if (closeLandingModalBtn) {
        closeLandingModalBtn.addEventListener('click', closeLandingModal);
    }
    if (landingOverlay) {
        landingOverlay.addEventListener('click', (e) => {
            if (e.target === landingOverlay) closeLandingModal();
        });
    }

    // Handle Form Submit
    if (landingForm) {
        landingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.style.display = 'none';

            const selectedCollegeId = document.getElementById('landingApplyCollegeSelect').value;
            const email = document.getElementById('landingApplyEmail').value.trim();
            const password = document.getElementById('landingApplyPassword').value;
            const gradYear = document.getElementById('landingApplyGradYear').value;
            const resume = document.getElementById('landingApplyResume').value.trim();
            const notes = document.getElementById('landingApplyNotes').value.trim();

            if (!selectedCollegeId) {
                errorMsg.textContent = 'Please select your institution.';
                errorMsg.style.display = 'block';
                return;
            }

            try {
                // 1. Authenticate student via backend API
                const authRes = await API.auth.login({
                    email: email,
                    password: password,
                    collegeCode: selectedCollegeId,
                    role: 'student'
                });

                if (!authRes || authRes.role !== 'student') {
                    errorMsg.textContent = 'Invalid student credentials or unauthorized role.';
                    errorMsg.style.display = 'block';
                    return;
                }

                // Success: Disable button & show progress status
                submitLandingBtn.disabled = true;
                submitLandingBtn.textContent = 'Submitting Registration...';

                // 2. Establish session storage (log them in)
                const sessionObj = {
                    userId: authRes.id,
                    userName: authRes.fullName,
                    userEmail: authRes.email,
                    role: 'student',
                    collegeId: selectedCollegeId,
                    collegeName: COLLEGE_NAMES[selectedCollegeId]
                };
                sessionStorage.setItem('alumlink_active_session', JSON.stringify(sessionObj));

                // 3. Submit application to backend
                const applyBtn = document.querySelector(`.btn-landing-apply[data-opp-id="${currentOppId}"]`);
                const oppType = applyBtn ? applyBtn.getAttribute('data-opp-type') : 'internship';

                let appPayload = {
                    resumeUrl: resume,
                    notes: notes,
                    gradYear: parseInt(gradYear)
                };

                if (oppType === 'internship') {
                    appPayload.jobId = currentOppId;
                } else {
                    appPayload.eventId = currentOppId;
                }

                await API.applications.submit(appPayload, authRes.id);

                // Feedback transition
                submitLandingBtn.textContent = 'Application Registered! Redirecting...';
                submitLandingBtn.style.backgroundColor = '#10b981'; // Green accent
                
                setTimeout(() => {
                    window.location.href = `student.html?college=${selectedCollegeId}`;
                }, 1000);
            } catch (err) {
                errorMsg.textContent = err.message || 'Authentication or submission failed.';
                errorMsg.style.display = 'block';
                submitLandingBtn.disabled = false;
                submitLandingBtn.textContent = 'Authenticate & Register';
            }
        });
    }

    // Run stats updates on landing page load
    updateCollegeStatsOnLanding();
});
