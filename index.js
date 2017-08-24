const koa = require('koa')  ;
const fs = require('fs')  ;
const route = require('koa-route');
const app = module.exports = new koa();
const serve = require('koa-static');
const levenSort = require('leven-sort');
const http = require('http');
const https = require('https');

const schools = require('./schoolsV3.json');

app.use(serve(__dirname + '/public/'));  
app.use(route.get('/school/:name', show));

function list() {  
  this.body = schools;
}

app.use(
  route.get('/api/find', function (req) {
    const query = req.query.q;
    const found = schools.filter(function(sch){
      const schoolName = sch['SFSchoolName'].toLowerCase();
      return schoolName.indexOf(query.toLowerCase()) !== -1;
    })
    const sorted = levenSort(found, query, 'SFSchoolName');
    this.body = sorted;
    
  })
)

app.use(
  route.get('/api/l', function (req) {
    const query = req.query.q;
    const found = schools.filter(function(sch){
      const schoolName = sch['SFSchoolName'];
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
      return query === sch['SFSchoolName'];
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

http.createServer(app.callback()).listen(3000);
console.log('http listening on 3000');
if (process.env.NODE_ENV === 'production') {
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/iam-api.mldev.cloud/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/iam-api.mldev.cloud/fullchain.pem')
  }, app.callback()).listen(3001);
  console.log('https listening on 3001');
}
