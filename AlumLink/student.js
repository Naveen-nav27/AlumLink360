document.addEventListener('DOMContentLoaded', () => {


    // --- 1. Verify Active Session ---
    const session = JSON.parse(sessionStorage.getItem('alumlink_active_session'));
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get('college') ? urlParams.get('college').toLowerCase() : '';

    if (!session || session.role !== 'student' || session.collegeId !== collegeId) {
        alert("Session invalid or expired. Please sign in again.");
        window.location.href = `portal.html?college=${collegeId || 'ksrct'}`;
        return;
    }

    // --- 2. Initialize Database & States ---
    let student = null;

    async function init() {
        try {
            // Load college branding & settings
            const collegeInfo = await API.colleges.getByCode(collegeId).then(res => res);
            applyTheme(collegeInfo.themeColor);
            document.getElementById('dashboardCollegeName').textContent = collegeInfo.name;
            document.getElementById('dashboardCollegeCode').textContent = collegeId.toUpperCase();

            // Load student profile
            student = await API.users.getById(session.userId);

            // Populate Header & Sidebar
            document.getElementById('dashboardUserName').textContent = student.fullName;
            document.getElementById('dashboardUserAvatar').src = student.photoUrl || DEFAULT_AVATAR;
            if (document.getElementById('stuFeedTriggerAvatar')) {
                document.getElementById('stuFeedTriggerAvatar').src = student.photoUrl || DEFAULT_AVATAR;
            }

            const profileImg = document.getElementById('studentProfileImg');
            profileImg.src = student.photoUrl || DEFAULT_AVATAR;
            document.getElementById('studentProfileName').textContent = student.fullName;
            document.getElementById('studentProfileId').textContent = student.rollNumber || student.id;
            document.getElementById('studentProfileCol').textContent = collegeId.toUpperCase();
            document.getElementById('studentProfileDept').textContent = student.department || 'N/A';
            document.getElementById('studentProfileGrad').textContent = student.graduationYear || 'N/A';
            document.getElementById('studentProfileEmail').textContent = student.email || 'N/A';

            // Prefill edit inputs
            const cgpaInput = document.getElementById('studentEditCgpa');
            const resumeInput = document.getElementById('studentEditResume');
            cgpaInput.value = student.cgpa || '';
            resumeInput.value = student.resumeUrl || '';

            // Handle updates
            document.getElementById('btnUpdateStudentMetrics').addEventListener('click', async () => {
                const valCgpa = parseFloat(cgpaInput.value);
                const valResume = resumeInput.value.trim();

                if (isNaN(valCgpa) || valCgpa < 0 || valCgpa > 10) {
                    alert("Please enter a valid CGPA between 0.0 and 10.0");
                    return;
                }

                try {
                    const updated = await API.users.updateProfile(session.userId, {
                        cgpa: valCgpa,
                        resumeUrl: valResume
                    });
                    student.cgpa = updated.cgpa;
                    student.resumeUrl = updated.resumeUrl;
                    alert("Profile credentials updated successfully!");
                } catch (e) {
                    alert("Failed to update profile: " + e.message);
                }
            });

            // Profile photo upload
            const stuImgFileInput = document.getElementById('studentProfileImgFile');
            const stuImgThumb = document.getElementById('studentProfileImgThumb');
            if (student.photoUrl) {
                stuImgThumb.src = student.photoUrl;
                stuImgThumb.style.display = 'inline-block';
            }

            stuImgFileInput.addEventListener('change', () => {
                const file = stuImgFileInput.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image too large. Please choose a file under 5 MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    try {
                        const updated = await API.users.updateProfile(session.userId, {
                            photoUrl: dataUrl
                        });
                        student.photoUrl = updated.photoUrl;
                        profileImg.src = updated.photoUrl;
                        document.getElementById('dashboardUserAvatar').src = updated.photoUrl;
                        if (document.getElementById('stuFeedTriggerAvatar')) {
                            document.getElementById('stuFeedTriggerAvatar').src = updated.photoUrl;
                        }
                        stuImgThumb.src = updated.photoUrl;
                        stuImgThumb.style.display = 'inline-block';
                        alert("Profile photo updated successfully!");
                    } catch (e) {
                        alert("Failed to update photo: " + e.message);
                    }
                };
                reader.readAsDataURL(file);
            });

            // Initial render call
            renderAlumniDirectory(document.getElementById('alumniSearchInput').value.toLowerCase().trim());
            updateSectionBadges();
            updateStudentChatsBadge();

            // Populate feed trigger avatar safely after data is loaded
            const stuTriggerAvatar = document.getElementById('stuFeedTriggerAvatar');
            if (stuTriggerAvatar) stuTriggerAvatar.src = student.photoUrl || DEFAULT_AVATAR;

            const stuTriggerCard = document.getElementById('stuPostTriggerCard');
            if (stuTriggerCard) {
                stuTriggerCard.addEventListener('click', () => {
                    openGlobalPostModal('student', student.fullName, student.photoUrl || DEFAULT_AVATAR);
                });
            }

        } catch (err) {
            console.error("Init error: ", err);
            alert("Session invalid or profile not found in database.");
            window.location.href = `portal.html?college=${collegeId}`;
        }
    }

    init();

    // Sign out
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('alumlink_active_session');
        window.location.href = `portal.html?college=${collegeId}`;
    });

    // --- 4. Sub-tabs Switching ---
    const btnDir = document.getElementById('stuTabBtnDirectory');
    const btnStudentDir = document.getElementById('stuTabBtnStudentDirectory');
    const btnOpp = document.getElementById('stuTabBtnOpportunities');
    const btnChats = document.getElementById('stuTabBtnChats');
    const btnPostEvent = document.getElementById('stuTabBtnPostEvent');
    const btnFeed = document.getElementById('stuTabBtnFeed');

    const viewDir = document.getElementById('stuViewDirectory');
    const viewStudentDir = document.getElementById('stuViewStudentDirectory');
    const viewOpp = document.getElementById('stuViewOpportunities');
    const viewChats = document.getElementById('stuViewChats');
    const viewPostEvent = document.getElementById('stuViewPostEvent');
    const viewFeed = document.getElementById('stuViewFeed');

    const hideAllStudentViews = () => {
        viewDir.style.display = 'none';
        if (viewStudentDir) viewStudentDir.style.display = 'none';
        viewOpp.style.display = 'none';
        viewChats.style.display = 'none';
        viewPostEvent.style.display = 'none';
        viewFeed.style.display = 'none';

        btnDir.classList.remove('active');
        if (btnStudentDir) btnStudentDir.classList.remove('active');
        btnOpp.classList.remove('active');
        btnChats.classList.remove('active');
        btnPostEvent.classList.remove('active');
        btnFeed.classList.remove('active');
    };

    btnDir.addEventListener('click', () => {
        hideAllStudentViews();
        btnDir.classList.add('active');
        viewDir.style.display = 'block';
        renderAlumniDirectory(document.getElementById('alumniSearchInput').value.toLowerCase().trim());
    });

    if (btnStudentDir) {
        btnStudentDir.addEventListener('click', () => {
            hideAllStudentViews();
            btnStudentDir.classList.add('active');
            if (viewStudentDir) viewStudentDir.style.display = 'block';
            renderStudentDirectory(document.getElementById('studentSearchInput').value.toLowerCase().trim());
        });
    }

    btnOpp.addEventListener('click', () => {
        hideAllStudentViews();
        btnOpp.classList.add('active');
        viewOpp.style.display = 'block';
        renderStudentOpportunities('all');

        // Mark opportunities as seen
        Promise.all([
            API.jobs.byCollege(collegeId, session.userId),
            API.events.byCollege(collegeId, session.userId)
        ]).then(([jobs, events]) => {
            const totalOppsCount = jobs.length + events.length;
            localStorage.setItem(`alumlink_seen_opps_count_${session.userId}`, totalOppsCount);
            updateSectionBadges();
        }).catch(err => console.error("Error setting seen opps count", err));
    });

    btnChats.addEventListener('click', () => {
        hideAllStudentViews();
        btnChats.classList.add('active');
        viewChats.style.display = 'block';
        renderStudentPendingRequestsList();
        renderStudentChatsList();
    });

    btnPostEvent.addEventListener('click', () => {
        hideAllStudentViews();
        btnPostEvent.classList.add('active');
        viewPostEvent.style.display = 'block';
    });

    btnFeed.addEventListener('click', () => {
        hideAllStudentViews();
        btnFeed.classList.add('active');
        viewFeed.style.display = 'block';
        renderSocialFeed('student');

        // Mark feed posts as seen
        API.posts.feed(collegeId, session.userId).then(visiblePosts => {
            const allPostsCount = visiblePosts.length;
            localStorage.setItem(`alumlink_seen_posts_count_${session.userId}`, allPostsCount);
            updateSectionBadges();
        }).catch(err => console.error("Error setting seen posts count", err));
    });

    // Scope change listeners
    document.getElementById('stuAlumniScopeSelect').addEventListener('change', () => {
        renderAlumniDirectory(document.getElementById('alumniSearchInput').value.toLowerCase().trim());
    });
    if (document.getElementById('stuStudentScopeSelect')) {
        document.getElementById('stuStudentScopeSelect').addEventListener('change', () => {
            renderStudentDirectory(document.getElementById('studentSearchInput').value.toLowerCase().trim());
        });
    }

    // Search inputs
    const alumniSearchInput = document.getElementById('alumniSearchInput');
    alumniSearchInput.value = '';
    alumniSearchInput.addEventListener('input', (e) => {
        renderAlumniDirectory(e.target.value.toLowerCase().trim());
    });

    const studentSearchInput = document.getElementById('studentSearchInput');
    if (studentSearchInput) {
        studentSearchInput.value = '';
        studentSearchInput.addEventListener('input', (e) => {
            renderStudentDirectory(e.target.value.toLowerCase().trim());
        });
    }

    // Filter Opportunities buttons
    let activeOppFilter = 'all';
    const filterAll = document.getElementById('stuFilterOppAll');
    const filterIntern = document.getElementById('stuFilterOppIntern');
    const filterHack = document.getElementById('stuFilterOppHack');
    const filterWork = document.getElementById('stuFilterOppWork');
    const filterBtns = [filterAll, filterIntern, filterHack, filterWork];

    const setOppFilter = (filter, btn) => {
        activeOppFilter = filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStudentOpportunities(activeOppFilter);
    };

    filterAll.addEventListener('click', () => setOppFilter('all', filterAll));
    filterIntern.addEventListener('click', () => setOppFilter('internship', filterIntern));
    filterHack.addEventListener('click', () => setOppFilter('hackathon', filterHack));
    filterWork.addEventListener('click', () => setOppFilter('workshop', filterWork));

    // --- 5. Render Alumni Directory ---
    async function renderAlumniDirectory(query) {
        const grid = document.getElementById('alumniDirectoryGrid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading directory...</p>';

        const scope = document.getElementById('stuAlumniScopeSelect').value;
        let listToSearch = [];

        try {
            if (scope === 'local') {
                listToSearch = await API.users.listByCollege(collegeId, 'ALUMNI');
            } else {
                const allColleges = await API.colleges.getAll();
                const partnerColCodes = allColleges.map(c => c.code).filter(c => c !== collegeId);

                const promises = partnerColCodes.map(code => API.users.listByCollege(code, 'ALUMNI').catch(() => []));
                const results = await Promise.all(promises);
                listToSearch = results.flat();
            }

            const filtered = listToSearch.filter(a =>
                (a.fullName || '').toLowerCase().includes(query) ||
                (a.department || '').toLowerCase().includes(query)
            );

            grid.innerHTML = '';

            if (filtered.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No alumni matches found.</p>`;
                return;
            }

            const connectRequests = await API.connections.list(session.userId);
            const activeReqs = connectRequests.filter(r => r.status === 'accepted');
            const threadPromises = activeReqs.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(threadPromises);

            filtered.forEach(alumni => {
                const card = document.createElement('div');
                card.className = 'follower-card';

                const alumAvatar = alumni.photoUrl || DEFAULT_AVATAR;

                const connectReq = connectRequests.find(r =>
                    (r.fromUserId === session.userId && r.toUserId === alumni.id) ||
                    (r.fromUserId === alumni.id && r.toUserId === session.userId)
                );

                let unreadCount = 0;
                if (connectReq && connectReq.status === 'accepted') {
                    const idx = activeReqs.findIndex(r => r.id === connectReq.id);
                    if (idx !== -1) {
                        unreadCount = messageThreads[idx].filter(m => !m.isRead && m.senderId === alumni.id).length;
                    }
                }

                let actionButtonHtml = '';
                if (connectReq) {
                    if (connectReq.status === 'pending') {
                        if (connectReq.toUserId === session.userId) {
                            actionButtonHtml = `<button class="btn btn-primary btn-accept-direct-req" data-req-id="${connectReq.id}" data-partner-name="${alumni.fullName}">Approve</button>`;
                        } else {
                            actionButtonHtml = `<button class="btn-follow" style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-light);" disabled>Pending</button>`;
                        }
                    } else if (connectReq.status === 'accepted') {
                        actionButtonHtml = `
                        <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: stretch;">
                            <button class="btn-follow following btn-view-profile" data-partner-id="${alumni.id}" data-partner-college="${alumni.collegeCode}" data-partner-role="alumni" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main); text-align: center;">View Profile</button>
                            <button class="btn-follow following chat-trigger-btn" data-req-id="${connectReq.id}" data-partner-id="${alumni.id}" data-partner-college="${alumni.collegeCode}" data-partner-name="${alumni.fullName}" data-partner-role="alumni" data-partner-img="${alumAvatar}">Chat</button>
                        </div>`;
                    } else {
                        actionButtonHtml = `<button class="btn-follow connect-trigger-btn" data-id="${alumni.id}" data-college="${alumni.collegeCode}" data-name="${alumni.fullName}" data-image="${alumAvatar}" data-dept="${alumni.department}">Connect</button>`;
                    }
                } else {
                    actionButtonHtml = `<button class="btn-follow connect-trigger-btn" data-id="${alumni.id}" data-college="${alumni.collegeCode}" data-name="${alumni.fullName}" data-image="${alumAvatar}" data-dept="${alumni.department}">Connect</button>`;
                }

                card.innerHTML = `
                    <img class="follower-avatar" src="${alumAvatar}" alt="${alumni.fullName}">
                    <div class="follower-info" style="flex-grow: 1; text-align: left; min-width: 0;">
                        <h5 style="font-size: 0.95rem; font-weight: 750; color: var(--text-heading); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${alumni.fullName}">${alumni.fullName}</span>
                            ${unreadCount > 0 ? `<span class="unread-count-badge" style="background: #ef4444; color: white; border-radius: 12px; padding: 0.1rem 0.4rem; font-size: 0.65rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0; vertical-align: middle;">${unreadCount} New</span>` : ''}
                        </h5>
                        <div style="margin-bottom: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
                            <span class="inst-badge badge-cyan" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${alumni.collegeName}</span>
                        </div>
                        <p style="font-weight: 600; color: var(--text-main); margin-bottom: 0.1rem; font-size: 0.85rem;">${alumni.department}</p>
                        <p style="font-size: 0.725rem; margin-bottom: 0.35rem;">
                            ${getBatch(alumni.passedOutYear) ? `Batch ${getBatch(alumni.passedOutYear)}` : `Class of ${alumni.passedOutYear}`}
                        </p>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <a href="${alumni.linkedinUrl || '#'}" target="_blank" class="btn-icon" title="LinkedIn">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                            <span style="font-size: 0.725rem; color: var(--text-light); display: flex; align-items: center; gap: 0.35rem;">
                                ${alumni.email}
                                ${unreadCount > 0 ? `<span style="background: #ef4444; color: white; border-radius: 50%; min-width: 20px; height: 20px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.18); animation: pulse-badge 1.2s infinite;">${unreadCount}</span>` : ''}
                            </span>
                        </div>
                    </div>
                    <div>
                        ${actionButtonHtml}
                    </div>
                `;

                // Bind Event Listeners on Card
                const connBtn = card.querySelector('.connect-trigger-btn');
                if (connBtn) {
                    connBtn.addEventListener('click', () => {
                        window.openConnectModal(alumni.id, alumni.collegeCode, alumni.fullName, alumAvatar, alumni.department);
                    });
                }

                const chatBtn = card.querySelector('.chat-trigger-btn');
                if (chatBtn) {
                    chatBtn.addEventListener('click', (e) => {
                        const btn = e.currentTarget;
                        openChatWindow(
                            btn.getAttribute('data-req-id'),
                            btn.getAttribute('data-partner-id'),
                            btn.getAttribute('data-partner-college'),
                            btn.getAttribute('data-partner-name'),
                            btn.getAttribute('data-partner-role'),
                            btn.getAttribute('data-partner-img')
                        );
                    });
                }

                const viewProfileBtn = card.querySelector('.btn-view-profile');
                if (viewProfileBtn) {
                    viewProfileBtn.addEventListener('click', (e) => {
                        const btn = e.currentTarget;
                        window.openProfileModal(
                            btn.getAttribute('data-partner-id'),
                            btn.getAttribute('data-partner-college'),
                            btn.getAttribute('data-partner-role')
                        );
                    });
                }

                const approveBtn = card.querySelector('.btn-accept-direct-req');
                if (approveBtn) {
                    approveBtn.addEventListener('click', async (e) => {
                        const reqId = e.target.getAttribute('data-req-id');
                        const pName = e.target.getAttribute('data-partner-name');
                        try {
                            await API.connections.accept(reqId, session.userId);
                            alert(`Connection approved with ${pName}!`);
                            renderAlumniDirectory(document.getElementById('alumniSearchInput').value.toLowerCase().trim());
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    });
                }

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error rendering alumni directory", e);
            grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--color-pink)">Error loading directory listings.</p>';
        }
    }

    // --- 6. Render Student Directory ---
    async function renderStudentDirectory(query) {
        const grid = document.getElementById('studentDirectoryGrid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading directory...</p>';

        const scope = document.getElementById('stuStudentScopeSelect').value;
        let listToSearch = [];

        try {
            if (scope === 'local') {
                const localStudents = await API.users.listByCollege(collegeId, 'STUDENT');
                listToSearch = localStudents.filter(s => s.id !== session.userId);
            } else {
                const allColleges = await API.colleges.getAll();
                const partnerColCodes = allColleges.map(c => c.code).filter(c => c !== collegeId);

                const promises = partnerColCodes.map(code => API.users.listByCollege(code, 'STUDENT').catch(() => []));
                const results = await Promise.all(promises);
                listToSearch = results.flat();
            }

            const filtered = listToSearch.filter(s =>
                (s.fullName || '').toLowerCase().includes(query) ||
                (s.department || '').toLowerCase().includes(query) ||
                (s.rollNumber || '').toLowerCase().includes(query)
            );

            grid.innerHTML = '';

            if (filtered.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No student matches found.</p>`;
                return;
            }

            const connectRequests = await API.connections.list(session.userId);
            const activeReqs = connectRequests.filter(r => r.status === 'accepted');
            const threadPromises = activeReqs.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(threadPromises);

            filtered.forEach(stu => {
                const card = document.createElement('div');
                card.className = 'follower-card';

                const stuAvatar = stu.photoUrl || DEFAULT_AVATAR;

                const connectReq = connectRequests.find(r =>
                    (r.fromUserId === session.userId && r.toUserId === stu.id) ||
                    (r.fromUserId === stu.id && r.toUserId === session.userId)
                );

                let unreadCount = 0;
                if (connectReq && connectReq.status === 'accepted') {
                    const idx = activeReqs.findIndex(r => r.id === connectReq.id);
                    if (idx !== -1) {
                        unreadCount = messageThreads[idx].filter(m => !m.isRead && m.senderId === stu.id).length;
                    }
                }

                let actionButtonHtml = '';
                if (connectReq) {
                    if (connectReq.status === 'pending') {
                        if (connectReq.toUserId === session.userId) {
                            actionButtonHtml = `<button class="btn btn-primary btn-accept-direct-req" data-req-id="${connectReq.id}" data-partner-name="${stu.fullName}">Approve</button>`;
                        } else {
                            actionButtonHtml = `<button class="btn-follow" style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-light);" disabled>Pending</button>`;
                        }
                    } else if (connectReq.status === 'accepted') {
                        actionButtonHtml = `
                        <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: stretch;">
                            <button class="btn-follow following btn-view-profile" data-partner-id="${stu.id}" data-partner-college="${stu.collegeCode}" data-partner-role="student" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main); text-align: center;">View Profile</button>
                            <button class="btn-follow following chat-trigger-btn" data-req-id="${connectReq.id}" data-partner-id="${stu.id}" data-partner-college="${stu.collegeCode}" data-partner-name="${stu.fullName}" data-partner-role="student" data-partner-img="${stuAvatar}">Chat</button>
                        </div>`;
                    } else {
                        actionButtonHtml = `<button class="btn-follow connect-trigger-btn" data-id="${stu.id}" data-college="${stu.collegeCode}" data-name="${stu.fullName}" data-image="${stuAvatar}" data-dept="${stu.department}">Connect</button>`;
                    }
                } else {
                    actionButtonHtml = `<button class="btn-follow connect-trigger-btn" data-id="${stu.id}" data-college="${stu.collegeCode}" data-name="${stu.fullName}" data-image="${stuAvatar}" data-dept="${stu.department}">Connect</button>`;
                }

                card.innerHTML = `
                    <img class="follower-avatar" src="${stuAvatar}" alt="${stu.fullName}">
                    <div class="follower-info" style="flex-grow: 1; text-align: left; min-width: 0;">
                        <h5 style="font-size: 0.95rem; font-weight: 750; color: var(--text-heading); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${stu.fullName}">${stu.fullName}</span>
                            ${unreadCount > 0 ? `<span class="unread-count-badge" style="background: #ef4444; color: white; border-radius: 12px; padding: 0.1rem 0.4rem; font-size: 0.65rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0; vertical-align: middle;">${unreadCount} New</span>` : ''}
                        </h5>
                        <div style="margin-bottom: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
                            <span class="inst-badge badge-purple" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${stu.collegeName}</span>
                        </div>
                        <p style="font-weight: 600; color: var(--text-main); margin-bottom: 0.1rem; font-size: 0.85rem;">${stu.department || 'N/A'}</p>
                        <p style="font-size: 0.725rem; margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.35rem;">
                            <span>${getBatch(stu.graduationYear) ? `Batch ${getBatch(stu.graduationYear)}` : `Graduation Year: ${stu.graduationYear}`}&nbsp;•&nbsp;CGPA: ${stu.cgpa ? stu.cgpa.toFixed(2) : '0.00'}</span>
                            ${unreadCount > 0 ? `<span style="background: #ef4444; color: white; border-radius: 50%; min-width: 20px; height: 20px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.18); animation: pulse-badge 1.2s infinite;">${unreadCount}</span>` : ''}
                        </p>
                        <span style="font-size: 0.725rem; color: var(--text-light);">${stu.email}</span>
                    </div>
                    <div>
                        ${actionButtonHtml}
                    </div>
                `;

                // Connect event
                const connBtn = card.querySelector('.connect-trigger-btn');
                if (connBtn) {
                    connBtn.addEventListener('click', () => {
                        window.openConnectModal(stu.id, stu.collegeCode, stu.fullName, stuAvatar, stu.department, 'student');
                    });
                }

                // Chat event
                const chatBtn = card.querySelector('.chat-trigger-btn');
                if (chatBtn) {
                    chatBtn.addEventListener('click', (e) => {
                        const btn = e.currentTarget;
                        openChatWindow(
                            btn.getAttribute('data-req-id'),
                            btn.getAttribute('data-partner-id'),
                            btn.getAttribute('data-partner-college'),
                            btn.getAttribute('data-partner-name'),
                            btn.getAttribute('data-partner-role'),
                            btn.getAttribute('data-partner-img')
                        );
                    });
                }

                // View Profile event
                const viewProfileBtn = card.querySelector('.btn-view-profile');
                if (viewProfileBtn) {
                    viewProfileBtn.addEventListener('click', (e) => {
                        const btn = e.currentTarget;
                        window.openProfileModal(
                            btn.getAttribute('data-partner-id'),
                            btn.getAttribute('data-partner-college'),
                            btn.getAttribute('data-partner-role')
                        );
                    });
                }

                // Direct Approve
                const approveBtn = card.querySelector('.btn-accept-direct-req');
                if (approveBtn) {
                    approveBtn.addEventListener('click', async (e) => {
                        const reqId = e.target.getAttribute('data-req-id');
                        const pName = e.target.getAttribute('data-partner-name');
                        try {
                            await API.connections.accept(reqId, session.userId);
                            alert(`Connection approved with ${pName}!`);
                            renderStudentDirectory(document.getElementById('studentSearchInput').value.toLowerCase().trim());
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    });
                }

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error rendering student directory", e);
            grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--color-pink)">Error loading student listings.</p>';
        }
    }

    // --- 7. Render Student Opportunities ---
    async function renderStudentOpportunities(filter) {
        const grid = document.getElementById('studentOpportunitiesGrid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading openings...</p>';

        try {
            const [jobs, events, apps] = await Promise.all([
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId),
                API.applications.byStudent(session.userId, session.userId)
            ]);

            let opps = [];

            // Map jobs
            jobs.forEach(j => {
                opps.push({
                    id: j.id,
                    type: 'internship',
                    title: j.title,
                    host: j.hostCompany,
                    location: j.location,
                    tags: j.tags ? j.tags.split(',').map(t => t.trim()) : [],
                    description: j.description,
                    deadline: j.deadline,
                    originCollegeId: j.collegeCode,
                    originCollegeName: j.collegeName
                });
            });

            // Map events
            events.forEach(e => {
                opps.push({
                    id: e.id,
                    type: e.eventType,
                    title: e.title,
                    host: e.host,
                    location: e.location,
                    tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [],
                    description: e.description,
                    deadline: e.eventDate,
                    originCollegeId: e.collegeCode,
                    originCollegeName: e.collegeName
                });
            });

            const filtered = filter === 'all' ? opps : opps.filter(o => o.type === filter);

            grid.innerHTML = '';

            if (filtered.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No opportunities posted under this category.</p>`;
                return;
            }

            filtered.forEach(opp => {
                const hasApplied = apps.some(app =>
                    opp.type === 'internship' ? app.jobId === opp.id : app.eventId === opp.id
                );

                const card = document.createElement('div');
                card.className = 'opp-card glass-panel';

                let typeBadgeClass = 'opp-badge';
                if (opp.type === 'internship') typeBadgeClass += ' badge-internship';
                else if (opp.type === 'hackathon') typeBadgeClass += ' badge-hackathon';
                else if (opp.type === 'workshop') typeBadgeClass += ' badge-workshop';
                else typeBadgeClass += ' badge-workshop';

                const tagsHtml = opp.tags.map(t => `<span class="opp-detail-tag">${t}</span>`).join('');

                card.innerHTML = `
                    <div class="opp-card-header">
                        <span class="${typeBadgeClass}">${opp.type.toUpperCase()}</span>
                        <span class="opp-deadline">Date: ${opp.deadline}</span>
                    </div>
                    <div class="opp-card-body" style="flex-grow: 1; display: flex; flex-direction: column;">
                        <h4 class="opp-title" style="margin-top: 0.5rem; margin-bottom: 0.25rem;">${opp.title}</h4>
                        
                        <p style="font-size: 0.75rem; font-weight: 700; color: var(--color-cyan); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
                            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                            ${opp.originCollegeName}
                        </p>

                        <p class="opp-host" style="font-size: 0.85rem; color: var(--text-main); font-weight: 600; margin-bottom: 0.75rem;">${opp.host}</p>
                        <p class="opp-details-row" style="margin-bottom: 0.75rem;">
                            <span class="opp-detail-tag" style="background-color: var(--bg-secondary);">${opp.location}</span>
                            ${tagsHtml}
                        </p>
                        <p class="opp-desc" style="font-size: 0.85rem; color: var(--text-light); line-height: 1.5; flex-grow: 1;">${opp.description}</p>
                    </div>
                    <div class="opp-card-actions" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        ${hasApplied ?
                        `<span class="opp-applied-badge">✓ Applied Successfully</span>` :
                        `<button class="btn btn-primary btn-full btn-apply-trigger" data-id="${opp.id}" data-college="${opp.originCollegeId}" data-title="${opp.title}" data-host="${opp.host}" data-type="${opp.type}">Apply Now</button>`
                    }
                    </div>
                `;

                if (!hasApplied) {
                    card.querySelector('.btn-apply-trigger').addEventListener('click', (e) => {
                        const btn = e.target;
                        window.openApplyModal(
                            btn.getAttribute('data-id'),
                            btn.getAttribute('data-college'),
                            btn.getAttribute('data-title'),
                            btn.getAttribute('data-host'),
                            btn.getAttribute('data-type')
                        );
                    });
                }

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading opportunities", e);
            grid.innerHTML = `<p style="color: var(--color-pink); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">Error loading opportunities: ${e.message}</p>`;
        }
    }

    // --- 8. Opportunities Apply Modal ---
    const oppModalOverlay = document.getElementById('oppModalOverlay');
    const closeOppBtn = document.getElementById('closeOppModalBtn');
    const oppForm = document.getElementById('oppRegistrationForm');
    const submitOppBtn = document.getElementById('submitOppBtn');
    const oppSuccessOverlay = document.getElementById('oppSuccessOverlay');
    const oppSuccessCloseBtn = document.getElementById('oppSuccessCloseBtn');

    let activeOppId = '';
    let activeOppCollegeId = '';

    window.openApplyModal = (oppId, oppCollegeId, oppTitle, oppHost, oppType) => {
        activeOppId = oppId;
        activeOppCollegeId = oppCollegeId;

        document.getElementById('oppModalHeaderName').textContent = oppTitle;
        document.getElementById('oppModalHost').textContent = oppHost;

        const badge = document.getElementById('oppModalBadge');
        badge.textContent = oppType.toUpperCase();
        badge.className = 'opp-badge';
        if (oppType === 'internship') badge.classList.add('badge-internship');
        else if (oppType === 'hackathon') badge.classList.add('badge-hackathon');
        else if (oppType === 'workshop') badge.classList.add('badge-workshop');

        // Pre-fill
        document.getElementById('oppFullName').value = student.fullName;
        document.getElementById('oppEmail').value = student.email;
        document.getElementById('oppResume').value = student.resumeUrl || '';
        document.getElementById('oppNotes').value = '';

        submitOppBtn.disabled = false;
        submitOppBtn.textContent = 'Submit Registration';
        oppSuccessOverlay.classList.remove('show');
        oppModalOverlay.classList.add('open');
    };

    const closeOppModal = () => {
        oppModalOverlay.classList.remove('open');
    };

    closeOppBtn.addEventListener('click', closeOppModal);
    oppModalOverlay.addEventListener('click', (e) => {
        if (e.target === oppModalOverlay) closeOppModal();
    });
    oppSuccessCloseBtn.addEventListener('click', closeOppModal);

    oppForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const gradYear = document.getElementById('oppGradYear').value;
        const resume = document.getElementById('oppResume').value.trim();
        const notes = document.getElementById('oppNotes').value.trim();

        submitOppBtn.disabled = true;
        submitOppBtn.textContent = 'Registering...';

        const body = {
            studentId: session.userId,
            cgpaAtApply: student.cgpa,
            gradYear: parseInt(gradYear),
            resumeUrl: resume,
            notes: notes
        };

        const badge = document.getElementById('oppModalBadge');
        const oppType = badge.textContent.toLowerCase();

        if (oppType === 'internship') {
            body.jobId = activeOppId;
        } else {
            body.eventId = activeOppId;
        }

        API.applications.submit(body, session.userId)
            .then(res => {
                updateSectionBadges();
                oppSuccessOverlay.classList.add('show');
                renderStudentOpportunities(activeOppFilter);
            })
            .catch(err => {
                submitOppBtn.disabled = false;
                submitOppBtn.textContent = 'Submit Registration';
                alert("Application failed: " + err.message);
            });
    });

    // --- 9. Connection Requests & Chatting Overlay ---
    const connectModalOverlay = document.getElementById('connectRequestModalOverlay');
    const closeConnectModalBtn = document.getElementById('closeConnectModalBtn');
    const connectRequestForm = document.getElementById('connectRequestForm');
    const submitConnectBtn = document.getElementById('submitConnectBtn');

    let pendingConnectAlumId = '';
    let pendingConnectAlumCollege = '';
    let pendingConnectAlumName = '';
    let pendingConnectAlumRole = 'alumni';

    window.openConnectModal = (alumId, alumCollege, alumName, alumImage, alumDept, role = 'alumni') => {
        pendingConnectAlumId = alumId;
        pendingConnectAlumCollege = alumCollege;
        pendingConnectAlumName = alumName;
        pendingConnectAlumRole = role;

        document.getElementById('connectAlumniName').textContent = alumName;
        document.getElementById('connectAlumniDept').textContent = `${alumDept} • ${COLLEGE_NAMES[alumCollege]} (${role === 'student' ? 'Student' : 'Alumni'})`;
        document.getElementById('connectAlumniImg').src = alumImage || DEFAULT_AVATAR;
        document.getElementById('connectMessage').value = '';

        submitConnectBtn.disabled = false;
        submitConnectBtn.textContent = 'Send Connection Request';
        connectModalOverlay.classList.add('open');
    };

    const closeConnectModal = () => {
        connectModalOverlay.classList.remove('open');
    };

    closeConnectModalBtn.addEventListener('click', closeConnectModal);
    connectModalOverlay.addEventListener('click', (e) => {
        if (e.target === connectModalOverlay) closeConnectModal();
    });

    connectRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const note = document.getElementById('connectMessage').value.trim();
        submitConnectBtn.disabled = true;
        submitConnectBtn.textContent = 'Sending...';

        API.connections.send({
            toUserId: pendingConnectAlumId,
            message: note
        }, session.userId)
            .then(res => {
                alert(`Request successfully sent to ${pendingConnectAlumName}!`);
                closeConnectModal();
                renderAlumniDirectory(document.getElementById('alumniSearchInput').value.toLowerCase().trim());
                if (typeof renderStudentDirectory === 'function') {
                    renderStudentDirectory(document.getElementById('studentSearchInput').value.toLowerCase().trim());
                }
            })
            .catch(err => {
                submitConnectBtn.disabled = false;
                submitConnectBtn.textContent = 'Send Connection Request';
                alert("Connection request failed: " + err.message);
            });
    });

    // --- View Profile Modal ---
    window.openProfileModal = async (partnerId, partnerCollege, partnerRole) => {
        try {
            const partnerObj = await API.users.getById(partnerId);

            document.getElementById('profileViewName').textContent = partnerObj.fullName;
            document.getElementById('profileViewInstitution').textContent = partnerObj.collegeName || partnerCollege;
            document.getElementById('profileViewDept').textContent = partnerObj.department || 'N/A';
            document.getElementById('profileViewEmail').textContent = partnerObj.email || 'N/A';

            const avatarImg = document.getElementById('profileViewAvatar');
            avatarImg.src = partnerObj.photoUrl || DEFAULT_AVATAR;

            const roleBadge = document.getElementById('profileViewRoleBadge');
            roleBadge.textContent = partnerRole === 'student' ? 'Student' : 'Alumni';
            roleBadge.className = partnerRole === 'student' ? 'inst-badge badge-purple' : 'inst-badge badge-cyan';

            const yearLabel = document.getElementById('profileViewYearLabel');
            const yearVal = document.getElementById('profileViewYear');
            if (partnerRole === 'student') {
                yearLabel.textContent = 'Graduation Year';
                yearVal.textContent = partnerObj.graduationYear || 'N/A';
            } else {
                yearLabel.textContent = 'Passed Out Year';
                yearVal.textContent = partnerObj.passedOutYear || 'N/A';
            }

            const dynamicLabel = document.getElementById('profileViewDynamicLabel');
            const dynamicVal = document.getElementById('profileViewDynamicValue');
            const resumeSection = document.getElementById('profileViewResumeSection');

            if (partnerRole === 'student') {
                dynamicLabel.textContent = 'CGPA';
                dynamicVal.innerHTML = `<span class="inst-badge badge-purple" style="font-size: 0.8rem; font-weight: 800;">${(partnerObj.cgpa || 0).toFixed(2)}</span>`;
                if (partnerObj.resumeUrl) {
                    resumeSection.style.display = 'block';
                    document.getElementById('profileViewResumeLink').href = partnerObj.resumeUrl;
                } else {
                    resumeSection.style.display = 'none';
                }
            } else {
                dynamicLabel.textContent = 'LinkedIn';
                if (partnerObj.linkedinUrl) {
                    dynamicVal.innerHTML = `
                        <a href="${partnerObj.linkedinUrl}" target="_blank" style="color: var(--color-primary); font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">
                            View LinkedIn &rarr;
                        </a>
                    `;
                } else {
                    dynamicVal.textContent = 'N/A';
                }
                resumeSection.style.display = 'none';
            }

            const chatBtn = document.getElementById('profileViewChatBtn');
            const connectRequests = await API.connections.list(session.userId);
            const connectReq = connectRequests.find(r =>
                ((r.fromUserId === session.userId && r.toUserId === Number(partnerId)) ||
                    (r.fromUserId === Number(partnerId) && r.toUserId === session.userId)) &&
                r.status === 'accepted'
            );

            if (connectReq) {
                chatBtn.style.display = 'block';
                chatBtn.onclick = () => {
                    document.getElementById('viewProfileModalOverlay').classList.remove('open');
                    openChatWindow(connectReq.id, Number(partnerId), partnerCollege, partnerObj.fullName, partnerRole, partnerObj.photoUrl || DEFAULT_AVATAR);
                };
            } else {
                chatBtn.style.display = 'none';
            }

            document.getElementById('viewProfileModalOverlay').classList.add('open');
        } catch (e) {
            console.error("Error opening profile modal", e);
            alert("Error loading profile details: " + e.message);
        }
    };

    document.getElementById('closeProfileModalBtn').addEventListener('click', () => {
        document.getElementById('viewProfileModalOverlay').classList.remove('open');
    });

    // --- Student Chats Rendering ---
    async function renderStudentChatsList(isPoll = false) {
        const grid = document.getElementById('studentChatsList');
        if (!grid) return;
        if (!isPoll) {
            grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading chats...</p>';
        }

        try {
            const requests = await API.connections.list(session.userId);
            const activeConnections = requests.filter(r => r.status === 'accepted');

            grid.innerHTML = '';

            if (activeConnections.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No active connections yet. Request connections with others in the Directory to begin chatting!</p>`;
                return;
            }

            const countPromises = activeConnections.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(countPromises);

            activeConnections.forEach((req, index) => {
                const card = document.createElement('div');
                card.className = 'follower-card';

                const isSender = req.fromUserId === session.userId;
                const partnerId = isSender ? req.toUserId : req.fromUserId;
                const partnerName = isSender ? req.toUserName : req.fromUserName;
                const partnerCollege = isSender ? req.toCollegeCode : req.fromCollegeCode;
                const partnerRole = isSender ? req.toRole : req.fromRole;
                const partnerImg = isSender ? req.toUserImg : req.fromUserImg;
                const partnerDept = isSender ? req.toUserDept : req.fromUserDept;

                const threadMsgs = messageThreads[index];
                const unreadCount = threadMsgs.filter(m => !m.isRead && m.senderId === partnerId).length;

                card.innerHTML = `
                    <div style="position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img class="follower-avatar" src="${partnerImg || DEFAULT_AVATAR}" alt="${partnerName}" style="margin: 0;">
                        ${unreadCount > 0 ? `<span class="chat-unread-badge" style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; padding: 0 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid white; box-shadow: var(--shadow-sm);">${unreadCount}</span>` : ''}
                    </div>
                    <div class="follower-info" style="flex-grow: 1; text-align: left; min-width: 0;">
                        <h5 style="font-size: 0.95rem; font-weight: 750; color: var(--text-heading); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${partnerName}">${partnerName}</span>
                            ${unreadCount > 0 ? `<span class="unread-count-badge" style="background: #ef4444; color: white; border-radius: 12px; padding: 0.1rem 0.4rem; font-size: 0.65rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0; vertical-align: middle;">${unreadCount} New</span>` : ''}
                        </h5>
                        <div style="margin-bottom: 0.35rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
                            <span class="inst-badge badge-cyan" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${COLLEGE_NAMES[partnerCollege] || partnerCollege}</span>
                            <span class="inst-badge badge-purple" style="font-size: 0.65rem; padding: 0.1rem 0.4rem; font-weight:700;">${partnerRole === 'student' ? 'Student' : 'Alumni'}</span>
                        </div>
                        <p style="font-weight: 600; color: var(--text-main); margin-bottom: 0.15rem; font-size: 0.8rem;">${partnerDept || 'N/A'}</p>
                        <p style="font-size: 0.725rem; color: var(--text-light); margin: 0; display: flex; align-items: center; gap: 0.4rem;">
                            <span>Connected since ${new Date(req.sentAt).toLocaleDateString()}</span>
                            ${unreadCount > 0 ? `<span style="background: #ef4444; color: white; border-radius: 50%; min-width: 20px; height: 20px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.18); animation: pulse-badge 1.2s infinite;">${unreadCount}</span>` : ''}
                        </p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <button class="btn btn-outline-light btn-view-profile" data-partner-id="${partnerId}" data-partner-college="${partnerCollege}" data-partner-role="${partnerRole}" style="padding: 0.4rem 1rem; font-size: 0.75rem;">View</button>
                        <button class="btn btn-outline-primary btn-chat-trigger" data-req-id="${req.id}" data-partner-id="${partnerId}" data-partner-college="${partnerCollege}" data-partner-name="${partnerName}" data-partner-role="${partnerRole}" data-partner-img="${partnerImg}" style="padding: 0.4rem 1rem; font-size: 0.75rem;">Chat</button>
                    </div>
                `;

                card.querySelector('.btn-chat-trigger').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    openChatWindow(
                        btn.getAttribute('data-req-id'),
                        btn.getAttribute('data-partner-id'),
                        btn.getAttribute('data-partner-college'),
                        btn.getAttribute('data-partner-name'),
                        btn.getAttribute('data-partner-role'),
                        btn.getAttribute('data-partner-img')
                    );
                });

                card.querySelector('.btn-view-profile').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    window.openProfileModal(
                        btn.getAttribute('data-partner-id'),
                        btn.getAttribute('data-partner-college'),
                        btn.getAttribute('data-partner-role')
                    );
                });

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading chat list", e);
            grid.innerHTML = '<p style="color: var(--color-pink); text-align: center; padding: 2rem 0; width: 100%;">Failed to load active chats.</p>';
        }
    }

    async function renderStudentPendingRequestsList() {
        const requestsList = document.getElementById('studentPendingRequestsList');
        if (!requestsList) return;
        requestsList.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-light)">Loading requests...</p>';

        try {
            const requests = await API.connections.list(session.userId);
            const incomingReqs = requests.filter(r =>
                r.toUserId === session.userId && r.status === 'pending'
            );

            requestsList.innerHTML = '';

            if (incomingReqs.length === 0) {
                requestsList.innerHTML = `<p style="color: var(--text-light); padding: 1.5rem; text-align: center; background: #ffffff; border-radius: 12px; border: 1px solid var(--border-color);">No pending connection requests received.</p>`;
                return;
            }

            incomingReqs.forEach(req => {
                const card = document.createElement('div');
                card.className = 'follower-card';
                card.style.justifyContent = 'space-between';

                const senderName = req.fromUserName;
                const senderAvatar = req.fromUserImg;
                const senderRole = req.fromRole;
                const senderCollege = req.fromCollegeCode;

                card.innerHTML = `
                    <div style="display: flex; gap: 0.75rem; align-items: center; text-align: left;">
                        <img class="admin-avatar" src="${senderAvatar || DEFAULT_AVATAR}" alt="">
                        <div>
                            <h5 style="font-weight: 750; font-size: 0.9rem; color: var(--text-heading); margin-bottom: 0.15rem;">
                                ${senderName}
                                <span class="inst-badge badge-purple" style="font-size: 0.65rem;">${COLLEGE_NAMES[senderCollege] || senderCollege} (${senderRole === 'student' ? 'Student' : 'Alumni'})</span>
                            </h5>
                            <p style="font-size: 0.75rem; color: var(--text-light); margin: 0;">Sent: ${new Date(req.sentAt).toLocaleDateString()}</p>
                            ${req.message ? `<p style="font-size: 0.8rem; background: var(--bg-secondary); border-radius: 6px; padding: 0.35rem 0.6rem; margin-top: 0.35rem; color: var(--text-main); font-style: italic;">"${req.message}"</p>` : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-self: center;">
                        <button class="btn btn-outline-light btn-reject-req" data-id="${req.id}" style="padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px;">Decline</button>
                        <button class="btn btn-primary btn-accept-req" data-id="${req.id}" style="padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 700; border-radius: 6px;">Accept</button>
                    </div>
                `;

                card.querySelector('.btn-accept-req').addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await API.connections.accept(id, session.userId);
                        alert(`Connection approved!`);
                        renderStudentPendingRequestsList();
                        renderStudentChatsList();
                        updateStudentChatsBadge();
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                });

                card.querySelector('.btn-reject-req').addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await API.connections.reject(id, session.userId);
                        alert(`Connection declined.`);
                        renderStudentPendingRequestsList();
                        updateStudentChatsBadge();
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                });

                requestsList.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading pending requests", e);
            requestsList.innerHTML = '<p style="color:var(--color-pink); padding:1.5rem; text-align:center">Failed to load connection requests.</p>';
        }
    }

    const updateStudentChatsBadge = async () => {
        const badge = document.getElementById('stuChatsBadge');
        if (!badge) return;

        try {
            const requests = await API.connections.list(session.userId);
            const activeReqs = requests.filter(r => r.status === 'accepted');

            const countPromises = activeReqs.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(countPromises);

            let unreadCount = 0;
            activeReqs.forEach((req, idx) => {
                const partnerId = req.fromUserId === session.userId ? req.toUserId : req.fromUserId;
                const hasUnread = messageThreads[idx].some(m => !m.isRead && m.senderId === partnerId);
                if (hasUnread) unreadCount++;
            });

            const pendingIncomingCount = requests.filter(r =>
                r.toUserId === session.userId && r.status === 'pending'
            ).length;

            const totalBadgeCount = unreadCount + pendingIncomingCount;

            if (totalBadgeCount > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = totalBadgeCount;
            } else {
                badge.style.display = 'none';
            }
        } catch (e) {
            console.error("Error updating chats badge", e);
        }
    };

    window.refreshStudentChatsBadge = updateStudentChatsBadge;

    // --- 10. Social Feed Management ---
    async function renderSocialFeed(role) {
        const stream = document.getElementById('stuSocialFeedStream');
        if (!stream) return;
        stream.innerHTML = '<p style="text-align:center; padding:3rem 0; color:var(--text-light)">Loading feed...</p>';

        try {
            const visiblePosts = await API.posts.feed(collegeId, session.userId);

            stream.innerHTML = '';

            if (visiblePosts.length === 0) {
                stream.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 3rem 0;">No updates on the social feed yet. Be the first to share a post!</p>`;
                return;
            }

            visiblePosts.forEach(post => {
                const card = document.createElement('div');
                card.className = 'social-post-card';

                const myLikeIdentifier = student.rollNumber || String(session.userId);
                const hasLiked = (post.likes || []).includes(myLikeIdentifier);
                const likesCount = (post.likes || []).length;
                const commentsCount = (post.comments || []).length;

                let authorName = post.authorName || 'Anonymous';
                let authorAvatar = post.authorImg || DEFAULT_AVATAR;
                let authorRoleLabel = post.authorRole || 'Member';

                const commentsHtml = (post.comments || []).map(c => `
                    <div class="comment-item">
                        <div class="comment-item-header">
                            <span>${c.authorName} (${c.authorRole})</span>
                            <span style="font-weight: normal; color: var(--text-light);">${new Date(c.commentedAt).toLocaleDateString()}</span>
                        </div>
                        <div style="text-align: left;">${c.content}</div>
                    </div>
                `).join('');

                card.innerHTML = `
                    <div class="post-header">
                        <div class="post-author-info">
                            <img class="post-author-avatar" src="${authorAvatar}" alt="">
                            <div class="post-author-meta" style="text-align: left;">
                                <h5>
                                    ${authorName}
                                    <span class="inst-badge badge-purple" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${COLLEGE_NAMES[post.collegeCode] || post.collegeCode}</span>
                                </h5>
                                <p>${authorRoleLabel.toUpperCase()} &nbsp;•&nbsp; <span class="post-timestamp">${new Date(post.createdAt).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="post-body" style="text-align: left; margin-top: 0.5rem; white-space: pre-wrap;">${post.content || ''}</div>
                    ${post.imageUrl ? `
                        <div class="post-image-container">
                            <img class="post-image" src="${post.imageUrl}" alt="Post attachment">
                        </div>
                    ` : ''}
                    <div class="post-actions">
                        <button class="post-action-btn btn-like-trigger ${hasLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                            <span>${likesCount} Likes</span>
                        </button>
                        <button class="post-action-btn btn-comment-toggle" data-post-id="${post.id}">
                            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            <span>${commentsCount} Comments</span>
                        </button>
                    </div>
                    
                    <!-- Comments Panel -->
                    <div class="post-comments-section" id="commentsSection_${post.id}" style="display: none;">
                        <form class="comment-input-wrapper comment-form-trigger" data-post-id="${post.id}">
                            <input type="text" class="form-control" placeholder="Write a professional comment..." required id="commentInput_${post.id}">
                            <button type="submit" class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 700;">Post</button>
                        </form>
                        <div class="comments-list" style="margin-top: 0.5rem;">
                            ${commentsHtml}
                        </div>
                    </div>
                `;

                // Like action
                card.querySelector('.btn-like-trigger').addEventListener('click', async (e) => {
                    const btn = e.currentTarget;
                    const postId = btn.getAttribute('data-post-id');
                    try {
                        await API.posts.like(postId, session.userId);
                        renderSocialFeed(role);
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                });

                // Comment drawer toggle
                card.querySelector('.btn-comment-toggle').addEventListener('click', () => {
                    const pnl = document.getElementById(`commentsSection_${post.id}`);
                    pnl.style.display = pnl.style.display === 'none' ? 'flex' : 'none';
                });

                // Comment Submit logic
                card.querySelector('.comment-form-trigger').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const postId = e.target.getAttribute('data-post-id');
                    const txtInput = document.getElementById(`commentInput_${postId}`);
                    const commentText = txtInput.value.trim();

                    if (commentText) {
                        try {
                            await API.posts.comment(postId, { content: commentText }, session.userId);
                            txtInput.value = '';
                            await renderSocialFeed(role);
                            document.getElementById(`commentsSection_${postId}`).style.display = 'flex';
                        } catch (err) {
                            alert("Error commenting: " + err.message);
                        }
                    }
                });

                stream.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading social feed", e);
            stream.innerHTML = '<p style="color:var(--color-pink); text-align:center; padding:3rem 0">Failed to load social feed.</p>';
        }
    }

    // --- Global Create Post Modal handler ---
    const createPostOverlay = document.getElementById('createPostModalOverlay');
    const closeCreatePostBtn = document.getElementById('closeCreatePostModalBtn');
    const globalCreatePostForm = document.getElementById('globalCreatePostForm');
    const postModalImageFile = document.getElementById('postModalImageFile');
    const postModalImagePreview = document.getElementById('postModalImagePreview');
    const postModalRemoveImgBtn = document.getElementById('postModalRemoveImgBtn');

    let base64PostImage = '';

    const openGlobalPostModal = (role, name, avatar) => {
        document.getElementById('postModalAuthorName').textContent = name;
        document.getElementById('postModalAuthorAvatar').src = avatar;
        document.getElementById('postModalAuthorRole').textContent = role + ' Member';
        document.getElementById('postModalText').value = '';

        base64PostImage = '';
        postModalImagePreview.src = '';
        postModalImagePreview.style.display = 'none';
        postModalRemoveImgBtn.style.display = 'none';

        createPostOverlay.classList.add('open');
    };

    window.openGlobalPostModal = openGlobalPostModal;

    closeCreatePostBtn.addEventListener('click', () => createPostOverlay.classList.remove('open'));
    createPostOverlay.addEventListener('click', (e) => {
        if (e.target === createPostOverlay) createPostOverlay.classList.remove('open');
    });

    postModalImageFile.addEventListener('change', () => {
        const file = postModalImageFile.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File exceeds 5MB limit. Please choose a smaller image.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            base64PostImage = evt.target.result;
            postModalImagePreview.src = base64PostImage;
            postModalImagePreview.style.display = 'block';
            postModalRemoveImgBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    });

    postModalRemoveImgBtn.addEventListener('click', () => {
        base64PostImage = '';
        postModalImageFile.value = '';
        postModalImagePreview.src = '';
        postModalImagePreview.style.display = 'none';
        postModalRemoveImgBtn.style.display = 'none';
    });

    globalCreatePostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const postText = document.getElementById('postModalText').value.trim();
        if (!postText) return;

        API.posts.create({
            content: postText,
            imageUrl: base64PostImage || "",
            isPublic: false
        }, session.userId)
            .then(res => {
                updateSectionBadges();
                createPostOverlay.classList.remove('open');
                renderSocialFeed(session.role);
            })
            .catch(err => {
                alert("Error creating post: " + err.message);
            });
    });



    // --- Dynamic Section Badges Counter ---
    async function updateSectionBadges() {
        try {
            // Feed posts badge count
            const feedCountBadge = document.getElementById('stuFeedCountBadge');
            if (feedCountBadge) {
                const visiblePosts = await API.posts.feed(collegeId, session.userId);
                const totalPostsCount = visiblePosts.length;
                const seenPostsCount = parseInt(localStorage.getItem(`alumlink_seen_posts_count_${session.userId}`)) || 0;
                const newPosts = totalPostsCount - seenPostsCount;

                if (newPosts > 0) {
                    feedCountBadge.style.display = 'inline-block';
                    feedCountBadge.textContent = newPosts;
                } else {
                    feedCountBadge.style.display = 'none';
                }
            }

            // Opportunities badge count
            const oppsCountBadge = document.getElementById('stuOppsCountBadge');
            if (oppsCountBadge) {
                const [jobs, events] = await Promise.all([
                    API.jobs.byCollege(collegeId, session.userId),
                    API.events.byCollege(collegeId, session.userId)
                ]);
                const totalOppsCount = jobs.length + events.length;
                const seenOppsCount = parseInt(localStorage.getItem(`alumlink_seen_opps_count_${session.userId}`)) || 0;
                const newOpps = totalOppsCount - seenOppsCount;

                if (newOpps > 0) {
                    oppsCountBadge.style.display = 'inline-block';
                    oppsCountBadge.textContent = newOpps;
                } else {
                    oppsCountBadge.style.display = 'none';
                }
            }
        } catch (e) {
            console.error("Error updating badges", e);
        }
    }

    // --- 11. Event Broadcast Form submit ---
    const eventForm = document.getElementById('stuPostEventForm');
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('eventTitle').value.trim();
        const type = document.getElementById('eventType').value;
        const deadline = document.getElementById('eventDeadline').value.trim();
        const host = document.getElementById('eventHost').value.trim();
        const location = document.getElementById('eventLocation').value.trim();
        const tags = document.getElementById('eventTags').value.split(',').map(t => t.trim()).filter(t => t).join(',');
        const description = document.getElementById('eventDesc').value.trim();
        const isPublic = document.getElementById('eventIsPublic').checked;

        API.events.create({
            title: title,
            eventType: type,
            eventDate: deadline,
            host: host,
            location: location,
            tags: tags,
            description: description,
            isPublic: isPublic
        }, session.userId)
            .then(res => {
                alert(`Event "${title}" has been successfully hosted and posted!`);
                eventForm.reset();
                updateSectionBadges();
                // Switch to Opp Board
                btnOpp.click();
            })
            .catch(err => {
                alert("Error posting event: " + err.message);
            });
    });

    // --- 12. Chat Window Manager & Web Interface ---
    const chatOverlay = document.getElementById('chatWindowOverlay');
    const chatPartnerImg = document.getElementById('chatPartnerImg');
    const chatPartnerName = document.getElementById('chatPartnerName');
    const chatPartnerMeta = document.getElementById('chatPartnerMeta');
    const chatMessagesFeed = document.getElementById('chatMessagesFeed');
    const chatSendForm = document.getElementById('chatSendForm');
    const chatInputMessage = document.getElementById('chatInputMessage');
    const chatHeaderProfileBtn = document.getElementById('chatHeaderProfileBtn');
    const closeChatBtn = document.getElementById('closeChatBtn');

    let activeChatRequestId = '';
    let activeChatPartnerId = '';
    let activeChatPartnerCollege = '';
    let activeChatPartnerRole = '';

    // Sidebar search
    const chatSidebarSearch = document.getElementById('chatSidebarSearch');
    if (chatSidebarSearch) {
        chatSidebarSearch.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            renderChatSidebarThreads(q);
        });
    }

    const openChatWindow = async (requestId, partnerId, partnerCollege, partnerName, partnerRole, partnerImg) => {
        activeChatRequestId = requestId;
        activeChatPartnerId = partnerId;
        activeChatPartnerCollege = partnerCollege;
        activeChatPartnerRole = partnerRole;

        chatPartnerImg.src = partnerImg || DEFAULT_AVATAR;
        chatPartnerName.innerHTML = `${partnerName} <span class="inst-badge badge-cyan" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${COLLEGE_NAMES[partnerCollege] || partnerCollege}</span>`;
        chatPartnerMeta.textContent = partnerRole === 'student' ? 'Student Member' : 'Alumni Member';

        chatHeaderProfileBtn.onclick = () => {
            window.openProfileModal(partnerId, partnerCollege, partnerRole);
        };

        chatOverlay.classList.add('open');
        renderChatSidebarThreads();
        loadConversationMessages();

        try {
            await API.messages.markRead(requestId, session.userId);
            updateStudentChatsBadge();
        } catch (e) {
            console.error("Error marking messages read", e);
        }
    };

    window.openChatWindow = openChatWindow;

    const closeChatWindow = () => {
        chatOverlay.classList.remove('open');
        renderStudentChatsList();
    };

    closeChatBtn.addEventListener('click', closeChatWindow);

    async function renderChatSidebarThreads(query = '', isPoll = false) {
        const sidebar = document.getElementById('chatSidebarList');
        if (!sidebar) return;
        if (!isPoll) {
            sidebar.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-light)">Loading...</p>';
        }

        try {
            const requests = await API.connections.list(session.userId);
            const activeReqs = requests.filter(r => r.status === 'accepted');

            const countPromises = activeReqs.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(countPromises);

            sidebar.innerHTML = '';

            activeReqs.forEach((req, index) => {
                const isSender = req.fromUserId === session.userId;
                const pId = isSender ? req.toUserId : req.fromUserId;
                const pName = isSender ? req.toUserName : req.fromUserName;
                const pCollege = isSender ? req.toCollegeCode : req.fromCollegeCode;
                const pRole = isSender ? req.toRole : req.fromRole;
                const pImg = isSender ? req.toUserImg : req.fromUserImg;

                if (query && !pName.toLowerCase().includes(query)) return;

                const threadMsgs = messageThreads[index];
                const lastMsg = threadMsgs[threadMsgs.length - 1];
                const unreadCount = threadMsgs.filter(m => !m.isRead && m.senderId === pId).length;

                let lastMsgText = 'No messages yet';
                if (lastMsg) {
                    lastMsgText = lastMsg.content;
                }

                const item = document.createElement('div');
                item.className = `chat-thread-item ${String(req.id) === String(activeChatRequestId) ? 'active' : ''}`;
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.gap = '0.65rem';
                item.style.padding = '0.85rem 1.25rem';
                item.style.cursor = 'pointer';
                item.style.borderLeft = '3px solid transparent';
                item.style.borderBottom = '1px solid var(--border-color)';
                item.style.position = 'relative';

                item.innerHTML = `
                    <img src="${pImg || DEFAULT_AVATAR}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <div style="flex-grow: 1; min-width: 0; text-align: left;">
                        <h5 style="font-size: 0.85rem; font-weight: 750; color: var(--text-heading); margin: 0; display: flex; justify-content: space-between; align-items: center;">
                            <span>${pName}</span>
                            <span style="font-size: 0.65rem; font-weight: normal; color: var(--text-light);">${lastMsg ? new Date(lastMsg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </h5>
                        <p style="font-size: 0.725rem; color: var(--text-light); margin: 0.1rem 0 0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                            ${lastMsgText}
                        </p>
                    </div>
                    ${unreadCount > 0 ? `
                        <span class="inst-badge badge-pink" style="font-size: 0.65rem; border-radius: 50%; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; padding: 0;">${unreadCount}</span>
                    ` : ''}
                `;

                item.addEventListener('click', () => {
                    openChatWindow(req.id, pId, pCollege, pName, pRole, pImg);
                });

                sidebar.appendChild(item);
            });

            let globalUnreadCount = 0;
            activeReqs.forEach((req, index) => {
                const pId = req.fromUserId === session.userId ? req.toUserId : req.fromUserId;
                const unreads = messageThreads[index].filter(m => !m.isRead && m.senderId === pId).length;
                if (unreads > 0) globalUnreadCount++;
            });

            const badge = document.getElementById('chatSidebarBadge');
            if (globalUnreadCount > 0) {
                badge.textContent = `${globalUnreadCount} Active`;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        } catch (e) {
            console.error("Error rendering sidebar threads", e);
        }
    }

    async function loadConversationMessages(isPoll = false) {
        if (!isPoll) {
            chatMessagesFeed.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-light)">Loading messages...</p>';
        }

        try {
            const messages = await API.messages.thread(activeChatRequestId, session.userId);

            if (isPoll && chatMessagesFeed.children.length === messages.length) {
                return;
            }

            chatMessagesFeed.innerHTML = '';

            if (messages.length === 0) {
                chatMessagesFeed.innerHTML = `<div style="text-align: center; color: var(--text-light); font-size: 0.85rem; padding: 2rem 0; width: 100%;">You are now connected. Say hello to start the conversation!</div>`;
                return;
            }

            messages.forEach(msg => {
                if (msg.senderId === 'SYSTEM' || msg.senderId === 0 || msg.senderId === '0') {
                    const centerRow = document.createElement('div');
                    centerRow.style.width = '100%';
                    centerRow.style.textAlign = 'center';
                    centerRow.style.margin = '0.5rem 0';
                    centerRow.innerHTML = `<span class="inst-badge" style="background: rgba(15,23,42,0.06); color: var(--text-light); font-size: 0.725rem; font-weight: 700;">${msg.content}</span>`;
                    chatMessagesFeed.appendChild(centerRow);
                    return;
                }

                const row = document.createElement('div');
                row.style.width = '100%';
                row.style.display = 'flex';
                row.style.justifyContent = String(msg.senderId) === String(session.userId) ? 'flex-end' : 'flex-start';

                const bubble = document.createElement('div');
                bubble.style.maxWidth = '70%';
                bubble.style.padding = '0.75rem 1.15rem';
                bubble.style.borderRadius = '12px';
                bubble.style.boxShadow = 'var(--shadow-sm)';
                bubble.style.fontSize = '0.875rem';
                bubble.style.textAlign = 'left';

                if (String(msg.senderId) === String(session.userId)) {
                    bubble.style.backgroundColor = 'var(--color-primary)';
                    bubble.style.color = '#ffffff';
                    bubble.style.borderRadiusTopRight = '0';
                } else {
                    bubble.style.backgroundColor = '#ffffff';
                    bubble.style.color = 'var(--text-main)';
                    bubble.style.borderRadiusTopLeft = '0';
                    bubble.style.border = '1px solid var(--border-color)';
                }

                bubble.innerHTML = `
                    <div>${msg.content}</div>
                    <div style="text-align: right; font-size: 0.65rem; opacity: 0.75; margin-top: 0.25rem;">${new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                `;

                row.appendChild(bubble);
                chatMessagesFeed.appendChild(row);
            });

            chatMessagesFeed.scrollTop = chatMessagesFeed.scrollHeight;
        } catch (e) {
            console.error("Error loading conversation messages", e);
            chatMessagesFeed.innerHTML = '<p style="color:var(--color-pink); text-align:center; padding:1.5rem">Failed to load conversation.</p>';
        }
    }

    // Attachment dropdown controls
    const chatAttachmentBtn = document.getElementById('chatAttachmentBtn');
    const chatAttachmentDropdown = document.getElementById('chatAttachmentDropdown');
    const chatFileInput = document.getElementById('chatFileInput');

    const attachDocBtn = document.getElementById('attachDocBtn');
    const attachImgBtn = document.getElementById('attachImgBtn');
    const attachAudioBtn = document.getElementById('attachAudioBtn');

    const chatAttachmentPreview = document.getElementById('chatAttachmentPreview');
    const chatAttachmentName = document.getElementById('chatAttachmentName');
    const chatAttachmentRemoveBtn = document.getElementById('chatAttachmentRemoveBtn');

    let loadedAttachment = null;

    chatAttachmentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatAttachmentDropdown.style.display = chatAttachmentDropdown.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', () => {
        chatAttachmentDropdown.style.display = 'none';
    });

    const triggerFilePicker = (acceptType) => {
        chatFileInput.accept = acceptType;
        chatFileInput.click();
    };

    attachDocBtn.addEventListener('click', () => triggerFilePicker('.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'));
    attachImgBtn.addEventListener('click', () => triggerFilePicker('image/*'));
    attachAudioBtn.addEventListener('click', () => triggerFilePicker('audio/*'));

    chatFileInput.addEventListener('change', () => {
        const file = chatFileInput.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('File exceeds 10MB threshold limit.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            loadedAttachment = {
                name: file.name,
                type: file.type,
                data: evt.target.result
            };
            chatAttachmentName.textContent = file.name;
            chatAttachmentPreview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    });

    chatAttachmentRemoveBtn.addEventListener('click', () => {
        loadedAttachment = null;
        chatFileInput.value = '';
        chatAttachmentPreview.style.display = 'none';
    });

    chatSendForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const msgText = chatInputMessage.value.trim();

        if (!msgText && !loadedAttachment) return;

        API.messages.send({
            connectionRequestId: activeChatRequestId,
            senderId: session.userId,
            content: msgText || `Shared attachment: ${loadedAttachment.name}`
        }, session.userId)
            .then(res => {
                chatInputMessage.value = '';
                loadedAttachment = null;
                chatFileInput.value = '';
                chatAttachmentPreview.style.display = 'none';
                loadConversationMessages();
                renderChatSidebarThreads();
            })
            .catch(err => {
                alert("Error sending message: " + err.message);
            });
    });

    // Run Initializing function calls
    renderAlumniDirectory('');
    if (typeof renderStudentDirectory === 'function') {
        renderStudentDirectory('');
    }
    updateStudentChatsBadge();
    updateSectionBadges();

    // Real-time message & notification polling (every 4 seconds)
    setInterval(() => {
        // 1. Update chats/invites badge count
        updateStudentChatsBadge();
        updateSectionBadges();

        // 2. If Chats view is currently visible, refresh active chat log list cards (and unread counts next to names) silently
        const viewChats = document.getElementById('stuViewChats');
        if (viewChats && viewChats.style.display === 'block') {
            renderStudentChatsList(true);
        }

        // 3. If chat window is open, refresh message history and sidebar threads silently
        if (chatOverlay && chatOverlay.classList.contains('open') && activeChatRequestId) {
            loadConversationMessages(true);
            renderChatSidebarThreads('', true);
        }
    }, 4000);
});
