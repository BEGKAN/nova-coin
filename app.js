// Состояние приложения (хранится в памяти, можно добавить localStorage)
let user = {
    name: 'Игрок',
    balance: 0.000,
    perClick: 0.000,
    perSecond: 0.000,
    color: '#ffffff',
    totalClicks: 0,
    todayEarn: 0,
    registerTime: Date.now()
};

// Лотерея 1
let lottery1 = {
    active: false,
    players: [], // { name, amount }
    totalPool: 0,
    timer: 0,
    endTime: null,
    interval: null
};

// Лотерея 2
let lottery2 = {
    active: false,
    teamA: [],
    teamB: [],
    timer: 0,
    endTime: null,
    interval: null
};

// Промокоды
let promos = [];

// Рейтинг (демо)
let ratingPlayers = [];

// DOM элементы (будут инициализированы после загрузки)
let balanceEl, perSecEl, perClickEl, playerNameEl, clickBtn;

// Загрузка контента страницы
async function loadPage(page) {
    const container = document.getElementById('content-container');
    try {
        const response = await fetch(page + '.html');
        const html = await response.text();
        container.innerHTML = html;
        // После загрузки контента переинициализируем обработчики для этой страницы
        initPageHandlers(page);
        updateUI(); // обновить данные
    } catch (error) {
        container.innerHTML = '<div style="color:white; text-align:center;">Ошибка загрузки</div>';
    }
}

// Инициализация обработчиков в зависимости от загруженной страницы
function initPageHandlers(page) {
    if (page === 'games') {
        // Лотерея 1
        document.getElementById('playLottery1')?.addEventListener('click', playLottery1);
        // Лотерея 2
        document.getElementById('playLottery2')?.addEventListener('click', playLottery2);
    } else if (page === 'shop') {
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', buyItem);
        });
    } else if (page === 'profile') {
        document.getElementById('saveProfile')?.addEventListener('click', saveProfile);
        document.querySelectorAll('.color-dot').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.color-dot').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        document.getElementById('nickInput').value = user.name;
    } else if (page === 'promo') {
        // Промокоды табы
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                if (this.dataset.tab === 'create') {
                    document.getElementById('createPromoPanel').classList.remove('hidden');
                    document.getElementById('applyPromoPanel').classList.add('hidden');
                } else {
                    document.getElementById('createPromoPanel').classList.add('hidden');
                    document.getElementById('applyPromoPanel').classList.remove('hidden');
                }
            });
        });
        document.getElementById('createPromoBtn')?.addEventListener('click', createPromo);
        document.getElementById('applyPromoBtn')?.addEventListener('click', applyPromo);
    }
    // Для rating ничего специального не нужно, обновляется в updateUI
}

// Функции лотерей
function playLottery1() {
    let bet = 0.001;
    if (user.balance < bet) { alert('Недостаточно NC'); return; }

    if (!lottery1.active) {
        user.balance -= bet;
        lottery1.players = [{ name: user.name, amount: bet }];
        lottery1.totalPool = bet;
        lottery1.active = true;
        lottery1.timer = 120;
        lottery1.endTime = Date.now() + 120000;
        
        if (lottery1.interval) clearInterval(lottery1.interval);
        lottery1.interval = setInterval(() => {
            let remaining = Math.max(0, (lottery1.endTime - Date.now()) / 1000);
            lottery1.timer = remaining;
            
            if (remaining <= 0) {
                clearInterval(lottery1.interval);
                lottery1.active = false;
                
                if (lottery1.players.length > 0) {
                    let rand = Math.random() * lottery1.totalPool;
                    let sum = 0;
                    let winner = null;
                    for (let p of lottery1.players) {
                        sum += p.amount;
                        if (rand <= sum) { winner = p; break; }
                    }
                    if (winner) {
                        alert(`Победитель: ${winner.name} получает ${lottery1.totalPool.toFixed(3)} NC`);
                        if (winner.name === user.name) {
                            user.balance += lottery1.totalPool;
                        }
                    }
                }
                lottery1.players = [];
                lottery1.totalPool = 0;
            }
            updateUI();
        }, 100);
    } else {
        user.balance -= bet;
        let player = lottery1.players.find(p => p.name === user.name);
        if (player) {
            player.amount += bet;
        } else {
            lottery1.players.push({ name: user.name, amount: bet });
        }
        lottery1.totalPool += bet;
    }
    updateUI();
}

function playLottery2() {
    if (!lottery2.active) {
        let team = prompt('Выберите команду A или B').toUpperCase();
        if (team !== 'A' && team !== 'B') return;
        
        if (user.balance < 0.001) { alert('Недостаточно NC'); return; }
        user.balance -= 0.001;
        
        lottery2.active = true;
        lottery2.timer = 120;
        lottery2.endTime = Date.now() + 120000;
        lottery2.teamA = [];
        lottery2.teamB = [];
        
        if (team === 'A') lottery2.teamA.push(user.name);
        else lottery2.teamB.push(user.name);
        
        if (lottery2.interval) clearInterval(lottery2.interval);
        lottery2.interval = setInterval(() => {
            let remaining = Math.max(0, (lottery2.endTime - Date.now()) / 1000);
            lottery2.timer = remaining;
            
            if (remaining <= 0) {
                clearInterval(lottery2.interval);
                lottery2.active = false;
                
                if (lottery2.teamA.length > lottery2.teamB.length) {
                    alert('Победила команда A!');
                    if (lottery2.teamA.includes(user.name)) {
                        user.balance += (lottery2.teamA.length + lottery2.teamB.length) * 0.001;
                    }
                } else if (lottery2.teamB.length > lottery2.teamA.length) {
                    alert('Победила команда B!');
                    if (lottery2.teamB.includes(user.name)) {
                        user.balance += (lottery2.teamA.length + lottery2.teamB.length) * 0.001;
                    }
                } else {
                    alert('Ничья! Возврат ставок');
                    if (lottery2.teamA.includes(user.name) || lottery2.teamB.includes(user.name)) {
                        user.balance += 0.001;
                    }
                }
                lottery2.teamA = [];
                lottery2.teamB = [];
            }
            updateUI();
        }, 100);
    } else {
        if (lottery2.teamA.includes(user.name) || lottery2.teamB.includes(user.name)) {
            alert('Вы уже сделали ставку!');
            return;
        }
        
        let team = prompt('Выберите команду A или B').toUpperCase();
        if (team !== 'A' && team !== 'B') return;
        
        if (user.balance < 0.001) { alert('Недостаточно NC'); return; }
        user.balance -= 0.001;
        
        if (team === 'A') lottery2.teamA.push(user.name);
        else lottery2.teamB.push(user.name);
    }
    updateUI();
}

// Магазин
function buyItem(e) {
    let type = e.target.dataset.type;
    if (type === 'click' && user.balance >= 10) {
        user.balance -= 10;
        user.perClick += 0.01;
    } else if (type === 'sec' && user.balance >= 15) {
        user.balance -= 15;
        user.perSecond += 0.01;
    } else if (type === 'superclick' && user.balance >= 50) {
        user.balance -= 50;
        user.perClick += 0.1;
    } else if (type === 'autofarm' && user.balance >= 80) {
        user.balance -= 80;
        user.perSecond += 0.2;
    } else {
        alert('Недостаточно NC');
        return;
    }
    updateUI();
}

// Профиль
function saveProfile() {
    if (user.balance < 50) { alert('Нужно 50 NC'); return; }
    
    let newName = document.getElementById('nickInput').value.trim();
    if (newName) user.name = newName;
    
    let selectedColor = document.querySelector('.color-dot.selected')?.dataset.color;
    if (selectedColor) user.color = selectedColor;
    
    user.balance -= 50;
    updateUI();
}

// Промокоды
function createPromo() {
    let name = document.getElementById('promoName').value.trim();
    let sum = parseFloat(document.getElementById('promoSum').value);
    let acts = parseInt(document.getElementById('promoActivations').value);
    
    if (!name || isNaN(sum) || isNaN(acts) || sum <= 0 || acts <= 0) {
        alert('Неверные данные');
        return;
    }
    
    if (user.balance < sum * acts) {
        alert('Недостаточно NC для создания');
        return;
    }
    
    user.balance -= sum * acts;
    promos.push({ code: name, amount: sum, remaining: acts });
    alert('Промокод создан!');
    updateUI();
}

function applyPromo() {
    let code = document.getElementById('promoCode').value.trim();
    let promo = promos.find(p => p.code === code && p.remaining > 0);
    
    if (!promo) {
        alert('Недействительный промокод');
        return;
    }
    
    user.balance += promo.amount;
    promo.remaining--;
    alert(`Получено ${promo.amount} NC!`);
    updateUI();
}

// Обновление интерфейса (верхняя часть + специфичные элементы)
function updateUI() {
    if (!balanceEl) return; // если еще не инициализированы
    balanceEl.textContent = user.balance.toFixed(3);
    perSecEl.textContent = '+' + user.perSecond.toFixed(3);
    perClickEl.textContent = '+' + user.perClick.toFixed(3);
    playerNameEl.textContent = user.name;
    playerNameEl.style.color = user.color;

    // Обновление информации на текущей странице
    const page = document.querySelector('.nav-item.active')?.dataset.page;
    if (page === 'games') {
        // Лотерея 1
        if (lottery1.active) {
            document.getElementById('lottery1Timer').textContent = formatTime(lottery1.timer);
            let player = lottery1.players.find(p => p.name === user.name);
            let chance = player ? (player.amount / lottery1.totalPool * 100).toFixed(2) : '0';
            document.getElementById('lottery1Chance').textContent = chance + '%';
            
            let playersHtml = '';
            lottery1.players.forEach(p => {
                playersHtml += `<div class="player-row"><span>${p.name}</span><span>${p.amount.toFixed(3)}</span></div>`;
            });
            document.getElementById('lottery1Players').innerHTML = playersHtml || '<div>Нет участников</div>';
        } else {
            document.getElementById('lottery1Timer').textContent = '00:00';
            document.getElementById('lottery1Chance').textContent = '0%';
            document.getElementById('lottery1Players').innerHTML = '<div>Лотерея неактивна</div>';
        }

        // Лотерея 2
        if (lottery2.active) {
            document.getElementById('lottery2Timer').textContent = formatTime(lottery2.timer);
            document.getElementById('teamAPlayers').textContent = lottery2.teamA.length;
            document.getElementById('teamBPlayers').textContent = lottery2.teamB.length;
            let userTeam = '—';
            if (lottery2.teamA.includes(user.name)) userTeam = 'A';
            else if (lottery2.teamB.includes(user.name)) userTeam = 'B';
            document.getElementById('userTeam').textContent = userTeam;
        } else {
            document.getElementById('lottery2Timer').textContent = '00:00';
            document.getElementById('teamAPlayers').textContent = '0';
            document.getElementById('teamBPlayers').textContent = '0';
            document.getElementById('userTeam').textContent = '—';
        }
    } else if (page === 'rating') {
        let allPlayers = [
            { name: user.name, balance: user.balance, color: user.color },
            ...ratingPlayers
        ].sort((a,b) => b.balance - a.balance).slice(0, 10);
        
        let ratingHtml = '';
        if (allPlayers.length === 0) {
            ratingHtml = '<div class="rating-row">Нет игроков</div>';
        } else {
            allPlayers.forEach(p => {
                ratingHtml += `<div class="rating-row"><span style="color:${p.color}">${p.name}</span><span>${p.balance.toFixed(3)}</span></div>`;
            });
        }
        document.getElementById('ratingList').innerHTML = ratingHtml;
    } else if (page === 'profile') {
        document.getElementById('todayEarn').textContent = user.todayEarn.toFixed(3) + ' NC';
        let totalSec = Math.floor((Date.now() - user.registerTime) / 1000);
        document.getElementById('totalTime').textContent = totalSec + ' сек';
        document.getElementById('totalClicks').textContent = user.totalClicks;
    }
}

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

// Инициализация при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
    balanceEl = document.getElementById('balanceDisplay');
    perSecEl = document.getElementById('perSecondDisplay');
    perClickEl = document.getElementById('perClickDisplay');
    playerNameEl = document.getElementById('playerNameDisplay');
    clickBtn = document.getElementById('clickButton');

    // Клик по N
    clickBtn.addEventListener('click', function() {
        user.balance += 0.001;  // фиксированная награда за клик
        user.totalClicks++;
        user.todayEarn += 0.001;
        updateUI();
        
        this.style.transform = 'translateY(8px)';
        this.style.boxShadow = '0 2px 0 #666666, 0 15px 25px rgba(0,0,0,0.6)';
        setTimeout(() => {
            this.style.transform = '';
            this.style.boxShadow = '0 10px 0 #666666, 0 20px 30px rgba(0,0,0,0.6)';
        }, 80);
    });

    // Пассивный доход
    setInterval(() => {
        user.balance += user.perSecond;
        user.todayEarn += user.perSecond;
        updateUI();
    }, 1000);

    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const page = this.dataset.page;
            loadPage(page);
        });
    });

    // Загружаем начальную страницу (games)
    loadPage('games');
});