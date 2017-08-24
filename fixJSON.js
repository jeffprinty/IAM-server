var fs = require('fs');
var http = require('http');
const parseXml = require('@rgrove/parse-xml');
// const jsonFile = require('./prod.json');
var parser = require('xml2json');
function xmlToJSON() {
  fs.readFile( './schools.xml', 'utf8', function(err, data) {
    var json = parser.toJson(data);
    console.log("json", typeof JSON.parse());
    // console.log("to json ->", json);
    fs.writeFile('./prod.json', json, function (err) {
      if (err) return console.log(err);
      console.log('writing to file');
    });
  });
}

fs.readFile( './prod.json', 'utf8', function(err, data) {
  const json = JSON.parse(data);
  const list = json['ArrayOfSchoolNameList']['SchoolNameList'];
  console.log("list", typeof list);
  const newList = cleanList(list, 'SFSchoolName');
  newList.forEach(function(item){
    console.log(item);
  })
  const parsed = JSON.stringify(newList, null, 2);
  fs.writeFile('./prodClean.json', parsed, function (err) {
    if (err) return console.log(err);
    console.log('writing to file');
  });
  // console.log("to json ->", json);
});

// const data = JSON.parse(jsonFile);
// jsonFile['ArrayOfSchoolNameList'].forEach(function(item){
//   console.log("item", item['SFSchoolName']);
// })

// for (var i=0; i<5; i++) {
//   var node = file.childNodes[i];
//   console.log("node", node);
// }

// parseString(file, function (err, result) {
//     console.dir(err, result);
// });
function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0, max = entities.length; i < max; ++i) 
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);

    return text;
}

function cleanList(array, field){
  function compare(a, b) {
    if (a[field].substr(0,1).toLowerCase() < b[field].substr(0,1).toLowerCase()) return -1;
    if (a[field].substr(0,1).toLowerCase() < b[field].substr(0,1).toLowerCase()) return 1;
    return 0;
  }
  const sorted = array.sort(compare);
  let newArray = sorted.map(function(item,i) {
    const prev = array[i-1];
    const next = array[i+1];
    const current = item[field];
    if (prev && prev[field] === current) {
      return Object.assign({}, item, {
        multiple: true,
        SFSchoolName: decodeHTMLEntities(current)
      })
    } else if (next && next[field] === current) {
      return Object.assign({}, item, {
        multiple: true,
        SFSchoolName: decodeHTMLEntities(current)
      })
    } else {
      return Object.assign({}, item, {
        multiple: false,
        SFSchoolName: decodeHTMLEntities(current)
      })
    }
  });
  return newArray;
}


