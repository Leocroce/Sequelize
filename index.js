const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const conn = require('./db/conn')

//Importação do modelo para o drive de Sequelize
const User = require('./models/User')
const Address = require('./models/Address')

app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

//Coleta de dados do body para entidade User 
app.get('/users/create', (req, res) => {
    res.render('adduser')
})
app.post('/users/create', async(req, res) => {
    const name = req.body.name
    const occupation = req.body.occupation
    let newsletter = req.body.newsletter

    if(newsletter === 'on') {
        newsletter = true
    } else {
        newsletter = false
    }

    await User.create({ name, occupation, newsletter })
    res.redirect('/')
})
//Leitura de informações
app.get('/', async(req, res) => {
    const users = await User.findAll({ raw: true })
    console.log(users)

    res.render('home', { users: users})
})
app.get('/users/:id', async(req, res) => {
    const id = req.params.id
    const user = await User.findOne({ raw: true, where: {id:id} })

    res.render('userview', { user })
})
//Chamada do Editar
app.get('/users/edit/:id', async(req, res) => {
    const id = req.params.id
    const user = await User.findOne({ include: Address, where: {id:id} })

    res.render('useredit', { user: user.get({ plain: true }) })
})
app.post('/users/update', async(req, res) => {
    const id = req.body.id
    const name = req.body.name
    const occupation = req.body.occupation
    let newsletter = req.body.newsletter

    if(newsletter === 'on') {
        newsletter = true
    } else {
        newsletter = false
    }

    const userData = { id, name, occupation, newsletter }
    console.log(userData)
    await User.update(userData, { where: {id:id} } )
    res.redirect('/')
})
//Chamada do Deletar
app.post('/users/delete/:id', async(req, res) => {
    const id = req.params.id

    await User.destroy({where: {id:id}})
    res.redirect('/')
})
//Adição de endereços com relacionamento
app.post('/address/create', async (req, res) => {
    const { UserId, street, number, city } = req.body

    const address = { UserId, street, number, city }

    await Address.create(address)
    res.redirect(`/users/edit/${UserId}`)
})
//Exclusão de relacionamento
app.post('/address/delete', async (req, res) => {
    const { UserId, id, } = req.body

    await Address.destroy({ where: { id: id }})

    res.redirect(`/users/edit/${UserId}`)
})
//Renderização da home
app.get('/', function(req, res) {
    res.render('home')
})

conn
.sync()
//.sync({force: true})
.then(() => {
    app.listen(3000)
}).catch((err) => console.log(err)) 

