require('dotenv').config();
const BlobStorage = require('./build/index').Blob;
const myblob = new BlobStorage(process.env.AZURESTORAGECONNECTIONSTRING);

const container="mycontainer";
const directory=""; // root dir is empty string
const blob="short.txt";

const finalBlob = directory + "/" + blob;

myblob.getBlobProperties(container, finalBlob).then(results=>{
    console.log(JSON.stringify(results));
}).catch(err=>{
    console.log(err);
})

