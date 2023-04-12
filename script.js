const loader = document.querySelector('.loader');
const content = document.querySelector('.content');

window.addEventListener('load', e => {
    setTimeout(() => {
        loader.classList.add('.fadeOut');
        setTimeout(() => {
            loader.style.display = 'none';
            document.body.style.overflowY = 'overlay';
            content.classList.add('.fadeIn');
            content.style.display = 'block';
        }, 1000);
    }, 5000)
})

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    })
})

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

document.addEventListener("DOMContentLoaded", function(event) {

    const contactForm = document.querySelector("#contact form");

    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const subject = contactForm.querySelector('input[type="text"]').value;
        const message = contactForm.querySelector('textarea').value;

        const formData = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;

        const mailToLink = `mailto:ceazarjaydiaz@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(formData)}`;
        window.location.href = mailToLink;

        contactForm.querySelector('input[type="text"]').value = "";
        contactForm.querySelector('input[type="email"]').value = "";
        contactForm.querySelector('input[type="text"]').value = "";
        contactForm.querySelector('textarea').value = "";
    });
});