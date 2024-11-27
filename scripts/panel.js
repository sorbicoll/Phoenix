function createIconSelect() {
    const icons = ['fas fa-home', 'fas fa-user', 'fas fa-envelope', 'fas fa-phone', 'fas fa-search', 'fas fa-star', 'fas fa-heart', 'fas fa-cog', 'fas fa-bars', 'fas fa-times', 'fas fa-check', 'fas fa-plus', 'fas fa-minus', 'fas fa-edit', 'fas fa-trash', 'fas fa-save', 'fas fa-print', 'fas fa-camera', 'fas fa-video', 'fas fa-music', 'fas fa-image', 'fas fa-file', 'fas fa-folder', 'fas fa-calendar', 'fas fa-clock', 'fas fa-map', 'fas fa-location-dot', 'fas fa-bell', 'fas fa-bookmark', 'fas fa-download', 'fas fa-upload', 'fas fa-share', 'fas fa-link', 'fas fa-lock', 'fas fa-unlock', 'fas fa-key', 'fas fa-gear', 'fas fa-wrench', 'fas fa-tools', 'fas fa-paint-brush', 'fas fa-pen', 'fas fa-pencil', 'fas fa-eraser', 'fas fa-copy', 'fas fa-paste', 'fas fa-cut', 'fas fa-undo', 'fas fa-redo', 'fas fa-rotate', 'fas fa-sync', 'fas fa-refresh', 'fas fa-spinner', 'fas fa-circle', 'fas fa-square', 'fas fa-triangle', 'fas fa-star', 'fab fa-facebook', 'fab fa-twitter', 'fab fa-instagram', 'fab fa-linkedin', 'fab fa-youtube', 'fab fa-github', 'fab fa-gitlab', 'fab fa-bitbucket', 'fas fa-cart-shopping', 'fas fa-credit-card', 'fas fa-money-bill', 'fas fa-coins', 'fas fa-truck', 'fas fa-shipping-fast', 'fas fa-box', 'fas fa-archive', 'fas fa-comments', 'fas fa-message', 'fas fa-envelope', 'fas fa-paper-plane', 'fas fa-wifi', 'fas fa-signal', 'fas fa-battery-full', 'fas fa-power-off', 'fas fa-sun', 'fas fa-moon', 'fas fa-cloud', 'fas fa-umbrella', 'fas fa-temperature-high', 'fas fa-temperature-low', 'fas fa-wind', 'fas fa-snowflake', 'fas fa-user-group', 'fas fa-users', 'fas fa-user-plus', 'fas fa-user-minus', 'fas fa-chart-line', 'fas fa-chart-bar', 'fas fa-chart-pie', 'fas fa-chart-area', 'fas fa-desktop', 'fas fa-laptop', 'fas fa-mobile', 'fas fa-tablet', 'fas fa-keyboard', 'fas fa-mouse', 'fas fa-headphones', 'fas fa-microphone', 'fas fa-camera-retro', 'fas fa-film', 'fas fa-play', 'fas fa-pause', 'fas fa-stop', 'fas fa-forward', 'fas fa-backward', 'fas fa-volume-high', 'fas fa-volume-low', 'fas fa-volume-off', 'fas fa-volume-xmark', 'fas fa-expand'];

    const select = document.createElement('select');
    select.className = 'icon-select';

    const defaultOption = document.createElement('option');
    defaultOption.text = 'Select an icon';
    defaultOption.value = '';
    select.appendChild(defaultOption);

    icons.forEach(icon => {
        const option = document.createElement('option');
        option.value = icon;
        option.text = icon;
        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        if (this.value) {
            document.getElementById('selectedIcon').innerHTML = `<i class="${this.value} fa-3x"></i>`;
        }
    });

    const iconSection = document.getElementById('iconSection');
    const oldButton = iconSection.querySelector('.icon-btn');
    if (oldButton) {
        iconSection.removeChild(oldButton);
    }

    iconSection.insertBefore(select, iconSection.firstChild);
}

window.addEventListener('load', createIconSelect);

function handleIconUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('selectedIcon').innerHTML =
                `<img src="${e.target.result}" class="uploaded-icon" alt="Uploaded Icon">`;
        }
        reader.readAsDataURL(file);
    }
}
function submitReward() {
const reward = {
name: document.getElementById('rewardName').value,
value: document.getElementById('rewardValue').value,
icon: document.getElementById('selectedIcon').innerHTML,
function: document.getElementById('customFunction').value
};

fetch('https://sorbia.pythonanywhere.com/add-reward', {
method: 'POST',
headers: {
    'Content-Type': 'application/json'
},
body: JSON.stringify(reward)
})
.then(response => {
if(response.ok) {
    alert('جایزه با موفقیت اضافه شد');
}
});
}
