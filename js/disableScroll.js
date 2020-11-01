// window - чтобы было доступно в других файлах

window.disableScroll = function () {

    // от ширины браузера вместе со скроллом отнять ширину окна
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    // добавляем позицию по У в объект body
    document.body.dbScrollY = window.scrollY
    // или через дата-атрибуты
    // document.body.dataset.scrollY = window.scrollY

    // перезапишет, если есть стили у body ( тогда добавлять класс )
    document.body.style.cssText = `
        position: fixed;
        overflow: hidden;
        top: ${-window.scrollY}px;
        left: 0;
        width: 100%;
        heught: 100vh;
        padding-right: ${widthScroll}px;
    `;
}

window.enableScroll = function () {
    document.body.style.cssText = ``;
    window.scroll({top: document.body.dbScrollY});
}
