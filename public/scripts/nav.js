document.addEventListener('DOMContentLoaded', function () {
    init();
})

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
}
