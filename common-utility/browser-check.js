// This method is called Duck Typing: https://en.wikipedia.org/wiki/Duck_typing
// Refrence: https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browsers

// Opera 8.0+
export const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
export const isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
export const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

// Internet Explorer 6-11
export const isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
export const isEdge = !isIE && !!window.StyleMedia;

// Chrome 1 - 79
export const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

// Edge (based on chromium) detection
export const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

// Blink engine detection
export const isBlink = (isChrome || isOpera) && !!window.CSS;