// Script to generate 5000 mock patients for performance testing
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Mary',
  'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Patricia', 'Thomas', 'Barbara', 'Charles', 'Susan',
  'Christopher', 'Jessica', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Helen',
  'Donald', 'Sandra', 'Steven', 'Donna', 'Paul', 'Carol', 'Andrew', 'Ruth', 'Joshua', 'Sharon',
  'Kenneth', 'Michelle', 'Kevin', 'Laura', 'Brian', 'Sarah', 'George', 'Kimberly', 'Edward', 'Deborah',
  'Ronald', 'Dorothy', 'Timothy', 'Lisa', 'Jason', 'Nancy', 'Jeffrey', 'Betty', 'Ryan', 'Helen',
  'Jacob', 'Sandra', 'Gary', 'Donna', 'Nicholas', 'Carol', 'Eric', 'Ruth', 'Jonathan', 'Sharon',
  'Stephen', 'Michelle', 'Larry', 'Laura', 'Justin', 'Sarah', 'Scott', 'Kimberly', 'Brandon', 'Deborah',
  'Benjamin', 'Dorothy', 'Samuel', 'Lisa', 'Gregory', 'Nancy', 'Frank', 'Betty', 'Alexander', 'Helen',
  'Raymond', 'Sandra', 'Patrick', 'Donna', 'Jack', 'Carol', 'Dennis', 'Ruth', 'Jerry', 'Sharon'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Washington', 'Rose', 'Hayes', 'Myers',
  'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'Woods', 'Cole', 'West', 'Owen', 'Long'
];

const streets = [
  'Main St', 'Oak Ave', 'Elm St', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'Washington Blvd', 'Park Ave',
  'First St', 'Second Ave', 'Third St', 'Fourth Rd', 'Fifth Dr', 'Sixth Ln', 'Seventh Blvd', 'Eighth Ave',
  'Ninth St', 'Tenth Rd', 'Oak St', 'Pine Ave', 'Maple St', 'Cedar Rd', 'Elm Dr', 'Walnut Ln',
  'Ash Blvd', 'Birch Ave', 'Cherry St', 'Dogwood Rd', 'Elderberry Dr', 'Fir Ln', 'Ginkgo Blvd', 'Hickory Ave',
  'Ivy St', 'Juniper Rd', 'Keyaki Dr', 'Linden Ln', 'Magnolia Blvd', 'Oak Ave', 'Pine St', 'Redwood Rd',
  'Spruce Dr', 'Sycamore Ln', 'Willow Blvd', 'Zelkova Ave', 'Beech St', 'Chestnut Rd', 'Cottonwood Dr', 'Dawn Ln',
  'Elder Blvd', 'Fern Ave', 'Grove St', 'Hazel Rd', 'Ironwood Dr', 'Juniper Ln', 'Katydid Blvd', 'Linden Ave'
];

const cities = [
  'Springfield', 'Riverside', 'Franklin', 'Georgetown', 'Madison', 'Salem', 'Fairview', 'Washington',
  'Lincoln', 'Jacksonville', 'Austin', 'Lexington', 'Dayton', 'Clayton', 'Hudson', 'Burlington', 'Manchester',
  'Oxford', 'Ashland', 'Milton', 'Newport', 'Huntington', 'Cedar Rapids', 'Troy', 'Cambridge', 'Auburn',
  'Decatur', 'Dover', 'Gainesville', 'Canton', 'Rochester', 'Trenton', 'Lancaster', 'Summit', 'Bellevue'
];

const states = [
  'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA',
  'TN', 'IN', 'MO', 'MD', 'WI', 'CO', 'MN', 'SC', 'AL', 'LA', 'KY', 'OR', 'OK', 'CT', 'UT', 'IA',
  'NV', 'AR', 'MS', 'KS', 'NM', 'NE', 'ID', 'WV', 'HI', 'NH', 'ME', 'MT', 'RI', 'DE', 'SD', 'ND', 'AK', 'VT', 'WY'
];

const diagnoses = [
  'Hypertension', 'Type 2 Diabetes', 'Asthma', 'Arthritis', 'Depression', 'Anxiety', 'Migraine',
  'Allergic Rhinitis', 'Gastroesophageal Reflux', 'Hypothyroidism', 'Hyperlipidemia', 'Chronic Pain',
  'Insomnia', 'Seasonal Allergies', 'Acid Reflux', 'High Blood Pressure', 'Back Pain', 'Headache',
  'Cough', 'Fever', 'Fatigue', 'Weight Loss', 'Chest Pain', 'Shortness of Breath', 'Dizziness',
  'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal Pain', 'Joint Pain', 'Muscle Pain'
];

function generateMockPatients(count) {
  const patients = [];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zipCode = Math.floor(Math.random() * 90000) + 10000;
    const age = Math.floor(Math.random() * 80) + 18;
    const phoneArea = Math.floor(Math.random() * 900) + 100;
    const phoneExchange = Math.floor(Math.random() * 900) + 100;
    const phoneNumber = Math.floor(Math.random() * 9000) + 1000;
    const diagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

    const patient = {
      id: i,
      record_number: `PAT${String(i).padStart(6, '0')}`,
      name: `${firstName} ${lastName}`,
      age: age,
      address: `${streetNumber} ${street}, ${city}, ${state} ${zipCode}`,
      phone_number: `(${phoneArea}) ${phoneExchange}-${phoneNumber}`,
      initial_diagnosis: diagnosis,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString()
    };

    patients.push(patient);
  }

  return patients;
}

// Generate 5000 mock patients
console.log('Generating 5000 mock patients...');
const mockPatients = generateMockPatients(5000);
console.log('Mock patients generated successfully!');

// Save to localStorage for testing
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('patients', JSON.stringify(mockPatients));
  console.log('Mock patients saved to localStorage!');
} else {
  console.log('Mock patients array:', mockPatients);
}