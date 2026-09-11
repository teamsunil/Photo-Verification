/* store.js
   Mock backend for the POC. In production these would be real server endpoints
   (POST /register, POST /verify-email, POST /verification/photo,
   GET/PATCH /admin/users, POST /admin/login). Here everything lives in
   localStorage so every page in this demo can read/write the same "database". */

const DB_KEY = "pv_users_v3";
const SESSION_KEY = "pv_session_user_id";
const ADMIN_SESSION_KEY = "pv_admin_session";

// Demo-only admin credentials. In a real product this would be a real
// authenticated account, never a hardcoded password in client code.
const ADMIN_EMAIL = "admin@photoverify.com";
const ADMIN_PASSWORD = "admin123";

function _readAll() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function _writeAll(users) {
  localStorage.setItem(DB_KEY, JSON.stringify(users));
}

function _normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

const Store = {
  // ---------------- User auth / registration ----------------
  findByEmail(email) {
    const e = _normalizeEmail(email);
    return _readAll().find((u) => u.email === e) || null;
  },

  register(name, email, password) {
    const email_n = _normalizeEmail(email);
    if (this.findByEmail(email_n)) {
      return { error: "An account with this email already exists." };
    }
    const users = _readAll();
    const user = {
      id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      email: email_n,
      password, // plain text — POC only, never do this in production
      emailVerified: false,
      selfie: null,
      photoVerified: null,   // null = no selfie submitted yet
      manualVerified: false,
      submittedAt: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    _writeAll(users);
    localStorage.setItem(SESSION_KEY, user.id);
    return { user };
  },

  getCurrentUser() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    return _readAll().find((u) => u.id === id) || null;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ---------------- Email verification ----------------
  verifyEmail(userId) {
    const users = _readAll();
    const u = users.find((x) => x.id === userId);
    if (!u) return null;
    u.emailVerified = true;
    _writeAll(users);
    return u;
  },

  // ---------------- Photo verification ----------------
  saveSelfie(userId, dataUrl) {
    const users = _readAll();
    const u = users.find((x) => x.id === userId);
    if (!u) return null;
    u.selfie = dataUrl;
    u.submittedAt = new Date().toISOString();
    // Simulated automated check (stand-in for a real face/liveness model).
    // Admin still has to complete manual review before full access unlocks.
    u.photoVerified = true;
    _writeAll(users);
    return u;
  },

  // ---------------- Status machine ----------------
  // Returns one of: 'email_pending' | 'photo_pending' | 'review_pending' | 'verified'
  getStatus(user) {
    if (!user) return null;
    if (!user.emailVerified) return "email_pending";
    if (!user.selfie) return "photo_pending";
    if (!(user.photoVerified === true && user.manualVerified === true)) return "review_pending";
    return "verified";
  },

  isFullyVerified(user) {
    return this.getStatus(user) === "verified";
  },

  // ---------------- Admin ----------------
  getAllUsers() {
    return _readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  setVerification(userId, field, value) {
    const users = _readAll();
    const u = users.find((x) => x.id === userId);
    if (!u) return null;
    u[field] = value;
    _writeAll(users);
    return u;
  },

  // Approval only succeeds when both flags are already Yes.
  approveVerification(userId) {
    const users = _readAll();
    const u = users.find((x) => x.id === userId);
    if (!u) return { error: "User not found." };
    if (!(u.photoVerified === true && u.manualVerified === true)) {
      return { error: "Both Photo Verified and Manual Verified must be set to Yes before approving." };
    }
    u.approvedAt = new Date().toISOString();
    _writeAll(users);
    return { user: u };
  },

  adminLogin(email, password) {
    if (_normalizeEmail(email) === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      return { success: true };
    }
    return { error: "Invalid admin email or password." };
  },

  adminLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
  },
};
