const API_BASE = 'http://localhost:8081/api';

// Helper function to handle fetch calls and return JSON
const req = async (url, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const res = await fetch(`${API_BASE}${url}`, options);
    if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || `Request failed with status ${res.status}`);
    }
    // For delete or simple updates returning 200 OK with no body
    if (res.status === 204 || res.headers.get('content-length') === '0') {
        return null;
    }
    try {
        return await res.json();
    } catch (e) {
        return null;
    }
};

const API = {
    colleges: {
        getAll: () => req('/colleges'),
        getByCode: (code) => req(`/colleges/${code}`),
        updateSettings: (code, data, adminId) => req(`/colleges/${code}/settings?adminId=${adminId}`, 'PUT', data)
    },
    auth: {
        register: (data) => req('/auth/register', 'POST', data),
        login: (data) => req('/auth/login', 'POST', data)
    },
    users: {
        getById: (id) => req(`/users/${id}`),
        updateProfile: (id, data) => req(`/users/${id}`, 'PUT', data),
        listByCollege: (code, role) => req(`/users/college/${code}${role ? `?role=${role}` : ''}`),
        deleteUser: (id, adminId) => req(`/users/${id}?adminId=${adminId}`, 'DELETE')
    },
    jobs: {
        create: (data, userId) => req(`/jobs?userId=${userId}`, 'POST', data),
        byCollege: (code, userId) => req(`/jobs/college/${code}?userId=${userId}`),
        myJobs: (userId) => req(`/jobs/my?userId=${userId}`),
        update: (id, data, userId) => req(`/jobs/${id}?userId=${userId}`, 'PUT', data),
        delete: (id, userId) => req(`/jobs/${id}?userId=${userId}`, 'DELETE')
    },
    events: {
        create: (data, userId) => req(`/events?userId=${userId}`, 'POST', data),
        byCollege: (code, userId) => req(`/events/college/${code}?userId=${userId}`),
        myEvents: (userId) => req(`/events/my?userId=${userId}`),
        update: (id, data, userId) => req(`/events/${id}?userId=${userId}`, 'PUT', data),
        delete: (id, userId) => req(`/events/${id}?userId=${userId}`, 'DELETE')
    },
    applications: {
        submit: (data, userId) => req(`/applications?userId=${userId}`, 'POST', data),
        byJob: (jobId, userId) => req(`/applications/job/${jobId}?userId=${userId}`),
        byEvent: (eventId, userId) => req(`/applications/event/${eventId}?userId=${userId}`),
        byStudent: (studentId, userId) => req(`/applications/student/${studentId}?userId=${userId}`)
    },
    posts: {
        feed: (code, userId) => req(`/posts/feed/${code}?userId=${userId}`),
        create: (data, userId) => req(`/posts?userId=${userId}`, 'POST', data),
        like: (id, userId) => req(`/posts/${id}/like?userId=${userId}`, 'POST'),
        comment: (id, data, userId) => req(`/posts/${id}/comments?userId=${userId}`, 'POST', data),
        delete: (id, userId) => req(`/posts/${id}?userId=${userId}`, 'DELETE')
    },
    connections: {
        send: (data, userId) => req(`/connections?userId=${userId}`, 'POST', data),
        accept: (id, userId) => req(`/connections/${id}/accept?userId=${userId}`, 'PUT'),
        reject: (id, userId) => req(`/connections/${id}/reject?userId=${userId}`, 'PUT'),
        list: (userId) => req(`/connections/user/${userId}`)
    },
    messages: {
        send: (data, senderId) => req(`/messages?senderId=${senderId}`, 'POST', data),
        thread: (requestId, userId) => req(`/messages/thread/${requestId}?userId=${userId}`),
        markRead: (requestId, userId) => req(`/messages/thread/${requestId}/read?userId=${userId}`, 'PUT')
    }
};
