const SNAP_INDICATOR_CONFIG = {
    gestureThreshold: 0.34,
    indicatorWidth: 56,
    indicatorHeight: 56,
    fadeDuration: 220,
    fillAnimationSpeed: 0.084,
    scrollIdleTimeout: 140,
    axis: "y"
};

const SNAP_STATES = {
    IDLE: "idle",
    TRACKING: "tracking",
    ARMED: "armed",
    SNAPPING: "snapping",
    COOLDOWN: "cooldown"
};

class ScrollSnapIndicator {
    constructor(options = {}) {
        this.config = { ...SNAP_INDICATOR_CONFIG, ...options };
        this.sections = Array.from(document.querySelectorAll("section.snap-section"));
        this.element = document.querySelector(".snap-indicator[data-snap-indicator]") || this.createElement();
        this.state = SNAP_STATES.IDLE;
        this.activeIndex = this.getClosestSectionIndex();
        this.gestureProgress = 0;
        this.pendingSnapIndex = null;
        this.pendingSnapTimer = null;
        this.idleTimer = null;
        this.lastDirection = 0;
        this.boundHandleWheel = this.handleWheel.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        this.boundHandleScroll = this.handleScroll.bind(this);
        this.boundHandleVisibility = this.onVisibilityChange.bind(this);

        this.attachEvents();
        this.applyIndicatorSize();
        this.hideIndicator();
    }

    createElement() {
        const root = document.createElement("div");
        root.className = "snap-indicator";
        root.setAttribute("data-snap-indicator", "true");
        root.setAttribute("role", "status");
        root.setAttribute("aria-live", "polite");
        root.innerHTML = `
            <div class="snap-indicator__core" aria-hidden="true">
                <span class="snap-indicator__arrow">↓</span>
            </div>
        `;
        document.body.appendChild(root);
        return root;
    }

    attachEvents() {
        window.addEventListener("wheel", this.boundHandleWheel, { passive: false });
        window.addEventListener("touchmove", this.boundHandleTouchMove, { passive: false });
        window.addEventListener("touchend", this.boundHandleTouchEnd, { passive: false });
        window.addEventListener("keydown", this.boundHandleKeydown, { passive: false });
        window.addEventListener("scroll", this.boundHandleScroll, { passive: true });
        document.addEventListener("visibilitychange", this.boundHandleVisibility);
    }

    applyIndicatorSize() {
        this.element.style.setProperty("--snap-indicator-size", `${this.config.indicatorWidth}px`);
        this.element.style.setProperty("--snap-indicator-height", `${this.config.indicatorHeight}px`);
    }

    getClosestSectionIndex() {
        if (this.sections.length === 0) {
            return -1;
        }

        let closestIndex = 0;
        let smallestDistance = Infinity;

        this.sections.forEach((section, index) => {
            const distance = Math.abs(section.getBoundingClientRect().top);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    getCurrentSection() {
        if (this.activeIndex < 0 || this.activeIndex >= this.sections.length) {
            return null;
        }

        return this.sections[this.activeIndex];
    }

    setActiveIndex(index) {
        if (index >= 0 && index < this.sections.length) {
            this.activeIndex = index;
        }
    }

    showIndicator() {
        this.element.classList.add("is-visible");
        this.element.classList.remove("is-hidden");
    }

    hideIndicator() {
        this.element.classList.remove("is-visible", "is-armed", "is-snapping", "is-cooldown");
        this.element.classList.add("is-hidden");
    }

    updateIndicator() {
        const percent = Math.max(0, Math.min(1, this.gestureProgress));
        const angle = percent * 360;
        this.element.style.setProperty("--snap-indicator-progress", `${angle}deg`);
        this.element.classList.toggle("is-armed", this.state === SNAP_STATES.ARMED);
        this.element.classList.toggle("is-snapping", this.state === SNAP_STATES.SNAPPING);
        this.element.classList.toggle("is-cooldown", this.state === SNAP_STATES.COOLDOWN);
    }

    resetGesture() {
        this.gestureProgress = 0;
        this.lastDirection = 0;
        this.pendingSnapIndex = null;
        clearTimeout(this.pendingSnapTimer);
        this.pendingSnapTimer = null;
        this.state = SNAP_STATES.IDLE;
        this.updateIndicator();
        this.hideIndicator();
    }

    // State machine: tracking -> armed -> snapping -> cooldown -> idle.
    beginTracking(direction, { source = "wheel" } = {}) {
        if (this.sections.length < 2) {
            return;
        }

        const normalizedDirection = direction > 0 ? 1 : -1;
        this.showIndicator();

        if (this.state === SNAP_STATES.IDLE) {
            this.state = SNAP_STATES.TRACKING;
        }

        if (this.lastDirection && normalizedDirection !== this.lastDirection) {
            this.gestureProgress = Math.max(0, this.gestureProgress - 0.12);
        }

        this.lastDirection = normalizedDirection;
        this.gestureProgress = Math.min(1, Math.max(0, this.gestureProgress + this.config.fillAnimationSpeed));

        if (this.gestureProgress >= this.config.gestureThreshold && this.state !== SNAP_STATES.ARMED) {
            this.state = SNAP_STATES.ARMED;
            this.pendingSnapIndex = this.getNextIndex(normalizedDirection);
            this.armPendingSnap();
        } else if (this.state === SNAP_STATES.ARMED && this.gestureProgress < this.config.gestureThreshold) {
            this.state = SNAP_STATES.TRACKING;
            this.pendingSnapIndex = null;
            clearTimeout(this.pendingSnapTimer);
        }

        this.updateIndicator();

        if (source === "keyboard" && this.state === SNAP_STATES.TRACKING) {
            this.gestureProgress = Math.max(this.gestureProgress, this.config.gestureThreshold * 0.7);
            this.updateIndicator();
        }
    }

    getNextIndex(direction) {
        const currentIndex = this.activeIndex;
        if (currentIndex < 0) {
            return -1;
        }

        if (direction > 0) {
            return currentIndex < this.sections.length - 1 ? currentIndex + 1 : -1;
        }

        return currentIndex > 0 ? currentIndex - 1 : -1;
    }

    armPendingSnap() {
        clearTimeout(this.pendingSnapTimer);
        this.pendingSnapTimer = window.setTimeout(() => {
            if (this.state !== SNAP_STATES.ARMED) {
                return;
            }

            this.commitSnap();
        }, this.config.scrollIdleTimeout);
    }

    snapTo(index) {
        if (index < 0 || index >= this.sections.length) {
            return;
        }

        this.state = SNAP_STATES.SNAPPING;
        this.gestureProgress = 1;
        this.pendingSnapIndex = index;
        this.updateIndicator();

        const target = this.sections[index];
        if (!target) {
            return;
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        this.activeIndex = index;

        window.setTimeout(() => {
            this.state = SNAP_STATES.COOLDOWN;
            this.updateIndicator();
            window.setTimeout(() => {
                this.state = SNAP_STATES.IDLE;
                this.gestureProgress = 0;
                this.updateIndicator();
                window.setTimeout(() => {
                    this.hideIndicator();
                }, this.config.fadeDuration);
            }, this.config.fadeDuration);
        }, 700);
    }

    commitSnap() {
        if (this.pendingSnapIndex === null || this.pendingSnapIndex < 0) {
            return;
        }

        this.state = SNAP_STATES.SNAPPING;
        this.updateIndicator();

        const target = this.sections[this.pendingSnapIndex];
        if (!target) {
            return;
        }

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        this.activeIndex = this.pendingSnapIndex;
        this.pendingSnapIndex = null;

        window.setTimeout(() => {
            this.state = SNAP_STATES.COOLDOWN;
            this.gestureProgress = 1;
            this.updateIndicator();
            window.setTimeout(() => {
                this.state = SNAP_STATES.IDLE;
                this.gestureProgress = 0;
                this.updateIndicator();
                window.setTimeout(() => {
                    this.hideIndicator();
                }, this.config.fadeDuration);
            }, this.config.fadeDuration);
        }, 700);
    }

    handleWheel(event) {
        if (this.sections.length < 2) {
            return;
        }

        const direction = Math.sign(event.deltaY);
        if (direction === 0) {
            return;
        }

        event.preventDefault();
        this.beginTracking(direction);
    }

    handleTouchMove(event) {
        if (this.sections.length < 2 || event.touches.length === 0) {
            return;
        }

        const touch = event.touches[0];
        const direction = touch.clientY > window.innerHeight * 0.5 ? 1 : -1;
        event.preventDefault();
        this.beginTracking(direction, { source: "touch" });
    }

    handleTouchEnd() {
        if (this.state === SNAP_STATES.ARMED) {
            this.commitSnap();
            return;
        }

        this.resetGesture();
    }

    handleKeydown(event) {
        if (event.key !== "ArrowDown") {
            return;
        }

        event.preventDefault();

        if (this.state === SNAP_STATES.IDLE) {
            this.beginTracking(1, { source: "keyboard" });
            return;
        }

        if (this.state === SNAP_STATES.TRACKING) {
            this.state = SNAP_STATES.ARMED;
            this.pendingSnapIndex = this.getNextIndex(1);
            this.gestureProgress = this.config.gestureThreshold;
            this.armPendingSnap();
            this.updateIndicator();
            return;
        }

        if (this.state === SNAP_STATES.ARMED) {
            this.commitSnap();
        }
    }

    handleScroll() {
        clearTimeout(this.idleTimer);
        this.activeIndex = this.getClosestSectionIndex();

        this.idleTimer = window.setTimeout(() => {
            if (this.state === SNAP_STATES.ARMED) {
                this.commitSnap();
            } else if (this.state === SNAP_STATES.TRACKING) {
                this.resetGesture();
            }
        }, this.config.scrollIdleTimeout);
    }

    onVisibilityChange() {
        if (document.visibilityState === "hidden") {
            this.resetGesture();
        }
    }
}

const scrollSnapIndicator = new ScrollSnapIndicator();

window.ScrollSnapIndicator = ScrollSnapIndicator;
window.scrollSnapIndicator = scrollSnapIndicator;
