
document.addEventListener('DOMContentLoaded', function () {
    init();
});

function init() {
    var rellax = new Rellax('.rellax', { horizontal: false, wrapper: 'body' });

    var navList = document.querySelectorAll("nav ul li");
    navList.forEach(item => {
        if (item.querySelector("li")) {
            // console.log(item);
            var div = document.createElement("div");
            div.classList.add("folder");
            div.addEventListener("click", (event) => {
                div.parentElement.classList.toggle("active");
                div.classList.toggle("active");
            });

            item.prepend(div);
        }
    });

    // TOC highlighter
    const anchors = document.querySelectorAll(".anchor");

    const navListItems = document.querySelectorAll("nav li");
    document.body.addEventListener('scroll', function (event) {
        var current = null;
        anchors.forEach(a => {
            if (a.parentNode.tagName == "H1") {
                if (a.offsetTop < document.body.scrollTop + 240)
                    current = a;
            }
        });

        if (current != null) {
            var found = false;

            navListItems.forEach(li => {
                if (li.querySelector('a').href == current.href) {
                    li.classList.add("highlighted");
                    found = true;
                }
                else {
                    li.classList.remove("highlighted");
                }
            })

            if (!found) {
                console.log("can't find href " + current.href);
                console.log(navListItems);
            }
        }
    });
    // Making the roll tables
    document.querySelectorAll('.roll-simple').forEach(el => {
        var dice = el.getAttribute('meta-dice');

        var box = document.createElement('div');
        box.style = "display: flex; height: 2.4em;"

        var btn = document.createElement('div');
        btn.className = "btn";
        btn.innerHTML = `Roll ${dice}d6`;

        var diceBox = document.createElement('div');
        diceBox.className = "dicebox";

        box.appendChild(btn);
        box.appendChild(diceBox);

        btn.onclick = () => {
            diceBox.innerHTML = "";
            var total = 0;
            for (let i = 0; i < dice; i++) {
                roll = rollDice6();
                total += roll;
                diceBox.innerHTML += `<img src="images/dice-${roll}.svg" class="dice"></img>`
            }
            diceBox.innerHTML += `<div class="dicebox-result"> = ${total}</div>`
        };

        el.parentElement.insertBefore(box, el);

    });

    document.querySelectorAll('.roll').forEach(el => {
        var dice = el.getAttribute('meta-dice');
        var values = el.getAttribute('meta-values');

        if (!values) {
            values = [];
            for (var i = parseInt(dice); i <= dice * 6; i++) {
                values.push([i]);
            }
        }
        else {
            const bigList = values.split('|');
            values = Array(bigList.length);
            for (let i = 0; i < bigList.length; i++) {
                const el = bigList[i];
                values[i] = el.split(',').map(x => parseInt(x));
            }
        }

        var box = document.createElement('div');
        box.style = "display: flex; height: 2.4em; margin-bottom: 0.2em"

        var btn = document.createElement('div');
        btn.className = "btn";
        btn.innerHTML = `Roll ${dice}d6`;

        var diceBox = document.createElement('div');
        diceBox.className = "dicebox";

        box.appendChild(btn);
        box.appendChild(diceBox);

        btn.onclick = () => {
            diceBox.innerHTML = "";
            var total = 0;
            for (let i = 0; i < dice; i++) {
                roll = rollDice6();
                total += roll;
                diceBox.innerHTML += `<img src="images/dice-${roll}.svg" class="dice"></img>`
            }
            diceBox.innerHTML += `<div class="dicebox-result"> = ${total}</div>`

            var rows = el.getElementsByTagName('tr')
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                row.className = values[i - 1].indexOf(total) >= 0 ? "selected" : "";
            }
        };

        el.parentElement.insertBefore(box, el);

    });

}

function rollDice(max) {
    return 1 + Math.floor(Math.random() * max)
}
const rollDice6 = () => rollDice(6)