const koa = require('koa')  
, route = require('koa-route')
, app = module.exports = new koa();
const serve = require('koa-static');
const levenSort = require('leven-sort');

const schools = require('./schoolsV2.json')

app.use(serve(__dirname + '/public/'));  
app.use(route.get('/school/:name', show));

function list() {  
  this.body = schools;
}

app.use(
  route.get('/api/find', function (req) {
    const query = req.query.q;
    const found = schools.filter(function(sch){
      const schoolName = sch['SCHOOL_NAME__C'].toLowerCase();
      return schoolName.indexOf(query.toLowerCase()) !== -1;
    })
    const sorted = levenSort(found, query, 'SCHOOL_NAME__C');
    this.body = sorted;
    
  })
)

app.use(
  route.get('/api/l', function (req) {
    const query = req.query.q;
    const found = schools.filter(function(sch){
      const schoolName = sch['SCHOOL_NAME__C'];
      return schoolName.toLowerCase().substr(0, query.length) === query.toLowerCase();
    })
    this.body = found;
    
  })
)

app.use(
  route.get('/api/list', list)
)

app.use(
  route.get('/api/school', function (req) {
    const query = req.query.q;
    const found = schools.filter(function(sch){
      return query === sch['SCHOOL_NAME__C'];
    })
    if (found.length > 0) {
      this.body = found;
    } else {
      this.body = false;
    }
    
  })
)

function *show(title) {  
  title = decodeURI(title);

  this.body = res;
}


console.log('listening');
if (!module.parent) app.listen(3000);
