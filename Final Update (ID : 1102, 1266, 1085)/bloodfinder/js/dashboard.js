/**
 * BloodFinder BD — Donor Dashboard JavaScript
 */

let currentUser = null;
let chartsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {

    // ── Check Auth ─────────────────────────────────────────
    const userData = localStorage.getItem('bf_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(userData);

    // Set welcome message
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) {
        welcomeEl.textContent = 'Welcome, ' + (currentUser.name || 'User');
    }

    // ── Sidebar Navigation ─────────────────────────────────
    document.querySelectorAll('.sidebar-nav .nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // ── Logout ─────────────────────────────────────────────
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async() => {
            try {
                await fetch('../api/auth.php?action=logout', { method: 'POST' });
            } catch (e) {}
            localStorage.removeItem('bf_user');
            window.location.href = 'login.html';
        });
    }

    // ── Availability Toggle ────────────────────────────────
    const toggleBox = document.getElementById('availabilityToggleBox');
    if (currentUser.user_type === 'donor') {
        toggleBox.classList.remove('d-none');
        const toggle = document.getElementById('availabilityToggle');
        if (toggle) {
            toggle.checked = currentUser.availability == 1;
            toggle.addEventListener('change', function() {
                fetch('../api/profile.php?action=toggle-availability', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ available: this.checked ? 1 : 0 })
                    })
                    .then(r => r.json())
                    .then(data => {
                        const label = document.getElementById('availabilityLabel');
                        label.textContent = data.success ? (toggle.checked ? 'Available' : 'Unavailable') : label.textContent;
                        if (data.success) currentUser.availability = toggle.checked ? 1 : 0;
                    });
            });
        }
    }

    // ── Profile Form ───────────────────────────────────────
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const alertEl = document.getElementById('alertProfile');
            try {
                const res = await fetch('../api/profile.php?action=update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: document.getElementById('pName').value,
                        phone: document.getElementById('pPhone').value,
                        district: document.getElementById('pDistrict').value,
                        upazila: document.getElementById('pUpazila').value,
                        address: document.getElementById('pAddress').value,
                        weight: document.getElementById('pWeight').value,
                        last_donation: document.getElementById('pLastDonation').value
                    })
                });
                const data = await res.json();
                if (data.success) {
                    alertEl.className = 'alert alert-success';
                    alertEl.textContent = data.message;
                    alertEl.classList.remove('d-none');
                    loadProfile();
                } else {
                    alertEl.className = 'alert alert-danger';
                    alertEl.textContent = data.message;
                    alertEl.classList.remove('d-none');
                }
            } catch (err) {
                alertEl.className = 'alert alert-danger';
                alertEl.textContent = 'Connection error.';
                alertEl.classList.remove('d-none');
            }
        });
    }

    // ── Emergency Request Modal Submit ─────────────────────
    const submitReqBtn = document.getElementById('submitRequest');
    if (submitReqBtn) {
        submitReqBtn.addEventListener('click', async() => {
            const modalAlert = document.getElementById('modalAlert');
            const payload = {
                patientName: document.getElementById('mPatientName').value,
                bloodGroup: document.getElementById('mBloodGroup').value,
                units: document.getElementById('mUnits').value,
                urgency: document.getElementById('mUrgency').value,
                hospital: document.getElementById('mHospital').value,
                district: 'Dhaka',
                requiredDate: document.getElementById('mDate').value,
                contactPerson: document.getElementById('mContact').value,
                contactPhone: document.getElementById('mPhone').value,
                notes: document.getElementById('mNotes').value
            };

            if (!payload.patientName || !payload.bloodGroup || !payload.hospital || !payload.contactPerson || !payload.contactPhone) {
                modalAlert.className = 'alert alert-danger';
                modalAlert.textContent = 'Fill all required fields.';
                modalAlert.classList.remove('d-none');
                return;
            }

            try {
                const res = await fetch('../api/requests.php?action=create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                modalAlert.className = `alert alert-${data.success ? 'success' : 'danger'}`;
                modalAlert.textContent = data.message;
                modalAlert.classList.remove('d-none');
                if (data.success) {
                    document.getElementById('bloodRequestForm').reset();
                    setTimeout(() => bootstrap.Modal.getInstance(document.getElementById('requestModal')).hide(), 1500);
                    loadEmergencyList();
                }
            } catch (err) {
                modalAlert.className = 'alert alert-danger';
                modalAlert.textContent = 'Connection error.';
                modalAlert.classList.remove('d-none');
            }
        });
    }

    // ── Load Initial Data ──────────────────────────────────
    loadDashboardStats();
    loadEmergencyList();
    loadLeaderboard();
    loadNotifications();
    loadProfile();

    // Close notification dropdown on outside click
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('notifDropdown');
        const btn = document.getElementById('notifBtn');
        if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.add('d-none');
        }
    });
});

// ── Show Section ──────────────────────────────────────────
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(el => el.classList.remove('active'));

    const sectionEl = document.getElementById(section + '-section');
    const navLink = document.querySelector(`.sidebar-nav .nav-link[data-section="${section}"]`);

    if (sectionEl) sectionEl.classList.remove('d-none');
    if (navLink) navLink.classList.add('active');

    const titles = {
        overview: 'Dashboard Overview',
        donors: 'Find Donors',
        requests: 'Blood Requests',
        hospitals: 'Hospitals',
        donations: 'My Donations',
        profile: 'My Profile',
        analytics: 'Analytics'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    // Lazy load section data
    if (section === 'donors') searchDonors();
    if (section === 'requests') loadRequests();
    if (section === 'hospitals') loadHospitals();
    if (section === 'donations') loadDonationHistory();
    if (section === 'analytics' && !chartsInitialized) {
        loadAnalyticsCharts();
        chartsInitialized = true;
    }
}

// ── Dashboard Stats ───────────────────────────────────────
function loadDashboardStats() {
    fetch('../api/dashboard.php?action=stats')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const d = data.data;
                setText('totalDonorsCount', d.total_donors);
                setText('totalRequestsCount', d.active_requests);
                setText('totalHospitalsCount', d.hospitals);
                setText('livesSavedCount', d.lives_saved);
            }
        })
        .catch(() => {});
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ── Emergency List ────────────────────────────────────────
function loadEmergencyList() {
    const el = document.getElementById('emergencyList');
    fetch('../api/dashboard.php?action=emergency')
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.data.emergencies.length) {
                el.innerHTML = '<p class="text-muted">No emergency requests right now.</p>';
                return;
            }
            el.innerHTML = data.data.emergencies.map(r => {
                const urgClass = r.urgency === 'Emergency' ? 'urgency-emergency' : 'urgency-urgent';
                return `
                    <div class="emergency-item ${urgClass}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <span class="badge bg-danger me-2">${r.blood_group}</span>
                                <span class="badge ${r.urgency==='Emergency'?'bg-danger':'bg-warning text-dark'} me-2">${r.urgency}</span>
                                <strong class="text-white">${r.patient_name}</strong>
                                <span class="text-muted small ms-2">${r.units_needed} unit(s)</span>
                            </div>
                            <small class="text-muted">${timeAgo(r.created_at)}</small>
                        </div>
                        <p class="text-muted small mb-1 mt-1"><i class="fas fa-hospital me-1"></i>${r.hospital_name}, ${r.district}</p>
                        <p class="text-muted small mb-0"><i class="fas fa-phone me-1"></i>${r.contact_person}: ${r.contact_phone}</p>
                    </div>`;
            }).join('');
        })
        .catch(() => { el.innerHTML = '<p class="text-muted">Failed to load.</p>'; });
}

// ── Leaderboard ───────────────────────────────────────────
function loadLeaderboard() {
    const el = document.getElementById('leaderboard');
    fetch('../api/donors.php?action=leaderboard')
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.data.leaders.length) {
                el.innerHTML = '<p class="text-muted">No data yet.</p>';
                return;
            }
            el.innerHTML = data.data.leaders.map((l, i) => {
                const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
                return `
                    <div class="leader-row">
                        <div class="leader-rank ${rankClass}">${i + 1}</div>
                        <div class="donor-avatar" style="width:36px;height:36px;font-size:.85rem;">${l.name.charAt(0)}</div>
                        <div class="flex-grow-1">
                            <strong class="text-white small">${l.name}</strong>
                            <span class="badge bg-danger ms-1" style="font-size:.7rem;">${l.blood_group}</span>
                            <span class="text-muted small d-block">${l.district}</span>
                        </div>
                        <strong class="text-danger">${l.donation_count}</strong>
                        <small class="text-muted">donations</small>
                    </div>`;
            }).join('');
        })
        .catch(() => {});
}

// ── Search Donors ─────────────────────────────────────────
function searchDonors(page = 1) {
    const el = document.getElementById('donorGrid');
    const pagEl = document.getElementById('donorPagination');
    el.innerHTML = '<div class="text-muted text-center col-12 py-4">Searching...</div>';

    const bg = document.getElementById('filterBlood').value;
    const dist = document.getElementById('filterDistrict').value;
    const avail = document.getElementById('filterAvailable').value;

    let url = `../api/donors.php?action=search&page=${page}&per_page=9`;
    if (bg) url += `&blood_group=${encodeURIComponent(bg)}`;
    if (dist) url += `&district=${encodeURIComponent(dist)}`;
    if (avail) url += `&available=${avail}`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                el.innerHTML = `<p class="text-muted text-center col-12">${data.message}</p>`;
                return;
            }
            const donors = data.data.donors;
            if (!donors.length) {
                el.innerHTML = '<div class="text-muted text-center col-12 py-4"><i class="fas fa-user-slash fa-2x mb-2"></i><p>No donors found matching your criteria.</p></div>';
                pagEl.innerHTML = '';
                return;
            }
            el.innerHTML = donors.map(d => `
                <div class="col-md-4 col-sm-6">
                    <div class="donor-card">
                        <div class="d-flex align-items-center gap-3 mb-2">
                            <div class="donor-avatar">${d.name.charAt(0)}</div>
                            <div>
                                <strong class="text-white">${d.name}</strong>
                                <span class="blood-badge ms-1">${d.blood_group}</span>
                                <br><span class="${d.availability ? 'avail-on' : 'avail-off'}"><i class="fas fa-circle" style="font-size:.5rem;"></i> ${d.availability ? 'Available' : 'Unavailable'}</span>
                            </div>
                        </div>
                        <p class="text-muted small mb-1"><i class="fas fa-map-marker-alt me-1 text-danger"></i>${d.district}${d.upazila ? ', ' + d.upazila : ''}</p>
                        <p class="text-muted small mb-1"><i class="fas fa-tint me-1 text-danger"></i>${d.donation_count} donation(s)${d.last_donation ? ' | Last: ' + d.last_donation : ''}</p>
                        <div class="d-flex gap-2 mt-2">
                            <a href="tel:${d.phone}" class="btn btn-danger btn-sm flex-grow-1"><i class="fas fa-phone me-1"></i>Call</a>
                        </div>
                    </div>
                </div>
            `).join('');

            renderPagination(pagEl, data.data.pagination, searchDonors);
        })
        .catch(() => { el.innerHTML = '<p class="text-danger text-center col-12">Connection error.</p>'; });
}

// ── Load Requests ─────────────────────────────────────────
function loadRequests(page = 1) {
    const el = document.getElementById('requestsList');
    const pagEl = document.getElementById('requestsPagination');
    el.innerHTML = '<div class="text-muted text-center py-4">Loading...</div>';

    const bg = document.getElementById('reqFilterBlood').value;
    const urg = document.getElementById('reqFilterUrgency').value;

    let url = `../api/requests.php?action=list&page=${page}&per_page=8`;
    if (bg) url += `&blood_group=${encodeURIComponent(bg)}`;
    if (urg) url += `&urgency=${encodeURIComponent(urg)}`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
            if (!data.success) { el.innerHTML = '<p class="text-muted text-center">No requests.</p>'; return; }
            const reqs = data.data.requests;
            if (!reqs.length) { el.innerHTML = '<p class="text-muted text-center">No requests found.</p>';
                pagEl.innerHTML = ''; return; }

            el.innerHTML = reqs.map(r => {
                const urgClass = r.urgency === 'Emergency' ? 'urgency-emergency' : r.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-normal';
                return `
                    <div class="request-card-item ${urgClass}">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                                <span class="badge bg-danger me-2">${r.blood_group}</span>
                                <span class="badge ${r.urgency==='Emergency'?'bg-danger':r.urgency==='Urgent'?'bg-warning text-dark':'bg-success'} me-2">${r.urgency}</span>
                                <strong class="text-white">${r.patient_name}</strong>
                                <span class="badge ${r.status==='Active'?'bg-primary':r.status==='Fulfilled'?'bg-success':'bg-secondary'} ms-2">${r.status}</span>
                            </div>
                            <small class="text-muted">${timeAgo(r.created_at)}</small>
                        </div>
                        <div class="mt-2">
                            <p class="text-muted small mb-1"><i class="fas fa-hospital me-1"></i>${r.hospital_name}, ${r.district}</p>
                            <p class="text-muted small mb-1"><i class="fas fa-phone me-1"></i>${r.contact_person}: ${r.contact_phone}</p>
                            <p class="text-muted small mb-0"><i class="fas fa-tint me-1"></i>${r.units_needed} unit(s) needed ${r.required_date ? '| By: ' + new Date(r.required_date).toLocaleString() : ''}</p>
                        </div>
                    </div>`;
            }).join('');
            renderPagination(pagEl, data.data.pagination, loadRequests);
        })
        .catch(() => { el.innerHTML = '<p class="text-danger text-center">Connection error.</p>'; });
}

// ── Load Hospitals ────────────────────────────────────────
function loadHospitals() {
    const el = document.getElementById('hospitalGrid');
    el.innerHTML = '<div class="text-muted text-center col-12 py-4">Loading...</div>';

    const dist = document.getElementById('hospFilterDistrict').value;
    const keyword = document.getElementById('hospSearch').value;

    let url = `../api/hospitals.php?action=search`;
    if (dist) url += `&district=${encodeURIComponent(dist)}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

    fetch(url)
        .then(r => r.json())
        .then(data => {
                if (!data.success || !data.data.hospitals.length) {
                    el.innerHTML = '<div class="text-muted text-center col-12 py-4">No hospitals found.</div>';
                    return;
                }
                el.innerHTML = data.data.hospitals.map(h => `
                <div class="col-md-4 col-sm-6">
                    <div class="hospital-card">
                        <h6 class="text-white mb-2"><i class="fas fa-hospital text-primary me-2"></i>${h.name}</h6>
                        <p class="text-muted small mb-1"><i class="fas fa-map-marker-alt me-1 text-danger"></i>${h.district}${h.upazila ? ', ' + h.upazila : ''}</p>
                        ${h.phone ? `<p class="text-muted small mb-1"><i class="fas fa-phone me-1"></i>${h.phone}</p>` : ''}
                        ${h.emergency_phone ? `<p class="text-muted small mb-1"><i class="fas fa-phone-volume me-1 text-danger"></i>Emergency: ${h.emergency_phone}</p>` : ''}
                        <span class="badge ${h.has_blood_bank ? 'bg-success' : 'bg-secondary'} mt-1">${h.has_blood_bank ? 'Has Blood Bank' : 'No Blood Bank'}</span>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => { el.innerHTML = '<p class="text-danger text-center col-12">Connection error.</p>'; });
}

// ── Donation History ──────────────────────────────────────
function loadDonationHistory() {
    const el = document.getElementById('donationHistory');
    el.innerHTML = '<div class="text-muted text-center py-4">Loading...</div>';

    fetch('../api/donations.php?action=history')
        .then(r => r.json())
        .then(data => {
            if (!data.success || !data.data.donations.length) {
                el.innerHTML = '<div class="text-muted text-center py-4"><i class="fas fa-tint fa-2x mb-2"></i><p>No donation records yet. Start donating to save lives!</p></div>';
                return;
            }
            el.innerHTML = data.data.donations.map(d => `
                <div class="donation-item">
                    <div class="donation-icon"><i class="fas fa-tint text-danger"></i></div>
                    <div class="flex-grow-1">
                        <strong class="text-white small">${d.hospital_name}</strong>
                        <p class="text-muted small mb-0">${d.donation_date || 'N/A'} &nbsp;|&nbsp; ${d.units} unit(s) ${d.notes ? '| ' + d.notes : ''}</p>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => { el.innerHTML = '<p class="text-danger text-center">Connection error.</p>'; });
}

// ── Submit Donation ───────────────────────────────────────
function submitDonation() {
    const hospital = document.getElementById('dHospital').value;
    const units = document.getElementById('dUnits').value;
    const date = document.getElementById('dDate').value;
    const notes = document.getElementById('dNotes').value;

    if (!hospital) {
        alert('Hospital name is required.');
        return;
    }

    fetch('../api/donations.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospital_name: hospital, units, donation_date: date || new Date().toISOString().slice(0,10), notes })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            bootstrap.Modal.getInstance(document.getElementById('addDonationModal')).hide();
            document.getElementById('addDonationForm').reset();
            loadDonationHistory();
            if (currentUser) currentUser.donation_count = (currentUser.donation_count || 0) + parseInt(units);
        } else {
            alert(data.message);
        }
    })
    .catch(() => alert('Connection error.'));
}

// ── Load Profile ──────────────────────────────────────────
function loadProfile() {
    fetch('../api/profile.php?action=get')
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const u = data.data.user;

            setText('pName', u.name);
            setText('pPhone', u.phone || '');
            setText('pDistrict', u.district || '');
            setText('pUpazila', u.upazila || '');
            setText('pAddress', u.address || '');
            setText('pWeight', u.weight || '');
            setText('pLastDonation', u.last_donation || '');

            setText('profileName', u.name);
            setText('profileBloodGroup', u.blood_group || 'N/A');
            setText('profileType', u.user_type ? u.user_type.charAt(0).toUpperCase() + u.user_type.slice(1) : '');
            setText('profileLocation', (u.district || '') + (u.upazila ? ', ' + u.upazila : ''));
            setText('profilePhone', u.phone || 'N/A');
            setText('profileDonations', u.donation_count || 0);

            const avatar = document.getElementById('profileAvatar');
            if (avatar) avatar.textContent = u.name ? u.name.charAt(0).toUpperCase() : '?';
        })
        .catch(() => {});
}

// ── Notifications ─────────────────────────────────────────
function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.classList.toggle('d-none');
    loadNotifications();
}

function loadNotifications() {
    fetch('../api/notifications.php?action=list')
        .then(r => r.json())
        .then(data => {
            const list = document.getElementById('notifList');
            if (!data.success || !data.data.notifications.length) {
                list.innerHTML = '<div class="p-3 text-muted text-center small">No notifications</div>';
                return;
            }
            list.innerHTML = data.data.notifications.map(n => `
                <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="markRead(${n.id})">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-msg">${n.message}</div>
                    <div class="notif-time">${timeAgo(n.created_at)}</div>
                </div>
            `).join('');
        })
        .catch(() => {});

    // Update badge
    fetch('../api/notifications.php?action=unread-count')
        .then(r => r.json())
        .then(data => {
            const badge = document.getElementById('notifBadge');
            if (data.success && data.data.count > 0) {
                badge.textContent = data.data.count > 9 ? '9+' : data.data.count;
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        })
        .catch(() => {});
}

function markRead(id) {
    fetch('../api/notifications.php?action=mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    }).catch(() => {});
    loadNotifications();
}

function markAllRead() {
    fetch('../api/notifications.php?action=mark-all-read', { method: 'POST' })
        .then(() => loadNotifications())
        .catch(() => {});
}

// ── Analytics Charts ──────────────────────────────────────
function loadAnalyticsCharts() {
    fetch('../api/admin.php?action=analytics')
        .then(r => r.json())
        .then(data => {
            if (!data.success) return;
            const d = data.data;

            const chartColors = ['#dc3545','#0d6efd','#198754','#ffc107','#6f42c1','#fd7e14','#20c997','#0dcaf0'];

            // Blood Group Distribution (Doughnut)
            new Chart(document.getElementById('bloodGroupChart'), {
                type: 'doughnut',
                data: {
                    labels: d.blood_groups.labels,
                    datasets: [{ data: d.blood_groups.data, backgroundColor: chartColors }]
                },
                options: { responsive: true, plugins: { legend: { labels: { color: '#ccc' } } } }
            });

            // Monthly Donations (Bar)
            new Chart(document.getElementById('donationsChart'), {
                type: 'bar',
                data: {
                    labels: d.monthly.labels,
                    datasets: [{ label: 'Donations', data: d.monthly.data, backgroundColor: '#dc3545' }]
                },
                options: { responsive: true, scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#888' } } }, plugins: { legend: { labels: { color: '#ccc' } } } }
            });

            // Urgency Breakdown (Pie)
            new Chart(document.getElementById('urgencyChart'), {
                type: 'pie',
                data: {
                    labels: d.urgency.labels,
                    datasets: [{ data: d.urgency.data, backgroundColor: ['#dc3545','#ffc107','#198754'] }]
                },
                options: { responsive: true, plugins: { legend: { labels: { color: '#ccc' } } } }
            });

            // Top Districts (Horizontal Bar)
            new Chart(document.getElementById('districtChart'), {
                type: 'bar',
                data: {
                    labels: d.districts.labels,
                    datasets: [{ label: 'Donors', data: d.districts.data, backgroundColor: '#0d6efd' }]
                },
                options: {
                    indexAxis: 'y', responsive: true,
                    scales: { x: { ticks: { color: '#888' } }, y: { ticks: { color: '#ccc' } } },
                    plugins: { legend: { labels: { color: '#ccc' } } }
                }
            });
        })
        .catch(() => {});
}

// ── Pagination Helper ─────────────────────────────────────
function renderPagination(container, pagination, callback) {
    if (!container) return;
    const { page, total_pages } = pagination;
    if (total_pages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    if (page > 1) html += `<button class="page-btn" onclick="arguments[0].stopPropagation();(${callback.name})(${page - 1})">Prev</button>`;
    for (let i = 1; i <= total_pages; i++) {
        if (i === 1 || i === total_pages || (i >= page - 1 && i <= page + 1)) {
            html += `<button class="page-btn ${i === page ? 'active'