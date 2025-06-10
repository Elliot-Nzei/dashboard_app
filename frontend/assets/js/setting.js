document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username-input");
    const profileUpload = document.getElementById("profile-upload");
    const profilePreview = document.getElementById("profile-preview");
    const themeSelect = document.getElementById("theme-select");
    const saveBtn = document.getElementById("save-settings");

    // Load existing settings
    const storedUsername = localStorage.getItem("username");
    const storedTheme = localStorage.getItem("theme");
    const storedProfile = localStorage.getItem("profileImage");

    if (storedUsername) usernameInput.value = storedUsername;
    if (storedProfile) profilePreview.src = storedProfile;

    // Theme: apply saved preference and set select value
    if (storedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeSelect.value = "dark";
    } else {
        document.body.classList.remove("dark-mode");
        themeSelect.value = "light";
    }

    // Theme: update on change
    themeSelect.addEventListener("change", () => {
        if (themeSelect.value === "dark") {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    });

    // Preview profile image
    profileUpload.addEventListener("change", () => {
        const file = profileUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Save all settings and redirect
    saveBtn.addEventListener("click", () => {
        const newUsername = usernameInput.value.trim();
        const newTheme = themeSelect.value;

        if (newUsername) localStorage.setItem("username", newUsername);
        if (newTheme) localStorage.setItem("theme", newTheme);

        // Save profile image if updated
        const file = profileUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                const newImg = e.target.result;
                localStorage.setItem("profileImage", newImg);

                // --- Update sidebar image immediately ---
                const sidebarImg = document.getElementById('sidebar-profile-pic');
                if (sidebarImg) sidebarImg.src = newImg;

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100); // Small delay to let DOM update
            };
            reader.readAsDataURL(file);
        } else {
            // --- Also update sidebar image if no new file but maybe cleared ---
            const sidebarImg = document.getElementById('sidebar-profile-pic');
            const storedImg = localStorage.getItem('profileImage');
            if (sidebarImg) sidebarImg.src = storedImg ? storedImg : 'assets/img/placeholder.png';

            window.location.href = 'index.html';
        }

        // After saving username:
        const displayEl = document.getElementById("username-display");
        if (displayEl) displayEl.textContent = newUsername;
    });

});
