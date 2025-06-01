import bcrypt from 'bcrypt'

const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';


let hash1
let hash2 ="$2b$10$5Pa1AhqofFKx3aE8j.rWnukOZzSXaevigAscmdqrbTnHAul3V8GTm"
bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
        hash1 =hash
    });
});

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
    hash2=hash
});

bcrypt.compare(myPlaintextPassword, hash2, function(err, result) {
    console.log(result)
});