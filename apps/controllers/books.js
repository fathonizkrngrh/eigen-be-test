"use strict";
const Op = require('sequelize').Op
const CONFIG = require('../config')
const UTILITIES = require("../utilities");
const PAGINATION = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const model = require("../models/mysql")
const tBook = model.books
const tBorrow = model.borrows

const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Books
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
        stock: { [Op.not]: 0 },
        ...query.search && { 
            [Op.or]: {
                title: { [Op.like]: `%${query.search}%` },
                code: { [Op.like]: `%${query.search}%` },
            }
        },
    })

    try {
        const list = await tBook.findAndCountAll({
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
 * Function Create Books
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.create = async (req, res) => {
    const body = req.body

    const requiredAttributes = { code: "Kode", title: 'Judul', author: 'Penulis', stock: "Stok" }
    for (const key of Object.keys(requiredAttributes)) {
        if (!body[key]) {
            const response = RESPONSE.error('unknown')
            response.error_message = `${requiredAttributes[key]} wajib diisi.`
            return res.status(400).json(response)
        }
    }

    try {
        const book = await tBook.create({
            code: body.code,
            title: body.title,
            stock: +body.stock,
            author: body.author,
        })

        const response = RESPONSE.default
        response.data  = book
        return res.status(201).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Update Books
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.update = async (req, res) => {
    const body = req.body

    if (!body.book_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const book = await tBook.findOne({ where: { id: { [Op.eq]: body.book_id }, deleted: { [Op.eq]: 0 } }})
        if (!book) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Buku tidak ditemukan.`
            return res.status(400).json(response)
        }    

        const keys = Object.keys(req.body)
        keys.forEach((key, index) => book[key] = req.body[key] )
        await book.save()

        const response = RESPONSE.default
        response.data  = book
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Delete Books
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.delete = async (req, res) => {
    const body = req.body

    if (!body.book_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const check = await tBorrow.findOne({
            raw: true,
            where: {
                deleted: { [Op.eq]: 0 },
                book_id: { [Op.eq]: body.book_id },
                status: { [Op.eq]: 'borrowed' }
            }
        })
        if (check) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Buku ini sedang dipinjam oleh member dan tidak dapat dihapus.`
            return res.status(400).json(response)
        }

        const deleted = await tBook.update(
            { deleted: 1}, { 
            where: { id: { [Op.eq]: body.book_id }, deleted: { [Op.eq]: 0 } }
        })

        const response = RESPONSE.default
        response.data  = deleted
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}