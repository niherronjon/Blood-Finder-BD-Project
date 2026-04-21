/**
 * BloodFinder BD — Homepage JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {

    // ── Animated Counter ───────────────────────────────────
    function animateCounter(el, target, duration) {
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                start = target;
                clearInterval(timer);
            }
            el.textContent = start.toLocaleString();
        }, 16);
    }

    // ── Load Donor Count ───────────────────────────────────
    fetch('api/donors.php?action=count')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                animateCounter(document.getElementById('donorCount'), data.data.count, 2000);
            }
        })
        .catch(() => {
            document.getElementById('donorCount').textContent = '2,500+';
        });

    // ── Load Emergency Count ───────────────────────────────
    fetch('api/requests.php?action=stats')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                const badge = document.getElementById('emergencyBadge');
                const count = document.getElementById('emergencyCount');
                if (data.data.emergency > 0) {
                    count.textContent = data.data.emergency;
                    badge.style.display = 'inline-block !important';
                    badge.style.cssText = 'display:inline-block !important;';
                }
            }
        })
        .catch(() => {});

    // ── Blood Group Cards ──────────────────────────────────
    const compatibility = {
        'A+': { give: 'A+, AB+', receive: 'A+, A-, O+, O-' },
        'A-': { give: 'A+, A-, AB+, AB-', receive: 'A-, O-' },
        'B+': { give: 'B+, AB+', receive: 'B+, B-, O+, O-' },
        'B-': { give: 'B+, B-, AB+, AB-', receive: 'B-, O-' },
        'AB+': { give: 'AB+', receive: 'A+, A-, B+, B-, AB+, AB-, O+, O-' },
        'AB-': { give: 'AB+, AB-', receive: 'A-, B-, AB-, O-' },
        'O+': { give: 'A+, B+, AB+, O+', receive: 'O+, O-' },
        'O-': { give: 'All', receive: 'O-' }
    };

    const container = document.getElementById('bloodGroupCards');
    if (container) {
        Object.keys(compatibility).forEach(bg => {
            const info = compatibility[bg];
            container.innerHTML += `
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <div class="blood-group-card">
                        <span class="blood-group-badge">${bg}</span>
                        <p class="text-muted small mb-1"><i class="fas fa-arrow-up text-success me-1"></i>Can Give: <strong class="text-light">${info.give}</strong></p>
                        <p class="text-muted small mb-0"><i class="fas fa-arrow-down text-danger me-1"></i>Can Receive: <strong class="text-light">${info.receive}</strong></p>
                    </div>
                </div>
            `;
        });
    }

    // ── Requests Ticker ────────────────────────────────────
    const tickerEl = document.getElementById('requestsTicker');
    if (tickerEl) {
        fetch('api/dashboard.php?action=ticker')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    tickerEl.textContent = data.data.ticker;
                } else {
                    tickerEl.textContent = 'No active requests at this time.';
                }
            })
            .catch(() => {
                tickerEl.textContent = 'Connecting to server...';
            });
    }
});

// ── Quick Search ──────────────────────────────────────────
function quickSearch() {
    const bloodGroup = document.getElementById('searchBlood').value;
    const district = document.getElementById('searchDistrict').value;
    const resultsEl = document.getElementById('quickSearchResults');

    if (!bloodGroup || !district) {
        resultsEl.innerHTML = '<p class="text-danger text-center">Please select both blood group and district.</p>';
        return;
    }

    resultsEl.innerHTML = '<p class="text-muted text-center">Searching...</p>';

    fetch(`api/donors.php?action=quick&blood_group=${encodeURIComponent(bloodGroup)}&district=${encodeURIComponent(district)}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                resultsEl.innerHTML = `<p class="text-danger text-center">${data.message}</p>`;
                return;
            }
            const donors = data.data.donors;
            if (donors.length === 0) {
                resultsEl.innerHTML = `
                    <div class="text-center text-muted py-3">
                        <i class="fas fa-search fa-2x mb-2"></i>
                        <p>No available ${bloodGroup} donors found in ${district}.</p>
                    </div>`;
                return;
            }
            resultsEl.innerHTML = donors.map(d => `
                <div class="donor-quick-card">
                    <div class="donor-avatar-sm">${d.name.charAt(0)}</div>
                    <div class="flex-grow-1">
                        <strong class="text-white">${d.name}</strong>
                        <span class="badge bg-danger ms-2">${d.blood_group}</span>
                        <span class="available-dot bg-success ms-2"></span>
                        <span class="text-success small">Available</span>
                        <p class="text-muted small mb-0">${d.district}${d.upazila ? ', ' + d.upazila : ''} &nbsp;|&nbsp; <i class="fas fa-phone"></i> ${d.phone} &nbsp;|&nbsp; <i class="fas fa-tint"></i> ${d.donation_count} donation(s)</p>
                    </div>
                    <a href="tel:${d.phone}" class="btn btn-danger btn-sm"><i class="fas fa-phone"></i></a>
                </div>
            `).join('');
        })
        .catch(() => {
            resultsEl.innerHTML = '<p class="text-danger text-center">Connection error. Try again.</p>';
        });
}