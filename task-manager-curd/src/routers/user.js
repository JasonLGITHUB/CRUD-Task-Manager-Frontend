const express = require('express')
const multer = require('multer')
// const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
// const { check, validationResult } = require('express-validator/check')

const router = new express.Router()


//-------------------------------home page------------------------------------------
router.get('', (req, res) => {
    res.render('index', {
        title: 'task crud',
        name: 'CRUD database'
    })
})
//------------------------add user--------------------------------------------------

router.get('/newuser', (req, res) => {
    res.render('users/new', { user: new User() }) //render templates/users/new.hbs
  })
  router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        res.redirect('/users/login')
        // res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
//-------------------------------------------login-------------------------------
router.get('/users/login', (req, res) => {
    res.render('users/login', { user: new User() }) //render users/login.hbs
  })
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        
        // res.send({ user, token })
        // res.redirect('/tasks')
        res.redirect('/users/me')
       
    } catch (e) {
         res.status(400).send()
       
    }
    
})
//------------------------------------------logout-------------------------------
router.get('/users/logout', (req, res) => {
    res.render('users/logout', { user: new User() }) //render users/logout.hbs
  
  })
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        // res.send()
        res.redirect('/') //back to home page
    } catch (e) {
        res.status(500).send()
    }
})
//------------------------------------------------------logout All----------------
router.get('/users/logoutAll', (req, res) => {
    res.render('users/logoutAll', { user: new User() }) //render users/logout.hbs  
  })
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        //res.send()
        res.redirect('/')
    } catch (e) {
        res.status(500).send()
    }
})
//-------------------------------------profile-------------------------------------------
router.get('/users/me', auth, async (req, res) => {
    // res.send(req.user)
     res.render('users/user-me', {'myProfile' : req.user}) //  User profile data table 
})

router.get('/users/:id/update', auth, async (req, res) => {
    // res.send(req.user)
     res.render('users/user_me_patch', {'myProfile' : req.user})     // user profile update UI form 
})
//--------------------------------------------patch-----------------------------------------------------
router.post('/users/:id/update', auth, async (req, res) => {    //------"patch" not work----------- 
    const updates = Object.keys(req.body)
    const allowedUpdates = ['_id','name', 'email', 'password', 'age']   // if there is no '_id ', is not valid...false
    console.log(updates)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    console.log(isValidOperation)
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try { 
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
       // res.send(req.user)
        res.redirect('/users/me')
    } catch (e) {
        res.status(400).send(e)
    }
})

//-------------------------------Delete users/me -------------------------------------------------
router.get('/users/me/delete', auth, async (req, res) => {  //----------delete user
    try {
        await req.user.remove()
        //res.send(req.user)
        res.redirect('/')
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router
