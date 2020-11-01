'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const loginForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.rating');
const minPrice = document.querySelector('.price');
const category = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const clearCart = document.querySelector('.clear-cart');
const cardInfo = document.querySelector('.card-info');

// получаем значение из localStorage
let login = localStorage.getItem('gloDelivery');

const cart = [];

// Сохранение корзины в localStorage
const saveCart = () => {
    localStorage.setItem(login, JSON.stringify(cart));
};

// Получение данных для корзины при входе
const loadCart = () => {
    if(localStorage.getItem(login)) {
        JSON.parse(localStorage.getItem(login)).forEach(function(item) {
            cart.push(item);
        });
    }
};

// Получение данных с сервера
const getData = async (url) => {
    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`)
    }
    return await response.json();
};

const validName = function(str) {
    const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
    return nameReg.test(str);
};

const toggleModal = () => {
  modal.classList.toggle("is-open");
};

const toggleModalAuth = () => {
    loginInput.style.borderColor = '';
    modalAuth.classList.toggle('is-open');

    if (modalAuth.classList.contains('is-open')) {
        disableScroll();
    } else {
        enableScroll();
    }
};

// по клику на логотип вернуться на главную
const returnMain = () => {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
};

const autorized = () => {

    const logOut = () => {
        login = null;
        cart.length = 0;
        localStorage.removeItem('gloDelivery');

        buttonAuth.style.display = '';
        userName.style.display = '';
        buttonOut.style.display = '';
        cartButton.style.display = '';
        
        buttonOut.removeEventListener('click', logOut );

        checkAuth();
        returnMain();
    }

    // записываем имя
    userName.textContent = login;

    // если авторизован - убираем кнопку "войти", показываем имя, кнопку "выйти" и корзину
    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex';

    buttonOut.addEventListener('click', logOut );
    loadCart();
};

const notAutorized = () => {

    const logIn = event => {
        event.preventDefault();

        if(validName(loginInput.value.trim())) {
            login = loginInput.value;
            localStorage.setItem('gloDelivery', login); // свойство setItem добавляет свойство со значением
            toggleModalAuth();

            buttonAuth.removeEventListener('click', toggleModalAuth );
            closeAuth.removeEventListener('click', toggleModalAuth );
            loginForm.removeEventListener('submit', logIn);
            loginForm.reset();
            checkAuth();
        } else {
            loginInput.style.borderColor = '#ff0000';
            loginInput.style.outline = 'transparent';
        }
    }
    
    buttonAuth.addEventListener('click', toggleModalAuth );
    closeAuth.addEventListener('click', toggleModalAuth );
    loginForm.addEventListener('submit', logIn);
    modalAuth.addEventListener('click', function(e) {
        if (e.target.classList.contains('is-open')) {
            toggleModalAuth();
        }
    });
};

// проверка авторизации
const checkAuth = () => login ? autorized() : notAutorized();

const createCardRestaurant = (restaurant) => {
    const { 
        image, 
        kitchen, 
        name, 
        price, 
        stars, 
        products, 
        time_of_delivery: timeOfDelivery
    } = restaurant;

    // 2-й вариант передачи данных (заголовок, рейтинг, от...) о ресторане на страницу меню
    // в 1-ом варианте в а передать data-info="${[name, price, stars, kitchen]}"
    const card = document.createElement('a');
    card.className = 'card card-restaurant';
    card.products = products;
    card.info = [name, price, stars, kitchen];

    card.insertAdjacentHTML('afterbegin', `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title">${name}</h3>
                <span class="card-tag tag">${timeOfDelivery} мин</span>
            </div>
            <div class="card-info">
                <div class="rating">
                    ${stars}
                </div>
                <div class="price">От ${price} ₽</div>
                <div class="category">${kitchen}</div>
            </div>
        </div>
    `);

    cardsRestaurants.insertAdjacentElement('afterbegin', card); // анализирует, как HTML и вставляет сразу объекты
};

const createCardGood = ({ description, id, image, name, price }) => {

    const card = document.createElement('div');

    card.className = 'card';
    // card.id = id;

    card.insertAdjacentHTML('afterbegin', `
        <img src="${image}" alt="${name}" class="card-image"/>
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
            </div>
            <div class="card-info">
                <div class="ingredients">${description}</div>
            </div>
            <div class="card-buttons">
                <button class="button button-primary button-add-cart" id="${id}">
                    <span class="button-card-text">В корзину</span>
                    <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price card-price-bold">${price} ₽</strong>
            </div>
        </div>
    `); // создали элемент

    cardsMenu.insertAdjacentElement('beforeend', card); // вставили на странице
};

// Открывает меню ресторана
const openGoods = event => {
    const target = event.target;

    if (login) { // если авторизован, перейти в ресторан

        // поднимается по элементам пока не найдет родителя с таким селектором
        const restaurant = target.closest('.card-restaurant');

        if(restaurant) { 
            // 1-й вариант передачи данных (заголовок, рейтинг, от...) о ресторане на страницу меню
            // const info = restaurant.dataset.info.split(',');
            // const [ name, price, stars, kitchen ] = info;
            const [ name, price, stars, kitchen ] = restaurant.info;

            // сначала очищаем место для карточек меню
            cardsMenu.textContent = '';
            // прячем заголовок и рестораны
            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            // показываем меню
            menu.classList.remove('hide');

            restaurantTitle.textContent = name;
            rating.textContent = stars;
            minPrice.textContent = `От ${price} ₽`;
            category.textContent = kitchen;

            getData(`../db/${restaurant./*dataset.*/products}`)
                .then( data => data.forEach(createCardGood) );
        }
    } else {
        toggleModalAuth(); // если не авторизован, открыть окно авторизации
    }
};

const addToCart = event => {
    const target = event.target;
    const buttonAddToCart = target.closest('.button-add-cart');
    
    if(buttonAddToCart) {
        const card = target.closest('.card');
        const title = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const id = buttonAddToCart.id;

        const food = cart.find(function(item) {
            return item.id === id;
        });

        if (food) {
            food.count += 1;
        } else {
            cart.push({
                id,
                title,
                cost,
                count: 1
            });
        }
    }
    saveCart();
};

const renderCart = () => {
    modalBody.textContent = '';

    cart.forEach(function({ id, title, cost, count }) {
        const itemCart = `
            <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id="${id}">-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id="${id}">+</button>
                </div>
            </div>
        `;

        modalBody.insertAdjacentHTML('beforeend', itemCart);
    });

    const totalPrice = cart.reduce(function(result, item) {
        return result + (parseFloat(item.cost) * item.count);
    }, 0);

    modalPrice.textContent = totalPrice + ' ₽';
};

const changeCount = event => {
    const target = event.target;

    if(target.classList.contains('counter-button')) {
        const food = cart.find((item) => {
            return item.id === target.dataset.id;
        });
        if(target.classList.contains('counter-minus')) {
            food.count--;
            if(food.count === 0) {
                cart.splice(cart.indexOf(food), 1);
            }
        }
        if(target.classList.contains('counter-plus')) food.count++;

        renderCart();
    }
    saveCart();
};

function init() {
    getData('../db/partners.json').then( data => {
        data.forEach(createCardRestaurant);
    });
    
    cartButton.addEventListener("click",  renderCart );
    cartButton.addEventListener("click",  toggleModal );

    clearCart.addEventListener('click', () => {
        cart.length = 0;
        renderCart();
    });

    modalBody.addEventListener('click', changeCount);

    cardsMenu.addEventListener('click', addToCart);
    
    close.addEventListener("click", toggleModal);
    
    cardsRestaurants.addEventListener('click', openGoods);
    
    logo.addEventListener('click', returnMain);

    inputSearch.addEventListener('keydown', event => {
        if(event.keyCode === 13) {
            const target = event.target;
            const value = target.value.toLowerCase().trim();

            // очистка поля ввода
            target.value = '';

            // если пустая строка, добавляется красная рамка и через 2 сек исчезает
            if(!value || value.length < 2) {
                target.style.borderColor = 'tomato';
                target.style.outline = 'transparent';
                setTimeout(function(){
                    target.style.borderColor = '';
                }, 2000);
                return;
            }

            const goods = [];

            getData('../db/partners.json')
                .then(function(data) {
                
                    const products = data.map( item => {
                        return item.products;
                    });

                    products.forEach(function(product) {

                        getData(`../db/${product}`)
                            .then(function(data) {
                                goods.push(...data);

                                const searchGoods = goods.filter( item => {
                                    if(item.name.toLowerCase().includes(value)) {
                                        return item.name.toLowerCase().includes(value);
                                    } else {
                                        cardInfo.textContent = 'По вашему запросу ничего не найдено';
                                    }
                                   
                                });
                                console.log(searchGoods);

                                cardsMenu.textContent = '';

                                containerPromo.classList.add('hide');
                                restaurants.classList.add('hide');
                                menu.classList.remove('hide');

                                restaurantTitle.textContent = 'Результат поиска:';
                                rating.textContent = '';
                                minPrice.textContent = '';
                                category.textContent = '';

                                return searchGoods;

                            }).then( data => data.forEach(createCardGood) );

                    });
            });
        }
    });
    
    checkAuth();
    
    new Swiper('.swiper-container', {
        loop: true,
        autoplay: true,
        grabCursor: true,
        effect: 'coverflow',
    });
}

init();

getData('../db/partners.json');