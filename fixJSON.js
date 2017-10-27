var fs = require('fs');
var http = require('http');
const parseXml = require('@rgrove/parse-xml');
// const jsonFile = require('./prod.json');
var parser = require('xml2json');
function xmlToJSON() {
  fs.readFile( './schools.xml', 'utf8', function(err, data) {
    var json = parser.toJson(data);
    // console.log("json", typeof JSON.parse());
    // console.log("to json ->", json);
    fs.writeFile('./prod.json', json, function (err) {
      if (err) return console.log(err);
      console.log('writing to file');
    });
  });
}
const fixy = () => {
fs.readFile( './prod.json', 'utf8', function(err, data) {
  const json = JSON.parse(data);
  const list = json['ArrayOfSchoolNameList']['SchoolNameList'];
  console.log("list", typeof list);
  const newList = cleanList(list, 'SFSchoolName');
  // newList.forEach(function(item){
  //   console.log(item);
  // })
  const parsed = JSON.stringify(newList, null, 2);
  fs.writeFile('./prodClean.json', parsed, function (err) {
    if (err) return console.log(err);
    console.log('writing to file');
  });
  // console.log("to json ->", json);
});
}

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
export function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        //FRENCH
        ['#192', 'À'],
        ['#194', 'Â'],
        ['#198', 'Æ'],
        ['#199', 'Ç'],
        ['#200', 'È'],
        ['#201', 'É'],
        ['#202', 'Ê'],
        ['#203', 'Ë'],
        ['#206', 'Î'],
        ['#207', 'Ï'],
        ['#212', 'Ô'],
        ['#217', 'Ù'],
        ['#219', 'Û'],
        ['#220', 'Ü'],
        ['#224', 'à'],
        ['#226', 'â'],
        ['#230', 'æ'],
        ['#231', 'ç'],
        ['#232', 'è'],
        ['#233', 'é'],
        ['#234', 'ê'],
        ['#235', 'ë'],
        ['#238', 'î'],
        ['#239', 'ï'],
        ['#244', 'ô'],
        ['#249', 'ù'],
        ['#251', 'û'],
        ['#252', 'ü'],

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

export function cleanList(array, field){
  function compare(a, b) {
    // console.log(a,b,a[field], a[field]);
    if (a[field].substr(0,1).toLowerCase() < b[field].substr(0,1).toLowerCase()) return -1;
    if (a[field].substr(0,1).toLowerCase() < b[field].substr(0,1).toLowerCase()) return 1;

    return 0;
  }
  const cleanArr = array.map
  const sorted = array.sort(compare);
  let nocontactArray = [];
  let newArray = sorted.map(function(item,i) {
    const prev = array[i-1];
    const next = array[i+1];
    const current = item[field];
    const country = provinces.includes(item.SchoolState) ? 'CA' : 'US';
    const nocontact = country === 'CA' || nocontactSFCID.includes(item.SFCID);
    let multiple = false;
    if (prev && prev[field] === current) {
      multiple = true;
    } else if (next && next[field] === current) {
      multiple = true;
    }
    const updatedItem = Object.assign({}, item, {
      multiple,
      nocontact, country,
      SchoolCity: decodeHTMLEntities(item.SchoolCity),
      SFSchoolName: decodeHTMLEntities(current)
    })
    if (nocontact) nocontactArray.push(updatedItem);
    return updatedItem;
  });
  // console.log('nocontactArray', JSON.stringify(nocontactArray, null, 2));
  return newArray;
}

const provinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

const nocontactSFCID = [
  'C01079',
  'CTX060',
  'CNC100',
  'C02754',
  'CAZ031',
  'CAZA13',
  'CCA246',
  'CIN090',
  'CIN100',
  'CINA08',
  'CIN095',
  'CIN105',
  'CPAA11',
  'CPA317',
  'CPA315',
  'CIN120',
  'CINA10',
  'CINA13',
  'CIN125',
  'CIA115',
  'CWIA09',
  'CWIA14',
  'CAZA17',
  'CMI240',
  'CMIA25',
  'CTN180',
  'CMO320',
  'COR105',
  'CAZ090',
  'CAZ092',
  'CIN110',
  'CINA10',
  'CINA13',
  'C02734',
  'CIN230',
  'CIN235',
  'CIN225',
  'CIN225',
  'CAZ105',
  'CAZ110',
  'CAZ115',
  'CAL255',
  'CCA636',
  'C01832',
  'CMO310',
  'CTX645',
  'CWI195',
  'CWI190'
]
