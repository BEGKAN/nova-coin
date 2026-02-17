// Глобальные переменные
let userId = null;
let userData = null;
let tg = window.Telegram?.WebApp;

// Инициализация Telegram
if (tg) {
    tg.ready();
    tg.expand();
    userId = tg.initDataUnsafe?.user?.id || 'local_' + Date.now();
}

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const response = await fetch(`/api/user/${userId}`);
        if (response.ok) {
            userData = await response.json();
        } else {
            // Создаем локально если сервер не доступен
            userData = {
                user_id: userId,
                first_name: tg?.initDataUnsafe?.user?.first_name || 'Игрок',
                balance: 500,
                perClick: 0.056,
                perSec: 0.054,
                clickMultiplier: 1,
                critChance: 0.1,
                nameColor: '#ffd966',
                totalClicks: 0,
                totalEarned: 0,
                todayEarned: 0,
                lastReset: new Date().toDateString(),
                upgrades: []
            };
        }
        updateUI();
    } catch (e) {
        console.log('Offline mode');
        userData = {
            user_id: userId,
            first_name: 'Игрок',
            balance: 500,
            perClick: 0.056,
            perSec: 0.054,
            clickMultiplier: 1,
            critChance: 0.1,
            nameColor: '#ffd966',
            totalClicks: 0,
            totalEarned: 0,
            todayEarned: 0,
            lastReset: new Date().toDateString(),
            upgrades: []
        };
        updateUI();
    }
}

// Сохранение данных (отправка на сервер)
function saveUserData() {
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'update_user',
            user_data: userData
        }));
    }
    // Также можно отправлять fetch запросом
    fetch('/api/user/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData)
    }).catch(e => console.log('Offline'));
}

// Обновление UI
function updateUI() {
    document.querySelectorAll('[id="userName"]').forEach(el => {
        if (el) el.textContent = userData.first_name;
    });
    document.querySelectorAll('[id="balanceDisplay"]').forEach(el => {
        if (el) el.textContent = userData.balance.toFixed(2);
    });
    document.querySelectorAll('[id="perSecDisplay"]').forEach(el => {
        if (el) el.textContent = '+' + userData.perSec.toFixed(3);
    });
    document.querySelectorAll('[id="perClickDisplay"]').forEach(el => {
        if (el) el.textContent = '+' + (userData.perClick * userData.clickMultiplier).toFixed(3);
    });
    document.querySelectorAll('[id="profileName"]').forEach(el => {
        if (el) {
            el.textContent = userData.first_name;
            el.style.color = userData.nameColor;
        }
    });
}

// Загрузка при старте
document.addEventListener('DOMContentLoaded', loadUserData);