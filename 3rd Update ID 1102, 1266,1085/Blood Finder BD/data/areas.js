// areas.js - Complete Bangladesh Geographic Data
const bangladeshAreas = {
    divisions: [
        "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"
    ],
    districts: {
        "Dhaka": [
            "Dhaka", "Gazipur", "Narayanganj", "Tangail", "Kishoreganj",
            "Manikganj", "Munshiganj", "Narsingdi", "Rajbari", "Madaripur",
            "Gopalganj", "Faridpur", "Shariatpur"
        ],
        "Chittagong": [
            "Chittagong", "Cox's Bazar", "Comilla", "Feni", "Brahmanbaria",
            "Rangamati", "Noakhali", "Laksmipur", "Chandpur", "Bandarban", "Khagrachhari"
        ],
        "Rajshahi": [
            "Rajshahi", "Bogra", "Pabna", "Sirajganj", "Natore", "Joypurhat",
            "Chapainawabganj", "Naogaon"
        ],
        "Khulna": [
            "Khulna", "Jessore", "Narail", "Magura", "Jhenaidah", "Bagerhat",
            "Chuadanga", "Kushtia", "Satkhira", "Meherpur"
        ],
        "Barisal": [
            "Barisal", "Patuakhali", "Bhola", "Pirojpur", "Jhalokati", "Barguna"
        ],
        "Sylhet": [
            "Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"
        ],
        "Rangpur": [
            "Rangpur", "Dinajpur", "Lalmonirhat", "Nilphamari", "Gaibandha",
            "Thakurgaon", "Panchagarh", "Kurigram"
        ],
        "Mymensingh": [
            "Mymensingh", "Jamalpur", "Netrakona", "Sherpur"
        ]
    },
    upazilas: {
        "Dhaka": [
            "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mirpur", "Mohammadpur",
            "Old Dhaka", "Tejgaon", "Ramna", "Wari", "Kotwali", "Lalbagh",
            "Hazaribagh", "New Market", "Shahbagh", "Paltan"
        ],
        "Gazipur": [
            "Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur", "Kaliganj"
        ],
        "Chittagong": [
                "Kotwali", "Panchlaish", "Double Mooring", "Lalkhan Bazar", "Chawkbazar",
                "Pahartali", "Bayezid Bostami", "Halishahar", "Bandar", "Chandgaon",
                "Karnaphuli", "Boalkhali", "Anowara", "Banshkhali", "Chandanaish",
                "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya",
                "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"
            ]
            // Add more upazilas for other districts as needed
    }
};

// Blood banks and donation centers by district
const bloodCentersByDistrict = {
    "Dhaka": [{
            name: "Sandhani Dhaka Medical",
            address: "Dhaka Medical College Hospital",
            contact: "+88-02-8626812",
            bloodBank: true
        },
        {
            name: "Red Crescent Dhaka",
            address: "Aurangzeb Road, Mohammadpur",
            contact: "+88-02-9119884",
            bloodBank: true
        },
        {
            name: "Quantum Blood Bank",
            address: "Dhanmondi",
            contact: "+88-01730-059090",
            bloodBank: true
        }
    ],
    "Chittagong": [{
        name: "Sandhani Chittagong Medical",
        address: "Chittagong Medical College Hospital",
        contact: "+88-031-2502227",
        bloodBank: true
    }],
    "Sylhet": [{
            name: "Sandhani MAG Osmani Medical",
            address: "MAG Osmani Medical College Hospital",
            contact: "+88-0821-713083",
            bloodBank: true
        }]
        // Add more districts as needed
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        bangladeshAreas,
        bloodCentersByDistrict
    };
}