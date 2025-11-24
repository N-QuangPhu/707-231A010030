/* Global small script to handle product rendering, search, registration and timer */
(function(){
    // Utility: safe query
    const $ = (sel, ctx=document) => ctx.querySelector(sel);

    // Render products into #product-list
    function renderProducts(list = []){
        const container = document.getElementById('product-list');
        const error = document.getElementById('error');
        if (!container) return;

        container.innerHTML = '';
        if (!list || list.length === 0){
            if (error) error.style.display = 'block';
            return;
        }
        if (error) error.style.display = 'none';

        list.forEach(p => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `\
                <img src="${p.img}" alt="${p.name}" onerror="this.src='images/avatar.jpg'">\
                <h3>${p.name}</h3>\
                <p class="price">${p.price}</p>`;
            container.appendChild(div);
        });
    }

    // Live search hookup (runs when products array exists on page)
    document.addEventListener('DOMContentLoaded', () => {
        const search = document.getElementById('search');
        if (search && typeof products !== 'undefined'){
            // initial render
            renderProducts(products);

            search.addEventListener('input', (e)=>{
                const q = e.target.value.toLowerCase().trim();
                const filtered = products.filter(p => p.name.toLowerCase().includes(q));
                renderProducts(filtered);
            });
        }

        // Attach register handler if form exists
        const form = document.getElementById('registerForm');
        if (form) form.addEventListener('submit', handleRegister);
    });

    // Registration handler for baitap02
    function handleRegister(e){
        e.preventDefault();
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const terms = document.getElementById('terms');
        const error = document.getElementById('error');

        if (!name || !email || !password || !terms) return;
        if (!name.value.trim() || !email.value.trim() || !password.value.trim()){
            if (error) { error.textContent = 'Vui lòng điền đầy đủ thông tin.'; error.style.display='block'; }
            return;
        }
        if (!terms.checked){
            if (error) { error.textContent = 'Bạn phải đồng ý với điều khoản.'; error.style.display='block'; }
            return;
        }

        // Save to localStorage (simple demo)
        const users = JSON.parse(localStorage.getItem('site_users') || '[]');
        users.push({name:name.value.trim(), email: email.value.trim(), created: new Date().toISOString()});
        localStorage.setItem('site_users', JSON.stringify(users));

        if (error) { error.style.display='none'; }
        alert('Đăng ký thành công! (Đã lưu vào LocalStorage)');
        name.value=''; email.value=''; password.value=''; terms.checked=false;
    }

    // Countdown timer for baitap03
    window.startModernCountdown = function(){
        let timeLeft = 600;
        let timerId = null;
        let isRunning = false;
        const timerEl = document.getElementById('timer');
        const progressCircle = document.querySelector('.progress-circle');
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const modal = document.getElementById('modal');
        const alarm = document.getElementById('alarm');

        if (!timerEl || !progressCircle) return;

        const totalTime = 600;
        const radius = 140; // must match SVG r
        const circumference = 2 * Math.PI * radius;

        progressCircle.style.strokeDasharray = circumference;
        progressCircle.style.strokeDashoffset = circumference;

        function setControlsState(){
            // Stop enabled only when running
            if (stopBtn) stopBtn.disabled = !isRunning;
            if (startBtn) startBtn.disabled = false;
        }

        function updateDisplay(){
            const mins = String(Math.floor(timeLeft/60)).padStart(2,'0');
            const secs = String(timeLeft%60).padStart(2,'0');
            timerEl.textContent = `${mins}:${secs}`;
            const offset = circumference * (1 - timeLeft/totalTime);
            progressCircle.style.strokeDashoffset = offset;
            if (timeLeft < 60){ timerEl.style.color = 'var(--accent)'; progressCircle.style.stroke = 'var(--accent)'; }
            else { timerEl.style.color = ''; progressCircle.style.stroke = 'var(--primary)'; }
        }

        function startTimer(){
            if (timerId) return; // already running
            isRunning = true;
            setControlsState();
            timerId = setInterval(()=>{
                timeLeft--;
                updateDisplay();
                if (timeLeft <= 0){
                    clearInterval(timerId); timerId = null; isRunning = false; setControlsState();
                    modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false');
                    if (alarm) { try{ alarm.currentTime = 0; alarm.play(); }catch(e){} }
                    startBtn.textContent = 'Bắt đầu lại';
                }
            },1000);
            startBtn.textContent = 'Đang chạy...';
        }

        function stopTimer(){
            // pause without resetting timeLeft
            if (!timerId) return; // not running
            clearInterval(timerId); timerId = null; isRunning = false;
            startBtn.textContent = 'Tiếp tục';
            setControlsState();
        }

        function resetTimer(){
            clearInterval(timerId); timerId = null; isRunning = false; timeLeft = totalTime; updateDisplay(); progressCircle.style.stroke = 'var(--primary)'; timerEl.style.color=''; startBtn.textContent='Bắt đầu'; modal.style.display='none'; modal.setAttribute('aria-hidden','true');
            if (alarm){ try{ alarm.pause(); alarm.currentTime = 0; } catch(e){} }
            setControlsState();
        }

        // Wire up buttons
        if (startBtn) startBtn.addEventListener('click', ()=>{
            // If paused (not running and timeLeft < total), start/resume
            if (!timerId) startTimer();
        });
        if (stopBtn) stopBtn.addEventListener('click', ()=>{
            stopTimer();
        });
        if (resetBtn) resetBtn.addEventListener('click', ()=>{
            resetTimer();
        });

        // allow modal close
        const closeModal = document.getElementById('closeModal');
        if (closeModal) closeModal.addEventListener('click', ()=>{
            modal.style.display = 'none'; modal.setAttribute('aria-hidden','true');
            if (alarm){ try{ alarm.pause(); alarm.currentTime = 0; } catch(e){} }
        });

        updateDisplay();
        setControlsState();
    };

    // Expose render for pages that call it explicitly
    window.renderProducts = renderProducts;
    window.handleRegister = handleRegister;
})();