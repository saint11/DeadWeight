const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

// "3:05 pm"
function formatTime(date) {
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${date.getHours() < 12 ? 'am' : 'pm'}`;
}

// "3:05 pm, 4th October 2026"
function formatDateTime(date) {
    return `${formatTime(date)}, ${ordinal(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function ordinal(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
    return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th');
}

module.exports = { formatTime, formatDateTime };
