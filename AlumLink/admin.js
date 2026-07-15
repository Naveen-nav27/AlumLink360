document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Verify Active Session ---
    const session = JSON.parse(sessionStorage.getItem('alumlink_active_session'));
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get('college') ? urlParams.get('college').toLowerCase() : '';

    if (!session || session.role !== 'admin' || session.collegeId !== collegeId) {
        alert("Session invalid or expired. Please sign in again.");
        window.location.href = `portal.html?college=${collegeId || 'ksrct'}`;
        return;
    }

    const currentCollegeBranding = COLLEGE_BRANDING[collegeId];

    if (!currentCollegeBranding) {
        window.location.href = 'index.html';
        return;
    }

    async function init() {
        try {
            const college = await API.colleges.getByCode(collegeId);
            applyTheme(college.themeColor || "blue");

            // --- Populate Header ---
            document.getElementById('dashboardCollegeName').textContent = currentCollegeBranding.name;
            document.getElementById('dashboardCollegeCode').textContent = collegeId.toUpperCase();

            // Run Initializing Calls
            updateMetricsWidgets();
            populateStudentFilters();
            populateAlumniFilters();
            renderStudentsGrid();
        } catch (err) {
            console.error("Initialization error", err);
            // fallback
            applyTheme("blue");
            document.getElementById('dashboardCollegeName').textContent = currentCollegeBranding.name;
            document.getElementById('dashboardCollegeCode').textContent = collegeId.toUpperCase();
        }
    }

    init();

    // Sign out
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('alumlink_active_session');
        window.location.href = `portal.html?college=${collegeId}`;
    });

    // --- 3. Tab Switching Layouts ---
    const tabBtnStudents = document.getElementById('adminTabBtnStudents');
    const tabBtnAlumni = document.getElementById('adminTabBtnAlumni');
    const tabBtnOpps = document.getElementById('adminTabBtnOpps');
    const tabBtnApps = document.getElementById('adminTabBtnApps');
    const tabBtnSettings = document.getElementById('adminTabBtnSettings');

    const viewStudents = document.getElementById('adminStudentsTableContainer');
    const viewAlumni = document.getElementById('adminAlumniTableContainer');
    const viewOpps = document.getElementById('adminOppsTableContainer');
    const viewApps = document.getElementById('adminAppsTableContainer');
    const viewSettings = document.getElementById('adminSettingsContainer');

    const hideAllAdminViews = () => {
        viewStudents.style.display = 'none';
        viewAlumni.style.display = 'none';
        viewOpps.style.display = 'none';
        viewApps.style.display = 'none';
        viewSettings.style.display = 'none';

        tabBtnStudents.classList.remove('active');
        tabBtnAlumni.classList.remove('active');
        tabBtnOpps.classList.remove('active');
        tabBtnApps.classList.remove('active');
        tabBtnSettings.classList.remove('active');
    };

    tabBtnStudents.addEventListener('click', () => {
        hideAllAdminViews();
        tabBtnStudents.classList.add('active');
        viewStudents.style.display = 'block';
        renderStudentsGrid();
    });

    tabBtnAlumni.addEventListener('click', () => {
        hideAllAdminViews();
        tabBtnAlumni.classList.add('active');
        viewAlumni.style.display = 'block';
        renderAlumniGrid();
    });

    tabBtnOpps.addEventListener('click', () => {
        hideAllAdminViews();
        tabBtnOpps.classList.add('active');
        viewOpps.style.display = 'block';
        renderOppsTable();
    });

    tabBtnApps.addEventListener('click', () => {
        hideAllAdminViews();
        tabBtnApps.classList.add('active');
        viewApps.style.display = 'block';
        renderAppsTable();
    });

    tabBtnSettings.addEventListener('click', () => {
        hideAllAdminViews();
        tabBtnSettings.classList.add('active');
        viewSettings.style.display = 'block';
        loadSettingsForm();
    });

    // ==========================================
    // --- STATISTICS WIDGETS ---
    // ==========================================
    async function updateMetricsWidgets() {
        try {
            const [users, jobs, events] = await Promise.all([
                API.users.listByCollege(collegeId),
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId)
            ]);

            const studentsCount = users.filter(u => u.role === 'STUDENT').length;
            const alumniCount = users.filter(u => u.role === 'ALUMNI').length;
            const oppsCount = jobs.length + events.length;

            const jobAppPromises = jobs.map(j => API.applications.byJob(j.id, session.userId).catch(() => []));
            const eventAppPromises = events.map(e => API.applications.byEvent(e.id, session.userId).catch(() => []));
            const appsLists = await Promise.all([...jobAppPromises, ...eventAppPromises]);
            const totalApps = appsLists.reduce((acc, curr) => acc + curr.length, 0);

            document.getElementById('adminStatStudents').textContent = studentsCount;
            document.getElementById('adminStatAlumni').textContent = alumniCount;
            document.getElementById('adminStatOpps').textContent = oppsCount;
            document.getElementById('adminStatApplications').textContent = totalApps;
        } catch (e) {
            console.error("Error updating admin metrics", e);
        }
    }

    // ==========================================
    // --- MANAGE STUDENTS SECTION ---
    // ==========================================
    const studentCardGrid = document.getElementById('adminStudentsCardGrid');
    const stuBatchFilter = document.getElementById('adminStuBatchFilter');
    const stuDeptFilter = document.getElementById('adminStuDeptFilter');
    const stuSearchInput = document.getElementById('adminStudentSearch');
    const stuResetBtn = document.getElementById('adminStuResetFilter');

    // Populate filters with full range of batches and departments
    function populateStudentFilters() {
        const ALL_BATCHES = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
        const ALL_DEPTS = ["CSE", "ECE", "Information Technology", "VLSI", "MCT", "Food Tech", "Textile"];

        stuBatchFilter.innerHTML = '<option value="all">All Batches</option>';
        ALL_BATCHES.forEach(b => {
            stuBatchFilter.innerHTML += `<option value="${b}">Batch ${getBatch(b)} (Class of ${b})</option>`;
        });

        stuDeptFilter.innerHTML = '<option value="all">All Departments</option>';
        ALL_DEPTS.forEach(d => {
            stuDeptFilter.innerHTML += `<option value="${d}">${d}</option>`;
        });
    }

    async function renderStudentsGrid() {
        studentCardGrid.innerHTML = '<p style="color:var(--text-light); text-align:center; grid-column: 1/-1; padding:2rem 0;">Loading students...</p>';
        const selectedBatch = stuBatchFilter.value;
        const selectedDept = stuDeptFilter.value;
        const query = stuSearchInput.value.toLowerCase().trim();

        try {
            const users = await API.users.listByCollege(collegeId, 'STUDENT');
            let filtered = users;

            if (selectedBatch !== 'all') {
                filtered = filtered.filter(s => s.graduationYear && s.graduationYear.toString() === selectedBatch);
            }
            if (selectedDept !== 'all') {
                filtered = filtered.filter(s => s.department === selectedDept);
            }
            if (query) {
                filtered = filtered.filter(s => 
                    (s.fullName || '').toLowerCase().includes(query) ||
                    (s.rollNumber || s.id || '').toLowerCase().includes(query) ||
                    (s.email || '').toLowerCase().includes(query)
                );
            }

            // Show batch details banner if batch filter is set
            const statsBanner = document.getElementById('adminStuBatchStats');
            if (selectedBatch !== 'all') {
                const count = filtered.length;
                const avgCgpa = count > 0 ? (filtered.reduce((acc, s) => acc + (s.cgpa || 0), 0) / count).toFixed(2) : '0.00';
                statsBanner.style.display = 'block';
                statsBanner.textContent = `Batch Metrics: ${count} Students Verified • Class Avg CGPA: ${avgCgpa}`;
            } else {
                statsBanner.style.display = 'none';
            }

            studentCardGrid.innerHTML = '';

            if (filtered.length === 0) {
                studentCardGrid.innerHTML = '<p style="color:var(--text-light); text-align:center; grid-column: 1/-1; padding:2rem 0;">No student records match filters.</p>';
                return;
            }

            filtered.forEach((stu) => {
                const card = document.createElement('div');
                card.className = 'admin-person-card';

                let statusBadgeClass = 'inst-badge';
                const status = stu.status || 'approved';
                if (status === 'approved' || status === 'active') statusBadgeClass += ' badge-purple';
                else if (status === 'pending') statusBadgeClass += ' badge-yellow';
                else if (status === 'suspended') statusBadgeClass += ' badge-pink';

                card.innerHTML = `
                    <div class="apc-header">
                        <img class="apc-avatar" src="${stu.photoUrl || DEFAULT_AVATAR}" alt="">
                        <div class="apc-actions">
                            <button class="btn-icon edit btn-edit-student" data-id="${stu.id}" title="Edit Student"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="btn-icon delete btn-delete-student" data-id="${stu.id}" title="Remove Student"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </div>
                    <div class="apc-body">
                        <h4 class="apc-name">${stu.fullName}</h4>
                        <p class="apc-id">ID: ${stu.rollNumber || stu.id}</p>
                        <div class="apc-badges">
                            <span class="inst-badge" style="background-color: var(--bg-secondary); color: var(--text-heading); font-weight:700;">Batch ${getBatch(stu.graduationYear)}</span>
                            <span class="${statusBadgeClass}">${status.toUpperCase()}</span>
                        </div>
                        <div class="apc-meta">
                            <span><strong>Department:</strong> ${stu.department || 'N/A'}</span>
                            <span><strong>CGPA:</strong> <span class="inst-badge badge-purple" style="font-size:0.75rem; font-weight:800; border-radius:4px; padding: 0.1rem 0.4rem;">${stu.cgpa ? stu.cgpa.toFixed(2) : '0.00'}</span></span>
                            <span><strong>Email:</strong> ${stu.email}</span>
                            ${stu.resumeUrl ? `<span><strong>Resume:</strong> <a href="${stu.resumeUrl}" target="_blank">View File &rarr;</a></span>` : ''}
                        </div>
                    </div>
                `;

                // Bind actions
                card.querySelector('.btn-edit-student').addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    openStudentModal(id);
                });

                card.querySelector('.btn-delete-student').addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    if (confirm(`Are you sure you want to delete student: ${id}?`)) {
                        try {
                            await API.users.deleteUser(id, session.userId);
                            updateMetricsWidgets();
                            renderStudentsGrid();
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    }
                });

                studentCardGrid.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            studentCardGrid.innerHTML = '<p style="color:var(--color-pink); text-align:center; grid-column: 1/-1;">Error loading student records.</p>';
        }
    }

    stuBatchFilter.addEventListener('change', renderStudentsGrid);
    stuDeptFilter.addEventListener('change', renderStudentsGrid);
    stuSearchInput.addEventListener('input', renderStudentsGrid);
    stuResetBtn.addEventListener('click', () => {
        stuBatchFilter.value = 'all';
        stuDeptFilter.value = 'all';
        stuSearchInput.value = '';
        renderStudentsGrid();
    });

    // Student CRUD Modals
    const studentModal = document.getElementById('adminStudentModal');
    const closeStudentModalBtn = document.getElementById('closeAdminStudentModalBtn');
    const studentForm = document.getElementById('adminStudentForm');

    async function openStudentModal(id = null) {
        studentForm.reset();
        document.getElementById('editStudentIdx').value = id !== null ? id : '';

        const titleEl = document.getElementById('adminStudentModalTitle');
        const idInput = document.getElementById('formStudentId');

        if (id !== null) {
            titleEl.textContent = 'Edit Student Details';
            idInput.disabled = true;

            try {
                const stuObj = await API.users.getById(id);
                document.getElementById('formStudentName').value = stuObj.fullName || '';
                document.getElementById('formStudentId').value = stuObj.rollNumber || stuObj.id;
                document.getElementById('formStudentDept').value = stuObj.department || '';
                document.getElementById('formStudentEmail').value = stuObj.email || '';
                document.getElementById('formStudentCgpa').value = stuObj.cgpa || '';
                document.getElementById('formStudentResume').value = stuObj.resumeUrl || '';
                document.getElementById('formStudentImage').value = stuObj.photoUrl || '';
                document.getElementById('formStudentPass').value = '';
                document.getElementById('formStudentGradYear').value = stuObj.graduationYear || '';
                document.getElementById('formStudentStatus').value = stuObj.status || 'approved';
            } catch (err) {
                alert("Failed to load student: " + err.message);
                studentModal.classList.remove('open');
                return;
            }
        } else {
            titleEl.textContent = 'Add New Student';
            idInput.disabled = false;
        }

        studentModal.classList.add('open');
    }

    document.getElementById('adminAddStudentBtn').addEventListener('click', () => openStudentModal(null));
    closeStudentModalBtn.addEventListener('click', () => studentModal.classList.remove('open'));

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('editStudentIdx').value;
        const idVal = document.getElementById('formStudentId').value.trim();
        const nameVal = document.getElementById('formStudentName').value.trim();
        const deptVal = document.getElementById('formStudentDept').value;
        const emailVal = document.getElementById('formStudentEmail').value.trim();
        const cgpaVal = parseFloat(document.getElementById('formStudentCgpa').value);
        const resumeVal = document.getElementById('formStudentResume').value.trim();
        const imageVal = document.getElementById('formStudentImage').value.trim();
        const passVal = document.getElementById('formStudentPass').value;
        const gradVal = parseInt(document.getElementById('formStudentGradYear').value);
        const statusVal = document.getElementById('formStudentStatus').value;

        const payload = {
            fullName: nameVal,
            email: emailVal,
            role: 'STUDENT',
            collegeCode: collegeId,
            rollNumber: idVal,
            department: deptVal,
            graduationYear: gradVal,
            cgpa: cgpaVal,
            resumeUrl: resumeVal,
            photoUrl: imageVal,
            status: statusVal
        };

        if (passVal) {
            payload.password = passVal;
        }

        try {
            if (editId !== '') {
                await API.users.updateProfile(editId, payload);
                alert("Student details updated successfully!");
            } else {
                if (!passVal) {
                    alert("Password is required when creating a new student account.");
                    return;
                }
                payload.password = passVal;
                await API.auth.register(payload);
                alert("New student registered successfully!");
            }
            updateMetricsWidgets();
            renderStudentsGrid();
            studentModal.classList.remove('open');
        } catch (err) {
            alert("Error saving student record: " + err.message);
        }
    });

    // ==========================================
    // --- MANAGE ALUMNI SECTION ---
    // ==========================================
    const alumniCardGrid = document.getElementById('adminAlumniCardGrid');
    const aluBatchFilter = document.getElementById('adminAluBatchFilter');
    const aluDeptFilter = document.getElementById('adminAluDeptFilter');
    const aluSearchInput = document.getElementById('adminAlumniSearch');
    const aluResetBtn = document.getElementById('adminAluResetFilter');

    function populateAlumniFilters() {
        const ALL_BATCHES = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
        const ALL_DEPTS = ["CSE", "ECE", "Information Technology", "VLSI", "MCT", "Food Tech", "Textile"];

        aluBatchFilter.innerHTML = '<option value="all">All Batches</option>';
        ALL_BATCHES.forEach(b => {
            aluBatchFilter.innerHTML += `<option value="${b}">Batch ${getBatch(b)} (Class of ${b})</option>`;
        });

        aluDeptFilter.innerHTML = '<option value="all">All Departments</option>';
        ALL_DEPTS.forEach(d => {
            aluDeptFilter.innerHTML += `<option value="${d}">${d}</option>`;
        });
    }

    async function renderAlumniGrid() {
        alumniCardGrid.innerHTML = '<p style="color:var(--text-light); text-align:center; grid-column: 1/-1; padding:2rem 0;">Loading alumni...</p>';
        const selectedBatch = aluBatchFilter.value;
        const selectedDept = aluDeptFilter.value;
        const query = aluSearchInput.value.toLowerCase().trim();

        try {
            const users = await API.users.listByCollege(collegeId, 'ALUMNI');
            let filtered = users;

            if (selectedBatch !== 'all') {
                filtered = filtered.filter(a => a.passedOutYear && a.passedOutYear.toString() === selectedBatch);
            }
            if (selectedDept !== 'all') {
                filtered = filtered.filter(a => a.department === selectedDept);
            }
            if (query) {
                filtered = filtered.filter(a => 
                    (a.fullName || '').toLowerCase().includes(query) ||
                    (a.rollNumber || a.id || '').toLowerCase().includes(query) ||
                    (a.email || '').toLowerCase().includes(query)
                );
            }

            // Show batch banner
            const statsBanner = document.getElementById('adminAluBatchStats');
            if (selectedBatch !== 'all') {
                const count = filtered.length;
                statsBanner.style.display = 'block';
                statsBanner.textContent = `Batch Metrics: ${count} Verified Alumni Members logged in directory.`;
            } else {
                statsBanner.style.display = 'none';
            }

            alumniCardGrid.innerHTML = '';

            if (filtered.length === 0) {
                alumniCardGrid.innerHTML = '<p style="color:var(--text-light); text-align:center; grid-column: 1/-1; padding:2rem 0;">No alumni records match filters.</p>';
                return;
            }

            filtered.forEach((alu) => {
                const card = document.createElement('div');
                card.className = 'admin-person-card';

                let statusBadgeClass = 'inst-badge';
                const status = alu.status || 'approved';
                if (status === 'approved' || status === 'active') statusBadgeClass += ' badge-cyan';
                else if (status === 'pending') statusBadgeClass += ' badge-yellow';
                else if (status === 'suspended') statusBadgeClass += ' badge-pink';

                card.innerHTML = `
                    <div class="apc-header">
                        <img class="apc-avatar" src="${alu.photoUrl || DEFAULT_AVATAR}" alt="">
                        <div class="apc-actions">
                            <button class="btn-icon edit btn-edit-alumni" data-id="${alu.id}" title="Edit Alumni"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="btn-icon delete btn-delete-alumni" data-id="${alu.id}" title="Remove Alumni"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </div>
                    <div class="apc-body">
                        <h4 class="apc-name">${alu.fullName}</h4>
                        <p class="apc-id">ID: ${alu.rollNumber || alu.id}</p>
                        <div class="apc-badges">
                            <span class="inst-badge" style="background-color: var(--bg-secondary); color: var(--text-heading); font-weight:700;">Batch ${getBatch(alu.passedOutYear)}</span>
                            <span class="${statusBadgeClass}">${status.toUpperCase()}</span>
                        </div>
                        <div class="apc-meta">
                            <span><strong>Department:</strong> ${alu.department || 'N/A'}</span>
                            <span><strong>Email:</strong> ${alu.email}</span>
                            ${alu.linkedinUrl ? `<span><strong>LinkedIn:</strong> <a href="${alu.linkedinUrl}" target="_blank">View Profile &rarr;</a></span>` : ''}
                        </div>
                    </div>
                `;

                // Bind actions
                card.querySelector('.btn-edit-alumni').addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    openAlumniModal(id);
                });

                card.querySelector('.btn-delete-alumni').addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    if (confirm(`Are you sure you want to delete alumni: ${id}?`)) {
                        try {
                            await API.users.deleteUser(id, session.userId);
                            updateMetricsWidgets();
                            renderAlumniGrid();
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    }
                });

                alumniCardGrid.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            alumniCardGrid.innerHTML = '<p style="color:var(--color-pink); text-align:center; grid-column: 1/-1;">Error loading alumni records.</p>';
        }
    }

    aluBatchFilter.addEventListener('change', renderAlumniGrid);
    aluDeptFilter.addEventListener('change', renderAlumniGrid);
    aluSearchInput.addEventListener('input', renderAlumniGrid);
    aluResetBtn.addEventListener('click', () => {
        aluBatchFilter.value = 'all';
        aluDeptFilter.value = 'all';
        aluSearchInput.value = '';
        renderAlumniGrid();
    });

    // Alumni CRUD Modals
    const alumniModal = document.getElementById('adminAlumniModal');
    const closeAlumniModalBtn = document.getElementById('closeAdminAlumniModalBtn');
    const alumniForm = document.getElementById('adminAlumniForm');

    async function openAlumniModal(id = null) {
        alumniForm.reset();
        document.getElementById('editAlumniIdx').value = id !== null ? id : '';

        const titleEl = document.getElementById('adminAlumniModalTitle');
        const idInput = document.getElementById('formAlumniId');

        if (id !== null) {
            titleEl.textContent = 'Edit Alumnus Details';
            idInput.disabled = true;

            try {
                const aluObj = await API.users.getById(id);
                document.getElementById('formAlumniName').value = aluObj.fullName || '';
                document.getElementById('formAlumniId').value = aluObj.rollNumber || aluObj.id;
                document.getElementById('formAlumniDept').value = aluObj.department || '';
                document.getElementById('formAlumniEmail').value = aluObj.email || '';
                document.getElementById('formAlumniLinkedin').value = aluObj.linkedinUrl || '';
                document.getElementById('formAlumniImage').value = aluObj.photoUrl || '';
                document.getElementById('formAlumniPass').value = '';
                document.getElementById('formAlumniYear').value = aluObj.passedOutYear || '';
                document.getElementById('formAlumniStatus').value = aluObj.status || 'approved';
            } catch (err) {
                alert("Failed to load alumnus: " + err.message);
                alumniModal.classList.remove('open');
                return;
            }
        } else {
            titleEl.textContent = 'Add New Alumnus';
            idInput.disabled = false;
        }

        alumniModal.classList.add('open');
    }

    document.getElementById('adminAddAlumniBtn').addEventListener('click', () => openAlumniModal(null));
    closeAlumniModalBtn.addEventListener('click', () => alumniModal.classList.remove('open'));

    alumniForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editId = document.getElementById('editAlumniIdx').value;
        const idVal = document.getElementById('formAlumniId').value.trim();
        const nameVal = document.getElementById('formAlumniName').value.trim();
        const deptVal = document.getElementById('formAlumniDept').value;
        const emailVal = document.getElementById('formAlumniEmail').value.trim();
        const linkedinVal = document.getElementById('formAlumniLinkedin').value.trim();
        const imageVal = document.getElementById('formAlumniImage').value.trim();
        const passVal = document.getElementById('formAlumniPass').value;
        const yearVal = parseInt(document.getElementById('formAlumniYear').value);
        const statusVal = document.getElementById('formAlumniStatus').value;

        const payload = {
            fullName: nameVal,
            email: emailVal,
            role: 'ALUMNI',
            collegeCode: collegeId,
            rollNumber: idVal,
            department: deptVal,
            passedOutYear: yearVal,
            linkedinUrl: linkedinVal,
            photoUrl: imageVal,
            status: statusVal
        };

        if (passVal) {
            payload.password = passVal;
        }

        try {
            if (editId !== '') {
                await API.users.updateProfile(editId, payload);
                alert("Alumni details updated successfully!");
            } else {
                if (!passVal) {
                    alert("Password is required when creating a new alumni account.");
                    return;
                }
                payload.password = passVal;
                await API.auth.register(payload);
                alert("New alumni registered successfully!");
            }
            updateMetricsWidgets();
            renderAlumniGrid();
            alumniModal.classList.remove('open');
        } catch (err) {
            alert("Error saving alumni record: " + err.message);
        }
    });

    // ==========================================
    // --- CAMPUS OPPORTUNITIES BOARD ---
    // ==========================================
    const oppSearch = document.getElementById('adminOppSearch');
    oppSearch.addEventListener('input', renderOppsTable);

    async function renderOppsTable() {
        const body = document.getElementById('adminOppsTableBody');
        body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-light); padding:2rem 0;">Loading opportunities...</td></tr>';

        const query = oppSearch.value.toLowerCase().trim();

        try {
            const [jobs, events] = await Promise.all([
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId)
            ]);

            let opps = [];
            jobs.forEach(j => {
                opps.push({
                    id: j.id,
                    type: 'internship',
                    title: j.title,
                    host: j.hostCompany,
                    location: j.location,
                    deadline: j.deadline,
                    postedBy: j.postedByRoll || 'ADMIN',
                    postedById: j.postedById,
                    isPublic: j.isPublic,
                    description: j.description,
                    tags: j.tags
                });
            });

            events.forEach(e => {
                opps.push({
                    id: e.id,
                    type: e.eventType,
                    title: e.title,
                    host: e.host,
                    location: e.location,
                    deadline: e.eventDate,
                    postedBy: e.postedByRoll || 'ADMIN',
                    postedById: e.postedById,
                    isPublic: e.isPublic,
                    description: e.description,
                    tags: e.tags
                });
            });

            let filtered = opps;
            if (query) {
                filtered = filtered.filter(o => 
                    (o.title || '').toLowerCase().includes(query) ||
                    (o.host || '').toLowerCase().includes(query) ||
                    (o.location || '').toLowerCase().includes(query) ||
                    (o.type || '').toLowerCase().includes(query)
                );
            }

            body.innerHTML = '';

            if (filtered.length === 0) {
                body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-light); padding:2rem 0;">No opportunities records found.</td></tr>';
                return;
            }

            filtered.forEach((opp) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${opp.id}</strong></td>
                    <td><span class="inst-badge ${opp.type === 'internship' ? 'badge-purple' : opp.type === 'hackathon' ? 'badge-pink' : 'badge-yellow'}">${opp.type.toUpperCase()}</span></td>
                    <td><strong>${opp.title}</strong></td>
                    <td>${opp.host}</td>
                    <td>${opp.location}</td>
                    <td>${opp.deadline}</td>
                    <td><span class="inst-badge" style="background-color: var(--bg-secondary); color:var(--text-heading); font-weight:700;">${opp.postedById === session.userId ? 'Administrator' : opp.postedBy}</span></td>
                    <td>
                        <div class="admin-actions">
                            <button class="btn-icon edit btn-edit-opp" data-id="${opp.id}" data-type="${opp.type}" title="Edit Opening"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>
                            <button class="btn-icon delete btn-delete-opp" data-id="${opp.id}" data-type="${opp.type}" title="Delete Opening"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                        </div>
                    </td>
                `;

                row.querySelector('.btn-edit-opp').addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const type = e.currentTarget.getAttribute('data-type');
                    openOppModal(id, type);
                });

                row.querySelector('.btn-delete-opp').addEventListener('click', async (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    const type = e.currentTarget.getAttribute('data-type');
                    if (confirm(`Remove opportunity: ${id}?`)) {
                        try {
                            if (type === 'internship') {
                                await API.jobs.delete(id, session.userId);
                            } else {
                                await API.events.delete(id, session.userId);
                            }
                            updateMetricsWidgets();
                            renderOppsTable();
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    }
                });

                body.appendChild(row);
            });
        } catch (err) {
            console.error(err);
            body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--color-pink); padding:2rem 0;">Error loading opportunities records.</td></tr>';
        }
    }

    // Opportunity CRUD Modals
    const oppModal = document.getElementById('adminOppModal');
    const closeOppModalBtn = document.getElementById('closeAdminOppModalBtn');
    const oppForm = document.getElementById('adminOppForm');

    async function openOppModal(id = null, type = null) {
        oppForm.reset();
        document.getElementById('editOppIdx').value = id !== null ? `${id}:${type}` : '';
        document.getElementById('adminOppModalTitle').textContent = id !== null ? 'Modify Opportunity' : 'Add Campus Opportunity';

        if (id !== null) {
            try {
                let oppObj;
                if (type === 'internship') {
                    const jobs = await API.jobs.byCollege(collegeId, session.userId);
                    oppObj = jobs.find(j => String(j.id) === String(id));
                    
                    document.getElementById('formOppTitle').value = oppObj.title;
                    document.getElementById('formOppType').value = 'internship';
                    document.getElementById('formOppHost').value = oppObj.hostCompany;
                    document.getElementById('formOppLocation').value = oppObj.location;
                    document.getElementById('formOppDeadline').value = oppObj.deadline;
                    document.getElementById('formOppTags').value = oppObj.tags || '';
                    document.getElementById('formOppDesc').value = oppObj.description;
                    document.getElementById('formOppIsPublic').checked = oppObj.isPublic || false;
                } else {
                    const events = await API.events.byCollege(collegeId, session.userId);
                    oppObj = events.find(e => String(e.id) === String(id));

                    document.getElementById('formOppTitle').value = oppObj.title;
                    document.getElementById('formOppType').value = oppObj.eventType;
                    document.getElementById('formOppHost').value = oppObj.host;
                    document.getElementById('formOppLocation').value = oppObj.location;
                    document.getElementById('formOppDeadline').value = oppObj.eventDate;
                    document.getElementById('formOppTags').value = oppObj.tags || '';
                    document.getElementById('formOppDesc').value = oppObj.description;
                    document.getElementById('formOppIsPublic').checked = oppObj.isPublic || false;
                }
            } catch (err) {
                alert("Failed to load opportunity: " + err.message);
                oppModal.classList.remove('open');
                return;
            }
        }

        oppModal.classList.add('open');
    }

    document.getElementById('adminAddOppBtn').addEventListener('click', () => openOppModal(null));
    closeOppModalBtn.addEventListener('click', () => oppModal.classList.remove('open'));

    oppForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const editVal = document.getElementById('editOppIdx').value;
        const titleVal = document.getElementById('formOppTitle').value.trim();
        const typeVal = document.getElementById('formOppType').value;
        const hostVal = document.getElementById('formOppHost').value.trim();
        const locationVal = document.getElementById('formOppLocation').value.trim();
        const deadlineVal = document.getElementById('formOppDeadline').value.trim();
        const tagsVal = document.getElementById('formOppTags').value.split(',').map(t => t.trim()).filter(t => t).join(',');
        const descVal = document.getElementById('formOppDesc').value.trim();
        const isPublicVal = document.getElementById('formOppIsPublic').checked;

        try {
            if (editVal !== '') {
                const [editId, oldType] = editVal.split(':');
                
                if (oldType === 'internship' && typeVal === 'internship') {
                    await API.jobs.update(editId, {
                        title: titleVal,
                        hostCompany: hostVal,
                        location: locationVal,
                        tags: tagsVal,
                        description: descVal,
                        deadline: deadlineVal,
                        isPublic: isPublicVal
                    }, session.userId);
                } else if (oldType !== 'internship' && typeVal !== 'internship') {
                    await API.events.update(editId, {
                        title: titleVal,
                        eventType: typeVal,
                        eventDate: deadlineVal,
                        host: hostVal,
                        location: locationVal,
                        tags: tagsVal,
                        description: descVal,
                        isPublic: isPublicVal
                    }, session.userId);
                } else {
                    if (oldType === 'internship') {
                        await API.jobs.delete(editId, session.userId);
                    } else {
                        await API.events.delete(editId, session.userId);
                    }
                    if (typeVal === 'internship') {
                        await API.jobs.create({
                            title: titleVal,
                            hostCompany: hostVal,
                            location: locationVal,
                            tags: tagsVal,
                            description: descVal,
                            deadline: deadlineVal,
                            isPublic: isPublicVal
                        }, session.userId);
                    } else {
                        await API.events.create({
                            title: titleVal,
                            eventType: typeVal,
                            eventDate: deadlineVal,
                            host: hostVal,
                            location: locationVal,
                            tags: tagsVal,
                            description: descVal,
                            isPublic: isPublicVal
                        }, session.userId);
                    }
                }
                alert("Opportunity updated successfully!");
            } else {
                if (typeVal === 'internship') {
                    await API.jobs.create({
                        title: titleVal,
                        hostCompany: hostVal,
                        location: locationVal,
                        tags: tagsVal,
                        description: descVal,
                        deadline: deadlineVal,
                        isPublic: isPublicVal
                    }, session.userId);
                } else {
                    await API.events.create({
                        title: titleVal,
                        eventType: typeVal,
                        eventDate: deadlineVal,
                        host: hostVal,
                        location: locationVal,
                        tags: tagsVal,
                        description: descVal,
                        isPublic: isPublicVal
                    }, session.userId);
                }
                alert("Opportunity published successfully!");
            }

            updateMetricsWidgets();
            renderOppsTable();
            oppModal.classList.remove('open');
        } catch (err) {
            alert("Error saving opportunity: " + err.message);
        }
    });

    // ==========================================
    // --- PORTAL APPLICATIONS REGISTRY ---
    // ==========================================
    const appSearch = document.getElementById('adminAppSearch');
    appSearch.addEventListener('input', renderAppsTable);

    async function renderAppsTable() {
        const body = document.getElementById('adminAppsTableBody');
        body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-light); padding:2rem 0;">Loading applications...</td></tr>';

        const query = appSearch.value.toLowerCase().trim();

        try {
            const [jobs, events] = await Promise.all([
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId)
            ]);

            const jobAppPromises = jobs.map(j => API.applications.byJob(j.id, session.userId).then(apps => apps.map(a => ({ ...a, oppTitle: j.title }))).catch(() => []));
            const eventAppPromises = events.map(e => API.applications.byEvent(e.id, session.userId).then(apps => apps.map(a => ({ ...a, oppTitle: e.title }))).catch(() => []));

            const appsLists = await Promise.all([...jobAppPromises, ...eventAppPromises]);
            let allApps = [];
            appsLists.forEach(list => {
                allApps = allApps.concat(list);
            });

            allApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

            let filtered = allApps;
            if (query) {
                filtered = filtered.filter(app => {
                    return (
                        (app.id || '').toString().toLowerCase().includes(query) ||
                        (app.studentRollNumber || app.studentId || '').toLowerCase().includes(query) ||
                        (app.studentName || '').toLowerCase().includes(query) ||
                        (app.oppTitle || '').toLowerCase().includes(query)
                    );
                });
            }

            body.innerHTML = '';

            if (filtered.length === 0) {
                body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-light); padding:2rem 0;">No student application records found.</td></tr>';
                return;
            }

            filtered.forEach(app => {
                const cgpa = app.cgpaAtApply ? app.cgpaAtApply.toFixed(2) : '0.00';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${app.id}</strong></td>
                    <td><strong>${app.oppTitle}</strong></td>
                    <td>${app.studentRollNumber || app.studentId}</td>
                    <td>${app.studentName}</td>
                    <td><span class="inst-badge badge-purple" style="font-weight: 800; font-size:0.75rem; border-radius:4px; padding: 0.1rem 0.4rem;">${cgpa}</span></td>
                    <td>${app.resumeUrl ? `<a href="${app.resumeUrl}" target="_blank" style="color:var(--color-primary); font-weight:700; text-decoration:none;">View Resume &rarr;</a>` : 'N/A'}</td>
                    <td><div style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${app.notes || ''}">${app.notes || 'None'}</div></td>
                    <td><span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">${new Date(app.appliedAt).toLocaleDateString()}</span></td>
                `;
                body.appendChild(row);
            });
        } catch (err) {
            console.error(err);
            body.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--color-pink); padding:2rem 0;">Error loading applications.</td></tr>';
        }
    }

    // ==========================================
    // --- PORTAL CONFIGURATION SETTINGS ---
    // ==========================================
    const settingsForm = document.getElementById('adminPortalSettingsForm');
    const inputMinCgpa = document.getElementById('settingsMinCgpa');
    const inputWelcome = document.getElementById('settingsWelcomeMsg');
    const selectTheme = document.getElementById('settingsThemeColor');

    async function loadSettingsForm() {
        try {
            const college = await API.colleges.getByCode(collegeId);
            inputMinCgpa.value = college.minCgpa || 6.0;
            inputWelcome.value = college.welcomeMessage || "Secure Academic Gateway Authentication";
            selectTheme.value = college.themeColor || "blue";
        } catch (err) {
            console.error("Failed to load settings", err);
        }
    }

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cgpaVal = parseFloat(inputMinCgpa.value);
        const welcomeVal = inputWelcome.value.trim();
        const themeVal = selectTheme.value;

        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
            alert("Please enter a valid CGPA filter between 0.0 and 10.0");
            return;
        }

        try {
            await API.colleges.updateSettings(collegeId, {
                minCgpa: cgpaVal,
                welcomeMessage: welcomeVal,
                themeColor: themeVal
            }, session.userId);

            applyTheme(themeVal);
            alert("Portal configurations saved successfully! Changes are updated immediately.");
        } catch (err) {
            alert("Failed to save settings: " + err.message);
        }
    });
});
