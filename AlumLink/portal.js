document.addEventListener('DOMContentLoaded', () => {
    // --- Parse URL parameter ---
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get('college') ? urlParams.get('college').toLowerCase() : '';

    // If college not supported, redirect to index
    if (!collegeId || !COLLEGE_BRANDING[collegeId]) {
        window.location.href = 'index.html';
        return;
    }

    // Load state
    const currentCollegeBranding = COLLEGE_BRANDING[collegeId];

    // Populate Branding
    const logoContainer = document.getElementById('portalLogoContainer');
    const nameEl = document.getElementById('portalCollegeName');

    nameEl.textContent = currentCollegeBranding.name;

    if (currentCollegeBranding.logo.startsWith('text:')) {
        const logoText = currentCollegeBranding.logo.replace('text:', '');
        const textLogo = document.createElement('h3');
        textLogo.style.color = '#0f172a';
        textLogo.style.fontFamily = 'var(--font-serif)';
        textLogo.style.fontWeight = '800';
        textLogo.style.fontSize = '1.35rem';
        textLogo.textContent = logoText;
        logoContainer.appendChild(textLogo);
    } else {
        const imgLogo = document.createElement('img');
        imgLogo.src = currentCollegeBranding.logo;
        imgLogo.alt = currentCollegeBranding.name;
        logoContainer.appendChild(imgLogo);
    }

    // Login logic variables
    let currentRole = 'student';
    const roleTabButtons = document.querySelectorAll('.role-tab-btn');
    const usernameLabel = document.getElementById('usernameLabel');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginForm = document.getElementById('portalLoginForm');
    const submitLoginBtn = document.getElementById('submitLoginBtn');
    const successOverlay = document.getElementById('portalSuccessOverlay');
    const successMsg = document.getElementById('successMsg');
    const adminLinkContainer = document.getElementById('adminLinkContainer');
    const backToUserLinkContainer = document.getElementById('backToUserLinkContainer');

    // Autofill chips
    const quickStudent = document.getElementById('quickStudentChip');
    const quickAlumni = document.getElementById('quickAlumniChip');
    const quickAdmin = document.getElementById('quickAdminChip');

    // Update chips display values and stats via API
    const updateQuickChips = () => {
        API.colleges.getByCode(collegeId)
        .then(collegeInfo => {
            // Apply custom subtitle and color theme style
            document.getElementById('portalWelcomeSubtitle').textContent = collegeInfo.welcomeMsg || "Secure Academic Gateway Authentication";
            applyTheme(collegeInfo.themeColor);

            // Populate Stats Dynamic Counters
            document.getElementById('statAlumniCount').textContent = collegeInfo.alumniCount;
            document.getElementById('statStudentCount').textContent = collegeInfo.studentCount;
            document.getElementById('statOppCount').textContent = collegeInfo.jobCount + collegeInfo.eventCount;

            const codeUpper = collegeId.toUpperCase();
            quickStudent.style.display = 'inline-block';
            quickStudent.textContent = `Student (STU_${codeUpper}_01)`;

            quickAlumni.style.display = 'inline-block';
            quickAlumni.textContent = `Alumnus (ALU_${codeUpper}_01)`;

            quickAdmin.style.display = 'inline-block';
            quickAdmin.textContent = `Admin (admin@${collegeId.toLowerCase()}.edu)`;
        })
        .catch(err => {
            console.error("Error loading college statistics: ", err);
        });
    };

    const setRole = (role) => {
        currentRole = role;
        roleTabButtons.forEach(btn => {
            const btnRole = btn.getAttribute('data-role');
            if (btnRole === role) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }

            // Show/hide appropriate tabs (Student/Alumni by default, Admin when active)
            if (role === 'admin') {
                if (btnRole === 'admin') {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            } else {
                if (btnRole === 'admin') {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = 'inline-block';
                }
            }
        });

        // Hide registration links if switching to admin role
        if (toggleToRegisterContainer) {
            toggleToRegisterContainer.style.display = (role === 'admin') ? 'none' : 'block';
        }

        // Clear error text if active
        const existingError = loginForm.querySelector('.login-error-msg');
        if (existingError) existingError.remove();

        // Update inputs and bottom link visibility
        if (role === 'student') {
            usernameLabel.textContent = 'Register Number / Roll No.';
            usernameInput.placeholder = 'Enter registration number';
            usernameInput.type = 'text';
            if (adminLinkContainer) adminLinkContainer.style.display = 'block';
            if (backToUserLinkContainer) backToUserLinkContainer.style.display = 'none';
        } else if (role === 'alumni') {
            usernameLabel.textContent = 'Alumni Email ID / Membership ID';
            usernameInput.placeholder = 'name@alumni.edu or MEM-1234';
            usernameInput.type = 'text';
            if (adminLinkContainer) adminLinkContainer.style.display = 'block';
            if (backToUserLinkContainer) backToUserLinkContainer.style.display = 'none';
        } else if (role === 'admin') {
            usernameLabel.textContent = 'Staff ID / Admin Email';
            usernameInput.placeholder = 'admin@institution.edu';
            usernameInput.type = 'email';
            if (adminLinkContainer) adminLinkContainer.style.display = 'none';
            if (backToUserLinkContainer) backToUserLinkContainer.style.display = 'block';
        }
        usernameInput.value = '';
        passwordInput.value = '';

        // Update Registration Form conditional fields
        const regStudentFields = document.getElementById('registerStudentFields');
        const regAlumniFields = document.getElementById('registerAlumniFields');
        if (regStudentFields && regAlumniFields) {
            if (role === 'student') {
                regStudentFields.style.display = 'flex';
                regAlumniFields.style.display = 'none';
                
                document.getElementById('registerRollInput').required = true;
                document.getElementById('registerGradYearInput').required = true;
                document.getElementById('registerCgpaInput').required = true;
                
                document.getElementById('registerAlumniIdInput').required = false;
                document.getElementById('registerPassYearInput').required = false;
            } else if (role === 'alumni') {
                regStudentFields.style.display = 'none';
                regAlumniFields.style.display = 'flex';
                
                document.getElementById('registerRollInput').required = false;
                document.getElementById('registerGradYearInput').required = false;
                document.getElementById('registerCgpaInput').required = false;
                
                document.getElementById('registerAlumniIdInput').required = true;
                document.getElementById('registerPassYearInput').required = true;
            } else {
                regStudentFields.style.display = 'none';
                regAlumniFields.style.display = 'none';
                
                document.getElementById('registerRollInput').required = false;
                document.getElementById('registerGradYearInput').required = false;
                document.getElementById('registerCgpaInput').required = false;
                document.getElementById('registerAlumniIdInput').required = false;
                document.getElementById('registerPassYearInput').required = false;
            }
        }
    };

    // Role Tab Event Listeners
    roleTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            setRole(button.getAttribute('data-role'));
        });
    });

    // Admin Login Link Event Listener
    const adminLoginLink = document.getElementById('adminLoginLink');
    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            setRole('admin');
        });
    }

    // Back to Student/Alumni Link Event Listener
    const backToUserLoginLink = document.getElementById('backToUserLoginLink');
    if (backToUserLoginLink) {
        backToUserLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            setRole('student');
        });
    }

    // Quick fills
    quickStudent.addEventListener('click', () => {
        setRole('student');
        const codeUpper = collegeId.toUpperCase();
        usernameInput.value = `STU_${codeUpper}_01`;
        passwordInput.value = 'password123';
    });

    quickAlumni.addEventListener('click', () => {
        setRole('alumni');
        const codeUpper = collegeId.toUpperCase();
        usernameInput.value = `ALU_${codeUpper}_01`;
        passwordInput.value = 'password123';
    });

    quickAdmin.addEventListener('click', () => {
        setRole('admin');
        usernameInput.value = `admin@${collegeId.toLowerCase()}.edu`;
        passwordInput.value = 'password123';
    });

    // Handle Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        // Remove any previous error message
        const existingError = loginForm.querySelector('.login-error-msg');
        if (existingError) existingError.remove();

        submitLoginBtn.disabled = true;
        submitLoginBtn.textContent = 'Verifying credentials...';

        API.auth.login({
            email: username,
            password: password,
            role: currentRole.toUpperCase(),
            collegeCode: collegeId.toLowerCase()
        })
        .then(authenticatedUser => {
            // Save Session Info
            const session = {
                collegeId: collegeId,
                collegeName: authenticatedUser.collegeName || COLLEGE_NAMES[collegeId],
                role: currentRole,
                userId: authenticatedUser.id,
                userName: authenticatedUser.fullName,
                userEmail: authenticatedUser.email || ''
            };
            sessionStorage.setItem('alumlink_active_session', JSON.stringify(session));

            successMsg.textContent = `Access authorized for ${authenticatedUser.fullName}. Connecting...`;
            successOverlay.classList.add('show');
            
            setTimeout(() => {
                if (currentRole === 'student') {
                    window.location.href = `student.html?college=${collegeId}`;
                } else if (currentRole === 'alumni') {
                    window.location.href = `alumni.html?college=${collegeId}`;
                } else if (currentRole === 'admin') {
                    window.location.href = `admin.html?college=${collegeId}`;
                }
            }, 1000);
        })
        .catch(err => {
            submitLoginBtn.disabled = false;
            submitLoginBtn.textContent = 'Authorize & Sign In';
            
            const errEl = document.createElement('p');
            errEl.className = 'login-error-msg';
            errEl.style.color = 'var(--color-pink)';
            errEl.style.fontSize = '0.825rem';
            errEl.style.fontWeight = '700';
            errEl.style.marginTop = '0.75rem';
            errEl.style.textAlign = 'center';
            errEl.textContent = err.message || 'Invalid credentials for chosen role. Please check and try again.';
            loginForm.appendChild(errEl);
        });
    });

    // --- Login/Register UI Toggling Logic ---
    const registerForm = document.getElementById('portalRegisterForm');
    const toggleToRegisterLink = document.getElementById('toggleToRegisterLink');
    const toggleToLoginLink = document.getElementById('toggleToLoginLink');
    
    const toggleToRegisterContainer = document.getElementById('toggleToRegisterContainer');
    const toggleToLoginContainer = document.getElementById('toggleToLoginContainer');
    const quickFillSection = document.querySelector('.login-quick-fill');

    const showRegisterForm = (e) => {
        if (e) e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        toggleToRegisterContainer.style.display = 'none';
        toggleToLoginContainer.style.display = 'block';
        if (quickFillSection) quickFillSection.style.display = 'none';
        
        // Hide Admin login link in register mode
        if (adminLinkContainer) adminLinkContainer.style.display = 'none';
        if (backToUserLinkContainer) backToUserLinkContainer.style.display = 'none';
        
        // Trigger setRole again to reset conditional required fields
        setRole(currentRole);
    };

    const showLoginForm = (e) => {
        if (e) e.preventDefault();
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
        toggleToRegisterContainer.style.display = 'block';
        toggleToLoginContainer.style.display = 'none';
        if (quickFillSection) quickFillSection.style.display = 'block';
        
        if (currentRole === 'admin') {
            if (backToUserLinkContainer) backToUserLinkContainer.style.display = 'block';
        } else {
            if (adminLinkContainer) adminLinkContainer.style.display = 'block';
        }
        
        setRole(currentRole);
    };

    if (toggleToRegisterLink) toggleToRegisterLink.addEventListener('click', showRegisterForm);
    if (toggleToLoginLink) toggleToLoginLink.addEventListener('click', showLoginForm);

    // --- Registration Form Submission ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameVal = document.getElementById('registerNameInput').value.trim();
        const emailVal = document.getElementById('registerEmailInput').value.trim();
        const passwordVal = document.getElementById('registerPasswordInput').value;
        const deptVal = document.getElementById('registerDeptInput').value.trim();

        // Clear previous register errors if any
        const existingRegError = registerForm.querySelector('.register-error-msg');
        if (existingRegError) existingRegError.remove();

        const submitRegisterBtn = document.getElementById('submitRegisterBtn');
        submitRegisterBtn.disabled = true;
        submitRegisterBtn.textContent = 'Processing registration...';

        const reqBody = {
            fullName: nameVal,
            email: emailVal,
            password: passwordVal,
            role: currentRole.toUpperCase(),
            collegeCode: collegeId.toLowerCase(),
            department: deptVal
        };

        let idVal = '';
        if (currentRole === 'student') {
            idVal = document.getElementById('registerRollInput').value.trim();
            reqBody.rollNumber = idVal;
            reqBody.graduationYear = parseInt(document.getElementById('registerGradYearInput').value) || 2026;
            reqBody.cgpa = parseFloat(document.getElementById('registerCgpaInput').value) || 0.0;
        } else if (currentRole === 'alumni') {
            idVal = document.getElementById('registerAlumniIdInput').value.trim();
            reqBody.rollNumber = idVal; // store alumni ID in rollNumber
            reqBody.passedOutYear = parseInt(document.getElementById('registerPassYearInput').value) || 2022;
            reqBody.linkedinUrl = document.getElementById('registerLinkedinInput').value.trim();
        }

        API.auth.register(reqBody)
        .then(res => {
            alert(`Registration successful! You can now log in with ID: ${idVal || emailVal}`);
            
            // Switch to login form and pre-fill username
            showLoginForm();
            usernameInput.value = idVal || emailVal;
            passwordInput.value = passwordVal;

            submitRegisterBtn.disabled = false;
            submitRegisterBtn.textContent = 'Register Account';
            registerForm.reset();
        })
        .catch(err => {
            showRegisterError(err.message || 'Registration failed. Please try again.');
        });

        function showRegisterError(msg) {
            submitRegisterBtn.disabled = false;
            submitRegisterBtn.textContent = 'Register Account';
            
            const errEl = document.createElement('p');
            errEl.className = 'register-error-msg';
            errEl.style.color = 'var(--color-pink)';
            errEl.style.fontSize = '0.825rem';
            errEl.style.fontWeight = '700';
            errEl.style.marginTop = '0.75rem';
            errEl.style.textAlign = 'center';
            errEl.textContent = msg;
            registerForm.appendChild(errEl);
        }
    });

    // Initialize chips on load
    updateQuickChips();
});
