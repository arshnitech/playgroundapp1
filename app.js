const express = require('express');

const alert = require('alert');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 4000;
const axios = require('axios');
const db = require('./db');
const { PublicClientApplication } = require('@azure/msal-node');
const { msal } = require('@azure/msal-node');
const { ConfidentialClientApplication } = require('@azure/msal-node');
var user={};
require('dotenv').config();
const jwt = require('jsonwebtoken');

const yargs = require('yargs');

const fetch = require('./azureauth/fetch');
const auth = require('./azureauth/auth');
const awslogin = require('./azureauth/awslogin');
//const options = yargs
  //  .usage('Usage: --op <operation_name>')
   // .option('op', { alias: 'operation', describe: 'operation name', type: 'string', demandOption: true })
   // .argv;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Azure authentication

/*const config = {
  auth: {
    clientId: '034dc914-47ac-4a86-9ab8-36bf6de2712b', // Your Azure AD Application Client ID
    authority: 'https://login.microsoftonline.com/4ea7b175-bdf9-4493-bbb8-8a47c530676c', // Your Azure AD Tenant ID
    //knownAuthorities: 'https://login.microsoftonline.com/4ea7b175-bdf9-4493-bbb8-8a47c530676c',
    clientSecret: 'T~98Q~kNce1IflfEbh-kaG5MewU5ucwgdfABvbfv'
  }
};*/

//const pca = new PublicClientApplication(config);
//const pca = new ConfidentialClientApplication(config);



//Secret Key

app.use(session({
    secret: '@qsErt$ruyio',
    resave: false,
    saveUninitialized: true
  }));

// Login Page
app.get('/', (req, res) => {
  res.render('login');

});

// Generate a random password with 4 alphabets and 4 numbers
function generateRandomPassword() {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialSymbols = '!@#$%^&*';

  let password = ''; 

  // Generate at least 1 lowercase letter
  password += lowercaseLetters[Math.floor(Math.random() * lowercaseLetters.length)];

  // Generate at least 1 uppercase letter
  password += uppercaseLetters[Math.floor(Math.random() * uppercaseLetters.length)];

  // Generate at least 1 special symbol
  password += specialSymbols[Math.floor(Math.random() * specialSymbols.length)];

  // Generate remaining characters to reach a total length of 8
  for (let i = 0; i < 5; i++) {
    const randomChar = Math.floor(Math.random() * numbers.length);
    password += numbers[randomChar];
  }

  // Shuffle the password characters to ensure randomness
  password = password.split('').sort(() => Math.random() - 0.5).join('');

  return password;
}



// Home Page
app.post('/home', (req, res) => {
     console.log("Enter post /home method");
     res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
     res.setHeader('Pragma', 'no-cache');
     res.setHeader('Expires', '0');
     // Check if the user is authenticated
  // You can implement authentication logic here
  // For simplicity, we'll assume the user is authenticated
  // and pass user data to the home page.
  const user_email = req.body.user_email;
  const user_pass = req.body.user_pass;

    console.log("Entered sql query block" + user_email + "  " +user_pass);
  var sqlQuery = `SELECT * FROM users WHERE user_email = ? AND user_pass = ?`;
  //var sqlQuery = `SELECT * FROM users WHERE user_email = ? AND user_pass = MD5(?)`;
  var values = [user_email,user_pass];
  
 //req.session.email=req.body.email;
 //req.session.cname=req.body.cname;
 //req.session.cpwd=req.body.cpwd;
 
  db.query(sqlQuery, values, function (err, results, fields) {
  
    if (results.length == 1) {

      req.session.user = {
        user_comname: 'Arshniv Labs',
        user_email:results[0].user_email,
        user_fname: results[0].user_fname,
        user_curl: results[0].user_curl,
        user_cloudusername: results[0].user_cloudusername ,
        user_cloudpass: results[0].user_cloudpass,
      };
req.session.user.user_cloudpass=generateRandomPassword();
      console.log('session values are' + JSON.stringify(req.session.user));
      //db.end();
      res.render('home', { user: req.session.user  });
      return;
    } else {
    alert('The username or password is incorrect.');
    res.render('login');
    }
  
  });

});


app.post('/logout',(req, res) => {
    // Clear the session and redirect to the login page
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session: ' + err);
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.redirect('/');
    });
  });
// Update Password Button Logic
/*app.post('/updatePassword', async(req, res) => {

try {
  const accessToken = await auth.getToken();
  console.log("Access token retrieved:", accessToken);

  // Proceed with any further operations using the access token

  //res.status(200).send("Token updated successfully.");
  const usersResponse =  await fetch.callApi(auth.apiConfig.uri,accessToken,req.session.user.user_cloudusername);
  const users=usersResponse.value;
  console.log("Type of 'users':", typeof users);
  console.log("Content of 'users':", users);
  // display result
  if(users)
    {
    if (req.session.user && req.session.user.user_cloudusername) {
      const userCloudUsername = req.session.user.user_cloudusername;
      const userCloudPassword=req.session.user.user_cloudpass;
      console.log('User Cloud Username from session:', userCloudUsername);
      console.log('User Cloud password from session:', userCloudPassword);
  
      // Rest of your logic using userCloudUsername...
    
    
    //console.log('request session object is' + user.user_cloudusername);
    const userPrincipalNames = users.map(user => user.userPrincipalName);
     // Filter specific userPrincipalNames (example: filtering those that contain '@ravinsofttech.com')
     //console.log(user.user_cloudusername);
     const specificUserPrincipalNames = userPrincipalNames.filter(name => name.includes(userCloudUsername));
     console.log("Specific User Principal Names:", specificUserPrincipalNames);
     console.log("Specific User ID is:", specificUserPrincipalNames.value.id);
     if(specificUserPrincipalNames)
     {
      
     //const passwordResponse =  await fetch.updateAzurePasswordApi(`https://graph.microsoft.com/v1.0/users/${specificUserPrincipalNames}`,userCloudPassword ,accessToken);
    
     const payload = {
      passwordProfile: {
        password: userCloudPassword,
        forceChangePasswordNextSignIn: true // Set this to true if you want the user to change the password at next sign-in
      }
    };

    const accessToken1 = await auth.getToken();
    const token = accessToken1; // Replace with your actual access token

    const decodedToken = jwt.decode(token);
    console.log(decodedToken);
                
    if (decodedToken && decodedToken.exp) {
      const expiryTimestamp = decodedToken.exp;
      const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
  
      const expiresIn = expiryTimestamp - currentTimestamp;
      console.log('Token expires in:', expiresIn, 'seconds');
    } else {
      console.log('Invalid token or expiry not found.');
    }     
            

    const headers = {
      Authorization: `Bearer ${accessToken1}`, // Use backticks (`) for string interpolation
      'Content-Type': 'application/json'
    };
    
  
   //console.log("Endpoint is " + endpoint);
   //console.log("Access token  " + accesstoken); 
   
   //const endpoint= 'https://graph.microsoft.com/v1.0/users/${specificUserPrincipalNames}';
  // const endpoint= 'https://graph.microsoft.com/v1.0/users/testuser@ravinsofttech.com';
  // console.log('endpoint is :' + endpoint)
   console.log('accessToken is ------------   ' +accessToken1)
   try {
      const response = await axios.patch(auth.apiConfig.uri+req.session.user.user_cloudusername, payload, {headers});

  
      if (response.status === 204) {
        console.log(`Password updated successfully for user ${username}`);
        return true;
      } else {
        console.error(`Failed to update password for user ${username}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating password:', error.response.data);
      console.error('Response status:', error.response.status);
      return false;
    }
    
    }

        }      //  res.status(200).json({ userPrincipalNames });
      }       

  } catch (error) {
  console.error("Error updating token:", error);
  res.status(500).send("Error updating token.");
}


}); */

app.post('/updatePassword', async(req, res) => {

  if(req.session.user_curl=="https://portal.azure.com")
{
  try {
    const accessToken = await auth.getToken();
    console.log("Access token retrieved:", accessToken);
  //fetching Azure AD user list
  const usersResponse =  await fetch.callApi(auth.apiConfig.uri,accessToken);
  const users=usersResponse.value;
  console.log("Type of 'users':", typeof users);
  console.log("Content of 'users':", users);

        if (Array.isArray(users)) {
          const userCloudUsername = req.session.user.user_cloudusername;
          const userCloudPassword=req.session.user.user_cloudpass;
          console.log('User Cloud Username from session:', userCloudUsername);

          // Filter specific userPrincipalNames based on userCloudUsername
          const specificUserPrincipalNames = users
            .filter(user => user.userPrincipalName.includes(userCloudUsername))
            .map(user => {
              return {
                userPrincipalName: user.userPrincipalName,
                id: user.id
              };
            });

          console.log("Specific User Principal Names:", specificUserPrincipalNames);
          const userIDs = specificUserPrincipalNames.map(user => user.id);
          console.log("User IDs:", userIDs);
          //password values set
          const payload = {
            passwordProfile: {
              password: userCloudPassword,
              forceChangePasswordNextSignIn: true // Set this to true if you want the user to change the password at next sign-in
            }
          };

          const headers = {
            'Authorization': `Bearer ${accessToken}`, // Use backticks (`) for string interpolation
            'Content-Type': 'application/json'
          };
          console.log('Token received is ' + accessToken)
          console.log('Graph AI URI : ' + auth.apiConfig.uri+userIDs)
          try {
            const response = await axios.patch(auth.apiConfig.uri+userIDs, payload, {headers});

        
            if (response.status === 204) {
              console.log(`Password updated successfully for user ${username}`);
              return true;
            } else {
              console.error(`Failed to update password for user ${username}`);
              return false;
            }
          } catch (error) {
            console.error('Error updating password:', error.response.data);
            console.error('Response status:', error.response.status);
            return false;
          }
          // Continue with your logic using specificUserPrincipalNames...
        } 
        else {
          console.log("Users data is not an array or is empty.");
        }
        } catch (error) {
          console.error("Error updating token:", error);
          res.status(500).send("Error updating token.");
        }
 
}
else{

  console.log("Entered else block to call AWS");
  const userCloudUsername = req.session.user.user_cloudusername;
          const userCloudPassword=req.session.user.user_cloudpass;
const updatestatus=awslogin.changeIAMPassword(userCloudUsername,userCloudPassword);
const updateQuery = 'UPDATE users SET user_cloudpass = ? WHERE user_cloudusername = ?';
var values = [userCloudPassword,userCloudUsername,req.session.user.user_email];
          db.query(updateQuery, values, (error, results, fields) => {
            if (error) throw error;
            console.log('Updated user password successfully:', results);
          });
          
         db.end();
if(updatestatus)
{
return true;
}
else
return false;
}

});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

