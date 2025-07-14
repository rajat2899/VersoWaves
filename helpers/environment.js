const environments = {
  RBF: 'https://rbf-cargocare.wavestesting.com/',
  CCG: 'https://cargocare-global.wavestesting.com/',
  Burhill: 'https://burhilllogistics.wavestesting.com/',
  B2L: 'https://b2l-cargocare.wavestesting.com/',
  UAE: 'https://uae-cargocare.wavestesting.com/',
  Schallenberg: 'https://schallenberg.wavestesting.com/',
  CustomsCareBV: 'https://customs-care.wavestesting.com/',
  FITCargocare: 'https://fit-cargocare.wavestesting.com/',
  SailLine: 'https://sail-line.wavestesting.com/',
  Intranet: 'https://intranet.wavestesting.com/intranet.html',
  GastonSchul: 'https://gastonschul.wavestesting.com/',
};

function getBaseURL() {
  const env = process.env.TEST_ENV || 'RBF'; // Default to RBF
  return environments[env];
}
      
module.exports = { getBaseURL };
