const postsModel = require('../models/postsModel');
const MarkdownIt = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
});

// 리스트

exports.getList = (req, res) => {
    postsModel.getList((result) => {
        if(result) {
            res.render('posts/list', {
                title: '게시판 리스트',
                posts: result
            });
        } else {
            res.redirect('/');
        }
    });
};

// 글 작성 - 폼
exports.getPostForm = (req, res) => {
    res.render('posts/writeForm', {
        'title': '글 작성하기'
    });
};

// 글 입력 - 프로세스
// ip 찾기
exports.insertProcess = (req, res) => {
    let item = {
        'name': req.body.name,
        'email': req.body.email,
        'password': req.body.password,
        'subject': req.body.subject,
        'content': req.body.content,
        'ip': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        'tags': req.body.tags
    };

    postsModel.insertData(item, (result) => {
        if(result) {
            if(result.affectedRows === 1){
                res.redirect('/posts');
            } else {
                res.redirect('/posts/news');
            }
        }
    });
};

// 글 읽기
exports.getView = (req, res) => {
    let id = req.params.id;
    postsModel.getView(id,(result) => {
        if(result) {
            result.content = MarkdownIt.render(result.content);
            res.render('posts/view', {
                title: result.subject,
                post: result
            });
        }
    });
};
exports.getEditForm = (req, res) => {
    let id = req.params.id;
    postsModel.getEdit(id, (result) => {
        if(result) {
            res.render('posts/writeForm', {
                title: result.subject,
                mode: 'edit',
                post: result
            });
        }
    });
};

exports.updateProcess = (req, res) => {
    let id = req.params.id;

    let item = {
        'id': id,
        'name': req.body.email,
        'password': req.body.password,
        'subject': req.body.subject,
        'content': req.body.content,
        'ip': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        'tags': req.body.tags
    };

    postsModel.updateData(item, (result) => {
        if (result) {
            if (result.affectedRows === 1) {
                res.redirect('/posts/' + id);
            } else { 
                res.redirect('/posts/' + id + '/edit');
            }
            } else {
                res.send('<script>alert("수정 실패");history.back();</script>');
            }
    });
};
exports.deleteProcess = (req, res) => {
    let item = {
        'id': req.params.id,
        'password': req.body.password
    };
    postsModel.deleteData(item, (result) => {
        if (result) {
            if (result.affectedRows === 1) {
                res.redirect('/posts/');
            } else {
                res.redirect('/posts/' + item.id);
            }
        } else {
            res.rend('<script>alert("삭제 실패");history.back();</script>');
        }
    });
};