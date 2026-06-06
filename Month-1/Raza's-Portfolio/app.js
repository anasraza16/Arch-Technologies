// let form = document.getElementById("contactForm");
// let msg = document.getElementById("message");

// form.addEventListener("submit", function(e) {
//     e.preventDefault();

//     let name = document.getElementById("name").value;
//     let email = document.getElementById("email").value;
//     let details = document.getElementById("details").value;

//     console.log(name, email, details);

//     msg.innerText = "Message sent Seccessfully!"

//     form.reset();
    
// });

// let typed = new Typed('#element', {
//             strings: ['Web Developer', 'UI/UX Designer', 'App Developer'],
//             typeSpeed: 100,
//         });


// let form = document.getElementById("contactForm");

// form.addEventListener("submit", function (e) {
//     e.preventDefault();

//     let name = document.getElementById("name").value;
//     let email = document.getElementById("email").value;
//     let details = document.getElementById("details").value;

//     let phoneNumber = "923252180547"; 
//     // Example: 923001234567 (Pakistan format)

//     let message =
//         `Hello, I want to contact you:%0A` +
//         `Name: ${name}%0A` +
//         `Email: ${email}%0A` +
//         `Message: ${details}`;

//     let url = `https://wa.me/${phoneNumber}?text=${message}`;

//     window.open(url, "_blank");
// });