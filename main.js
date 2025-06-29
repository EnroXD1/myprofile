// Плавная прокрутка
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                
                // Обновляем активный пункт меню
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Прокрутка к цели
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            });
        });
        
        // Анимация при прокрутке
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                }
            });
        }, {
            threshold: 0.1
        });
        
        document.querySelectorAll('.section-hidden').forEach(section => {
            observer.observe(section);
        });
        
        // Параллакс эффект для фона
        document.addEventListener('mousemove', (e) => {
            const hero = document.querySelector('.hero');
            const moveX = (e.pageX * -1 / 50);
            const moveY = (e.pageY * -1 / 50);
            hero.style.backgroundPosition = `${moveX}px ${moveY}px`;
        });
        
        // Анимация социальных иконок
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.transform = 'translateY(-8px) scale(1.1)';
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Отправка формы
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Сообщение отправлено! Я свяжусь с вами в ближайшее время.');
                contactForm.reset();
            });
        }
        
        // Обновление активного пункта меню при прокрутке
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('nav a');
            
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (pageYOffset >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
        
        // Случайная анимация для карточек интересов
        setInterval(() => {
            const cards = document.querySelectorAll('.interest-card');
            if (cards.length > 0) {
                const randomCard = cards[Math.floor(Math.random() * cards.length)];
                randomCard.style.transform = 'translateY(-5px) rotate(1deg)';
                setTimeout(() => {
                    randomCard.style.transform = '';
                }, 1000);
            }
        }, 3000);
    // Ждём, пока DOM загрузится
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) {
    console.error('Форма #contact-form не найдена');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Находим поля формы
    const nameInput    = document.getElementById('name');
    const contactInput = document.getElementById('contact');
    const messageInput = document.getElementById('message');
    
    // Проверяем наличие полей
    if (!nameInput || !contactInput || !messageInput) {
      console.error('Одно из полей формы не найдено');
      return;
    }
    
    // Получаем и обрезаем значения
    const name    = nameInput.value.trim();
    const contact = contactInput.value.trim();
    const message = messageInput.value.trim();
    
    // Если какие-то поля пустые, можно не отправлять
    if (!name || !contact || !message) {
      alert('Пожалуйста, заполните все поля формы.');
      return;
    }
    
    // Составляем текст сообщения
    const text = `Имя: ${name}\nКонтакт: ${contact}\nСообщение: ${message}`;
    
    // Конфигурация Telegram Bot API (замените PLACEHOLDER_ на свои значения)
    const token  = '938199022:AAGVH18Pcfn5OOZOg6Kn5cQ7n-DavdzMEr0';    // токен вашего бота от @BotFather
    const chatId = '433797948';      // ID чата, куда отправлять сообщение
    
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = { chat_id: chatId, text: text };
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.ok) {
        console.error('Ошибка Telegram API:', result);
      } else {
        console.log('Сообщение отправлено', result);
        form.reset(); // очистить форму после успешной отправки
      }
    } catch (err) {
      console.error('Ошибка при fetch:', err);
    }
  });
});
