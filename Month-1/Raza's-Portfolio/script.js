
const textElement = document.getElementById("typing-text");

const words = [
    "Web Developer ",
    "Frontend Developer "
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {

    const currentWord = words[wordIndex];

    let displayedText = "";

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    displayedText = currentWord.substring(0, charIndex);

    textElement.innerHTML = displayedText + "<span class='cursor'>|</span>";

    let speed = isDeleting ? 60 : 120;

    if (!isDeleting && charIndex === currentWord.length) {
        speed = 1000;
        isDeleting = true;
    }

    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
    }

    setTimeout(typeEffect, speed);
}

typeEffect();

// HamBurger

const hamburger = document.getElementById("hamburger");
const navMenu = document.querySelector("nav ul");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});
