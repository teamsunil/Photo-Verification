/* progress.js
   Renders the 5-step journey indicator: Registration -> Email -> Photo -> Admin Review -> Verified
   activeIndex: 0-based index of the step currently in progress (or "done" if past it). */

const PROGRESS_STEPS = ["Registration", "Email", "Photo", "Admin Review", "Verified"];

function renderProgress(activeIndex) {
  const container = document.getElementById("progressBar");
  if (!container) return;

  container.innerHTML = PROGRESS_STEPS.map((label, i) => {
    let state = "upcoming";
    if (i < activeIndex) state = "done";
    else if (i === activeIndex) state = "active";

    const connector = i < PROGRESS_STEPS.length - 1
      ? `<div class="pstep-line ${i < activeIndex ? "done" : ""}"></div>`
      : "";

    return `
      <div class="pstep ${state}">
        <div class="pstep-dot">${state === "done" ? "✓" : i + 1}</div>
        <div class="pstep-label">${label}</div>
      </div>
      ${connector}
    `;
  }).join("");
}

// Maps a user's status to the progress step index for convenience
function stepIndexForStatus(status) {
  switch (status) {
    case "email_pending": return 1;
    case "photo_pending": return 2;
    case "review_pending": return 3;
    case "verified": return 4;
    default: return 0;
  }
}

// Maps a user's status to the page they should currently be on
function pageForStatus(status) {
  switch (status) {
    case "email_pending": return "email-verify.html";
    case "photo_pending": return "verify.html";
    case "review_pending": return "pending.html";
    case "verified": return "dashboard.html";
    default: return "register.html";
  }
}
