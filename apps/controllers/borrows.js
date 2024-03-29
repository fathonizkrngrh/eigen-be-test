"use strict";
const Op = require('sequelize').Op
const CONFIG = require('../config')
const UTILITIES = require("../utilities");
const PAGINATION = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const moment = require('moment');
const model = require("../models/mysql");
const seq = model.sequelize
const tBook = model.books
const tMember = model.members
const tMemberPenalty = model.member_penalties
const tBorrow = model.borrows

const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Borrowed Books and Members
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.list = async (req, res) => {
    const page              = req.query.page || 0
    const size              = req.query.size || 10
    const { limit, offset } = PAGINATION.parse(page, size)

    let { order_by, order_type } = req.query

    const whereClause = (query) => ({
        deleted: { [Op.eq]: 0 },
        ...(query.date_from_borrowed && query.date_to_borrowed) && {
            [Op.and]: [
                { borrowed_date: { [Op.gte]: query.date_from_borrowed } }, 
                { borrowed_date: { [Op.lte]: query.date_to_borrowed } }
            ]
        },
        ...query.status && { status: { [Op.eq]: query.status }},
        ...query.member_id && { member_id: { [Op.eq]: query.member_id }},
        ...query.book_id && { book_id: { [Op.eq]: query.book_id }}
    })

    try {
        const list = await tBorrow.findAndCountAll({
            attributes: { exclude: ['created_on', 'modified_on', 'deleted'] },
            where: whereClause(req.query),
            order: [[order_by || 'id', order_type || 'ASC']],
            ...req.query.pagination == 'true' && {
                offset      : offset,
                limit       : limit
            },
        })

        const response = RESPONSE.default
        response.request_param = req.query
        response.data  = PAGINATION.data(list, page, size)
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Borrow a Book
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.borrow = async (req, res) => {
    const body = req.body

    if (!body.member_code || (!body.book_codes || body.book_codes?.length === 0)) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap. ID Member dan ID Buku wajib diisi.`
        return res.status(400).json(response)
    }

    let total_books = body.book_codes.length
    if (total_books > 2) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Maksimal peminjaman hanya 2 jenis buku.`
        return res.status(400).json(response)
    }

    const totalBorrowedBooks = await tBorrow.count({
        where: { deleted: { [Op.eq]: 0 }, member_code: { [Op.eq]: body.member_code }, status: { [Op.eq]: 'borrowed' },}
    })

    total_books += totalBorrowedBooks
    if (total_books > 2) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Kamu sudah meminjam ${totalBorrowedBooks} buku. Maksimal peminjaman hanya 2 jenis buku.`
        return res.status(400).json(response)
    }

    let books = []
    for (let i = 0; i < body.book_codes.length; i++) {
        const bookCode = body.book_codes[i]
        const book = await tBook.findOne({ raw: true, where: { deleted: { [Op.eq]: 0 }, code: { [Op.eq]: bookCode }}})
        if (!book) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Buku dengan kode ${bookCode} tidak ditemukan.`
            return res.status(400).json(response)
        }
        if (book.stock === 0) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Stok buku ${book.title} habis.`
            return res.status(400).json(response)
        }
        books.push(book)
    }

    const member = await tMember.findOne({
        raw: true, where: { deleted: {[Op.eq]: 0 }, code: {[Op.eq]: body.member_code }}
    })
    if (!member) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Member tidak ditemukan.`
        return res.status(400).json(response)
    }

    const penalize = await tMemberPenalty.findOne({
        raw: true, where: { deleted: {[Op.eq]: 0 }, member_code: {[Op.eq]: body.member_code }, status: {[Op.eq]: 'on_penalize'},}
    })
    if (penalize) {
        const isDone = moment().isAfter(moment(penalize.date_to))
        if (isDone) {
            await penalize.update({ status: 'done'})
        } else {
            const response = RESPONSE.error('unknown')
            response.error_message = `Member masih dalam penalty.`
            return res.status(400).json(response)
        }
    }

    try {        
        let newBooks = [], updatedBooks = []
        books.forEach(async (book) => {
            newBooks.push({
                member_id: member.id,
                member_code: member.code,
                member_name: member.name,
                book_id: book.id,
                book_code: book.code,
                book_title: book.title,
                status: 'borrowed',
                borrowed_date: moment(),
                due_date: moment().add(7, 'days'),
            })

            updatedBooks.push(
                await tBook.update({
                    stock: book.stock - 1
                }, { where: { deleted: {[Op.eq]: 0 }, id: {[Op.eq]: book.id}}
                })
            )
        })

        await Promise.all([
            await tBorrow.bulkCreate(newBooks),
            updatedBooks,
        ])

        const response = RESPONSE.default
        response.data  = newBooks
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Return a Book
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.return = async (req, res) => {
    const body = req.body

    if (!body.member_code || !body.book_code) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap. ID Member dan ID Buku wajib diisi.`
        return res.status(400).json(response)
    }

    const book = await tBook.findOne({ 
        where: { deleted: { [Op.eq]: 0 }, code: { [Op.eq]: body.book_code }},
        attributes: ['id', 'stock']
    })
    if (!book) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Buku tidak ditemukan.`
        return res.status(400).json(response)
    }

    const borrowedBook = await tBorrow.findOne({ 
        where: { deleted: { [Op.eq]: 0 }, member_code: { [Op.eq]: body.member_code }, book_code: { [Op.eq]: body.book_code }, status: { [Op.eq]: 'borrowed' }}
    })
    if (!borrowedBook) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Buku tidak ditemukan dalam list peminjaman.`
        return res.status(400).json(response)
    }

    const dbTrx = await seq.transaction()
    try {
        const isLate = moment().isAfter(moment(borrowedBook.due_date))
        if (isLate) {
            const member = await tMember.findOne({
                where: { deleted: { [Op.eq]: 0}, code: { [Op.eq]: body.member_code}}
            })
    
            const [ penalty, created ] =  await tMemberPenalty.findOrCreate({
                where: { member_code: { [Op.eq]: body.member_code }, status: { [Op.eq]: 'on_penalize' }},
                defaults: {
                    member_id: member.id,
                    member_code: member.code,
                    member_name: member.name,
                    date_from: moment(),
                    date_to: moment().add(3, 'days'),
                    status: 'on_penalize',
                },
            })

            if (penalty) {
                penalty.date_to = moment().add(3, 'days')
                await penalty.save()
            }
        }

        await borrowedBook.update({
            retured_date: moment(),
            status: 'returned'
        }, { transaction: dbTrx})

        await book.update({ stock: book.stock + 1}, { transaction: dbTrx})

        await dbTrx.commit()

        const response = RESPONSE.default
        response.data  = borrowedBook
        return res.status(200).json(response)   
    } catch (err) {
        await dbTrx.rollback()
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}
