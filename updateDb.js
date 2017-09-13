import { cleanList, decodeHTMLEntities } from './fixJSON';
var changesets = require('diff-json');
var fs = require('fs'),
    http = require('http'),
    xml2js = require('xml2js');
var parser = new xml2js.Parser();
var request = require('request');
request({
  headers: {
    'Content-Type': 'application/xml'
  },
  uri: 'http://macmillanlearning.com/SchoolSearchService/GetSchoolList'
}, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  // console.log('body:', body); // Print the HTML for the Google homepage.
  // parser.parseString(body, (xx) => console.log(xx) );
  parser.parseString(body, function(err, result) {
    const { ArrayOfSchoolNameList } = result;
    const { SchoolNameList } = ArrayOfSchoolNameList;
    fs.readFile( './schoolsV4.json', 'utf8', function(err, data) {
      const json = JSON.parse(data);
      const remap = SchoolNameList.map(school => {
        let newSchoolObj = {};
        Object.keys(school).forEach(schoolKey => {
          const str = school[schoolKey].toString();
          newSchoolObj[schoolKey] = decodeHTMLEntities(str);
        });
        return newSchoolObj;
      });
      const fixed = cleanList(remap, 'SFSchoolName');
      // console.log(json.length,remap.length);
      const field = 'SFCID';
      function compare(a, b) {
        // console.log(a,b,a[field], a[field]);
        if (a[field].toLowerCase() < b[field].toLowerCase()) return -1;
        if (a[field].toLowerCase() < b[field].toLowerCase()) return 1;
        return 0;
      }
      const sorted = fixed.sort(compare);
      const sortedOrig = json.sort(compare);
      fs.writeFile('./schoolsOld.json', JSON.stringify(sortedOrig,null,2), function (err) {
        if (err) return console.log(err);
        console.log('writing to file');
      });
      fs.writeFile('./schoolsNew.json', JSON.stringify(sorted,null,2), function (err) {
        if (err) return console.log(err);
        console.log('writing to file');
      });
      // console.log("json", json);
      // const list = json['ArrayOfSchoolNameList']['SchoolNameList'];
    });
  });
});

function xmlToJson(url, callback) {
  var req = http.get(url, function(res) {
    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('error', function(e) {
      callback(e, null);
    });

    res.on('timeout', function(e) {
      callback(e, null);
    });

    res.on('end', function() {
      parser.parseString(xml, function(err, result) {
        callback(null, result);
      });
    });
  });
}


// fs.readFile(__dirname + '/db.xml', function(err, data) {
//     parser.parseString(data, function (err, result) {
//       const { ArrayOfSchoolNameList } = result;
//       const { SchoolNameList } = ArrayOfSchoolNameList;
//       // SchoolNameList.forEach((school) => console.log(school));
//       let newSchoolList = SchoolNameList.map((obj,i) => {
//         let newObj = {}
//         Object.keys(obj).forEach((key) => {
//           const cleanStr = obj[key].toString();
//           newObj[key] = cleanStr.replace(/\n/g, '');
//         })
//         return newObj;
//       });
//       const clean = cleanList(newSchoolList, 'SFSchoolName');
//       const json = JSON.stringify(clean,null,2);
//       fs.writeFile('./schoolsV4.json', json, function (err) {
//         if (err) return console.log(err);
//         console.log('writing to file');
//       });
//         console.log('Done');
//     });
// });
