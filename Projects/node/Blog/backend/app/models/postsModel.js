// mysql 연결 
const mysqlConnObj = require('../config/mysql'); 
const mysqlConn = mysqlConnObj.init(); 
// mysqlConnObj.open(mysqlConn); // 정상적으로 연결되었는지 확인 
const bcrypt = require('bcrypt'); 
const saltRound = 10; 
/** * 게시글 리스트 * * * cb : Callback function. After completing select, it returns to the controller * * @param cb */ 
exports.getList = (cb) => { 
    /** * todo : 페이징 처리 * @type {string} */ 
    let sql = 'SELECT * FROM posts ORDER BY id DESC LIMIT 10'; 
    mysqlConn.query(sql, (err, results, fields) => { 
        if (err) { console.error('Error code : ' + err.code); 
        console.error('Error Message : ' + err.message); 
        throw new Error(err); 
    } else { 
        cb(JSON.parse(JSON.stringify(results))); 
    } 
}); }
; /** * 글 보기 * * 하나의 결과값만 리턴 할 경우 자체가 JSON 형식이라 따로 JSON.parse 안해줘도 됨 * * id : 게시물 번호 * cd : 콜백 함수 * * @param id * @param cb */ 
exports.getView = (id, cb) => { 
    let sql = 'SELECT `id`, `name`, `email`, `subject`, `content`, `like`, `hate`, `hit`, `comment_cnt`, inet_ntoa(`ip`) AS `ip`, `created_at`, `updated_at` FROM posts WHERE id=? LIMIT 1'; 
    mysqlConn.query(sql, [id], (err, results, fields) => { 
        if (err) { 
            console.error('Error code : ' + err.code); 
            console.error('Error Message : ' + err.message); 
            throw new Error(err); 
        } else { 
            cb(results[0]); 
        } 
    }); 
}; /** * 새로운 글을 작성하면 데이터베이스에 입력한다. * * data : Input data received from the controller * cb : Callback function. After completing input, it returns to the controller * * @param data * @param cb */ 
exports.insertData = function(data, cb)  { 
    bcrypt.genSalt(saltRound, function(err, salt)  { 
        if (err) throw new Error(err); 
        bcrypt.hash(data.password, salt, function(err, hash) { 
            if (err) throw new Error(err); 
            // 입력 구문 
            let now = new Date(); 
            let sql = 'INSERT INTO posts (name, email, password, subject, content, ip, created_at) VALUES (?, ?, ?, ?, ?, inet_aton(?), ?)'; 
            let bindParam = [ data.name, 
                data.email, 
                hash,
                 // 해싱된 비밀번호 
                 data.subject, 
                 data.content, 
                 data.ip, now 
                ]; 

                mysqlConn.query(sql, bindParam, (err, results, fields) => { 
                    if (err) { console.error('Error code : ' + err.code); 
                    console.error('Error Message : ' + err.message); 
                    throw new Error(err); 
                } else { 
                    cb(JSON.parse(JSON.stringify(results))); 
                } 
            }); 
            /** * 위 코드에서 result 의 값으로 넘어오는 것들 * * fieldCount: 0, * affectedRows: 1, // 성공한 개수 * insertId: 2, * serverStatus: 2, * warningCount: 0, * message: '', * protocol41: true, * changedRows: 0 */ 
        }); 
    }); 
};
exports.getEdit = function(id, cb)  {
    let sql = 'SELECT `id`, `name`, `email`, `subject`, `content` FROM posts WHERE id=? LIMIT 1';
    mysqlConn.query(sql, [id], (err, results, fields) => {
        if (err) {
            console.error('Error code : ' + err.code);
            console.error('Error Message : ' + err.message);

            throw new Error(err);
        } else {
            cb(results[0]);
        }
    });
};

exports.updateData = function(data,cb) {
    let sql = 'SELECT password FROM posts WHERE id=? LIMIT 1';
    mysqlConn.query(sql, [data.id], (err, results, fields) => {
        if (err) throw new Error(err);

        let hash_password = results[0].password;
        if (hash_password) {
            bcrypt.compare(data.password, hash_password, (err, result) => {
                if(err) throw new Error(err);
                if(result) {
                    let sql = 'UPDATE posts SET name=?, email=?, subject=?, content=?, ip=INET_ATON(?) WHERE id=?';
                    let bindParam = [
                        data.name,
                        data.email,
                        data.subject,
                        data.content,
                        data.ip,
                        data.id
                    ];
                    mysqlConn.query(sql, bindParam, (err, results, field) => {
                        if (err) throw new Error(err);
                        cb(JSON.parse(JSON.stringify(results)));
                    });
                } else {
                    cb(false);
                }
            });
        } else {
            cb(false);
        }
    });
};
exports.deleteData = (data, cb) => {
    let sql = 'SELECT password FROM posts WHERE id=? LIMIT 1';
    mysqlConn.query(sql, [data.id], (err, results, fields) => {
        if (err) throw new Error(err);

        let hash_password = results[0].password;
        if (hash_password) {
            bcrypt.compare(data.password, hash_password, (err, result) => {
                if (result) {
                    let sql = 'DELETE FROM posts WHERE id=?';
                    mysqlConn.query(sql, [data.id], (err, results, fields) => {
                        if (err) throw new Error(err);
                        cb(JSON.parse(JSON.stringify(results)));
                    });
                } else {
                    cb(false);
                }
            });
        } else {
            cb(false);
        }
    });
};