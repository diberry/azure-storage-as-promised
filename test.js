require('dotenv').config();
const BlobStorage = require('./build/index').Blob;
const myblob = new BlobStorage(process.env.AZURESTORAGECONNECTIONSTRING);

const container="mycontainer";
const directory=""; // root dir is empty string
const blob="short.txt";

myblob.getBlobProperties(container, directory, blob).then(results=>{
    console.log(JSON.stringify(results));
}).catch(err=>{
    console.log(err);
})

