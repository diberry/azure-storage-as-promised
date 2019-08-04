import path = require("path");
require('dotenv').config();

import { File, Blob } from "../src/index";

describe('File', () => {

    it('should copy file to blob', async (done) => {

        try {
            jest.setTimeout(99000);

            const timeStamp = (+new Date).toString();           

            const fileFullPath = path.join(__dirname,"../data/short.txt");
            const fileName = `${timeStamp}_1_short.txt`;

            const share = `share-${timeStamp}`;
            const directory = `dir-${timeStamp}`;     

            const optionalContentSettings = {
                contentType: undefined,
                contentEncoding: undefined,
                contentLanguage: undefined
            };

            const optionalMetadata = {
                context: "test"
            };

            const fileAzure = new File(process.env.AZURESTORAGECONNECTIONSTRING);
            const blobAzure = new Blob(process.env.AZURESTORAGECONNECTIONSTRING);

            // create directory which creates share
            const directoryResult = await fileAzure.createDirectory(share, directory, undefined);
            expect(directoryResult).toHaveProperty('lastModified');

            const shareResult:any = await fileAzure.doesShareExist(share);
            expect(shareResult.exists).toBe(true);

            // check that directory does exist
            const doesDirectoryExist = await fileAzure.doesDirectoryExist(share, directory);
            expect(doesDirectoryExist).toEqual(true);

            // add file
            const fileResult:any = await fileAzure.addFile(share, directory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);
            expect(fileResult.lastModified).not.toBe(undefined);

            // get file's access token
            const accessToken:any = await fileAzure.getAccessToken(share, directory, fileName);
            expect(accessToken.indexOf("st=")).not.toBe(-1);

            // get file's URI
            const fileUri:any = await fileAzure.getFileUrl(share, directory, fileName);
            expect(fileUri.indexOf("http")).not.toBe(-1);

            // copy file to blob using access token
            // Blob's container == File's share
            const blobResults = await blobAzure.copyFileToBlobAsync(fileUri, share, directory, fileName);
            expect(blobResults).toHaveProperty('lastModified');

            // get properties of new blob
            const properties = await blobAzure.getBlobProperties(share, directory, fileName);
            expect(properties).toHaveProperty('lastModified');

            done();

        } catch (err) {
            done(err)
        }
    });    
});        