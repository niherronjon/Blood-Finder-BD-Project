// Authentication Controller
class AuthController {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
    this.init();
  }

  init() {
    this.bindAuthEvents();
    this.checkAuthStatus();
  }

  bindAuthEvents() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }
  }

  handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showAlert("Please fill in all fields", "danger");
      return;
    }

    const user = this.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      showAlert("Login successful!", "success");

      // Redirect based on user type
      // Call handleAuthSuccess for proper redirect logic
      setTimeout(() => {
        handleAuthSuccess();
      }, 1500);
    } else {
      showAlert("Invalid email or password", "danger");
    }
  }

  handleRegister() {
    const formData = {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      phone: document.getElementById("phone").value,
      bloodGroup: document.getElementById("bloodGroup").value,
      userType: document.getElementById("userType").value,
      location: {
        district: document.getElementById("district").value,
        upazila: document.getElementById("upazila").value,
        address: document.getElementById("address").value,
      },
      medicalInfo: {
        weight: parseInt(document.getElementById("weight").value) || 0,
        lastDonation: document.getElementById("lastDonation").value || null,
        eligibleDate: null,
      },
      createdAt: new Date().toISOString(),
      isActive: true,
      isVerified: false,
    };

    // Validation
    if (!this.validateRegistrationData(formData)) {
      return;
    }

    // Calculate eligible date if last donation exists
    if (formData.medicalInfo.lastDonation) {
      const lastDonation = new Date(formData.medicalInfo.lastDonation);
      const eligibleDate = new Date(lastDonation);
      eligibleDate.setDate(eligibleDate.getDate() + 56);
      formData.medicalInfo.eligibleDate = eligibleDate.toISOString();
    }

    // Check if email already exists
    if (this.users.find((u) => u.email === formData.email)) {
      showAlert("Email already registered", "danger");
      return;
    }

    // Add user to database
    this.users.push(formData);
    localStorage.setItem("users", JSON.stringify(this.users));

    showAlert("Registration successful! Please login.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  }

  validateRegistrationData(data) {
    // Required fields
    if (
      !data.name ||
      !data.email ||
      !data.password ||
      !data.phone ||
      !data.bloodGroup
    ) {
      showAlert("Please fill in all required fields", "danger");
      return false;
    }

    // Password confirmation
    if (data.password !== data.confirmPassword) {
      showAlert("Passwords do not match", "danger");
      return false;
    }

    // Password strength
    if (data.password.length < 6) {
      showAlert("Password must be at least 6 characters long", "danger");
      return false;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showAlert("Please enter a valid email address", "danger");
      return false;
    }

    // Phone format (Bangladesh)
    if (!validatePhone(data.phone)) {
      showAlert("Please enter a valid Bangladesh phone number", "danger");
      return false;
    }

    // Blood group validation
    if (!validateBloodGroup(data.bloodGroup)) {
      showAlert("Please select a valid blood group", "danger");
      return false;
    }

    // Weight validation for donors
    if (data.userType === "donor" && data.medicalInfo.weight < 50) {
      showAlert("Donors must weigh at least 50kg", "danger");
      return false;
    }

    return true;
  }

  handleLogout() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    showAlert("Logged out successfully", "info");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  }

  checkAuthStatus() {
    if (this.currentUser) {
      // Update UI for logged-in user
      this.updateAuthUI();
    }
  }

  updateAuthUI() {
    const authButtons = document.querySelector(".auth-buttons");
    const userInfo = document.querySelector(".user-info");

    if (authButtons && this.currentUser) {
      authButtons.style.display = "none";
    }

    if (userInfo && this.currentUser) {
      userInfo.innerHTML = `
                <span class="me-3">Welcome, ${this.currentUser.name}</span>
                <button class="btn btn-outline-light btn-sm" id="logoutBtn">Logout</button>
            `;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check user role
  hasRole(role) {
    return this.currentUser && this.currentUser.userType === role;
  }
}

// Initialize auth controller
document.addEventListener("DOMContentLoaded", function () {
  window.auth = new AuthController();
});

// Handle redirect after authentication
function handleAuthSuccess() {
  const redirectAfterAuth = localStorage.getItem("redirectAfterAuth");
  const authFlow = localStorage.getItem("authFlow");

  if (redirectAfterAuth) {
    // Clear stored data
    localStorage.removeItem("redirectAfterAuth");
    localStorage.removeItem("authFlow");

    if (authFlow === "register") {
      // After registration, show success message
      showAlert(
        "Registration successful! Redirecting to dashboard...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      // After login, direct redirect
      window.location.href = "dashboard.html";
    }
  } else {
    // Normal flow
    window.location.href = "dashboard.html";
  }
}

function logout() {
  if (confirm("Do You Want to Logged Out?")) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userToken");
    localStorage.removeItem("isLoggedIn");
    sessionStorage.clear();
    window.location.href = "../index.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }
});

function register(userData) {
  let registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];

  const existingUser = registeredUsers.find(
    (user) => user.email === userData.email
  );
  if (existingUser) {
    alert("This email is already registered!");
    return false;
  }

  registeredUsers.push(userData);

  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

  console.log("User registered:", userData); // Debug line
  console.log("All users:", registeredUsers); // Debug line

  return true;
}
