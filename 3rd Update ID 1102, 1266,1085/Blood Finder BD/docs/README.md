# Blood Donation Management System - Bangladesh

A comprehensive web-based blood donation management system designed specifically for Bangladesh, connecting donors with those in need across the country.

## 🩸 Features

### Core Functionality
- **User Management**: Registration and authentication for donors, requesters, and admins
- **Blood Donor Search**: Find donors by blood group, location, and availability
- **Blood Request System**: Create and manage blood requests with urgency levels
- **Hospital Directory**: Comprehensive database of Bangladesh hospitals with blood banks
- **Emergency Requests**: Quick blood request system for urgent cases
- **Analytics Dashboard**: Statistics and reports on blood donations and requests

### Bangladesh-Specific Features
- Complete hospital database (50+ major hospitals)
- All 64 districts and major upazilas coverage
- Sandhani, Badhan, and Red Crescent integration
- Bengali and English language support
- Local phone number validation (+880 format)
- Geographic search by division/district/upazila

## 🏥 Hospital Coverage

### Major Hospitals Included:
- **Dhaka**: DMCH, BSMMU, NICVD, Birdem, Square, Apollo, United
- **Chittagong**: CMCH, Chittagong General Hospital
- **Sylhet**: MAG Osmani Medical College
- **Rajshahi**: Rajshahi Medical College
- **Khulna**: Khulna Medical College
- **Other Divisions**: All major medical colleges

### Blood Organizations:
- Sandhani (13+ branches nationwide)
- Badhan (University-based network)
- Bangladesh Red Crescent Society
- Quantum Blood Bank

## 🚀 Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (Apache, Nginx) or development server
- No database required (uses localStorage for demo)

### Quick Start
1. Download/clone the project files
2. Extract to your web server directory
3. Open `index.html` in your browser
4. Register as a donor or requester
5. Start using the system!

### Development Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/blood-donation-bd.git

# Navigate to project directory
cd blood-donation-bd

# Start local development server
python -m http.server 8000
# OR
php -S localhost:8000
# OR use Live Server extension in VS Code