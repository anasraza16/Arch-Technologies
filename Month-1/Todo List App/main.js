let inp = document.getElementById("input");
let ul = document.getElementById("ul");

let todo = JSON.parse(localStorage.getItem("daraz")) || [];

function submit() {
    ul.innerHTML = "";

    if (inp.value.trim() === "") return;

    let obj = {
        id: Date.now(),
        text: inp.value,
        isCompleted: false,
    };

    todo.push(obj);
    localStorage.setItem("daraz", JSON.stringify(todo));

    inp.value = "";

    getTodo();
}

function getTodo() {
    ul.innerHTML = "";

    for (let i = 0; i < todo.length; i++) {

        let li = document.createElement("li");

        let span = document.createElement("span");
        span.innerText = todo[i].text;

        let id = todo[i].id;

        let btnBox = document.createElement("div");
        btnBox.className = "btn-box";

        let uptd = document.createElement("button");
        uptd.innerHTML = '<i class="fa-solid fa-pen"></i>';
        uptd.className = "update-btn";

        uptd.addEventListener("click", () => {
            uptdTodo(id);
        });

        let del = document.createElement("button");
        del.innerHTML = '<i class="fa-solid fa-trash"></i>';
        del.className = "delete-btn";

        del.addEventListener("click", () => {
            delTodo(id);
        });

        btnBox.appendChild(uptd);
        btnBox.appendChild(del);

        li.appendChild(span);
        li.appendChild(btnBox);

        ul.appendChild(li);
    }
}

// ____________________________________________________________________

function uptdTodo(id) {

    for (let i = 0; i < todo.length; i++) {

        if (todo[i].id === id) {
            let updated = prompt("Please update your value!");

            if (updated !== null && updated.trim() !== "") {
                todo[i].text = updated;
            }
        }
    }

    localStorage.setItem("daraz", JSON.stringify(todo));

    getTodo();
}


// ______________________________________________________________________


function delTodo(id) {
    let newTodo = [];

    for (let i = 0; i < todo.length; i++) {

        if (todo[i].id != id) {
            newTodo.push(todo[i]);
        }
    }

    todo = newTodo;

    localStorage.setItem("daraz", JSON.stringify(todo));

    getTodo();
}

getTodo();
