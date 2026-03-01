// Dashboard Controller
class DashboardController {
    constructor() {
        this.currentSection = 'overview';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadOverviewData();
        this.populateHospitalDropdown();
        this.checkUserAuth();
    }

    bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Search forms
        const donorSearchForm = document.getElementById('donorSearchForm');
        if (donorSearchForm) {
            donorSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchDonors();
            });
        }

        const hospitalSearchForm = document.getElementById('hospitalSearchForm');
        if (hospitalSearchForm) {
            hospitalSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchHospitals();
            });
        }

        // Blood request form
        const submitRequestBtn = document.getElementById('submitRequest');
        if (submitRequestBtn) {
            submitRequestBtn.addEventListener('click', () => {
                this.submitBloodRequest();
            });
        }

        // Emergency button
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.handleEmergencyRequest();
            });
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Update active nav link
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update page title
        const titles = {
            'overview': 'Dashboard Overview',
            'donors': 'Find Blood Donors',
            'requests': 'Blood Requests',
            'hospitals': 'Hospital Directory',
            'profile': 'My Profile',
            'analytics': 'System Analytics'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'donors':
                this.loadDonorsSection();
                break;
            case 'requests':
                this.loadBloodRequests();
                break;
            case 'hospitals':
                this.loadHospitals();
                break;
            case 'profile':
                this.loadProfile();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    checkUserAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Update welcome message
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.name}`;
        }
    }

    loadOverviewData() {
        const stats = window.crud.getDonationStats();

        document.getElementById('totalDonorsCount').textContent = stats.totalDonors;
        document.getElementById('totalRequestsCount').textContent = stats.totalRequests;
        document.getElementById('livesSavedCount').textContent = stats.totalDonations * 3;

        // Load recent activity
        this.loadRecentActivity();
    }

    loadRecentActivity() {
        const recentRequests = window.crud.getAllBloodRequests()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const recentActivity = document.getElementById('recentActivity');

        if (recentRequests.length === 0) {
            recentActivity.innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }

        const activityHTML = recentRequests.map(request => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <strong>${request.patientName}</strong> needs <span class="badge bg-danger">${request.bloodGroup}</span>
                    <br><small class="text-muted">${request.hospitalName} - ${request.urgency}</small>
                </div>
                <small class="text-muted">${this.formatTimeAgo(request.createdAt)}</small>
            </div>
        `).join('');

        recentActivity.innerHTML = activityHTML;
    }

    searchDonors() {
        const criteria = {
            bloodGroup: document.getElementById('searchBloodGroup').value,
            district: document.getElementById('searchDistrict').value,
            eligibleOnly: document.getElementById('eligibleOnly').checked
        };

        const donors = window.crud.searchDonors(criteria);
        this.displayDonors(donors);
    }

    displayDonors(donors) {
        const donorResults = document.getElementById('donorResults');

        if (donors.length === 0) {
            donorResults.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No donors found matching your criteria.
                    Try adjusting your search parameters.
                </div>
            `;
            return;
        }

        const donorsHTML = donors.map(donor => `
            <div class="card donor-card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                ${donor.name}
                                <span class="badge bg-danger ms-2">${donor.bloodGroup}</span>
                            </h5>
                            <p class="card-text">
                                <i class="fas fa-map-marker-alt text-muted me-1"></i>
                                ${donor.location.district}, ${donor.location.upazila}
                            </p>
                            <p class="card-text">
                                <small class="text-muted">
                                    Last donation: ${donor.medicalInfo.lastDonation ? 
                                        this.formatDate(donor.medicalInfo.lastDonation) : 'Never'}
                                </small>
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="mb-2">
                                <span class="badge ${window.crud.isEligibleToDonate(donor) ? 'bg-success' : 'bg-warning'}">
                                    ${window.crud.isEligibleToDonate(donor) ? 'Eligible' : 'Not Eligible'}
                                </span>
                            </div>
                            <button class="btn btn-outline-danger btn-sm" onclick="this.contactDonor('${donor.id}')">
                                <i class="fas fa-phone"></i> Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        donorResults.innerHTML = `
            <div class="mb-3">
                <h5>Found ${donors.length} donor(s)</h5>
            </div>
            ${donorsHTML}
        `;
    }

    searchHospitals() {
        const criteria = {
            district: document.getElementById('hospitalDistrict').value,
            type: document.getElementById('hospitalType').value,
            bloodBankOnly: true
        };

        const hospitals = window.crud.searchHospitals(criteria);
        this.displayHospitals(hospitals);
    }

    displayHospitals(hospitals) {
            const hospitalResults = document.getElementById('hospitalResults');

            if (hospitals.length === 0) {
                hospitalResults.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No hospitals found matching your criteria.
                </div>
            `;
                return;
            }

            const hospitalsHTML = hospitals.map(hospital => `
            <div class="card hospital-card mb-3">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                ${hospital.name}
                                <span class="badge bg-${hospital.type === 'Government' ? 'primary' : 'success'} ms-2">
                                    ${hospital.type}
                                </span>
                            </h5>
                            <p class="card-text">
                                <i class="fas fa-map-marker-alt text-muted me-1"></i>
                                ${hospital.address}
                            </p>
                            <p class="card-text">
                                <i class="fas fa-phone text-muted me-1"></i>
                                ${hospital.contact}
                                ${hospital.emergency ? `| Emergency: ${hospital.emergency}` : ''}
                            </p>
                            ${hospital.specialties ? `
                                <p class="card-text">
                                    <small class="text-muted">
                                        Specialties: ${hospital.specialties.join(', ')}
                                    </small>
                                </p>
                            ` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="mb-2">
                                ${hospital.bloodBank ? '<span class="badge bg-danger">Blood Bank Available</span>' : ''}
                            </div>
                            <div>
                                <button class="btn btn-outline-primary btn-sm me-2">
                                    <i class="fas fa-directions"></i> Directions
                                </button>
                                <button class="btn btn-outline-success btn-sm">
                                    <i class="fas fa-phone"></i> Call
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        hospitalResults.innerHTML = `
            <div class="mb-3">
                <h5>Found ${hospitals.length} hospital(s) with blood banks</h5>
            </div>
            ${hospitalsHTML}
        `;
    }

    loadBloodRequests() {
        const requests = window.crud.getAllBloodRequests()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const requestsList = document.getElementById('bloodRequestsList');
        
        if (requests.length === 0) {
            requestsList.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No blood requests found.
                </div>
            `;
            return;
        }

        const requestsHTML = requests.map(request => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title">
                                ${request.patientName}
                                <span class="badge bg-danger ms-2">${request.bloodGroup}</span>
                                <span class="badge bg-${this.getUrgencyColor(request.urgency)} ms-1">
                                    ${request.urgency.toUpperCase()}
                                </span>
                            </h5>
                            <p class="card-text">
                                <i class="fas fa-hospital text-muted me-1"></i>
                                ${request.hospitalName}
                            </p>
                            <p class="card-text">
                                <i class="fas fa-tint text-muted me-1"></i>
                                ${request.unitsNeeded} unit(s) needed
                            </p>
                            <p class="card-text">
                                <small class="text-muted">
                                    Contact: ${request.contactPerson} (${request.contactPhone})
                                </small>
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="mb-2">
                                <span class="badge bg-${this.getStatusColor(request.status)}">
                                    ${request.status.toUpperCase()}
                                </span>
                            </div>
                            <small class="text-muted">
                                ${this.formatTimeAgo(request.createdAt)}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        requestsList.innerHTML = requestsHTML;
    }

    submitBloodRequest() {
        const requestData = {
            patientName: document.getElementById('patientName').value,
            bloodGroup: document.getElementById('requestBloodGroup').value,
            unitsNeeded: parseInt(document.getElementById('unitsNeeded').value),
            urgency: document.getElementById('urgency').value,
            hospitalName: document.getElementById('hospitalName').value,
            requiredDate: document.getElementById('requiredDate').value,
            contactPerson: document.getElementById('contactPerson').value,
            contactPhone: document.getElementById('contactPhone').value,
            additionalNotes: document.getElementById('additionalNotes').value,
            requesterId: JSON.parse(localStorage.getItem('currentUser')).id
        };

        // Validation
        if (!this.validateBloodRequest(requestData)) {
            return;
        }

        // Create request
        const newRequest = window.crud.createBloodRequest(requestData);
        
        if (newRequest) {
            showAlert('Blood request submitted successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('requestModal'));
            modal.hide();
            
            // Reset form
            document.getElementById('bloodRequestForm').reset();
            
            // Refresh requests if on requests section
            if (this.currentSection === 'requests') {
                this.loadBloodRequests();
            }
        } else {
            showAlert('Failed to submit blood request. Please try again.', 'danger');
        }
    }

    validateBloodRequest(data) {
        if (!data.patientName || !data.bloodGroup || !data.unitsNeeded || 
            !data.urgency || !data.hospitalName || !data.contactPerson || !data.contactPhone) {
            showAlert('Please fill in all required fields', 'danger');
            return false;
        }

        if (!validatePhone(data.contactPhone)) {
            showAlert('Please enter a valid phone number', 'danger');
            return false;
        }

        if (data.unitsNeeded < 1 || data.unitsNeeded > 10) {
            showAlert('Units needed must be between 1 and 10', 'danger');
            return false;
        }

        return true;
    }

    populateHospitalDropdown() {
        const hospitalSelect = document.getElementById('hospitalName');
        if (!hospitalSelect) return;

        const hospitalsWithBloodBank = bangladeshHospitals.filter(h => h.bloodBank);
        
        hospitalsWithBloodBank.forEach(hospital => {
            const option = document.createElement('option');
            option.value = hospital.name;
            option.textContent = `${hospital.name} - ${hospital.district}`;
            hospitalSelect.appendChild(option);
        });
    }

    handleEmergencyRequest() {
        // Show emergency request modal or redirect
        const modal = new bootstrap.Modal(document.getElementById('requestModal'));
        modal.show();
        
        // Pre-select emergency urgency
        document.getElementById('urgency').value = 'emergency';
        
        showAlert('Emergency request form opened. Please fill in the details quickly.', 'warning');
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-GB');
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} minutes ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} days ago`;
        }
    }

    getUrgencyColor(urgency) {
        const colors = {
            'emergency': 'danger',
            'urgent': 'warning',
            'normal': 'info'
        };
        return colors[urgency] || 'secondary';
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'fulfilled': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    contactDonor(donorId) {
        const donor = window.crud.getUserById(donorId);
        if (donor) {
            alert(`Contact ${donor.name} at ${donor.phone}`);
            // In a real app, this would open a messaging interface
        }
    }

    loadProfile() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        // Load profile form and statistics
        // Implementation would go here
    }

    loadAnalytics() {
        // Load charts and analytics
        // Implementation would go here
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new DashboardController();
});

// Make showSection globally available
window.showSection = function(sectionName) {
    window.dashboard.showSection(sectionName);
};