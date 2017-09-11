import { cleanList } from './fixJSON';
var fs = require('fs'),
    xml2js = require('xml2js');
 
var parser = new xml2js.Parser();
fs.readFile(__dirname + '/db.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
      const { ArrayOfSchoolNameList } = result;
      const { SchoolNameList } = ArrayOfSchoolNameList;
      // SchoolNameList.forEach((school) => console.log(school));
      let newSchoolList = SchoolNameList.map((obj,i) => {
        let newObj = {}
        Object.keys(obj).forEach((key) => {
          newObj[key] = obj[key].toString();
        })
        return newObj;
      });
      const clean = cleanList(newSchoolList, 'SFSchoolName');
      const json = JSON.stringify({
        ArrayOfSchoolNameList: {
          SchoolNameList: clean
        }
      },null,2);
      fs.writeFile('./db.json', json, function (err) {
        if (err) return console.log(err);
        console.log('writing to file');
      });
        console.log('Done');
    });
});
