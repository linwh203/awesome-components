const pswDom = document.getElementById('password')
const toggleBtn = document.getElementById('toggleBtn')
const lower = document.getElementById('lower')
const upper = document.getElementById('upper')
const number = document.getElementById('number')
const special = document.getElementById('special')
const length = document.getElementById('length')
const repeat = document.getElementById('repeat')
const sequence = document.getElementById('sequence')

const lowerPattern = /(?=.*[a-z])/
const upperPattern = /(?=.*[A-Z])/
const numberPattern = /(?=.*[0-9])/
const specialPattern = /(?=.*[!@#\$%\^&\*])/
const lengthPattern = /(?=.{8,})/
const repeatPattern = /^(?:(.)(?!\1\1))+$/

toggleBtn.onclick = function() {
  if (pswDom.type === 'password') {
    pswDom.setAttribute('type', 'text')
    toggleBtn.classList.add('hide')
  } else {
    pswDom.setAttribute('type', 'password')
    toggleBtn.classList.remove('hide')
  }
}

function checkPsw(data) {
  const checkMap = {
    lower: {
      pattern: lowerPattern,
      dom: lower
    },
    upper: {
      pattern: upperPattern,
      dom: upper
    },
    number: {
      pattern: numberPattern,
      dom: number
    },
    special: {
      pattern: specialPattern,
      dom: special
    },
    length: {
      pattern: lengthPattern,
      dom: length
    },
    repeat: {
      pattern: repeatPattern,
      dom: repeat
    },
    sequence: {
      pattern: 'custom',
      validFn: checkSequence,
      dom: sequence
    }
  }
  for(let key in checkMap) {
    console.log(checkMap[key]);
    if (checkMap[key].pattern === 'custom' ? checkMap[key].validFn(data) : checkMap[key].pattern.test(data)) {
      checkMap[key].dom.classList.add('valid')
    } else {
      checkMap[key].dom.classList.remove('valid')
    }
  }

}



// check if the value is repeated over 3 times
function checkRepeated(value) {
      //  \w => match [a-zA-Z0-9_]
      // var pattern = /^(?:(\w)(?!\1\1))+$/;
      // . => all characters
      var pattern = /^(?:(.)(?!\1\1))+$/;
    if (pattern.test(value)) {
      return true;
    } else {
      return false
    }
  }

// check if the value is sequence of numbers or alphabet
function checkSequence(s) {
  // Check for sequential numerical characters
  for(var i in s) {
    // DEBUG
    // console.log(+s[+i+1], '=', +s[i]+1)
    // console.log(+s[+i+2], '=', +s[i]+2)
    // console.log('numerical up')
    // console.log(+s[+i-1], '=', +s[i]+1)
    // console.log(+s[+i-2], '=', +s[i]+2)
    // console.log('numerical down')
    if (+s[+i+1] == +s[i]+1 && 
      +s[+i+2] == +s[i]+2) return false;
    // reserve sequential
    if (+s[+i-1] == +s[i]+1 && 
      +s[+i-2] == +s[i]+2) return false;
  }

  // Check for sequential alphabetical characters
  for(var i in s) {
    // DEBUG
    // console.log(`charCodeAt-${i}-1`, String.fromCharCode(s.charCodeAt(i)-1))
    // console.log(s[+i+1])
    // console.log(`charCodeAt-${i}-2`, String.fromCharCode(s.charCodeAt(i)-2))
    // console.log(s[+i+2])

    if (String.fromCharCode(s.charCodeAt(i)+1) == s[+i+1] && 
    String.fromCharCode(s.charCodeAt(i)+2) == s[+i+2]) return false;
      // reserve sequential
    // if (String.fromCharCode(s.charCodeAt(i)-1) == s[+i+1] && 
    // String.fromCharCode(s.charCodeAt(i)-2) == s[+i+2]) return false;
  }
      
  return true;
}