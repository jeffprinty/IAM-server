var koa = require('koa')  
, route = require('koa-route')
, app = module.exports = new koa();
const serve = require('koa-static');

const schools = require('./schools.json')

app.use(serve(__dirname + '/public/'));  
app.use(route.get('/school/:name', show));

function list() {  
  this.body = schools;
}

app.use(
  route.get('/api/find', find)
)

function find(req) {
  var query = req.query.q;
  var found = schools.filter(function(sch){
    var schoolName = sch['SCHOOL_NAME__C'];
    return schoolName.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  })
  this.body = found;
  
}

function *show(title) {  
  title = decodeURI(title);
  var res = yield books.find({title: title});
  this.body = res;
}
route.get('/book/:title', function(req, res) {
  title = decodeURI(req.params.title);
  book.find({title: title}, function(error, book) {
    res.send(book);
  });
});
console.log('listening');
if (!module.parent) app.listen(3000);
