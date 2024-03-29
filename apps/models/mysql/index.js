"use strict"
require('dotenv').config()

const databases = require('../../config/databases')
const models  = {}
const env     = process.env.ENV || "development"
const fs      = require("fs")
const path    = require("path")
const setting = databases.eigen_be_test

/* SERVER CLOCK SETTINGS */
const settingDialect = {
    useUTC: false, dateStrings: true,
    typeCast: function (field, next) {
        if (field.type === 'DATETIME'||field.type === 'TIMESTAMP') { return field.string() }
        return next()
    }
}
setting.dialectOptions = settingDialect
// setting.timezone       = '+07:00'
const Sequelize        = require("sequelize")
const sequelize        = setting.url ? new Sequelize(setting.url, setting) : new Sequelize(setting.database, setting.username, setting.password, setting)
sequelize.dialect.supports.schemas = true
const shell            = require('shelljs')
const chalk            = require('chalk')

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js")
    })
    .forEach(function(file) {
        //Sequelize < 6.0.0
        //var model = sequelize.import(path.join(__dirname, file))
        //Sequelize >= 6.0.0
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
        models[model.name.toLowerCase()] = model
        //https://stackoverflow.com/questions/62917111/sequelize-import-is-not-a-function
    })
 
Object.keys(models).forEach(function(modelName) {
    if ("associate" in models[modelName]) {
        models[modelName].associate(models)
    }
})

models.sequelize = sequelize
models.Sequelize = Sequelize

/* Synchronizations */
shell.echo(chalk.bgBlue('*** Synchronizing Transactions DB now..'))
if(env==='production'){
    models.sequelize.sync({ force: false }).then(() => { }).catch(err => { })
}else{
    let sync = false
    models.sequelize.sync({ force: sync }).then(() => {
        if(sync){ /* Seeding if Sync TRUE */
            shell.echo(chalk.bgBlue('*** Seeding Transactions DB now..'))
            if (!shell.which('sequelize')) {
                shell.echo(chalk.yellow('Sorry, requires sequelize-cli to seeed the DB.')) 
                shell.echo(chalk.blue('You can type "npm -i sequelize-cli -g".'))
            }else{
                shell.exec('sequelize db:seed:all')
                shell.echo(chalk.green('*** Seeding Data Finished!'))
            }
        }
    }).catch(err => { /* console.log(err) */ })
}

/* Relationships */

models.borrows.belongsTo(models.books, { as: "book", foreignKey: "book_id"});
models.books.hasMany(models.borrows, { as: "borrows", foreignKey: "book_id"});
models.borrows.belongsTo(models.members, { as: "member", foreignKey: "member_id"});
models.members.hasMany(models.borrows, { as: "borrowed_books", foreignKey: "member_id"});
models.member_penalties.belongsTo(models.members, { as: "member", foreignKey: "member_id"});
models.members.hasMany(models.member_penalties, { as: "member_penalties", foreignKey: "member_id"});

module.exports = models
//http://docs.sequelizejs.com/manual/installation/usage.html
//http://docs.sequelizejs.com/manual/tutorial/models-definition.html