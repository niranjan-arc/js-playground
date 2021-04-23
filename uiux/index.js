Element.prototype.toggleClass = function(className) {
    if(this.className.indexOf(className) > -1) {
        this.className = this.className.replaceAll(className, "").trim()
    } else {
        this.className = (this.className ? this.className + ' ' : '') + className
    }
}

let isNavActive = false;
document.getElementById('control').addEventListener('click', toggleNav)

function toggleNav(event) {
    document.querySelector('.container nav').toggleClass('active')
    isNavActive= !isNavActive;
    event.stopPropagation()
}


document.addEventListener('click', function(event){
    if(isNavActive) {
        event.preventDefault()
        document.getElementById('control').click()
    }
})