const naviGo = document.querySelector('.naviGo')
const naviBack = document.querySelector('.naviBack')
const chatBox = document.querySelector('.chatBox')

naviBack.addEventListener('click', () => {
    chatBox.classList.add('hide')
})
naviGo.addEventListener('click', () => {
    chatBox.classList.remove('hide')
})