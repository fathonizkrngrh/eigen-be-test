/* 
    Terdapat string "NEGIE1", silahkan reverse alphabet nya dengan angka tetap diakhir kata Hasil = "EIGEN1"
*/

function reverse(str) {
    const chars = str.split('');
    
    const letters = chars.filter(char => /[a-zA-Z]/.test(char));
    const numbers = chars.filter(char => /\d/.test(char));
    
    const reversedLetter = letters.reverse()

    const reversedStr = reversedLetter.join('') + numbers.join('');
    
    return reversedStr
}

const string = "NEGIE1"

const result = reverse(string)
console.log("Before =", string)
console.log("Result =", result)
