const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { User } = require('./models');
const bcrypt = require('bcrypt');
const formdidable = require('express-formidable');
const multer = require('multer')
const upload = require('./multer-config');
const path = require('path');



mongoose.connect('mongodb://localhost/crud_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});


const app = express();
app.use('/images', express.static(path.join(__dirname,'images')));

app.use(express.json())
app.use(formdidable());
app.use(cors());

app.get('/', (req, res) => {
    User.find({}).then(data => {
        console.log(data)
        res.status(200).json(data);
    }).catch(error => {
        res.status(403).end('An error occured')
    })
})

app.post('/register',(req, res,next) => {
    console.log(JSON.parse(req.fields.data))
    const tempPayload = JSON.parse(req.fields.data)
    
    const payload = new User({...tempPayload,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.files.file.name}`});
    console.log(payload);

    upload(req, res, function(error){
        if(error instanceof multer.MulterError){
            return res.status(500).json(error);
        }else if(error){
            return res.status(500).json(error)
        }

        User.find({ username: payload.username}).then((user) => {
            if (user.length) {
                res.status(403).end('User already exist')
             } else {
                bcrypt.hash(payload.password, 10, (error, hashPassword) => {
                     if (error) {
                         console.error(error)
                         res.status(403).end('An error occur when hashing password');
                     } else {
                         let newUser = new User({ username: payload.username, 
                             password: hashPassword, 
                             imageUrl: payload.imageUrl
                      });
                         newUser.save();
                         res.status(201).end('User saved successfully')
                     }
                 });
             }
         }).catch(error => {
             console.error(error)
             res.status(403).end('An error occured')
         });

    })

   
});

app.use('/login', (req, resp) => {
    const { username, password } = req.body;
    User.findOne({ username }).then(user => {
        if (user) {
            console.log(user)
            bcrypt.compare(password, user.password, (error, same) => {
                if (error) {
                    console.log(error)
                    resp.status(403).end('Fail to compare password')
                } else {
                    if (same) {
                        resp.status(200).json(user);
                    } else {
                        resp.status(403).end('Bad credentials');
                    }
                }
            });
        }
    });
})

app.listen(5000, () => {
    console.log('App running on port 5000')
})