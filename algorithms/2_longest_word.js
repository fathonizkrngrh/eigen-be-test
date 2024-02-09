/* 
    Diberikan contoh sebuah kalimat, silahkan cari kata terpanjang dari kalimat tersebut, jika ada kata dengan panjang yang sama silahkan ambil salah satu

    Contoh:

    const sentence = "Saya sangat senang mengerjakan soal algoritma"

    longest(sentence) 
    // mengerjakan: 11 character
*/

function longestWord(sentence) {
    const words = sentence.split(' ');

    let longestWord = '';

    words.forEach(word => {
        if (word.length > longestWord.length) longestWord = word;
    });

    return longestWord;
}

const sentence = "Saya sangat senang mengerjakan soal algoritma";
const longest = longestWord(sentence);
console.log("Sentence : " + sentence);
console.log("Longest word : " +  longest)
console.log("With : " +  longest.length + " characters")