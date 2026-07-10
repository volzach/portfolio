const navbar = document.querySelector('[data-navbar]');
const brand = document.querySelector('[data-nav-brand]');
const hero = document.querySelector('.hero');
const heroScroll = document.querySelector('.hero__scroll');
const pageContext = document.body.dataset.page || 'home';

if (heroScroll) {
    heroScroll.addEventListener('click', () => {
        document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
    });
}

if (navbar && brand) {
    const setNavbarState = () => {
        const shouldShowOutline = hero ? window.scrollY > hero.offsetHeight * 0.35 : window.scrollY > 0;
        const isHomePage = pageContext === 'home';
        const isHeroActive = isHomePage && hero ? window.scrollY < hero.offsetHeight * 0.35 : false;

        navbar.classList.toggle('navbar--scrolled', shouldShowOutline);

        brand.classList.toggle('navbar__logo--disabled', isHeroActive);
        brand.setAttribute('aria-disabled', String(isHeroActive));
        brand.tabIndex = isHeroActive ? -1 : 0;

        if (isHomePage) {
            if (isHeroActive) {
                brand.removeAttribute('href');
            } else {
                brand.setAttribute('href', '#top');
            }
        }
    };

    window.addEventListener('scroll', setNavbarState, { passive: true });
    window.addEventListener('load', setNavbarState);
    setNavbarState();
}
