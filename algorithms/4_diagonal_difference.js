/* 
    Silahkan cari hasil dari pengurangan dari jumlah diagonal sebuah matrik NxN Contoh:
    Contoh:

    Matrix = [[1, 2, 0], [4, 5, 6], [7, 8, 9]]

    diagonal pertama = 1 + 5 + 9 = 15 
    diagonal kedua = 0 + 5 + 7 = 12 

    maka hasilnya adalah 15 - 12 = 3
*/

function diagonalDifference(matrix) {
    let diagonal1 = 0
    let diagonal2 = 0

    for (let i = 0; i < matrix.length; i++) {
        diagonal1 += matrix[i][i]
        diagonal2 += matrix[i][matrix.length - 1 - i]
    }

    const difference = Math.abs(diagonal1 - diagonal2)

    return [difference, diagonal1, diagonal2]
}

const matrix = [[1, 2, 0], [4, 5, 6], [7, 8, 9]]
const [result, d1, d2] = diagonalDifference(matrix)
console.log("Matrix : ", matrix)
console.log("Diagonal 1 : ", d1 )
console.log("Diagonal 2 : ", d2 )
console.log("Result : ", result)
