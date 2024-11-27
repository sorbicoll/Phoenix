let rewards = [];

window.addEventListener('load', async function() {
    try {
        const response = await fetch('https://sorbia.pythonanywhere.com/rewards');
        rewards = await response.json(); // ذخیره در متغیر전역

        const rewardsList = document.getElementById('rewardsList');

        rewards.forEach((reward, index) => {
            const newItem = document.createElement('div');
            newItem.className = 'task-item';
            newItem.id = `item${index}`;
    
            newItem.innerHTML = `
                ${reward.icon}
                <div class="item-content">
                    <div class="item-title">${reward.name}</div>
                    <div class="item-reward"><img src="https://raw.githubusercontent.com/sorbicity/Phoenix/d29c2a13ecaebb4bd506b8e197b14c01a47383e8/img/coin_small2.png" alt="SmallCoin" class="coin-very-small"> ${reward.value}</div>
                </div>
                <i class="fas fa-chevron-right arrow-icon" id="arrowRight"></i>
            `;
    
            rewardsList.appendChild(newItem);
        });
    } catch (error) {
        console.error('خطا در دریافت اطلاعات:', error);
    }
});
    function handleItemClick(itemId, reward) {
        try {
            const rewardIndex = parseInt(itemId.replace('item', ''));
            const customFunction = rewards[rewardIndex].function;
            console.log(customFunction);
            if (customFunction) {
                // اجرای تابع سفارشی
                eval(customFunction);
            } else {
                console.log(customFunction);
            }
        } catch (error) {
            console.log(`itemId: ${itemId} reward: ${reward}`);

        }
    }

document.getElementById('rewardsList').addEventListener('click', function (e) {
    if (e.target.closest('.task-item')) {
        const item = e.target.closest('.task-item');
        const reward = item.querySelector('.item-reward').textContent;
        handleItemClick(item.id, reward);
    }
});
