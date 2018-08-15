const express= require('express');
const router = express.Router();
let Article = require('../models/article');

let User = require('../models/user');

//Add Article
//GET route
router.get('/add',ensureAuthenticated,function(req,res){
    res.render('add_article');
});


//POST route
router.post('/add',function(req,res){

    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    //Get Errors
    let errors=req.validationErrors();

    if(errors){
        res.render('add_article',{
            errors:errors
        });
    }
    else{
        let article=new Article();
        article.title=req.body.title;
        article.author=req.body.author;
        article.body=req.body.body;
        article.created_by=req.user._id;
        article.save(function(err){
            if(err){
                console.log(err);
                return;
            }
            else{
                req.flash('success','Article added');            
                res.redirect('/');
            }
        });
    } 
});

//Edit Route

//get route
router.get('/edit/:id',ensureAuthenticated,function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(article.created_by != req.user.id){
            req.flash('danger','Not Authorized !');
            return res.redirect('/');
        }
        res.render('edit_article',{
            article:article
        });
    });
});

//Post route
router.post('/update/:id',function(req,res){
    let article = {};
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;

    let query={_id:req.params.id};

    Article.update(query,article,function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('success','Article Updated');            
            res.redirect('/');
        }
    });
});

//Delete Route
router.delete('/delete/:id',function(req,res){
    if(!req.user.id){
        res.status(500).send();
    }

    let query={_id:req.params.id};

    Article.findById(req.params.id,function(err,article){
        if(article.created_by != req.user.id){
            res.status(500).send();
        }
        else{
            Article.remove(query,function(err){
                if(err){
                    console.log(err);
                }
                req.flash('danger','Article deleted!');
                res.send('Success');
            });
        }
    });
});

//View Single article
router.get('/:id',function(req,res){
    Article.findById(req.params.id,function(err,article){
        User.findById(article.created_by,function(err,user){
            res.render('view_article',{
                article:article,
                author: user.name
            });
        });
    });
});

//Access Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}


module.exports=router;