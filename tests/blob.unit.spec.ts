import fs = require("fs"); // streams
import { promises as fsPromises } from 'fs'; // promises

import path = require("path");
import streamLength = require("stream-length");
require('dotenv').config();
import { Blob } from "../src/index";

describe('Blob', () => {

    it('should add blob from stream', async (done) => {

        try {
            jest.setTimeout(99000);
            const timeStamp = (+new Date).toString();

            const fileFullPath = path.join(__dirname,"../data/short.txt");
            const stream = fs.createReadStream(fileFullPath);
            const length = await streamLength(stream);

            const container = `container-${timeStamp}`;
            const directory = `directory-${timeStamp}`;     
            const fileName = `${timeStamp}_1_short.txt`;

            const blob = new Blob(process.env.AZURESTORAGECONNECTIONSTRING);

            const results = await blob.addBlobFromStream(container, directory, fileName, stream, length);
            expect(results).not.toBe(undefined);
            done();

        } catch (err) {
            done(err)
        }
    });
    it('should add blob from local file', async (done) => {

        try {
            jest.setTimeout(99000);
            const timeStamp = (+new Date).toString();

            const fileFullPath = path.join(__dirname,"../data/short.txt");

            const fileText = await fsPromises.readFile(fileFullPath, "utf-8");

            const container = `container-${timeStamp}`;
            const directory = `directory-${timeStamp}`;     
            const fileName = `${timeStamp}_1_short.txt`;

            const blob = new Blob(process.env.AZURESTORAGECONNECTIONSTRING);

            // add blob
            const results:any = await blob.addBlobFromLocalFile(container, directory, fileName, fileFullPath);
            expect(results.lastModified).not.toBe(undefined);

            // get blob properties
            const properties:any = await blob.getBlobProperties(container, directory, fileName);
            expect(properties.lastModified).not.toBe(undefined);
            
            // get text from blob
            const textOnly:any = await blob.getTextFromBlob(container, directory, fileName);
            expect(textOnly).toEqual(fileText);

            done();

        } catch (err) {
            done(err)
        }
    });    
});