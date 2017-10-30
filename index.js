require('dotenv').config()
const koa = require('koa');
const mount = require('koa-mount');
const fs = require('fs');
const route = require('koa-route');
const app = module.exports = new koa();
const serve = require('koa-static');
const levenSort = require('leven-sort');
const http = require('http');
const https = require('https');
const cors = require('kcors');
const loki = require('lokijs');
const lfsa = require('./node_modules/lokijs/src/loki-fs-structured-adapter.js');

const jsforce = require('jsforce');
const conn = new jsforce.Connection({
  loginUrl : process.env.LOGINURL,
  instanceUrl : process.env.INSTANCEURL,
  // accessToken: process.env.ACCESSTOKEN
});

app.use(
  route.get('/api/login', function (req) {
      this.body = userInfo;
  })
)
    // conn.login(process.env.USERNAME, `${process.env.PASSWORD}`, function(err, userInfo) {
    //   if (err) { return console.error(err); }
    //   console.log(conn.accessToken);
    //   console.log(conn.instanceUrl);
    //   console.log("User ID: " + userInfo.id);
    //   console.log("Org ID: " + userInfo.organizationId);
    //   // ...
    //   var records = [];
    //   conn.query("SELECT Id, Name FROM User LIMIT 100", function(qerr, result) {
    //     if (qerr) { return console.error(qerr); }
    //     console.log('boop', result);
    //     console.log("total : ", result.totalSize);
    //     console.log("fetched : ", result.records);
    //   });
    //   conn.sobject("Account").describe(function(err, meta) {
    //     if (err) { return console.error(err); }
    //     console.log('Label : ' + meta.label);
    //     // console.log('Num of Fields : ', meta);
    //   });
    // });
const allSchools = require('./201710271511.json');
const schools = allSchools.filter(function(sch){
  return !sch['SFCID'].includes('C02777');
});
console.log(":: JSON: schools, filtered schools", allSchools.length, schools.length);

const dbLoaded = e => console.log('loaded', e);
var idbAdapter = new lfsa();
const db = new loki('./loki.db', {
  autosave: true, 
  autosaveInterval: 60000
});

function dbInit() {
  db.loadDatabase({}, () => {
    console.log(':: db loaded');
    let institutions = db.getCollection('institutions');
    let analytics = db.getCollection('analytics');
    if (institutions === null || institutions.count() === 0) {
      console.log(":: Institutions Database initialized");
      institutions = db.addCollection('institutions');
      addEntries();
    } else {
      console.log(':: ' + institutions.count() + ' institutions loaded from db');
    }
    if (analytics === null || analytics.count() === 0) {
      console.log(":: Analytics Database initialized");
      analytics = db.addCollection('analytics');
    } else {
      console.log(':: ' + analytics.count() + ' weeks analytics loaded from db');
    }
    saveWeekData();
  })
}
dbInit();



function addEntries() {
  let institutions = db.getCollection('institutions');
  if (institutions.count() === 0) {
    schools.forEach(function(school) {
      institutions.insert(school);
    })
  }
  console.log(":: Institutions in database : " + institutions.count());
}

let weekHours = Array.apply(null, Array(168)).map(Number.prototype.valueOf,0);
let count = 0;

const whitelist = ['https://ssoqa-macmillan-learning.cs67.force.com', 'https://sso.macmillanlearning.com'];  
function checkOriginAgainstWhitelist(ctx) {
    const requestOrigin = ctx.accept.headers.origin;
    if (!whitelist.includes(requestOrigin)) {
        return ctx.throw(`🙈 ${requestOrigin} is not a valid origin`);
    }
    return requestOrigin;
}

app.use(cors({
  origin: '*'
}));

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

function getHour() {
  const d = new Date();
  const days = d.getDay();
  const weekHrs = days*24;
  const hrs = d.getHours();
  return weekHrs + hrs;
}
const weekOfYear = date => {
  var d = new Date(+date);
  d.setHours(0,0,0);
  d.setDate(d.getDate()+4-(d.getDay()||7));
  return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

function weekalytics() {
  const hr = getHour();
  let val = weekHours[hr] || 0;
  val += 1;
  weekHours[hr] = val;
}
function saveWeekData() {
  let analytics = db.getCollection('analytics');
  const allAnalytics = analytics.find();
  // console.log("allAnalytics", allAnalytics);
  const currentWeek = weekOfYear(new Date());
  var weekData = analytics.findObject({'week': currentWeek});
  const total = weekHours.reduce((total,val) => total + val);
  if (!weekData) {
    console.log(':: new week created', currentWeek);
    analytics.insert({
      week: currentWeek,
      requestsByHour: weekHours,
      total
    })
  } else {
    weekData.requestsByHour = weekHours;
    weekData.total = total;
    analytics.update(weekData);
    console.log(":: weekData saved, total: ", total);
  }
  setTimeout(function(){
    saveWeekData();
  }, 60000);
}

app.use(
  route.get('/api/query', function (req, res) {
    console.log('query');
    let results = [];
    conn.query("SELECT Id, Name FROM User LIMIT 100", (qerr, result) => {
      if (qerr) { return console.error(qerr); }
      results = result;
      console.log("total : ", result.totalSize);
      // console.log("fetched : ", result.records);
      res.send(results);
    });
  })
)

app.use(
  route.get('/api/find', function (req) {
    const institutions = db.getCollection('institutions');
    const query = req.query.q;
    const found = institutions.chain()
      .find({ 'SFSchoolName' : { '$regex': [query, 'i'] } })
      .data();
    let results = found;
    weekalytics();
    count += 1;
    if (found.length === 0) {
      results = institutions.find({ 'SFCID': { '$eq': 'C02779' } });
    } else if (found.length < 50) {
      results = levenSort(found, query, 'SFSchoolName');
    } else {
      results = found.slice(0, 100);
    }
    this.body = results;
  })
)


app.use(
  route.get('/api/requests', function (req) {
    this.body = {
      weekHours,
      count
    };
  })
)
app.use(
  route.get('/api/analytics', function (req) {
    const analytics = db.getCollection('analytics');
    const currentWeek = weekOfYear(new Date());
    const currentWeekData = analytics.findObject({'week': currentWeek});
    console.log("currentWeekData", currentWeekData);
    this.body = {
      weekHours: currentWeekData,
      count
    };
  })
)

app.use(
  route.get('/api/new', function (req) {
    const institutions = db.getCollection('institutions');
    const query = req.query.q;
    const found = institutions.chain()
      .find({ 'SFSchoolName' : { '$regex': [query, 'i'] } })
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
