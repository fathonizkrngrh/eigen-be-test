"use strict";
const Op = require('sequelize').Op
const CONFIG = require('../config')
const UTILITIES = require("../utilities");
const PAGINATION = require("../utilities/pagination");
const RESPONSE = require("../utilities/response");
const model = require("../models/mysql");
const seq = model.sequelize
const tMember = model.members
const tBorrow = model.borrows

const catchMessage = `Mohon maaf telah terjadi gangguan, jangan panik kami akan terus meningkatkan layanan.`


/**
 * Function List of Members
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
        ...query.search && { 
            [Op.or]: {
                name: { [Op.like]: `%${query.search}%` },
                code: { [Op.like]: `%${query.search}%` },
            }
        },
    })

    try {
        const list = await tMember.findAndCountAll({
            attributes: { 
                exclude: ['created_on', 'modified_on', 'deleted'], 
                include: [
                    [ seq.literal(`(SELECT COUNT(*) FROM borrows WHERE borrows.member_id = members.id AND borrows.status = 'borrowed')`), 'total_borrowed_books']
                ], 
            },
            include: [{
                    model: tBorrow, required: false, as: 'borrowed_books', 
                    where: { status: { [Op.eq]: 'borrowed' }},
                    attributes: ['book_id', 'book_title', 'book_code']
            }],
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
 * Function Create Members
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.create = async (req, res) => {
    const body = req.body

    const requiredAttributes = { code: "Kode", name: 'Nama'}
    for (const key of Object.keys(requiredAttributes)) {
        if (!body[key]) {
            const response = RESPONSE.error('unknown')
            response.error_message = `${requiredAttributes[key]} wajib diisi.`
            return res.status(400).json(response)
        }
    }

    try {
        const member = await tMember.create({
            code: body.code,
            name: body.name,
        })

        const response = RESPONSE.default
        response.data  = member
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Update Members
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.update = async (req, res) => {
    const body = req.body

    if (!body.member_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const member = await tMember.findOne({ where: { id: { [Op.eq]: body.member_id }, deleted: { [Op.eq]: 0 } }})
        if (!member) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Member tidak ditemukan.`
            return res.status(400).json(response)
        }    

        const keys = Object.keys(req.body)
        keys.forEach((key, index) => member[key] = req.body[key] )
        await member.save()

        const response = RESPONSE.default
        response.data  = member
        return res.status(200).json(response)   
    } catch (err) {
        console.log(err)
        const response = RESPONSE.error('unknown')
        response.error_message = err.message || catchMessage
        return res.status(500).json(response)
    }
}

/**
 * Function Delete Members
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
module.exports.delete = async (req, res) => {
    const body = req.body

    if (!body.member_id ) {
        const response = RESPONSE.error('unknown')
        response.error_message = `Permintaan tidak lengkap.`
        return res.status(400).json(response)
    }

    try {
        const check = await tBorrow.findOne({
            raw: true, where: {
                deleted: { [Op.eq]: 0 },
                member_id: { [Op.eq]: body.member_id },
                status: { [Op.eq]: 'borrowed' }
            }
        })
        if (check) {
            const response = RESPONSE.error('unknown')
            response.error_message = `Member ini sedang meminjam buku dan tidak dapat dihapus.`
            return res.status(400).json(response)
        }

        const deleted = await tMember.update(
            { deleted: 1}, { 
            where: { id: { [Op.eq]: body.member_id }, deleted: { [Op.eq]: 0 } }
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