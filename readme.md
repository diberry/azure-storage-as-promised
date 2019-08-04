A promise wrapper for Azure Storage.


You can read about [Azure Storage](https://docs.microsoft.com/azure/storage/).

## Includes

* Files 
* Blobs
* Queues

## Prerequisites

* Azure subscription
* Azure Storage resource and its connection string, found on the Keys page of the resource in the [Azure portal](https://portal.azure.com).

## Dependencies

* [azure-storage](https://www.npmjs.com/package/azure-storage)

## Install via NPM

```
npm install azure-storage-as-promised
```

## Usage

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