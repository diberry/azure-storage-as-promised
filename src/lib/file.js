"use strict";

const azure = require('azure-storage');

module.exports = class AzureFiles {
        
    constructor(connectionString){

        this.fileService = new azure.FileService(connectionString);

    }
    async createShare(share, options=undefined){

        let self = this;

        if (!share ) throw Error("File::createShare - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.createShareIfNotExists(share, options, (error, response) => {
                if (error) return reject(error);
                return resolve(response);
            });
        });
    }
    async deleteShare(share, options=undefined){

        let self = this;

        if (!share ) throw Error("File::deleteShare - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.deleteShareIfExists(share, options, (error, response) => {
                if (error) return reject(error);
                self.share = undefined;
                return resolve(response);
            });
        });
    }
    async doesShareExist(share, options){

        if (!share) throw Error("File::doesShareExist - params missing");

        let self = this;

        return new Promise(function(resolve, reject) {
            
            self.fileService.doesShareExist(share, function(error, result) {

                if(error) return reject(error);

                return resolve(result);

            });
        });            
    }
    async getFileProperties(share, directory, filename){

        let self = this;

        if (!share || !directory || !filename ) throw Error("File::getFileProperties - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.getFileProperties(share, directory.toLowerCase(), filename.toLowerCase(), (error, response) => {
                if (error) return reject(error);
                return resolve(response);
            });
        });
    }
    async getFileUrl(share, directory, filename){
    
        let self = this;

        if (!share || !directory || !filename ) throw Error("az-files::Files::getFileUrl - params missing");
    
        return new Promise(function(resolve, reject) {
    
            var startDate = new Date();
            var expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + 5);
            const usePrimaryEndpoint = true;
            const shareSnapshot = undefined;
    
            const sharedAccessPolicy = {
                AccessPolicy: {
                  Permissions: azure.FileUtilities.SharedAccessPermissions.READ,
                  Start: startDate,
                  Expiry: expiryDate
                },
              };
              
            const sasToken = self.fileService.generateSharedAccessSignature(share, directory.toLowerCase(), filename, sharedAccessPolicy);
              
            const url = self.fileService.getUrl(share, directory.toLowerCase(), filename, sasToken, usePrimaryEndpoint, shareSnapshot);
    
            if(!url) reject("File::getFileUrl - url is empty");
            resolve(url);
        });
    }
    
    async addFile(share, directory, filename, fileWithPath, optionalContentSettings={}, optionalMetadata={}){

        let self = this;

        if (!share || !directory || !filename || !fileWithPath) throw Error("File::addFile - params missing");
    
        return new Promise(function(resolve, reject) {
    
            self.fileService.createShareIfNotExists(share, error =>{
                if (error) return reject(error);
    
                self.fileService.createDirectoryIfNotExists(share, directory.toLowerCase(), error => {
                    if (error) return reject(error);
    
                    self.fileService.createFileFromLocalFile(
                        share,
                        directory.toLowerCase(),
                        filename,
                        fileWithPath,
                        { contentSettings: optionalContentSettings, metadata: optionalMetadata},
                        (error, result) => {
    
                        if (error) return reject(error);
                        return resolve(result);
                        
                    });
                });
            });
        });
    }
        
    // Base directory denoted with empty string
    async getDirectoriesAndFiles(share, directory){

        let continuationToken = 1;
        let items = { files: [], directories: []};  
        let result = undefined;

        const azFileOptions = null;

        while(continuationToken){

            result = await this.listDirectoriesAndFiles(share, directory, continuationToken, azFileOptions);

            // files
            items.files.push.apply(items.files, result.entries.files);

            // directories
            items.directories.push.apply(items.directories, result.entries.directories);

            continuationToken = result.continuationToken;
        }
        return items;
    }
    async listDirectoriesAndFiles(share, directory, token, options) {

        if (!token) throw Error("File::listDirectoriesAndFiles - params missing");

        let self = this;
   
        return new Promise(function(resolve, reject) {
    
       
            self.fileService.listFilesAndDirectoriesSegmented(share, directory, token, options, function(error, result) {

                if(error) return reject(error);
                
                return resolve(result);

            });
        });
    }
    async deleteAllFilesInDirectory(share, directory){

        if (!share || !directory) throw Error("File::deleteAllFilesInDirectory - params missing");

        const resultsGetFiles = await this.getDirectoriesAndFiles(share, directory);
    
        const options = undefined;
        let deleteFileResults = [];

        for(let i=0; i<resultsGetFiles.files.length; i++ ){
            const file = resultsGetFiles.files[i];
            let deleteFileResult = await this.deleteFile(share, directory, file.name, options);
            deleteFileResults.push({'name':file.name, 'status': deleteFileResult, 'properties':file});
        }
        return deleteFileResults;

    }
    // deleted later during garbage collection
    async deleteFile(share, directory, file, options){

        if (!directory || !file ) throw Error("File::deleteFile - params missing");

        let self = this;
   
        return new Promise(function(resolve, reject) {
       
            self.fileService.deleteFileIfExists(share, directory, file, options, function(error, result) {

                if(error) return reject(error);
                
                // result: boolean
                return resolve(result);

            });
        });
    }
    // The directory must be empty before it can be deleted.
    async deleteDirectory(share, directory, options){
        if (!share || !directory) throw Error("File::deleteDirectory - params missing");

        let self = this;

        let deleteAllFilesResults = await self.deleteAllFilesInDirectory(share, directory);

        return new Promise(function(resolve, reject) {
    
            self.fileService.deleteDirectoryIfExists(share, directory, options, function(error, result) {

                if(error) return reject(error);
                
                // result: boolean
                return resolve( result );

            });
        });
    }
    async createDirectory(share, directory, options=undefined){

        if (!share || !directory) throw Error("File::createDirectory - params missing");

        let createShareResults = await this.createShare(share);

        let self = this;

        return new Promise(function(resolve, reject) {
    
            self.fileService.createDirectoryIfNotExists(share, directory, options, function(error, result) {

                if(error) return reject(error);
                
                // result: boolean
                return resolve(result);

            });
        });
    }

    async doesDirectoryExist(share, directory, options){

        if (!share || !directory) throw Error("File::doesDirectoryExist - params missing");

        let self = this;

        return new Promise(function(resolve, reject) {
            
            let doesDirectoryExist = self.fileService.doesDirectoryExist(share, directory, function(error, result) {

                if(error) return reject(error);

                // result: boolean
                return resolve(result.exists);

            });
        });            
    }
}
