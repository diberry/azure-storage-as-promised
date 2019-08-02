const path = require("path");
require('dotenv').config();

const AzureFiles = require("../src/index").File;

describe('AzureFiles', () => {

    it('should manage file', async (done) => {

        try {
            jest.setTimeout(99000);

            const timeStamp = (+new Date).toString();           

            const fileFullPath = path.join(__dirname,"../data/short.txt");
            const fileName = `${timeStamp}_1_short.txt`;
            const fileName2 = `${timeStamp}_2_short.txt`;

            const share = `share-${timeStamp}`;
            const directory = `dir-${timeStamp}`;     
            const baseDirectory = "";

            const optionalContentSettings = {
                contentType: undefined,
                contentEncoding: undefined,
                contentLanguage: undefined
            };

            const optionalMetadata = {
                context: "test"
            };

            const fileAzure = new AzureFiles(process.env.AZURESTORAGECONNECTIONSTRING);

            // create directory which creates share
            const directoryResult = await fileAzure.createDirectory(share, directory, undefined);
            expect(directoryResult).not.toEqual(undefined);

            const shareResult = await fileAzure.doesShareExist(share);
            expect(shareResult.exists).toBe(true);

            // check that directory does exist
            const doesDirectoryExist = await fileAzure.doesDirectoryExist(share, directory);
            expect(doesDirectoryExist).toEqual(true);

            // add file
            const fileResult = await fileAzure.addFile(share, directory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);
            expect(fileResult.lastModified).not.toEqual(undefined);

            // add file 2
            const fileResult2 = await fileAzure.addFile(share, directory, fileName2, fileFullPath, optionalContentSettings, optionalMetadata);
            expect(fileResult2.lastModified).not.toEqual(undefined);

            // get file properties
            const fileProperties = await fileAzure.getFileProperties(share, directory, fileName);
            expect(fileProperties.share).toEqual(share);

            // get file download
            const url = await fileAzure.getFileUrl(share, directory, fileName);     
            expect(url.indexOf("https://")).not.toEqual(-1);
            expect(url.indexOf(share)).not.toEqual(-1);
            expect(url.indexOf(directory)).not.toEqual(-1);
            expect(url.indexOf(fileName)).not.toEqual(-1);
                
            // get base directories
            const directoriesAndFiles = await fileAzure.getDirectoriesAndFiles(share, baseDirectory);
            expect(directoriesAndFiles).not.toBe(undefined);
            expect(directoriesAndFiles.files.length).toBe(0);
            expect(directoriesAndFiles.directories.length).toBe(1);
            expect(directoriesAndFiles.directories[0].name).toEqual(directory);

            // get subdir files
            const subDirectoriesAndFiles = await fileAzure.getDirectoriesAndFiles(share, directoriesAndFiles.directories[0].name);
            expect(subDirectoriesAndFiles).not.toBe(undefined);
            expect(subDirectoriesAndFiles.files.length).toBe(2);
            expect(subDirectoriesAndFiles.directories.length).toBe(0);            

            // delete directory and all files within
            const deleteDirectoryResults = await fileAzure.deleteDirectory(share, directoriesAndFiles.directories[0].name);
            expect(deleteDirectoryResults).toEqual(true);

            // check that directory doesn't exist
            const doesDirectoryExist2 = await fileAzure.doesDirectoryExist(share, directory);
            expect(doesDirectoryExist2).toEqual(false);

            // delete Share
            const deleteShareResult = await fileAzure.deleteShare(share);
            expect(deleteShareResult).toBe(true);

            done();

        } catch(err){
            done(err);
        }

    });           
});  


