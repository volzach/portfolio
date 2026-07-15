const sections = Array.from(document.querySelectorAll("section.snap-section"));
const scrollCues = Array.from(document.querySelectorAll(".hero__scroll"));

if (sections.length === 0) {
    console.warn("No snap sections found.");
}

function getActiveSectionIndex() {
    return window.scrollSnapIndicator?.getClosestSectionIndex?.() ?? 0;
}

function snapTo(index) {
    if (!window.scrollSnapIndicator) {
        return;
    }

    window.scrollSnapIndicator.snapTo(index);
}

scrollCues.forEach((scrollCue) => {
    const handleScrollCue = (event) => {
        event.preventDefault();

        const currentIndex = sections.findIndex((section) => section.contains(scrollCue));
        const nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

        if (nextIndex >= 0 && nextIndex < sections.length) {
            snapTo(nextIndex);
        }
    };

    scrollCue.addEventListener("click", handleScrollCue);
    scrollCue.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handleScrollCue(event);
        }
    });
});

window.addEventListener("scroll", () => {
    const activeIndex = getActiveSectionIndex();
    if (activeIndex >= 0 && activeIndex < sections.length) {
        window.scrollSnapIndicator?.setActiveIndex?.(activeIndex);
    }
}, { passive: true });

window.snapToSection = snapTo;