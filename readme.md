A promise wrapper for Azure Storage. [Github repo](https://github.com/diberry/azure-storage-as-promised)


You can read about [Azure Storage](https://docs.microsoft.com/azure/storage/).

## Includes

* Files 
* Blobs
* Queues

### Opinions

If the outermost storage inside the resource, such as a share or container, doesn't exist, it is created as part of the request. 

### Notes

For Blob storage, the base directory is known as an empty string. 

## Prerequisites

* Azure subscription
* Azure Storage resource and its connection string, found on the Keys page of the resource in the [Azure portal](https://portal.azure.com).

## Dependencies

* [azure-storage](https://www.npmjs.com/package/azure-storage)

## Install via NPM

```
npm install azure-storage-as-promised
```

## Usage in tests

The tests include usage of objects. 

## Usage wit Blob in Javascript

```javascript
require('dotenv').config();
const BlobStorage = require("azure-storage-as-promised").Blob;
const myblob = new BlobStorage(process.env.AZURESTORAGECONNECTIONSTRING);

const container="function-blob-upload";
const directory=""; // root dir is empty string
const blob="short.txt";

myblob.getBlobProperties(container, directory, blob).then(results=>{
    console.log(JSON.stringify(results));
}).catch(err=>{
    console.log(err);
})
```

## Usage with File in typescript

```javascript

// import classes in package
import { File } from 'azure-storage-as-promised';

// set connection string
const fileAzure = new File(process.env.AZURESTORAGECONNECTIONSTRING);

// create directory which creates share
const directoryResult = await fileAzure.createDirectory(share, directory, undefined);

// check that share does exist
const shareResult:any = await fileAzure.doesShareExist(share);

// check that directory does exist
const doesDirectoryExist = await fileAzure.doesDirectoryExist(share, directory);

// add file
const fileResult:any = await fileAzure.addFile(share, directory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);

// get file properties
const fileProperties:any = await fileAzure.getFileProperties(share, directory, fileName);

// get file download
const url:any = await fileAzure.getFileUrl(share, directory, fileName);

// get base directories, empty string is base directory
const directoriesAndFiles:any = await fileAzure.getDirectoriesAndFiles(share, "");

// get subdir files
const subDirectoriesAndFiles:any = await fileAzure.getDirectoriesAndFiles(share, directoriesAndFiles.directories[0].name);

// delete directory and all files within
const deleteDirectoryResults:any = await fileAzure.deleteDirectory(share, directoriesAndFiles.directories[0].name);

// check that directory doesn't exist
const doesDirectoryExist2:any = await fileAzure.doesDirectoryExist(share, directory);

// delete Share
const deleteShareResult:any = await fileAzure.deleteShare(share);
```

## Run tests

```
npm run test
```