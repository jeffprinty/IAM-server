const findSFCIDbySchool = str => {
  // const found = institutions.findObject({'SFSchoolName': str});
  const found = institutions.chain()
    .find({ 'SFSchoolName' : { '$regex': [str, 'i'] } })
    .data();
  if (found.length > 0) {
    return found;
  } else {
    console.log(`${str} SFCID not found`);
    return null;
  }
}
const nocontact = [
  'American Public',
  'Baylor University',
  'CALCASIEU',
  'Central Piedmont',
  'Chandler Gilbert',
  'Estrella Mountain',
  'GateWay',
  'Glendale',
  'Indiana University',
  'Iowa State University',
  'Madison',
  'Maricopa',
  'Mesa College',
  'Michigan State University',
  'Middle Tennessee',
  'Missouri University of Science and Technology',
  'Minnesota State',
  'Oregon State',
  'Paradise Valley',
  'Penn State',
  'Phoenix College',
  'Purdue',
  'Rio Salado College',
  'Scottsdale',
  'South Mountain',
  'University of Alabama',
  'University of California - Irvine',
  'University of Colorado',
  'University of Tennessee, Knoxville',
  'University of Missouri',
  'University of Texas at Dallas',
  'Univ of Wisconsin - Madison',
  'Univ of Wisconsin - La Crosse',
  'Governors',
  'Fairfax',
]
let foundArray = nocontact.map((school) => {
  return findSFCIDbySchool(school);
})
const jsonData = JSON.stringify(foundArray, null, 2);
const fs = require('fs');

fs.writeFile("./nocontact.json", jsonData, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 
