const aTLD= "com|org|net|edu".split("|")

export const aRnd = (arr) => { return  arr[Math.floor(Math.random() * arr.length)] }
export const rndStr = () => {return `${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}` }
export const rndTLD = () => { return aRnd(aTLD)}