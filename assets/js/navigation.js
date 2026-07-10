const sections = [...document.querySelectorAll(".snap-section")];

let currentSection = 0;
let isAnimating = false;

// Keep track of the section currently closest to the top
function updateCurrentSection() {
    let closest = 0;
    let smallestDistance = Infinity;

    sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closest = index;
        }
    });

    currentSection = closest;
}

window.addEventListener("scroll", updateCurrentSection);

window.addEventListener("wheel", (event) => {

    if (isAnimating) return;

    if (Math.abs(event.deltaY) < 30) return;

    let target = currentSection;

    if (event.deltaY > 0) {

        target++;

    } else {

        target--;

    }

    target = Math.max(0, Math.min(target, sections.length - 1));

    if (target === currentSection) return;

    isAnimating = true;

    sections[target].scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    setTimeout(() => {
        isAnimating = false;
        updateCurrentSection();
    }, 700);

});