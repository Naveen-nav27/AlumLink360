document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Verify Active Session ---
    const session = JSON.parse(sessionStorage.getItem('alumlink_active_session'));
    const urlParams = new URLSearchParams(window.location.search);
    const collegeId = urlParams.get('college') ? urlParams.get('college').toLowerCase() : '';

    if (!session || session.role !== 'alumni' || session.collegeId !== collegeId) {
        alert("Session invalid or expired. Please sign in again.");
        window.location.href = `portal.html?college=${collegeId || 'ksrct'}`;
        return;
    }

    const currentCollegeBranding = COLLEGE_BRANDING[collegeId];

    if (!currentCollegeBranding) {
        window.location.href = 'index.html';
        return;
    }

    let alumni = null;

    async function init() {
        try {
            alumni = await API.users.getById(session.userId);
            
            // Apply color theme from branding
            applyTheme(currentCollegeBranding.colorTheme || "blue");

            // --- 3. Populate Header & Sidebar ---
            document.getElementById('dashboardCollegeName').textContent = currentCollegeBranding.name;
            document.getElementById('dashboardCollegeCode').textContent = collegeId.toUpperCase();
            document.getElementById('dashboardUserName').textContent = alumni.fullName;
            document.getElementById('dashboardUserAvatar').src = alumni.photoUrl || DEFAULT_AVATAR;

            const profileImg = document.getElementById('alumniProfileImg');
            profileImg.src = alumni.photoUrl || DEFAULT_AVATAR;
            document.getElementById('alumniProfileName').textContent = alumni.fullName;
            document.getElementById('alumniProfileId').textContent = alumni.rollNumber || alumni.id;
            document.getElementById('alumniProfileCol').textContent = collegeId.toUpperCase();
            document.getElementById('alumniProfileDept').textContent = alumni.department || 'N/A';
            document.getElementById('alumniProfileYear').textContent = alumni.passedOutYear || 'N/A';
            document.getElementById('alumniProfileEmail').textContent = alumni.email || 'N/A';
            document.getElementById('alumniProfileLinkedin').href = alumni.linkedinUrl || '#';

            // Profile photo upload
            const alumImgFileInput = document.getElementById('alumniProfileImgFile');
            const alumImgThumb = document.getElementById('alumniProfileImgThumb');
            if (alumni.photoUrl) {
                alumImgThumb.src = alumni.photoUrl;
                alumImgThumb.style.display = 'inline-block';
            }

            alumImgFileInput.addEventListener('change', () => {
                const file = alumImgFileInput.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image too large. Please choose a file under 5 MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const dataUrl = evt.target.result;
                    try {
                        await API.users.updateProfile(session.userId, { photoUrl: dataUrl });
                        alumni.photoUrl = dataUrl;
                        profileImg.src = dataUrl;
                        document.getElementById('dashboardUserAvatar').src = dataUrl;
                        if (document.getElementById('alumFeedTriggerAvatar')) {
                            document.getElementById('alumFeedTriggerAvatar').src = dataUrl;
                        }
                        alumImgThumb.src = dataUrl;
                        alumImgThumb.style.display = 'inline-block';
                    } catch (err) {
                        alert("Failed to update profile photo: " + err.message);
                    }
                };
                reader.readAsDataURL(file);
            });

            // Initializing function calls
            renderAlumniFollowers();
            updateAlumniInboxBadge();
            updateSectionBadges();

            // Populate feed trigger avatar safely after data is loaded
            const alumTriggerAvatar = document.getElementById('alumFeedTriggerAvatar');
            if (alumTriggerAvatar) alumTriggerAvatar.src = alumni.photoUrl || DEFAULT_AVATAR;

            const alumTriggerCard = document.getElementById('alumPostTriggerCard');
            if (alumTriggerCard) {
                alumTriggerCard.addEventListener('click', () => {
                    openGlobalPostModal('alumni', alumni.fullName, alumni.photoUrl || DEFAULT_AVATAR);
                });
            }
        } catch (e) {
            console.error("Initialization error", e);
            alert("Error: " + e.message);
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
    const btnFollowers = document.getElementById('alumTabBtnFollowers');
    const btnPost = document.getElementById('alumTabBtnPost');
    const btnManage = document.getElementById('alumTabBtnManage');
    const btnInbox = document.getElementById('alumTabBtnInbox');
    const btnFeed = document.getElementById('alumTabBtnFeed');

    const viewFollowers = document.getElementById('alumViewFollowers');
    const viewPost = document.getElementById('alumViewPost');
    const viewManage = document.getElementById('alumViewManage');
    const viewInbox = document.getElementById('alumViewInbox');
    const viewFeed = document.getElementById('alumViewFeed');

    const hideAllAlumniViews = () => {
        viewFollowers.style.display = 'none';
        viewPost.style.display = 'none';
        viewManage.style.display = 'none';
        viewInbox.style.display = 'none';
        viewFeed.style.display = 'none';

        btnFollowers.classList.remove('active');
        btnPost.classList.remove('active');
        btnManage.classList.remove('active');
        btnInbox.classList.remove('active');
        btnFeed.classList.remove('active');
    };

    btnFollowers.addEventListener('click', () => {
        hideAllAlumniViews();
        btnFollowers.classList.add('active');
        viewFollowers.style.display = 'block';
        renderAlumniFollowers();
    });

    btnPost.addEventListener('click', () => {
        hideAllAlumniViews();
        btnPost.classList.add('active');
        viewPost.style.display = 'block';
    });

    btnManage.addEventListener('click', async () => {
        hideAllAlumniViews();
        btnManage.classList.add('active');
        viewManage.style.display = 'block';
        renderAlumniPostedOpenings();

        // Mark applications as seen
        try {
            const [jobs, events] = await Promise.all([
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId)
            ]);

            let myOpps = [];
            jobs.forEach(j => {
                if (j.postedById === session.userId || j.postedByRoll === session.userRoll) myOpps.push({ id: j.id, type: 'internship' });
            });
            events.forEach(e => {
                if (e.postedById === session.userId || e.postedByRoll === session.userRoll) myOpps.push({ id: e.id, type: 'event' });
            });

            const countPromises = myOpps.map(opp => {
                if (opp.type === 'internship') {
                    return API.applications.byJob(opp.id, session.userId).catch(() => []);
                } else {
                    return API.applications.byEvent(opp.id, session.userId).catch(() => []);
                }
            });

            const appsLists = await Promise.all(countPromises);
            const myAppsCount = appsLists.reduce((acc, curr) => acc + curr.length, 0);

            localStorage.setItem(`alumlink_seen_apps_count_${session.userId}`, myAppsCount);
            updateSectionBadges();
        } catch (e) {
            console.error(e);
        }
    });

    btnInbox.addEventListener('click', () => {
        hideAllAlumniViews();
        btnInbox.classList.add('active');
        viewInbox.style.display = 'block';
        renderAlumniInboxList();
        renderAlumniPendingRequestsList();
    });

    btnFeed.addEventListener('click', async () => {
        hideAllAlumniViews();
        btnFeed.classList.add('active');
        viewFeed.style.display = 'block';
        renderSocialFeed('alumni');

        // Mark feed posts as seen
        try {
            const visiblePosts = await API.posts.feed(collegeId, session.userId);
            localStorage.setItem(`alumlink_seen_posts_count_${session.userId}`, visiblePosts.length);
            updateSectionBadges();
        } catch (e) {
            console.error(e);
        }
    });

    // --- 5. Render Followers & Network ---
    async function renderAlumniFollowers() {
        const grid = document.getElementById('studentFollowersGrid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading followers...</p>';

        try {
            const [students, connections] = await Promise.all([
                API.users.listByCollege(collegeId, 'STUDENT'),
                API.connections.list(session.userId)
            ]);

            const activeReqs = connections.filter(r => r.status === 'accepted');
            const threadPromises = activeReqs.map(req => API.messages.thread(req.id, session.userId).catch(() => []));
            const messageThreads = await Promise.all(threadPromises);

            grid.innerHTML = '';

            const filteredStudents = students.filter(s => {
                return connections.some(r => r.fromUserId === s.id || r.toUserId === s.id);
            });

            if (filteredStudents.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No followers or network connections yet. Keep your profile updated to connect with students!</p>`;
                return;
            }

            filteredStudents.forEach(stu => {
                const card = document.createElement('div');
                card.className = 'follower-card';
                const stuAvatar = stu.photoUrl || DEFAULT_AVATAR;

                const connectReq = connections.find(r => 
                    (r.fromUserId === stu.id && r.toUserId === session.userId) ||
                    (r.fromUserId === session.userId && r.toUserId === stu.id)
                );

                let unreadCount = 0;
                if (connectReq && connectReq.status === 'accepted') {
                    const idx = activeReqs.findIndex(r => r.id === connectReq.id);
                    if (idx !== -1) {
                        unreadCount = messageThreads[idx].filter(m => !m.isRead && m.senderId === stu.id).length;
                    }
                }

                let actionBtnHtml = '';
                if (connectReq) {
                    if (connectReq.status === 'accepted') {
                        actionBtnHtml = `
                        <div style="display: flex; flex-direction: column; gap: 0.35rem; align-items: stretch;">
                            <button class="btn btn-outline-light btn-follow btn-view-profile" data-partner-id="${stu.id}" data-partner-college="${collegeId}" data-partner-role="student" style="padding: 0.4rem 1rem; font-size: 0.75rem;">View Profile</button>
                            <button class="btn btn-outline-primary btn-follow follower-chat-btn" data-req-id="${connectReq.id}" data-partner-id="${stu.id}" data-partner-img="${stuAvatar}" data-partner-name="${stu.fullName}" style="padding: 0.4rem 1rem; font-size: 0.75rem;">Chat</button>
                        </div>`;
                    } else if (connectReq.status === 'pending') {
                        if (connectReq.toUserId === session.userId) {
                            actionBtnHtml = `<button class="btn btn-primary btn-follow follower-accept-btn" data-req-id="${connectReq.id}" data-partner-name="${stu.fullName}">Approve</button>`;
                        } else {
                            actionBtnHtml = `<button class="btn-follow" style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-light);" disabled>Pending</button>`;
                        }
                    }
                } else {
                    actionBtnHtml = `<button class="btn btn-primary btn-follow follower-direct-btn" data-stu-id="${stu.id}" data-stu-name="${stu.fullName}">Connect</button>`;
                }

                card.innerHTML = `
                    <img class="follower-avatar" src="${stuAvatar}" alt="${stu.fullName}">
                    <div class="follower-info" style="flex-grow: 1; text-align: left;">
                        <h5 style="font-size: 0.95rem; font-weight: 750; color: var(--text-heading); margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${stu.fullName}">${stu.fullName}</span>
                            ${unreadCount > 0 ? `<span class="unread-count-badge" style="background: #ef4444; color: white; border-radius: 12px; padding: 0.1rem 0.4rem; font-size: 0.65rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; line-height: 1; flex-shrink: 0; vertical-align: middle;">${unreadCount} New</span>` : ''}
                        </h5>
                        <p style="font-weight: 600; color: var(--text-main); margin-bottom: 0.1rem; display: flex; align-items: center; gap: 0.4rem;">
                            <span>Roll No: ${stu.rollNumber || stu.id}</span>
                            ${unreadCount > 0 ? `<span style="background: #ef4444; color: white; border-radius: 50%; min-width: 20px; height: 20px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.18); animation: pulse-badge 1.2s infinite;">${unreadCount}</span>` : ''}
                        </p>
                        ${stu.department ? `<p style="font-size:0.75rem;color:var(--color-primary);font-weight:700;margin-bottom:0.1rem;">${stu.department}</p>` : ''}
                        ${getBatch(stu.graduationYear) ? `<span class="inst-badge badge-purple" style="font-size:0.7rem;margin-bottom:0.35rem;">Batch ${getBatch(stu.graduationYear)}</span>` : `<p style="font-size: 0.725rem; color: var(--text-light); margin-bottom: 0.35rem;">Email: ${stu.email}</p>`}
                        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                            <span class="inst-badge badge-purple" style="font-size: 0.7rem; font-weight: 700;">CGPA: ${stu.cgpa ? stu.cgpa.toFixed(2) : '0.00'}</span>
                            ${stu.resumeUrl ? `<a href="${stu.resumeUrl}" target="_blank" class="inst-badge badge-cyan" style="font-size: 0.7rem; font-weight: 700; text-decoration: none;">View Resume &rarr;</a>` : ''}
                        </div>
                    </div>
                    <div style="margin-left: 0.5rem;">
                        ${actionBtnHtml}
                    </div>
                `;

                // Bind Event Listeners
                const chatBtn = card.querySelector('.follower-chat-btn');
                if (chatBtn) {
                    chatBtn.addEventListener('click', (e) => {
                        const btn = e.currentTarget;
                        openChatWindow(
                            btn.getAttribute('data-req-id'),
                            btn.getAttribute('data-partner-id'),
                            collegeId,
                            btn.getAttribute('data-partner-name'),
                            'student',
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

                const acceptBtn = card.querySelector('.follower-accept-btn');
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', async (e) => {
                        const reqId = e.target.getAttribute('data-req-id');
                        const pName = e.target.getAttribute('data-partner-name');
                        try {
                            await API.connections.accept(reqId, session.userId);
                            updateAlumniInboxBadge();
                            alert(`Connection approved with ${pName}!`);
                            renderAlumniFollowers();
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    });
                }

                const directBtn = card.querySelector('.follower-direct-btn');
                if (directBtn) {
                    directBtn.addEventListener('click', async (e) => {
                        const stuId = e.target.getAttribute('data-stu-id');
                        const stuName = e.target.getAttribute('data-stu-name');
                        try {
                            await API.connections.send({ toUserId: stuId, message: "Connection initiated directly by alumnus." }, session.userId);
                            alert(`Connection requested with ${stuName}!`);
                            renderAlumniFollowers();
                        } catch (err) {
                            alert("Error: " + err.message);
                        }
                    });
                }

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading followers", e);
            grid.innerHTML = '<p style="color:var(--color-pink); text-align:center">Error loading followers list.</p>';
        }
    }

    // --- 6. Post Opportunity ---
    const postForm = document.getElementById('alumniPostOppForm');
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('postOppTitle').value.trim();
        const type = document.getElementById('postOppType').value;
        const deadline = document.getElementById('postOppDeadline').value.trim();
        const host = document.getElementById('postOppHost').value.trim();
        const location = document.getElementById('postOppLocation').value.trim();
        const tags = document.getElementById('postOppTags').value.split(',').map(t => t.trim()).filter(t => t).join(',');
        const description = document.getElementById('postOppDesc').value.trim();
        const isPublic = document.getElementById('postOppIsPublic').checked;

        let promise;
        if (type === 'internship') {
            promise = API.jobs.create({
                title: title,
                hostCompany: host,
                location: location,
                tags: tags,
                description: description,
                deadline: deadline,
                isPublic: isPublic
            }, session.userId);
        } else {
            promise = API.events.create({
                title: title,
                eventType: type,
                eventDate: deadline,
                host: host,
                location: location,
                tags: tags,
                description: description,
                isPublic: isPublic
            }, session.userId);
        }

        promise.then(res => {
            alert('Opportunity published successfully!');
            postForm.reset();
            btnManage.click();
        })
        .catch(err => {
            alert("Error posting opportunity: " + err.message);
        });
    });

    // --- 7. Manage Openings ---
    async function renderAlumniPostedOpenings() {
        const grid = document.getElementById('alumniPostedOpportunitiesGrid');
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading openings...</p>';

        try {
            const [jobs, events] = await Promise.all([
                API.jobs.byCollege(collegeId, session.userId),
                API.events.byCollege(collegeId, session.userId)
            ]);

            let opps = [];
            jobs.forEach(j => {
                if (j.postedById === session.userId || j.postedByRoll === session.userRoll) {
                    opps.push({
                        id: j.id,
                        type: 'internship',
                        title: j.title,
                        host: j.hostCompany,
                        location: j.location,
                        tags: j.tags ? j.tags.split(',').map(t => t.trim()) : [],
                        description: j.description,
                        deadline: j.deadline,
                        isPublic: j.isPublic,
                        createdAt: j.createdAt
                    });
                }
            });

            events.forEach(e => {
                if (e.postedById === session.userId || e.postedByRoll === session.userRoll) {
                    opps.push({
                        id: e.id,
                        type: e.eventType,
                        title: e.title,
                        host: e.host,
                        location: e.location,
                        tags: e.tags ? e.tags.split(',').map(t => t.trim()) : [],
                        description: e.description,
                        deadline: e.eventDate,
                        isPublic: e.isPublic,
                        createdAt: e.createdAt
                    });
                }
            });

            grid.innerHTML = '';

            if (opps.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">You have not published any openings yet.</p>`;
                return;
            }

            const countPromises = opps.map(opp => {
                if (opp.type === 'internship') {
                    return API.applications.byJob(opp.id, session.userId).catch(() => []);
                } else {
                    return API.applications.byEvent(opp.id, session.userId).catch(() => []);
                }
            });

            const appsLists = await Promise.all(countPromises);

            opps.forEach((opp, idx) => {
                const appsCount = appsLists[idx].length;

                const card = document.createElement('div');
                card.className = 'opp-card glass-panel opp-card-posted';

                let typeBadgeClass = 'opp-badge';
                if (opp.type === 'internship') typeBadgeClass += ' badge-internship';
                else if (opp.type === 'hackathon') typeBadgeClass += ' badge-hackathon';
                else if (opp.type === 'workshop') typeBadgeClass += ' badge-workshop';
                else typeBadgeClass += ' badge-workshop';

                const tagsHtml = opp.tags.map(t => `<span class="opp-detail-tag">${t}</span>`).join('');

                card.innerHTML = `
                    <div class="opp-card-header">
                        <span class="${typeBadgeClass}">${opp.type.toUpperCase()}</span>
                        <span class="opp-deadline">Deadline: ${opp.deadline}</span>
                    </div>
                    <div class="opp-card-body" style="flex-grow:1; display:flex; flex-direction:column;">
                        <h4 class="opp-title" style="margin-top: 0.5rem; margin-bottom: 0.25rem;">${opp.title}</h4>
                        <p class="opp-host" style="font-size: 0.85rem; color: var(--text-main); font-weight: 600; margin-bottom: 0.5rem;">${opp.host}</p>
                        <p class="opp-details-row" style="margin-bottom: 0.75rem;">
                            <span class="opp-detail-tag" style="background-color: var(--bg-secondary);">${opp.location}</span>
                            ${tagsHtml}
                        </p>
                        <p class="opp-desc" style="font-size: 0.85rem; color: var(--text-light); line-height: 1.5; flex-grow:1;">${opp.description}</p>
                    </div>
                    <div class="opp-card-actions" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display:flex; justify-content:space-between; align-items:center;">
                        <button class="btn btn-outline-primary btn-view-applications" data-id="${opp.id}" data-type="${opp.type}" data-title="${opp.title}" style="padding: 0.45rem 1rem; font-size: 0.8rem; font-weight: 700; border-radius:6px;">
                            View Applications (${appsCount})
                        </button>
                        ${opp.isPublic ? `<span class="inst-badge badge-purple" style="font-size: 0.65rem; font-weight: 800;">Public Node Visibility</span>` : `<span class="inst-badge" style="font-size: 0.65rem; font-weight: 700; background: var(--bg-secondary); color: var(--text-light);">Local Only</span>`}
                    </div>
                `;

                card.querySelector('.btn-view-applications').addEventListener('click', (e) => {
                    const btn = e.currentTarget;
                    window.openApplicationsModal(btn.getAttribute('data-id'), btn.getAttribute('data-type'), btn.getAttribute('data-title'));
                });

                grid.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading posted openings", e);
            grid.innerHTML = '<p style="color:var(--color-pink); text-align:center">Error loading your posted openings.</p>';
        }
    }

    // Received applications modal popup logic
    const appsOverlay = document.getElementById('applicationsListModalOverlay');
    const closeAppsBtn = document.getElementById('closeAppListModalBtn');

    closeAppsBtn.addEventListener('click', () => appsOverlay.classList.remove('open'));
    appsOverlay.addEventListener('click', (e) => {
        if (e.target === appsOverlay) appsOverlay.classList.remove('open');
    });

    window.openApplicationsModal = async (oppId, oppType, oppTitle) => {
        document.getElementById('appListModalTitle').textContent = `Submissions`;
        document.getElementById('appListModalSubtitle').textContent = `Applications for "${oppTitle}"`;

        const listContent = document.getElementById('appListContent');
        listContent.innerHTML = '<p style="text-align:center; padding:1.5rem">Loading applications...</p>';
        appsOverlay.classList.add('open');

        try {
            let apps = [];
            if (oppType === 'internship') {
                apps = await API.applications.byJob(oppId, session.userId);
            } else {
                apps = await API.applications.byEvent(oppId, session.userId);
            }

            listContent.innerHTML = '';

            if (apps.length === 0) {
                listContent.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 2rem 0;">No applications received for this opening yet.</p>`;
            } else {
                apps.forEach(app => {
                    const cgpa = app.cgpaAtApply ? app.cgpaAtApply.toFixed(2) : 'N/A';

                    const card = document.createElement('div');
                    card.className = 'app-card';
                    card.innerHTML = `
                        <div class="app-header">
                            <h4 style="font-weight: 700; color: var(--text-heading);">${app.studentName}</h4>
                            <span class="opp-deadline" style="margin: 0;">Applied: ${new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <div class="app-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.75rem;">
                            <div><strong>Roll Number:</strong> ${app.studentRollNumber || app.studentId}</div>
                            <div><strong>Graduation Year:</strong> ${app.gradYear}</div>
                            <div><strong>Email:</strong> ${app.studentEmail}</div>
                            <div><strong>Live CGPA:</strong> <span class="inst-badge badge-purple" style="font-size: 0.725rem; font-weight: 700;">${cgpa}</span></div>
                            <div style="grid-column: 1 / -1; margin-top: 0.25rem;">
                                <strong>Resume:</strong> <a href="${app.resumeUrl}" target="_blank" style="color: var(--color-primary); font-weight: 600; text-decoration: none;">View Resume &rarr;</a>
                            </div>
                        </div>
                        <div class="app-notes" style="font-size: 0.8rem; background: var(--bg-secondary); padding: 0.65rem; border-radius: 6px; border: 1px dashed var(--border-color);">
                            <strong>Cover Note:</strong><br>
                            ${app.notes || 'No remarks provided.'}
                        </div>
                    `;
                    listContent.appendChild(card);
                });
            }
        } catch (e) {
            console.error("Error loading applications list", e);
            listContent.innerHTML = '<p style="color:var(--color-pink); text-align:center">Error loading submissions.</p>';
        }
    };

    // --- 8. Inbox Invites & Chats ---
    // --- 8. Inbox Invites & Chats ---
    async function renderAlumniInboxList(isPoll = false) {
        const grid = document.getElementById('alumniChatsList');
        if (!grid) return;
        if (!isPoll) {
            grid.innerHTML = '<p style="text-align:center; padding:2rem 0; width:100%; grid-column:1/-1; color:var(--text-light)">Loading chats...</p>';
        }

        try {
            const requests = await API.connections.list(session.userId);
            const activeConnections = requests.filter(r => r.status === 'accepted');

            grid.innerHTML = '';

            if (activeConnections.length === 0) {
                grid.innerHTML = `<p style="color: var(--text-light); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem 0;">No active messaging channels yet.</p>`;
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
            console.error("Error rendering inbox list", e);
            grid.innerHTML = '<p style="color:var(--color-pink); text-align:center">Error loading chats.</p>';
        }
    }

    async function renderAlumniPendingRequestsList() {
        const requestsList = document.getElementById('alumniPendingRequestsList');
        if (!requestsList) return;
        requestsList.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-light)">Loading invites...</p>';

        try {
            const requests = await API.connections.list(session.userId);
            const incomingReqs = requests.filter(r => 
                r.toUserId === session.userId && r.status === 'pending'
            );

            requestsList.innerHTML = '';

            if (incomingReqs.length === 0) {
                requestsList.innerHTML = `<p style="color: var(--text-light); padding: 1.5rem; text-align: center; background: #ffffff; border-radius: 12px; border: 1px solid var(--border-color);">No pending connection invites received.</p>';`;
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
                        renderAlumniPendingRequestsList();
                        renderAlumniInboxList();
                        updateAlumniInboxBadge();
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                });

                card.querySelector('.btn-reject-req').addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    try {
                        await API.connections.reject(id, session.userId);
                        alert(`Connection request declined.`);
                        renderAlumniPendingRequestsList();
                        updateAlumniInboxBadge();
                    } catch (err) {
                        alert("Error: " + err.message);
                    }
                });

                requestsList.appendChild(card);
            });
        } catch (e) {
            console.error("Error loading pending requests", e);
            requestsList.innerHTML = '<p style="color:var(--color-pink); text-align:center">Error loading invites.</p>';
        }
    }

    async function updateAlumniInboxBadge() {
        const badge = document.getElementById('alumInboxBadge');
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

            const pendingCount = requests.filter(r => 
                r.toUserId === session.userId && r.status === 'pending'
            ).length;

            const totalBadgeCount = unreadCount + pendingCount;

            if (totalBadgeCount > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = totalBadgeCount;
            } else {
                badge.style.display = 'none';
            }
        } catch (e) {
            console.error("Error updating inbox badge", e);
        }
    }

    // --- 9. Social Feed Management ---
    async function renderSocialFeed(role) {
        const stream = document.getElementById('alumSocialFeedStream');
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

                const myLikeIdentifier = alumni.rollNumber || String(session.userId);
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

    // --- Received Application Indicators & Section Badges ---
    async function updateSectionBadges() {
        // Manage Openings badge
        const manageBadge = document.getElementById('alumManageBadge');
        if (manageBadge) {
            try {
                const [jobs, events] = await Promise.all([
                    API.jobs.byCollege(collegeId, session.userId),
                    API.events.byCollege(collegeId, session.userId)
                ]);

                let myOpps = [];
                jobs.forEach(j => {
                    if (j.postedById === session.userId || j.postedByRoll === session.userRoll) {
                        myOpps.push({ id: j.id, type: 'internship' });
                    }
                });
                events.forEach(e => {
                    if (e.postedById === session.userId || e.postedByRoll === session.userRoll) {
                        myOpps.push({ id: e.id, type: 'event' });
                    }
                });

                const countPromises = myOpps.map(opp => {
                    if (opp.type === 'internship') {
                        return API.applications.byJob(opp.id, session.userId).catch(() => []);
                    } else {
                        return API.applications.byEvent(opp.id, session.userId).catch(() => []);
                    }
                });

                const appsLists = await Promise.all(countPromises);
                const myAppsCount = appsLists.reduce((acc, curr) => acc + curr.length, 0);

                const seenAppsCount = parseInt(localStorage.getItem(`alumlink_seen_apps_count_${session.userId}`)) || 0;
                const newApps = myAppsCount - seenAppsCount;

                if (newApps > 0) {
                    manageBadge.style.display = 'inline-block';
                    manageBadge.textContent = newApps;
                } else {
                    manageBadge.style.display = 'none';
                }
            } catch (e) {
                console.error(e);
            }
        }

        // Feed Badge
        const feedCountBadge = document.getElementById('alumFeedCountBadge');
        if (feedCountBadge) {
            try {
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
            } catch (e) {
                console.error(e);
            }
        }
    }



    // --- 10. Profile View Modal Controls ---
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
            if (partnerRole === 'student') {
                roleBadge.className = 'inst-badge badge-purple';
            } else {
                roleBadge.className = 'inst-badge badge-cyan';
            }

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
            const connections = await API.connections.list(session.userId);
            const connectReq = connections.find(r => 
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
    document.getElementById('viewProfileModalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('viewProfileModalOverlay')) {
            document.getElementById('viewProfileModalOverlay').classList.remove('open');
        }
    });

    // --- 11. Chat Window Controls ---
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
        chatPartnerName.innerHTML = `${partnerName} <span class="inst-badge badge-purple" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${COLLEGE_NAMES[partnerCollege] || partnerCollege}</span>`;
        chatPartnerMeta.textContent = partnerRole === 'student' ? 'Student Member' : 'Alumni Member';

        chatHeaderProfileBtn.onclick = () => {
            window.openProfileModal(partnerId, partnerCollege, partnerRole);
        };

        chatOverlay.classList.add('open');
        renderChatSidebarThreads();
        loadConversationMessages();

        try {
            await API.messages.markRead(requestId, session.userId);
            updateAlumniInboxBadge();
        } catch (e) {
            console.error("Error marking messages read", e);
        }
    };

    window.openChatWindow = openChatWindow;

    const closeChatWindow = () => {
        chatOverlay.classList.remove('open');
        renderAlumniInboxList();
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

                item.innerHTML = `
                    <img src="${pImg || DEFAULT_AVATAR}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <div style="flex-grow: 1; min-width: 0; text-align: left;">
                        <h5 style="font-size: 0.85rem; font-weight: 750; color: var(--text-heading); margin: 0; display: flex; justify-content: space-between; align-items: center;">
                            <span>${pName}</span>
                            <span style="font-size: 0.65rem; font-weight: normal; color: var(--text-light);">${lastMsg ? new Date(lastMsg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
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
                    <div style="text-align: right; font-size: 0.65rem; opacity: 0.75; margin-top: 0.25rem;">${new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
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

    // Chat Attachments logic
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
    renderAlumniFollowers();
    updateAlumniInboxBadge();
    updateSectionBadges();

    // Real-time message & notification polling (every 4 seconds)
    setInterval(() => {
        // 1. Update chats/invites badge count
        updateAlumniInboxBadge();
        updateSectionBadges();
        
        // 2. If Inbox view is currently visible, refresh active chat log list cards (and unread counts next to names) silently
        const viewInbox = document.getElementById('alumViewInbox');
        if (viewInbox && viewInbox.style.display === 'block') {
            renderAlumniInboxList(true);
        }
        
        // 3. If chat window is open, refresh message history and sidebar threads silently
        if (chatOverlay && chatOverlay.classList.contains('open') && activeChatRequestId) {
            loadConversationMessages(true);
            renderChatSidebarThreads('', true);
        }
    }, 4000);
});
