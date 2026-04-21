/**
 * BloodFinder BD — Admin Dashboard JavaScript
 */

let adminChartsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {

    // ── Check Admin Auth ───────────────────────────────────
    const userData = localStorage.getItem('bf_user');
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userData);
    if (user.user_type !== 'admin') {
        window.location.href = 'donor-dashboard.html';
        return;
    }

    document.getElementById('adminName').textContent = user.name;

    // ── Sidebar Navigation ─────────────────────────────────
    document.querySelectorAll('.admin-nav a[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showAdminSection(section);
        });
    });

    // ── Logout ─────────────────────────────────────────────
    document.getElementById('adminLogout').addEventListener('click', async() => {
        try {
            await fetch('../api/auth.php?action=logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('bf_user');
        window.location.href = 'login.html';
    });

    // ── Add Hospital Form Prevent Default ──────────────────
    const hospitalForm = document.getElementById('addHospitalForm');
    if (hospitalForm) {
        hospitalForm.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    }

    // ── Load Initial Data ──────────────────────────────────
    loadAdminStats();
    loadRecentUsers();
    loadRecentRequests();
});

// ── Show Admin Section ────────────────────────────────────
function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
    document.querySelectorAll('.admin-nav a').forEach(el => el.classList.remove('active'));

    const sectionEl = document.getElementById(section + '-section');
    const navLink = document.querySelector('.admin-nav a[data-section="' + section + '"]');

    if (sectionEl) sectionEl.classList.remove('d-none');
    if (navLink) navLink.classList.add('active');

    // Lazy load section data
    if (section === 'users') adminLoadUsers();
    if (section === 'requests') adminLoadRequests();
    if (section === 'hospitals') adminLoadHospitals();
    if (section === 'donations') adminLoadDonations();
    if (section === 'analytics' && !adminChartsInitialized) {
        loadAdminCharts();
        adminChartsInitialized = true;
    }
}

// ── Admin Stats ───────────────────────────────────────────
function loadAdminStats() {
    fetch('../api/admin.php?action=admin-stats')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) return;
            var d = data.data;
            var row = document.getElementById('adminStatsRow');
            row.innerHTML =
                '<div class="col-md-3 col-sm-6 mb-3">' +
                '<div class="admin-stat-card">' +
                '<div class="admin-stat-icon" style="background:rgba(13,110,253,.15);color:#6ea8fe;"><i class="fas fa-users"></i></div>' +
                '<div><h3>' + d.total_users + '</h3><p>Total Users</p></div>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-3 col-sm-6 mb-3">' +
                '<div class="admin-stat-card">' +
                '<div class="admin-stat-icon" style="background:rgba(220,53,69,.15);color:#f1707a;"><i class="fas fa-hand-holding-medical"></i></div>' +
                '<div><h3>' + d.active_requests + '</h3><p>Active Requests</p></div>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-3 col-sm-6 mb-3">' +
                '<div class="admin-stat-card">' +
                '<div class="admin-stat-icon" style="background:rgba(40,167,69,.15);color:#5cb85c;"><i class="fas fa-hospital"></i></div>' +
                '<div><h3>' + d.total_hospitals + '</h3><p>Hospitals</p></div>' +
                '</div>' +
                '</div>' +
                '<div class="col-md-3 col-sm-6 mb-3">' +
                '<div class="admin-stat-card">' +
                '<div class="admin-stat-icon" style="background:rgba(255,193,7,.15);color:#ffc107;"><i class="fas fa-tint"></i></div>' +
                '<div><h3>' + d.total_donations + '</h3><p>Total Donations</p></div>' +
                '</div>' +
                '</div>';
        })
        .catch(function() {});
}

// ── Recent Users ──────────────────────────────────────────
function loadRecentUsers() {
    var el = document.getElementById('recentUsers');
    fetch('../api/dashboard.php?action=recent-users')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.data.users.length) {
                el.innerHTML = '<p class="text-muted small">No users yet.</p>';
                return;
            }
            el.innerHTML = data.data.users.map(function(u) {
                return '<div class="recent-item">' +
                    '<div class="recent-dot"></div>' +
                    '<div style="flex-grow:1;">' +
                    '<div class="recent-item-name">' + u.name + ' <span class="badge bg-secondary" style="font-size:.65rem;">' + u.user_type + '</span></div>' +
                    '<div class="recent-item-meta">' + u.email + ' | ' + (u.blood_group || 'N/A') + ' | ' + (u.district || 'N/A') + '</div>' +
                    '</div>' +
                    '<span class="status-badge status-' + u.status + '">' + u.status + '</span>' +
                    '</div>';
            }).join('');
        })
        .catch(function() {
            el.innerHTML = '<p class="text-muted small">Failed to load.</p>';
        });
}

// ── Recent Requests ───────────────────────────────────────
function loadRecentRequests() {
    var el = document.getElementById('recentRequests');
    fetch('../api/dashboard.php?action=recent-requests')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.data.requests.length) {
                el.innerHTML = '<p class="text-muted small">No requests yet.</p>';
                return;
            }
            el.innerHTML = data.data.requests.map(function(r) {
                var dotColor = r.urgency === 'Emergency' ? '#dc3545' : r.urgency === 'Urgent' ? '#ffc107' : '#198754';
                return '<div class="recent-item">' +
                    '<div class="recent-dot" style="background:' + dotColor + ';"></div>' +
                    '<div style="flex-grow:1;">' +
                    '<div class="recent-item-name">' + r.patient_name + ' <span class="badge bg-danger" style="font-size:.65rem;">' + r.blood_group + '</span></div>' +
                    '<div class="recent-item-meta">' + r.hospital_name + ' | ' + r.urgency + '</div>' +
                    '</div>' +
                    '<span class="status-badge status-' + r.status.toLowerCase() + '">' + r.status + '</span>' +
                    '</div>';
            }).join('');
        })
        .catch(function() {
            el.innerHTML = '<p class="text-muted small">Failed to load.</p>';
        });
}

// ── Admin Users List ──────────────────────────────────────
function adminLoadUsers(page) {
    if (!page) page = 1;
    var el = document.getElementById('usersTableBody');
    var pagEl = document.getElementById('usersPagination');
    el.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Loading...</td></tr>';

    var typeFilter = document.getElementById('userTypeFilter');
    var searchInput = document.getElementById('userSearchInput');
    var type = typeFilter ? typeFilter.value : '';
    var keyword = searchInput ? searchInput.value : '';

    var url = '../api/admin.php?action=users&page=' + page + '&per_page=10';
    if (type) url += '&user_type=' + encodeURIComponent(type);
    if (keyword) url += '&keyword=' + encodeURIComponent(keyword);

    fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) {
                el.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No users found.</td></tr>';
                return;
            }
            var users = data.data.users;
            if (!users.length) {
                el.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No users found.</td></tr>';
                pagEl.innerHTML = '';
                return;
            }

            el.innerHTML = users.map(function(u) {
                var actionBtns = '';
                if (u.status === 'banned') {
                    actionBtns = '<button class="btn-action btn-unban" onclick="adminUnbanUser(' + u.id + ')">Unban</button> ';
                } else {
                    actionBtns = '<button class="btn-action btn-ban" onclick="adminBanUser(' + u.id + ')">Ban</button> ';
                }
                if (u.user_type !== 'admin') {
                    actionBtns += '<button class="btn-action btn-del" onclick="adminDeleteUser(' + u.id + ')">Delete</button>';
                } else {
                    actionBtns += '<span class="text-muted small">—</span>';
                }

                return '<tr>' +
                    '<td>' + u.id + '</td>' +
                    '<td class="text-white">' + u.name + '</td>' +
                    '<td>' + u.email + '</td>' +
                    '<td>' + (u.phone || '—') + '</td>' +
                    '<td><span class="badge bg-danger">' + (u.blood_group || 'N/A') + '</span></td>' +
                    '<td>' + u.user_type + '</td>' +
                    '<td>' + (u.district || '—') + '</td>' +
                    '<td><span class="status-badge status-' + u.status + '">' + u.status + '</span></td>' +
                    '<td>' + actionBtns + '</td>' +
                    '</tr>';
            }).join('');

            renderAdminPagination(pagEl, data.data.pagination, 'adminLoadUsers');
        })
        .catch(function() {
            el.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Connection error.</td></tr>';
        });
}

// ── Ban User ──────────────────────────────────────────────
function adminBanUser(id) {
    if (!confirm('Are you sure you want to ban this user?')) return;
    fetch('../api/admin.php?action=ban-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            alert(d.message);
            if (d.success) adminLoadUsers();
        })
        .catch(function() { alert('Connection error.'); });
}

// ── Unban User ────────────────────────────────────────────
function adminUnbanUser(id) {
    fetch('../api/admin.php?action=unban-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            alert(d.message);
            if (d.success) adminLoadUsers();
        })
        .catch(function() { alert('Connection error.'); });
}

// ── Delete User ───────────────────────────────────────────
function adminDeleteUser(id) {
    if (!confirm('PERMANENTLY delete this user? This cannot be undone!')) return;
    fetch('../api/admin.php?action=delete-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            alert(d.message);
            if (d.success) adminLoadUsers();
        })
        .catch(function() { alert('Connection error.'); });
}

// ── Admin Requests List ───────────────────────────────────
function adminLoadRequests(page) {
    if (!page) page = 1;
    var el = document.getElementById('requestsTableBody');
    el.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Loading...</td></tr>';

    var statusFilter = document.getElementById('reqStatusFilter');
    var bloodFilter = document.getElementById('reqBloodFilter');
    var status = statusFilter ? statusFilter.value : '';
    var blood = bloodFilter ? bloodFilter.value : '';

    var url = '../api/admin.php?action=requests&page=' + page + '&per_page=10';
    if (status) url += '&status=' + encodeURIComponent(status);
    if (blood) url += '&blood_group=' + encodeURIComponent(blood);

    fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.data.requests.length) {
                el.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No requests found.</td></tr>';
                return;
            }

            el.innerHTML = data.data.requests.map(function(r) {
                var statusBtn = '<span class="text-muted small">—</span>';
                if (r.status === 'Active') {
                    statusBtn = '<select class="form-select form-select-sm" style="width:120px;font-size:.75rem;" onchange="adminUpdateReqStatus(' + r.id + ', this.value)">' +
                        '<option value="">Change...</option>' +
                        '<option value="Fulfilled">Fulfilled</option>' +
                        '<option value="Cancelled">Cancelled</option>' +
                        '</select>';
                }

                return '<tr>' +
                    '<td>' + r.id + '</td>' +
                    '<td class="text-white">' + r.patient_name + '</td>' +
                    '<td><span class="badge bg-danger">' + r.blood_group + '</span></td>' +
                    '<td>' + r.units_needed + '</td>' +
                    '<td class="urgency-' + r.urgency.toLowerCase() + '">' + r.urgency + '</td>' +
                    '<td>' + r.hospital_name + '</td>' +
                    '<td>' + r.contact_phone + '</td>' +
                    '<td><span class="status-badge status-' + r.status.toLowerCase() + '">' + r.status + '</span></td>' +
                    '<td class="small">' + new Date(r.created_at).toLocaleDateString() + '</td>' +
                    '<td>' + statusBtn + '</td>' +
                    '</tr>';
            }).join('');
        })
        .catch(function() {
            el.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Connection error.</td></tr>';
        });
}

// ── Update Request Status ─────────────────────────────────
function adminUpdateReqStatus(id, status) {
    if (!status) return;
    fetch('../api/requests.php?action=update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, status: status })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            alert(d.message);
            if (d.success) adminLoadRequests();
        })
        .catch(function() { alert('Connection error.'); });
}

// ── Admin Hospitals ───────────────────────────────────────
function adminLoadHospitals() {
    var el = document.getElementById('hospitalsTableBody');
    el.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Loading...</td></tr>';

    fetch('../api/admin.php?action=hospitals')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success || !data.data.hospitals.length) {
                el.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hospitals found.</td></tr>';
                return;
            }

            el.innerHTML = data.data.hospitals.map(function(h) {
                var bbStatus = h.has_blood_bank == 1 ?
                    '<span class="text-success">Yes</span>' :
                    '<span class="text-muted">No</span>';

                return '<tr>' +
                    '<td>' + h.id + '</td>' +
                    '<td class="text-white">' + h.name + '</td>' +
                    '<td>' + h.district + '</td>' +
                    '<td>' + (h.phone || '—') + '</td>' +
                    '<td>' + (h.emergency_phone || '—') + '</td>' +
                    '<td>' + bbStatus + '</td>' +
                    '<td><button class="btn-action btn-del" onclick="adminDeleteHospital(' + h.id + ')">Remove</button></td>' +
                    '</tr>';
            }).join('');
        })
        .catch(function() {
            el.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Connection error.</td></tr>';
        });
}

// ── Submit Add Hospital ───────────────────────────────────
function submitAddHospital() {
    var nameEl = document.getElementById('hName');
    var districtEl = document.getElementById('hDistrict');
    var upazilaEl = document.getElementById('hUpazila');
    var phoneEl = document.getElementById('hPhone');
    var emgPhoneEl = document.getElementById('hEmgPhone');
    var emailEl = document.getElementById('hEmail');
    var bbEl = document.getElementById('hBloodBank');
    var alertEl = document.getElementById('hospitalAlert');

    var name = nameEl.value.trim();
    var district = districtEl.value;
    var upazila = upazilaEl.value.trim();
    var phone = phoneEl.value.trim();
    var emgPhone = emgPhoneEl.value.trim();
    var email = emailEl.value.trim();
    var hasBB = bbEl.checked ? 1 : 0;

    if (!name || !district) {
        alertEl.className = 'alert alert-danger';
        alertEl.textContent = 'Hospital name and district are required.';
        alertEl.classList.remove('d-none');
        return;
    }

    fetch('../api/hospitals.php?action=create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                district: district,
                upazila: upazila,
                phone: phone,
                emergency_phone: emgPhone,
                email: email,
                has_blood_bank: hasBB
            })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            alertEl.className = 'alert alert-' + (data.success ? 'success' : 'danger');
            alertEl.textContent = data.message;
            alertEl.classList.remove('d-none');

            if (data.success) {
                document.getElementById('addHospitalForm').reset();
                setTimeout(function() {
                    var modal = bootstrap.Modal.getInstance(document.getElementById('addHospitalModal'));
                    if (modal) modal.hide();
                }, 1000);
                adminLoadHospitals();
            }
        })
        .catch(function() {
            alertEl.className = 'alert alert-danger';
            alertEl.textContent = 'Connection error.';
            alertEl.classList.remove('d-none');
        });
}

// ── Delete Hospital ───────────────────────────────────────
function adminDeleteHospital(id) {
    if (!confirm('Remove this hospital from the system?')) return;
    fetch('../api/hospitals.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(function(r) { return r.json(); })
        .then(function(d) {
            alert(d.message);
            if (d.success) adminLoadHospitals();
        })
        .catch(function() { alert('Connection error.'); });
}

// ── Admin Donations List ──────────────────────────────────
function adminLoadDonations() {
    // Placeholder — donations are visible in donor dashboard
    // Admin can see donation stats in analytics section
}

// ── Admin Analytics Charts ────────────────────────────────
function loadAdminCharts() {
    fetch('../api/admin.php?action=analytics')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.success) return;
            var d = data.data;
            var colors = ['#dc3545', '#0d6efd', '#198754', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#0dcaf0'];

            // Blood Group Distribution (Doughnut)
            var ctx1 = document.getElementById('adminBloodChart');
            if (ctx1) {
                new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: d.blood_groups.labels,
                        datasets: [{ data: d.blood_groups.data, backgroundColor: colors }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { labels: { color: '#ccc', font: { size: 12 } } },
                            title: { display: true, text: 'Blood Group Distribution', color: '#fff', font: { size: 14 } }
                        }
                    }
                });
            }

            // Monthly Donations (Bar)
            var ctx2 = document.getElementById('adminMonthlyChart');
            if (ctx2) {
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: d.monthly.labels,
                        datasets: [{ label: 'Donations', data: d.monthly.data, backgroundColor: '#dc3545', borderRadius: 4 }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,.05)' } },
                            y: { ticks: { color: '#888', stepSize: 1 }, grid: { color: 'rgba(255,255,255,.05)' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#ccc' } },
                            title: { display: true, text: 'Monthly Donations (Last 12 Months)', color: '#fff', font: { size: 14 } }
                        }
                    }
                });
            }

            // Urgency Breakdown (Pie)
            var ctx3 = document.getElementById('adminUrgencyChart');
            if (ctx3) {
                new Chart(ctx3, {
                    type: 'pie',
                    data: {
                        labels: d.urgency.labels,
                        datasets: [{ data: d.urgency.data, backgroundColor: ['#dc3545', '#ffc107', '#198754'] }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { labels: { color: '#ccc', font: { size: 12 } } },
                            title: { display: true, text: 'Request Urgency Breakdown', color: '#fff', font: { size: 14 } }
                        }
                    }
                });
            }

            // Top Districts (Horizontal Bar)
            var ctx4 = document.getElementById('adminDistrictChart');
            if (ctx4) {
                new Chart(ctx4, {
                    type: 'bar',
                    data: {
                        labels: d.districts.labels,
                        datasets: [{ label: 'Donors', data: d.districts.data, backgroundColor: '#0d6efd', borderRadius: 4 }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        scales: {
                            x: { ticks: { color: '#888', stepSize: 1 }, grid: { color: 'rgba(255,255,255,.05)' } },
                            y: { ticks: { color: '#ccc' }, grid: { display: false } }
                        },
                        plugins: {
                            legend: { labels: { color: '#ccc' } },
                            title: { display: true, text: 'Top Districts by Donors', color: '#fff', font: { size: 14 } }
                        }
                    }
                });
            }
        })
        .catch(function() {
            console.error('Failed to load analytics data.');
        });
}

// ── Admin Pagination Helper ───────────────────────────────
function renderAdminPagination(container, pagination, callbackName) {
    if (!container) return;
    var page = pagination.page;
    var total = pagination.total_pages;
    if (total <= 1) {
        container.innerHTML = '';
        return;
    }

    var html = '';

    // Previous button
    if (page > 1) {
        html += '<button class="page-btn" onclick="' + callbackName + '(' + (page - 1) + ')">Prev</button>';
    }

    // Page numbers
    for (var i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= page - 1 && i <= page + 1)) {
            var activeClass = i === page ? ' active' : '';
            html += '<button class="page-btn' + activeClass + '" onclick="' + callbackName + '(' + i + ')">' + i + '</button>';
        } else if (i === page - 2 || i === page + 2) {
            html += '<span class="text-muted px-1">...</span>';
        }
    }

    // Next button
    if (page < total) {
        html += '<button class="page-btn" onclick="' + callbackName + '(' + (page + 1) + ')">Next</button>';
    }

    container.innerHTML = html;
}

// ── Time Ago Helper ───────────────────────────────────────
function timeAgo(dateStr) {
    var now = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString();
}