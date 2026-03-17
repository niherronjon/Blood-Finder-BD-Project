// hospitals.js - Comprehensive Bangladesh Hospitals Database with Blood Banks
const bangladeshHospitals = [
    // Dhaka Division - Major Hospitals
    {
        id: "h001",
        name: "Dhaka Medical College Hospital",
        type: "Government",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Ramna",
        address: "Ramna, Dhaka-1000",
        bloodBank: true,
        contact: "+88-02-8626812",
        emergency: "+88-02-9661551",
        email: "info@dmch.gov.bd",
        established: 1946,
        bedCapacity: 2600,
        specialties: ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
        bloodBankContact: "+88-02-8626813",
        coordinates: { lat: 23.7270, lng: 90.3936 }
    },
    {
        id: "h002",
        name: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
        type: "Government",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Shahbagh",
        address: "Shahbagh, Dhaka-1000",
        bloodBank: true,
        contact: "+88-02-9661064",
        emergency: "+88-02-9661065",
        email: "info@bsmmu.edu.bd",
        established: 1998,
        bedCapacity: 1800,
        specialties: ["All Medical Specialties"],
        bloodBankContact: "+88-02-9661066",
        coordinates: { lat: 23.7394, lng: 90.3958 }
    },
    {
        id: "h003",
        name: "National Institute of Cardiovascular Diseases (NICVD)",
        type: "Government",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Sher-e-Bangla Nagar",
        address: "Sher-e-Bangla Nagar, Dhaka-1207",
        bloodBank: true,
        contact: "+88-02-9663620",
        emergency: "+88-02-9663621",
        email: "info@nicvd.gov.bd",
        established: 1998,
        bedCapacity: 650,
        specialties: ["Cardiology", "Cardiac Surgery"],
        bloodBankContact: "+88-02-9663622",
        coordinates: { lat: 23.7679, lng: 90.3594 }
    },
    {
        id: "h004",
        name: "Birdem General Hospital",
        type: "Private",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Shahbagh",
        address: "122 Kazi Nazrul Islam Avenue, Dhaka-1000",
        bloodBank: true,
        contact: "+88-02-9661551",
        emergency: "+88-02-9661552",
        email: "info@birdem.org.bd",
        established: 1981,
        bedCapacity: 650,
        specialties: ["Diabetes", "Endocrinology", "General Medicine"],
        bloodBankContact: "+88-02-9661553",
        coordinates: { lat: 23.7465, lng: 90.3947 }
    },
    {
        id: "h005",
        name: "Square Hospitals Ltd.",
        type: "Private",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Panthapath",
        address: "18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka-1205",
        bloodBank: true,
        contact: "+88-02-8159457",
        emergency: "+88-02-8159458",
        email: "info@squarehospital.com",
        established: 2006,
        bedCapacity: 435,
        specialties: ["Multi-specialty"],
        bloodBankContact: "+88-02-8159459",
        coordinates: { lat: 23.7515, lng: 90.3776 }
    },
    {
        id: "h006",
        name: "Apollo Hospitals Dhaka",
        type: "Private",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Bashundhara",
        address: "Plot # 81, Block # E, Bashundhara R/A, Dhaka-1229",
        bloodBank: true,
        contact: "+88-02-8401661",
        emergency: "+88-02-8401662",
        email: "info@apollodhaka.com",
        established: 2005,
        bedCapacity: 425,
        specialties: ["Multi-specialty", "Cancer Care"],
        bloodBankContact: "+88-02-8401663",
        coordinates: { lat: 23.8177, lng: 90.4274 }
    },
    {
        id: "h007",
        name: "United Hospital Limited",
        type: "Private",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Gulshan",
        address: "Plot # 15, Road # 71, Gulshan-2, Dhaka-1212",
        bloodBank: true,
        contact: "+88-02-8836000",
        emergency: "+88-02-8836001",
        email: "info@uhlbd.com",
        established: 2006,
        bedCapacity: 600,
        specialties: ["Multi-specialty"],
        bloodBankContact: "+88-02-8836002",
        coordinates: { lat: 23.7925, lng: 90.4078 }
    },
    {
        id: "h008",
        name: "Bangladesh Specialized Hospital",
        type: "Private",
        division: "Dhaka",
        district: "Dhaka",
        upazila: "Naya Paltan",
        address: "21 Shyamoli, Ring Road, Adabar, Dhaka-1207",
        bloodBank: true,
        contact: "+88-02-8159092",
        emergency: "+88-02-8159093",
        email: "info@bdspecializedhospital.com",
        established: 2000,
        bedCapacity: 400,
        specialties: ["Multi-specialty"],
        bloodBankContact: "+88-02-8159094",
        coordinates: { lat: 23.7697, lng: 90.3697 }
    },

    // Chittagong Division
    {
        id: "h009",
        name: "Chittagong Medical College Hospital",
        type: "Government",
        division: "Chittagong",
        district: "Chittagong",
        upazila: "Kotwali",
        address: "Panchlaish, Chittagong-4203",
        bloodBank: true,
        contact: "+88-031-2502227",
        emergency: "+88-031-2502228",
        email: "info@cmch.gov.bd",
        established: 1957,
        bedCapacity: 1350,
        specialties: ["General Medicine", "Surgery", "Pediatrics"],
        bloodBankContact: "+88-031-2502229",
        coordinates: { lat: 22.3569, lng: 91.7832 }
    },
    {
        id: "h010",
        name: "Chittagong General Hospital",
        type: "Government",
        division: "Chittagong",
        district: "Chittagong",
        upazila: "Kotwali",
        address: "Anderkilla, Chittagong-4000",
        bloodBank: true,
        contact: "+88-031-2523300",
        emergency: "+88-031-2523301",
        email: "info@cgh.gov.bd",
        established: 1902,
        bedCapacity: 750,
        specialties: ["General Medicine", "Surgery"],
        bloodBankContact: "+88-031-2523302",
        coordinates: { lat: 22.3475, lng: 91.8123 }
    },

    // Sylhet Division
    {
        id: "h011",
        name: "Sylhet MAG Osmani Medical College Hospital",
        type: "Government",
        division: "Sylhet",
        district: "Sylhet",
        upazila: "Sylhet Sadar",
        address: "Medical College Road, Sylhet-3100",
        bloodBank: true,
        contact: "+88-0821-713083",
        emergency: "+88-0821-713084",
        email: "info@somch.gov.bd",
        established: 1962,
        bedCapacity: 1000,
        specialties: ["General Medicine", "Surgery", "Gynecology"],
        bloodBankContact: "+88-0821-713085",
        coordinates: { lat: 24.8949, lng: 91.8687 }
    },

    // Rajshahi Division  
    {
        id: "h012",
        name: "Rajshahi Medical College Hospital",
        type: "Government",
        division: "Rajshahi",
        district: "Rajshahi",
        upazila: "Motihar",
        address: "Laxmipur, Rajshahi-6000",
        bloodBank: true,
        contact: "+88-0721-772150",
        emergency: "+88-0721-772151",
        email: "info@rmch.gov.bd",
        established: 1958,
        bedCapacity: 1016,
        specialties: ["General Medicine", "Surgery", "Oncology"],
        bloodBankContact: "+88-0721-772152",
        coordinates: { lat: 24.3745, lng: 88.6042 }
    },

    // Khulna Division
    {
        id: "h013",
        name: "Khulna Medical College Hospital",
        type: "Government",
        division: "Khulna",
        district: "Khulna",
        upazila: "Kotwali",
        address: "Khulna Medical College Road, Khulna-9000",
        bloodBank: true,
        contact: "+88-041-761756",
        emergency: "+88-041-761757",
        email: "info@kmch.gov.bd",
        established: 1992,
        bedCapacity: 750,
        specialties: ["General Medicine", "Surgery", "Pediatrics"],
        bloodBankContact: "+88-041-761758",
        coordinates: { lat: 22.8456, lng: 89.5403 }
    },

    // Barisal Division
    {
        id: "h014",
        name: "Sher-E-Bangla Medical College Hospital",
        type: "Government",
        division: "Barisal",
        district: "Barisal",
        upazila: "Barisal Sadar",
        address: "Alekanda, Barisal-8200",
        bloodBank: true,
        contact: "+88-0431-2177010",
        emergency: "+88-0431-2177011",
        email: "info@sbmch.gov.bd",
        established: 1968,
        bedCapacity: 850,
        specialties: ["General Medicine", "Surgery", "Gynecology"],
        bloodBankContact: "+88-0431-2177012",
        coordinates: { lat: 22.7010, lng: 90.3535 }
    },

    // Rangpur Division
    {
        id: "h015",
        name: "Rangpur Medical College Hospital",
        type: "Government",
        division: "Rangpur",
        district: "Rangpur",
        upazila: "Rangpur Sadar",
        address: "Medical College Road, Rangpur-5400",
        bloodBank: true,
        contact: "+88-0521-63801",
        emergency: "+88-0521-63802",
        email: "info@rmch.gov.bd",
        established: 1970,
        bedCapacity: 500,
        specialties: ["General Medicine", "Surgery", "Pediatrics"],
        bloodBankContact: "+88-0521-63803",
        coordinates: { lat: 25.7439, lng: 89.2752 }
    },

    // Mymensingh Division
    {
        id: "h016",
        name: "Mymensingh Medical College Hospital",
        type: "Government",
        division: "Mymensingh",
        district: "Mymensingh",
        upazila: "Mymensingh Sadar",
        address: "Medical College Road, Mymensingh-2200",
        bloodBank: true,
        contact: "+88-091-66009",
        emergency: "+88-091-66010",
        email: "info@mmch.gov.bd",
        established: 1962,
        bedCapacity: 1000,
        specialties: ["General Medicine", "Surgery", "Neurology"],
        bloodBankContact: "+88-091-66011",
        coordinates: { lat: 24.7471, lng: 90.4203 }
    }
];

// Major Blood Banks and Organizations
const bloodBanksOrganizations = [{
        id: "bb001",
        name: "Sandhani (Central)",
        type: "Voluntary Organization",
        headquarters: "Dhaka Medical College",
        founded: 1978,
        branches: [
            "Dhaka Medical College",
            "Chittagong Medical College",
            "Rajshahi Medical College",
            "Sylhet Medical College",
            "Khulna Medical College",
            "Barisal Medical College",
            "Rangpur Medical College",
            "Mymensingh Medical College",
            "Comilla Medical College",
            "Faridpur Medical College",
            "Dinajpur Medical College",
            "Bogra Medical College",
            "Patuakhali Medical College"
        ],
        contact: "+88-01711-567890",
        email: "info@sandhani.org",
        website: "www.sandhani.org",
        services: ["Blood Collection", "Organ Donation", "Eye Donation"],
        motto: "Let others live"
    },
    {
        id: "bb002",
        name: "Badhan",
        type: "Voluntary Organization",
        headquarters: "BUET, Dhaka",
        founded: 1997,
        branches: [
            "BUET", "KUET", "RUET", "CUET", "PUST",
            "Various Universities across Bangladesh"
        ],
        contact: "+88-01912-345678",
        email: "info@badhan.org",
        website: "www.badhan.org",
        services: ["Blood Donation", "Awareness Programs"],
        motto: "Donate blood, save life"
    },
    {
        id: "bb003",
        name: "Bangladesh Red Crescent Society (BDRCS)",
        type: "International Organization",
        headquarters: "Dhaka",
        founded: 1973,
        branches: "Nationwide (64 districts)",
        contact: "+88-02-9335001",
        emergency: "+88-02-9335002",
        email: "info@bdrcs.org",
        website: "www.bdrcs.org",
        services: ["Blood Collection", "Emergency Response", "Health Programs"],
        motto: "Humanity in action"
    },
    {
        id: "bb004",
        name: "Quantum Blood Bank",
        type: "Private Organization",
        headquarters: "Dhaka",
        founded: 1995,
        branches: [
            "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi"
        ],
        contact: "+88-01730-123456",
        email: "blood@quantummethod.org.bd",
        website: "blood.quantummethod.org.bd",
        services: ["Voluntary Blood Collection", "Blood Storage"],
        specialNote: "Part of Quantum Foundation"
    }
];

// Blood Group Information
const bloodGroups = [{
        group: "A+",
        percentage: 30,
        canDonateTo: ["A+", "AB+"],
        canReceiveFrom: ["A+", "A-", "O+", "O-"],
        description: "Common blood type in Bangladesh"
    },
    {
        group: "A-",
        percentage: 5,
        canDonateTo: ["A+", "A-", "AB+", "AB-"],
        canReceiveFrom: ["A-", "O-"],
        description: "Rare blood type, high demand"
    },
    {
        group: "B+",
        percentage: 34,
        canDonateTo: ["B+", "AB+"],
        canReceiveFrom: ["B+", "B-", "O+", "O-"],
        description: "Most common blood type in Bangladesh"
    },
    {
        group: "B-",
        percentage: 2,
        canDonateTo: ["B+", "B-", "AB+", "AB-"],
        canReceiveFrom: ["B-", "O-"],
        description: "Very rare, extremely high demand"
    },
    {
        group: "AB+",
        percentage: 9,
        canDonateTo: ["AB+"],
        canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        description: "Universal recipient"
    },
    {
        group: "AB-",
        percentage: 1,
        canDonateTo: ["AB+", "AB-"],
        canReceiveFrom: ["A-", "B-", "AB-", "O-"],
        description: "Rarest blood type in Bangladesh"
    },
    {
        group: "O+",
        percentage: 18,
        canDonateTo: ["A+", "B+", "AB+", "O+"],
        canReceiveFrom: ["O+", "O-"],
        description: "Common donor type"
    },
    {
        group: "O-",
        percentage: 1,
        canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        canReceiveFrom: ["O-"],
        description: "Universal donor, extremely rare in Bangladesh"
    }
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        bangladeshHospitals,
        bloodBanksOrganizations,
        bloodGroups
    };
}