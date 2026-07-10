const sections = [...document.querySelectorAll("section.snap-section[id^='snap-section']")];
const scrollCues = [...document.querySelectorAll(".hero__scroll")];

if (sections.length === 0) {
    console.warn("No snap sections found.");
}

let currentSection = 0;
let isAnimating = false;
let scrollTimeout;

function getClosestSection() {
    let closest = 0;
    let smallestDistance = Infinity;

    sections.forEach((section, index) => {
        const distance = Math.abs(section.getBoundingClientRect().top);

        if (distance < smallestDistance) {
            smallestDistance = distance;
            closest = index;
        }
    });

    return closest;
}

window.addEventListener("scroll", () => {

    if (isAnimating) return;

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {

        currentSection = getClosestSection();

        const current = sections[currentSection];

        const rect = current.getBoundingClientRect();

        const movedPastThreshold = rect.top < -window.innerHeight * 0.25;

        if (movedPastThreshold && currentSection < sections.length - 1) {

            snapTo(currentSection + 1);

        } else if (rect.top > window.innerHeight * 0.25 && currentSection > 0) {

            snapTo(currentSection - 1);

        }

    }, 75);

});

scrollCues.forEach((scrollCue) => {
    const handleScrollCue = (event) => {
        event.preventDefault();

        const currentIndex = sections.findIndex((section) => section.contains(scrollCue));

        if (currentIndex >= 0 && currentIndex < sections.length - 1) {
            snapTo(currentIndex + 1);
        }
    };

    scrollCue.addEventListener("click", handleScrollCue);
    scrollCue.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handleScrollCue(event);
        }
    });
});

function snapTo(index) {

    if (index < 0 || index >= sections.length || isAnimating) {
        return;
    }

    isAnimating = true;

    const targetSection = sections[index];
    const top = targetSection.getBoundingClientRect().top + window.scrollY - 24;

    window.scrollTo({
        top,
        behavior: "smooth"
    });

    currentSection = index;

    setTimeout(() => {

        isAnimating = false;

    }, 700);

}