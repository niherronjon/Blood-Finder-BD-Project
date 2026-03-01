// CRUD Operations Controller
class CRUDController {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.bloodRequests = JSON.parse(localStorage.getItem('bloodRequests')) || [];
        this.donations = JSON.parse(localStorage.getItem('donations')) || [];
        this.hospitals = bangladeshHospitals || [];
    }

    // User CRUD Operations
    createUser(userData) {
        const user = {
            ...userData,
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    getAllUsers() {
        return this.users;
    }

    updateUser(id, updateData) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            this.saveUsers();
            return this.users[userIndex];
        }
        return null;
    }

    deleteUser(id) {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            const deletedUser = this.users.splice(userIndex, 1)[0];
            this.saveUsers();
            return deletedUser;
        }
        return null;
    }

    // Blood Request CRUD Operations
    createBloodRequest(requestData) {
        const request = {
            ...requestData,
            id: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.bloodRequests.push(request);
        this.saveBloodRequests();
        return request;
    }

    getBloodRequestById(id) {
        return this.bloodRequests.find(request => request.id === id);
    }

    getAllBloodRequests() {
        return this.bloodRequests;
    }

    updateBloodRequest(id, updateData) {
        const requestIndex = this.bloodRequests.findIndex(request => request.id === id);
        if (requestIndex !== -1) {
            this.bloodRequests[requestIndex] = {
                ...this.bloodRequests[requestIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            this.saveBloodRequests();
            return this.bloodRequests[requestIndex];
        }
        return null;
    }

    deleteBloodRequest(id) {
        const requestIndex = this.bloodRequests.findIndex(request => request.id === id);
        if (requestIndex !== -1) {
            const deletedRequest = this.bloodRequests.splice(requestIndex, 1)[0];
            this.saveBloodRequests();
            return deletedRequest;
        }
        return null;
    }

    // Donation CRUD Operations
    createDonation(donationData) {
        const donation = {
            ...donationData,
            id: 'don_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        this.donations.push(donation);
        this.saveDonations();

        // Update donor's last donation date
        this.updateUser(donation.donorId, {
            'medicalInfo.lastDonation': donation.donationDate
        });

        return donation;
    }

    getDonationById(id) {
        return this.donations.find(donation => donation.id === id);
    }

    getAllDonations() {
        return this.donations;
    }

    getDonationsByDonor(donorId) {
        return this.donations.filter(donation => donation.donorId === donorId);
    }

    // Search and Filter Operations
    searchDonors(criteria) {
        return this.users.filter(user => {
            if (user.userType !== 'donor') return false;

            let matches = true;

            if (criteria.bloodGroup && user.bloodGroup !== criteria.bloodGroup) {
                matches = false;
            }

            if (criteria.district && !user.location.district.toLowerCase().includes(criteria.district.toLowerCase())) {
                matches = false;
            }

            if (criteria.upazila && !user.location.upazila.toLowerCase().includes(criteria.upazila.toLowerCase())) {
                matches = false;
            }

            if (criteria.eligibleOnly && !this.isEligibleToDonate(user)) {
                matches = false;
            }

            return matches;
        });
    }

    searchBloodRequests(criteria) {
        return this.bloodRequests.filter(request => {
            let matches = true;

            if (criteria.bloodGroup && request.bloodGroup !== criteria.bloodGroup) {
                matches = false;
            }

            if (criteria.status && request.status !== criteria.status) {
                matches = false;
            }

            if (criteria.urgency && request.urgency !== criteria.urgency) {
                matches = false;
            }

            if (criteria.district && !request.location ? .district ? .toLowerCase().includes(criteria.district.toLowerCase())) {
                matches = false;
            }

            return matches;
        });
    }

    searchHospitals(criteria) {
        return this.hospitals.filter(hospital => {
            let matches = true;

            if (criteria.district && !hospital.district.toLowerCase().includes(criteria.district.toLowerCase())) {
                matches = false;
            }

            if (criteria.bloodBankOnly && !hospital.bloodBank) {
                matches = false;
            }

            if (criteria.type && hospital.type.toLowerCase() !== criteria.type.toLowerCase()) {
                matches = false;
            }

            return matches;
        });
    }

    // Utility Methods
    isEligibleToDonate(user) {
        if (!user.medicalInfo.lastDonation) return true;

        const lastDonation = new Date(user.medicalInfo.lastDonation);
        const today = new Date();
        const daysDiff = (today - lastDonation) / (1000 * 60 * 60 * 24);

        return daysDiff >= 56;
    }

    getCompatibleDonors(bloodGroup, location) {
        const compatibility = {
            'A+': ['A+', 'A-', 'O+', 'O-'],
            'A-': ['A-', 'O-'],
            'B+': ['B+', 'B-', 'O+', 'O-'],
            'B-': ['B-', 'O-'],
            'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'AB-': ['A-', 'B-', 'AB-', 'O-'],
            'O+': ['O+', 'O-'],
            'O-': ['O-']
        };

        const acceptableGroups = compatibility[bloodGroup] || [];

        return this.users.filter(user => {
            return user.userType === 'donor' &&
                acceptableGroups.includes(user.bloodGroup) &&
                user.location.district.toLowerCase().includes(location.toLowerCase()) &&
                this.isEligibleToDonate(user);
        });
    }

    // Analytics Methods
    getDonationStats() {
        const totalDonations = this.donations.length;
        const totalDonors = this.users.filter(u => u.userType === 'donor').length;
        const totalRequests = this.bloodRequests.length;
        const fulfilledRequests = this.bloodRequests.filter(r => r.status === 'fulfilled').length;

        return {
            totalDonations,
            totalDonors,
            totalRequests,
            fulfilledRequests,
            fulfillmentRate: totalRequests > 0 ? (fulfilledRequests / totalRequests * 100).toFixed(1) : 0
        };
    }

    getBloodGroupStats() {
        const stats = {};
        const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        bloodGroups.forEach(group => {
            stats[group] = {
                donors: this.users.filter(u => u.userType === 'donor' && u.bloodGroup === group).length,
                requests: this.bloodRequests.filter(r => r.bloodGroup === group).length,
                donations: this.donations.filter(d => {
                    const donor = this.getUserById(d.donorId);
                    return donor && donor.bloodGroup === group;
                }).length
            };
        });

        return stats;
    }

    // Storage Methods
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    saveBloodRequests() {
        localStorage.setItem('bloodRequests', JSON.stringify(this.bloodRequests));
    }

    saveDonations() {
        localStorage.setItem('donations', JSON.stringify(this.donations));
    }

    // Import/Export Methods
    exportData() {
        return {
            users: this.users,
            bloodRequests: this.bloodRequests,
            donations: this.donations,
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.users) {
            this.users = data.users;
            this.saveUsers();
        }
        if (data.bloodRequests) {
            this.bloodRequests = data.bloodRequests;
            this.saveBloodRequests();
        }
        if (data.donations) {
            this.donations = data.donations;
            this.saveDonations();
        }
    }
}

// Initialize CRUD controller
document.addEventListener('DOMContentLoaded', function() {
    window.crud = new CRUDController();
});