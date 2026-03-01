// Main Application Controller
class BloodDonationApp {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.bloodRequests = JSON.parse(localStorage.getItem('bloodRequests')) || [];
        this.donations = JSON.parse(localStorage.getItem('donations')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        this.updateStats();
        this.bindEvents();
        if (this.currentUser) {
            this.loadUserDashboard();
        }
    }

    // Update homepage statistics
    updateStats() {
        const donorCount = this.users.filter(user => user.userType === 'donor').length;
        const hospitalCount = bangladeshHospitals.length;

        const donorCountEl = document.getElementById('donorCount');
        const hospitalCountEl = document.getElementById('hospitalCount');

        if (donorCountEl) {
            this.animateCounter(donorCountEl, 0, donorCount, 2000);
        }
        if (hospitalCountEl) {
            hospitalCountEl.textContent = hospitalCount + '+';
        }
    }

    // Animate counter numbers
    animateCounter(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            element.textContent = Math.floor(current);

            if (current >= end) {
                element.textContent = end;
                clearInterval(timer);
            }
        }, 16);
    }

    // Bind event listeners
    bindEvents() {
        // Emergency blood request button
        const emergencyBtn = document.getElementById('emergencyRequest');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', () => {
                this.handleEmergencyRequest();
            });
        }
    }

    // Handle emergency blood request
    handleEmergencyRequest() {
        const bloodGroup = prompt('Enter required blood group (A+, B+, O+, etc.):');
        const location = prompt('Enter location (District):');

        if (bloodGroup && location) {
            this.findEmergencyDonors(bloodGroup, location);
        }
    }

    // Find emergency donors
    findEmergencyDonors(bloodGroup, location) {
        const compatibleDonors = this.users.filter(user =>
            user.userType === 'donor' &&
            user.bloodGroup === bloodGroup &&
            user.location.district.toLowerCase().includes(location.toLowerCase()) &&
            this.isEligibleToDonate(user)
        );

        if (compatibleDonors.length > 0) {
            alert(`Found ${compatibleDonors.length} eligible donors in ${location} with ${bloodGroup} blood group.`);
            // In a real app, this would send notifications
        } else {
            alert('No eligible donors found. Checking compatible blood groups...');
            this.findCompatibleDonors(bloodGroup, location);
        }
    }

    // Check if user is eligible to donate (last donation > 56 days ago)
    isEligibleToDonate(user) {
        if (!user.medicalInfo.lastDonation) return true;

        const lastDonation = new Date(user.medicalInfo.lastDonation);
        const today = new Date();
        const daysDiff = (today - lastDonation) / (1000 * 60 * 60 * 24);

        return daysDiff >= 56;
    }

    // Find compatible blood group donors
    findCompatibleDonors(bloodGroup, location) {
        const compatibility = {
            'A+': ['A+', 'AB+'],
            'A-': ['A+', 'A-', 'AB+', 'AB-'],
            'B+': ['B+', 'AB+'],
            'B-': ['B+', 'B-', 'AB+', 'AB-'],
            'AB+': ['AB+'],
            'AB-': ['AB+', 'AB-'],
            'O+': ['A+', 'B+', 'AB+', 'O+'],
            'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        };

        // Find donors who can donate to the required blood group
        const compatibleDonors = this.users.filter(user => {
            if (user.userType !== 'donor') return false;
            if (!compatibility[user.bloodGroup]) return false;

            return compatibility[user.bloodGroup].includes(bloodGroup) &&
                user.location.district.toLowerCase().includes(location.toLowerCase()) &&
                this.isEligibleToDonate(user);
        });

        if (compatibleDonors.length > 0) {
            alert(`Found ${compatibleDonors.length} compatible donors in ${location}.`);
        } else {
            alert('No compatible donors found in the specified location.');
        }
    }

    // Load user dashboard based on user type
    loadUserDashboard() {
        if (!this.currentUser) return;

        switch (this.currentUser.userType) {
            case 'donor':
                this.loadDonorDashboard();
                break;
            case 'requester':
                this.loadRequesterDashboard();
                break;
            case 'admin':
                this.loadAdminDashboard();
                break;
        }
    }

    // Load donor-specific dashboard
    loadDonorDashboard() {
            const dashboard = document.getElementById('donorDashboard');
            if (!dashboard) return;

            const userDonations = this.donations.filter(d => d.donorId === this.currentUser.id);
            const nextEligibleDate = this.getNextEligibleDate();

            dashboard.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5>Total Donations</h5>
                            <h2>${userDonations.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5>Lives Saved</h5>
                            <h2>${userDonations.length * 3}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card ${this.isEligibleToDonate(this.currentUser) ? 'bg-success' : 'bg-warning'} text-white">
                        <div class="card-body">
                            <h5>Donation Status</h5>
                            <p>${this.isEligibleToDonate(this.currentUser) ? 'Eligible' : 'Not Eligible'}</p>
                            ${!this.isEligibleToDonate(this.currentUser) ? `<small>Next eligible: ${nextEligibleDate}</small>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get next eligible donation date
    getNextEligibleDate() {
        if (!this.currentUser.medicalInfo.lastDonation) return 'Now';
        
        const lastDonation = new Date(this.currentUser.medicalInfo.lastDonation);
        const nextDate = new Date(lastDonation);
        nextDate.setDate(nextDate.getDate() + 56);
        
        return nextDate.toLocaleDateString();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.app = new BloodDonationApp();
});

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function validateBloodGroup(bloodGroup) {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validGroups.includes(bloodGroup);
}

function validatePhone(phone) {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-GB');
}