let coins = 0;
let league = "Bronze";
let highestLeague = "Bronze";
let tEnergy = 500;
let energy = 500;
let clickP = 1;
let regen = 1;
let fullSh = 0;
let bostp = 0;
let multitapLevel = 0;
let energyLimitLevel = 0;
let rechargingLevel = 0;
let offSec = 0;
let lastOnlineTime = Date.now();
let rotationCount = 0;
let isRotating = false;
let isCovered = false;
let clickStartTime = null;
let lastClickTime = null;
let hasTapBot = false;
let lastSpinReward = localStorage.getItem("lastSpinReward") || 0;

const CLICK_THRESHOLD = 500; // milliseconds between clicks
const TIME_LIMIT = 60000; // 1 minute in milliseconds

const homeCoinsDisplay = document.getElementById("homeCoinsDisplay");
const homeLeagueDisplay = document.getElementById("homeLeagueDisplay");
const energyDisplay = document.getElementById("energyDisplay");
const energyProgress = document.getElementById("energyProgress");
const largeCoin = document.getElementById("largeCoin");
const clickValue = document.getElementById("clickValue");

let tg = window.Telegram?.WebApp;
if (tg) {
  tg.setHeaderColor("#1e293b"); // رنگ هدر
  tg.setBackgroundColor("#1e293b"); // رنگ پس زمینه
  tg.MainButton.setParams({
    text_color: "#ffffff", // رنگ متن دکمه اصلی 
    color: "#3b82f6" // رنگ دکمه اصلی
  });
}


function resetGameData() {
  // ریست متغیرهای اصلی
  coins = 0;
  league = "Bronze";
  highestLeague = "Bronze";
  tEnergy = 500;
  energy = 500;
  clickP = 1;
  regen = 1;
  fullSh = 0;
  bostp = 0;
  multitapLevel = 0;
  energyLimitLevel = 0;
  rechargingLevel = 0;
  hasTapBot = false;
  lastSpinReward = 0;

  // پاک کردن تسک‌های انجام شده
  document.querySelectorAll(".task-item").forEach((task) => {
    task.classList.remove("completed");
    const icon = task.querySelector(".fa-check");
    if (icon) {
      icon.className = "fas fa-chevron-right";
      icon.style.color = "";
    }
    task.style.opacity = "";
    task.style.cursor = "pointer";
  });

  // ریست قیمت‌ها و سطح‌ها
  document.getElementById("feeCoinTap").textContent = "250";
  document.getElementById("feeTotalEnergy").textContent = "250";
  document.getElementById("feeRegEnergy").textContent = "25000";
  document.getElementById("lvlCoinTap").textContent = "1 level";
  document.getElementById("lvlTotalEnergy").textContent = "1 level";
  document.getElementById("lvlRegEnergy").textContent = "1 level";

  // ریست بوسترهای روزانه
  document.getElementById("boost_tap_cont").textContent = "0";
  document.getElementById("full_chargh_cont").textContent = "0";
  document.querySelector(".booster-btn.left-btn").disabled = false;
  document.querySelector(".booster-btn.right-btn").disabled = false;

  // پاک کردن localStorage
  localStorage.removeItem("gameState");

  // آپدیت نمایش
  updateDisplays();
}

// ذخیره در CloudStorage تلگرام
function saveUserState() {
  const state = {
    game: {
      coins: coins,
      league: league,
      highestLeague: highestLeague,
      clickPower: clickP,
      lastSpinReward: lastSpinReward,
      energy: {
        current: energy,
        max: tEnergy,
        regen: regen,
      },
      upgrades: {
        multitapLevel: multitapLevel,
        energyLimitLevel: energyLimitLevel,
        rechargingLevel: rechargingLevel,
        hasTapBot: hasTapBot,
      },
      dailyBoosters: {
        fullShield: fullSh,
        boostPower: bostp,
      },
      tasks: {
        completedTasks: document.querySelectorAll(".task-item.completed")
          .length,
        tasksList: Array.from(document.querySelectorAll(".task-item")).map(
          (task) => ({
            id: task.dataset.taskId,
            completed: task.classList.contains("completed"),
          })
        ),
      },
      boostPrices: {
        multitap: document.getElementById("feeCoinTap").textContent,
        energyLimit: document.getElementById("feeTotalEnergy").textContent,
        recharging: document.getElementById("feeRegEnergy").textContent,
      },
      dailyBoosts: {
        tapBoostCount: document.getElementById("boost_tap_cont").textContent,
        fullChargeCount:
          document.getElementById("full_chargh_cont").textContent,
      },
    },
  };

  localStorage.setItem("gameState", JSON.stringify(state));
}

function loadUserState() {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    const state = JSON.parse(savedState);

    // بازیابی متغیرهای قبلی
    coins = state.game.coins || 0;
    league = state.game.league || "Bronze";
    highestLeague = state.game.highestLeague || "Bronze";
    energy = state.game.energy.current || 500;
    tEnergy = state.game.energy.max || 500;
    regen = state.game.energy.regen || 1;
    clickP = state.game.clickPower || 1;

    // بازیابی ارتقاء‌ها
    multitapLevel = state.game.upgrades.multitapLevel || 0;
    energyLimitLevel = state.game.upgrades.energyLimitLevel || 0;
    rechargingLevel = state.game.upgrades.rechargingLevel || 0;
    hasTapBot = state.game.upgrades.hasTapBot || false;

    // بازیابی بوسترهای روزانه
    fullSh = state.game.dailyBoosters.fullShield || 0;
    bostp = state.game.dailyBoosters.boostPower || 0;

    // بازیابی وضعیت تسک‌ها
    if (state.game.tasks) {
      state.game.tasks.tasksList.forEach((task) => {
        const taskElement = document.querySelector(
          `[data-task-id="${task.id}"]`
        );
        if (taskElement && task.completed) {
          taskElement.classList.add("completed");
          markTaskAsCompleted(taskElement);
        }
      });
    }
    // بازیابی قیمت‌ها
    if (state.game.boostPrices) {
      document.getElementById("feeCoinTap").textContent =
        state.game.boostPrices.multitap;
      document.getElementById("feeTotalEnergy").textContent =
        state.game.boostPrices.energyLimit;
      document.getElementById("feeRegEnergy").textContent =
        state.game.boostPrices.recharging;
    }

    // بازیابی سطح‌ها
    document.getElementById("lvlCoinTap").textContent = `${
      multitapLevel + 1
    } level`;
    document.getElementById("lvlTotalEnergy").textContent = `${
      energyLimitLevel + 1
    } level`;
    document.getElementById("lvlRegEnergy").textContent = `${
      rechargingLevel + 1
    } level`;

    // بازیابی تعداد ارتقاء‌های روزانه
    if (state.game.dailyBoosts) {
      document.getElementById("boost_tap_cont").textContent =
        state.game.dailyBoosts.tapBoostCount;
      document.getElementById("full_chargh_cont").textContent =
        state.game.dailyBoosts.fullChargeCount;

      // غیرفعال کردن دکمه‌ها اگر به حداکثر رسیده‌اند
      if (state.game.dailyBoosts.tapBoostCount >= 3) {
        document.querySelector(".booster-btn.left-btn").disabled = true;
      }
      if (state.game.dailyBoosts.fullChargeCount >= 3) {
        document.querySelector(".booster-btn.right-btn").disabled = true;
      }
    }

    updateDisplays();
    updateBoostPage();
  }
}

// ذخیره خودکار
setInterval(saveUserState, 5000);

// ذخیره هنگام خروج
window.addEventListener("beforeunload", saveUserState);

// بازیابی هنگام ورود
// اجرای توابع در زمان لود صفحه
document.addEventListener("DOMContentLoaded", () => {
  loadUserState();
  updateReferralUI();
  checkReferral();
  updateInvitedUsersList();
  setInterval(updateInvitedUsersLevel, 24 * 60 * 60 * 1000);
  checkOfflineTime();
  tg.expand();
});

function updateDisplays() {
  updateLeague(); // اضافه کردن این خط
  homeCoinsDisplay.textContent = coins;
  homeLeagueDisplay.textContent = league;
  energyDisplay.textContent = `${energy} / ${tEnergy}`;
  energyProgress.style.width = `${(energy / tEnergy) * 100}%`;
  updateBoostPage();
  updateTaskPage();
}
// تولید کد دعوت منحصر به فرد
function generateReferralCode() {
  const userId = tg.initDataUnsafe?.user?.id || Math.random().toString(36);
  return `REF${userId}${Math.random().toString(36).substr(2, 6)}`.toUpperCase();
}

// ساخت لینک دعوت تلگرام
function generateTelegramRefLink() {
  const botUsername = "PhoenixINC_bot/Phoenix";
  const userCode = generateReferralCode();
  return `https://t.me/${botUsername}?start=${userCode}`;
}

// آپدیت رابط کاربری رفرال
function updateReferralUI() {
  const referralCodeElement = document.getElementById("referralCode");
  if (referralCodeElement) {
    const telegramLink = generateTelegramRefLink();
    referralCodeElement.textContent = telegramLink;
  }
}

function updateInvitedUsersList() {
  const userList = document.querySelector(".user-list");
  const invitedUsers = JSON.parse(localStorage.getItem("invitedUsers") || "{}");
  const currentUserCode = generateReferralCode();
  const userInvites = invitedUsers[currentUserCode] || [];

  userList.innerHTML = userInvites
    .map(
      (user) => `
    <div class="user-item">
      <div class="user-info">
        ${
          user.photo
            ? `<img src="${user.photo}" alt="${user.name}" class="user-avatar">`
            : '<i class="fas fa-user-circle"></i>'
        }
        <span>${user.name}</span>
      </div>
      <div class="user-level">
        <i class="fas fa-trophy"></i>
        <span>${user.league}</span>
      </div>
    </div>
  `
    )
    .join("");
}

function shareReferralLink() {
  const referralLink = generateTelegramRefLink();

  if (navigator.share) {
    navigator
      .share({
        title: "Join Phoenix Game",
        text: "Hey! Join me in Phoenix Game and earn rewards!",
        url: referralLink,
      })
      .catch((error) => console.log("Error sharing:", error));
  } else {
    // برای مرورگرهایی که Web Share API رو پشتیبانی نمی‌کنند
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodeURIComponent("Join Phoenix Game!")}`,
      "_blank"
    );
  }
}

function createFloatingNumber() {
  const floatingNumber = document.createElement("div");
  floatingNumber.textContent = `+${clickP}`;
  floatingNumber.className = "click-value";

  // شروع از نوار پیشرفت
  const progressBar = document.querySelector(".progress-bar");
  const startRect = progressBar.getBoundingClientRect();
  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top;

  floatingNumber.style.left = `${startX}px`;
  floatingNumber.style.top = `${startY}px`;

  document.body.appendChild(floatingNumber);

  // حرکت به سمت شمارنده سکه‌ها
  const coinsCounter = document.querySelector(".coins");
  const targetRect = coinsCounter.getBoundingClientRect();

  floatingNumber.animate(
    [
      {
        transform: "translate(-50%, 0) scale(1)",
        opacity: 1,
        color: "#3b82f6",
      },
      {
        transform: "translate(-50%, -50px) scale(2)",
        opacity: 1,
        color: "#3b82f6",
      },
      {
        transform: `translate(-50%, ${targetRect.top - startY}px) scale(0.7)`,
        opacity: 1,
        color: "#ffffff",
      },
    ],
    {
      duration: 2000,
      easing: "cubic-bezier(0.1, 1, 0.1, 1)",
    }
  );

  setTimeout(() => floatingNumber.remove(), 1000);
}

largeCoin.addEventListener("click", () => {
  if (energy >= clickP && !isCovered) {
    const currentTime = Date.now();
    const lastRewardDate = new Date(parseInt(lastSpinReward)).setHours(
      0,
      0,
      0,
      0
    );
    const todayDate = new Date().setHours(0, 0, 0, 0);

    if (!clickStartTime) {
      clickStartTime = currentTime;
    }

    if (lastClickTime && currentTime - lastClickTime > CLICK_THRESHOLD) {
      clickStartTime = currentTime;
      rotationCount = 0;
    }

    if (currentTime - clickStartTime <= TIME_LIMIT) {
      rotationCount++;
      largeCoin.style.transform = `translate(-50%, -50%) rotate(${rotationCount}deg)`;
    }

    lastClickTime = currentTime;
    coins += clickP;
    energy -= clickP;
    createFloatingNumber(clickP);
    updateDisplays();

    if (rotationCount >= 360 && rotationCount < 365) {
      isCovered = true;
      const cover = document.createElement("div");
      cover.className = "coin-cover";

      if (lastRewardDate < todayDate) {
        lastSpinReward = Date.now();
        localStorage.setItem("lastSpinReward", lastSpinReward);
        cover.innerHTML = `
          <i class="fas fa-gift"></i>
          <span>DAILY REWARD!</span>
          <span>+100,000 coins</span>
        `;
        coins += 100000;
        updateDisplays();
      } else {
        cover.innerHTML = `
          <i class="fas fa-clock"></i>
          <span>You already claimed</span>
          <span>today's reward!</span>
        `;
      }

      document.querySelector(".game-area").appendChild(cover);

      setTimeout(() => {
        cover.remove();
        isCovered = false;
        rotationCount = 0;
        clickStartTime = null;
      }, 3000);
    }
  }
});

setInterval(() => {
  if (energy < tEnergy) {
    energy = Math.min(energy + regen, tEnergy);
    updateDisplays();
  }
}, 1000);
function updateBoostPage() {
  document.getElementById("boostCoinsDisplay").textContent = coins;
  document.getElementById("boostLeagueDisplay").textContent = league;
  document.getElementById("full_chargh_cont").textContent = fullSh;
  document.getElementById("boost_tap_cont").textContent = bostp;
}
function updateTaskPage() {
  document.getElementById("taskCoinsDisplay").textContent = coins;
  document.getElementById("taskLeagueDisplay").textContent = league;
}

function fullCharge() {
  if (fullSh < 3) {
    energy = tEnergy;
    fullSh++;
    if (fullSh === 4) {
      document.querySelector(".booster-btn.right-btn").disabled = true;
    }
    updateDisplays();
    document.querySelector('[data-page="home"]').click();
  }
}
function boostingTap() {
  if (bostp < 3) {
    bostp++;
    clickP *= 7;

    // ایجاد المان انیمیشن
    const boostAnimation = document.createElement("div");
    boostAnimation.className = "boost-animation";

    // اضافه کردن تصاویر
    for (let i = 1; i <= 6; i++) {
      const img = document.createElement("img");
      img.src = `img/boost_animation/${i}.png`;
      boostAnimation.appendChild(img);
    }

    // اضافه کردن به صفحه
    document.querySelector(".game-area").appendChild(boostAnimation);

    // حذف انیمیشن بعد از 10 ثانیه
    setTimeout(() => {
      boostAnimation.remove();
      clickP /= 7;
    }, 10000);

    if (bostp === 4) {
      document.querySelector(".booster-btn.left-btn").disabled = true;
    }
    updateDisplays();
    document.querySelector('[data-page="home"]').click();
  }
}
function resetDailyBoosters() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    fullSh = 0;
    bostp = 0;
    document.querySelector(".booster-btn.right-btn").disabled = false;
    document.querySelector(".booster-btn.left-btn").disabled = false;
    updateDisplays();
  }
}

setInterval(resetDailyBoosters, 60000);

updateDisplays();

function upgradeMultitap() {
  const upgrades = [
    { cost: 250, fee: 250, level: 1 },
    { cost: 2500, fee: 2500, level: 2 },
    { cost: 5000, fee: 5000, level: 3 },
    { cost: 10000, fee: 10000, level: 4 },
    { cost: 20000, fee: 20000, level: 5 },
    { cost: 40000, fee: 40000, level: 6 },
    { cost: 80000, fee: 80000, level: 7 },
    { cost: 160000, fee: 160000, level: 8 },
    { cost: 320000, fee: 320000, level: 9 },
    { cost: 640000, fee: 640000, level: "Max" },
  ];

  if (multitapLevel < upgrades.length) {
    if (coins >= upgrades[multitapLevel].cost) {
      coins -= upgrades[multitapLevel].cost;
      clickP++;
      multitapLevel++;

      const upgrade = upgrades[multitapLevel];
      document.getElementById("feeCoinTap").textContent = upgrade.fee;
      document.getElementById(
        "lvlCoinTap"
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification("Insufficient Balance");
    }
  }
}

function upgradeEnergyLimit() {
  const upgrades = [
    { cost: 250, fee: 250, level: 1 },
    { cost: 2500, fee: 2500, level: 2 },
    { cost: 5000, fee: 5000, level: 3 },
    { cost: 10000, fee: 10000, level: 4 },
    { cost: 20000, fee: 20000, level: 5 },
    { cost: 40000, fee: 40000, level: 6 },
    { cost: 80000, fee: 80000, level: 7 },
    { cost: 160000, fee: 160000, level: 8 },
    { cost: 320000, fee: 320000, level: 9 },
    { cost: 640000, fee: 640000, level: "MAX" },
  ];

  if (energyLimitLevel < upgrades.length) {
    if (coins >= upgrades[energyLimitLevel].cost) {
      coins -= upgrades[energyLimitLevel].cost;
      tEnergy += 500;
      energyLimitLevel++;

      const upgrade = upgrades[energyLimitLevel];
      document.getElementById("feeTotalEnergy").textContent = upgrade.fee;
      document.getElementById(
        "lvlTotalEnergy"
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification("Insufficient Balance");
    }
  }
}

function upgradeRecharging() {
  const upgrades = [
    { cost: 25000, fee: 25000, level: 1 },
    { cost: 50000, fee: 50000, level: 2 },
    { cost: 100000, fee: 100000, level: 3 },
    { cost: 200000, fee: 200000, level: 4 },
    { cost: 400000, fee: 400000, level: 5 },
    { cost: 600000, fee: 600000, level: 6 },
    { cost: 800000, fee: 800000, level: 7 },
    { cost: 1600000, fee: 1600000, level: 8 },
    { cost: 3200000, fee: 3200000, level: 9 },
    { cost: 6400000, fee: 6400000, level: "MAX" },
  ];

  if (rechargingLevel < upgrades.length) {
    if (coins >= upgrades[rechargingLevel].cost) {
      coins -= upgrades[rechargingLevel].cost;
      regen++;
      rechargingLevel++;

      const upgrade = upgrades[rechargingLevel];
      document.getElementById("feeRegEnergy").textContent = upgrade.fee;
      document.getElementById(
        "lvlRegEnergy"
      ).textContent = `${upgrade.level} level`;

      updateDisplays();
    } else {
      showNotification("Insufficient Balance");
    }
  }
}

function updateLeague() {
  let newLeague = "Bronze";

  if (coins > 50000000) {
    newLeague = "Mythic";
  } else if (coins > 10000000) {
    newLeague = "Legendary";
  } else if (coins > 5000000) {
    newLeague = "Elite";
  } else if (coins > 2500000) {
    newLeague = "Grandmaster";
  } else if (coins > 1000000) {
    newLeague = "Master";
  } else if (coins > 500000) {
    newLeague = "Diamond";
  } else if (coins > 250000) {
    newLeague = "Platinum";
  } else if (coins > 50000) {
    newLeague = "Gold";
  } else if (coins > 5000) {
    newLeague = "Silver";
  }

  const leagueRanks = {
    Bronze: 1,
    Silver: 2,
    Gold: 3,
    Platinum: 4,
    Diamond: 5,
    Master: 6,
    Grandmaster: 7,
    Elite: 8,
    Legendary: 9,
    Mythic: 10,
  };

  if (leagueRanks[newLeague] > leagueRanks[highestLeague]) {
    highestLeague = newLeague;
  }

  league = highestLeague;
}

// این تابع را در زمان بارگذاری صفحه فراخوانی کنید
function checkOfflineTime() {
  const currentTime = Date.now();
  offSec = Math.floor((currentTime - lastOnlineTime) / 1000);

  // محدودیت 3 ساعته
  offSec = Math.min(offSec, 3 * 60 * 60);

  if (offSec > 0) {
    showOfflineEarnings();
  }

  lastOnlineTime = currentTime;
}

function showOfflineEarnings() {
  const earnings = offSec * regen;

  const modal = document.createElement("div");
  modal.className = "offline-modal";
  modal.innerHTML = `
        <i class="fas fa-robot"></i>
        <p>شما در مدت غیبت خود ${earnings} سکه به دست آوردید!</p>
        <button onclick="closeOfflineModal()">تایید</button>
    `;

  document.body.appendChild(modal);
}

function closeOfflineModal() {
  const modal = document.querySelector(".offline-modal");
  if (modal) {
    modal.remove();
  }
  coins += offSec * regen;
  updateDisplays();
}

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: "https://sorbicity.github.io/Phoenix/tonconnect-manifest.json",
  buttonRootId: "ton-connect-button",
});

function updateAssets(assets) {
  const walletAssets = document.getElementById("walletAssets");
  walletAssets.innerHTML = assets
    .map(
      (asset) => `
    <div class="asset-item">
      <i class="fab fa-${getAssetIcon(asset.symbol)}"></i>
      <div class="asset-info">
        <span class="asset-name">${asset.symbol}</span>
        <span class="asset-balance">${asset.balance} ${asset.symbol}</span>
      </div>
    </div>
  `
    )
    .join("");
}
tonConnectUI.onStatusChange((wallet) => {
  if (wallet) {
    const address = wallet.account.address;

    fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`)
      .then((response) => response.json())
      .then((data) => {
        // تبدیل با دقت بیشتر
        const tonBalance = Number(data.result) / 1e9;
        const tonPrice = 5.17; // قیمت به‌روز TON
        const usdValue = tonBalance * tonPrice;

        // نمایش با 4 رقم اعشار برای TON
        document.querySelector(".balance-value").textContent =
          formatBalance(usdValue);

        const walletAssets = document.getElementById("walletAssets");
        walletAssets.innerHTML = `
            <div class="asset-item">
              <i class="fab fa-telegram-plane"></i>
              <div class="asset-info">
                <span class="asset-name">TON</span>
                <span class="asset-balance">${tonBalance.toFixed(4)} TON</span>
              </div>
            </div>
          `;
      });
  } else {
    // ریست کردن تمام مقادیر به صفر
    document.querySelector(".balance-value").textContent = "0.00";

    const walletAssets = document.getElementById("walletAssets");
    walletAssets.innerHTML = `
      <div class="asset-item">
        <i class="fab fa-telegram-plane"></i>
        <div class="asset-info">
          <span class="asset-name">TON</span>
          <span class="asset-balance">0.00 TON</span>
        </div>
      </div>
    `;
  }
});
function formatBalance(value) {
  if (!value || isNaN(value)) return "0.00";
  // نمایش دلار با دو رقم اعشار
  return value.toFixed(2);
}

function getAssetIcon(symbol) {
  switch (symbol) {
    case "TON":
      return "telegram-plane";
    case "BTC":
      return "bitcoin";
    case "ETH":
      return "ethereum";
    case "USDT":
      return "usd";
    default:
      return "coin";
  }
}

function markTaskAsCompleted(taskElement) {
  // تغییر آیکن به تیک سبز
  const chevronIcon = taskElement.querySelector(".fa-chevron-right");
  chevronIcon.className = "fas fa-check";
  chevronIcon.style.color = "#4CAF50";
  chevronIcon.style.marginLeft = "auto";

  // غیرفعال کردن کلیک
  taskElement.style.opacity = "0.7";
  taskElement.style.cursor = "default";
  taskElement.onclick = null;
}

function watchYoutube() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains("completed")) {
    const reward = 1000;
    window.open("https://youtube.com/channel/YOUR_CHANNEL", "_blank");
    coins += reward;
    updateDisplays();
    taskElement.classList.add("completed");
    markTaskAsCompleted(taskElement);
  }
}

function invite3Friends() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains("completed")) {
    const reward = 5000;
    const shareText =
      "Join me in this awesome game! Use my referral code: " +
      document.getElementById("referralCode").textContent;

    if (navigator.share) {
      navigator.share({
        title: "Join My Game",
        text: shareText,
        url: window.location.href,
      });
    }

    coins += reward;
    updateDisplays();
    taskElement.classList.add("completed");
    markTaskAsCompleted(taskElement);
  }
}

function FollowOnTwitter() {
  const taskElement = event.currentTarget;
  if (!taskElement.classList.contains("completed")) {
    const reward = 10000;
    window.open("https://twitter.com/YOUR_TWITTER", "_blank");
    coins += reward;
    updateDisplays();
    taskElement.classList.add("completed");
    markTaskAsCompleted(taskElement);
  }
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "balance-notification";
  notification.textContent = "Insufficient Balance";

  // Add to boost page
  document.querySelector(".boostPage").appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function buyBot() {
  const botCost = 2000000;

  if (coins >= botCost && !hasTapBot) {
    coins -= botCost;
    hasTapBot = true;
    updateDisplays();
  } else if (!hasTapBot) {
    showNotification("Insufficient Balance");
  }
}

// بررسی و ثبت کاربر دعوت شده
function checkReferral() {
  const tg = window.Telegram?.WebApp || {
    initDataUnsafe: {
      start_param: null,
      user: {
        id: null,
        first_name: "Guest",
        photo_url: null,
      },
    },
  };

  const startParam = tg.initDataUnsafe?.start_param;

  if (startParam && startParam.startsWith("REF")) {
    const referrer = startParam;
    const invitedUser = {
      id: tg.initDataUnsafe?.user?.id,
      name: tg.initDataUnsafe?.user?.first_name,
      photo: tg.initDataUnsafe?.user?.photo_url,
      level: 1,
      lastUpdate: Date.now(),
    };

    saveInvitedUser(referrer, invitedUser);
  }
}

// آپدیت لیست کاربران دعوت شده
function updateInvitedUsersList() {
  const userList = document.querySelector(".user-list");
  const referralCode = localStorage.getItem("referralCode");
  const invitedUsers =
    JSON.parse(localStorage.getItem("invitedUsers") || "{}")[referralCode] ||
    [];

  userList.innerHTML = invitedUsers
    .map(
      (user) => `
        <div class="user-item">
            <div class="user-info">
                ${
                  user.photo
                    ? `<img src="${user.photo}" alt="${user.name}" class="user-avatar">`
                    : '<i class="fas fa-user-circle"></i>'
                }
                <span>${user.name}</span>
            </div>
            <div class="user-level">
                <i class="fas fa-trophy"></i>
                <span>${user.league || "Bronze"}</span>
            </div>
        </div>
    `
    )
    .join("");
}

function saveInvitedUser(referrer, user) {
  let invitedUsers = JSON.parse(localStorage.getItem("invitedUsers") || "{}");
  if (!invitedUsers[referrer]) {
    invitedUsers[referrer] = [];
  }

  const newUser = {
    id: user.id,
    name: user.name,
    photo: user.photo,
    league: league, // استفاده از متغیر سراسری league
  };

  invitedUsers[referrer].push(newUser);
  localStorage.setItem("invitedUsers", JSON.stringify(invitedUsers));
  updateInvitedUsersList();
}

// آپدیت سطح کاربران دعوت شده
function updateInvitedUsersLevel() {
  const referralCode = localStorage.getItem("referralCode");
  let invitedUsers = JSON.parse(localStorage.getItem("invitedUsers") || "{}");

  if (invitedUsers[referralCode]) {
    invitedUsers[referralCode] = invitedUsers[referralCode].map((user) => ({
      ...user,
      level: calculateUserLevel(user),
      lastUpdate: Date.now(),
    }));

    localStorage.setItem("invitedUsers", JSON.stringify(invitedUsers));
    updateInvitedUsersList();
  }
}

// محاسبه سطح کاربر بر اساس فعالیت
function calculateUserLevel(user) {
  const daysSinceJoined =
    (Date.now() - user.lastUpdate) / (1000 * 60 * 60 * 24);
  return Math.min(Math.floor(daysSinceJoined / 2) + user.level, 10);
}

window.addEventListener("load", () => {
  setTimeout(() => {
    const loadingPage = document.getElementById("loadingPage");
    loadingPage.style.opacity = "0";
    loadingPage.style.transition = "opacity 0.5s ease";
    setTimeout(() => {
      loadingPage.style.display = "none";
    }, 500);
  }, 10000); // تغییر از 2000 به 3000 میلی‌ثانیه
});
