const koa = require('koa')  ;
const fs = require('fs')  ;
const route = require('koa-route');
const app = module.exports = new koa();
const serve = require('koa-static');
const levenSort = require('leven-sort');
const http = require('http');
const https = require('https');
const cors = require('kcors');
const loki = require('lokijs');

const allSchools = require('./schoolsV3.json');
const schools = allSchools.filter(function(sch){
  return sch['SFCID'] !== 'C02777';
});

const db = new loki('./loki.json', {
  autoload: true,
  autoloadCallback : dbInit,
  autosave: true,
  autosaveInterval: 60000
});

let institutions = db.getCollection('institutions');
function dbInit() {
  if (institutions === null || institutions.count() === 0) {
    console.log(":: Database initialized");
    institutions = db.addCollection('institutions');
    addEntries();
  }
}

function addEntries() {
  if (institutions.count() === 0) {
    schools.forEach(function(school) {
      institutions.insert(school);
    })
  }
  console.log(":: Institutions in database : " + institutions.count());
}

app.use(cors());

app.use(serve(__dirname + '/public/'));
app.use(route.get('/school/:name', show));

function list() {
  this.body = schools;
}

app.use(
  route.get('/api/old', function (req) {
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
  route.get('/api/find', function (req) {
    const query = req.query.q;
    const found = institutions.chain()
      .find({ 'SFSchoolName' : { '$regex': [query, 'i'] } })
      .data();
    let results = found;
    if (found.length < 50) {
      results = levenSort(found, query, 'SFSchoolName');
    } else {
      results = found.slice(0, 100);
    }
    this.body = results;
  })
)
app.use(
  route.get('/api/new', function (req) {
    const query = req.query.q;
    const found = institutions.chain()
      .find({ 'SFSchoolName' : { '$contains' : query } })
      .simplesort('SFSchoolName')
      .limit(50)
      .data();
    this.body = found;

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
console.log(':: http listening on 3000');
if (process.env.NODE_ENV === 'production') {
  https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/iam-api.mldev.cloud/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/iam-api.mldev.cloud/fullchain.pem')
  }, app.callback()).listen(3001);
  console.log(':: https listening on 3001');
}
