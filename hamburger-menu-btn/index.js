const buttons = document.querySelectorAll('.menu-button')
const btnOne = buttons[0]
const btnTwo = buttons[1]
const btnThree = buttons[2]


buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const isOpen = this.getAttribute('aria-expanded') === 'true'
        this.setAttribute('aria-expanded', !isOpen)
        const hasClick = this.getAttribute('data-click')
        if(hasClick) {
            hasClick === 'open' ? this.setAttribute('data-click', 'close')
                : this.setAttribute('data-click', 'open')
        }
    })
})
