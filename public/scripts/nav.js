
document.addEventListener('DOMContentLoaded', function () {
    init();
    var rellax = new Rellax('.rellax', { horizontal: false, wrapper: 'body' });
});

function init() {
    // console.log('making the toc menu');

    // var nav = document.getElementById('TOC');
    // console.log(nav);

    var toggler = document.querySelectorAll("nav ul li");
    Array.from(toggler).forEach(item => {
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

    document.querySelectorAll('.roll').forEach(el => {
        var dice = el.getAttribute('meta-dice');

        var box = document.createElement('div');
        box.style = "display: flex;"

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
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.className = i == total - dice + 1? "selected":"";
            }
        };

        el.parentElement.insertBefore(box, el);

    });

}

function rollDice(max) {
    return 1 + Math.floor(Math.random() * max)
}
const rollDice6 = () => rollDice(6)