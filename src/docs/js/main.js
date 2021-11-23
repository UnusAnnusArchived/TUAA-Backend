var iframe = document.getElementById('iframe');
initTree();
function changePage(path) {
    if (path === 'home')
        return iframe.src = 'pages/home.html';
    return iframe.src = "pages/api".concat(path, ".html");
}
function initTree() {
    var toggler = document.getElementsByClassName('caret');
    for (var i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener('click', function () {
            this.parentElement.querySelector('.nested').classList.toggle('active');
            this.classList.toggle('caret-down');
        });
    }
}
//# sourceMappingURL=main.js.map