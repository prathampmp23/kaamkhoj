const axios = require('axios');

const jobsData = [
  {"jobName":"Driver","jobDescription":"Company ke liye gaadi chalana","availability":"Day","minAge":21,"skillsRequired":["Driving License"],"experience":"1+ saal driving experience"},
  {"jobName":"Office Boy","jobDescription":"Office safai aur chai-pani ka kaam","availability":"Day","minAge":18,"skillsRequired":[],"experience":"No experience required"},
  {"jobName":"Maid","jobDescription":"Ghar ki safai aur basic ghar ka kaam","availability":"Full-time","minAge":18,"skillsRequired":["Safai ka experience"],"experience":"No experience required"},
  {"jobName":"Watchman","jobDescription":"Building ya office ki security","availability":"Night","minAge":21,"skillsRequired":["Alertness"],"experience":"Security ka experience preferred"},
  {"jobName":"Telecaller","jobDescription":"Phone pe customers se baat karna","availability":"Day","minAge":18,"skillsRequired":["Communication skills","Basic Hindi/English"],"experience":"No experience required"},
  {"jobName":"Delivery Boy","jobDescription":"Parcel aur khana deliver karna","availability":"Day","minAge":18,"skillsRequired":["Bike & Driving License"],"experience":"No experience required"},
  {"jobName":"Peon","jobDescription":"Office ke chhote mote kaam","availability":"Day","minAge":18,"skillsRequired":[],"experience":"No experience required"},
  {"jobName":"Cleaner","jobDescription":"Office aur ghar ki safai","availability":"Day","minAge":18,"skillsRequired":["Cleaning skills"],"experience":"No experience required"},
  {"jobName":"Gardener (Maali)","jobDescription":"Bagiche ka dhyaan rakhna","availability":"Day","minAge":18,"skillsRequired":["Gardening"],"experience":"No experience required"},
  {"jobName":"Housekeeping Staff","jobDescription":"Hotel ya office me safai aur saaf-suthra rakhna","availability":"Full-time","minAge":18,"skillsRequired":["Cleaning skills"],"experience":"No experience required"},
  {"jobName":"Construction Helper","jobDescription":"Mistri ko madad karna","availability":"Full-time","minAge":20,"skillsRequired":["Basic labour work"],"experience":"No experience required"},
  {"jobName":"Waiter","jobDescription":"Restaurant me khana serve karna","availability":"Day","minAge":18,"skillsRequired":["Politeness"],"experience":"No experience required"},
  {"jobName":"Cook Helper","jobDescription":"Bawarchi ko kitchen me help karna","availability":"Full-time","minAge":18,"skillsRequired":["Basic cooking knowledge"],"experience":"No experience required"},
  {"jobName":"Loader","jobDescription":"Truck ya godown me saman uthana","availability":"Day","minAge":20,"skillsRequired":["Strength"],"experience":"No experience required"},
  {"jobName":"Warehouse Worker","jobDescription":"Godown me saman rakhna aur arrange karna","availability":"Day","minAge":18,"skillsRequired":[],"experience":"No experience required"},
  {"jobName":"Electrician Helper","jobDescription":"Electrician ko wiring aur fitting me madad karna","availability":"Day","minAge":20,"skillsRequired":["Basic electrical knowledge"],"experience":"No experience required"},
  {"jobName":"Plumber Helper","jobDescription":"Plumber ko kaam me madad karna","availability":"Day","minAge":20,"skillsRequired":["Basic plumbing knowledge"],"experience":"No experience required"},
  {"jobName":"Car Washer","jobDescription":"Gadi dhona aur saaf karna","availability":"Day","minAge":18,"skillsRequired":["Cleaning"],"experience":"No experience required"},
  {"jobName":"AC Technician Helper","jobDescription":"AC repair me technician ko help karna","availability":"Day","minAge":20,"skillsRequired":["Basic AC knowledge"],"experience":"No experience required"},
  {"jobName":"Painter Helper","jobDescription":"Painter ko ghar ya building paint karne me help karna","availability":"Day","minAge":20,"skillsRequired":["Painting"],"experience":"No experience required"},
  {"jobName":"Liftman","jobDescription":"Building me lift chalana","availability":"Full-time","minAge":21,"skillsRequired":["Basic communication"],"experience":"No experience required"},
  {"jobName":"Pantry Boy","jobDescription":"Office pantry me chai-pani aur snacks dena","availability":"Day","minAge":18,"skillsRequired":[],"experience":"No experience required"},
  {"jobName":"Dishwasher","jobDescription":"Hotel ya ghar me bartan dhona","availability":"Full-time","minAge":18,"skillsRequired":["Cleaning"],"experience":"No experience required"},
  {"jobName":"Laundry Worker","jobDescription":"Kapde dhona aur press karna","availability":"Full-time","minAge":18,"skillsRequired":["Cleaning","Ironing"],"experience":"No experience required"},
  {"jobName":"Security Guard","jobDescription":"Building ya shop ki suraksha","availability":"Night","minAge":21,"skillsRequired":["Alertness"],"experience":"1+ saal preferred"},
  {"jobName":"Helper Boy","jobDescription":"Dukaan ya shop me help karna","availability":"Day","minAge":18,"skillsRequired":[],"experience":"No experience required"},
  {"jobName":"Tea Maker","jobDescription":"Chai banana aur serve karna","availability":"Day","minAge":18,"skillsRequired":["Chai banani aani chahiye"],"experience":"No experience required"},
  {"jobName":"Office Assistant","jobDescription":"Basic office work like files arrange karna","availability":"Day","minAge":18,"skillsRequired":["Basic reading/writing"],"experience":"No experience required"},
  {"jobName":"Pet Caretaker","jobDescription":"Dogs/cats ka khayal rakhna","availability":"Day","minAge":18,"skillsRequired":["Animal care"],"experience":"No experience required"},
  {"jobName":"Sweeper (Jhadu wala)","jobDescription":"Office ya ghar me jhadu pocha karna","availability":"Day","minAge":18,"skillsRequired":["Cleaning"],"experience":"No experience required"}
];

// Function to populate jobs
const populateJobs = async () => {
  try {
    const response = await axios.post('http://localhost:5000/populateJobs', jobsData);
    console.log('Jobs populated successfully:', response.data);
  } catch (error) {
    console.error('Error populating jobs:', error.message);
  }
};

// Run the function
populateJobs();
